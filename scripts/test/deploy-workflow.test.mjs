import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../../.github/workflows/deploy.yml", import.meta.url), "utf8");
const rootPackage = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

function parseDeployTargets() {
  const matrixBlock = workflow.match(/matrix:\n(?<block>[\s\S]*?)\n\s{4}env:/)?.groups?.block;
  assert.ok(matrixBlock, "deploy workflow should define a matrix before env");

  return [...matrixBlock.matchAll(/^\s{10}- environment: (?<environment>\S+)\n\s{12}hostname: (?<hostname>\S+)\n\s{12}required: (?<required>true|false)$/gm)].map(
    ({ groups }) => ({
      environment: groups.environment,
      hostname: groups.hostname,
      required: groups.required === "true",
    }),
  );
}

function stepIndex(name) {
  const index = workflow.indexOf(`      - name: ${name}`);
  assert.notEqual(index, -1, `deploy workflow should include step ${name}`);
  return index;
}

function stepBlock(name) {
  const start = stepIndex(name);
  const next = workflow.indexOf("\n      - name:", start + 1);
  return workflow.slice(start, next === -1 ? workflow.length : next);
}

test("deploy workflow runs preflight before secret-scoped upload", () => {
  assert.equal(
    rootPackage.scripts["deploy:preflight"],
    "npm run sync:deps:check && npm run check:alliance-safety && npm run build",
    "root package should define the deploy preflight command used by the workflow",
  );

  assert.ok(
    stepIndex("Deploy preflight") > stepIndex("Install dependencies"),
    "deploy preflight should run after dependency installation",
  );
  assert.ok(
    stepIndex("Push to Screeps") > stepIndex("Deploy preflight"),
    "deploy preflight should run before Screeps upload",
  );

  const preflight = stepBlock("Deploy preflight");
  assert.match(preflight, /run: npm run deploy:preflight/, "preflight should use the deploy:preflight script");
  assert.doesNotMatch(preflight, /SCREEPS_(PASS|TOKEN)/, "preflight must not receive Screeps upload secrets");

  const push = stepBlock("Push to Screeps");
  assert.match(push, /SCREEPS_PASS:\s*\$\{\{ secrets\.SCREEPS_PASS \}\}/, "upload step should receive password secret");
  assert.match(push, /SCREEPS_TOKEN:\s*\$\{\{ secrets\.SCREEPS_TOKEN \}\}/, "upload step should receive token secret");
  assert.match(push, /run: npm run push/, "upload step should still run the Screeps push command");
});

test("deploy workflow keeps screeps.com required and marks optional targets non-blocking", () => {
  assert.match(
    workflow,
    /continue-on-error:\s*\$\{\{\s*matrix\.target\.required\s*!=\s*true\s*\}\}/,
    "deploy matrix should allow optional target failures without failing the workflow",
  );

  const targets = parseDeployTargets();
  assert.deepEqual(
    targets.map((target) => target.environment).sort(),
    [
      "ptr.screeps.com",
      "screeps.com",
      "screeps.newbieland.net",
      "screeps.nyphon.de",
      "season.screeps.com",
      "sim.screeps.com",
    ].sort(),
  );

  assert.deepEqual(
    targets.filter((target) => target.required).map((target) => target.environment),
    ["screeps.com"],
    "only production screeps.com should be a required deploy target",
  );

  for (const target of targets) {
    if (target.environment !== "screeps.com") {
      assert.equal(target.required, false, `${target.environment} should be optional`);
    }
  }
});
