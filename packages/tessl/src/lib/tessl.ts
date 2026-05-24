import { spawnSync } from "node:child_process";
import which from "which";

export function install(
  tile: string,
  cmd = process.env["TESSL_CMD"] ??
    which.sync("tessl", { nothrow: true }) ??
    "tessl",
  extraArgs: string[] = [],
): void {
  const result = spawnSync(cmd, ["install", tile, ...extraArgs], {
    stdio: "inherit",
  });

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
