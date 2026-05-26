<!-- generated-by: gsd-doc-writer -->

# Testing

## Test framework and setup

Tests run with the **Node.js built-in test runner** (`node:test`), available in Node.js 22 and later. No additional test framework package is required. Type-stripping via `--experimental-strip-types` allows TypeScript test files to be executed directly without a separate compilation step.

Before running tests, the project must be built:

```bash
npm run build
```

This is automated via the `pretest` and `pretest:coverage` lifecycle hooks, so a plain `npm test` will build first automatically.

Required Node.js version: `>= 22.18`

## Running tests

### Full test suite

```bash
npm test
```

Runs all `*.test.ts` files matching `packages/*/test/**/*.test.ts` and `test/**/*.test.ts` using the default spec reporter to stdout.

### With coverage

```bash
npm run test:coverage
```

Runs the same test files under `c8` for coverage collection. Produces three report formats:

| Format         | Output                            |
| -------------- | --------------------------------- |
| `text`         | Console summary printed to stdout |
| `json-summary` | `coverage/coverage-summary.json`  |
| `lcov`         | `coverage/lcov.info`              |

This command also activates the custom NDJSON reporter (see below), writing per-event results to `test-results.ndjson` alongside the spec output to stdout.

### Type checking

```bash
npm run test:types
```

Runs `tsc -p tsconfig.test.json` in `--noEmit` mode. This checks the type correctness of all test files and scripts without producing output files. Covered paths are `packages/*/test/**/*.ts`, `test/**/*.ts`, and `scripts/**/*.mts`.

## Writing new tests

**File naming convention:** `*.test.ts`

**File locations:**

- Root-level tests: `test/**/*.test.ts`
- Package tests: `packages/<name>/test/**/*.test.ts`

Tests use `describe` and `it` from `node:test` and assertions from `node:assert/strict`:

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("my module", () => {
  it("does something", () => {
    assert.equal(actual, expected);
  });
});
```

Test helpers and fixtures are colocated with test files. For example, `packages/cherry-pick-filter/test/fixtures/` contains a `repo.bundle` fixture used by command tests. Package-level `test/lib/` directories hold shared test utilities specific to that package.

## Custom NDJSON reporter

`scripts/reporters/test.mts` is a custom Node.js test reporter that emits one JSON object per line (NDJSON) for `test:pass`, `test:fail`, and `test:diagnostic` events. It writes to `test-results.ndjson` when `npm run test:coverage` is used.

This file is the input to `scripts/test-summary.mts`, which parses the NDJSON and renders a Markdown summary table. Locally the summary prints to stdout; in CI it is appended to `$GITHUB_STEP_SUMMARY` as a GitHub Actions job summary.

Similarly, `scripts/coverage-summary.mts` reads `coverage/coverage-summary.json` and renders a Markdown coverage table to the same step summary destination.

## Coverage requirements

No minimum coverage thresholds are configured. `c8` collects and reports coverage but does not enforce a floor that would fail the build.

## CI integration

Tests run in the `test` job of `.github/workflows/ci.yml`, triggered on pushes to `main`, all pull requests, and manual `workflow_dispatch` events.

**Node.js version used in CI:** 24

CI test job steps in order:

1. `npm ci` — install dependencies
2. `npm run build` — compile TypeScript
3. `npm run test:types` — type-check test files and scripts
4. `npm run test:coverage` — run tests with c8 coverage; writes `test-results.ndjson` and `coverage/`
5. **Test summary** (`if: always()`) — `node --experimental-strip-types scripts/test-summary.mts test-results.ndjson` — posts a pass/fail table to the GitHub Actions job summary
6. **Coverage summary** (`if: always()`) — `node --experimental-strip-types scripts/coverage-summary.mts` — posts a coverage metrics table to the job summary
7. Upload `test-results.ndjson` as the `test-results` artifact
8. Upload `coverage/` directory as the `coverage` artifact

Steps 5–8 run with `if: always()` so summaries and artifacts are available even when tests fail.
