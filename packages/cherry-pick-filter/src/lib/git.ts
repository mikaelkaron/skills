import { execSync } from "node:child_process";

export function exec(cmd: string): string {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
  }).trim();
}

export function tryExec(cmd: string): { ok: boolean; output: string } {
  try {
    return { ok: true, output: exec(cmd) };
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    return { ok: false, output: err.stderr ?? err.message ?? "" };
  }
}
