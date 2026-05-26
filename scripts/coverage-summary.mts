import { appendFileSync, existsSync, readFileSync } from "node:fs";
import {
  parseCoverageSummary,
  renderCoverageSummary,
} from "./lib/coverage-summary.mts";

const path = process.argv[2] ?? "coverage/coverage-summary.json";
if (!existsSync(path)) process.exit(0);

const output = renderCoverageSummary(
  parseCoverageSummary(readFileSync(path, "utf8")),
);
const dest = process.env["GITHUB_STEP_SUMMARY"];
if (dest) appendFileSync(dest, output);
else process.stdout.write(output);
