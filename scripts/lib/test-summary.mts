interface EventData {
  name: string;
  nesting: number;
  details?: { duration_ms?: number; error?: { message?: string } };
  message?: string;
}

export interface Suite {
  name: string;
  passed: boolean;
  duration: number;
}

export interface Failure {
  name: string;
  suite: string;
  error: string;
}

export interface ParsedTests {
  suites: Suite[];
  failures: Failure[];
  pass: number;
  fail: number;
  skip: number;
  duration: number;
}

export function parseTestEvents(ndjson: string): ParsedTests {
  const suites: Suite[] = [];
  const failures: Failure[] = [];
  const totals: Record<string, string> = {};
  let currentSuite = "";

  for (const line of ndjson.split("\n")) {
    if (!line.trim()) continue;
    const { type, data } = JSON.parse(line) as {
      type: string;
      data: EventData;
    };

    if ((type === "test:pass" || type === "test:fail") && data.nesting === 0) {
      currentSuite = data.name;
      suites.push({
        name: data.name,
        passed: type === "test:pass",
        duration: data.details?.duration_ms ?? 0,
      });
    }

    if (type === "test:fail" && data.nesting > 0) {
      failures.push({
        name: data.name,
        suite: currentSuite,
        error: data.details?.error?.message ?? "unknown error",
      });
    }

    if (type === "test:diagnostic" && data.nesting === 0) {
      const m = /^(\S+)\s+(.+)$/.exec(data.message ?? "");
      if (m) totals[m[1]] = m[2];
    }
  }

  return {
    suites,
    failures,
    pass: parseInt(totals["pass"] ?? "0"),
    fail: parseInt(totals["fail"] ?? "0"),
    skip: parseInt(totals["skipped"] ?? "0"),
    duration: parseFloat(totals["duration_ms"] ?? "0"),
  };
}

export function renderTestSummary({
  suites,
  failures,
  pass,
  fail,
  skip,
  duration,
}: ParsedTests): string {
  const out: string[] = [
    "## Test Results",
    "",
    `${fail > 0 ? "❌" : "✅"} **${pass} passed** · ${fail} failed · ${skip} skipped — ${(duration / 1000).toFixed(1)}s`,
    "",
    "| | Suite | Duration |",
    "|-|-------|----------|",
    ...suites.map(
      (s) =>
        `| ${s.passed ? "✅" : "❌"} | ${s.name} | ${(s.duration / 1000).toFixed(3)}s |`,
    ),
  ];

  if (failures.length > 0) {
    out.push("", "### Failures", "");
    for (const f of failures) {
      out.push(`**${f.suite} › ${f.name}**`, "```", f.error, "```", "");
    }
  }

  out.push("");
  return out.join("\n");
}
