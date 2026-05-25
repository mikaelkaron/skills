import { env } from "node:process";

// Assign a string ID to a plugin entry for use in SEMREL_SKIP_STEPS matching
export function stepId(name, suffix) {
  return suffix ? `${name}:${suffix}` : name;
}

// Build a filter function that removes plugins whose stepId matches SEMREL_SKIP_STEPS regex
export function buildSkipFilter() {
  const skipPattern = env.SEMREL_SKIP_STEPS;
  if (!skipPattern) return () => true; // keep all
  let regex;
  try {
    regex = new RegExp(skipPattern);
  } catch (err) {
    throw new Error(
      `SEMREL_SKIP_STEPS contains an invalid regex pattern "${skipPattern}": ${err.message}`,
    );
  }
  return (entry) => {
    if (!Array.isArray(entry)) return true;
    const id = entry[1]?.__stepId;
    return !id || !regex.test(id);
  };
}

// Helper: wrap a plugin entry with a __stepId option for the filter to read
function withId(name, suffix, options = {}) {
  return [name, { ...options, __stepId: stepId(name, suffix) }];
}

export const allPlugins = [
  "@semantic-release/commit-analyzer",
  "@semantic-release/release-notes-generator",
  withId("@semantic-release/changelog"),
  withId("@semantic-release/exec", "install", {
    prepareCmd: "npm ci && mkdir -p dist/releases",
  }),
  withId("@semantic-release/exec", "set-workspace-versions", {
    prepareCmd:
      "node scripts/set-workspace-versions.mjs ${nextRelease.version}",
  }),
  withId("@semantic-release/exec", "build", { prepareCmd: "npm run build" }),
  withId("@semantic-release/npm", ".", {
    pkgRoot: ".",
    tarballDir: "dist/releases",
  }),
  withId("@semantic-release/npm", "packages/cli", {
    pkgRoot: "packages/cli",
    tarballDir: "dist/releases",
  }),
  withId("@semantic-release/npm", "packages/cherry-pick-filter", {
    pkgRoot: "packages/cherry-pick-filter",
    tarballDir: "dist/releases",
  }),
  withId("@semantic-release/npm", "packages/tessl", {
    pkgRoot: "packages/tessl",
    tarballDir: "dist/releases",
  }),
  withId("@semantic-release/git", undefined, {
    assets: [
      "CHANGELOG.md",
      "package.json",
      "package-lock.json",
      "packages/*/package.json",
    ],
    message:
      "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}\n\n[skip ci]",
  }),
  withId("@semantic-release/github"),
];

export default {
  branches: [
    "main",
    { name: "pre", channel: "pre", prerelease: "pre" },
    { name: "alpha", channel: "alpha", prerelease: "alpha" },
    { name: "beta", channel: "beta", prerelease: "beta" },
    { name: "rc", channel: "rc", prerelease: "rc" },
  ],
  tagFormat: "v${version}",
  plugins: allPlugins.filter(buildSkipFilter()),
};
