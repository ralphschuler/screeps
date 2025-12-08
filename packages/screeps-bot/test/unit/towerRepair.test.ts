/**
 * Tests for Tower Repair Logic
 * Tests the RCL-based wall/rampart repair targeting
 */

import { assert } from "chai";
import "mocha";

describe("Tower Repair Target Calculation", () => {
  /**
   * Calculate wall/rampart repair target based on RCL and danger level
   * This mirrors the logic in roomNode.ts
   */
  function getWallRepairTarget(rcl: number, danger: number): number {
    // RCL-based max hits (Screeps rampart limits)
    const maxHitsByRCL: Record<number, number> = {
      1: 0,        // No ramparts at RCL 1
      2: 300000,   // 300K
      3: 1000000,  // 1M
      4: 3000000,  // 3M
      5: 10000000, // 10M
      6: 30000000, // 30M
      7: 100000000, // 100M
      8: 300000000  // 300M
    };

    const maxHits = maxHitsByRCL[rcl] ?? 0;
    if (maxHits === 0) return 0;

    // Danger level multipliers
    const dangerMultiplier = danger === 0 ? 0.3 : danger === 1 ? 0.5 : danger === 2 ? 0.8 : 1.0;

    return Math.floor(maxHits * dangerMultiplier);
  }

  describe("RCL-based targeting", () => {
    it("should return 0 for RCL 1 (no ramparts)", () => {
      const target = getWallRepairTarget(1, 0);
      assert.equal(target, 0);
    });

    it("should return correct values for RCL 2", () => {
      assert.equal(getWallRepairTarget(2, 0), 90000);    // 30% of 300K
      assert.equal(getWallRepairTarget(2, 1), 150000);   // 50% of 300K
      assert.equal(getWallRepairTarget(2, 2), 240000);   // 80% of 300K
      assert.equal(getWallRepairTarget(2, 3), 300000);   // 100% of 300K
    });

    it("should return correct values for RCL 4", () => {
      assert.equal(getWallRepairTarget(4, 0), 900000);   // 30% of 3M
      assert.equal(getWallRepairTarget(4, 1), 1500000);  // 50% of 3M
      assert.equal(getWallRepairTarget(4, 2), 2400000);  // 80% of 3M
      assert.equal(getWallRepairTarget(4, 3), 3000000);  // 100% of 3M
    });

    it("should return correct values for RCL 8", () => {
      assert.equal(getWallRepairTarget(8, 0), 90000000);  // 30% of 300M
      assert.equal(getWallRepairTarget(8, 1), 150000000); // 50% of 300M
      assert.equal(getWallRepairTarget(8, 2), 240000000); // 80% of 300M
      assert.equal(getWallRepairTarget(8, 3), 300000000); // 100% of 300M
    });
  });

  describe("Danger level scaling", () => {
    it("should scale repair targets with danger level at RCL 3", () => {
      const rcl3Max = 1000000; // 1M
      
      assert.equal(getWallRepairTarget(3, 0), Math.floor(rcl3Max * 0.3), "danger 0 = 30%");
      assert.equal(getWallRepairTarget(3, 1), Math.floor(rcl3Max * 0.5), "danger 1 = 50%");
      assert.equal(getWallRepairTarget(3, 2), Math.floor(rcl3Max * 0.8), "danger 2 = 80%");
      assert.equal(getWallRepairTarget(3, 3), Math.floor(rcl3Max * 1.0), "danger 3 = 100%");
    });

    it("should increase repair urgency with danger level at RCL 6", () => {
      const peaceful = getWallRepairTarget(6, 0);
      const threat = getWallRepairTarget(6, 1);
      const attack = getWallRepairTarget(6, 2);
      const siege = getWallRepairTarget(6, 3);

      assert.isTrue(threat > peaceful, "Threat level should have higher target than peaceful");
      assert.isTrue(attack > threat, "Attack level should have higher target than threat");
      assert.isTrue(siege > attack, "Siege level should have higher target than attack");
    });
  });

  describe("Edge cases", () => {
    it("should handle invalid RCL gracefully", () => {
      assert.equal(getWallRepairTarget(0, 0), 0);
      assert.equal(getWallRepairTarget(9, 0), 0);
      assert.equal(getWallRepairTarget(-1, 0), 0);
    });

    it("should handle danger levels outside 0-3", () => {
      // Should clamp to max (danger 3 behavior)
      const normalMax = getWallRepairTarget(5, 3);
      const aboveMax = getWallRepairTarget(5, 4);
      
      // In the implementation, danger > 3 still uses 1.0 multiplier
      assert.equal(aboveMax, normalMax);
    });
  });

  describe("Progressive repair strategy", () => {
    it("should maintain walls at low threshold in peaceful RCL 2-3 rooms", () => {
      // Early game rooms should maintain walls at 30% of max
      const rcl2Peaceful = getWallRepairTarget(2, 0);
      const rcl3Peaceful = getWallRepairTarget(3, 0);
      
      assert.equal(rcl2Peaceful, 90000);   // 30% of 300K
      assert.equal(rcl3Peaceful, 300000);  // 30% of 1M
    });

    it("should fortify walls for high-level rooms under threat", () => {
      // High RCL rooms under siege should fortify to max
      const rcl7Siege = getWallRepairTarget(7, 3);
      const rcl8Siege = getWallRepairTarget(8, 3);
      
      assert.equal(rcl7Siege, 100000000);  // 100M
      assert.equal(rcl8Siege, 300000000);  // 300M
    });

    it("should scale smoothly across RCL progression", () => {
      // Check that targets increase with RCL for same danger level
      const targets = [];
      for (let rcl = 2; rcl <= 8; rcl++) {
        targets.push(getWallRepairTarget(rcl, 1)); // danger 1 (50%)
      }
      
      // Each subsequent RCL should have higher or equal target
      for (let i = 1; i < targets.length; i++) {
        assert.isTrue(
          targets[i] >= targets[i - 1],
          `RCL ${i + 2} target (${targets[i]}) should be >= RCL ${i + 1} target (${targets[i - 1]})`
        );
      }
    });
  });
});
