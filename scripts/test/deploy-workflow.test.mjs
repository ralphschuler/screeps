import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../../.github/workflows/deploy.yml", import.meta.url), "utf8");

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
