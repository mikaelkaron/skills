import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TestEvent } from "node:test/reporters";
import {
  parseTestEvents,
  renderTestSummary,
} from "../scripts/lib/test-summary.mts";
import {
  parseCoverageSummary,
  renderCoverageSummary,
} from "../scripts/lib/coverage-summary.mts";
import reporter from "../scripts/reporters/test.mts";

async function* fromArray<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item;
}

async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const items: string[] = [];
  for await (const item of gen) items.push(item);
  return items;
}

function event(type: TestEvent["type"], data: object): string {
  return JSON.stringify({ type, data });
}

describe("parseTestEvents", () => {
  it("records a passing suite at nesting 0", () => {
    const ndjson = event("test:pass", {
      name: "suite",
      nesting: 0,
      details: { duration_ms: 100 },
    });
    const { suites } = parseTestEvents(ndjson);
    assert.equal(suites.length, 1);
    assert.deepEqual(suites[0], { name: "suite", passed: true, duration: 100 });
  });

  it("records a failing suite at nesting 0", () => {
    const ndjson = event("test:fail", {
      name: "suite",
      nesting: 0,
      details: { duration_ms: 50 },
    });
    const { suites } = parseTestEvents(ndjson);
    assert.equal(suites[0]?.passed, false);
  });

  it("records a nested test failure with suite name", () => {
    const lines = [
      event("test:pass", { name: "my suite", nesting: 0, details: {} }),
      event("test:fail", {
        name: "broken test",
        nesting: 1,
        details: { error: { message: "boom" } },
      }),
    ].join("\n");
    const { failures } = parseTestEvents(lines);
    assert.equal(failures.length, 1);
    assert.equal(failures[0]?.suite, "my suite");
    assert.equal(failures[0]?.name, "broken test");
    assert.equal(failures[0]?.error, "boom");
  });

  it("ignores test:fail at nesting > 0 before any suite", () => {
    const ndjson = event("test:fail", {
      name: "orphan",
      nesting: 1,
      details: { error: { message: "oops" } },
    });
    const { failures } = parseTestEvents(ndjson);
    assert.equal(failures[0]?.suite, "");
  });

  it("extracts totals from test:diagnostic at nesting 0", () => {
    const lines = [
      event("test:diagnostic", { nesting: 0, message: "pass 7" }),
      event("test:diagnostic", { nesting: 0, message: "fail 2" }),
      event("test:diagnostic", { nesting: 0, message: "skipped 1" }),
      event("test:diagnostic", { nesting: 0, message: "duration_ms 5000" }),
    ].join("\n");
    const result = parseTestEvents(lines);
    assert.equal(result.pass, 7);
    assert.equal(result.fail, 2);
    assert.equal(result.skip, 1);
    assert.equal(result.duration, 5000);
  });

  it("ignores test:diagnostic at nesting > 0", () => {
    const ndjson = event("test:diagnostic", {
      nesting: 1,
      message: "pass 99",
    });
    const { pass } = parseTestEvents(ndjson);
    assert.equal(pass, 0);
  });

  it("skips blank lines without throwing", () => {
    const ndjson = "\n\n" + event("test:pass", { name: "s", nesting: 0 });
    assert.doesNotThrow(() => parseTestEvents(ndjson));
  });
});

