import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = new URL("../..", import.meta.url);
const scriptPath = new URL("../publish-framework-package.mjs", import.meta.url);

function writeFrameworkPackage(
  packagesDir,
  shortName,
  { dependencies = {}, privatePackage = false, scripts = {}, version = "0.1.0" } = {},
) {
  const packageDir = path.join(packagesDir, "@ralphschuler", shortName);
  mkdirSync(path.join(packageDir, "dist"), { recursive: true });
  writeFileSync(path.join(packageDir, "dist", "index.js"), "export {};\n");
  writeFileSync(path.join(packageDir, "dist", "index.d.ts"), "export {};\n");
  writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify(
      {
        name: `@ralphschuler/${shortName}`,
        version,
        private: privatePackage,
        main: "dist/index.js",
        types: "dist/index.d.ts",
        scripts,
        dependencies,
      },
      null,
      2,
    ) + "\n",
  );
  return packageDir;
}

function makeFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "screeps-publish-fixture-"));
  const packagesDir = path.join(root, "packages");
  return { packagesDir, root };
}

function runPublishScript(args, packagesDir) {
  return spawnSync(process.execPath, [scriptPath.pathname, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PUBLISH_FRAMEWORK_PACKAGES_DIR: packagesDir,
    },
    encoding: "utf8",
  });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function stagedManifest(stageRoot, packageName) {
  const safeName = packageName.replaceAll("/", "__").replaceAll("@", "scope_");
  return readJson(path.join(stageRoot, safeName, "stage", "package", "package.json"));
}

function verifiedManifest(stageRoot, packageName) {
  const safeName = packageName.replaceAll("/", "__").replaceAll("@", "scope_");
  return readJson(
    path.join(stageRoot, safeName, "verify-extract", "package", "package.json"),
  );
}

test("publish package check normalizes internal wildcard dependencies only in staged pack output", () => {
  const { packagesDir, root } = makeFixture();
  const alphaDir = writeFrameworkPackage(packagesDir, "screeps-alpha", {
    dependencies: {
      "@ralphschuler/screeps-beta": "*",
      lodash: "^4.17.21",
    },
    version: "0.2.0",
  });
  writeFrameworkPackage(packagesDir, "screeps-beta", { version: "0.4.5" });
  const stageRoot = path.join(root, "stage-root");

  const result = runPublishScript(
    ["--package", alphaDir, "--check", "--stage-root", stageRoot, "--keep-stage"],
    packagesDir,
  );

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(
    result.stdout,
    /dependencies\.@ralphschuler\/screeps-beta \* -> 0\.4\.5/,
  );
  assert.equal(
    readJson(path.join(alphaDir, "package.json")).dependencies[
      "@ralphschuler/screeps-beta"
    ],
    "*",
  );
  assert.equal(
    stagedManifest(stageRoot, "@ralphschuler/screeps-alpha").dependencies[
      "@ralphschuler/screeps-beta"
    ],
    "0.4.5",
  );
  assert.equal(
    verifiedManifest(stageRoot, "@ralphschuler/screeps-alpha").dependencies[
      "@ralphschuler/screeps-beta"
    ],
    "0.4.5",
  );
});

test("publish package check resolves workspace protocol ranges before validation", () => {
  const { packagesDir, root } = makeFixture();
  const alphaDir = writeFrameworkPackage(packagesDir, "screeps-alpha", {
    dependencies: {
      "@ralphschuler/screeps-beta": "workspace:^",
    },
  });
  writeFrameworkPackage(packagesDir, "screeps-beta", { version: "0.4.5" });
  const stageRoot = path.join(root, "stage-root");

  const result = runPublishScript(
    ["--package", alphaDir, "--check", "--stage-root", stageRoot, "--keep-stage"],
    packagesDir,
  );

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(
    verifiedManifest(stageRoot, "@ralphschuler/screeps-alpha").dependencies[
      "@ralphschuler/screeps-beta"
    ],
    "^0.4.5",
  );
});

test("publish package dry-run publishes the verified tarball without running staged lifecycle scripts", () => {
  const { packagesDir, root } = makeFixture();
  const alphaDir = writeFrameworkPackage(packagesDir, "screeps-alpha", {
    scripts: {
      prepublishOnly: "node -e \"process.exit(42)\"",
    },
  });

  const result = runPublishScript(
    [
      "--package",
      alphaDir,
      "--dry-run",
      "--stage-root",
      path.join(root, "stage-root"),
    ],
    packagesDir,
  );

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /\+ @ralphschuler\/screeps-alpha@0\.1\.0/);
});

test("publish package check fails when a packed manifest still has an unresolved workspace protocol", () => {
  const { packagesDir, root } = makeFixture();
  const alphaDir = writeFrameworkPackage(packagesDir, "screeps-alpha", {
    dependencies: {
      "external-workspace-package": "workspace:*",
    },
  });

  const result = runPublishScript(
    ["--package", alphaDir, "--check", "--stage-root", path.join(root, "stage-root")],
    packagesDir,
  );

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /still uses workspace:\*/);
});
