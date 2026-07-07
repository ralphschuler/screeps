import { expect } from "chai";
import {
  calculateAdaptiveBudget,
  calculateAdaptiveBudgets,
  calculateBucketMultiplier,
  calculateRoomScalingMultiplier,
  DEFAULT_ADAPTIVE_CONFIG,
  getAdaptiveBudgetInfo,
  type FrequencyUtilizationSnapshot
} from "../src/adaptiveBudgets.ts";
import {
  calculateAdaptiveBudgets as calculateKernelAdaptiveBudgets,
  DEFAULT_ADAPTIVE_CONFIG as KERNEL_DEFAULT_ADAPTIVE_CONFIG
} from "../../screeps-kernel/src/adaptiveBudgets.ts";

describe("Adaptive CPU Budgets", () => {
  beforeEach(() => {
    Game.rooms = {};
    Game.cpu.bucket = 5000;
  });

  it("keeps stats and kernel adapters in parity for representative runtime states", () => {
    expect(DEFAULT_ADAPTIVE_CONFIG).to.deep.equal(KERNEL_DEFAULT_ADAPTIVE_CONFIG);

    const scenarios: Array<{
      roomCount: number;
      bucket: number;
      utilization: FrequencyUtilizationSnapshot;
    }> = [
      { roomCount: 1, bucket: 300, utilization: { high: 1.4 } },
      { roomCount: 10, bucket: 5000, utilization: { medium: 0.1 } },
      { roomCount: 50, bucket: 9500, utilization: { high: 0.75, low: 1.2 } },
      { roomCount: 100, bucket: 1500, utilization: {} }
    ];

    for (const scenario of scenarios) {
      const statsBudgets = calculateAdaptiveBudgets(
        scenario.roomCount,
        scenario.bucket,
        DEFAULT_ADAPTIVE_CONFIG,
        scenario.utilization
      );
      const kernelBudgets = calculateKernelAdaptiveBudgets(
        scenario.roomCount,
        scenario.bucket,
        KERNEL_DEFAULT_ADAPTIVE_CONFIG,
        scenario.utilization
      );

      expect(statsBudgets.high).to.be.closeTo(kernelBudgets.high, 1e-12);
      expect(statsBudgets.medium).to.be.closeTo(kernelBudgets.medium, 1e-12);
      expect(statsBudgets.low).to.be.closeTo(kernelBudgets.low, 1e-12);
    }
  });

  it("keeps default room scaling inside the intended empire-size envelope", () => {
    const oneRoom = calculateRoomScalingMultiplier(1, DEFAULT_ADAPTIVE_CONFIG);
    const tenRooms = calculateRoomScalingMultiplier(10, DEFAULT_ADAPTIVE_CONFIG);
    const fiftyRooms = calculateRoomScalingMultiplier(50, DEFAULT_ADAPTIVE_CONFIG);
    const hundredRooms = calculateRoomScalingMultiplier(100, DEFAULT_ADAPTIVE_CONFIG);

    expect(oneRoom).to.be.closeTo(1.0, 0.001);
    expect(tenRooms).to.be.closeTo(1.5, 0.001);
    expect(fiftyRooms).to.be.at.most(2.0);
    expect(hundredRooms).to.be.at.most(2.2);
  });

  it("keeps room scaling finite when custom configs contain unsafe values", () => {
    const unsafeConfig = {
      ...DEFAULT_ADAPTIVE_CONFIG,
      roomScaling: {
        minRooms: 0,
        scaleFactor: -1,
        maxMultiplier: 2.5
      }
    };

    const multiplier = calculateRoomScalingMultiplier(10, unsafeConfig);

    expect(multiplier).to.be.closeTo(1.5, 0.001);
    expect(Number.isFinite(multiplier)).to.equal(true);
    expect(calculateAdaptiveBudget("high", 10, 5000, unsafeConfig)).to.be.closeTo(
      DEFAULT_ADAPTIVE_CONFIG.baseFrequencyBudgets.high * multiplier,
      0.001
    );
  });

  it("applies bucket multipliers at the configured thresholds", () => {
    expect(calculateBucketMultiplier(9500, DEFAULT_ADAPTIVE_CONFIG)).to.equal(1.2);
    expect(calculateBucketMultiplier(5000, DEFAULT_ADAPTIVE_CONFIG)).to.equal(1.0);
    expect(calculateBucketMultiplier(1500, DEFAULT_ADAPTIVE_CONFIG)).to.equal(0.6);
    expect(calculateBucketMultiplier(300, DEFAULT_ADAPTIVE_CONFIG)).to.equal(0.3);
  });

  it("calculates adaptive budgets for all process frequencies", () => {
    const budgets = calculateAdaptiveBudgets(10, 5000, DEFAULT_ADAPTIVE_CONFIG);

    expect(budgets.high).to.be.closeTo(calculateAdaptiveBudget("high", 10, 5000), 0.001);
    expect(budgets.medium).to.be.greaterThan(budgets.low);
    expect(budgets.high).to.be.greaterThan(budgets.medium);
  });

  it("reports live Game state in diagnostic budget info", () => {
    Game.rooms = {
      W1N1: {} as Room,
      W1N2: {} as Room,
      W2N1: {} as Room
    };
    Game.cpu.bucket = 9500;

    const info = getAdaptiveBudgetInfo();

    expect(info.roomCount).to.equal(3);
    expect(info.bucket).to.equal(9500);
    expect(info.bucketMultiplier).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.highMultiplier);
    expect(info.budgets.high).to.be.greaterThan(DEFAULT_ADAPTIVE_CONFIG.baseFrequencyBudgets.high);
  });
});
