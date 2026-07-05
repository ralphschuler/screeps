import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = new URL("../..", import.meta.url);
const sharedDevDependencies = JSON.parse(
  readFileSync(new URL("../shared-dependencies.json", import.meta.url), "utf8"),
).framework.devDependencies;

function writePackage(
  packagesDir,
  shortName,
  { dependencies = {}, devDependencies = {}, source = "" } = {},
) {
  const packageDir = path.join(packagesDir, "@ralphschuler", shortName);
  mkdirSync(path.join(packageDir, "src"), { recursive: true });
  writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify(
      {
        name: `@ralphschuler/${shortName}`,
        version: "0.0.0-test",
        dependencies,
        devDependencies: {
          ...sharedDevDependencies,
          ...devDependencies,
        },
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(path.join(packageDir, "src", "index.ts"), source);
}

function makePackagesFixture() {
  return mkdtempSync(path.join(tmpdir(), "screeps-framework-deps-"));
}

function runSyncDeps(packagesDir, args = ["--check"]) {
  return spawnSync(process.execPath, ["scripts/sync-framework-deps.js", ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      FRAMEWORK_DEPS_PACKAGES_DIR: packagesDir,
    },
    encoding: "utf8",
  });
}

function runSyncDepsCheck(packagesDir) {
  return runSyncDeps(packagesDir, ["--check"]);
}

test("sync deps check fails when a framework package imports an undeclared internal workspace dependency", () => {
  const packagesDir = makePackagesFixture();
  writePackage(packagesDir, "screeps-alpha", {
    source: 'import { beta } from "@ralphschuler/screeps-beta";\nexport const alpha = beta;\n',
  });
  writePackage(packagesDir, "screeps-beta", {
    source: "export const beta = 1;\n",
  });

  const result = runSyncDepsCheck(packagesDir);

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /missing internal workspace dependenc/i);
  assert.match(result.stdout + result.stderr, /@ralphschuler\/screeps-alpha/);
  assert.match(result.stdout + result.stderr, /@ralphschuler\/screeps-beta/);
});

test("sync deps check passes when internal workspace imports are declared in package manifests", () => {
  const packagesDir = makePackagesFixture();
  writePackage(packagesDir, "screeps-alpha", {
    dependencies: { "@ralphschuler/screeps-beta": "*" },
    source: 'import { beta } from "@ralphschuler/screeps-beta";\nexport const alpha = beta;\n',
  });
  writePackage(packagesDir, "screeps-beta", {
    source: "export const beta = 1;\n",
  });

  const result = runSyncDepsCheck(packagesDir);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("devDependencies do not satisfy framework source imports", () => {
  const packagesDir = makePackagesFixture();
  writePackage(packagesDir, "screeps-alpha", {
    devDependencies: { "@ralphschuler/screeps-beta": "*" },
    source: 'import { beta } from "@ralphschuler/screeps-beta";\nexport const alpha = beta;\n',
  });
  writePackage(packagesDir, "screeps-beta", {
    source: "export const beta = 1;\n",
  });

  const result = runSyncDepsCheck(packagesDir);

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /missing internal workspace dependenc/i);
});

test("commented internal import examples are ignored", () => {
  const packagesDir = makePackagesFixture();
  writePackage(packagesDir, "screeps-alpha", {
    source: '// import { beta } from "@ralphschuler/screeps-beta";\nexport const alpha = 1;\n',
  });
  writePackage(packagesDir, "screeps-beta", {
    source: "export const beta = 1;\n",
  });

  const result = runSyncDepsCheck(packagesDir);

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("sync deps writes missing internal imports into package dependencies", () => {
  const packagesDir = makePackagesFixture();
  writePackage(packagesDir, "screeps-alpha", {
    source: 'export { beta } from "@ralphschuler/screeps-beta";\n',
  });
  writePackage(packagesDir, "screeps-beta", {
    source: "export const beta = 1;\n",
  });

  const result = runSyncDeps(packagesDir, []);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  const packageJson = JSON.parse(
    readFileSync(path.join(packagesDir, "@ralphschuler", "screeps-alpha", "package.json"), "utf8"),
  );
  assert.equal(packageJson.dependencies["@ralphschuler/screeps-beta"], "*");
});
