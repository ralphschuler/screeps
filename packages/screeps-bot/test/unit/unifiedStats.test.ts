import { assert } from "chai";
import { UnifiedStatsManager } from "../../src/core/unifiedStats";

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
    it("should export stats to Memory.stats with stats. prefix", function () {
      statsManager.startTick();
      statsManager.finalizeTick();
      
      const mem = Memory as unknown as Record<string, any>;
      assert.isDefined(mem.stats);
      assert.isDefined(mem.stats["stats.cpu.used"]);
      assert.isDefined(mem.stats["stats.cpu.bucket"]);
      assert.isDefined(mem.stats["stats.gcl.level"]);
      assert.isDefined(mem.stats["stats.empire.creeps"]);
      assert.isDefined(mem.stats["stats.system.tick"]);
    });

    it("should export room stats with proper prefix", function () {
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
      assert.isDefined(mem.stats["stats.room.W1N1.rcl"]);
      assert.equal(mem.stats["stats.room.W1N1.rcl"], 3);
      assert.isDefined(mem.stats["stats.room.W1N1.energy.storage"]);
      assert.equal(mem.stats["stats.room.W1N1.energy.storage"], 50000);
    });

    it("should NOT export with old format (without stats. prefix)", function () {
      statsManager.startTick();
      statsManager.finalizeTick();
      
      const mem = Memory as unknown as Record<string, any>;
      // These old formats should NOT exist
      assert.isUndefined(mem.stats["cpu.used"]);
      assert.isUndefined(mem.stats["gcl.level"]);
      assert.isUndefined(mem.stats["empire.creeps"]);
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
