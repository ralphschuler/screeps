import { assert } from "chai";
import { UnifiedStatsManager } from "../../src/core/unifiedStats";

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
});
