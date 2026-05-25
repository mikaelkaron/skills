import { spawnSync } from "node:child_process";
import which from "which";

function defaultCmd() {
  return (
    process.env["TESSL_CMD"] ??
    which.sync("tessl", { nothrow: true }) ??
    "tessl"
  );
}

function run(args: string[], cmd = defaultCmd()): void {
  const result = spawnSync(cmd, args, { stdio: "inherit" });

  if (result.error) {
    throw new Error(
      result.error.message.includes("ENOENT")
        ? "tessl CLI not found. Install it from https://tessl.io"
        : result.error.message,
    );
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

export function install(
  tile: string,
  cmd?: string,
  extraArgs: string[] = [],
): void {
  run(["install", tile, ...extraArgs], cmd);
}

export function uninstall(
  tile: string,
  cmd?: string,
  extraArgs: string[] = [],
): void {
  run(["uninstall", tile, ...extraArgs], cmd);
}

export function list(cmd?: string, extraArgs: string[] = []): void {
  run(["list", ...extraArgs], cmd);
}
