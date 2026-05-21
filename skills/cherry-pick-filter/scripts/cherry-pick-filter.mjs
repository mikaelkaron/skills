#!/usr/bin/env node

/**
 * cherry-pick-filter
 *
 * Syncs a working branch to a clean target branch by cherry-picking commits
 * that don't touch filtered path prefixes.
 *
 * Usage:
 *   git cherry-pick-filter <target-branch> --filter <prefix> [--filter <prefix>...] [--dry-run]
 *
 * Setup git alias:
 *   git config alias.cherry-pick-filter '!.agents/skills/cherry-pick-filter/cherry-pick-filter.mjs'
 */

import { execSync } from "node:child_process";
import { exit } from "node:process";

// ─── Output ──────────────────────────────────────────────────────────────────
// stdout: picked SHAs only (one full SHA per line) — pipable
// stderr: all human-readable output (headers, analysis, errors, summary)
//
// TTY detection:
//   - stdout is a TTY (interactive, no pipe): SHAs are redundant on stdout
//     since the user sees the `pick` lines on stderr. Suppress stdout so
//     `2>&1 | less` works cleanly without SHA noise.
//   - stdout is piped/redirected: emit SHAs on stdout for machine consumption.

const isTTY = process.stdout.isTTY === true;
const out = (sha) => { if (!isTTY) process.stdout.write(sha + "\n"); };
const log = (...args) => console.error(...args);

// ─── Helpers ────────────────────────────────────────────────────────────────

function exec(cmd) {
	return execSync(cmd, { encoding: "utf8", stdio: "pipe" }).trim();
}

function tryExec(cmd) {
	try {
		return { ok: true, output: exec(cmd) };
	} catch (e) {
		return { ok: false, output: e.stderr ?? e.message ?? "" };
	}
}

function shortSha(sha) {
	return sha.slice(0, 9);
}

function isFiltered(file, filters) {
	return filters.some((f) => file.startsWith(f));
}

function getCommitFiles(sha) {
	return exec(`git diff-tree --no-commit-id -r --name-only ${sha}`)
		.split("\n")
		.filter(Boolean);
}

// ─── Parse args ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

const filters = [];
let targetBranch = null;
let dryRun = false;

for (let i = 0; i < args.length; i++) {
	if (args[i] === "--filter" && args[i + 1]) {
		filters.push(args[++i]);
	} else if (args[i] === "--dry-run") {
		dryRun = true;
	} else if (!args[i].startsWith("--") && targetBranch === null) {
		targetBranch = args[i];
	}
}

const usage = `Usage: git cherry-pick-filter <target-branch> --filter <prefix> [--filter <prefix>...] [--dry-run]

Arguments:
  target-branch     Branch to cherry-pick code commits onto.

Options:
  --filter <prefix> Path prefix to filter out (required, repeatable).
                    Commits where ALL files match a prefix are excluded by git.
                    Commits where SOME files match are treated as mixed (abort).
  --dry-run         Analyse commits without cherry-picking.

Examples:
  git cherry-pick-filter beta --filter .planning/
  git cherry-pick-filter beta --filter .planning/ --filter .agents/
  git cherry-pick-filter beta --filter .planning/ --dry-run`;

if (!targetBranch) {
	log("Error: <target-branch> is required.\n");
	log(usage);
	exit(1);
}

if (filters.length === 0) {
	log("Error: at least one --filter is required.\n");
	log(usage);
	exit(1);
}

// ─── Validate current branch ─────────────────────────────────────────────────

const currentBranch = exec("git rev-parse --abbrev-ref HEAD");

if (currentBranch === targetBranch) {
	log(`Error: already on '${targetBranch}'.`);
	exit(1);
}

// ─── Resolve target branch ───────────────────────────────────────────────────

const localExists = tryExec(
	`git show-ref --verify --quiet refs/heads/${targetBranch}`,
).ok;

