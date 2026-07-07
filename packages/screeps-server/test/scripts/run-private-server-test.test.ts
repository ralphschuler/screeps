import { expect } from "chai";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createInitialSummary } from "../../scripts/private-server-harness.js";
import { runPrivateServerCli } from "../../scripts/run-private-server-test.js";

describe("run-private-server-test CLI", () => {
  it("returns zero when the harness summary passed and no process exit code is set", async () => {
    const artifactsDir = fs.mkdtempSync(path.join(os.tmpdir(), "screeps-harness-cli-passed-"));

    const exitCode = await runPrivateServerCli({
      argv: [`--artifactsDir=${artifactsDir}`],
      env: {},
      getProcessExitCode: () => 0,
      runTest: async (options) => {
        const summary = createInitialSummary(options, new Date("2026-07-05T00:00:00.000Z"));
        summary.status = "passed";
        return summary;
      },
      logError: () => {},
    });

    expect(exitCode).to.equal(0);
  });

  it("fails and rewrites artifacts when a passed summary would exit nonzero", async () => {
    const artifactsDir = fs.mkdtempSync(path.join(os.tmpdir(), "screeps-harness-cli-nonzero-"));

    const exitCode = await runPrivateServerCli({
      argv: [`--artifactsDir=${artifactsDir}`],
      env: {},
      getProcessExitCode: () => 1,
      runTest: async (options) => {
        const summary = createInitialSummary(options, new Date("2026-07-05T00:00:00.000Z"));
        summary.status = "passed";
        return summary;
      },
      logError: () => {},
    });

    expect(exitCode).to.equal(1);

    const summaryJson = JSON.parse(fs.readFileSync(path.join(artifactsDir, "summary.json"), "utf8"));
    const summaryMarkdown = fs.readFileSync(path.join(artifactsDir, "summary.md"), "utf8");
    expect(summaryJson.status).to.equal("failed");
    expect(summaryJson.errors[0]).to.include("passed summary but process.exitCode=1");
    expect(summaryMarkdown).to.include("Status: failed");
    expect(summaryMarkdown).to.include("passed summary but process.exitCode=1");
  });
});
