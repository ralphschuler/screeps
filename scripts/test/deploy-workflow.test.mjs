import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const explicitProductionPushCommand = "SCREEPS_HOSTNAME=screeps.com SCREEPS_BRANCH=main npm run push";
const workflow = readFileSync(new URL("../../.github/workflows/deploy.yml", import.meta.url), "utf8");
const rootPackage = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const deployDocs = readFileSync(new URL("../../docs/deployment/README.md", import.meta.url), "utf8");

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

test("local push guard fails closed with an exact explicit target command", () => {
  assert.equal(
    rootPackage.scripts.push,
    "DEPLOY=true npm run push -w screeps-typescript-starter",
    "root push should be the guarded deploy entry point",
  );
  assert.match(
    deployDocs,
    new RegExp(explicitProductionPushCommand.replaceAll(".", "\\.")),
    "deployment docs should show the canonical explicit production push command",
  );

  const env = {
    ...process.env,
    DEPLOY: "true",
    SCREEPS_TOKEN: "fake-token-for-guard-test",
  };
  delete env.SCREEPS_HOSTNAME;
  delete env.SCREEPS_BRANCH;
  delete env.SCREEPS_USER;
  delete env.SCREEPS_PASS;

  const result = spawnSync(process.execPath, ["-e", "import('./packages/screeps-bot/rollup.config.js')"], {
    cwd: repoRoot,
    encoding: "utf8",
    env,
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1, `deploy guard should reject missing explicit target:\n${output}`);
  assert.match(output, /DEPLOY=true requires explicit SCREEPS_HOSTNAME and SCREEPS_BRANCH/);
  assert.match(output, new RegExp(explicitProductionPushCommand.replaceAll(".", "\\.")));
  assert.doesNotMatch(output, /Target server:/, "guard should fail before printing default target server");
  assert.doesNotMatch(output, /Target branch:/, "guard should fail before printing default target branch");
});

test("deploy workflow runs preflight before secret-scoped upload", () => {
  assert.equal(
    rootPackage.scripts["deploy:preflight"],
    "npm run sync:deps:check && npm run check:alliance-safety && npm run build && npm run check:bot-bundle-drift",
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

test("deploy workflow gates production upload on private-server smoke without secrets", () => {
  assert.ok(
    stepIndex("Set up Docker Buildx for production smoke") > stepIndex("Deploy preflight"),
    "Docker Buildx setup should run after preflight",
  );
  assert.ok(
    stepIndex("Run production private-server smoke") > stepIndex("Set up Docker Buildx for production smoke"),
    "production smoke should run after Docker setup",
  );
  assert.ok(
    stepIndex("Push to Screeps") > stepIndex("Cleanup production smoke Docker"),
    "Screeps upload should run only after smoke cleanup",
  );

  const dockerSetup = stepBlock("Set up Docker Buildx for production smoke");
  assert.match(dockerSetup, /if:\s*\$\{\{\s*matrix\.target\.required\s*==\s*true\s*\}\}/, "Docker setup should run only for required production deploys");
  assert.doesNotMatch(dockerSetup, /SCREEPS_(PASS|TOKEN)/, "Docker setup must not receive Screeps upload secrets");

  const smoke = stepBlock("Run production private-server smoke");
  assert.match(smoke, /if:\s*\$\{\{\s*matrix\.target\.required\s*==\s*true\s*\}\}/, "smoke should run only for required production deploys");
  assert.match(smoke, /working-directory:\s*packages\/screeps-server/, "smoke should run from the server package");
  assert.match(smoke, /run:\s*node scripts\/run-private-server-test\.js --mode=smoke/, "smoke should use the private-server smoke runner");
  assert.doesNotMatch(smoke, /SCREEPS_(PASS|TOKEN)/, "smoke must not receive Screeps upload secrets");

  const uploadSummary = stepBlock("Upload production smoke summary");
  assert.match(uploadSummary, /if:\s*\$\{\{\s*always\(\)\s*&&\s*matrix\.target\.required\s*==\s*true\s*\}\}/, "smoke artifacts should upload for required production deploys even after failure");
  assert.ok(
    stepIndex("Upload production smoke summary") > stepIndex("Run production private-server smoke"),
    "smoke summary upload should run after smoke",
  );
  assert.doesNotMatch(uploadSummary, /SCREEPS_(PASS|TOKEN)/, "artifact upload must not receive Screeps upload secrets");

  const cleanup = stepBlock("Cleanup production smoke Docker");
  assert.match(cleanup, /if:\s*\$\{\{\s*always\(\)\s*&&\s*matrix\.target\.required\s*==\s*true\s*\}\}/, "smoke Docker cleanup should run for required production deploys even after failure");
  assert.match(cleanup, /docker compose .* down -v --remove-orphans \|\| true/, "cleanup should tear down the smoke project");
  assert.doesNotMatch(cleanup, /SCREEPS_(PASS|TOKEN)/, "cleanup must not receive Screeps upload secrets");
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
