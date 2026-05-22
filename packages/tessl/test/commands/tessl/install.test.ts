import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";
import { runCommand } from "@oclif/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";

function findPkgRoot(dir: string): string {
  return existsSync(join(dir, "package.json"))
    ? dir
    : findPkgRoot(dirname(dir));
}

const root = findPkgRoot(dirname(fileURLToPath(import.meta.url)));

describe("tessl install", () => {
  let fakeTessl: string;
  let tmpDir: string;

  before(() => {
    tmpDir = join(tmpdir(), `tessl-test-${process.pid}`);
    mkdirSync(tmpDir, { recursive: true });
    fakeTessl = join(tmpDir, "tessl");
  });

  after(() => rmSync(tmpDir, { recursive: true, force: true }));

  afterEach(() => {
    delete process.env["TESSL_CMD"];
    process.exitCode = undefined;
  });

  function makeFakeTessl(exitCode: number) {
    writeFileSync(
      fakeTessl,
      `#!/bin/sh\necho "$@" >> "${tmpDir}/last-args"\nexit ${exitCode}\n`,
    );
    chmodSync(fakeTessl, 0o755);
    process.env["TESSL_CMD"] = fakeTessl;
  }

  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:install", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  it("errors when tessl is not found (ENOENT)", async () => {
    process.env["TESSL_CMD"] = "/nonexistent/path/to/tessl";
    const { error } = await runCommand(["tessl:install", "tessl"], { root });
    assert.match(error!.message, /tessl CLI not found/);
  });

  it("exits with tessl exit code on failure", async () => {
    makeFakeTessl(2);
    const { error } = await runCommand(["tessl:install", "tessl"], { root });
    assert.ok(error);
  });

  it("succeeds when tessl exits with 0", async () => {
    makeFakeTessl(0);
    const { error } = await runCommand(["tessl:install", "tessl"], { root });
    assert.equal(error, undefined);
  });

  it("passes tile@version to tessl when version is declared", async () => {
    makeFakeTessl(0);
    const { error } = await runCommand(["tessl:install", "tessl"], { root });
    assert.equal(error, undefined);
    const lastArgs = readFileSync(`${tmpDir}/last-args`, "utf8").trim();
    assert.match(lastArgs, /mikaelkaron\/tessl@\d+\.\d+\.\d+/);
  });
});
