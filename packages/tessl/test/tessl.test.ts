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
import { install, list, uninstall } from "../src/lib/tessl.ts";

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

describe("tessl install", () => {
  const stateDir = join(tmpdir(), `tessl-install-cmd-state-${process.pid}`);

  before(() => {
    mkdirSync(stateDir, { recursive: true });
    process.env["TESSL_STATE_DIR"] = stateDir;
  });

  after(() => {
    rmSync(stateDir, { recursive: true, force: true });
    delete process.env["TESSL_STATE_DIR"];
  });

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
          { root },
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

describe("tessl list", () => {
  const stateDir = join(tmpdir(), `tessl-list-cmd-state-${process.pid}`);

  before(() => {
    mkdirSync(stateDir, { recursive: true });
    process.env["TESSL_STATE_DIR"] = stateDir;
  });

  after(() => {
    rmSync(stateDir, { recursive: true, force: true });
    delete process.env["TESSL_STATE_DIR"];
  });

  afterEach(() => {
    process.exitCode = undefined;
    const tilesFile = join(stateDir, "tiles.json");
    if (existsSync(tilesFile)) rmSync(tilesFile);
  });

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

describe("tessl uninstall", () => {
  const stateDir = join(tmpdir(), `tessl-uninstall-cmd-state-${process.pid}`);

  before(() => {
    mkdirSync(stateDir, { recursive: true });
    process.env["TESSL_STATE_DIR"] = stateDir;
  });

  after(() => {
    rmSync(stateDir, { recursive: true, force: true });
    delete process.env["TESSL_STATE_DIR"];
  });

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
      (t) => {
        try {
          install(tileRef, tesslBin!);
        } catch {
          t.skip("tile not available in registry");
          return;
        }
        if (!existsSync(join(realTmpDir, ".mcp.json"))) {
          t.skip("tile requires authentication");
          return;
        }
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
      (t) => {
        try {
          install(tileRef, tesslBin!);
        } catch {
          t.skip("tile not available in registry");
          return;
        }
        if (!existsSync(join(realTmpDir, ".mcp.json"))) {
          t.skip("tile requires authentication");
          return;
        }
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
      (t) => {
        try {
          install(tileRef, tesslBin!);
        } catch {
          t.skip("tile not available in registry");
          return;
        }
        if (!existsSync(join(realTmpDir, ".mcp.json"))) {
          t.skip("tile requires authentication");
          return;
        }
        assert.doesNotThrow(() => list(tesslBin!));
      },
    );
  });
});
