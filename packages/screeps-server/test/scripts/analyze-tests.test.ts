import { expect } from "chai";
import {
  applyHarnessSummary,
  buildEmptyReport,
  buildReport,
  generateMarkdown,
  inferHarnessMode,
} from "../../scripts/analyze-tests.js";

describe("server test report validation", () => {
  it("fails the report when transport fails despite zero assertion failures", () => {
    const report = buildEmptyReport();

    applyHarnessSummary(report, {
      mode: "smoke",
      summary: {
        status: "failed",
        checks: { modResultsPresent: true },
        metrics: {
          screepsmodTesting: { source: "server", total: 43, passed: 43, failed: 0, skipped: 0 },
          validation: {
            assertions: { status: "passed", total: 43, passed: 43, failed: 0, skipped: 0 },
            transport: { status: "failed", error: "connect ECONNRESET" },
          },
        },
      },
    });

    expect(report.validation.status).to.equal("failed");
    expect(report.validation.failures).to.include("transport failed");
    expect(report.summary.failed).to.equal(1);
    expect(report.integration.passed).to.equal(false);
  });

  it("fails the report when assertion counts are inconsistent", () => {
    const report = buildEmptyReport();

    applyHarnessSummary(report, {
      mode: "smoke",
      summary: {
        status: "passed",
        checks: { modResultsPresent: true },
        metrics: {
          screepsmodTesting: { source: "server", total: 10, passed: 8, failed: 0, skipped: 0 },
        },
      },
    });

    expect(report.validation.status).to.equal("failed");
    expect(report.validation.failures).to.include("assertions inconsistent");
    expect(report.integration.passed).to.equal(false);
    expect(report.summary.failed).to.equal(1);
  });

  it("fails closed when a required harness summary is missing", () => {
    const report = buildReport({ mode: "smoke", harnessSummary: null });

    expect(report.validation.status).to.equal("failed");
    expect(report.validation.failures).to.deep.equal(["harness summary missing for mode: smoke"]);
    expect(report.summary.failed).to.equal(1);
    expect(report.integration.passed).to.equal(false);
    expect(generateMarkdown(report)).to.include("harness summary missing for mode: smoke");
  });

  it("fails closed when a harness summary has zero assertions", () => {
    const report = buildReport({
      mode: "long",
      harnessSummary: {
        mode: "long",
        summary: {
          status: "passed",
          checks: { modResultsPresent: true },
          metrics: {
            screepsmodTesting: { source: "server", total: 0, passed: 0, failed: 0, skipped: 0 },
          },
        },
      },
    });

    expect(report.validation.status).to.equal("failed");
    expect(report.validation.failures).to.include("assertions unknown");
    expect(report.summary.failed).to.equal(1);
    expect(report.integration.passed).to.equal(false);
  });

  it("fails closed when required harness status or mod evidence is missing", () => {
    const report = buildReport({
      mode: "smoke",
      harnessSummary: {
        mode: "smoke",
        summary: {
          checks: { modResultsPresent: false },
          metrics: {
            screepsmodTesting: { source: "server", total: 1, passed: 1, failed: 0, skipped: 0 },
          },
        },
      },
    });

    expect(report.validation.status).to.equal("failed");
    expect(report.validation.failures).to.include("harness status: missing");
    expect(report.validation.failures).to.include("mod results missing");
    expect(report.summary.failed).to.equal(1);
  });

  it("recognizes an explicit mode without npm_config_argv metadata", () => {
    const originalArgv = process.argv;
    const originalNpmArgv = process.env.npm_config_argv;
    const originalLifecycle = process.env.npm_lifecycle_event;

    try {
      process.argv = ["node", "analyze-tests.js", "--mode=packages"];
      delete process.env.npm_config_argv;
      delete process.env.npm_lifecycle_event;
      expect(inferHarnessMode()).to.equal("packages");
    } finally {
      process.argv = originalArgv;
      if (originalNpmArgv === undefined) delete process.env.npm_config_argv;
      else process.env.npm_config_argv = originalNpmArgv;
      if (originalLifecycle === undefined) delete process.env.npm_lifecycle_event;
      else process.env.npm_lifecycle_event = originalLifecycle;
    }
  });

  it("keeps package-only reporting explicitly valid without a harness summary", () => {
    const report = buildReport({ mode: "packages", harnessSummary: null });

    expect(report.validation).to.equal(undefined);
    expect(report.packages.passed).to.equal(true);
    expect(report.summary.failed).to.equal(0);
    expect(generateMarkdown(report)).to.include("⏭️ **Status**: Not run");
  });
});
