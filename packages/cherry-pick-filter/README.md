<!-- generated-by: gsd-doc-writer -->

# @mikaelkaron/skills-cherry-pick-filter

Sync a working branch to a clean target branch by cherry-picking commits that don't touch filtered path prefixes.

Part of the [skills monorepo](../../README.md).

## What it does

`mks-cherry-pick-filter` analyses commits on your current branch that are not yet on the target branch, then:

1. **Skips** commits where every changed file matches a filtered path prefix (e.g. `.planning/` notes, AI context files).
2. **Picks** the remaining code-only commits onto the target branch in order.
3. **Halts** before picking anything if it finds mixed commits — commits that touch both filtered paths and code paths — and reports exactly which files to split.

Human-readable output goes to stderr. When stdout is piped (not a TTY), one picked commit SHA is written per line, making it easy to chain with other git commands.

## Installation

```bash
npm install @mikaelkaron/skills-cherry-pick-filter
```

Requires Node.js >= 22.18 and `git` on `PATH`.

### As an mks plugin

If you use the `mks` CLI from this monorepo, install the package and it will be picked up automatically as the `cherry-pick-filter` plugin.

## Usage

```
mks-cherry-pick-filter <targetBranch> --filter <prefix> [--filter <prefix>] [--dry-run]
```

### Arguments

| Argument       | Description                                        |
| -------------- | -------------------------------------------------- |
| `targetBranch` | Branch to cherry-pick code commits onto (required) |

### Flags

| Flag                | Description                                                                                                                                          | Default      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `--filter <prefix>` | Path prefix to filter out. Repeatable. Commits where ALL changed files match are skipped; commits where SOME files match cause the command to abort. | — (required) |
| `--dry-run`         | Analyse and list commits without cherry-picking                                                                                                      | `false`      |

## Examples

Sync current branch to `beta`, filtering out `.planning/` commits:

```bash
mks-cherry-pick-filter beta --filter .planning/
```

Filter multiple path prefixes:

```bash
mks-cherry-pick-filter beta --filter .planning/ --filter .agents/
```

Dry run — analyse without cherry-picking:

```bash
mks-cherry-pick-filter beta --filter .planning/ --dry-run
```

Capture picked SHAs for downstream use:

```bash
mks-cherry-pick-filter beta --filter .planning/ | xargs git log --oneline
```

## Mixed commit detection

If a commit touches files both inside and outside the filter prefixes, the command:

- Lists every such commit with its filtered files and code files.
- Exits without cherry-picking anything.
- Prints the `git rebase -i` command to split each mixed commit.

Resolve all mixed commits first, then re-run.

## Branch resolution

If `targetBranch` does not exist locally, the command checks `origin` and automatically tracks it before proceeding. If it is not found there either, the command exits with an error.

## Environment

| Variable  | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `GIT_CMD` | Override the `git` executable path (defaults to `which git`) |

## Running tests

```bash
npm test
```

Tests use a bundled fixture repository (`test/fixtures/repo.bundle`) and run against the compiled output.
