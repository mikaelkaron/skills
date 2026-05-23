import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exec, tryExec } from "../../src/lib/git.ts";

describe("exec", () => {
  it("returns trimmed stdout", () => {
    assert.equal(exec("echo hello"), "hello");
  });

  it("throws on non-zero exit", () => {
    assert.throws(() => exec("false"));
  });
});

describe("tryExec", () => {
  it("returns ok:true with trimmed output on success", () => {
    const result = tryExec("echo hello");
    assert.equal(result.ok, true);
    assert.equal(result.output, "hello");
  });

  it("returns ok:false with output on failure", () => {
    const result = tryExec("false");
    assert.equal(result.ok, false);
    assert.ok(result.output.length > 0);
  });
});
