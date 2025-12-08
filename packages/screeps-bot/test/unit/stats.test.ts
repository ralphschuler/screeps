import { assert } from "chai";
import { StatsManager } from "../../src/core/stats";

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
    level: 0,
    progress: 0,
    progressTotal: 1000000
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

describe("StatsManager", function () {
  let statsManager: StatsManager;

  beforeEach(function () {
    // Set up global mocks
    (global as any).Game = mockGame;
    (global as any).Memory = mockMemory;
    
    // Reset memory stats
    delete mockMemory.stats;
    
    // Create fresh stats manager
    statsManager = new StatsManager();
  });

  describe("Initialization", function () {
    it("should initialize empty stats structure", function () {
      const stats = statsManager.getStats();
      
      assert.isDefined(stats);
      assert.equal(stats.tick, Game.time);
      assert.isObject(stats.subsystems);
      assert.isObject(stats.roles);
      assert.isObject(stats.rooms);
      assert.isObject(stats.pheromones);
      assert.isObject(stats.empire);
      assert.isObject(stats.nativeCalls);
    });

    it("should handle corrupted Memory.stats with missing rooms", function () {
      // Simulate corrupted memory where rooms is undefined
      mockMemory.stats = {
        tick: 12344,
        subsystems: {},
        roles: {},
        // rooms is missing!
        empire: {},
        pheromones: {},
        nativeCalls: {}
      };

      const stats = statsManager.getStats();
      
      // Should have initialized missing properties
      assert.isObject(stats.rooms);
      assert.isObject(stats.subsystems);
      assert.isObject(stats.roles);
      assert.isObject(stats.pheromones);
    });

    it("should handle corrupted Memory.stats with null subsystems", function () {
      // Simulate corrupted memory
      mockMemory.stats = {
        tick: 12344,
        subsystems: null,
        roles: null,
        rooms: null,
        empire: null,
        pheromones: null,
        nativeCalls: null
      };

      const stats = statsManager.getStats();
      
      // Should have re-initialized all properties
      assert.isObject(stats.rooms);
      assert.isObject(stats.subsystems);
      assert.isObject(stats.roles);
      assert.isObject(stats.pheromones);
      assert.isObject(stats.empire);
      assert.isObject(stats.nativeCalls);
    });
  });

  describe("Recording Stats", function () {
    it("should record subsystem stats", function () {
      statsManager.recordSubsystem("TestSubsystem", 1.5, 10);
      
      const stats = statsManager.getStats();
      assert.isDefined(stats.subsystems.TestSubsystem);
      assert.equal(stats.subsystems.TestSubsystem.avgCpu, 1.5);
      assert.equal(stats.subsystems.TestSubsystem.peakCpu, 1.5);
      assert.equal(stats.subsystems.TestSubsystem.calls, 10);
    });

    it("should record role stats", function () {
      statsManager.recordRole("harvester", 5, 0.8, 5);
      
      const stats = statsManager.getStats();
      assert.isDefined(stats.roles.harvester);
      assert.equal(stats.roles.harvester.count, 5);
      assert.equal(stats.roles.harvester.avgCpu, 0.8);
    });

    it("should record room stats even with corrupted stats.rooms", function () {
      // Corrupt the stats.rooms
      mockMemory.stats = {
        tick: 12344,
        subsystems: {},
        roles: {},
        rooms: undefined, // Corrupted!
        empire: {},
        pheromones: {},
        nativeCalls: {}
      };

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
        find: () => [] // No hostiles
      };

      // This should not throw an error
      statsManager.recordRoom(mockRoom, 0.5, 0.7, {
        energyHarvested: 100,
        damageReceived: 0,
        danger: 0
      });

      const stats = statsManager.getStats();
      assert.isDefined(stats.rooms.W1N1);
      assert.equal(stats.rooms.W1N1.name, "W1N1");
      assert.equal(stats.rooms.W1N1.rcl, 3);
      assert.equal(stats.rooms.W1N1.storageEnergy, 50000);
    });

    it("should record pheromone stats", function () {
      const pheromones = {
        expand: 0.5,
        harvest: 0.8,
        build: 0.3,
        upgrade: 0.6,
        defense: 0.0,
        war: 0.0,
        siege: 0.0,
        logistics: 0.4
      };

      statsManager.recordPheromones("W1N1", pheromones, "eco", "harvest");

      const stats = statsManager.getStats();
      assert.isDefined(stats.pheromones.W1N1);
      assert.equal(stats.pheromones.W1N1.harvest, 0.8);
      assert.equal(stats.pheromones.W1N1.intent, "eco");
      assert.equal(stats.pheromones.W1N1.dominant, "harvest");
    });
  });

  describe("Empire Stats", function () {
    it("should update empire stats", function () {
      mockGame.rooms = {
        W1N1: {
          controller: { my: true, level: 3 },
          storage: { store: { getUsedCapacity: () => 50000 } }
        },
        W1N2: {
          controller: { my: true, level: 2 },
          storage: { store: { getUsedCapacity: () => 30000 } }
        }
      };

      statsManager.updateEmpireStats();

      const stats = statsManager.getStats();
      assert.equal(stats.empire.ownedRooms, 2);
      assert.equal(stats.empire.totalStorageEnergy, 80000);
      assert.equal(stats.empire.gcl, 3);
    });
  });

  describe("Finalize Tick", function () {
    it("should update tick number and preserve stats structure", function () {
      statsManager.recordSubsystem("TestSubsystem", 1.0);
      statsManager.finalizeTick();

      const stats = statsManager.getStats();
      assert.equal(stats.tick, Game.time);
      
      // Verify stats structure is preserved
      assert.isObject(stats.subsystems);
      assert.isObject(stats.rooms);
      assert.isObject(stats.roles);
    });

    it("should NOT create flattened keys in Memory root", function () {
      const mockRoom: any = {
        name: "W1N1",
        energyAvailable: 300,
        energyCapacityAvailable: 550,
        controller: { level: 3, progress: 5000, progressTotal: 10000, my: true },
        storage: { store: { getUsedCapacity: () => 50000 } },
        find: () => []
      };

      statsManager.recordRoom(mockRoom, 0.5, 0.7);
      statsManager.updateEmpireStats();
      statsManager.finalizeTick();

      // Check that no flattened keys exist
      assert.isUndefined((Memory as any)["stats.empire.owned_rooms"]);
      assert.isUndefined((Memory as any)["stats.room.W1N1.rcl"]);
      assert.isUndefined((Memory as any)["stats.subsystem.TestSubsystem.avg_cpu"]);
      
      // But stats should exist under Memory.stats
      assert.isDefined((Memory as any).stats);
      assert.isDefined((Memory as any).stats.empire);
      assert.isDefined((Memory as any).stats.rooms);
    });
  });

  describe("Native Calls Tracking", function () {
    it("should track native calls", function () {
      statsManager.recordNativeCall("harvest");
      statsManager.recordNativeCall("harvest");
      statsManager.recordNativeCall("moveTo");
      
      statsManager.finalizeTick();

      const stats = statsManager.getStats();
      assert.equal(stats.nativeCalls.harvest, 2);
      assert.equal(stats.nativeCalls.moveTo, 1);
      assert.equal(stats.nativeCalls.total, 3);
    });

    it("should reset native calls after finalizeTick", function () {
      statsManager.recordNativeCall("harvest");
      statsManager.finalizeTick();
      
      // Record new calls
      statsManager.recordNativeCall("build");
      statsManager.finalizeTick();

      const stats = statsManager.getStats();
      // Previous tick's harvest call should still be in memory
      assert.equal(stats.nativeCalls.harvest, 0);
      // New call should be recorded
      assert.equal(stats.nativeCalls.build, 1);
    });
  });
});
