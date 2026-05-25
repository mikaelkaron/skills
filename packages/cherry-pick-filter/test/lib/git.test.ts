import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkout,
  cherryPick,
  diffTree,
  log,
  lsRemote,
  revParse,
  showRef,
  tryCheckout,
} from "../../src/lib/git.ts";

const BAD_CMD = "/nonexistent/path/to/git";

describe("revParse", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(
      () => revParse(["--abbrev-ref", "HEAD"], BAD_CMD),
      /git not found/,
    );
  });

  it("returns current branch name", () => {
    const branch = revParse(["--abbrev-ref", "HEAD"]);
    assert.match(branch, /^\S+$/);
  });

  it("throws on invalid ref", () => {
    assert.throws(() =>
      revParse(["--verify", "refs/heads/__no_such_branch__"]),
    );
  });
});

describe("showRef", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(
      () => showRef(["--verify", "--quiet", "HEAD"], BAD_CMD),
      /git not found/,
    );
  });

  it("returns ok:true for existing ref", () => {
    const result = showRef(["--verify", "HEAD"]);
    assert.equal(result.ok, true);
  });

  it("returns ok:false for missing ref", () => {
    const result = showRef([
      "--verify",
      "--quiet",
      "refs/heads/__no_such_branch__",
    ]);
    assert.equal(result.ok, false);
  });
});

describe("lsRemote", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(
      () => lsRemote(["--heads", "origin", "main"], BAD_CMD),
      /git not found/,
    );
  });
});

describe("checkout", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(
      () => checkout(["__no_such_branch__"], BAD_CMD),
      /git not found/,
    );
  });

  it("throws on unknown branch", () => {
    assert.throws(() => checkout(["__no_such_branch__"]));
  });
});

describe("tryCheckout", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(
      () => tryCheckout(["__no_such_branch__"], BAD_CMD),
      /git not found/,
    );
  });

  it("returns ok:false on unknown branch", () => {
    const result = tryCheckout(["__no_such_branch__"]);
    assert.equal(result.ok, false);
  });
});

describe("log", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(() => log(["--oneline", "-1"], BAD_CMD), /git not found/);
  });

  it("returns ok:true with output for valid log", () => {
    const result = log(["--oneline", "-1"]);
    assert.equal(result.ok, true);
    assert.ok(result.output.length > 0);
  });
});

describe("diffTree", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(
      () => diffTree(["--no-commit-id", "-r", "--name-only", "HEAD"], BAD_CMD),
      /git not found/,
    );
  });

  it("returns files changed in HEAD", () => {
    const output = diffTree(["--no-commit-id", "-r", "--name-only", "HEAD"]);
    assert.ok(typeof output === "string");
  });
});

describe("cherryPick", () => {
  it("throws when git is not found (ENOENT)", () => {
    assert.throws(() => cherryPick(["HEAD"], BAD_CMD), /git not found/);
  });
});
