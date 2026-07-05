import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const botPackage = JSON.parse(readFileSync(new URL("../../packages/screeps-bot/package.json", import.meta.url), "utf8"));
const rollupConfig = readFileSync(new URL("../../packages/screeps-bot/rollup.config.js", import.meta.url), "utf8");

test("bot workspace typecheck is a dedicated tsc --noEmit gate", () => {
  assert.equal(
    botPackage.scripts.typecheck,
    "tsc -p tsconfig.json --noEmit",
    "bot typecheck should run the TypeScript compiler directly without bundling",
  );
  assert.doesNotMatch(
    botPackage.scripts.typecheck,
    /rollup|npm run build/,
    "bot typecheck should not alias the Rollup build",
  );
});

test("bot build and push run typecheck before bundling", () => {
  assert.equal(botPackage.scripts.build, "npm run typecheck && rollup -c && npm run bundle:check");
  assert.equal(botPackage.scripts.push, "npm run typecheck && DEPLOY=true rollup -c && npm run bundle:check");

  for (const scriptName of ["build", "push"]) {
    const script = botPackage.scripts[scriptName];
    assert.ok(
      script.indexOf("npm run typecheck") < script.indexOf("rollup -c"),
      `${scriptName} should fail on TypeScript errors before Rollup can emit a bundle`,
    );
    assert.ok(
      script.endsWith("npm run bundle:check"),
      `${scriptName} should keep bundle size validation after bundling`,
    );
  }
});

test("Rollup TypeScript plugin refuses to emit on TypeScript errors", () => {
  assert.match(
    rollupConfig,
    /noEmitOnError:\s*true/,
    "Rollup deploy builds should not silently emit when TypeScript reports errors",
  );
  assert.doesNotMatch(rollupConfig, /noEmitOnError:\s*false/);
});
