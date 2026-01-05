/**
 * Unit tests for creep metrics utilities
 */

import { assert } from "chai";
import {
  initializeMetrics,
  getMetrics,
  recordHarvest,
  recordTransfer,
  recordBuild,
  recordRepair,
  recordUpgrade,
  recordDamage,
  recordHealing,
  recordTaskComplete,
  getEfficiencySummary,
  resetMetrics
} from "@ralphschuler/screeps-stats";

// Simple mock memory compatible with the CreepMemoryWithMetrics interface
interface MockCreepMemory {
  role: string;
  _metrics?: {
    tasksCompleted: number;
    energyTransferred: number;
    energyHarvested: number;
    buildProgress: number;
    repairProgress: number;
    upgradeProgress: number;
    damageDealt: number;
    healingDone: number;
  };
}

describe("Creep Metrics", () => {
  let mockMemory: MockCreepMemory;

  beforeEach(() => {
    // Create fresh mock memory for each test
    mockMemory = {
      role: "harvester"
    };
  });

  describe("initializeMetrics", () => {
    it("should initialize metrics with zero values", () => {
      initializeMetrics(mockMemory);
      
      assert.isDefined(mockMemory._metrics);
      assert.equal(mockMemory._metrics!.tasksCompleted, 0);
      assert.equal(mockMemory._metrics!.energyTransferred, 0);
      assert.equal(mockMemory._metrics!.energyHarvested, 0);
      assert.equal(mockMemory._metrics!.buildProgress, 0);
      assert.equal(mockMemory._metrics!.repairProgress, 0);
      assert.equal(mockMemory._metrics!.upgradeProgress, 0);
      assert.equal(mockMemory._metrics!.damageDealt, 0);
      assert.equal(mockMemory._metrics!.healingDone, 0);
    });

    it("should not overwrite existing metrics", () => {
      mockMemory._metrics = {
        tasksCompleted: 5,
        energyTransferred: 100,
        energyHarvested: 200,
        buildProgress: 50,
        repairProgress: 30,
        upgradeProgress: 40,
        damageDealt: 0,
        healingDone: 0
      };

      initializeMetrics(mockMemory);
      
      assert.equal(mockMemory._metrics.tasksCompleted, 5);
      assert.equal(mockMemory._metrics.energyHarvested, 200);
    });
  });

  describe("getMetrics", () => {
    it("should return metrics and initialize if needed", () => {
      const metrics = getMetrics(mockMemory);
      
      assert.isDefined(metrics);
      assert.equal(metrics.tasksCompleted, 0);
    });

    it("should return existing metrics without modification", () => {
      mockMemory._metrics = {
        tasksCompleted: 10,
        energyTransferred: 500,
        energyHarvested: 300,
        buildProgress: 100,
        repairProgress: 50,
        upgradeProgress: 75,
        damageDealt: 200,
        healingDone: 150
      };

      const metrics = getMetrics(mockMemory);
      
      assert.equal(metrics.tasksCompleted, 10);
      assert.equal(metrics.energyTransferred, 500);
    });
  });

  describe("recordHarvest", () => {
    it("should increment energyHarvested", () => {
      recordHarvest(mockMemory, 10);
      assert.equal(mockMemory._metrics!.energyHarvested, 10);
      
      recordHarvest(mockMemory, 5);
      assert.equal(mockMemory._metrics!.energyHarvested, 15);
    });
  });

  describe("recordTransfer", () => {
    it("should increment energyTransferred", () => {
      recordTransfer(mockMemory, 50);
      assert.equal(mockMemory._metrics!.energyTransferred, 50);
      
      recordTransfer(mockMemory, 25);
      assert.equal(mockMemory._metrics!.energyTransferred, 75);
    });
  });

  describe("recordBuild", () => {
    it("should increment buildProgress", () => {
      recordBuild(mockMemory, 100);
      assert.equal(mockMemory._metrics!.buildProgress, 100);
      
      recordBuild(mockMemory, 50);
      assert.equal(mockMemory._metrics!.buildProgress, 150);
    });
  });

  describe("recordRepair", () => {
    it("should increment repairProgress", () => {
      recordRepair(mockMemory, 200);
      assert.equal(mockMemory._metrics!.repairProgress, 200);
      
      recordRepair(mockMemory, 100);
      assert.equal(mockMemory._metrics!.repairProgress, 300);
    });
  });

  describe("recordUpgrade", () => {
    it("should increment upgradeProgress", () => {
      recordUpgrade(mockMemory, 150);
      assert.equal(mockMemory._metrics!.upgradeProgress, 150);
      
      recordUpgrade(mockMemory, 75);
      assert.equal(mockMemory._metrics!.upgradeProgress, 225);
    });
  });

  describe("recordDamage", () => {
    it("should increment damageDealt", () => {
      recordDamage(mockMemory, 30);
      assert.equal(mockMemory._metrics!.damageDealt, 30);
      
      recordDamage(mockMemory, 40);
      assert.equal(mockMemory._metrics!.damageDealt, 70);
    });
  });

  describe("recordHealing", () => {
    it("should increment healingDone", () => {
      recordHealing(mockMemory, 12);
      assert.equal(mockMemory._metrics!.healingDone, 12);
      
      recordHealing(mockMemory, 8);
      assert.equal(mockMemory._metrics!.healingDone, 20);
    });
  });

  describe("recordTaskComplete", () => {
    it("should increment tasksCompleted", () => {
      recordTaskComplete(mockMemory);
      assert.equal(mockMemory._metrics!.tasksCompleted, 1);
      
      recordTaskComplete(mockMemory);
      recordTaskComplete(mockMemory);
      assert.equal(mockMemory._metrics!.tasksCompleted, 3);
    });
  });

  describe("getEfficiencySummary", () => {
    it("should return 'No metrics available' when metrics not initialized", () => {
      const summary = getEfficiencySummary(mockMemory);
      assert.equal(summary, "No metrics available");
    });

    it("should return 'No activity' when all metrics are zero", () => {
      initializeMetrics(mockMemory);
      const summary = getEfficiencySummary(mockMemory);
      assert.equal(summary, "No activity");
    });

    it("should summarize harvesting activity", () => {
      initializeMetrics(mockMemory);
      recordHarvest(mockMemory, 100);
      recordTransfer(mockMemory, 50);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "100 harvested");
      assert.include(summary, "50 transferred");
    });

    it("should summarize building activity", () => {
      initializeMetrics(mockMemory);
      recordBuild(mockMemory, 500);
      recordTaskComplete(mockMemory);
      recordTaskComplete(mockMemory);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "2 tasks");
      assert.include(summary, "500 built");
    });

    it("should summarize combat activity", () => {
      initializeMetrics(mockMemory);
      recordDamage(mockMemory, 300);
      recordHealing(mockMemory, 150);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "300 damage");
      assert.include(summary, "150 healing");
    });

    it("should summarize repair activity", () => {
      initializeMetrics(mockMemory);
      recordRepair(mockMemory, 1000);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "1000 repaired");
    });

    it("should summarize upgrade activity", () => {
      initializeMetrics(mockMemory);
      recordUpgrade(mockMemory, 500);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "500 upgraded");
    });

    it("should combine multiple metrics in summary", () => {
      initializeMetrics(mockMemory);
      recordTaskComplete(mockMemory);
      recordHarvest(mockMemory, 200);
      recordTransfer(mockMemory, 150);
      recordBuild(mockMemory, 75);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "1 tasks");
      assert.include(summary, "200 harvested");
      assert.include(summary, "150 transferred");
      assert.include(summary, "75 built");
    });
  });

  describe("resetMetrics", () => {
    it("should reset all metrics to zero", () => {
      mockMemory._metrics = {
        tasksCompleted: 10,
        energyTransferred: 500,
        energyHarvested: 300,
        buildProgress: 100,
        repairProgress: 50,
        upgradeProgress: 250,
        damageDealt: 200,
        healingDone: 150
      };

      resetMetrics(mockMemory);
      
      assert.equal(mockMemory._metrics.tasksCompleted, 0);
      assert.equal(mockMemory._metrics.energyTransferred, 0);
      assert.equal(mockMemory._metrics.energyHarvested, 0);
      assert.equal(mockMemory._metrics.buildProgress, 0);
      assert.equal(mockMemory._metrics.repairProgress, 0);
      assert.equal(mockMemory._metrics.upgradeProgress, 0);
      assert.equal(mockMemory._metrics.damageDealt, 0);
      assert.equal(mockMemory._metrics.healingDone, 0);
    });
  });

  describe("Integration", () => {
    it("should track a complete harvester lifecycle", () => {
      // Simulate a harvester's work over several ticks
      initializeMetrics(mockMemory);
      
      // Harvest energy
      recordHarvest(mockMemory, 10);
      recordHarvest(mockMemory, 10);
      recordHarvest(mockMemory, 10);
      
      // Transfer to spawn
      recordTransfer(mockMemory, 30);
      recordTaskComplete(mockMemory);
      
      // Verify metrics
      assert.equal(mockMemory._metrics!.energyHarvested, 30);
      assert.equal(mockMemory._metrics!.energyTransferred, 30);
      assert.equal(mockMemory._metrics!.tasksCompleted, 1);
      
      const summary = getEfficiencySummary(mockMemory);
      assert.include(summary, "1 tasks");
      assert.include(summary, "30 harvested");
      assert.include(summary, "30 transferred");
    });

    it("should track a complete builder lifecycle", () => {
      initializeMetrics(mockMemory);
      
      // Collect energy
      recordHarvest(mockMemory, 50);
      
      // Build structure
      recordBuild(mockMemory, 10);
      recordBuild(mockMemory, 10);
      recordBuild(mockMemory, 10);
      recordBuild(mockMemory, 10);
      recordBuild(mockMemory, 10);
      recordTaskComplete(mockMemory); // Construction complete
      
      // Verify metrics
      assert.equal(mockMemory._metrics!.energyHarvested, 50);
      assert.equal(mockMemory._metrics!.buildProgress, 50);
      assert.equal(mockMemory._metrics!.tasksCompleted, 1);
    });

    it("should track a complete combat creep lifecycle", () => {
      initializeMetrics(mockMemory);
      
      // Deal damage
      recordDamage(mockMemory, 30);
      recordDamage(mockMemory, 30);
      recordDamage(mockMemory, 30);
      
      // Get healed
      recordHealing(mockMemory, 12);
      
      // Verify metrics
      assert.equal(mockMemory._metrics!.damageDealt, 90);
      assert.equal(mockMemory._metrics!.healingDone, 12);
    });
  });
});
