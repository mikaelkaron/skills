import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readTiles, stateDir, writeTiles } from "../../src/lib/tiles.ts";

const tmpDir = join(tmpdir(), `tessl-tiles-test-${process.pid}`);

before(() => mkdirSync(tmpDir, { recursive: true }));
after(() => rmSync(tmpDir, { recursive: true, force: true }));

describe("stateDir", () => {
  it("returns TESSL_STATE_DIR when set", () => {
    process.env["TESSL_STATE_DIR"] = "/custom/dir";
    assert.equal(stateDir("default"), "/custom/dir");
    delete process.env["TESSL_STATE_DIR"];
  });

  it("returns dataDir when TESSL_STATE_DIR is not set", () => {
    delete process.env["TESSL_STATE_DIR"];
    assert.equal(stateDir("/data/dir"), "/data/dir");
  });
});

describe("readTiles", () => {
  it("returns empty object when file does not exist", () => {
    assert.deepEqual(readTiles(join(tmpDir, "missing")), {});
  });

  it("returns parsed contents of tiles.json", () => {
    const dir = join(tmpDir, "read-test");
    mkdirSync(dir, { recursive: true });
    writeTiles(dir, { tessl: "mikaelkaron/tessl@0.3.0" });
    assert.deepEqual(readTiles(dir), { tessl: "mikaelkaron/tessl@0.3.0" });
  });
});

describe("writeTiles", () => {
  it("creates the directory if it does not exist", () => {
    const dir = join(tmpDir, "new-dir");
    writeTiles(dir, {});
    assert.ok(existsSync(dir));
  });

  it("writes tiles as formatted JSON", () => {
    const dir = join(tmpDir, "write-test");
    writeTiles(dir, { tessl: "mikaelkaron/tessl@0.3.0" });
    const raw = readFileSync(join(dir, "tiles.json"), "utf8");
    assert.ok(raw.includes("\n"), "should be formatted with newlines");
    assert.deepEqual(JSON.parse(raw), { tessl: "mikaelkaron/tessl@0.3.0" });
  });

  it("overwrites existing state", () => {
    const dir = join(tmpDir, "overwrite-test");
    writeTiles(dir, { tessl: "mikaelkaron/tessl@0.1.0" });
    writeTiles(dir, { tessl: "mikaelkaron/tessl@0.3.0" });
    assert.deepEqual(readTiles(dir), { tessl: "mikaelkaron/tessl@0.3.0" });
  });
});
