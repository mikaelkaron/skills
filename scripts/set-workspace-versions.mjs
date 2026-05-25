import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadWorkspaceTree } from "./lib/workspace.mjs";
import { VERSION_REGEX, applyWorkspaceVersions } from "./lib/versions.mjs";

const version = process.argv[2];
if (!version) throw new Error("Usage: set-workspace-versions.mjs <version>");
if (!VERSION_REGEX.test(version)) throw new Error(`Invalid version: ${version}`);

const tree = await loadWorkspaceTree();
const workspaceNames = [...tree.workspaces.keys()];

// Update root package.json
const rootPkgPath = join(tree.path, "package.json");
const rootPkg = JSON.parse(await readFile(rootPkgPath, "utf8"));
applyWorkspaceVersions(rootPkg, workspaceNames, version);
await writeFile(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n");

// Update each workspace package.json
for (const [, pkgPath] of tree.workspaces) {
  const pkgJsonPath = join(pkgPath, "package.json");
  const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
  applyWorkspaceVersions(pkg, workspaceNames, version);
  await writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
}
