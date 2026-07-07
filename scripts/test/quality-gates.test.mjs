import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const { enforceDuplicationBudget } = require("../check-duplication-budget.cjs");
const complexityScript = new URL("../analyze-complexity.cjs", import.meta.url);

function makeFixture() {
  const dir = mkdtempSync(join(tmpdir(), "screeps-quality-gate-"));
  mkdirSync(join(dir, "packages", "fixture"), { recursive: true });
  return dir;
}

function writeTypeScriptFile(root, name, lineCount) {
  const lines = Array.from({ length: lineCount }, (_, index) => `export const value${index} = ${index};`);
  writeFileSync(join(root, "packages", "fixture", name), `${lines.join("\n")}\n`);
}

function runComplexity(root) {
  return spawnSync(process.execPath, [complexityScript.pathname], {
    cwd: root,
    encoding: "utf8",
  });
}

test("duplication gate wraps JSCPD so reports are written before enforcing the threshold", () => {
  const config = JSON.parse(readFileSync(new URL("../../.jscpd.json", import.meta.url), "utf8"));
  const rootPackage = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

  assert.equal(config.threshold, 22, "duplication should use the documented transitional threshold");
  assert.equal(config.exitCode, 0, "JSCPD should not fail before JSON/HTML reports are written");
  assert.ok(config.reporters.includes("json"), "duplication summaries need the JSON report artifact");
  assert.equal(rootPackage.scripts["quality:duplication"], "node scripts/check-duplication-budget.cjs");
});

test("duplication budget enforcement fails only when total duplication exceeds the configured threshold", () => {
  const root = makeFixture();
  const configPath = join(root, ".jscpd.json");
  const reportPath = join(root, "reports", "duplication", "jscpd-report.json");
  mkdirSync(join(root, "reports", "duplication"), { recursive: true });
  writeFileSync(configPath, JSON.stringify({ threshold: 22 }));

  try {
    writeFileSync(reportPath, JSON.stringify({ statistics: { total: { percentage: 21.99 } } }));
    assert.deepEqual(enforceDuplicationBudget({ configPath, reportPath }), {
      percentage: 21.99,
      threshold: 22,
      breached: false,
    });

    writeFileSync(reportPath, JSON.stringify({ statistics: { total: { percentage: 22.01 } } }));
    assert.throws(
      () => enforceDuplicationBudget({ configPath, reportPath }),
      /Duplication budget exceeded: 22\.01% total duplication exceeds the 22% transitional threshold/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("complexity gate treats exactly 300 logical lines as within the file-size limit", () => {
  const root = makeFixture();

  try {
    writeTypeScriptFile(root, "exact-limit.ts", 300);

    const result = runComplexity(root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const report = JSON.parse(readFileSync(join(root, "reports", "complexity-baseline.json"), "utf8"));
    assert.equal(report.filesOverLimit, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("complexity gate passes at the transitional files-over-limit budget", () => {
  const root = makeFixture();

  try {
    writeTypeScriptFile(root, "large.ts", 301);
    for (let index = 0; index < 4; index += 1) {
      writeTypeScriptFile(root, `small-${index}.ts`, 10);
    }

    const result = runComplexity(root);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const report = JSON.parse(readFileSync(join(root, "reports", "complexity-baseline.json"), "utf8"));
    assert.equal(report.filesOverLimitPercent, 20);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("complexity gate fails when files-over-limit percentage exceeds the transitional budget", () => {
  const root = makeFixture();

  try {
    writeTypeScriptFile(root, "large.ts", 301);
    writeTypeScriptFile(root, "small.ts", 10);

    const result = runComplexity(root);
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /Complexity budget exceeded/);

    const report = JSON.parse(readFileSync(join(root, "reports", "complexity-baseline.json"), "utf8"));
    assert.equal(report.filesOverLimitPercent, 50);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("complexity gate enforces raw just-over-budget percentages without rounding down", () => {
  const root = makeFixture();

  try {
    for (let index = 0; index < 90; index += 1) {
      writeTypeScriptFile(root, `large-${index}.ts`, 301);
    }
    for (let index = 0; index < 319; index += 1) {
      writeTypeScriptFile(root, `small-${index}.ts`, 10);
    }

    const result = runComplexity(root);
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /22\.0049% files over 300 lines exceeds the 22% transitional budget/);

    const report = JSON.parse(readFileSync(join(root, "reports", "complexity-baseline.json"), "utf8"));
    assert.equal(report.filesOverLimitPercent, 22.0049);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
