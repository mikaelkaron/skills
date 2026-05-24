# Git Alias

Register a git alias to invoke cherry-pick-filter via `git cherry-pick-filter` instead of `mks cherry-pick-filter`:

```bash
git config alias.cherry-pick-filter '!mks cherry-pick-filter'
```

Verify: `git config alias.cherry-pick-filter` — expected: `!mks cherry-pick-filter`

Use `--global` to register the alias for all repositories on this machine:

```bash
git config --global alias.cherry-pick-filter '!mks cherry-pick-filter'
```
