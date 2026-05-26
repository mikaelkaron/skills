<!-- generated-by: gsd-doc-writer -->

# skills

A collection of agent skills for use in projects, distributed as tessl skill tiles and managed via the `mks` CLI.

## Installation

Install the `mks` CLI globally once per machine:

```bash
npm install -g @mikaelkaron/skills
```

Verify the installation:

```bash
mks --version
```

**Requirements:** Node.js >= 22.18

## Quick Start

1. Install the CLI (see above).
2. Install a skill plugin:

```bash
mks plugins install cherry-pick-filter
```

3. Install the corresponding tessl skill tile:

```bash
mks tessl:install cherry-pick-filter
```

4. Use the skill:

```bash
mks cherry-pick-filter beta --filter .planning/
```

## Packages

This is a monorepo. Each package under `packages/` is an oclif plugin published independently.

### `@mikaelkaron/skills-cli`

The core `mks` CLI. An oclif-based command runner with built-in plugin management scoped to `@mikaelkaron/skills-*`.

```bash
mks plugins                               # list installed plugins
mks plugins:install cherry-pick-filter    # install a plugin by short name
mks plugins:update                        # update all installed plugins
mks plugins:uninstall cherry-pick-filter  # remove a plugin
```

See [skills/cli/SKILL.md](skills/cli/SKILL.md) for full documentation.

### `@mikaelkaron/skills-cherry-pick-filter`

Syncs a working branch to a clean target branch by incrementally cherry-picking commits that do not touch filtered path prefixes. Mixed commits (touching both code and filtered files) are detected and reported before any cherry-pick is attempted.

**Use case:** work freely on your personal branch — code alongside `.planning/` or `.agents/` files — then sync only the code commits to a clean PR branch.

```bash
mks cherry-pick-filter beta --filter .planning/
mks cherry-pick-filter beta --filter .planning/ --filter .agents/
mks cherry-pick-filter beta --filter .planning/ --dry-run
```

All human-readable output goes to stderr. When piped, stdout emits one picked commit SHA per line:

```bash
mks cherry-pick-filter beta --filter .planning/ | xargs git log --oneline
```

See [skills/cherry-pick-filter/SKILL.md](skills/cherry-pick-filter/SKILL.md) for full documentation.

### `@mikaelkaron/skills-tessl`

Installs or uninstalls tessl skill tiles for installed `mks` plugins. Reads each plugin's `tessl.tile` field in its `package.json` and delegates to the `tessl` CLI.

```bash
mks tessl:install cherry-pick-filter
mks tessl:install cherry-pick-filter --global
mks tessl:uninstall cherry-pick-filter
mks tessl:list
```

Requires the `tessl` CLI to be available. Install the tessl plugin first:

```bash
mks plugins:install tessl
```

See [skills/tessl/SKILL.md](skills/tessl/SKILL.md) for full documentation.

## Skills

The `skills/` directory contains the tessl skill tile definitions — each skill has a `SKILL.md` with documentation and instructions, and a `tile.json` with tile metadata. These are what get installed by `mks tessl:install`.

| Skill directory              | Tile                             | Description                              |
| ---------------------------- | -------------------------------- | ---------------------------------------- |
| `skills/cli/`                | `mikaelkaron/cli`                | Manage the `mks` CLI and its plugins     |
| `skills/cherry-pick-filter/` | `mikaelkaron/cherry-pick-filter` | Sync branches via filtered cherry-pick   |
| `skills/tessl/`              | `mikaelkaron/tessl`              | Manage tessl tiles for installed plugins |

## Development

### Prerequisites

- Node.js >= 22.18
- npm

### Setup

```bash
git clone https://github.com/mikaelkaron/skills.git
cd skills
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

### Lint and Format

```bash
npm run lint
npm run format
```

### Scripts

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run build`         | Compile TypeScript across all packages  |
| `npm test`              | Run all tests (strips types at runtime) |
| `npm run test:coverage` | Run tests with c8 coverage reporting    |
| `npm run test:types`    | Type-check test files                   |
| `npm run lint`          | Lint with oxlint                        |
| `npm run format`        | Format with oxfmt                       |

## License

See [CHANGELOG.md](CHANGELOG.md) for release history.
