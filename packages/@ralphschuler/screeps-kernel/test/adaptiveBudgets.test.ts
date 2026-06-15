import { expect } from "chai";
import {
  DEFAULT_ADAPTIVE_CONFIG,
  calculateAdaptiveBudget,
  calculateAdaptiveBudgets,
  FrequencyUtilizationSnapshot
} from "../src/adaptiveBudgets.ts";

describe("Adaptive Budget Tuning", () => {
  it("should keep default budgets unchanged without utilization feedback", () => {
    const roomCount = 10;
    const bucket = 5000;

    const baseBudgets = calculateAdaptiveBudgets(roomCount, bucket);
    const tunedBudgets = calculateAdaptiveBudgets(roomCount, bucket, DEFAULT_ADAPTIVE_CONFIG, {});

    expect(tunedBudgets.high).to.equal(baseBudgets.high);
    expect(tunedBudgets.medium).to.equal(baseBudgets.medium);
    expect(tunedBudgets.low).to.equal(baseBudgets.low);
  });

  it("should reduce budgets when a frequency is overutilized", () => {
    const roomCount = 10;
    const bucket = 5000;
    const utilization: FrequencyUtilizationSnapshot = {
      high: 1.4
    };

    const base = calculateAdaptiveBudget("high", roomCount, bucket);
    const tuned = calculateAdaptiveBudget("high", roomCount, bucket, DEFAULT_ADAPTIVE_CONFIG, utilization);

    expect(tuned).to.be.lessThan(base);
    expect(tuned).to.be.closeTo(
      base * DEFAULT_ADAPTIVE_CONFIG.performance.minPerformanceBoost,
      1e-12,
      "high utilization should clamp to min performance boost"
    );
  });

  it("should increase budgets when a frequency is underutilized", () => {
    const roomCount = 10;
    const bucket = 5000;
    const utilization: FrequencyUtilizationSnapshot = {
      high: 0.1
    };

    const base = calculateAdaptiveBudget("high", roomCount, bucket);
    const tuned = calculateAdaptiveBudget("high", roomCount, bucket, DEFAULT_ADAPTIVE_CONFIG, utilization);

    expect(tuned).to.be.greaterThan(base);
    expect(tuned).to.be.closeTo(
      base * DEFAULT_ADAPTIVE_CONFIG.performance.maxPerformanceBoost,
      1e-12,
      "low utilization should clamp to max performance boost"
    );
  });

  it("should tune only frequencies with provided utilization data", () => {
    const roomCount = 10;
    const bucket = 5000;

    const tuned = calculateAdaptiveBudgets(roomCount, bucket, DEFAULT_ADAPTIVE_CONFIG, {
      high: 1.4
    });
    const baseline = calculateAdaptiveBudgets(roomCount, bucket, DEFAULT_ADAPTIVE_CONFIG, {});

    expect(tuned.high).to.be.lessThan(baseline.high);
    expect(tuned.medium).to.equal(baseline.medium);
    expect(tuned.low).to.equal(baseline.low);
  });
});
