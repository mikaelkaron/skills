import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import which from "which";
import { install, list, uninstall } from "../../src/lib/tessl.ts";

function findPkgRoot(dir: string): string {
  return existsSync(join(dir, "package.json"))
    ? dir
    : findPkgRoot(dirname(dir));
}

const pkgRoot = findPkgRoot(dirname(fileURLToPath(import.meta.url)));
const { tessl: tesslPjson } = JSON.parse(
  readFileSync(join(pkgRoot, "package.json"), "utf8"),
) as { tessl: { tile: string; version: string } };
const tileRef = `${tesslPjson.tile}@${tesslPjson.version}`;

const tesslBin = which.sync("tessl", { nothrow: true });

describe("install", () => {
  it("throws when tessl is not found (ENOENT)", () => {
    assert.throws(
      () => install("some/tile", "/nonexistent/path/to/tessl"),
      /tessl CLI not found/,
    );
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    before(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-real-install-"));
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
      () => {
        install(tileRef, tesslBin!);
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

describe("uninstall", () => {
  it("throws when tessl is not found (ENOENT)", () => {
    assert.throws(
      () => uninstall("some/tile", "/nonexistent/path/to/tessl"),
      /tessl CLI not found/,
    );
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    before(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-real-uninstall-"));
      origCwd = process.cwd();
      process.chdir(realTmpDir);
    });

    after(() => {
      process.chdir(origCwd);
      rmSync(realTmpDir, { recursive: true, force: true });
    });

    it(
      "removes tile after install",
      { skip: !tesslBin && "tessl not found" },
      () => {
        install(tileRef, tesslBin!);
        assert.ok(existsSync(join(realTmpDir, "tessl.json")));
        uninstall(tileRef, tesslBin!);
        const manifest = JSON.parse(
          readFileSync(join(realTmpDir, "tessl.json"), "utf8"),
        ) as { dependencies?: Record<string, unknown> };
        assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0);
      },
    );
  });
});

describe("list", () => {
  it("throws when tessl is not found (ENOENT)", () => {
    assert.throws(
      () => list("/nonexistent/path/to/tessl"),
      /tessl CLI not found/,
    );
  });

  describe("real tessl", () => {
    let realTmpDir: string;
    let origCwd: string;

    before(() => {
      realTmpDir = mkdtempSync(join(tmpdir(), "tessl-real-list-"));
      origCwd = process.cwd();
      process.chdir(realTmpDir);
    });

    after(() => {
      process.chdir(origCwd);
      rmSync(realTmpDir, { recursive: true, force: true });
    });

    it(
      "lists installed tile without error",
      { skip: !tesslBin && "tessl not found" },
      () => {
        install(tileRef, tesslBin!);
        assert.doesNotThrow(() => list(tesslBin!));
      },
    );
  });
});
