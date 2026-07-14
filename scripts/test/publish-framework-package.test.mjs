import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = new URL("../..", import.meta.url);
const scriptPath = new URL("../publish-framework-package.mjs", import.meta.url);
const workflowPath = new URL(
  "../../.github/workflows/publish-framework.yml",
  import.meta.url,
);
const publishingGuidePath = new URL("../../PUBLISHING.md", import.meta.url);

function writeFrameworkPackage(
  packagesDir,
  shortName,
  {
    dependencies = {},
    privatePackage = false,
    scripts = {},
    version = "0.1.0",
  } = {},
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
  return readJson(
    path.join(stageRoot, safeName, "stage", "package", "package.json"),
  );
}

function verifiedManifest(stageRoot, packageName) {
  const safeName = packageName.replaceAll("/", "__").replaceAll("@", "scope_");
  return readJson(
    path.join(stageRoot, safeName, "verify-extract", "package", "package.json"),
  );
}

test("publish package list discovers only public framework candidates in dependency order", () => {
  const { packagesDir } = makeFixture();
  writeFrameworkPackage(packagesDir, "screeps-alpha", {
    dependencies: { "@ralphschuler/screeps-beta": "*" },
  });
  writeFrameworkPackage(packagesDir, "screeps-beta", { version: "0.2.0" });
  writeFrameworkPackage(packagesDir, "screeps-private", {
    privatePackage: true,
  });
  writeFrameworkPackage(packagesDir, "screeps-unpublishable", {
    dependencies: { "@ralphschuler/screeps-private": "*" },
  });
  const appDir = path.join(packagesDir, "application");
  mkdirSync(path.join(appDir, "dist"), { recursive: true });
  writeFileSync(
    path.join(appDir, "package.json"),
    `${JSON.stringify({ name: "application", version: "1.0.0", main: "dist/index.js", types: "dist/index.d.ts" }, null, 2)}\n`,
  );

  const result = runPublishScript(["--list", "--json"], packagesDir);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.deepEqual(
    summary.packages.map((pkg) => ({
      name: pkg.name,
      scope: pkg.scope,
      version: pkg.version,
    })),
    [
      { name: "@ralphschuler/screeps-beta", scope: "beta", version: "0.2.0" },
      { name: "@ralphschuler/screeps-alpha", scope: "alpha", version: "0.1.0" },
    ],
  );
});

test("publish package list fails before staging cyclic internal selections", () => {
  const { packagesDir } = makeFixture();
  writeFrameworkPackage(packagesDir, "screeps-alpha", {
    dependencies: { "@ralphschuler/screeps-beta": "*" },
  });
  writeFrameworkPackage(packagesDir, "screeps-beta", {
    dependencies: { "@ralphschuler/screeps-alpha": "*" },
  });

  const result = runPublishScript(["--list", "--json"], packagesDir);

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(
    result.stderr,
    /Internal framework dependency cycle: @ralphschuler\/screeps-alpha -> @ralphschuler\/screeps-beta -> @ralphschuler\/screeps-alpha/,
  );
});

test("publish package list resolves exact scopes and rejects unavailable or private scopes", () => {
  const { packagesDir } = makeFixture();
  writeFrameworkPackage(packagesDir, "screeps-alpha");
  writeFrameworkPackage(packagesDir, "screeps-private", {
    privatePackage: true,
  });
  writeFrameworkPackage(packagesDir, "screeps-unpublishable", {
    dependencies: { "@ralphschuler/screeps-private": "*" },
  });

  const exact = runPublishScript(
    ["--list", "--package", "alpha", "--json"],
    packagesDir,
  );
  assert.equal(exact.status, 0, exact.stdout + exact.stderr);
  assert.deepEqual(
    JSON.parse(exact.stdout).packages.map((pkg) => pkg.name),
    ["@ralphschuler/screeps-alpha"],
  );

  const substring = runPublishScript(
    ["--list", "--package", "pha", "--json"],
    packagesDir,
  );
  assert.notEqual(substring.status, 0, substring.stdout + substring.stderr);
  assert.match(
    substring.stderr,
    /Unable to resolve exact publishable package selection: pha/,
  );

  const privateResult = runPublishScript(
    ["--list", "--package", "private", "--json"],
    packagesDir,
  );
  assert.notEqual(
    privateResult.status,
    0,
    privateResult.stdout + privateResult.stderr,
  );
  assert.match(privateResult.stderr, /not publishable: package is private/);

  const invalidClosure = runPublishScript(
    ["--list", "--package", "unpublishable", "--json"],
    packagesDir,
  );
  assert.notEqual(
    invalidClosure.status,
    0,
    invalidClosure.stdout + invalidClosure.stderr,
  );
  assert.match(
    invalidClosure.stderr,
    /not publishable: dependency @ralphschuler\/screeps-private is not publishable \(package is private\)/,
  );
});

test("framework publication workflow delegates all and exact scope selection to the helper", () => {
  const workflow = readFileSync(workflowPath, "utf8");

  assert.doesNotMatch(workflow, /\bmatrix:/);
  assert.doesNotMatch(workflow, /\bcontains\(/);
  assert.match(workflow, /publish-framework-package\.mjs --all --publish/);
  assert.match(
    workflow,
    /publish-framework-package\.mjs --package "\$PUBLISH_SCOPE" --publish/,
  );
});

test("publishing guide inventory matches manifest-driven helper discovery", () => {
  const result = spawnSync(
    process.execPath,
    [scriptPath.pathname, "--list", "--json"],
    {
      cwd: repoRoot,
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const discoveredInventory = JSON.parse(result.stdout).packages.map(
    ({ name, scope, version }) => ({ name, scope, version }),
  );
  const guide = readFileSync(publishingGuidePath, "utf8");
  const inventory = guide.match(
    /<!-- framework-package-inventory:start -->([\s\S]*?)<!-- framework-package-inventory:end -->/,
  );
  assert.ok(
    inventory,
    "PUBLISHING.md must contain the tested framework package inventory",
  );
  const documentedInventory = [
    ...inventory[1].matchAll(
      /\| `(@ralphschuler\/screeps-[^`]+)`\s+\| `([^`]+)`\s+\| ([^\s|]+)\s+\|/g,
    ),
  ].map((match) => ({ name: match[1], scope: match[2], version: match[3] }));

  assert.deepEqual(documentedInventory, discoveredInventory);
});

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
    [
      "--package",
      alphaDir,
      "--check",
      "--stage-root",
      stageRoot,
      "--keep-stage",
    ],
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
    [
      "--package",
      alphaDir,
      "--check",
      "--stage-root",
      stageRoot,
      "--keep-stage",
    ],
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
      prepublishOnly: 'node -e "process.exit(42)"',
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
    [
      "--package",
      alphaDir,
      "--check",
      "--stage-root",
      path.join(root, "stage-root"),
    ],
    packagesDir,
  );

  assert.notEqual(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /still uses workspace:\*/);
});
