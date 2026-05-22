import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Config } from "@oclif/core";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

function findPkgRoot(dir: string): string {
  return existsSync(join(dir, "package.json"))
    ? dir
    : findPkgRoot(dirname(dir));
}

const root = findPkgRoot(dirname(fileURLToPath(import.meta.url)));

describe("oclif config", () => {
  it("loads @oclif/plugin-plugins as a core plugin", async () => {
    const config = await Config.load({ root });
    assert.ok(
      config.plugins.has("@oclif/plugin-plugins"),
      "expected @oclif/plugin-plugins to be a core plugin",
    );
  });

  it("sets scope to mikaelkaron", async () => {
    const config = await Config.load({ root });
    assert.equal(config.pjson.oclif.scope, "mikaelkaron");
  });

  it("sets pluginPrefix to skills", async () => {
    const config = await Config.load({ root });
    assert.equal(config.pjson.oclif.pluginPrefix, "skills");
  });
});
