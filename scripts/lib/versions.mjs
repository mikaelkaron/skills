export const VERSION_REGEX = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;

export function applyWorkspaceVersions(pkg, workspaceNames, version) {
  pkg.version = version;
  for (const name of workspaceNames) {
    if (pkg.dependencies?.[name]) pkg.dependencies[name] = `^${version}`;
    if (pkg.devDependencies?.[name]) pkg.devDependencies[name] = `^${version}`;
  }
  return pkg;
}
