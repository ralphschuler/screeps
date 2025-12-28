/**
 * CPU Profiler Enhancement Tests
 *
 * Tests for budget validation and anomaly detection in unifiedStats
 */

import { assert } from "chai";
import { UnifiedStatsManager } from "../../src/core/unifiedStats";
import { memoryManager } from "../../src/memory/manager";

describe("CPU Profiler Enhancement", () => {
  let statsManager: UnifiedStatsManager;
  let mockMemory: any;

  beforeEach(() => {
    // Mock Game object
    (global as any).Game = {
      cpu: {
        getUsed: () => 5.0,
        limit: 20,
        bucket: 10000,
        getHeapStatistics: () => ({ used_heap_size: 50 * 1024 * 1024 })
      },
      gcl: {
        level: 3,
        progress: 1000,
        progressTotal: 10000
      },
      gpl: {
        level: 1,
        progress: 100,
        progressTotal: 1000
      },
      time: 1000,
      rooms: {},
      creeps: {},
      powerCreeps: {},
      structures: {},
      constructionSites: {}
    };

    // Mock Memory
    mockMemory = {
      stats: {
        profiler: {
          rooms: {},
          subsystems: {},
          roles: {},
          tickCount: 0,
          lastUpdate: 0
        }
      },
      swarm: {}
    };
    (global as any).Memory = mockMemory;

    // Mock RawMemory
    (global as any).RawMemory = {
      segments: {},
      setActiveSegments: () => {}
    };

    // Create stats manager with test configuration
    statsManager = new UnifiedStatsManager({
      enabled: true,
      budgetLimits: {
        ecoRoom: 0.1,
        warRoom: 0.25,
        overmind: 1.0
      },
      budgetAlertThresholds: {
        warning: 0.8,
        critical: 1.0
      },
      anomalyDetection: {
        enabled: true,
        spikeThreshold: 2.0,
        minSamples: 10
      }
    });

    // Mock memoryManager
    (memoryManager as any).getSwarmState = (roomName: string) => {
      return mockMemory.swarm[roomName];
    };
  });

  describe("validateBudgets", () => {
    it("should report all rooms within budget when CPU usage is low", () => {
      // Setup: Add a room with low CPU usage
      const mockRoom: any = {
        name: "W1N1",
        controller: { level: 5, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W1N1"] = mockRoom;

      // Set up swarm state for eco room
      mockMemory.swarm["W1N1"] = {
        posture: "eco",
        danger: 0,
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        }
      };

      // Record room with low CPU (0.05)
      statsManager.startTick();
      const cpuStart = statsManager.startRoom("W1N1");
      statsManager.recordRoom(mockRoom, 0.05);
      statsManager.endRoom("W1N1", cpuStart);

      // Validate budgets
      const report = statsManager.validateBudgets();

      assert.equal(report.roomsEvaluated, 1);
      assert.equal(report.roomsWithinBudget, 1);
      assert.equal(report.roomsOverBudget, 0);
      assert.equal(report.alerts.length, 0);
    });

    it("should generate warning alerts at 80% of budget", () => {
      const mockRoom: any = {
        name: "W1N1",
        controller: { level: 5, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W1N1"] = mockRoom;

      mockMemory.swarm["W1N1"] = {
        posture: "eco",
        danger: 0,
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        }
      };

      // Record room with 80% of eco budget (0.08 / 0.1)
      statsManager.startTick();
      const cpuStart = statsManager.startRoom("W1N1");
      statsManager.recordRoom(mockRoom, 0.08);
      statsManager.endRoom("W1N1", cpuStart);

      const report = statsManager.validateBudgets();

      assert.equal(report.alerts.length, 1);
      assert.equal(report.alerts[0].severity, "warning");
      assert.equal(report.alerts[0].target, "W1N1");
      assert.isAtLeast(report.alerts[0].percentUsed, 0.8);
    });

    it("should generate critical alerts when exceeding budget", () => {
      const mockRoom: any = {
        name: "W1N1",
        controller: { level: 5, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W1N1"] = mockRoom;

      mockMemory.swarm["W1N1"] = {
        posture: "eco",
        danger: 0,
        pheromones: {},
        metrics: {}
      };

      // Record room with 120% of eco budget (0.12 / 0.1)
      statsManager.startTick();
      const cpuStart = statsManager.startRoom("W1N1");
      statsManager.recordRoom(mockRoom, 0.12);
      statsManager.endRoom("W1N1", cpuStart);

      const report = statsManager.validateBudgets();

      assert.equal(report.roomsOverBudget, 1);
      assert.equal(report.alerts.length, 1);
      assert.equal(report.alerts[0].severity, "critical");
      assert.equal(report.alerts[0].target, "W1N1");
      assert.isAtLeast(report.alerts[0].percentUsed, 1.0);
    });

    it("should use higher budget limits for war rooms", () => {
      const mockRoom: any = {
        name: "W1N1",
        controller: { level: 5, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W1N1"] = mockRoom;

      // Set up as war room
      mockMemory.swarm["W1N1"] = {
        posture: "war",
        danger: 2,
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        }
      };

      // Record room with 0.2 CPU (would exceed eco budget but ok for war)
      statsManager.startTick();
      const cpuStart = statsManager.startRoom("W1N1");
      statsManager.recordRoom(mockRoom, 0.2);
      statsManager.endRoom("W1N1", cpuStart);

      const report = statsManager.validateBudgets();

      // Should be within war room budget (0.25)
      assert.equal(report.roomsWithinBudget, 1);
      assert.equal(report.roomsOverBudget, 0);
    });
  });

  describe("detectAnomalies", () => {
    beforeEach(() => {
      // Setup room with sufficient samples for anomaly detection
      const mockRoom: any = {
        name: "W1N1",
        controller: { level: 5, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W1N1"] = mockRoom;

      mockMemory.swarm["W1N1"] = {
        posture: "eco",
        danger: 0,
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        }
      };

      // Establish baseline with multiple samples
      // Note: This doesn't simulate actual tick-by-tick processing but directly
      // manipulates the profiler memory to establish a baseline for anomaly detection.
      // In production, the EMA calculation happens across real ticks via finalizeTick().
      statsManager.startTick();
      for (let i = 0; i < 15; i++) {
        const cpuStart = statsManager.startRoom("W1N1");
        statsManager.recordRoom(mockRoom, 0.05); // Normal baseline
        statsManager.endRoom("W1N1", cpuStart);
        
        // Advance profiler memory to simulate accumulated samples
        mockMemory.stats.profiler.rooms["W1N1"] = {
          avgCpu: 0.05,
          peakCpu: 0.06,
          samples: i + 1,
          lastTick: 1000 + i
        };
      }
    });

    it("should detect CPU spikes (2x baseline)", () => {
      // Mock current measurement as 2x baseline
      (statsManager as any).roomMeasurements.set("W1N1", 0.10); // 2x baseline of 0.05

      const anomalies = statsManager.detectAnomalies();

      assert.isAtLeast(anomalies.length, 1);
      const spike = anomalies.find(a => a.type === "spike" && a.target === "W1N1");
      assert.isDefined(spike);
      assert.isAtLeast(spike!.multiplier, 2.0);
    });

    it("should not detect anomalies when CPU is within normal range", () => {
      // Mock current measurement as normal
      (statsManager as any).roomMeasurements.set("W1N1", 0.05); // Same as baseline

      const anomalies = statsManager.detectAnomalies();

      const roomAnomalies = anomalies.filter(a => a.target === "W1N1");
      assert.equal(roomAnomalies.length, 0);
    });

    it("should not detect anomalies with insufficient samples", () => {
      // Create a new room with few samples
      const mockRoom: any = {
        name: "W2N2",
        controller: { level: 3, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W2N2"] = mockRoom;

      mockMemory.swarm["W2N2"] = {
        posture: "eco",
        danger: 0,
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        }
      };

      // Only 3 samples (below minSamples threshold of 10)
      mockMemory.stats.profiler.rooms["W2N2"] = {
        avgCpu: 0.05,
        peakCpu: 0.06,
        samples: 3,
        lastTick: 1000
      };

      statsManager.startTick();
      const cpuStart = statsManager.startRoom("W2N2");
      statsManager.recordRoom(mockRoom, 0.05);
      statsManager.endRoom("W2N2", cpuStart);

      // Even with a spike, should not detect (insufficient samples)
      (statsManager as any).roomMeasurements.set("W2N2", 0.15);

      const anomalies = statsManager.detectAnomalies();
      const newRoomAnomalies = anomalies.filter(a => a.target === "W2N2");
      
      assert.equal(newRoomAnomalies.length, 0);
    });

    it("should provide context for room anomalies", () => {
      // Set up spike
      (statsManager as any).roomMeasurements.set("W1N1", 0.12);

      const anomalies = statsManager.detectAnomalies();
      const spike = anomalies.find(a => a.type === "spike" && a.target === "W1N1");

      assert.isDefined(spike);
      assert.isDefined(spike!.context);
      assert.include(spike!.context!, "RCL");
      assert.include(spike!.context!, "posture");
    });
  });

  describe("integration with finalizeTick", () => {
    it("should automatically validate budgets and detect anomalies during finalization", () => {
      const mockRoom: any = {
        name: "W1N1",
        controller: { level: 5, my: true },
        energyAvailable: 300,
        energyCapacityAvailable: 300,
        find: () => []
      };
      Game.rooms["W1N1"] = mockRoom;

      mockMemory.swarm["W1N1"] = {
        posture: "eco",
        danger: 0,
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailable: 0,
          energyCapacity: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: 0,
          damageReceived: 0,
          constructionSites: 0
        }
      };

      // Establish baseline
      for (let i = 0; i < 12; i++) {
        mockMemory.stats.profiler.rooms["W1N1"] = {
          avgCpu: 0.05,
          peakCpu: 0.06,
          samples: i + 1,
          lastTick: 1000 + i
        };
      }

      statsManager.startTick();
      const cpuStart = statsManager.startRoom("W1N1");
      statsManager.recordRoom(mockRoom, 0.15); // Over budget and spike
      statsManager.endRoom("W1N1", cpuStart);
      
      // Set current measurement for anomaly detection
      (statsManager as any).roomMeasurements.set("W1N1", 0.15);

      // finalizeTick should run validation and detection
      statsManager.finalizeTick();

      // Check that processing completed without errors
      const snapshot = statsManager.getCurrentSnapshot();
      assert.isDefined(snapshot);
      assert.equal(snapshot.tick, 1000);
    });
  });
});
