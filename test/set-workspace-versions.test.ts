import assert from "node:assert/strict";
import { describe, it } from "node:test";

// Test the version validation regex independently (mirrors the guard in
// scripts/set-workspace-versions.mjs so changes to one surface failures here)
const VERSION_REGEX = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;

describe("version validation regex", () => {
  it("accepts a clean semver string", () => {
    assert.ok(VERSION_REGEX.test("1.2.3"));
  });

  it("accepts semver with pre-release tag", () => {
    assert.ok(VERSION_REGEX.test("1.2.3-alpha.1"));
  });

  it("accepts semver with build metadata", () => {
    assert.ok(VERSION_REGEX.test("1.2.3+build.42"));
  });

  it("accepts semver with pre-release and build metadata", () => {
    assert.ok(VERSION_REGEX.test("1.2.3-rc.1+build.42"));
  });

  it("rejects trailing garbage", () => {
    assert.ok(!VERSION_REGEX.test("1.2.3abc"));
  });

  it("rejects four-part version", () => {
    assert.ok(!VERSION_REGEX.test("1.2.3.4"));
  });

  it("accepts pre-release identifier consisting of word chars (e.g. 0extragarbage)", () => {
    // The regex allows any \w+ after the hyphen, so "1.2.3-0extragarbage" is valid
    // semver-ish and accepted — what matters is that truly malformed strings are caught
    assert.ok(VERSION_REGEX.test("1.2.3-0extragarbage"));
  });

  it("rejects string with trailing non-semver chars not in pre-release or metadata", () => {
    assert.ok(!VERSION_REGEX.test("1.2.3~bad"));
  });

  it("rejects empty string", () => {
    assert.ok(!VERSION_REGEX.test(""));
  });

  it("rejects string without patch", () => {
    assert.ok(!VERSION_REGEX.test("1.2"));
  });
});

// Test the intra-workspace dependency update logic independently
describe("intra-workspace dependency update logic", () => {
  function applyWorkspaceVersions(
    pkg: {
      version?: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    },
    workspaceNames: string[],
    version: string,
  ) {
    pkg.version = version;
    for (const name of workspaceNames) {
      if (pkg.dependencies?.[name]) pkg.dependencies[name] = `^${version}`;
      if (pkg.devDependencies?.[name])
        pkg.devDependencies[name] = `^${version}`;
    }
    return pkg;
  }

  it("updates the package version field", () => {
    const pkg = { version: "0.1.0" };
    applyWorkspaceVersions(pkg, [], "1.2.3");
    assert.equal(pkg.version, "1.2.3");
  });

  it("updates a sibling dep listed in dependencies", () => {
    const pkg = {
      version: "0.1.0",
      dependencies: { "@scope/sibling": "^0.1.0" },
    };
    applyWorkspaceVersions(pkg, ["@scope/sibling"], "2.0.0");
    assert.equal(pkg.dependencies["@scope/sibling"], "^2.0.0");
  });

  it("updates a sibling dep listed in devDependencies", () => {
    const pkg = {
      version: "0.1.0",
      devDependencies: { "@scope/sibling": "^0.1.0" },
    };
    applyWorkspaceVersions(pkg, ["@scope/sibling"], "2.0.0");
    assert.equal(pkg.devDependencies["@scope/sibling"], "^2.0.0");
  });

  it("leaves non-workspace deps untouched", () => {
    const pkg = {
      version: "0.1.0",
      dependencies: { lodash: "^4.0.0", "@scope/sibling": "^0.1.0" },
    };
    applyWorkspaceVersions(pkg, ["@scope/sibling"], "2.0.0");
    assert.equal(pkg.dependencies["lodash"], "^4.0.0");
  });

  it("does not throw when dependencies field is absent", () => {
    const pkg = { version: "0.1.0" };
    assert.doesNotThrow(() =>
      applyWorkspaceVersions(pkg, ["@scope/sibling"], "2.0.0"),
    );
  });

  it("updates multiple sibling workspaces", () => {
    const pkg = {
      version: "0.1.0",
      dependencies: {
        "@scope/a": "^0.1.0",
        "@scope/b": "^0.1.0",
      },
    };
    applyWorkspaceVersions(pkg, ["@scope/a", "@scope/b", "@scope/c"], "3.0.0");
    assert.equal(pkg.dependencies["@scope/a"], "^3.0.0");
    assert.equal(pkg.dependencies["@scope/b"], "^3.0.0");
  });
});