if (!localExists) {
	const remoteResult = tryExec(
		`git ls-remote --heads origin ${targetBranch}`,
	);
	if (remoteResult.ok && remoteResult.output.length > 0) {
		log(`Checking out '${targetBranch}' from origin...`);
		const checkoutResult = tryExec(
			`git checkout --track origin/${targetBranch}`,
		);
		if (!checkoutResult.ok) {
			log(`Error: failed to checkout '${targetBranch}' from origin.`);
			log(checkoutResult.output);
			exit(1);
		}
		// Return to the original branch
		exec(`git checkout ${currentBranch}`);
	} else {
		log(`Error: branch '${targetBranch}' not found locally or on origin.`);
		exit(1);
	}
}

// ─── Header ──────────────────────────────────────────────────────────────────

const dryRunLabel = dryRun ? " (dry run)" : "";
log(`\nSyncing ${currentBranch} → ${targetBranch}${dryRunLabel}`);
log(`Filter prefixes: ${filters.join(", ")}\n`);

// ─── Step 1: Get candidates via git pathspec filtering ───────────────────────

const pathspecs = filters.map((f) => `:!${f}`).join(" ");
const logOutput = tryExec(
	`git log ${targetBranch}..HEAD --reverse --format="%H %s" -- ${pathspecs}`,
);

if (!logOutput.ok || !logOutput.output) {
	log("Already up to date.");
	exit(0);
}

const candidates = logOutput.output
	.split("\n")
	.filter(Boolean)
	.map((line) => {
		const sha = line.slice(0, 40);
		const subject = line.slice(41);
		return { sha, subject };
	});

if (candidates.length === 0) {
	log("Already up to date.");
	exit(0);
}

// ─── Step 2: Sanity check ALL candidates before touching anything ─────────────

const mixed = [];

for (const { sha, subject } of candidates) {
	const files = getCommitFiles(sha);
	const filteredFiles = files.filter((f) => isFiltered(f, filters));
	const codeFiles = files.filter((f) => !isFiltered(f, filters));

	if (filteredFiles.length > 0 && codeFiles.length > 0) {
		mixed.push({ sha, subject, filteredFiles, codeFiles });
	}
}

if (mixed.length > 0) {
	log("Mixed commits detected — fix these before syncing:\n");

	for (const { sha, subject, filteredFiles, codeFiles } of mixed) {
		log(`  ${shortSha(sha)} ${subject}`);
		log(`    In filter:`);
		for (const f of filteredFiles) log(`      ${f}`);
		log(`    Outside filter:`);
		for (const f of codeFiles) log(`      ${f}`);
		log();
	}

	const earliestSha = shortSha(mixed[0].sha);
	log(`Split each commit with:`);
	log(`  git rebase -i ${earliestSha}^\n`);
	log(
		`Then re-run: git cherry-pick-filter ${targetBranch} ${filters.map((f) => `--filter ${f}`).join(" ")}`,
	);
	exit(1);
}

// ─── All candidates clean — print analysis ───────────────────────────────────

const verb = dryRun ? "Would pick" : "Ready to pick";
log(`${verb} ${candidates.length} commit${candidates.length === 1 ? "" : "s"}:`);
for (const { sha, subject } of candidates) {
	log(`  ${shortSha(sha)} ${subject}`);
}
log();

if (dryRun) {
	log(`Dry run complete. Run without --dry-run to apply.`);
	exit(0);
}

// ─── Step 3: Cherry-pick all candidates ──────────────────────────────────────

let picked = 0;

for (const { sha, subject } of candidates) {
	const result = tryExec(`git cherry-pick ${sha}`);
	if (result.ok) {
		log(`  pick ${shortSha(sha)} ${subject}`);
		out(sha);
		picked++;
	} else {
		log(`\nCherry-pick failed: ${shortSha(sha)} ${subject}\n`);
		log(`Resolve the conflict then run:`);
		log(`  git cherry-pick --continue`);
		log(`  git cherry-pick --abort   (to cancel)`);
		exit(1);
	}
}

log(`\nDone: ${picked} picked`);
