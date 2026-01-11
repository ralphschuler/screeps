/**
 * Tests for Tower Repair Logic
 * Tests the RCL-based wall/rampart repair targeting
 */

import { assert } from "chai";
import "mocha";
import { calculateWallRepairTarget } from "@ralphschuler/screeps-defense";

describe("Tower Repair Target Calculation", () => {
  describe("RCL-based targeting", () => {
    it("should return 0 for RCL 1 (no ramparts)", () => {
      const target = calculateWallRepairTarget(1, 0);
      assert.equal(target, 0);
    });

    it("should return correct values for RCL 2", () => {
      assert.equal(calculateWallRepairTarget(2, 0), 90000);    // 30% of 300K
      assert.equal(calculateWallRepairTarget(2, 1), 150000);   // 50% of 300K
      assert.equal(calculateWallRepairTarget(2, 2), 240000);   // 80% of 300K
      assert.equal(calculateWallRepairTarget(2, 3), 300000);   // 100% of 300K
    });

    it("should return correct values for RCL 4", () => {
      assert.equal(calculateWallRepairTarget(4, 0), 900000);   // 30% of 3M
      assert.equal(calculateWallRepairTarget(4, 1), 1500000);  // 50% of 3M
      assert.equal(calculateWallRepairTarget(4, 2), 2400000);  // 80% of 3M
      assert.equal(calculateWallRepairTarget(4, 3), 3000000);  // 100% of 3M
    });

    it("should return correct values for RCL 8", () => {
      assert.equal(calculateWallRepairTarget(8, 0), 90000000);  // 30% of 300M
      assert.equal(calculateWallRepairTarget(8, 1), 150000000); // 50% of 300M
      assert.equal(calculateWallRepairTarget(8, 2), 240000000); // 80% of 300M
      assert.equal(calculateWallRepairTarget(8, 3), 300000000); // 100% of 300M
    });
  });

  describe("Danger level scaling", () => {
    it("should scale repair targets with danger level at RCL 3", () => {
      const rcl3Max = 1000000; // 1M
      
      assert.equal(calculateWallRepairTarget(3, 0), Math.floor(rcl3Max * 0.3), "danger 0 = 30%");
      assert.equal(calculateWallRepairTarget(3, 1), Math.floor(rcl3Max * 0.5), "danger 1 = 50%");
      assert.equal(calculateWallRepairTarget(3, 2), Math.floor(rcl3Max * 0.8), "danger 2 = 80%");
      assert.equal(calculateWallRepairTarget(3, 3), Math.floor(rcl3Max * 1.0), "danger 3 = 100%");
    });

    it("should increase repair urgency with danger level at RCL 6", () => {
      const peaceful = calculateWallRepairTarget(6, 0);
      const threat = calculateWallRepairTarget(6, 1);
      const attack = calculateWallRepairTarget(6, 2);
      const siege = calculateWallRepairTarget(6, 3);

      assert.isTrue(threat > peaceful, "Threat level should have higher target than peaceful");
      assert.isTrue(attack > threat, "Attack level should have higher target than threat");
      assert.isTrue(siege > attack, "Siege level should have higher target than attack");
    });
  });

  describe("Edge cases", () => {
    it("should handle invalid RCL gracefully", () => {
      assert.equal(calculateWallRepairTarget(0, 0), 0);
      assert.equal(calculateWallRepairTarget(9, 0), 0);
      assert.equal(calculateWallRepairTarget(-1, 0), 0);
    });

    it("should handle danger levels outside 0-3", () => {
      // Should clamp to max (danger 3 behavior)
      const normalMax = calculateWallRepairTarget(5, 3);
      const aboveMax = calculateWallRepairTarget(5, 4);
      
      // In the implementation, danger > 3 still uses 1.0 multiplier
      assert.equal(aboveMax, normalMax);
    });
  });

  describe("Progressive repair strategy", () => {
    it("should maintain walls at low threshold in peaceful RCL 2-3 rooms", () => {
      // Early game rooms should maintain walls at 30% of max
      const rcl2Peaceful = calculateWallRepairTarget(2, 0);
      const rcl3Peaceful = calculateWallRepairTarget(3, 0);
      
      assert.equal(rcl2Peaceful, 90000);   // 30% of 300K
      assert.equal(rcl3Peaceful, 300000);  // 30% of 1M
    });

    it("should fortify walls for high-level rooms under threat", () => {
      // High RCL rooms under siege should fortify to max
      const rcl7Siege = calculateWallRepairTarget(7, 3);
      const rcl8Siege = calculateWallRepairTarget(8, 3);
      
      assert.equal(rcl7Siege, 100000000);  // 100M
      assert.equal(rcl8Siege, 300000000);  // 300M
    });

    it("should scale smoothly across RCL progression", () => {
      // Check that targets increase with RCL for same danger level
      const targets = [];
      for (let rcl = 2; rcl <= 8; rcl++) {
        targets.push(calculateWallRepairTarget(rcl, 1)); // danger 1 (50%)
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
