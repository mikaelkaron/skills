export const VERSION_REGEX = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;

export function applyWorkspaceVersions(pkg, workspaceNames, version) {
  pkg.version = version;
  // Only dependencies and devDependencies are updated; peerDependencies and
  // optionalDependencies are not in scope for this project's workspace layout.
  for (const name of workspaceNames) {
    if (pkg.dependencies?.[name]) pkg.dependencies[name] = `^${version}`;
    if (pkg.devDependencies?.[name]) pkg.devDependencies[name] = `^${version}`;
  }
  return pkg;
}
