import { spawnSync } from "node:child_process";
import which from "which";

function defaultCmd() {
  return (
    process.env["GIT_CMD"] ?? which.sync("git", { nothrow: true }) ?? "git"
  );
}

function run(args: string[], cmd = defaultCmd()): string {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
  });

  if (result.error) {
    throw new Error(
      result.error.message.includes("ENOENT")
        ? "git not found. Install it from https://git-scm.com"
        : result.error.message,
    );
  }

  if (result.status !== 0) {
    throw new Error(
      result.stderr?.trim() ||
        `git ${args[0]} failed with exit code ${result.status}`,
    );
  }

  return result.stdout.trim();
}

function tryRun(
  args: string[],
  cmd = defaultCmd(),
): { ok: boolean; output: string } {
  try {
    return { ok: true, output: run(args, cmd) };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err.message?.includes("git not found")) throw e;
    return { ok: false, output: err.message ?? "" };
  }
}

export function revParse(args: string[], cmd?: string): string {
  return run(["rev-parse", ...args], cmd);
}

export function showRef(
  args: string[],
  cmd?: string,
): { ok: boolean; output: string } {
  return tryRun(["show-ref", ...args], cmd);
}

export function lsRemote(
  args: string[],
  cmd?: string,
): { ok: boolean; output: string } {
  return tryRun(["ls-remote", ...args], cmd);
}

export function checkout(args: string[], cmd?: string): string {
  return run(["checkout", ...args], cmd);
}

export function tryCheckout(
  args: string[],
  cmd?: string,
): { ok: boolean; output: string } {
  return tryRun(["checkout", ...args], cmd);
}

export function log(
  args: string[],
  cmd?: string,
): { ok: boolean; output: string } {
  return tryRun(["log", ...args], cmd);
}

export function diffTree(args: string[], cmd?: string): string {
  return run(["diff-tree", ...args], cmd);
}

export function cherryPick(
  args: string[],
  cmd?: string,
): { ok: boolean; output: string } {
  return tryRun(["cherry-pick", ...args], cmd);
}
