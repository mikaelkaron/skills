---
name: mks-cli
description: Manage the mks CLI and its plugins. Use this when installing, listing, updating, or removing skills plugins (e.g., "install cherry-pick-filter plugin", "list installed plugins", "update plugins").
compatibility: "Requires Node.js 22+ and the @mikaelkaron/skills package installed. If not installed, output: `Error: mks CLI not found. Install it with: npm install -g @mikaelkaron/skills`"
---

# cli

The `mks` CLI is an oclif-based command runner for mikaelkaron skills. Plugins are scoped to `@mikaelkaron/skills-*` and managed via the built-in `plugins` commands.

## Setup

Install the CLI once per machine:

```bash
npm install -g @mikaelkaron/skills
```

Verify: `mks --version` — expected: a semver string.

If `mks` is not found, output: `Error: mks CLI not found. Install it with: npm install -g @mikaelkaron/skills`

## Plugin management

```bash
mks plugins                                       # list installed plugins
mks plugins:install <plugin>                      # install a plugin
mks plugins:update                                # update all installed plugins
mks plugins:uninstall <plugin>                    # uninstall a plugin
mks plugins:link <dir>                            # link a local plugin directory (dev)
```

The CLI scope is `mikaelkaron` and pluginPrefix is `skills`, so plugins can be installed by short name:

```bash
mks plugins:install cherry-pick-filter
mks plugins:install tessl
mks plugins:uninstall cherry-pick-filter
```

After install/uninstall, run `mks plugins` to confirm. If a plugin is missing after install, verify the name follows `@mikaelkaron/skills-<name>` (e.g. `cherry-pick-filter` → `@mikaelkaron/skills-cherry-pick-filter`).

## Autocomplete

```bash
mks autocomplete [bash|zsh|powershell]   # display shell-specific setup instructions
mks autocomplete -r                      # refresh the autocomplete cache
```

Follow the printed instructions to add the hook to your shell profile.

## Help

```bash
mks help                     # list all top-level commands
mks help [command]           # show detailed help for a command
mks help --nested-commands   # show all commands including subcommands
mks [command] --help         # shorthand: show help for a specific command
```

Use `mks help plugins` to see the full plugins subcommand list, or `mks help autocomplete` for autocomplete setup details.
