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
import { tmpdir } from "node:os";
import { join } from "node:path";
import which from "which";
import { install } from "../../src/lib/tessl.ts";

const tesslBin = which.sync("tessl", { nothrow: true });

const tmpDir = join(tmpdir(), `tessl-lib-test-${process.pid}`);
let fakeTessl: string;

before(() => {
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

describe("install", () => {
  it("throws when tessl is not found (ENOENT)", () => {
    assert.throws(
      () => install("some/tile", "/nonexistent/path/to/tessl"),
      /tessl CLI not found/,
    );
  });

  it("exits with tessl exit code on failure", () => {
    makeFakeTessl(2);
    let exited: number | undefined;
    const orig = process.exit.bind(process);
    // @ts-expect-error overriding process.exit for test
    process.exit = (code?: number) => {
      exited = code;
    };
    try {
      install("some/tile");
    } finally {
      process.exit = orig;
    }
    assert.equal(exited, 2);
  });

  it("resolves without error when tessl exits 0", () => {
    makeFakeTessl(0);
    assert.doesNotThrow(() => install("some/tile"));
  });

  it("passes tile ref as argument to tessl", () => {
    makeFakeTessl(0);
    install("mikaelkaron/tessl@0.1.0");
    const lastArgs = readFileSync(`${tmpDir}/last-args`, "utf8").trim();
    assert.match(lastArgs, /install mikaelkaron\/tessl@0\.1\.0/);
  });

  it("uses TESSL_CMD env var when set", () => {
    makeFakeTessl(0);
    install("some/tile");
    const lastArgs = readFileSync(`${tmpDir}/last-args`, "utf8").trim();
    assert.ok(lastArgs.length > 0);
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
      () => {
        install("mikaelkaron/tessl@0.1.0", tesslBin!);
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
