---
name: cherry-pick-filter
description: Sync a working branch to a clean merge branch by cherry-picking commits that don't touch filtered paths. Use this script only when syncing branches to beta/main during PR preparation or updates (e.g., "sync to beta", "cherry-pick to beta", "update PR branch").
compatibility: "Requires Node.js 22+ and git. If Node.js version is below 22, output: `Error: Node.js 22+ is required. Please upgrade your Node.js version.`"
---

# cherry-pick-filter

Incrementally cherry-picks commits from the current branch onto a target branch,
skipping commits where all changed files match filtered path prefixes. Mixed
commits (code + filtered files in the same commit) are detected by analyzing
all commits first, then reported together, and the operation is halted until
the user resolves them.

## Available scripts

- **`scripts/cherry-pick-filter.mjs`** — Main entry point. Parses CLI arguments, resolves and validates the target branch (checking out from origin if needed), identifies candidate commits via git pathspec exclusion, detects mixed commits in a pre-flight sanity check, then cherry-picks all clean candidates oldest-first onto the target branch. Emits picked SHAs on stdout when piped; all human-readable output goes to stderr.

## Setup

Register the alias once per machine. Project-scoped (recommended) uses a repo-relative path; global requires an absolute path.

```bash
# Project-scoped (stored in .git/config)
git config alias.cherry-pick-filter '!.agents/skills/cherry-pick-filter/scripts/cherry-pick-filter.mjs'

# Global (stored in ~/.gitconfig — use absolute path)
git config --global alias.cherry-pick-filter '!/absolute/path/to/.agents/skills/cherry-pick-filter/scripts/cherry-pick-filter.mjs'
```

Verify: `git config alias.cherry-pick-filter` — expected: `!.agents/skills/cherry-pick-filter/scripts/cherry-pick-filter.mjs`

If the alias is not found, output: `Error: Alias not registered. Please follow the setup instructions above.`

## Usage

```bash
git cherry-pick-filter <target-branch> --filter <prefix> [--filter <prefix>...] [--dry-run]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `target-branch` | Yes | Branch to cherry-pick code commits onto |
| `--filter <prefix>` | Yes (repeatable) | Path prefix to filter out. No default — always provide explicitly. |
| `--dry-run` | No | Analyse and report without cherry-picking |

**Errors:**
- `Error: Target branch is required.` — no target branch provided
- `Error: Target branch '<branch>' not found.` — branch does not exist
- `Error: At least one --filter prefix is required.` — no `--filter` provided

```bash
git cherry-pick-filter beta --filter .planning/
git cherry-pick-filter beta --filter .planning/ --filter .agents/
git cherry-pick-filter beta --filter .planning/ --dry-run
```

All human-readable output goes to stderr. stdout emits one picked commit SHA per line — but only when piped (not a TTY):

```bash
# Capture picked SHAs
git cherry-pick-filter beta --filter .planning/ | xargs git log --oneline
```

## Workflow

```
1. Work freely on your personal branch (code + filtered dirs freely mixed)
2. git cherry-pick-filter beta --filter .planning/
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

Then re-run: git cherry-pick-filter beta --filter .planning/
```

**Cherry-pick conflicts** — the script stops immediately:

```
Cherry-pick failed: a1b2c3d feat(play-router): introduce PlayActor

Resolve the conflict then run:
  git cherry-pick --continue
  git cherry-pick --abort   (to cancel)
```

**One-time history rewrite** — to permanently remove filtered paths from all of git history before publishing, see [HISTORY-REWRITE.md](references/HISTORY-REWRITE.md).
