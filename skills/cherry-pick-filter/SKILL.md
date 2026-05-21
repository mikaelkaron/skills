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
the user resolves them. Binary files are treated the same as text files — they
are filtered or included based on their path prefix.

## Phase 1: Initial Setup

Register the alias once per machine. Project-scoped (recommended) uses a repo-relative path; global requires an absolute path.

```bash
# Project-scoped (stored in .git/config)
git config alias.cherry-pick-filter '!.agents/skills/cherry-pick-filter/scripts/cherry-pick-filter.mjs'

# Global (stored in ~/.gitconfig — use absolute path)
git config --global alias.cherry-pick-filter '!/absolute/path/to/.agents/skills/cherry-pick-filter/scripts/cherry-pick-filter.mjs'
```

Verify: `git config alias.cherry-pick-filter` — expected: `!.agents/skills/cherry-pick-filter/scripts/cherry-pick-filter.mjs`

If the alias is not found, output: `Error: Alias not registered. Please follow the setup instructions above.`

To remove: `git config --unset alias.cherry-pick-filter` (add `--global` for the global alias).

## Phase 2: Usage

```bash
git cherry-pick-filter <target-branch> --filter <prefix> [--filter <prefix>...] [--dry-run]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `target-branch` | Yes | Branch to cherry-pick code commits onto |
| `--filter <prefix>` | Yes (repeatable) | Path prefix to filter out. No default — always provide explicitly. |
| `--dry-run` | No | Analyse and report without cherry-picking |

### Error handling

- **Missing target branch**: If no target branch is provided, output: `Error: Target branch is required.`
- **Invalid branch name**: If the target branch does not exist, output: `Error: Target branch '<branch>' not found.`
- **Missing filter**: If no `--filter` argument is provided, output: `Error: At least one --filter prefix is required.`

### Examples

```bash
# Sync mikaelkaron/beta → beta, filtering .planning/
git cherry-pick-filter beta --filter .planning/

# Filter multiple directories
git cherry-pick-filter beta --filter .planning/ --filter .agents/

# Preview what would be picked without applying
git cherry-pick-filter beta --filter .planning/ --dry-run
```

## Phase 3: Commit Analysis

**Step 1 — Git filters candidates**

Git's native pathspec exclusion removes commits where _all_ changed files match
a filter prefix:

```
git log <target>..HEAD --reverse -- ':!.planning/'
```

Commits that only touch `.planning/` are excluded. Code-only commits are
included. Mixed commits (both filtered and code files) are also included and
caught in Step 2.

If no commits match the filter criteria, output: `No commits to cherry-pick.` and exit successfully.

**Step 2 — Sanity check all candidates**

Every candidate commit is inspected before any cherry-pick runs. If any commit
touches both filtered and unfiltered files, the entire operation is aborted and
all mixed commits are reported at once.

## Phase 4: Cherry-pick Execution

Only runs if all candidates are clean. Commits are applied oldest-first. A
single conflict aborts the operation with recovery instructions.

## Pipable output

All human-readable output (headers, analysis, errors, summary) goes to stderr.
stdout emits the full SHA of each picked commit (one per line) — but only when
stdout is piped or redirected (not a TTY). When running interactively, stdout
is suppressed so the terminal shows only the clean stderr output.

```bash
# Page through output interactively — works cleanly, no SHA noise
git cherry-pick-filter beta --filter .planning/ 2>&1 | less

# Capture picked SHAs (stdout is piped, so SHAs are emitted)
git cherry-pick-filter beta --filter .planning/ | xargs git log --oneline

# Count picked commits
git cherry-pick-filter beta --filter .planning/ | wc -l

# Separate streams: SHAs to file, human output to log
git cherry-pick-filter beta --filter .planning/ > picked.txt 2> sync.log
```

## Phase 5: Workflow Integration

```
1. Work freely on your personal branch (code + filtered dirs freely mixed)
2. Run: git cherry-pick-filter beta --filter .planning/
3. git push origin beta
4. Open or update MR: personal branch is your full history, beta is the PR branch
5. Get review comments, implement fixes on personal branch
6. Run: git cherry-pick-filter beta --filter .planning/  (only new commits are added)
7. git push origin beta
8. Repeat until merged
```

The script is incremental — running it multiple times is safe. It only picks
commits not yet on the target branch.

## Phase 6: Handling Mixed Commits

If a commit touches both filtered and unfiltered files, the script stops
and reports all mixed commits before doing anything:

```
Mixed commits detected — fix these before syncing:

  3c75377 refactor: rename something
    In filter:  .planning/config.json
    Outside:    src/foo.ts

Split each commit with:
  git rebase -i 3c75377^

Then re-run: git cherry-pick-filter beta --filter .planning/
```

Split the commit using interactive rebase, then re-run the script.

## Phase 7: Resolving Cherry-pick Conflicts

If a cherry-pick conflicts, the script stops immediately:

```
Cherry-pick failed: a1b2c3d feat(play-router): introduce PlayActor

Resolve the conflict then run:
  git cherry-pick --continue
  git cherry-pick --abort   (to cancel)
```

Resolve the conflict manually, then continue if the conflict is resolved or abort if it cannot be resolved. If conflicts persist and cannot be resolved, abort the operation to restore the branch to its previous state:

```bash
git cherry-pick --abort
```

## Phase 8: One-time History Rewrite

To permanently remove filtered paths from all of git history before publishing,
see [HISTORY-REWRITE.md](references/HISTORY-REWRITE.md).
