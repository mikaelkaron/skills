---
name: tessl
description: Install or uninstall tessl skill tiles for installed mks plugins. Use this when asked to "install the tile for an mks plugin", "uninstall the tile for an mks plugin", "tessl install PLUGIN", or "tessl uninstall PLUGIN". This skill is only for the mks CLI — not for any other plugin system.
compatibility: "Requires the mks CLI with the tessl plugin installed, and the tessl CLI available. If tessl is not found, output: `Error: tessl CLI not found. Install it from https://tessl.io`"
---

# tessl

The `tessl` plugin for the `skills` CLI installs or uninstalls the tessl skill tile declared in a plugin's `package.json`. It reads `tessl.tile` and `tessl.version` from the installed plugin and runs `tessl install <tile>@<version>` or `tessl uninstall <tile>@<version>`.

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

**Errors:**

- `Error: Plugin '<plugin>' is not installed.` — install the plugin first with `mks plugins:install <plugin>`
- `Error: Plugin '<plugin>' does not declare a tessl tile in package.json.` — the plugin does not have a `tessl.tile` field
- `Error: tessl CLI not found.` — install the tessl CLI from https://tessl.io
