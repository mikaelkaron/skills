import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allPlugins, buildSkipFilter, stepId } from "../release.config.mjs";

describe("allPlugins", () => {
  it("is an array", () => {
    assert.ok(Array.isArray(allPlugins));
  });

  it("contains exactly 3 @semantic-release/npm entries", () => {
    const npmEntries = allPlugins.filter(
      (entry) => Array.isArray(entry) && entry[0] === "@semantic-release/npm",
    );
    assert.equal(npmEntries.length, 3);
  });

  it("each npm entry has a unique pkgRoot", () => {
    const npmEntries = allPlugins.filter(
      (entry): entry is [string, Record<string, unknown>] =>
        Array.isArray(entry) && entry[0] === "@semantic-release/npm",
    );
    const pkgRoots = npmEntries.map((entry) => entry[1].pkgRoot);
    assert.equal(new Set(pkgRoots).size, 3);
  });

  it("npm entries cover ., packages/cherry-pick-filter, packages/tessl", () => {
    const npmEntries = allPlugins.filter(
      (entry): entry is [string, Record<string, unknown>] =>
        Array.isArray(entry) && entry[0] === "@semantic-release/npm",
    );
    const pkgRoots = new Set(npmEntries.map((entry) => entry[1].pkgRoot));
    assert.ok(pkgRoots.has("."));
    assert.ok(pkgRoots.has("packages/cherry-pick-filter"));
    assert.ok(pkgRoots.has("packages/tessl"));
  });
});

describe("stepId", () => {
  it("returns name when no suffix", () => {
    assert.equal(stepId("@semantic-release/npm"), "@semantic-release/npm");
  });

  it("returns name:suffix when suffix provided", () => {
    assert.equal(
      stepId("@semantic-release/npm", "packages/tessl"),
      "@semantic-release/npm:packages/tessl",
    );
  });
});

describe("buildSkipFilter", () => {
  it("returns a function", () => {
    const f = buildSkipFilter();
    assert.equal(typeof f, "function");
  });

  it("keeps all entries when SEMREL_SKIP_STEPS is not set", () => {
    delete process.env["SEMREL_SKIP_STEPS"];
    const filtered = allPlugins.filter(buildSkipFilter());
    assert.equal(filtered.length, allPlugins.length);
  });

  it("excludes entries whose stepId is in the skip set", () => {
    const npmStepIds = [
      "@semantic-release/npm:.",
      "@semantic-release/npm:packages/cherry-pick-filter",
      "@semantic-release/npm:packages/tessl",
    ];
    process.env["SEMREL_SKIP_STEPS"] = npmStepIds.join("|");
    const filtered = allPlugins.filter(buildSkipFilter());
    const npmRemaining = filtered.filter(
      (entry) => Array.isArray(entry) && entry[0] === "@semantic-release/npm",
    );
    assert.equal(npmRemaining.length, 0);
    delete process.env["SEMREL_SKIP_STEPS"];
  });

  it("keeps entries not in the skip set", () => {
    process.env["SEMREL_SKIP_STEPS"] = "@semantic-release/npm:.";
    const filtered = allPlugins.filter(buildSkipFilter());
    const npmRemaining = filtered.filter(
      (entry) => Array.isArray(entry) && entry[0] === "@semantic-release/npm",
    );
    assert.equal(npmRemaining.length, 2);
    delete process.env["SEMREL_SKIP_STEPS"];
  });
});

describe("default export", () => {
  it("has branches array", async () => {
    const mod = await import("../release.config.mjs");
    const config = mod.default;
    assert.ok(Array.isArray(config.branches));
  });

  it("has tagFormat v${version}", async () => {
    const mod = await import("../release.config.mjs");
    const config = mod.default;
    assert.equal(config.tagFormat, "v${version}");
  });

  it("has plugins array", async () => {
    const mod = await import("../release.config.mjs");
    const config = mod.default;
    assert.ok(Array.isArray(config.plugins));
  });
});
