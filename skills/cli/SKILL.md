---
name: cli
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

**Errors:**

- `Error: mks CLI not found.` — CLI is not installed; run `npm install -g @mikaelkaron/skills`
- Plugin not found errors — verify the package name follows `@mikaelkaron/skills-<name>` convention
