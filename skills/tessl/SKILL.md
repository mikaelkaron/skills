---
name: mks-tessl
description: Install, uninstall, or list tessl skill tiles for installed mks plugins. Use this when asked to "install the tile for an mks plugin", "uninstall the tile for an mks plugin", "list tiles for an mks plugin", "tessl install PLUGIN", "tessl uninstall PLUGIN", or "tessl list". This skill is only for the mks CLI — not for any other plugin system.
compatibility: "Requires the mks CLI with the tessl plugin installed, and the tessl CLI available. If tessl is not found, output: `Error: tessl CLI not found. Install it from https://tessl.io`"
---

# tessl

## Setup

Install the tessl plugin once per machine:

```bash
mks plugins:install tessl
```

Verify: `mks tessl --help` — expected: command help output.

If the plugin is not installed, output: `Error: Plugin 'tessl' is not installed. Run: mks plugins:install tessl`

## Usage

### Install

```bash
mks tessl:install <plugin> [plugin...] [flags]
```

| Argument | Required | Description                                                          |
| -------- | -------- | -------------------------------------------------------------------- |
| `plugin` | Yes      | Installed plugin name(s) (the oclif `id`, e.g. `cherry-pick-filter`) |

| Flag                | Short | Description                                                      |
| ------------------- | ----- | ---------------------------------------------------------------- |
| `--global`          | `-g`  | Install tiles globally to `~/.tessl/` instead of current project |
| `--yes`             |       | Skip confirmation prompts and auto-select all skills             |
| `--verbose`         | `-v`  | Show detailed warning messages during installation               |
| `--accept-warnings` |       | Pre-accept install policy warnings (no interactive prompt)       |
| `--agent <agent>`   |       | Override agents to install for (repeatable)                      |

```bash
mks tessl:install cherry-pick-filter
mks tessl:install tessl
mks tessl:install cherry-pick-filter tessl
mks tessl:install cherry-pick-filter --global
mks tessl:install cherry-pick-filter --yes --verbose
mks tessl:install cherry-pick-filter --agent claude-code --agent cursor
```

Verify: check that the tile appears in the project's `.tessl/` directory (or `~/.tessl/` when `--global` is used).

### Uninstall

```bash
mks tessl:uninstall <plugin> [plugin...] [flags]
```

| Argument | Required | Description                                                          |
| -------- | -------- | -------------------------------------------------------------------- |
| `plugin` | Yes      | Installed plugin name(s) (the oclif `id`, e.g. `cherry-pick-filter`) |

| Flag       | Short | Description                                                        |
| ---------- | ----- | ------------------------------------------------------------------ |
| `--global` | `-g`  | Uninstall tiles from global `~/.tessl/` instead of current project |

```bash
mks tessl:uninstall cherry-pick-filter
mks tessl:uninstall tessl
mks tessl:uninstall cherry-pick-filter tessl
mks tessl:uninstall cherry-pick-filter --global
```

Verify: check that the tile is no longer present in the project's `.tessl/` directory (or `~/.tessl/` when `--global` is used).

### List

```bash
mks tessl:list [plugin...] [flags]
```

| Argument | Required | Description                                                                  |
| -------- | -------- | ---------------------------------------------------------------------------- |
| `plugin` | No       | Installed plugin name(s) to validate before listing (omit to list all tiles) |

| Flag       | Short | Description                                                   |
| ---------- | ----- | ------------------------------------------------------------- |
| `--global` | `-g`  | List tiles from global `~/.tessl/` instead of current project |

```bash
mks tessl:list
mks tessl:list cherry-pick-filter
mks tessl:list cherry-pick-filter tessl
mks tessl:list --global
```

Verify: output from `tessl list` is displayed without error.

**Errors:**

- `Error: Plugin '<plugin>' is not installed.` — install the plugin first with `mks plugins:install <plugin>`
- `Error: Plugin '<plugin>' does not declare a tessl tile in package.json.` — the plugin does not have a `tessl.tile` field
- `Error: tessl CLI not found.` — install the tessl CLI from https://tessl.io
