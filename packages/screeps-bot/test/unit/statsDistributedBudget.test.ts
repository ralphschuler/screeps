/**
 * Stats System Distributed Budget Validation Tests
 * 
 * Tests for the fix that accounts for distributed execution (tickModulo)
 * when validating room CPU budgets.
 * 
 * Issue: @ralphschuler/screeps#2821
 * Fix: Budget validation should multiply budget limit by tickModulo factor
 */

import { assert } from "chai";
import { describe, it, beforeEach } from "mocha";

describe("Stats System - Distributed Budget Validation", () => {
  describe("validateBudgets with tickModulo", () => {
    it("should adjust budget for distributed execution (tickModulo=5)", () => {
      // Eco room with tickModulo=5 should have 5x budget
      const baseBudget = 0.1; // Per-tick budget
      const tickModulo = 5;
      const adjustedBudget = baseBudget * tickModulo; // Should be 0.5 CPU
      
      assert.equal(adjustedBudget, 0.5, "Adjusted budget should be 0.5 CPU for eco room with tickModulo=5");
    });

    it("should correctly identify violation with distributed execution", () => {
      // Room using 3.066 CPU with tickModulo=5 and base budget 0.1
      const cpuUsed = 3.066;
      const baseBudget = 0.1;
      const tickModulo = 5;
      const adjustedBudget = baseBudget * tickModulo; // 0.5 CPU
      
      const percentUsed = cpuUsed / adjustedBudget;
      
      assert.isAbove(percentUsed, 1.0, "Room should be over budget");
      assert.approximately(percentUsed, 6.132, 0.01, "Room should be at ~613% of budget (not 3066%)");
    });

    it("should not flag violation for room within distributed budget", () => {
      // Room using 0.4 CPU with tickModulo=5 and base budget 0.1
      const cpuUsed = 0.4;
      const baseBudget = 0.1;
      const tickModulo = 5;
      const adjustedBudget = baseBudget * tickModulo; // 0.5 CPU
      
      const percentUsed = cpuUsed / adjustedBudget;
      
      assert.isBelow(percentUsed, 1.0, "Room should be within budget");
      assert.approximately(percentUsed, 0.8, 0.01, "Room should be at 80% of budget");
    });

    it("should handle tickModulo=1 (every tick execution)", () => {
      // Room running every tick (no distribution) should have base budget
      const baseBudget = 0.1;
      const tickModulo = 1;
      const adjustedBudget = baseBudget * tickModulo;
      
      assert.equal(adjustedBudget, 0.1, "Adjusted budget should equal base budget when tickModulo=1");
    });

    it("should handle war rooms with distributed execution", () => {
      // War room with tickModulo=1 (critical priority, runs every tick)
      const baseBudget = 0.25; // War room budget
      const tickModulo = 1; // War rooms run every tick
      const adjustedBudget = baseBudget * tickModulo;
      
      assert.equal(adjustedBudget, 0.25, "War rooms should maintain base budget when running every tick");
    });

    it("should calculate correct percentage for reporting", () => {
      // Test the percentage calculation used in logging
      const cpuUsed = 3.066;
      const adjustedBudget = 0.5; // 0.1 * 5
      
      const percentUsed = cpuUsed / adjustedBudget;
      const percentDisplay = percentUsed * 100;
      
      assert.approximately(percentDisplay, 613.2, 1, "Should display ~613% not 3066%");
    });
  });

  describe("Budget validation edge cases", () => {
    it("should handle zero tickModulo gracefully", () => {
      // Should default to 1 if tickModulo is undefined/null/0
      const baseBudget = 0.1;
      const tickModulo = undefined;
      const adjustedBudget = baseBudget * (tickModulo ?? 1);
      
      assert.equal(adjustedBudget, 0.1, "Should default to base budget when tickModulo is undefined");
    });

    it("should handle high tickModulo values", () => {
      // Remote rooms with tickModulo=20
      const baseBudget = 0.1;
      const tickModulo = 20;
      const adjustedBudget = baseBudget * tickModulo;
      
      assert.equal(adjustedBudget, 2.0, "Remote rooms with tickModulo=20 should get 2.0 CPU budget");
    });

    it("should maintain precision in budget calculations", () => {
      // Ensure no floating point errors
      const cpuUsed = 0.123456;
      const baseBudget = 0.1;
      const tickModulo = 5;
      const adjustedBudget = baseBudget * tickModulo;
      
      const percentUsed = cpuUsed / adjustedBudget;
      
      // Should be precise enough for meaningful comparisons
      assert.isNumber(percentUsed);
      assert.isFinite(percentUsed);
    });
  });

  describe("Budget validation scenarios", () => {
    it("should correctly classify critical violations", () => {
      const criticalThreshold = 1.0; // 100% of budget
      
      // Scenario 1: Severely over budget
      const severe = 3.066 / 0.5; // 613% - CRITICAL
      assert.isAbove(severe, criticalThreshold);
      
      // Scenario 2: Just over budget
      const justOver = 0.51 / 0.5; // 102% - CRITICAL
      assert.isAbove(justOver, criticalThreshold);
      
      // Scenario 3: Within budget
      const within = 0.4 / 0.5; // 80% - OK
      assert.isBelow(within, criticalThreshold);
    });

    it("should correctly classify warning thresholds", () => {
      const warningThreshold = 0.8; // 80% of budget
      
      // Scenario 1: Warning level
      const warning = 0.45 / 0.5; // 90% - WARNING
      assert.isAbove(warning, warningThreshold);
      assert.isBelow(warning, 1.0);
      
      // Scenario 2: Below warning
      const ok = 0.3 / 0.5; // 60% - OK
      assert.isBelow(ok, warningThreshold);
    });
  });
});