describe("renderTestSummary", () => {
  const passing = parseTestEvents(
    [
      event("test:pass", {
        name: "alpha",
        nesting: 0,
        details: { duration_ms: 1000 },
      }),
      event("test:pass", {
        name: "beta",
        nesting: 0,
        details: { duration_ms: 500 },
      }),
      event("test:diagnostic", { nesting: 0, message: "pass 5" }),
      event("test:diagnostic", { nesting: 0, message: "fail 0" }),
      event("test:diagnostic", { nesting: 0, message: "skipped 0" }),
      event("test:diagnostic", { nesting: 0, message: "duration_ms 2000" }),
    ].join("\n"),
  );

  it("shows ✅ when no failures", () => {
    assert.ok(renderTestSummary(passing).includes("✅"));
  });

  it("shows ❌ when there are failures", () => {
    const output = renderTestSummary({ ...passing, fail: 1 });
    assert.ok(output.includes("❌"));
  });

  it("includes suite names as table rows", () => {
    const output = renderTestSummary(passing);
    assert.ok(output.includes("alpha"));
    assert.ok(output.includes("beta"));
  });

  it("formats duration in seconds", () => {
    const output = renderTestSummary(passing);
    assert.ok(output.includes("1.000s"));
    assert.ok(output.includes("0.500s"));
  });

  it("omits failures section when there are none", () => {
    assert.ok(!renderTestSummary(passing).includes("### Failures"));
  });

  it("includes failures section with error message", () => {
    const data = parseTestEvents(
      [
        event("test:fail", { name: "suite", nesting: 0, details: {} }),
        event("test:fail", {
          name: "case",
          nesting: 1,
          details: { error: { message: "expected 1 to equal 2" } },
        }),
      ].join("\n"),
    );
    const output = renderTestSummary(data);
    assert.ok(output.includes("### Failures"));
    assert.ok(output.includes("expected 1 to equal 2"));
  });
});

describe("parseCoverageSummary", () => {
  const json = JSON.stringify({
    total: {
      statements: { pct: 90, covered: 90, total: 100 },
      branches: { pct: 80, covered: 40, total: 50 },
      functions: { pct: 100, covered: 10, total: 10 },
      lines: { pct: 90, covered: 90, total: 100 },
    },
  });

  it("extracts statements metric", () => {
    const { statements } = parseCoverageSummary(json);
    assert.deepEqual(statements, { pct: 90, covered: 90, total: 100 });
  });

  it("extracts branches metric", () => {
    const { branches } = parseCoverageSummary(json);
    assert.equal(branches.pct, 80);
  });
});

describe("renderCoverageSummary", () => {
  const totals = parseCoverageSummary(
    JSON.stringify({
      total: {
        statements: { pct: 93.18, covered: 670, total: 719 },
        branches: { pct: 85.16, covered: 155, total: 182 },
        functions: { pct: 96.15, covered: 50, total: 52 },
        lines: { pct: 93.18, covered: 670, total: 719 },
      },
    }),
  );

  it("includes all four metrics", () => {
    const output = renderCoverageSummary(totals);
    assert.ok(output.includes("Statements"));
    assert.ok(output.includes("Branches"));
    assert.ok(output.includes("Functions"));
    assert.ok(output.includes("Lines"));
  });

  it("includes percentage values", () => {
    const output = renderCoverageSummary(totals);
    assert.ok(output.includes("93.18%"));
    assert.ok(output.includes("85.16%"));
  });
});

describe("test reporter", () => {
  it("emits test:pass events as JSON lines", async () => {
    const events = [
      { type: "test:pass", data: { name: "x", nesting: 0 } },
    ] as TestEvent[];
    const lines = await collect(reporter(fromArray(events)));
    assert.equal(lines.length, 1);
    assert.deepEqual(JSON.parse(lines[0]!), events[0]);
  });

  it("emits test:fail events", async () => {
    const events = [
      { type: "test:fail", data: { name: "x", nesting: 0 } },
    ] as TestEvent[];
    const lines = await collect(reporter(fromArray(events)));
    assert.equal(lines.length, 1);
  });

  it("emits test:diagnostic events", async () => {
    const events = [
      { type: "test:diagnostic", data: { nesting: 0, message: "pass 1" } },
    ] as TestEvent[];
    const lines = await collect(reporter(fromArray(events)));
    assert.equal(lines.length, 1);
  });

  it("drops test:start and test:enqueue events", async () => {
    const events = [
      { type: "test:start", data: { name: "x", nesting: 0 } },
      { type: "test:enqueue", data: { name: "x", nesting: 0 } },
      { type: "test:pass", data: { name: "x", nesting: 0 } },
    ] as TestEvent[];
    const lines = await collect(reporter(fromArray(events)));
    assert.equal(lines.length, 1);
  });

  it("each emitted line is valid JSON ending with newline", async () => {
    const events = [
      { type: "test:pass", data: { name: "x", nesting: 0 } },
    ] as TestEvent[];
    const lines = await collect(reporter(fromArray(events)));
    assert.ok(lines[0]!.endsWith("\n"));
    assert.doesNotThrow(() => JSON.parse(lines[0]!));
  });
});
