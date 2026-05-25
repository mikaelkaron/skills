import { Args, Command, Flags } from "@oclif/core";
import {
  checkout,
  cherryPick,
  diffTree,
  log,
  lsRemote,
  revParse,
  showRef,
  tryCheckout,
} from "../lib/git.js";

function out(sha: string): void {
  if (!process.stdout.isTTY) process.stdout.write(sha + "\n");
}

export default class CherryPickFilter extends Command {
  static override summary =
    "Sync a working branch to a clean target branch by cherry-picking commits that don't touch filtered path prefixes.";

  static override description = `Incrementally cherry-picks commits from the current branch onto a target branch, skipping commits where all changed files match filtered path prefixes. Mixed commits (code + filtered files in the same commit) are detected by analyzing all commits first, then reported together, and the operation is halted until the user resolves them.

All human-readable output goes to stderr. stdout emits one picked commit SHA per line — but only when piped (not a TTY).`;

  static override examples = [
    {
      description: "Sync to beta, filtering out .planning/ commits",
      command: "<%= config.bin %> <%= command.id %> beta --filter .planning/",
    },
    {
      description: "Filter multiple path prefixes",
      command:
        "<%= config.bin %> <%= command.id %> beta --filter .planning/ --filter .agents/",
    },
    {
      description: "Dry run: analyse without cherry-picking",
      command:
        "<%= config.bin %> <%= command.id %> beta --filter .planning/ --dry-run",
    },
    {
      description: "Capture picked SHAs",
      command:
        "<%= config.bin %> <%= command.id %> beta --filter .planning/ | xargs git log --oneline",
    },
  ];

  static override args = {
    targetBranch: Args.string({
      description: "Branch to cherry-pick code commits onto",
      required: true,
    }),
  };

  static override flags = {
    filter: Flags.string({
      description:
        "Path prefix to filter out. Commits where ALL files match are skipped; commits where SOME files match are aborted as mixed.",
      multiple: true,
      required: true,
    }),
    "dry-run": Flags.boolean({
      description: "Analyse commits without cherry-picking",
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CherryPickFilter);
    const { targetBranch } = args;
    const filters = flags.filter;
    const dryRun = flags["dry-run"];

    const currentBranch = revParse(["--abbrev-ref", "HEAD"]);

    if (currentBranch === targetBranch) {
      this.error(`already on '${targetBranch}'.`, { exit: 1 });
    }

    const localExists = showRef([
      "--verify",
      "--quiet",
      `refs/heads/${targetBranch}`,
    ]).ok;

    if (!localExists) {
      const remoteResult = lsRemote(["--heads", "origin", targetBranch]);
      if (remoteResult.ok && remoteResult.output.length > 0) {
        this.logToStderr(`Checking out '${targetBranch}' from origin...`);
        const checkoutResult = tryCheckout([
          "--track",
          `origin/${targetBranch}`,
        ]);
        if (!checkoutResult.ok) {
          this.logToStderr(checkoutResult.output);
          this.error(`failed to checkout '${targetBranch}' from origin.`, {
            exit: 1,
          });
        }
        checkout([currentBranch]);
      } else {
        this.error(`branch '${targetBranch}' not found locally or on origin.`, {
          exit: 1,
        });
      }
    }

    const dryRunLabel = dryRun ? " (dry run)" : "";
    this.logToStderr(
      `\nSyncing ${currentBranch} → ${targetBranch}${dryRunLabel}`,
    );
    this.logToStderr(`Filter prefixes: ${filters.join(", ")}\n`);

    const pathspecs = filters.map((f: string) => `:!${f}`);
    const logOutput = log([
      `${targetBranch}..HEAD`,
      "--reverse",
      "--format=%H %s",
      "--",
      ...pathspecs,
    ]);

    if (!logOutput.ok || !logOutput.output) {
      this.logToStderr("Already up to date.");
      return;
    }

    const candidates = logOutput.output
      .split("\n")
      .filter(Boolean)
      .map((line: string) => ({
        sha: line.slice(0, 40),
        subject: line.slice(41),
      }));

    if (candidates.length === 0) {
      this.logToStderr("Already up to date.");
      return;
    }

    const mixed: Array<{
      sha: string;
      subject: string;
      filteredFiles: string[];
      codeFiles: string[];
    }> = [];

    for (const { sha, subject } of candidates) {
      const files = diffTree(["--no-commit-id", "-r", "--name-only", sha])
        .split("\n")
        .filter(Boolean);
      const filteredFiles = files.filter((f: string) =>
        filters.some((prefix: string) => f.startsWith(prefix)),
      );
      const codeFiles = files.filter(
        (f: string) => !filters.some((prefix: string) => f.startsWith(prefix)),
      );
      if (filteredFiles.length > 0 && codeFiles.length > 0) {
        mixed.push({ sha, subject, filteredFiles, codeFiles });
      }
    }

    if (mixed.length > 0) {
      this.logToStderr("Mixed commits detected — fix these before syncing:\n");
      for (const { sha, subject, filteredFiles, codeFiles } of mixed) {
        this.logToStderr(`  ${sha.slice(0, 9)} ${subject}`);
        this.logToStderr(`    In filter:`);
        for (const f of filteredFiles) this.logToStderr(`      ${f}`);
        this.logToStderr(`    Outside filter:`);
        for (const f of codeFiles) this.logToStderr(`      ${f}`);
        this.logToStderr("");
      }
      this.logToStderr(`Split each commit with:`);
      this.logToStderr(`  git rebase -i ${mixed[0].sha.slice(0, 9)}^\n`);
      this.logToStderr(
        `Then re-run: git cherry-pick-filter ${targetBranch} ${filters.map((f: string) => `--filter ${f}`).join(" ")}`,
      );
      this.error(
        `${mixed.length} mixed commit(s) detected — split before syncing.`,
        { exit: 1 },
      );
    }

    const verb = dryRun ? "Would pick" : "Ready to pick";
    this.logToStderr(
      `${verb} ${candidates.length} commit${candidates.length === 1 ? "" : "s"}:`,
    );
    for (const { sha, subject } of candidates) {
      this.logToStderr(`  ${sha.slice(0, 9)} ${subject}`);
    }
    this.logToStderr("");

    if (dryRun) {
      this.logToStderr("Dry run complete. Run without --dry-run to apply.");
      return;
    }

    checkout([targetBranch]);

    let picked = 0;
    for (const { sha, subject } of candidates) {
      const result = cherryPick([sha]);
      if (result.ok) {
        this.logToStderr(`  pick ${sha.slice(0, 9)} ${subject}`);
        out(sha);
        picked++;
      } else {
        this.logToStderr("Resolve the conflict then run:");
        this.logToStderr("  git cherry-pick --continue");
        this.logToStderr("  git cherry-pick --abort   (to cancel)");
        this.error(`cherry-pick failed: ${sha.slice(0, 9)} ${subject}`, {
          exit: 1,
        });
      }
    }

    checkout([currentBranch]);
    this.logToStderr(`\nDone: ${picked} picked`);
  }
}
