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

const stateDir = join(tmpdir(), `tessl-install-cmd-state-${process.pid}`);

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

describe("tessl install", () => {
  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:install", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    beforeEach(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-install-"));
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
      "installs tile and stores ref in state",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        const { error } = await runCommand(["tessl:install", "tessl"], {
          root,
        });
        assert.equal(error, undefined);
        assert.equal(readState()["tessl"], tileRef);
        assert.ok(existsSync(join(realTmpDir, "tessl.json")));
      },
    );

    it(
      "installs each of multiple plugins in turn",
      { skip: !tesslBin && "tessl not found" },
      async () => {
        const { error } = await runCommand(
          ["tessl:install", "tessl", "tessl"],
          {
            root,
          },
        );
        assert.equal(error, undefined);
        assert.equal(readState()["tessl"], tileRef);
      },
    );

    describe("flags", () => {
      it(
        "accepts --yes flag",
        { skip: !tesslBin && "tessl not found" },
        async () => {
          const { error } = await runCommand(
            ["tessl:install", "tessl", "--yes"],
            { root },
          );
          assert.equal(error, undefined);
        },
      );

      it(
        "accepts --verbose flag",
        { skip: !tesslBin && "tessl not found" },
        async () => {
          const { error } = await runCommand(
            ["tessl:install", "tessl", "--verbose"],
            { root },
          );
          assert.equal(error, undefined);
        },
      );

      it(
        "accepts --accept-warnings flag",
        { skip: !tesslBin && "tessl not found" },
        async () => {
          const { error } = await runCommand(
            ["tessl:install", "tessl", "--accept-warnings"],
            { root },
          );
          assert.equal(error, undefined);
        },
      );

      it(
        "accepts --agent flag",
        { skip: !tesslBin && "tessl not found" },
        async () => {
          const { error } = await runCommand(
            ["tessl:install", "tessl", "--agent", "claude-code"],
            { root },
          );
          assert.equal(error, undefined);
        },
      );
    });
  });
});
