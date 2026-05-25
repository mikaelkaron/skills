import { env } from "node:process";

// Assign a string ID to a plugin entry for use in SEMREL_SKIP_STEPS matching
export function stepId(name, suffix) {
  return suffix ? `${name}:${suffix}` : name;
}

// Map from plugin entry tuple to its step ID — keeps __stepId out of the
// options object that semantic-release passes to plugin lifecycle functions
const stepIds = new Map();

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
    const id = stepIds.get(entry);
    return !id || !regex.test(id);
  };
}

// Helper: create a plugin entry and register its step ID in the Map
function withId(name, suffix, options = {}) {
  const entry = [name, options];
  stepIds.set(entry, stepId(name, suffix));
  return entry;
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
  get plugins() {
    return allPlugins.filter(buildSkipFilter());
  },
};
