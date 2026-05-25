import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import which from "which";
import { runCommand } from "@oclif/test";

function findPkgRoot(dir: string): string {
  return existsSync(join(dir, "package.json"))
    ? dir
    : findPkgRoot(dirname(dir));
}

const root = findPkgRoot(dirname(fileURLToPath(import.meta.url)));
const tesslBin = which.sync("tessl", { nothrow: true });

const { tessl: tesslPjson } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
) as { tessl: { tile: string; version: string } };

const tileRef = `${tesslPjson.tile}@${tesslPjson.version}`;

const tmpDir = join(tmpdir(), `tessl-install-cmd-test-${process.pid}`);
let fakeTessl: string;
let stateDir: string;

before(() => {
  mkdirSync(tmpDir, { recursive: true });
  fakeTessl = join(tmpDir, "tessl");
  stateDir = join(tmpDir, "state");
  mkdirSync(stateDir, { recursive: true });
  process.env["TESSL_STATE_DIR"] = stateDir;
});

after(() => rmSync(tmpDir, { recursive: true, force: true }));

afterEach(() => {
  delete process.env["TESSL_CMD"];
  process.exitCode = undefined;
  if (existsSync(`${tmpDir}/last-args`)) rmSync(`${tmpDir}/last-args`);
  if (existsSync(`${stateDir}/tiles.json`)) rmSync(`${stateDir}/tiles.json`);
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

function readState(): Record<string, string> {
  const file = join(stateDir, "tiles.json");
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, string>;
}

describe("tessl install", () => {
  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:install", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  it("passes current tile ref to tessl", async () => {
    makeFakeTessl();
    await runCommand(["tessl:install", "tessl"], { root });
    assert.match(
      lastArgs(),
      new RegExp(`install ${tileRef.replace(/\//g, "\\/").replace(/@/g, "@")}`),
    );
  });

  it("stores the installed tile ref", async () => {
    makeFakeTessl();
    await runCommand(["tessl:install", "tessl"], { root });
    assert.equal(readState()["tessl"], tileRef);
  });

  describe("flags", () => {
    it("forwards --global flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:install", "tessl", "--global"], { root });
      assert.match(lastArgs(), /--global/);
    });

    it("forwards --yes flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:install", "tessl", "--yes"], { root });
      assert.match(lastArgs(), /--yes/);
    });

    it("forwards --verbose flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:install", "tessl", "--verbose"], { root });
      assert.match(lastArgs(), /--verbose/);
    });

    it("forwards --accept-warnings flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:install", "tessl", "--accept-warnings"], {
        root,
      });
      assert.match(lastArgs(), /--accept-warnings/);
    });

    it("forwards --agent flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:install", "tessl", "--agent", "claude-code"], {
        root,
      });
      assert.match(lastArgs(), /--agent claude-code/);
    });

    it("forwards multiple --agent flags", async () => {
      makeFakeTessl();
      await runCommand(
        [
          "tessl:install",
          "tessl",
          "--agent",
          "claude-code",
          "--agent",
          "cursor",
        ],
        { root },
      );
      assert.match(lastArgs(), /--agent claude-code --agent cursor/);
    });

    it("forwards multiple flags together", async () => {
      makeFakeTessl();
      await runCommand(
        ["tessl:install", "tessl", "--global", "--yes", "--verbose"],
        { root },
      );
      const args = lastArgs();
      assert.match(args, /--global/);
      assert.match(args, /--yes/);
      assert.match(args, /--verbose/);
    });
  });

  describe("multiple plugins", () => {
    it("installs each plugin in turn", async () => {
      makeFakeTessl();
      const { error } = await runCommand(["tessl:install", "tessl", "tessl"], {
        root,
      });
      assert.equal(error, undefined);
      const lines = lastArgs().split("\n");
      assert.equal(lines.length, 2);
      assert.match(
        lines[0],
        new RegExp(`install ${tileRef.replace(/\//g, "\\/")}`),
      );
      assert.match(
        lines[1],
        new RegExp(`install ${tileRef.replace(/\//g, "\\/")}`),
      );
    });
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    before(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-real-"));
      origCwd = process.cwd();
      process.chdir(realTmpDir);
    });

    after(() => {
      process.chdir(origCwd);
      rmSync(realTmpDir, { recursive: true, force: true });
    });

    it(
      "initializes project and installs tile",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        process.env["TESSL_CMD"] = tesslBin!;
        const { error } = await runCommand(["tessl:install", "tessl"], {
          root,
        });
        assert.equal(error, undefined);
        assert.ok(
          existsSync(join(realTmpDir, "tessl.json")),
          "tessl.json should be created",
        );
        assert.ok(
          existsSync(join(realTmpDir, ".mcp.json")),
          ".mcp.json should be created",
        );
      },
    );
  });
});
