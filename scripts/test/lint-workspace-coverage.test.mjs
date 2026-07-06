import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = new URL("../..", import.meta.url);
const rootPackage = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const qualityWorkflow = readFileSync(new URL("../../.github/workflows/quality.yml", import.meta.url), "utf8");
const branchProtectionDocs = readFileSync(new URL("../../BRANCH_PROTECTION.md", import.meta.url), "utf8");

function workspacePackageJsonPaths() {
  const paths = [];

  for (const pattern of rootPackage.workspaces ?? []) {
    assert.match(pattern, /^packages\/(?:\*|@ralphschuler\/\*)$/, `unsupported workspace pattern ${pattern}`);
    const base = pattern.endsWith("/@ralphschuler/*") ? "packages/@ralphschuler" : "packages";
    const basePath = path.resolve(root.pathname, base);

    for (const entry of readdirSync(basePath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const packageJson = path.join(basePath, entry.name, "package.json");
      if (existsSync(packageJson)) paths.push(packageJson);
    }
  }

  return paths.sort();
}

function workspacePackages() {
  return workspacePackageJsonPaths().map(packageJson => JSON.parse(readFileSync(packageJson, "utf8")));
}

function lintableWorkspaces() {
  return workspacePackages()
    .filter(packageJson => packageJson.scripts?.lint)
    .map(packageJson => packageJson.name)
    .sort();
}

function noLintWorkspaces() {
  return workspacePackages()
    .filter(packageJson => !packageJson.scripts?.lint)
    .map(packageJson => packageJson.name)
    .sort();
}

function workflowLintWorkspaces() {
  return [...qualityWorkflow.matchAll(/^\s{12}workspace: "?(?<workspace>[^"\n]+)"?$/gm)]
    .map(match => match.groups.workspace)
    .sort();
}

test("root lint:all runs every lintable workspace", () => {
  assert.equal(
    rootPackage.scripts["lint:all"],
    "npm run lint --workspaces --if-present -- --max-warnings=0",
    "lint:all should use npm workspace discovery and preserve the zero-warning lint gate",
  );
});

test("quality workflow lint matrix covers every lintable workspace", () => {
  assert.deepEqual(
    workflowLintWorkspaces(),
    lintableWorkspaces(),
    "quality.yml lint matrix should match every workspace package with a lint script",
  );

  assert.match(
    qualityWorkflow,
    /run: npm run lint -w "\$\{\{ matrix\.workspace \}\}" -- --max-warnings=0/,
    "quality workflow should lint the selected workspace directly with the zero-warning gate",
  );
});

test("workspaces without lint scripts are documented as excluded", () => {
  const excludedWorkspaces = noLintWorkspaces();
  assert.deepEqual(
    excludedWorkspaces,
    ["@ralphschuler/screeps-server", "screepsmod-testing"],
    "unexpected no-lint workspace set should force an explicit lint coverage decision",
  );

  for (const workspace of excludedWorkspaces) {
    assert.ok(
      branchProtectionDocs.includes(`\`${workspace}\``),
      `${workspace} should be documented as intentionally outside the lint matrix`,
    );
  }
});
