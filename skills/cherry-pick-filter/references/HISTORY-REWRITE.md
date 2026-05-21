# One-time History Rewrite

For a final release where filtered paths must not appear anywhere in history
(e.g. removing `.planning/` from `main` before publishing), use
`git filter-repo`. This permanently rewrites every commit SHA — do it once,
on a fresh clone, before force-pushing.

> **Warning:** This breaks all branches and forks that share the rewritten
> history. Every developer must re-clone or rebase after.

## Requirements

```bash
# Install git-filter-repo (one of):
pip install git-filter-repo
brew install git-filter-repo
sudo apt install git-filter-repo

# Or download directly:
curl -sL https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo \
  -o /usr/local/bin/git-filter-repo && chmod +x /usr/local/bin/git-filter-repo
```

## Process

```bash
# 1. Fresh clone — filter-repo requires it
git clone <repo-url> repo-clean
cd repo-clean

# 2. Create backup tags before rewriting
git tag backup/beta-before-filter-repo beta

# 3. Rewrite history — removes .planning/ from every commit on every branch
#    Commits that only touched .planning/ are dropped entirely
git filter-repo --path .planning/ --invert-paths

# 4. Verify — no .planning/ files should appear anywhere
git log --all --full-history -- '.planning/' | head

# 5. Force-push all clean integration branches
git push origin main beta rc pre --force-with-lease

# 6. Personal branches must be rebased onto the rewritten history
#    (all commit SHAs have changed)
git fetch origin
git checkout mikaelkaron/beta
git rebase origin/beta
```

## Multiple filtered paths

```bash
git filter-repo --path .planning/ --path .other/ --invert-paths
```

## Recovery

If something goes wrong, restore from the backup tag:

```bash
git checkout -b beta-restored backup/beta-before-filter-repo
```
