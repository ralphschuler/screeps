/**
 * CPU Budget Manager Tests
 *
 * Tests for per-subsystem CPU budgeting and tracking
 */

import { assert } from "chai";
import { CpuBudgetManager, SubsystemType } from "../../src/core/cpuBudgetManager";

describe("CpuBudgetManager", () => {
  let manager: CpuBudgetManager;

  beforeEach(() => {
    // Mock Game.cpu.getUsed()
    let cpuUsed = 0;
    (global as any).Game = {
      cpu: {
        getUsed: () => cpuUsed,
        limit: 20,
        bucket: 10000
      },
      time: 1000
    };

    manager = new CpuBudgetManager({
      ecoRoomLimit: 0.1,
      warRoomLimit: 0.25,
      overmindLimit: 1.0,
      strictMode: false
    });

    // Helper to set CPU used
    (global as any).setCpuUsed = (value: number) => {
      cpuUsed = value;
    };
  });

  describe("checkBudget", () => {
    it("should return true when within budget", () => {
      const withinBudget = manager.checkBudget("testRoom", "ecoRoom", 0.05);
      assert.isTrue(withinBudget);
    });

    it("should return false when over budget", () => {
      const withinBudget = manager.checkBudget("testRoom", "ecoRoom", 0.15);
      assert.isFalse(withinBudget);
    });

    it("should track violations", () => {
      manager.checkBudget("testRoom", "ecoRoom", 0.15);
      const violations = manager.getViolationsSummary();
      assert.equal(violations.length, 1);
      assert.equal(violations[0].subsystem, "testRoom");
      assert.equal(violations[0].violations, 1);
    });

    it("should apply correct limits for eco rooms", () => {
      const config = manager.getConfig();
      assert.equal(config.ecoRoomLimit, 0.1);
    });

    it("should apply correct limits for war rooms", () => {
      const config = manager.getConfig();
      assert.equal(config.warRoomLimit, 0.25);
    });

    it("should apply correct limits for overmind", () => {
      const config = manager.getConfig();
      assert.equal(config.overmindLimit, 1.0);
    });
  });

  describe("executeWithBudget", () => {
    it("should execute function and track CPU", () => {
      (global as any).setCpuUsed(0);
      let executed = false;

      const result = manager.executeWithBudget("testSubsystem", "other", () => {
        (global as any).setCpuUsed(0.3);
        executed = true;
        return "success";
      });

      assert.isTrue(executed);
      assert.equal(result, "success");
    });

    it("should catch and log errors", () => {
      const result = manager.executeWithBudget("testSubsystem", "other", () => {
        throw new Error("Test error");
      });

      assert.isNull(result);
    });

    it("should track budget violations", () => {
      (global as any).setCpuUsed(0);

      manager.executeWithBudget("testSubsystem", "ecoRoom", () => {
        (global as any).setCpuUsed(0.2); // Over budget for eco room
      });

      const violations = manager.getViolationsSummary();
      assert.isAtLeast(violations.length, 1);
    });
  });

  describe("executeRoomWithBudget", () => {
    it("should execute room logic with eco budget", () => {
      (global as any).setCpuUsed(0);
      let executed = false;

      manager.executeRoomWithBudget("W1N1", false, () => {
        (global as any).setCpuUsed(0.05);
        executed = true;
      });

      assert.isTrue(executed);
    });

    it("should execute room logic with war budget", () => {
      (global as any).setCpuUsed(0);
      let executed = false;

      manager.executeRoomWithBudget("W1N1", true, () => {
        (global as any).setCpuUsed(0.2);
        executed = true;
      });

      assert.isTrue(executed);
    });

    it("should track violations for over-budget rooms", () => {
      (global as any).setCpuUsed(0);

      manager.executeRoomWithBudget("W1N1", false, () => {
        (global as any).setCpuUsed(0.3); // Way over budget
      });

      const violations = manager.getViolationsSummary();
      assert.equal(violations[0].subsystem, "W1N1");
    });
  });

  describe("resetViolations", () => {
    it("should clear all violations", () => {
      manager.checkBudget("testRoom1", "ecoRoom", 0.15);
      manager.checkBudget("testRoom2", "ecoRoom", 0.15);

      let violations = manager.getViolationsSummary();
      assert.equal(violations.length, 2);

      manager.resetViolations();
      violations = manager.getViolationsSummary();
      assert.equal(violations.length, 0);
    });
  });

  describe("updateConfig", () => {
    it("should update configuration", () => {
      manager.updateConfig({ ecoRoomLimit: 0.2 });
      const config = manager.getConfig();
      assert.equal(config.ecoRoomLimit, 0.2);
    });

    it("should preserve other config values", () => {
      manager.updateConfig({ ecoRoomLimit: 0.2 });
      const config = manager.getConfig();
      assert.equal(config.warRoomLimit, 0.25);
      assert.equal(config.overmindLimit, 1.0);
    });
  });

  describe("getViolationsSummary", () => {
    it("should return sorted violations", () => {
      manager.checkBudget("room1", "ecoRoom", 0.15);
      manager.checkBudget("room2", "ecoRoom", 0.15);
      manager.checkBudget("room2", "ecoRoom", 0.15); // Second violation

      const violations = manager.getViolationsSummary();
      assert.equal(violations[0].subsystem, "room2");
      assert.equal(violations[0].violations, 2);
      assert.equal(violations[1].subsystem, "room1");
      assert.equal(violations[1].violations, 1);
    });
  });
});
