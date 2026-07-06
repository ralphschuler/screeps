import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = new URL("../..", import.meta.url);

function makePackagesFixture() {
  return mkdtempSync(path.join(tmpdir(), "screeps-no-deep-dist-imports-"));
}

function writeSource(packagesDir, relativePath, source) {
  const filePath = path.join(packagesDir, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, source);
}

function runCheck(packagesDir) {
  return spawnSync(process.execPath, ["scripts/check-no-deep-dist-imports.js"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      NO_DEEP_DIST_IMPORTS_PACKAGES_DIR: packagesDir,
    },
    encoding: "utf8",
  });
}

test("deep dist import guard fails package-internal dist source imports", () => {
  const packagesDir = makePackagesFixture();
  writeSource(
    packagesDir,
    "screeps-spawn/src/bad.ts",
    'import { analyzeDefenderNeeds } from "@ralphschuler/screeps-defense/dist/analysis/defenderNeeds";\nvoid analyzeDefenderNeeds;\n',
  );

  const result = runCheck(packagesDir);

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /Deep dist imports are not allowed/);
  assert.match(result.stdout + result.stderr, /@ralphschuler\/screeps-defense\/dist\/analysis\/defenderNeeds/);
});

test("deep dist import guard catches type-only import expressions", () => {
  const packagesDir = makePackagesFixture();
  writeSource(
    packagesDir,
    "screeps-spawn/src/types.ts",
    'export type DefenderNeeds = import("@ralphschuler/screeps-defense/dist/analysis/defenderNeeds").DefenderRequirement;\n',
  );

  const result = runCheck(packagesDir);

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /screeps-defense\/dist\/analysis\/defenderNeeds/);
});

test("deep dist import guard allows package root imports and comment examples", () => {
  const packagesDir = makePackagesFixture();
  writeSource(
    packagesDir,
    "screeps-spawn/src/good.ts",
    '// import { x } from "@ralphschuler/screeps-defense/dist/private";\nexport { analyzeDefenderNeeds } from "@ralphschuler/screeps-defense";\n',
  );

  const result = runCheck(packagesDir);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("deep dist import guard ignores generated dist directories", () => {
  const packagesDir = makePackagesFixture();
  writeSource(
    packagesDir,
    "screeps-spawn/dist/generated.js",
    'import { x } from "@ralphschuler/screeps-defense/dist/private";\nvoid x;\n',
  );

  const result = runCheck(packagesDir);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});
