export declare const VERSION_REGEX: RegExp;

export interface PackageJson {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export function applyWorkspaceVersions(
  pkg: PackageJson,
  workspaceNames: Iterable<string>,
  version: string,
): PackageJson;
