# skills

A collection of agent skills for use in projects.

## Skills

### [cherry-pick-filter](skills/cherry-pick-filter/)

Syncs a working branch to a clean target branch by incrementally cherry-picking commits that don't touch filtered path prefixes. Useful for keeping a PR branch clean when your personal branch freely mixes code and planning/agent files.

**Use case:** work freely on your personal branch (code + `.planning/` + `.agents/` etc.), then sync only the code commits to a clean PR branch.

```bash
git cherry-pick-filter beta --filter .planning/
git cherry-pick-filter beta --filter .planning/ --filter .agents/ --dry-run
```

See [SKILL.md](skills/cherry-pick-filter/SKILL.md) for full setup and usage documentation.

## Usage

Skills are meant to be copied or referenced into a project's `.agents/skills/` directory. Each skill directory contains:

- `SKILL.md` — documentation and instructions for the skill
- One or more script files implementing the skill

## Requirements

- Node.js 22+
- git
