import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootPackage = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const ciWorkflow = readFileSync(new URL("../../.github/workflows/ci.yml", import.meta.url), "utf8");
const driftCheckScript = fileURLToPath(new URL("../check-bot-bundle-drift.mjs", import.meta.url));

function stepIndex(name) {
  const index = ciWorkflow.indexOf(`      - name: ${name}`);
  assert.notEqual(index, -1, `CI workflow should include step ${name}`);
  return index;
}

function stepBlock(name) {
  const start = stepIndex(name);
  const next = ciWorkflow.indexOf("\n      - name:", start + 1);
  return ciWorkflow.slice(start, next === -1 ? ciWorkflow.length : next);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  return result;
}

function makeGitFixture() {
  const cwd = mkdtempSync(path.join(tmpdir(), "screeps-bundle-drift-"));
  run("git", ["init"], { cwd });
  run("git", ["config", "user.email", "test@example.invalid"], { cwd });
  run("git", ["config", "user.name", "bundle drift test"], { cwd });

  const bundlePath = path.join(cwd, "packages/screeps-bot/dist/main.js");
  mkdirSync(path.dirname(bundlePath), { recursive: true });
  writeFileSync(bundlePath, "module.exports.loop = function loop() {};\n");
  run("git", ["add", "packages/screeps-bot/dist/main.js"], { cwd });
  run("git", ["commit", "-m", "initial bundle"], { cwd });

  return { cwd, bundlePath };
}

function runDriftCheck(cwd) {
  return spawnSync(process.execPath, [driftCheckScript], { cwd, encoding: "utf8" });
}

test("root scripts expose a committed bot bundle drift check", () => {
  assert.equal(
    rootPackage.scripts["check:bot-bundle-drift"],
    "node scripts/check-bot-bundle-drift.mjs",
    "root package should expose a reusable generated bundle drift check",
  );

  assert.match(
    rootPackage.scripts["deploy:preflight"],
    /npm run build && npm run check:bot-bundle-drift/,
    "deploy preflight should fail before upload when the generated bot bundle drifts from the committed artifact",
  );
  assert.match(
    rootPackage.scripts.verify,
    /npm run build && npm run check:bot-bundle-drift/,
    "the main local verification gate should catch bot bundle drift after building",
  );
});

test("CI checks for generated bot bundle drift after building", () => {
  assert.ok(
    stepIndex("Check bot bundle drift") > stepIndex("Build framework and bot"),
    "CI should run the bundle drift check after Rollup regenerates packages/screeps-bot/dist/main.js",
  );

  const driftCheck = stepBlock("Check bot bundle drift");
  assert.match(
    driftCheck,
    /run: npm run check:bot-bundle-drift/,
    "CI drift check should use the root drift-check script",
  );
});

test("bundle drift checker passes when generated bundle matches HEAD", () => {
  const fixture = makeGitFixture();
  try {
    const result = runDriftCheck(fixture.cwd);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Bot bundle is reproducible/);
  } finally {
    rmSync(fixture.cwd, { recursive: true, force: true });
  }
});

test("bundle drift checker fails and prints the generated diff when bundle differs from HEAD", () => {
  const fixture = makeGitFixture();
  try {
    writeFileSync(fixture.bundlePath, "module.exports.loop = function changed() {};\n");

    const result = runDriftCheck(fixture.cwd);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Generated bot bundle drift detected/);
    assert.match(result.stdout, /function changed/);
  } finally {
    rmSync(fixture.cwd, { recursive: true, force: true });
  }
});

test("bundle drift checker reports git failures separately from generated drift", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "screeps-bundle-drift-nongit-"));
  try {
    const result = runDriftCheck(cwd);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unable to check bot bundle drift/);
    assert.doesNotMatch(result.stderr, /Generated bot bundle drift detected/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
