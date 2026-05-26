import { existsSync, readFileSync, writeFileSync } from "node:fs";

if (!existsSync("test-results.xml")) process.exit(0);

const xml = readFileSync("test-results.xml", "utf8");

// Find content inside <undefined name="root">...</undefined>
const undefMatch = xml.match(/<undefined[^>]*>([\s\S]*?)<\/undefined>/);
if (!undefMatch) process.exit(0); // already valid structure

/** Extract top-level elements from an XML fragment, tracking tag depth. */
function extractTopLevel(src: string): Array<{ tag: string; text: string }> {
  const results: Array<{ tag: string; text: string }> = [];
  let depth = 0;
  let start = -1;
  let tagName = "";
  let i = 0;

  while (i < src.length) {
    const lt = src.indexOf("<", i);
    if (lt === -1) break;
    if (src.startsWith("<!--", lt)) {
      i = src.indexOf("-->", lt) + 3;
      continue;
    }
    if (src.startsWith("<?", lt)) {
      i = src.indexOf("?>", lt) + 2;
      continue;
    }

    const gt = src.indexOf(">", lt);
    if (gt === -1) break;

    const raw = src.slice(lt, gt + 1);
    const isClose = src[lt + 1] === "/";
    const isSelfClose = raw.endsWith("/>");

    if (isClose) {
      depth--;
      if (depth === 0 && start !== -1) {
        results.push({ tag: tagName, text: src.slice(start, gt + 1).trim() });
        start = -1;
        tagName = "";
      }
    } else if (isSelfClose) {
      if (depth === 0) {
        results.push({
          tag: raw.match(/^<(\S+)/)?.[1] ?? "",
          text: raw.trim(),
        });
      }
    } else {
      if (depth === 0) {
        start = lt;
        tagName = raw.match(/^<(\S+)/)?.[1] ?? "";
      }
      depth++;
    }

    i = gt + 1;
  }

  return results;
}

const suites: string[] = [];

for (const { tag, text } of extractTopLevel(undefMatch[1])) {
  if (tag === "testsuite") {
    suites.push(text);
  } else if (tag === "testcase") {
    // Node.js JUnit bug: nested describes become <testcase> instead of <testsuite>.
    // Promote to a minimal stub so the parser never receives invalid structure.
    const name = text.match(/name="([^"]*)"/)?.[1] ?? "unknown";
    const time = text.match(/time="([^"]*)"/)?.[1] ?? "0";
    suites.push(
      `<testsuite name="${name}" tests="0" failures="0" errors="0" skipped="0" time="${time}"/>`,
    );
  }
}

const totalTime = suites.reduce((sum, s) => {
  const m = s.match(/time="([^"]*)"/);
  return sum + (m ? parseFloat(m[1]) : 0);
}, 0);

writeFileSync(
  "test-results.xml",
  [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<testsuites time="${totalTime.toFixed(3)}">`,
    ...suites.map((s) => `  ${s}`),
    "</testsuites>",
  ].join("\n") + "\n",
);
