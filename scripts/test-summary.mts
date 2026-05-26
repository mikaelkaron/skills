import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { parseTestEvents, renderTestSummary } from "./lib/test-summary.mts";

const path = process.argv[2] ?? "test-results.ndjson";
if (!existsSync(path)) process.exit(0);

const output = renderTestSummary(parseTestEvents(readFileSync(path, "utf8")));
const dest = process.env["GITHUB_STEP_SUMMARY"];
if (dest) appendFileSync(dest, output);
else process.stdout.write(output);
