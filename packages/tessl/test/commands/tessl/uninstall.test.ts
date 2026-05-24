import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runCommand } from "@oclif/test";

function findPkgRoot(dir: string): string {
  return existsSync(join(dir, "package.json"))
    ? dir
    : findPkgRoot(dirname(dir));
}

const root = findPkgRoot(dirname(fileURLToPath(import.meta.url)));

const tmpDir = join(tmpdir(), `tessl-uninstall-cmd-test-${process.pid}`);
let fakeTessl: string;

before(() => {
  mkdirSync(tmpDir, { recursive: true });
  fakeTessl = join(tmpDir, "tessl");
});

after(() => rmSync(tmpDir, { recursive: true, force: true }));

afterEach(() => {
  delete process.env["TESSL_CMD"];
  process.exitCode = undefined;
  if (existsSync(`${tmpDir}/last-args`)) rmSync(`${tmpDir}/last-args`);
});

function makeFakeTessl(exitCode = 0) {
  writeFileSync(
    fakeTessl,
    `#!/bin/sh\necho "$@" >> "${tmpDir}/last-args"\nexit ${exitCode}\n`,
  );
  chmodSync(fakeTessl, 0o755);
  process.env["TESSL_CMD"] = fakeTessl;
}

function lastArgs(): string {
  return readFileSync(`${tmpDir}/last-args`, "utf8").trim();
}

describe("tessl uninstall", () => {
  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:uninstall", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  it("passes uninstall subcommand and tile ref to tessl", async () => {
    makeFakeTessl();
    await runCommand(["tessl:uninstall", "tessl"], { root });
    assert.match(lastArgs(), /uninstall mikaelkaron\/tessl@0\.1\.0/);
  });

  describe("flags", () => {
    it("forwards --global flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:uninstall", "tessl", "--global"], { root });
      assert.match(lastArgs(), /--global/);
    });
  });

  describe("multiple plugins", () => {
    it("uninstalls each plugin in turn", async () => {
      makeFakeTessl();
      const { error } = await runCommand(
        ["tessl:uninstall", "tessl", "tessl"],
        { root },
      );
      assert.equal(error, undefined);
      const lines = lastArgs().split("\n");
      assert.equal(lines.length, 2);
      assert.match(lines[0], /uninstall mikaelkaron\/tessl@0\.1\.0/);
      assert.match(lines[1], /uninstall mikaelkaron\/tessl@0\.1\.0/);
    });
  });
});
