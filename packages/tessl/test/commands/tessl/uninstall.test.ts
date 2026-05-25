import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
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

const stateDir = join(tmpdir(), `tessl-uninstall-cmd-state-${process.pid}`);

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

function readState(): Record<string, string> {
  const file = join(stateDir, "tiles.json");
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, string>;
}

describe("tessl uninstall", () => {
  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:uninstall", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    beforeEach(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-uninstall-"));
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
      "uninstalls tile and removes ref from state",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        await runCommand(["tessl:install", "tessl"], { root });
        assert.equal(readState()["tessl"], tileRef);

        const { error } = await runCommand(["tessl:uninstall", "tessl"], {
          root,
        });
        assert.equal(error, undefined);
        assert.equal(readState()["tessl"], undefined);
      },
    );

    it(
      "uninstalls each of multiple plugins in turn",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        await runCommand(["tessl:install", "tessl"], { root });

        const { error } = await runCommand(
          ["tessl:uninstall", "tessl", "tessl"],
          { root },
        );
        assert.equal(error, undefined);
        assert.equal(readState()["tessl"], undefined);
      },
    );

    describe("flags", () => {
      it(
        "accepts --global flag",
        { skip: !tesslBin && "tessl not found" },
        async () => {
          const { error } = await runCommand(
            ["tessl:uninstall", "tessl", "--global"],
            { root },
          );
          assert.equal(error, undefined);
        },
      );
    });
  });
});
