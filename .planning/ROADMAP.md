# Roadmap: @mikaelkaron/skills — Automated Releases

## Overview

Two phases deliver zero-manual-step releases. Phase 1 builds and validates the release configuration core: dependencies, workspace version scripts, and `release.config.mjs`. Phase 2 wires up GitHub Actions so every push to `main` (and `beta`) triggers the full automated pipeline.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Release Config** - Install deps, port workspace scripts, author release.config.mjs, validate with dry-run (completed 2026-05-25)
- [x] **Phase 2: GitHub Actions** - Author release.yml and ci.yml, wire tokens and permissions (completed 2026-05-25)

## Phase Details

### Phase 1: Release Config

**Goal**: The release configuration is complete and verified: all dependencies installed, workspace version scripts in place, and `release.config.mjs` passes a semantic-release dry-run without publishing
**Depends on**: Nothing (first phase)
**Requirements**: DEP-01, DEP-02, SCR-01, SCR-02, REL-01, REL-02, REL-03, REL-04, REL-05, REL-06, REL-07, REL-08, REL-09
**Success Criteria** (what must be TRUE):

1. `npx semantic-release --dry-run` completes without error (with git/github/npm steps skipped via `SEMREL_SKIP_STEPS`)
2. `release.config.mjs` exports `allPlugins` (named) and a default config — both importable in a test script
3. `node scripts/set-workspace-versions.mjs <version>` updates all 4 `package.json` version fields without error
4. `SEMREL_SKIP_STEPS` regex filter correctly suppresses matching plugins when the env var is set

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Install devDependencies (DEP-01, DEP-02) and write failing test scaffold (Wave 0 RED gate)

**Wave 2** _(blocked on Wave 1 completion)_

- [x] 01-02-PLAN.md — TDD: implement release.config.mjs (REL-01..REL-09)
- [x] 01-03-PLAN.md — Write workspace scripts: lib/workspace.mjs and set-workspace-versions.mjs (SCR-01, SCR-02)

**Wave 3** _(blocked on Wave 2 completion)_

- [x] 01-04-PLAN.md — Dry-run validation checkpoint: full test suite + semantic-release --dry-run

### Phase 2: GitHub Actions

**Goal**: A manual `workflow_dispatch` on any of `main`, `alpha`, `beta`, or `rc-*` runs semantic-release and publishes all 4 packages; CI guards every push and PR automatically
**Depends on**: Phase 1
**Requirements**: GHA-01, GHA-02, GHA-03, GHA-04, GHA-05, GHA-06, GHA-07, GHA-08, GHA-09, CI-01, CI-02, CI-03
**Success Criteria** (what must be TRUE):

1. A `workflow_dispatch` on `main` runs semantic-release to completion and publishes all 4 packages to `@latest`
2. A `workflow_dispatch` on `beta` produces a prerelease (e.g. `0.7.0-beta.1`) published to `@beta`
3. A `workflow_dispatch` on an `rc-*` branch produces a prerelease (e.g. `0.7.0-rc.1`) published to `@rc`
4. `ci.yml` runs lint, build, and test on every pull request and push; `[skip ci]` commits are skipped
5. `workflow_dispatch` presents per-step boolean checkboxes; checking `skip_tessl` causes the `@semantic-release/npm:packages/tessl` step to be skipped

**Plans**: 3 plans
Plans:
**Wave 0**

- [x] 02-00-PLAN.md — TDD Wave 0: install js-yaml devDep + write test/workflows.test.ts with RED structural assertions (GHA-01..GHA-09, CI-01..CI-03)

**Wave 1** _(blocked on Wave 0 completion)_

- [x] 02-01-PLAN.md — Author .github/workflows/release.yml: two-job setup→release pattern, SEMREL_SKIP_STEPS assembly, branch guard, permissions (GHA-01..GHA-09)

**Wave 2** _(blocked on Wave 1 completion)_

- [x] 02-02-PLAN.md — Author .github/workflows/ci.yml and delete test.yml: lint/build/test/coverage, [skip ci] guard, lcov PR comment (CI-01..CI-03)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase             | Plans Complete | Status      | Completed  |
| ----------------- | -------------- | ----------- | ---------- |
| 1. Release Config | 4/4            | Complete    | 2026-05-25 |
| 2. GitHub Actions | 3/3 | Complete   | 2026-05-25 |
