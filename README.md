# skills

A collection of agent skills for use in projects.

## Skills

### [mks-cli](skills/cli/)

Manages the `mks` CLI and its plugins. Use when installing, listing, updating, or removing skills plugins.

```bash
mks plugins install cherry-pick-filter
mks plugins list
mks plugins update
```

See [SKILL.md](skills/cli/SKILL.md) for full setup and usage documentation.

### [mks-cherry-pick-filter](skills/cherry-pick-filter/)

Syncs a working branch to a clean target branch by incrementally cherry-picking commits that don't touch filtered path prefixes. Useful for keeping a PR branch clean when your personal branch freely mixes code and planning/agent files.

**Use case:** work freely on your personal branch (code + `.planning/` + `.agents/` etc.), then sync only the code commits to a clean PR branch.

```bash
mks cherry-pick-filter beta --filter .planning/
mks cherry-pick-filter beta --filter .planning/ --filter .agents/ --dry-run
```

See [SKILL.md](skills/cherry-pick-filter/SKILL.md) for full setup and usage documentation.

### [mks-tessl](skills/tessl/)

Installs or uninstalls tessl skill tiles for installed `mks` plugins.

```bash
mks tessl:install cherry-pick-filter
mks tessl:uninstall cherry-pick-filter
```

See [SKILL.md](skills/tessl/SKILL.md) for full setup and usage documentation.

## Usage

Skills are distributed as tessl skill tiles and installed via the `mks` CLI. Each skill directory contains:

- `SKILL.md` — documentation and instructions for the skill
- `tile.json` — skill tile metadata

## Requirements

- Node.js 22+
- git
