# @mikaelkaron/skills

## What This Is

A monorepo CLI toolkit built on oclif, published to npm as four packages under the `@mikaelkaron` scope. The root package (`@mikaelkaron/skills`) acts as the entry-point CLI, and three sub-packages (`skills-cli`, `skills-cherry-pick-filter`, `skills-tessl`) are independently installable plugins. All packages version in lockstep.

## Core Value

Every push to `main` that contains conventional commits automatically determines the next version, publishes all packages to npm, and creates a GitHub Release — zero manual steps.

## Requirements

### Validated

- ✓ npm workspaces monorepo with 4 packages — existing
- ✓ TypeScript build pipeline (`tsc -b`) — existing
- ✓ Test suite (`node --experimental-strip-types --test`) — existing
- ✓ Lint + format (`oxlint` / `oxfmt`) — existing
- ✓ Conventional commit style on `main` — existing
- ✓ All packages have `publishConfig.access: "public"` — existing

### Active

- [ ] GitHub Actions CI workflow — lint, build, test on every PR and push
- [ ] `release.config.js` — semantic-release config for lockstep versioning across all 4 packages
- [ ] GitHub Actions release workflow — runs semantic-release on `main` merges
- [ ] Publishes all 4 packages to npm in a single release run
- [ ] Creates GitHub Release with tag (`v{version}`) and generated changelog
- [ ] Supports `beta` branch as a prerelease channel
- [ ] `CHANGELOG.md` updated and committed back on each release

### Out of Scope

- Independent per-package versioning — lockstep chosen to match current state and keep it simple
- GitLab CI — migrating entirely to GitHub Actions
- Manual release triggers — fully automated on push to `main`

## Context

- **Reference implementation**: `https://gitlab.com/xmachin-es/xmachines-js` uses `@semantic-release/gitlab`, `@semantic-release/npm`, `@semantic-release/git`, `@semantic-release/changelog`. This project uses the same plugin set with `@semantic-release/github` replacing `@semantic-release/gitlab`.
- **Tag format**: `v{version}` (standard GitHub convention, not `{name}@{version}` used in the GitLab monorepo since we're doing lockstep not per-package).
- **Commit-back pattern**: semantic-release commits `CHANGELOG.md` and updated `package.json` files back to `main` with `[skip ci]` to prevent recursive workflow runs.
- **npm access**: All 4 packages are already configured `publishConfig.access: "public"` — needs `NPM_TOKEN` secret in GitHub repo settings.
- **GitHub token**: semantic-release needs `GITHUB_TOKEN` (auto-provided in Actions) with write permissions for releases and contents.
- **Package manager**: npm workspaces (not pnpm).

## Constraints

- **Tech stack**: semantic-release ecosystem — no alternative release tools
- **Versioning**: lockstep — one version bump covers all 4 packages in one release run
- **Node**: >=22.18 (matches existing `engines` field)
- **Branches**: `main` (stable) and `beta` (prerelease) — matches GitLab reference

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `@semantic-release/github` over `@semantic-release/gitlab` | Target repo is on GitHub | — Pending |
| Lockstep versioning | All packages at same version today; simpler than per-package | — Pending |
| `release.config.mjs` (ES module) at root | Named `allPlugins` export enables unit testing of plugin list | — Pending |
| Multiple `@semantic-release/npm` with `pkgRoot` | Confirmed working in reference repo (20+ packages); one entry per published package | — Pending |
| `scripts/set-workspace-versions.mjs` via arborist | Handles version bumping + cross-workspace dep alignment; ported from reference | — Pending |
| `SEMREL_SKIP_STEPS` env var filter | Allows skipping broken packages or retrying publish-only without re-running everything | — Pending |
| `[skip ci]` at end of commit body | GitHub parses full message; trailing placement confirmed by reference | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-26 — Phase 02 complete (GitHub Actions workflows established: release.yml with 9 skip inputs, ci.yml with lint→build→test→coverage pipeline; test.yml deleted)*
