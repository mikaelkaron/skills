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

const { tessl: tesslPjson } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
) as { tessl: { tile: string; version: string } };

const tileRef = `${tesslPjson.tile}@${tesslPjson.version}`;

const tmpDir = join(tmpdir(), `tessl-uninstall-cmd-test-${process.pid}`);
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

function writeState(tiles: Record<string, string>) {
  writeFileSync(join(stateDir, "tiles.json"), JSON.stringify(tiles, null, 2));
}

describe("tessl uninstall", () => {
  it("errors when plugin is not installed", async () => {
    const { error } = await runCommand(["tessl:uninstall", "unknown-plugin"], {
      root,
    });
    assert.match(error!.message, /is not installed/);
  });

  it("passes current tile ref to tessl when no stored version", async () => {
    makeFakeTessl();
    await runCommand(["tessl:uninstall", "tessl"], { root });
    assert.match(
      lastArgs(),
      new RegExp(`uninstall ${tileRef.replace(/\//g, "\\/")}`),
    );
  });

  it("uses stored tile ref from install", async () => {
    makeFakeTessl();
    const storedRef = `${tesslPjson.tile}@0.1.0`;
    writeState({ tessl: storedRef });
    await runCommand(["tessl:uninstall", "tessl"], { root });
    assert.match(
      lastArgs(),
      new RegExp(`uninstall ${storedRef.replace(/\//g, "\\/")}`),
    );
  });

  it("removes stored tile ref after uninstall", async () => {
    makeFakeTessl();
    writeState({ tessl: tileRef });
    await runCommand(["tessl:uninstall", "tessl"], { root });
    const file = join(stateDir, "tiles.json");
    const state = existsSync(file)
      ? (JSON.parse(readFileSync(file, "utf8")) as Record<string, string>)
      : {};
    assert.equal(state["tessl"], undefined);
  });

  describe("flags", () => {
    it("forwards --global flag", async () => {
      makeFakeTessl();
      await runCommand(["tessl:uninstall", "tessl", "--global"], { root });
      assert.match(lastArgs(), /--global/);
    });
  });

  describe("multiple plugins", () => {
    it("uninstalls each plugin in turn using stored refs", async () => {
      makeFakeTessl();
      writeState({ tessl: tileRef });
      const { error } = await runCommand(
        ["tessl:uninstall", "tessl", "tessl"],
        { root },
      );
      assert.equal(error, undefined);
      const lines = lastArgs().split("\n");
      assert.equal(lines.length, 2);
      assert.match(
        lines[0],
        new RegExp(`uninstall ${tileRef.replace(/\//g, "\\/")}`),
      );
      assert.match(
        lines[1],
        new RegExp(`uninstall ${tileRef.replace(/\//g, "\\/")}`),
      );
    });
  });
});
