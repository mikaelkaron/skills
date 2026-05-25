---
name: mks-cherry-pick-filter
description: Sync a working branch to a clean merge branch by cherry-picking commits that don't touch filtered paths. Use this script only when syncing branches to beta/main during PR preparation or updates (e.g., "sync to beta", "cherry-pick to beta", "update PR branch").
compatibility: "Requires Node.js 22+ and git. If Node.js version is below 22, output: `Error: Node.js 22+ is required. Please upgrade your Node.js version.`"
---

# cherry-pick-filter

Incrementally cherry-picks commits from the current branch onto a target branch,
skipping commits where all changed files match filtered path prefixes. Mixed
commits (code + filtered files in the same commit) are detected by analyzing
all commits first, then reported together, and the operation is halted until
the user resolves them.

## Setup

Install the mks CLI and add the cherry-pick-filter plugin — once per machine:

```bash
npm install -g @mikaelkaron/skills
mks plugins install cherry-pick-filter
```

Optionally register a git alias for a shorter invocation — see [GIT-ALIAS.md](references/GIT-ALIAS.md).

## Usage

```bash
mks cherry-pick-filter <target-branch> --filter <prefix> [--filter <prefix>...] [--dry-run]
```

| Argument            | Required         | Description                                                        |
| ------------------- | ---------------- | ------------------------------------------------------------------ |
| `target-branch`     | Yes              | Branch to cherry-pick code commits onto                            |
| `--filter <prefix>` | Yes (repeatable) | Path prefix to filter out. No default — always provide explicitly. |
| `--dry-run`         | No               | Analyse and report without cherry-picking                          |

**Errors:**

- `Error: Target branch is required.` — no target branch provided
- `Error: Target branch '<branch>' not found.` — branch does not exist
- `Error: At least one --filter prefix is required.` — no `--filter` provided

```bash
mks cherry-pick-filter beta --filter .planning/
mks cherry-pick-filter beta --filter .planning/ --filter .agents/
mks cherry-pick-filter beta --filter .planning/ --dry-run
```

All human-readable output goes to stderr. stdout emits one picked commit SHA per line — but only when piped (not a TTY):

```bash
# Capture picked SHAs
mks cherry-pick-filter beta --filter .planning/ | xargs git log --oneline
```

## Workflow

```
1. Work freely on your personal branch (code + filtered dirs freely mixed)
2. mks cherry-pick-filter beta --filter .planning/
3. git push origin beta
4. Open or update PR: personal branch is your full history, beta is the PR branch
5. Implement fixes on personal branch, then repeat from step 2
```

## Troubleshooting

**Mixed commits** — if a commit touches both filtered and unfiltered files, the script stops and reports all mixed commits:

```
Mixed commits detected — fix these before syncing:

  3c75377 refactor: rename something
    In filter:  .planning/config.json
    Outside:    src/foo.ts

Split each commit with:
  git rebase -i 3c75377^

Then re-run: mks cherry-pick-filter beta --filter .planning/
```

**Cherry-pick conflicts** — the script stops immediately:

```
Cherry-pick failed: a1b2c3d feat(play-router): introduce PlayActor

Resolve the conflict then run:
  git cherry-pick --continue
  git cherry-pick --abort   (to cancel)
```

**One-time history rewrite** — to permanently remove filtered paths from all of git history before publishing, see [HISTORY-REWRITE.md](references/HISTORY-REWRITE.md).
