import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadWorkspaceTree } from "./lib/workspace.mjs";

const version = process.argv[2];
if (!version) throw new Error("Usage: set-workspace-versions.mjs <version>");
if (!/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(version))
  throw new Error(`Invalid version: ${version}`);

const tree = await loadWorkspaceTree();

// Update root package.json
const rootPkgPath = join(tree.path, "package.json");
const rootPkg = JSON.parse(await readFile(rootPkgPath, "utf8"));
rootPkg.version = version;

// Update cross-workspace dependency versions
for (const [name] of tree.workspaces) {
  if (rootPkg.dependencies?.[name]) {
    rootPkg.dependencies[name] = `^${version}`;
  }
  if (rootPkg.devDependencies?.[name]) {
    rootPkg.devDependencies[name] = `^${version}`;
  }
}
await writeFile(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n");

// Update each workspace package.json
for (const [, pkgPath] of tree.workspaces) {
  const pkgJsonPath = join(pkgPath, "package.json");
  const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
  pkg.version = version;
  await writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
}
