import { expect } from "chai";
import { applyHarnessSummary, buildEmptyReport } from "../../scripts/analyze-tests.js";

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
});
