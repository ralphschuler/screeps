import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

function runVersionHelper(expression) {
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import { satisfiesVersion } from './scripts/check-versions.js';\nconsole.log(${expression});`,
    ],
    {
      cwd: new URL("../..", import.meta.url),
      encoding: "utf8",
    },
  );

  return result;
}

test("Node engine range accepts Node 24 and rejects neighboring majors", () => {
  const result = runVersionHelper(
    `JSON.stringify([\n` +
      `  satisfiesVersion('24.0.0', '>=24 <25'),\n` +
      `  satisfiesVersion('24.13.2', '>=24 <25'),\n` +
      `  satisfiesVersion('23.11.0', '>=24 <25'),\n` +
      `  satisfiesVersion('25.0.0', '>=24 <25')\n` +
      `])`,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [true, true, false, false]);
});

test("version helper supports upper-bound semver operators", () => {
  const result = runVersionHelper(
    `JSON.stringify([\n` +
      `  satisfiesVersion('24.9.0', '<25'),\n` +
      `  satisfiesVersion('25.0.0', '<25'),\n` +
      `  satisfiesVersion('25.0.1', '>25'),\n` +
      `  satisfiesVersion('25.0.0', '>25')\n` +
      `])`,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [true, false, true, false]);
});
