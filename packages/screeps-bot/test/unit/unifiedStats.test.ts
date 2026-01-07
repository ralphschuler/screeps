import { assert } from "chai";
import { UnifiedStatsManager } from "@ralphschuler/screeps-stats";

// Body part constants from Screeps API
const WORK = "work" as BodyPartConstant;
const CARRY = "carry" as BodyPartConstant;
const MOVE = "move" as BodyPartConstant;

// Mock Game and Memory
const mockGame: any = {
  time: 12345,
  cpu: {
    getUsed: () => 5.5,
    limit: 20,
    bucket: 10000,
    getHeapStatistics: () => ({ used_heap_size: 50 * 1024 * 1024 })
  },
  gcl: {
    level: 3,
    progress: 500000,
    progressTotal: 1000000
  },
  gpl: {
    level: 0
  },
  market: {
    credits: 50000
  },
  creeps: {},
  rooms: {}
};

const mockMemory: any = {
  creeps: {}
};

describe("UnifiedStatsManager", function () {
  let statsManager: UnifiedStatsManager;

  beforeEach(function () {
    // Set up global mocks
    (global as any).Game = mockGame;
    (global as any).Memory = mockMemory;
    (global as any).RawMemory = {
      setActiveSegments: () => {},
      segments: {}
    };
    
    // Reset memory stats
    delete mockMemory.stats;
    
    // Create fresh stats manager
    statsManager = new UnifiedStatsManager();
  });

  describe("Initialization", function () {
    it("should initialize with default config", function () {
      assert.isDefined(statsManager);
      assert.isTrue(statsManager.isEnabled());
    });

    it("should allow enabling/disabling", function () {
      statsManager.setEnabled(false);
      assert.isFalse(statsManager.isEnabled());
      
      statsManager.setEnabled(true);
      assert.isTrue(statsManager.isEnabled());
    });
  });

  describe("Stats Collection", function () {
    it("should collect CPU stats", function () {
      statsManager.startTick();
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.cpu);
      assert.equal(snapshot.cpu.used, 5.5);
      assert.equal(snapshot.cpu.limit, 20);
      assert.equal(snapshot.cpu.bucket, 10000);
      assert.approximately(snapshot.cpu.percent, 27.5, 0.1);
    });

    it("should collect progression stats", function () {
      statsManager.startTick();
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.progression);
      assert.equal(snapshot.progression.gcl.level, 3);
      assert.equal(snapshot.progression.gcl.progress, 500000);
      assert.equal(snapshot.progression.gcl.progressTotal, 1000000);
      assert.approximately(snapshot.progression.gcl.progressPercent, 50, 0.1);
    });

    it("should track native calls", function () {
      statsManager.startTick();
      statsManager.recordNativeCall("harvest");
      statsManager.recordNativeCall("harvest");
      statsManager.recordNativeCall("moveTo");
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.equal(snapshot.native.harvest, 2);
      assert.equal(snapshot.native.moveTo, 1);
      assert.equal(snapshot.native.total, 3);
    });

    it("should measure subsystems", function () {
      statsManager.startTick();
      
      const result = statsManager.measureSubsystem("testSubsystem", () => {
        return 42;
      });
      
      assert.equal(result, 42);
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.subsystems.testSubsystem);
    });

    it("should measure role stats with role: prefix", function () {
      // Create mock creeps with roles
      const mockCreep1: any = {
        name: "harvester1",
        memory: { role: "harvester", homeRoom: "W1N1", working: true, state: { action: "harvesting" } },
        room: { name: "W1N1" },
        body: [{ type: WORK }, { type: CARRY }, { type: MOVE }],
        hits: 300,
        hitsMax: 300,
        ticksToLive: 1500,
        fatigue: 0,
        spawning: false
      };

      const mockCreep2: any = {
        name: "harvester2",
        memory: { role: "harvester", homeRoom: "W1N1", state: { action: "idle" } },
        room: { name: "W1N1" },
        body: [{ type: WORK }, { type: CARRY }, { type: MOVE }],
        hits: 300,
        hitsMax: 300,
        ticksToLive: 1200,
        fatigue: 0,
        spawning: false
      };

      mockGame.creeps = {
        harvester1: mockCreep1,
        harvester2: mockCreep2
      };

      statsManager.startTick();
      
      // Measure role execution (simulating what creepProcessManager does)
      statsManager.measureSubsystem("role:harvester", () => {
        // Simulate creep execution (no-op for test)
      });
      
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.roles.harvester, "Role stats should exist for harvester");
      assert.equal(snapshot.roles.harvester.count, 2, "Should count 2 harvester creeps");
      assert.isDefined(snapshot.roles.harvester.avgCpu, "Should have avgCpu");
      assert.isDefined(snapshot.roles.harvester.peakCpu, "Should have peakCpu");
      
      // Enhanced stats
      assert.equal(snapshot.roles.harvester.spawningCount, 0, "Should have 0 spawning creeps");
      assert.equal(snapshot.roles.harvester.idleCount, 1, "Should have 1 idle creep");
      assert.equal(snapshot.roles.harvester.activeCount, 1, "Should have 1 active creep");
      assert.equal(snapshot.roles.harvester.totalBodyParts, 6, "Should have 6 total body parts");
      assert.approximately(snapshot.roles.harvester.avgTicksToLive, 1350, 1, "Should have average TTL of 1350");
    });

    it("should track room execution", function () {
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        energyCapacityAvailable: 550,
        controller: {
          level: 3,
          progress: 5000,
          progressTotal: 10000,
          my: true
        },
        storage: {
          store: {
            getUsedCapacity: () => 50000
          }
        },
        terminal: {
          store: {
            getUsedCapacity: () => 10000
          }
        },
        find: () => [] // No hostiles
      };

      mockGame.rooms = { W1N1: mockRoom };
      mockGame.creeps = {};

      statsManager.startTick();
      const startCpu = statsManager.startRoom("W1N1");
      statsManager.recordRoom(mockRoom, 0.5);
      statsManager.endRoom("W1N1", startCpu);
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.rooms.W1N1);
      assert.equal(snapshot.rooms.W1N1.name, "W1N1");
      assert.equal(snapshot.rooms.W1N1.rcl, 3);
      assert.equal(snapshot.rooms.W1N1.energy.storage, 50000);
    });

    it("should handle rooms with undefined pheromones and metrics", function () {
      // Regression test for: TypeError: Cannot convert undefined or null to object
      // This happens when swarm.pheromones or swarm.metrics is undefined/null
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        energyCapacityAvailable: 550,
        controller: {
          level: 3,
          progress: 5000,
          progressTotal: 10000,
          my: true
        },
        storage: {
          store: {
            getUsedCapacity: () => 50000
          }
        },
        terminal: {
          store: {
            getUsedCapacity: () => 10000
          }
        },
        find: () => [] // No hostiles
      };

      mockGame.rooms = { W1N1: mockRoom };
      mockGame.creeps = {};

      // The stub memoryManager returns {} which has no pheromones or metrics
      statsManager.startTick();
      const startCpu = statsManager.startRoom("W1N1");
      
      // This should not throw even though swarm.pheromones and swarm.metrics are undefined
      statsManager.recordRoom(mockRoom, 0.5);
      
      statsManager.endRoom("W1N1", startCpu);
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.rooms.W1N1);
      assert.equal(snapshot.rooms.W1N1.name, "W1N1");
      assert.equal(snapshot.rooms.W1N1.rcl, 3);
      // Should still have default pheromones and metrics from initialization
      assert.isDefined(snapshot.rooms.W1N1.pheromones);
      assert.isDefined(snapshot.rooms.W1N1.metrics);
    });
  });

  describe("Memory Export", function () {
    it("should export stats to Memory.stats as nested objects", function () {
      statsManager.startTick();
      statsManager.finalizeTick();
      
      const mem = Memory as unknown as Record<string, any>;
      assert.isDefined(mem.stats);
      assert.isDefined(mem.stats.cpu);
      assert.isDefined(mem.stats.cpu.used);
      assert.isDefined(mem.stats.cpu.bucket);
      assert.isDefined(mem.stats.gcl);
      assert.isDefined(mem.stats.gcl.level);
      assert.isDefined(mem.stats.empire);
      assert.isDefined(mem.stats.empire.creeps);
      assert.isDefined(mem.stats.tick);
    });

    it("should export role stats to Memory.stats.roles", function () {
      // Create mock creeps with roles
      const mockCreep1: any = {
        name: "upgrader1",
        memory: { role: "upgrader", homeRoom: "W1N1", working: true, state: { action: "upgrading" } },
        room: { name: "W1N1" },
        body: [{ type: WORK }, { type: CARRY }, { type: MOVE }],
        hits: 300,
        hitsMax: 300,
        ticksToLive: 1500,
        fatigue: 0,
        spawning: false
      };

      mockGame.creeps = { upgrader1: mockCreep1 };

      statsManager.startTick();
      statsManager.measureSubsystem("role:upgrader", () => {});
      statsManager.finalizeTick();
      
      const mem = Memory as unknown as Record<string, any>;
      assert.isDefined(mem.stats.roles);
      assert.isDefined(mem.stats.roles.upgrader);
      assert.equal(mem.stats.roles.upgrader.count, 1);
      assert.isDefined(mem.stats.roles.upgrader.avg_cpu);
      assert.isDefined(mem.stats.roles.upgrader.peak_cpu);
      
      // Enhanced role stats
      assert.isDefined(mem.stats.roles.upgrader.spawning_count);
      assert.isDefined(mem.stats.roles.upgrader.idle_count);
      assert.isDefined(mem.stats.roles.upgrader.active_count);
      assert.isDefined(mem.stats.roles.upgrader.avg_ticks_to_live);
      assert.isDefined(mem.stats.roles.upgrader.total_body_parts);
      assert.equal(mem.stats.roles.upgrader.active_count, 1);
      assert.equal(mem.stats.roles.upgrader.total_body_parts, 3);
    });

    it("should export pheromones in room stats", function () {
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        energyCapacityAvailable: 550,
        controller: { level: 3, progress: 5000, progressTotal: 10000, my: true },
        storage: { store: { getUsedCapacity: () => 50000 } },
        terminal: { store: { getUsedCapacity: () => 10000 } },
        find: () => []
      };

      mockGame.rooms = { W1N1: mockRoom };
      mockGame.creeps = {};

      statsManager.startTick();
      statsManager.recordRoom(mockRoom, 0.5);
      statsManager.finalizeTick();
      
      const mem = Memory as unknown as Record<string, any>;
      assert.isDefined(mem.stats.rooms);
      assert.isDefined(mem.stats.rooms.W1N1);
      assert.isDefined(mem.stats.rooms.W1N1.pheromones);
      // Pheromones should be present as an object (empty or populated based on swarm state)
      assert.isObject(mem.stats.rooms.W1N1.pheromones);
    });

    it("should export room stats as nested structure", function () {
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        energyCapacityAvailable: 550,
        controller: { level: 3, progress: 5000, progressTotal: 10000, my: true },
        storage: { store: { getUsedCapacity: () => 50000 } },
        terminal: { store: { getUsedCapacity: () => 10000 } },
        find: () => []
      };

      mockGame.rooms = { W1N1: mockRoom };
      mockGame.creeps = {};

      statsManager.startTick();
      statsManager.recordRoom(mockRoom, 0.5);
      statsManager.finalizeTick();
      
      const mem = Memory as unknown as Record<string, any>;
      assert.isDefined(mem.stats.rooms);
      assert.isDefined(mem.stats.rooms.W1N1);
      assert.equal(mem.stats.rooms.W1N1.rcl, 3);
      assert.isDefined(mem.stats.rooms.W1N1.energy);
      assert.equal(mem.stats.rooms.W1N1.energy.storage, 50000);
    });
  });

  describe("Reset", function () {
    it("should reset all stats", function () {
      statsManager.startTick();
      statsManager.recordNativeCall("harvest");
      statsManager.finalizeTick();
      
      statsManager.reset();
      
      const snapshot = statsManager.getSnapshot();
      assert.equal(snapshot.native.harvest, 0);
      assert.equal(snapshot.native.total, 0);
    });
  });

  describe("Per-Creep CPU Average Fix", function () {
    it("should calculate per-creep average CPU, not total CPU for all creeps", function () {
      // Regression test for issue: metrics showing avgCpu = 39.1 when actual per-creep usage < 1
      // Root cause: totalCpu for all creeps was stored as avgCpu, not divided by creep count
      
      // Setup: 5 larvaWorker creeps
      const mockCreeps: any = {};
      for (let i = 1; i <= 5; i++) {
        mockCreeps[`larvaWorker${i}`] = {
          name: `larvaWorker${i}`,
          memory: { role: "larvaWorker", homeRoom: "W1N1", working: true, state: { action: "working" } },
          room: { name: "W1N1" },
          body: [{ type: WORK }, { type: CARRY }, { type: MOVE }],
          hits: 300,
          hitsMax: 300,
          ticksToLive: 1500,
          fatigue: 0,
          spawning: false
        };
      }
      mockGame.creeps = mockCreeps;

      statsManager.startTick();
      
      // Simulate each creep execution using 0.2 CPU (total = 1.0 CPU)
      let cpuUsed = 0;
      mockGame.cpu.getUsed = () => cpuUsed;
      
      for (let i = 1; i <= 5; i++) {
        statsManager.measureSubsystem("role:larvaWorker", () => {
          cpuUsed += 0.2;
        });
      }
      
      statsManager.finalizeTick();
      
      const snapshot = statsManager.getSnapshot();
      assert.isDefined(snapshot.roles.larvaWorker, "Role stats should exist");
      
      // CRITICAL: avgCpu should be per-creep average (1.0 / 5 = 0.2), NOT total (1.0)
      assert.approximately(
        snapshot.roles.larvaWorker.avgCpu, 
        0.2, 
        0.001, 
        "avgCpu should be per-creep average (0.2), not total CPU (1.0)"
      );
      
      assert.equal(snapshot.roles.larvaWorker.count, 5, "Should count 5 creeps");
      assert.equal(snapshot.roles.larvaWorker.calls, 5, "Should track 5 calls (one per creep)");
      
      // Verify the fix prevents the EMA from accumulating incorrectly
      // Second tick: only 1 creep remains, uses 0.2 CPU
      mockGame.creeps = {
        larvaWorker1: mockCreeps.larvaWorker1
      };
      
      statsManager.startTick();
      cpuUsed = 0;
      statsManager.measureSubsystem("role:larvaWorker", () => {
        cpuUsed += 0.2;
      });
      statsManager.finalizeTick();
      
      const snapshot2 = statsManager.getSnapshot();
      // With smoothing factor 0.1: avgCpu = 0.2 * 0.9 + 0.2 * 0.1 = 0.2
      // Without fix: avgCpu = 1.0 * 0.9 + 0.2 * 0.1 = 0.92 (WRONG!)
      assert.approximately(
        snapshot2.roles.larvaWorker.avgCpu,
        0.2,
        0.01,
        "avgCpu should remain stable at 0.2 per creep, not inflate to 0.92"
      );
    });
  });

  describe("CreepMetrics Interface", function () {
    it("should validate CreepMetrics interface structure", function () {
      // Import the interface type to ensure it exists and has the correct structure
      const mockMetrics: import("@ralphschuler/screeps-stats").CreepMetrics = {
        tasksCompleted: 5,
        energyTransferred: 1000,
        energyHarvested: 500,
        buildProgress: 200,
        repairProgress: 150,
        upgradeProgress: 300,
        damageDealt: 0,
        healingDone: 0
      };

      // Verify all required properties exist
      assert.equal(mockMetrics.tasksCompleted, 5);
      assert.equal(mockMetrics.energyTransferred, 1000);
      assert.equal(mockMetrics.energyHarvested, 500);
      assert.equal(mockMetrics.buildProgress, 200);
      assert.equal(mockMetrics.repairProgress, 150);
      assert.equal(mockMetrics.upgradeProgress, 300);
      assert.equal(mockMetrics.damageDealt, 0);
      assert.equal(mockMetrics.healingDone, 0);
    });

    it("should support CreepMetrics in creep memory", function () {
      // Simulate a creep with metrics in memory
      const creepMemory: { _metrics?: import("@ralphschuler/screeps-stats").CreepMetrics } = {
        _metrics: {
          tasksCompleted: 3,
          energyTransferred: 500,
          energyHarvested: 250,
          buildProgress: 100,
          repairProgress: 0,
          upgradeProgress: 150,
          damageDealt: 0,
          healingDone: 0
        }
      };

      assert.isDefined(creepMemory._metrics);
      assert.equal(creepMemory._metrics!.tasksCompleted, 3);
      assert.equal(creepMemory._metrics!.energyHarvested, 250);
    });
  });
});
