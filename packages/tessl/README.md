<!-- generated-by: gsd-doc-writer -->

# @mikaelkaron/skills-tessl

An `mks` plugin that manages tessl skill tiles for installed `mks` plugins. Reads each plugin's declared `tessl.tile` from its `package.json` and delegates to the `tessl` CLI to install, uninstall, or list tiles.

Part of the [mikaelkaron/skills](https://github.com/mikaelkaron/skills) monorepo.

## Prerequisites

- Node.js >= 22.18
- The `mks` CLI installed globally (`@mikaelkaron/skills`)
- The `tessl` CLI available on `PATH` or resolvable via `which` (install from https://tessl.io)

The `tessl` binary is resolved automatically. To override the path, set the `TESSL_CMD` environment variable:

```bash
TESSL_CMD=/usr/local/bin/tessl mks tessl:install cherry-pick-filter
```

## Installation as an mks plugin

Install this package as an `mks` plugin using the built-in plugin manager:

```bash
mks plugins:install tessl
```

Verify the plugin is registered:

```bash
mks plugins
```

## Commands

### `mks tessl:install <plugin> [plugin...]`

Install the tessl skill tile declared by one or more installed `mks` plugins. The tile reference is read from the plugin's `package.json` `tessl.tile` (and `tessl.version`) field, then passed to `tessl install`.

After a successful install the tile reference is stored in the plugin's state file (`tiles.json` inside the oclif data directory, overridable via `TESSL_STATE_DIR`).

**Flags:**

| Flag                | Short | Description                                                      |
| ------------------- | ----- | ---------------------------------------------------------------- |
| `--global`          | `-g`  | Install tiles to `~/.tessl/` instead of the current project      |
| `--yes`             |       | Skip confirmation prompts and auto-select all skills             |
| `--verbose`         | `-v`  | Show detailed warning messages during installation               |
| `--accept-warnings` |       | Pre-accept install policy warnings without an interactive prompt |
| `--agent <name>`    |       | Override the agent(s) to install for (repeatable)                |

**Examples:**

```bash
# Install the skill tile for the cherry-pick-filter plugin
mks tessl:install cherry-pick-filter

# Install globally and skip confirmation prompts
mks tessl:install cherry-pick-filter --global --yes

# Install for a specific agent
mks tessl:install cherry-pick-filter --agent claude-code

# Install tiles for multiple plugins at once
mks tessl:install cherry-pick-filter tessl
```

### `mks tessl:uninstall <plugin> [plugin...]`

Uninstall the tessl skill tile for one or more installed `mks` plugins. The tile reference is read from the stored state (`tiles.json`), falling back to the plugin's `package.json` declaration if no state entry exists.

**Flags:**

| Flag       | Short | Description                                                     |
| ---------- | ----- | --------------------------------------------------------------- |
| `--global` | `-g`  | Uninstall tiles from `~/.tessl/` instead of the current project |

**Examples:**

```bash
# Uninstall the skill tile for the cherry-pick-filter plugin
mks tessl:uninstall cherry-pick-filter

# Uninstall from the global tessl directory
mks tessl:uninstall cherry-pick-filter --global
```

### `mks tessl:list [plugin...]`

List installed tessl skill tiles. When one or more plugin names are provided, validates that those plugins are installed and have a declared tile before listing.

**Flags:**

| Flag       | Short | Description                                                |
| ---------- | ----- | ---------------------------------------------------------- |
| `--global` | `-g`  | List tiles from `~/.tessl/` instead of the current project |

**Examples:**

```bash
# List all installed tiles
mks tessl:list

# Validate and list the tile for a specific plugin
mks tessl:list cherry-pick-filter

# List tiles from the global directory
mks tessl:list --global
```

## Environment variables

| Variable          | Description                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `TESSL_CMD`       | Override the path to the `tessl` binary (default: resolved via `which`)                   |
| `TESSL_STATE_DIR` | Override the directory where `tiles.json` state is stored (default: oclif data directory) |

## Package.json integration

For a plugin to be manageable by this package, it must declare a `tessl` field in its `package.json`:

```json
{
  "oclif": {
    "id": "my-plugin"
  },
  "tessl": {
    "tile": "owner/tile-name",
    "version": "1.0.0"
  }
}
```

The `tessl:install` command reads `tessl.tile` and `tessl.version` to construct the tile reference (`owner/tile-name@1.0.0`) passed to the `tessl` CLI.

## Testing

Run tests for this package in isolation:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

Type-check test files:

```bash
npm run test:types
```

Tests that invoke the real `tessl` binary are skipped automatically when `tessl` is not found on `PATH`.
