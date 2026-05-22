---
name: tessl
description: Install the tessl skill tile for an installed mks plugin. Use this when asked to "install the tile for an mks plugin" or "tessl install <plugin>". This skill is only for the mks CLI — not for any other plugin system.
compatibility: "Requires the mks CLI with the tessl plugin installed, and the tessl CLI available. If tessl is not found, output: `Error: tessl CLI not found. Install it from https://tessl.io`"
---

# tessl

The `tessl` plugin for the `skills` CLI installs the tessl skill tile declared in a plugin's `package.json`. It reads `tessl.tile` and `tessl.version` from the installed plugin and runs `tessl tile install <tile>@<version>`.

## Setup

Install the tessl plugin once per machine:

```bash
mks plugins install tessl
```

Verify: `mks tessl --help` — expected: command help output.

If the plugin is not installed, output: `Error: Plugin 'tessl' is not installed. Run: mks plugins install tessl`

## Usage

```bash
mks tessl install <plugin>
```

| Argument | Required | Description                                                       |
| -------- | -------- | ----------------------------------------------------------------- |
| `plugin` | Yes      | Installed plugin name (the oclif `id`, e.g. `cherry-pick-filter`) |

```bash
mks tessl install cherry-pick-filter
mks tessl install tessl
```

**Errors:**

- `Error: Plugin '<plugin>' is not installed.` — install the plugin first with `mks plugins install <plugin>`
- `Error: Plugin '<plugin>' does not declare a tessl tile in package.json.` — the plugin does not have a `tessl.tile` field
- `Error: tessl CLI not found.` — install the tessl CLI from https://tessl.io
