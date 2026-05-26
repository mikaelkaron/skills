<!-- generated-by: gsd-doc-writer -->

# Getting Started

This guide walks you through installing the `mks` CLI and running your first command.

---

## Prerequisites

- **Node.js >= 22.18** — check with `node --version`
- **npm** — bundled with Node.js
- **git** — required by the `cherry-pick-filter` command

No other global tools are required to install and use `mks`. The optional `tessl` integration requires the `tessl` CLI, covered in [Using tessl tiles](#using-tessl-tiles).

---

## Installation

Install `mks` globally from npm:

```bash
npm install -g @mikaelkaron/skills
```

Verify the installation:

```bash
mks --version
```

You should see the version string (e.g., `@mikaelkaron/skills/1.0.1`).

---

## First run

List the built-in commands and installed plugins:

```bash
mks help
```

List currently installed plugins:

```bash
mks plugins
```

At a fresh install, only the core plugins (`@oclif/plugin-plugins` and `@mikaelkaron/skills-cli`) are loaded. Feature commands are provided by installable plugins.

---

## Installing a plugin

Plugins are scoped to `@mikaelkaron/skills-*`. Install by short name (omitting the scope and prefix):

```bash
mks plugins install cherry-pick-filter
```

This installs `@mikaelkaron/skills-cherry-pick-filter` from npm and makes the `cherry-pick-filter` command available immediately.

Verify:

```bash
mks cherry-pick-filter --help
```

---

## Running the cherry-pick-filter command

With `cherry-pick-filter` installed, sync your current branch to a target branch while excluding filtered path prefixes:

```bash
mks cherry-pick-filter <target-branch> --filter <path-prefix>
```

Example — sync to a `beta` branch, excluding `.planning/` files:

```bash
mks cherry-pick-filter beta --filter .planning/
```

Preview what would be cherry-picked without applying changes:

```bash
mks cherry-pick-filter beta --filter .planning/ --dry-run
```

Pipe stdout to inspect the picked SHAs:

```bash
mks cherry-pick-filter beta --filter .planning/ | xargs git log --oneline
```

---

## Using tessl tiles

The `tessl` plugin wraps the external `tessl` CLI to install skill tiles for `mks` plugins. It requires the `tessl` binary to be available.

Install the tessl plugin:

```bash
mks plugins install tessl
```

Then install the skill tile for an installed plugin:

```bash
mks tessl:install cherry-pick-filter
```

To install globally (all projects on the machine):

```bash
mks tessl:install cherry-pick-filter --global
```

List installed tiles:

```bash
mks tessl:list
```

---

## Managing plugins

| Command                        | Description                            |
| ------------------------------ | -------------------------------------- |
| `mks plugins`                  | List all installed plugins             |
| `mks plugins install <name>`   | Install a plugin by short name         |
| `mks plugins update`           | Update all installed plugins to latest |
| `mks plugins uninstall <name>` | Remove an installed plugin             |

---

## Common setup issues

**Wrong Node.js version**

`mks` requires Node.js >= 22.18. If you see an error about unsupported syntax or engine version mismatch, check your active Node.js version with `node --version` and upgrade if needed.

**`mks` command not found after install**

The global npm `bin` directory may not be on your `PATH`. Run `npm bin -g` to find the directory and add it to your shell's `PATH`.

**Plugin command not found after install**

oclif loads plugins at startup. If a newly installed plugin's command does not appear in `mks help`, run `mks plugins` to confirm the plugin is listed, then try reopening your terminal session.

**`tessl` binary not found**

The `tessl` plugin requires the `tessl` CLI to be installed and available on `PATH`. Install it separately before running `mks tessl:install`.

---

## Next steps

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — understand how the monorepo and plugin system are structured
- **[CONFIGURATION.md](CONFIGURATION.md)** — TypeScript, linting, formatting, and CI configuration reference
- **Root README** — usage examples for all available commands
