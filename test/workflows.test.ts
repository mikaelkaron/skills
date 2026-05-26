import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const releaseYml = load(
  readFileSync(join(repoRoot, ".github/workflows/release.yml"), "utf8"),
) as Record<string, unknown>;

const ciYml = load(
  readFileSync(join(repoRoot, ".github/workflows/ci.yml"), "utf8"),
) as Record<string, unknown>;

describe("release.yml", () => {
  it("GHA-01: triggers on workflow_dispatch only", () => {
    const on = releaseYml.on as Record<string, unknown>;
    assert.ok("workflow_dispatch" in on, "workflow_dispatch trigger missing");
    assert.equal(
      Object.keys(on).length,
      1,
      "should have exactly one trigger (workflow_dispatch)",
    );
  });

  it("GHA-02: has boolean skip inputs for each skippable step", () => {
    const inputs = (releaseYml.on as any).workflow_dispatch.inputs;
    const expected = [
      "skip_changelog",
      "skip_install",
      "skip_set_workspace_versions",
      "skip_build",
      "skip_root",
      "skip_cherry_pick_filter",
      "skip_tessl",
      "skip_git",
      "skip_github",
    ];
    for (const name of expected) {
      assert.ok(name in inputs, `missing input: ${name}`);
      assert.equal(inputs[name].type, "boolean", `${name} should be boolean`);
    }
  });

  it("GHA-03: checkout step uses fetch-depth: 0", () => {
    const steps = (releaseYml.jobs as any).release.steps;
    const checkoutStep = steps.find(
      (s: any) =>
        typeof s.uses === "string" && s.uses.startsWith("actions/checkout"),
    );
    assert.ok(checkoutStep, "checkout step should exist");
    assert.equal(
      checkoutStep.with["fetch-depth"],
      0,
      "checkout step should have fetch-depth: 0",
    );
  });

  it("GHA-04: setup-node step does not set registry-url", () => {
    const steps = (releaseYml.jobs as any).release.steps;
    const setupNodeStep = steps.find(
      (s: any) =>
        typeof s.uses === "string" && s.uses.startsWith("actions/setup-node"),
    );
    assert.ok(setupNodeStep, "setup-node step should exist");
    assert.ok(
      !("registry-url" in (setupNodeStep.with ?? {})),
      "setup-node should not set registry-url",
    );
  });

  it("GHA-05: release job has required permissions", () => {
    const perms = (releaseYml.jobs as any).release.permissions;
    assert.equal(perms.contents, "write");
    assert.equal(perms.issues, "write");
    assert.equal(perms["pull-requests"], "write");
    assert.equal(perms["id-token"], "write");
  });

  it("GHA-06: release job has concurrency with cancel-in-progress: false", () => {
    const concurrency = (releaseYml.jobs as any).release.concurrency;
    assert.equal(
      concurrency["cancel-in-progress"],
      false,
      "cancel-in-progress should be false",
    );
  });

  it("GHA-07: setup job has assemble step with IFS='|' in run script", () => {
    const setupSteps = (releaseYml.jobs as any).setup.steps;
    assert.equal(
      setupSteps[0].id,
      "assemble",
      "first setup step should have id: assemble",
    );
    assert.ok(
      setupSteps[0].run.includes("IFS='|'"),
      "assemble step run script should contain IFS='|'",
    );
  });

  it("GHA-08: semantic-release step has GITHUB_TOKEN and NPM_TOKEN env vars", () => {
    const steps = (releaseYml.jobs as any).release.steps;
    const semrelStep = steps.find(
      (s: any) =>
        typeof s.run === "string" && s.run.includes("semantic-release"),
    );
    assert.ok(semrelStep, "semantic-release step should exist");
    assert.equal(
      semrelStep.env?.GITHUB_TOKEN,
      "${{ secrets.GITHUB_TOKEN }}",
      "GITHUB_TOKEN should reference the GITHUB_TOKEN secret",
    );
    assert.equal(
      semrelStep.env?.NPM_TOKEN,
      "${{ secrets.NPM_TOKEN }}",
      "NPM_TOKEN should reference the NPM_TOKEN secret",
    );
  });

  it("GHA-09: release job if condition includes refs/heads/main", () => {
    const jobIf = (releaseYml.jobs as any).release.if;
    assert.ok(
      typeof jobIf === "string" && jobIf.includes("refs/heads/main"),
      "release job if condition should include refs/heads/main",
    );
  });
});

describe("ci.yml", () => {
  it("CI-01: triggers on push to main, all pull_requests, and workflow_dispatch", () => {
    const on = ciYml.on as any;
    assert.ok(
      Array.isArray(on.push.branches) && on.push.branches.includes("main"),
      "push trigger should include main branch",
    );
    assert.ok("pull_request" in on, "pull_request trigger should exist");
    assert.equal(
      on.pull_request,
      null,
      "pull_request trigger should have no filters (includes drafts)",
    );
    assert.ok(
      "workflow_dispatch" in on,
      "workflow_dispatch trigger should exist",
    );
  });

  it("CI-02: lint and test jobs exist", () => {
    const jobs = ciYml.jobs as any;
    assert.ok(jobs.lint, "lint job should exist");
    assert.ok(jobs.test, "test job should exist");
  });

  it("CI-03: test job setup-node has cache: npm", () => {
    const steps = (ciYml.jobs as any).test.steps;
    const setupNodeStep = steps.find(
      (s: any) =>
        typeof s.uses === "string" && s.uses.startsWith("actions/setup-node"),
    );
    assert.ok(setupNodeStep, "setup-node step should exist in test job");
    assert.equal(setupNodeStep.with?.cache, "npm");
  });
});
