<!-- generated-by: gsd-doc-writer -->

# @mikaelkaron/skills-cli

The core `mks` CLI binary. An oclif-based command runner with built-in plugin management scoped to the `@mikaelkaron/skills-*` namespace.

Part of the [skills monorepo](../../README.md).

## Role in the monorepo

This package is the entry point for the `mks` command. It does not provide any domain commands of its own — its sole purpose is to:

1. Define the oclif CLI configuration (`bin`, `scope`, `pluginPrefix`, `dirname`)
2. Bundle `@oclif/plugin-plugins` as a core plugin so users can install additional skill plugins
3. Expose the `bin/run.js` entry point that the root `@mikaelkaron/skills` package re-exports

The root `@mikaelkaron/skills` package declares `@mikaelkaron/skills-cli` as a dependency and lists it under `oclif.plugins`, so all commands contributed by this package are available when `mks` is installed globally via the root.

## Plugin management commands

Because `@oclif/plugin-plugins` is bundled as a core plugin, the following commands are available out of the box:

```bash
mks plugins                               # list installed plugins
mks plugins:install cherry-pick-filter    # install a plugin by short name
mks plugins:update                        # update all installed plugins
mks plugins:uninstall cherry-pick-filter  # remove a plugin
```

Short names resolve using the configured `scope` (`mikaelkaron`) and `pluginPrefix` (`skills`), so `cherry-pick-filter` expands to `@mikaelkaron/skills-cherry-pick-filter`.

## oclif configuration

| Field          | Value                   |
| -------------- | ----------------------- |
| `bin`          | `mks`                   |
| `id`           | `cli`                   |
| `scope`        | `mikaelkaron`           |
| `pluginPrefix` | `skills`                |
| `dirname`      | `mikaelkaron/skills`    |
| Core plugins   | `@oclif/plugin-plugins` |

## Installation

This package is not intended to be installed directly by end users. Install the root package instead:

```bash
npm install -g @mikaelkaron/skills
```

If you need to install this package in isolation (e.g., for tooling integration):

```bash
npm install @mikaelkaron/skills-cli
```

**Requirements:** Node.js >= 22.18

## Development

### Running tests

From the package directory:

```bash
npm test
```

From the monorepo root (runs all packages):

```bash
npm test
```

With type checking:

```bash
npm run test:types
```

### Publishing

The `oclif.manifest.json` file is generated automatically on `prepublishOnly` and removed after `postpublish`. Do not commit it manually.

```bash
npm publish
```
