export interface Metric {
  pct: number;
  covered: number;
  total: number;
}

export interface CoverageTotals {
  statements: Metric;
  branches: Metric;
  functions: Metric;
  lines: Metric;
}

export function parseCoverageSummary(json: string): CoverageTotals {
  const { total } = JSON.parse(json) as { total: CoverageTotals };
  return total;
}

export function renderCoverageSummary({
  statements,
  branches,
  functions,
  lines,
}: CoverageTotals): string {
  const row = (label: string, m: Metric) =>
    `| ${label} | ${m.pct}% | ${m.covered} | ${m.total} |`;

  return [
    "## Coverage",
    "",
    "| Metric | % | Covered | Total |",
    "|--------|---|---------|-------|",
    row("Statements", statements),
    row("Branches", branches),
    row("Functions", functions),
    row("Lines", lines),
    "",
  ].join("\n");
}
