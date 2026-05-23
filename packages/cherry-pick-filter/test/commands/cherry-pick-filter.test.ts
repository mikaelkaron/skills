import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { runCommand } from "@oclif/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

function findPkgRoot(dir: string): string {
  return existsSync(join(dir, "package.json"))
    ? dir
    : findPkgRoot(dirname(dir));
}

const root = findPkgRoot(dirname(fileURLToPath(import.meta.url)));
const bundle = join(root, "test/fixtures/repo.bundle");

// Fixture repo structure (see test/fixtures/repo.bundle):
//   main:       init → feat: add index → chore: planning notes → feat: add other
//   main-mixed: init → fix: mixed commit  (touches both src/ and .planning/)
//   beta:       init

let dir: string;
let origCwd: string;

function git(...args: string[]): string {
  return execSync(`git ${args.join(" ")}`, {
    cwd: dir,
    encoding: "utf8",
    stdio: "pipe",
  }).trim();
}

beforeEach(() => {
  origCwd = process.cwd();
  dir = mkdtempSync(join(tmpdir(), "cpf-test-"));
  execSync(`git clone "${bundle}" "${dir}"`, { stdio: "pipe" });
  execSync(`git -C "${dir}" config user.email test@test.com`, {
    stdio: "pipe",
  });
  execSync(`git -C "${dir}" config user.name Test`, { stdio: "pipe" });
  execSync(`git -C "${dir}" config commit.gpgsign false`, { stdio: "pipe" });
  for (const branch of execSync(`git -C "${dir}" branch -r`, {
    encoding: "utf8",
  })
    .split("\n")
    .map((b) => b.trim().replace("origin/", ""))
    .filter((b) => b && !b.startsWith("HEAD") && b !== "main")) {
    execSync(`git -C "${dir}" branch "${branch}" "origin/${branch}"`, {
      stdio: "pipe",
    });
  }
  process.chdir(dir);
});

afterEach(() => {
  process.chdir(origCwd);
  rmSync(dir, { recursive: true, force: true });
  process.exitCode = undefined;
});

describe("cherry-pick-filter", () => {
  it("picks clean code commits onto beta, skipping filtered-only commits", async () => {
    const { error } = await runCommand(
      ["cherry-pick-filter", "beta", "--filter", ".planning/"],
      { root },
    );
    assert.equal(error, undefined);
    const log = git("log", "beta", "--format=%s");
    assert.match(log, /feat: add index/);
    assert.match(log, /feat: add other/);
    assert.doesNotMatch(log, /chore: planning notes/);
  });

  it("exits cleanly when already up to date", async () => {
    git("branch", "-f", "beta", "main");
    const { error } = await runCommand(
      ["cherry-pick-filter", "beta", "--filter", ".planning/"],
      { root },
    );
    assert.equal(error, undefined);
  });

  it("aborts without cherry-picking when a mixed commit is detected", async () => {
    git("checkout", "main-mixed");
    const betaBefore = git("rev-parse", "beta");
    const { error, stderr } = await runCommand(
      ["cherry-pick-filter", "beta", "--filter", ".planning/"],
      { root },
    );
    assert.match(error!.message, /mixed commit/);
    assert.equal(git("rev-parse", "beta"), betaBefore);
    assert.match(stderr, /Mixed commits detected/);
  });

  it("reports candidates without cherry-picking on --dry-run", async () => {
    const betaBefore = git("rev-parse", "beta");
    const { error } = await runCommand(
      ["cherry-pick-filter", "beta", "--filter", ".planning/", "--dry-run"],
      { root },
    );
    assert.equal(error, undefined);
    assert.equal(git("rev-parse", "beta"), betaBefore);
  });

  it("filters multiple prefixes", async () => {
    const { error } = await runCommand(
      [
        "cherry-pick-filter",
        "beta",
        "--filter",
        ".planning/",
        "--filter",
        "src/other.ts",
      ],
      { root },
    );
    assert.equal(error, undefined);
    const log = git("log", "beta", "--format=%s");
    assert.match(log, /feat: add index/);
    assert.doesNotMatch(log, /feat: add other/);
  });

  it("errors when target branch does not exist", async () => {
    const { error } = await runCommand(
      ["cherry-pick-filter", "nonexistent", "--filter", ".planning/"],
      { root },
    );
    assert.match(error!.message, /not found locally or on origin/);
  });

  it("errors when cherry-pick conflicts", async () => {
    // Create a clean one-commit source branch so the first pick immediately conflicts
    git("checkout", "-b", "conflict-src", "beta");
    writeFileSync(join(dir, "conflict.ts"), "source version\n");
    git("add", "conflict.ts");
    execSync('git commit -m "feat: add conflict"', { cwd: dir, stdio: "pipe" });

    git("checkout", "beta");
    writeFileSync(join(dir, "conflict.ts"), "target version\n");
    git("add", "conflict.ts");
    execSync('git commit -m "beta: add conflict"', { cwd: dir, stdio: "pipe" });

    git("checkout", "conflict-src");
    const { error, stderr } = await runCommand(
      ["cherry-pick-filter", "beta", "--filter", ".planning/"],
      { root },
    );
    assert.ok(error);
    assert.match(stderr, /cherry-pick failed/i);
  });

  it("errors when already on target branch", async () => {
    git("checkout", "beta");
    const { error } = await runCommand(
      ["cherry-pick-filter", "beta", "--filter", ".planning/"],
      { root },
    );
    assert.match(error!.message, /already on 'beta'/);
  });
});
