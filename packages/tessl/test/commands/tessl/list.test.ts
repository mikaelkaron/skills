import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
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

const stateDir = join(tmpdir(), `tessl-list-cmd-state-${process.pid}`);

before(() => {
  mkdirSync(stateDir, { recursive: true });
  process.env["TESSL_STATE_DIR"] = stateDir;
});

after(() => rmSync(stateDir, { recursive: true, force: true }));

afterEach(() => {
  process.exitCode = undefined;
  const tilesFile = join(stateDir, "tiles.json");
  if (existsSync(tilesFile)) rmSync(tilesFile);
});

describe("tessl list", () => {
  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:list", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    beforeEach(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-list-"));
      origCwd = process.cwd();
      process.chdir(realTmpDir);
      process.env["TESSL_CMD"] = tesslBin!;
    });

    afterEach(() => {
      process.chdir(origCwd);
      rmSync(realTmpDir, { recursive: true, force: true });
      delete process.env["TESSL_CMD"];
    });

    it(
      "lists installed tile without error",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        await runCommand(["tessl:install", "tessl"], { root });

        const { error } = await runCommand(["tessl:list", "tessl"], { root });
        assert.equal(error, undefined);
      },
    );

    it(
      "lists each of multiple plugins in turn",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        await runCommand(["tessl:install", "tessl"], { root });

        const { error } = await runCommand(["tessl:list", "tessl", "tessl"], {
          root,
        });
        assert.equal(error, undefined);
      },
    );

    describe("flags", () => {
      it(
        "accepts --global flag",
        { skip: !tesslBin && "tessl not found" },
        async () => {
          const { error } = await runCommand(
            ["tessl:list", "tessl", "--global"],
            { root },
          );
          assert.equal(error, undefined);
        },
      );
    });
  });
});
