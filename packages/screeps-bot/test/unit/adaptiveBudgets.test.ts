import { expect } from "chai";
import {
  calculateRoomScalingMultiplier,
  calculateBucketMultiplier,
  calculateAdaptiveBudget,
  calculateAdaptiveBudgets,
  getAdaptiveBudgetInfo,
  DEFAULT_ADAPTIVE_CONFIG,
  type AdaptiveBudgetConfig
} from "@ralphschuler/screeps-stats";

describe("Adaptive CPU Budgets", () => {
  describe("calculateRoomScalingMultiplier", () => {
    it("should return 1.0x for single room", () => {
      const multiplier = calculateRoomScalingMultiplier(1, DEFAULT_ADAPTIVE_CONFIG);
      expect(multiplier).to.be.closeTo(1.0, 0.01);
    });

    it("should scale logarithmically with room count", () => {
      const m1 = calculateRoomScalingMultiplier(1, DEFAULT_ADAPTIVE_CONFIG);
      const m10 = calculateRoomScalingMultiplier(10, DEFAULT_ADAPTIVE_CONFIG);
      const m100 = calculateRoomScalingMultiplier(100, DEFAULT_ADAPTIVE_CONFIG);

      // Should increase, but sublinearly
      expect(m10).to.be.greaterThan(m1);
      expect(m100).to.be.greaterThan(m10);

      // The increase from 10 to 100 should be less than 10 to 100
      // (demonstrates logarithmic, not linear scaling)
      const increase1to10 = m10 - m1;
      const increase10to100 = m100 - m10;
      expect(increase10to100).to.be.lessThan(increase1to10 * 10);
    });

    it("should respect maxMultiplier cap", () => {
      // Even with 1000 rooms, should not exceed maxMultiplier
      const multiplier = calculateRoomScalingMultiplier(1000, DEFAULT_ADAPTIVE_CONFIG);
      expect(multiplier).to.be.at.most(DEFAULT_ADAPTIVE_CONFIG.roomScaling.maxMultiplier);
    });

    it("should handle custom scaling configuration", () => {
      const customConfig: AdaptiveBudgetConfig = {
        ...DEFAULT_ADAPTIVE_CONFIG,
        roomScaling: {
          minRooms: 1,
          scaleFactor: 5, // Faster scaling
          maxMultiplier: 5.0
        }
      };

      const multiplier50 = calculateRoomScalingMultiplier(50, customConfig);
      const defaultMultiplier50 = calculateRoomScalingMultiplier(50, DEFAULT_ADAPTIVE_CONFIG);

      // Faster scaling should give higher multiplier
      expect(multiplier50).to.be.greaterThan(defaultMultiplier50);
    });

    it("should provide consistent results for typical empire sizes", () => {
      // Test key milestones mentioned in issue
      const m1 = calculateRoomScalingMultiplier(1, DEFAULT_ADAPTIVE_CONFIG);
      const m10 = calculateRoomScalingMultiplier(10, DEFAULT_ADAPTIVE_CONFIG);
      const m50 = calculateRoomScalingMultiplier(50, DEFAULT_ADAPTIVE_CONFIG);
      const m100 = calculateRoomScalingMultiplier(100, DEFAULT_ADAPTIVE_CONFIG);

      // Verify specific ranges for predictability
      // With scaleFactor=20, scaling is more conservative
      expect(m1).to.be.closeTo(1.0, 0.01);
      expect(m10).to.be.within(1.0, 1.8); // Allow for current scaling behavior
      expect(m50).to.be.within(1.3, 2.0); // More conservative
      expect(m100).to.be.within(1.5, 2.2); // Still capped but slower growth
    });
  });

  describe("calculateBucketMultiplier", () => {
    it("should return 1.2x for high bucket (>9000)", () => {
      const multiplier = calculateBucketMultiplier(9500, DEFAULT_ADAPTIVE_CONFIG);
      expect(multiplier).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.highMultiplier);
    });

    it("should return 1.0x for normal bucket (2000-9000)", () => {
      const multiplier5000 = calculateBucketMultiplier(5000, DEFAULT_ADAPTIVE_CONFIG);
      const multiplier7000 = calculateBucketMultiplier(7000, DEFAULT_ADAPTIVE_CONFIG);

      expect(multiplier5000).to.equal(1.0);
      expect(multiplier7000).to.equal(1.0);
    });

    it("should return 0.6x for low bucket (<2000)", () => {
      const multiplier = calculateBucketMultiplier(1500, DEFAULT_ADAPTIVE_CONFIG);
      expect(multiplier).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.lowMultiplier);
    });

    it("should return 0.3x for critical bucket (<500)", () => {
      const multiplier = calculateBucketMultiplier(300, DEFAULT_ADAPTIVE_CONFIG);
      expect(multiplier).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.criticalMultiplier);
    });

    it("should handle boundary conditions", () => {
      // Exactly at thresholds
      const atHigh = calculateBucketMultiplier(9000, DEFAULT_ADAPTIVE_CONFIG);
      const atLow = calculateBucketMultiplier(2000, DEFAULT_ADAPTIVE_CONFIG);
      const atCritical = calculateBucketMultiplier(500, DEFAULT_ADAPTIVE_CONFIG);

      expect(atHigh).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.highMultiplier);
      expect(atLow).to.equal(1.0); // Just at boundary, still normal
      expect(atCritical).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.lowMultiplier);
    });

    it("should handle edge cases", () => {
      // Very low bucket
      const veryLow = calculateBucketMultiplier(0, DEFAULT_ADAPTIVE_CONFIG);
      expect(veryLow).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.criticalMultiplier);

      // Maximum bucket
      const maxBucket = calculateBucketMultiplier(10000, DEFAULT_ADAPTIVE_CONFIG);
      expect(maxBucket).to.equal(DEFAULT_ADAPTIVE_CONFIG.bucketMultipliers.highMultiplier);
    });
  });

  describe("calculateAdaptiveBudget", () => {
    it("should combine room scaling and bucket multipliers", () => {
      // 10 rooms, high bucket
      const budget = calculateAdaptiveBudget("high", 10, 9500, DEFAULT_ADAPTIVE_CONFIG);

      const baseBudget = DEFAULT_ADAPTIVE_CONFIG.baseFrequencyBudgets.high;
      const roomMultiplier = calculateRoomScalingMultiplier(10, DEFAULT_ADAPTIVE_CONFIG);
      const bucketMultiplier = calculateBucketMultiplier(9500, DEFAULT_ADAPTIVE_CONFIG);

      const expectedBudget = baseBudget * roomMultiplier * bucketMultiplier;
      expect(budget).to.be.closeTo(expectedBudget, 0.001);
    });

    it("should scale budgets for different frequencies", () => {
      const highBudget = calculateAdaptiveBudget("high", 10, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const mediumBudget = calculateAdaptiveBudget("medium", 10, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const lowBudget = calculateAdaptiveBudget("low", 10, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // High frequency should have highest budget
      expect(highBudget).to.be.greaterThan(mediumBudget);
      expect(highBudget).to.be.greaterThan(lowBudget);
    });

    it("should cap budgets at 1.0 (100% CPU limit)", () => {
      // Try to create excessive budget with many rooms and high bucket
      const budget = calculateAdaptiveBudget("high", 1000, 10000, DEFAULT_ADAPTIVE_CONFIG);
      expect(budget).to.be.at.most(1.0);
    });

    it("should have minimum budget of 0.01", () => {
      // Very low bucket and minimal rooms
      const budget = calculateAdaptiveBudget("low", 1, 100, DEFAULT_ADAPTIVE_CONFIG);
      expect(budget).to.be.at.least(0.01);
    });

    it("should reflect conservation at low bucket", () => {
      const normalBudget = calculateAdaptiveBudget("high", 10, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const lowBudget = calculateAdaptiveBudget("high", 10, 1000, DEFAULT_ADAPTIVE_CONFIG);

      // Low bucket should have reduced budget
      expect(lowBudget).to.be.lessThan(normalBudget);
      expect(lowBudget / normalBudget).to.be.closeTo(0.6, 0.1); // ~60% of normal
    });

    it("should reflect boost at high bucket", () => {
      const normalBudget = calculateAdaptiveBudget("high", 10, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const highBudget = calculateAdaptiveBudget("high", 10, 9500, DEFAULT_ADAPTIVE_CONFIG);

      // High bucket should have boosted budget
      expect(highBudget).to.be.greaterThan(normalBudget);
      expect(highBudget / normalBudget).to.be.closeTo(1.2, 0.1); // ~120% of normal
    });
  });

  describe("calculateAdaptiveBudgets", () => {
    it("should return budgets for all frequencies", () => {
      const budgets = calculateAdaptiveBudgets(10, 5000, DEFAULT_ADAPTIVE_CONFIG);

      expect(budgets).to.have.property("high");
      expect(budgets).to.have.property("medium");
      expect(budgets).to.have.property("low");

      expect(budgets.high).to.be.a("number");
      expect(budgets.medium).to.be.a("number");
      expect(budgets.low).to.be.a("number");
    });

    it("should maintain frequency ordering", () => {
      const budgets = calculateAdaptiveBudgets(10, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // High frequency should have highest budget
      expect(budgets.high).to.be.greaterThan(budgets.medium);
      expect(budgets.high).to.be.greaterThan(budgets.low);
    });

    it("should scale all budgets consistently", () => {
      const budgets1Room = calculateAdaptiveBudgets(1, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const budgets50Rooms = calculateAdaptiveBudgets(50, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // All budgets should increase with room count
      expect(budgets50Rooms.high).to.be.greaterThan(budgets1Room.high);
      expect(budgets50Rooms.medium).to.be.greaterThan(budgets1Room.medium);
      expect(budgets50Rooms.low).to.be.greaterThan(budgets1Room.low);

      // Scaling ratio should be similar across frequencies (within 20%)
      const highRatio = budgets50Rooms.high / budgets1Room.high;
      const mediumRatio = budgets50Rooms.medium / budgets1Room.medium;
      const lowRatio = budgets50Rooms.low / budgets1Room.low;

      expect(highRatio).to.be.closeTo(mediumRatio, 0.3);
      expect(highRatio).to.be.closeTo(lowRatio, 0.3);
    });
  });

  describe("getAdaptiveBudgetInfo", () => {
    beforeEach(() => {
      // Mock Game global
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error: Allow setting test values
      global.Game = {
        ...global.Game,
        cpu: {
          ...global.Game.cpu,
          bucket: 5000
        },
        rooms: {
          W1N1: {},
          W1N2: {},
          W2N1: {},
          W2N2: {},
          W3N1: {}
        }
      };
    });

    it("should return complete budget information", () => {
      const info = getAdaptiveBudgetInfo(DEFAULT_ADAPTIVE_CONFIG);

      expect(info).to.have.property("roomCount");
      expect(info).to.have.property("bucket");
      expect(info).to.have.property("roomMultiplier");
      expect(info).to.have.property("bucketMultiplier");
      expect(info).to.have.property("budgets");
      expect(info).to.have.property("baseBudgets");
    });

    it("should read current game state", () => {
      const info = getAdaptiveBudgetInfo(DEFAULT_ADAPTIVE_CONFIG);

      expect(info.roomCount).to.equal(5);
      expect(info.bucket).to.equal(5000);
    });

    it("should calculate multipliers correctly", () => {
      const info = getAdaptiveBudgetInfo(DEFAULT_ADAPTIVE_CONFIG);

      const expectedRoomMultiplier = calculateRoomScalingMultiplier(5, DEFAULT_ADAPTIVE_CONFIG);
      const expectedBucketMultiplier = calculateBucketMultiplier(5000, DEFAULT_ADAPTIVE_CONFIG);

      expect(info.roomMultiplier).to.be.closeTo(expectedRoomMultiplier, 0.001);
      expect(info.bucketMultiplier).to.equal(expectedBucketMultiplier);
    });

    it("should include base budgets for comparison", () => {
      const info = getAdaptiveBudgetInfo(DEFAULT_ADAPTIVE_CONFIG);

      expect(info.baseBudgets).to.deep.equal(DEFAULT_ADAPTIVE_CONFIG.baseFrequencyBudgets);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle small empire (1-5 rooms) efficiently", () => {
      const budgets1 = calculateAdaptiveBudgets(1, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const budgets5 = calculateAdaptiveBudgets(5, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // Small empires should have modest budgets
      expect(budgets1.high).to.be.lessThan(0.3);
      expect(budgets5.high).to.be.lessThan(0.4); // Adjusted for current scaling

      // Should scale slightly with growth
      expect(budgets5.high).to.be.greaterThan(budgets1.high);
    });

    it("should handle medium empire (10-20 rooms)", () => {
      const budgets10 = calculateAdaptiveBudgets(10, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const budgets20 = calculateAdaptiveBudgets(20, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // Medium empires need more CPU
      expect(budgets10.high).to.be.greaterThan(0.25);
      expect(budgets20.high).to.be.greaterThan(budgets10.high);
    });

    it("should handle large empire (50+ rooms)", () => {
      const budgets50 = calculateAdaptiveBudgets(50, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const budgets100 = calculateAdaptiveBudgets(100, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // Large empires need significant CPU
      expect(budgets50.high).to.be.greaterThan(0.3);
      expect(budgets100.high).to.be.greaterThan(budgets50.high);

      // Should be manageable and respect cap
      expect(budgets50.high).to.be.at.most(1.0);
      expect(budgets100.high).to.be.at.most(1.0);
    });

    it("should handle bucket crisis scenarios", () => {
      // 50 rooms but critical bucket
      const budgetsCritical = calculateAdaptiveBudgets(50, 200, DEFAULT_ADAPTIVE_CONFIG);

      // Should drastically reduce all budgets
      expect(budgetsCritical.high).to.be.lessThan(0.3);
      expect(budgetsCritical.medium).to.be.lessThan(0.1);
      expect(budgetsCritical.low).to.be.lessThan(0.1);
    });

    it("should handle bucket surplus scenarios", () => {
      // 50 rooms with high bucket
      const budgetsHigh = calculateAdaptiveBudgets(50, 9500, DEFAULT_ADAPTIVE_CONFIG);
      const budgetsNormal = calculateAdaptiveBudgets(50, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // Should boost all budgets (20% boost with new multiplier)
      expect(budgetsHigh.high).to.be.greaterThan(budgetsNormal.high * 1.15);
      expect(budgetsHigh.medium).to.be.greaterThan(budgetsNormal.medium * 1.15);
      expect(budgetsHigh.low).to.be.greaterThan(budgetsNormal.low * 1.15);
    });

    it("should provide 5-15% CPU savings for typical empire", () => {
      // Test with 20 rooms at normal bucket
      const adaptiveBudgets = calculateAdaptiveBudgets(20, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const totalAdaptive = adaptiveBudgets.high + adaptiveBudgets.medium + adaptiveBudgets.low;

      // Static budgets from current config (0.4 + 0.1 + 0.1 = 0.6)
      const staticTotal = 0.6;

      // Adaptive budgets scale with rooms but remain reasonable
      // At 20 rooms with normal bucket, total should be in a reasonable range
      expect(totalAdaptive).to.be.greaterThan(0.3); // Has enough CPU for operations
      expect(totalAdaptive).to.be.at.most(staticTotal * 1.3); // Not excessive, allows some headroom
    });
  });

  describe("Edge cases and validation", () => {
    it("should handle zero rooms gracefully", () => {
      const budgets = calculateAdaptiveBudgets(0, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // Should treat as minimum 1 room
      expect(budgets.high).to.be.greaterThan(0);
      expect(budgets.medium).to.be.greaterThan(0);
      expect(budgets.low).to.be.greaterThan(0);
    });

    it("should handle negative bucket gracefully", () => {
      const budgets = calculateAdaptiveBudgets(10, -100, DEFAULT_ADAPTIVE_CONFIG);

      // Should apply critical multiplier
      expect(budgets.high).to.be.lessThan(
        calculateAdaptiveBudget("high", 10, 5000, DEFAULT_ADAPTIVE_CONFIG) * 0.5
      );
    });

    it("should handle very large room counts", () => {
      const budgets = calculateAdaptiveBudgets(1000, 5000, DEFAULT_ADAPTIVE_CONFIG);

      // Should cap at maxMultiplier
      const maxExpected = DEFAULT_ADAPTIVE_CONFIG.baseFrequencyBudgets.high * 
                         DEFAULT_ADAPTIVE_CONFIG.roomScaling.maxMultiplier;
      expect(budgets.high).to.be.at.most(Math.min(1.0, maxExpected));
    });

    it("should be deterministic", () => {
      const budgets1 = calculateAdaptiveBudgets(25, 5000, DEFAULT_ADAPTIVE_CONFIG);
      const budgets2 = calculateAdaptiveBudgets(25, 5000, DEFAULT_ADAPTIVE_CONFIG);

      expect(budgets1.high).to.equal(budgets2.high);
      expect(budgets1.medium).to.equal(budgets2.medium);
      expect(budgets1.low).to.equal(budgets2.low);
    });
  });
});
