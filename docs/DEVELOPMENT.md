<!-- generated-by: gsd-doc-writer -->

# Development

This guide covers local setup, the build system, adding packages or commands, code style tooling, and the release process for the `@mikaelkaron/skills` monorepo.

## Local Setup

See [GETTING-STARTED.md](GETTING-STARTED.md) for prerequisites and first-run instructions.

For active development, clone and install with:

```bash
git clone https://github.com/mikaelkaron/skills.git
cd skills
npm install
```

Then build all packages:

```bash
npm run build
```

## Build Commands

All commands run from the monorepo root. The root `package.json` scripts apply to all workspaces via TypeScript project references.

| Command                 | Description                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| `npm run build`         | Compile all packages using TypeScript project references (`tsc -b`)           |
| `npm run test`          | Build then run all tests across every package                                 |
| `npm run test:coverage` | Build then run tests with c8 coverage (text, JSON summary, lcov)              |
| `npm run test:types`    | Type-check test and script files without emitting (uses `tsconfig.test.json`) |
| `npm run lint`          | Lint all files with oxlint                                                    |
| `npm run format`        | Format all files with oxfmt                                                   |

Per-package scripts (run from the package directory or with `--workspace`):

```bash
# Build a single package
npm run build --workspace=packages/tessl

# Run tests for a single package
npm run test --workspace=packages/cherry-pick-filter

# Type-check a package's test files
npm run test:types --workspace=packages/tessl
```

## Build System: TypeScript Project References

The root `tsconfig.json` declares project references for each package:

```json
{
  "files": [],
  "references": [
    { "path": "packages/cherry-pick-filter" },
    { "path": "packages/tessl" }
  ]
}
```

Each package `tsconfig.json` extends the root config and sets `"composite": true` so `tsc -b` can track incremental builds. Packages that compile TypeScript to JavaScript (`cherry-pick-filter`, `tessl`) set `rootDir: "src"` and `outDir: "dist"`.

## Code Style

**Linter:** oxlint — configured in `oxlint.config.ts` at the repo root.

**Formatter:** oxfmt — configured in `oxfmt.config.ts` at the repo root. Settings: 80-character print width, 2-space indent, double quotes, trailing commas, semicolons.

Run before every commit:

```bash
npm run format
npm run lint
```

CI enforces linting in the `lint` job on every push and pull request. Formatting is not checked by CI — run `npm run format` locally before committing.

## Adding a New Package

1. Create a directory under `packages/`:

   ```bash
   mkdir -p packages/my-skill/src/commands
   ```

2. Add `packages/my-skill/package.json` following the conventions of `packages/tessl/package.json` — include `"type": "module"`, the correct `oclif` block, a `bin` entry, and a `build` script calling `tsc`.

3. Add `packages/my-skill/tsconfig.json` extending the root config with `"composite": true`, `"rootDir": "src"`, and `"outDir": "dist"`.

4. Register the package in the root `tsconfig.json` `references` array.

5. Run `npm install` to update the lockfile and register the new workspace.

6. If the new package should be loaded by the `mks` CLI, add it to the root `package.json` `oclif.plugins` array and add it as a dependency.

## Adding a New Command to an Existing Package

Commands follow the oclif pattern. Add a TypeScript file under `packages/<name>/src/commands/`:

```typescript
// packages/my-skill/src/commands/my-command.ts
import { Command, Flags } from "@oclif/core";

export default class MyCommand extends Command {
  static description = "What this command does";

  static flags = {
    example: Flags.string({ description: "An example flag" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(MyCommand);
    this.log(`Running with: ${flags.example}`);
  }
}
```

After adding the file, run `npm run build` and then regenerate the oclif manifest:

```bash
npm run build
npx oclif manifest .   # from the package directory
```

## CI Workflow

CI runs on every push to `main` and on all pull requests (`.github/workflows/ci.yml`).

**lint job** — installs dependencies with `npm ci`, then runs `npm run lint`.

**test job** — installs dependencies, then sequentially:

1. `npm run build` — compiles all packages
2. `npm run test:types` — type-checks test and script files
3. `npm run test:coverage` — runs all tests with c8 coverage collection
4. Generates a test summary and a coverage summary using scripts in `scripts/`
5. Uploads `test-results.ndjson` and the `coverage/` directory as workflow artifacts

## Release Process

Releases are triggered manually via the `Release` workflow (`.github/workflows/release.yml`). The workflow uses semantic-release to determine the next version from conventional commit messages.

**Supported release branches:**

| Branch  | npm tag  |
| ------- | -------- |
| `main`  | `latest` |
| `pre`   | `pre`    |
| `alpha` | `alpha`  |
| `beta`  | `beta`   |
| `rc`    | `rc`     |

**Release steps (in order):**

1. Analyze commits to determine the next version.
2. Generate release notes and update `CHANGELOG.md`.
3. Run `npm ci` and create `dist/releases/`.
4. Update all workspace `package.json` version fields to the new version using `scripts/set-workspace-versions.mjs`.
5. Regenerate the lockfile (`npm install --package-lock-only`).
6. Compile all packages (`npm run build`).
7. Publish the root package (`@mikaelkaron/skills`) to npm.
8. Publish `packages/cherry-pick-filter` (`@mikaelkaron/skills-cherry-pick-filter`) to npm.
9. Publish `packages/tessl` (`@mikaelkaron/skills-tessl`) to npm.
10. Commit `CHANGELOG.md`, all `package.json` files, and `package-lock.json` back to the branch with `[skip ci]`.
11. Create a GitHub release with the generated notes.

**Skipping individual steps:** The Release workflow exposes a boolean input for each step. Check the box next to a step in the GitHub Actions UI to skip it during a re-run.

**Required secrets:**

- `NPM_TOKEN` — npm automation token with publish access.
- `GITHUB_TOKEN` — provided automatically by GitHub Actions.

## Tile Publishing

Tessl skill tiles are published separately via the `Publish Tile` workflow (`.github/workflows/publish-tile.yml`). Trigger it manually and select which tiles to publish (`cherry-pick-filter`, `cli`, or `tessl`). Each selected tile runs `tessl tile publish .` from its directory under `skills/` using the `TESSL_API_TOKEN` secret.
