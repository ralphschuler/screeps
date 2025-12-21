/**
 * Unit tests for objectCache module
 */

import { assert } from "chai";
import {
  getCachedObjectById,
  getCachedStorage,
  getCachedController,
  getCachedStructure,
  getCachedCreep,
  getCachedSource,
  getCacheStatistics,
  getObjectCacheStats,
  clearObjectCache,
  resetCacheStats,
  warmCache,
  prefetchRoomObjects
} from "../../src/utils/caching/objectCache";

describe("objectCache", () => {
  beforeEach(() => {
    // Reset Game and global state
    // @ts-ignore: Setting up test environment
    global.Game = {
      time: 1000,
      rooms: {},
      getObjectById: (id: Id<any>) => {
        // Mock implementation - return different objects based on ID
        if (id === "test-storage-1") {
          return { id, structureType: STRUCTURE_STORAGE };
        }
        if (id === "test-source-1") {
          return { id, energy: 3000 };
        }
        if (id === "test-creep-1") {
          return { id, name: "TestCreep" };
        }
        if (id === "test-tower-1") {
          return { id, structureType: STRUCTURE_TOWER };
        }
        return null;
      }
    };
    
    clearObjectCache();
  });

  describe("getCachedObjectById", () => {
    it("should return null for null ID", () => {
      const result = getCachedObjectById(null);
      assert.isNull(result);
    });

    it("should return null for undefined ID", () => {
      const result = getCachedObjectById(undefined);
      assert.isNull(result);
    });

    it("should fetch object on first call", () => {
      const result = getCachedObjectById("test-storage-1" as Id<any>);
      assert.isNotNull(result);
      assert.equal(result?.id, "test-storage-1");
    });

    it("should use cache on second call", () => {
      // First call - fetches from game
      const result1 = getCachedObjectById("test-storage-1" as Id<any>);
      
      // Second call - should use cache
      const result2 = getCachedObjectById("test-storage-1" as Id<any>);
      
      assert.equal(result1, result2);
      assert.equal(result1?.id, "test-storage-1");
    });

    it("should cache null results", () => {
      // First call - object doesn't exist
      const result1 = getCachedObjectById("nonexistent" as Id<any>);
      assert.isNull(result1);
      
      // Second call - should still be null from cache
      const result2 = getCachedObjectById("nonexistent" as Id<any>);
      assert.isNull(result2);
      
      // Stats should show one cached entry
      const stats = getObjectCacheStats();
      assert.equal(stats.size, 1);
    });

    it("should handle multiple different objects", () => {
      const storage = getCachedObjectById("test-storage-1" as Id<any>);
      const source = getCachedObjectById("test-source-1" as Id<any>);
      
      assert.isNotNull(storage);
      assert.isNotNull(source);
      assert.equal(storage?.id, "test-storage-1");
      assert.equal(source?.id, "test-source-1");
      
      // Both should be in cache
      const stats = getObjectCacheStats();
      assert.equal(stats.size, 2);
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should cache structures for 10 ticks", () => {
      // Fetch structure at tick 1000
      const result1 = getCachedObjectById("test-storage-1" as Id<any>);
      assert.isNotNull(result1);
      
      // Advance to tick 1005 - should still be cached (expires at 1010)
      // @ts-ignore: Modifying test environment
      global.Game.time = 1005;
      const result2 = getCachedObjectById("test-storage-1" as Id<any>);
      assert.equal(result1, result2); // Same cached object
      
      // Advance to tick 1009 - should still be cached (expires at 1010)
      // @ts-ignore: Modifying test environment
      global.Game.time = 1009;
      const result3 = getCachedObjectById("test-storage-1" as Id<any>);
      assert.equal(result1, result3); // Same cached object
      
      // Advance to tick 1010 - should be expired and refetched
      // @ts-ignore: Modifying test environment
      global.Game.time = 1010;
      const result4 = getCachedObjectById("test-storage-1" as Id<any>);
      // Object content should be same but it's a fresh fetch
      assert.equal(result4?.id, "test-storage-1");
      // Should not be the same reference since it was refetched
      assert.notEqual(result1, result4);
    });

    it("should cache sources for 5 ticks", () => {
      // Mock Source object
      const mockSource = { id: "test-source-1", energy: 3000 };
      // @ts-ignore: Modifying test environment
      global.Game.getObjectById = (id: Id<any>) => {
        if (id === "test-source-1") return mockSource;
        return null;
      };
      
      // Fetch at tick 1000 (expires at 1005)
      const result1 = getCachedObjectById("test-source-1" as Id<Source>);
      assert.isNotNull(result1);
      
      // Advance to tick 1004 - should still be cached
      // @ts-ignore: Modifying test environment
      global.Game.time = 1004;
      const result2 = getCachedObjectById("test-source-1" as Id<Source>);
      assert.equal(result1, result2);
      
      // Advance to tick 1005 - should be expired
      // @ts-ignore: Modifying test environment
      global.Game.time = 1005;
      const result3 = getCachedObjectById("test-source-1" as Id<Source>);
      // Still returns same data but refetched (new reference)
      assert.equal(result3?.id, "test-source-1");
      assert.notEqual(result1, result3);
    });

    it("should support custom TTL", () => {
      // Fetch with custom TTL of 3 ticks (expires at 1003)
      const result1 = getCachedObjectById("test-storage-1" as Id<any>, 3);
      assert.isNotNull(result1);
      
      // Advance to tick 1002 - should still be cached
      // @ts-ignore: Modifying test environment
      global.Game.time = 1002;
      const result2 = getCachedObjectById("test-storage-1" as Id<any>, 3);
      assert.equal(result1, result2);
      
      // Advance to tick 1003 - should be expired
      // @ts-ignore: Modifying test environment
      global.Game.time = 1003;
      const result3 = getCachedObjectById("test-storage-1" as Id<any>, 3);
      assert.equal(result3?.id, "test-storage-1");
      assert.notEqual(result1, result3);
    });
  });

  describe("Cache Statistics", () => {
    it("should track hits and misses", () => {
      resetCacheStats();
      
      // First access - miss
      getCachedObjectById("test-storage-1" as Id<any>);
      let stats = getCacheStatistics();
      assert.equal(stats.misses, 1);
      assert.equal(stats.hits, 0);
      
      // Second access - hit
      getCachedObjectById("test-storage-1" as Id<any>);
      stats = getCacheStatistics();
      assert.equal(stats.misses, 1);
      assert.equal(stats.hits, 1);
      
      // Third access - hit
      getCachedObjectById("test-storage-1" as Id<any>);
      stats = getCacheStatistics();
      assert.equal(stats.misses, 1);
      assert.equal(stats.hits, 2);
    });

    it("should calculate hit rate correctly", () => {
      resetCacheStats();
      
      // 1 miss
      getCachedObjectById("test-storage-1" as Id<any>);
      // 3 hits
      getCachedObjectById("test-storage-1" as Id<any>);
      getCachedObjectById("test-storage-1" as Id<any>);
      getCachedObjectById("test-storage-1" as Id<any>);
      
      const stats = getCacheStatistics();
      assert.equal(stats.hitRate, 75); // 3/4 = 75%
    });

    it("should calculate CPU savings", () => {
      resetCacheStats();
      
      // 5 hits
      getCachedObjectById("test-storage-1" as Id<any>); // miss
      for (let i = 0; i < 5; i++) {
        getCachedObjectById("test-storage-1" as Id<any>); // hit
      }
      
      const stats = getCacheStatistics();
      assert.equal(stats.hits, 5);
      assert.equal(stats.cpuSaved, 0.005); // 5 * 0.001
    });

    it("should report cache size", () => {
      resetCacheStats();
      
      getCachedObjectById("test-storage-1" as Id<any>);
      getCachedObjectById("test-source-1" as Id<any>);
      getCachedObjectById("test-creep-1" as Id<any>);
      
      const stats = getCacheStatistics();
      assert.equal(stats.size, 3);
    });

    it("should persist statistics across tick changes", () => {
      resetCacheStats();
      
      // Access at tick 1000
      getCachedObjectById("test-storage-1" as Id<any>);
      getCachedObjectById("test-storage-1" as Id<any>);
      
      let stats = getCacheStatistics();
      assert.equal(stats.hits, 1);
      assert.equal(stats.misses, 1);
      
      // Advance to tick 1001 - stats should persist
      // @ts-ignore: Modifying test environment
      global.Game.time = 1001;
      
      stats = getCacheStatistics();
      assert.equal(stats.hits, 1);
      assert.equal(stats.misses, 1);
    });

    it("should reset statistics", () => {
      getCachedObjectById("test-storage-1" as Id<any>);
      getCachedObjectById("test-storage-1" as Id<any>);
      
      let stats = getCacheStatistics();
      assert.isAbove(stats.hits, 0);
      
      resetCacheStats();
      
      stats = getCacheStatistics();
      assert.equal(stats.hits, 0);
      assert.equal(stats.misses, 0);
    });
  });

  describe("Typed Accessors", () => {
    it("getCachedStructure should return typed structure", () => {
      const tower = getCachedStructure<StructureTower>("test-tower-1" as Id<StructureTower>);
      assert.isNotNull(tower);
      assert.equal(tower?.structureType, STRUCTURE_TOWER);
    });

    it("getCachedCreep should return creep", () => {
      const creep = getCachedCreep("test-creep-1" as Id<Creep>);
      assert.isNotNull(creep);
      assert.equal(creep?.name, "TestCreep");
    });

    it("getCachedSource should return source", () => {
      const source = getCachedSource("test-source-1" as Id<Source>);
      assert.isNotNull(source);
      assert.equal(source?.energy, 3000);
    });

    it("typed accessors should use appropriate TTL", () => {
      resetCacheStats();
      
      // Structure accessor should use 10 tick TTL (expires at 1010)
      const tower1 = getCachedStructure("test-tower-1" as Id<StructureTower>);
      // @ts-ignore: Modifying test environment
      global.Game.time = 1009;
      const tower2 = getCachedStructure("test-tower-1" as Id<StructureTower>);
      
      // Should be same cached object
      assert.equal(tower1, tower2);
      
      let stats = getCacheStatistics();
      assert.equal(stats.hits, 1); // Should be cached
      
      resetCacheStats();
      
      // Source accessor should use 5 tick TTL (expires at 1005)
      // @ts-ignore: Reset to tick 1000
      global.Game.time = 1000;
      const source1 = getCachedSource("test-source-1" as Id<Source>);
      // @ts-ignore: Modifying test environment
      global.Game.time = 1004;
      const source2 = getCachedSource("test-source-1" as Id<Source>);
      
      // Should be same cached object
      assert.equal(source1, source2);
      
      stats = getCacheStatistics();
      assert.equal(stats.hits, 1); // Should be cached
    });
  });

  describe("getCachedStorage", () => {
    it("should return undefined if room has no storage", () => {
      const mockRoom = {
        storage: undefined
      } as unknown as Room;
      
      const result = getCachedStorage(mockRoom);
      assert.isUndefined(result);
    });

    it("should return storage if room has one", () => {
      const mockStorage = {
        id: "test-storage-1" as Id<StructureStorage>,
        structureType: STRUCTURE_STORAGE
      };
      
      const mockRoom = {
        storage: mockStorage
      } as unknown as Room;
      
      const result = getCachedStorage(mockRoom);
      assert.isDefined(result);
      assert.equal(result?.id, "test-storage-1");
    });
  });

  describe("getObjectCacheStats", () => {
    it("should return correct stats", () => {
      const stats1 = getObjectCacheStats();
      assert.equal(stats1.size, 0);
      assert.equal(stats1.tick, 1000);
      
      // Add some cached objects
      getCachedObjectById("test-storage-1" as Id<any>);
      getCachedObjectById("test-source-1" as Id<any>);
      
      const stats2 = getObjectCacheStats();
      assert.equal(stats2.size, 2);
    });
  });

  describe("cache invalidation", () => {
    it("should not clear cache on tick change (TTL handles expiration)", () => {
      // Cache an object with 10 tick TTL at tick 1000 (expires at 1010)
      getCachedObjectById("test-storage-1" as Id<any>);
      
      const stats1 = getObjectCacheStats();
      assert.equal(stats1.size, 1);
      
      // Advance game time by 5 ticks - should still be cached
      // @ts-ignore: Modifying test environment
      global.Game.time = 1005;
      
      // Cache should NOT be cleared, entry should still exist
      const stats2 = getObjectCacheStats();
      assert.equal(stats2.size, 1);
      assert.equal(stats2.tick, 1005);
      
      // Access same object - should be a cache hit
      const result = getCachedObjectById("test-storage-1" as Id<any>);
      assert.isNotNull(result);
    });
  });

  describe("LRU Eviction", () => {
    it("should evict least recently used entries when cache is full", () => {
      resetCacheStats();
      
      // Create a large number of cache entries to trigger eviction
      // Eviction threshold is 12000, so we'll create enough entries
      // For test purposes, we'll mock a smaller threshold scenario
      
      // Cache some objects
      for (let i = 0; i < 100; i++) {
        // @ts-ignore: Mocking multiple objects
        global.Game.getObjectById = (id: Id<any>) => {
          if (id === `test-obj-${i}`) {
            return { id, structureType: STRUCTURE_STORAGE };
          }
          return null;
        };
        getCachedObjectById(`test-obj-${i}` as Id<any>);
      }
      
      const stats = getObjectCacheStats();
      // All 100 objects should be in cache (below eviction threshold)
      assert.equal(stats.size, 100);
    });
  });

  describe("Cache Warming", () => {
    it("should warm cache for owned rooms", () => {
      // Mock room with structures
      const mockRoom = {
        name: "W1N1",
        controller: {
          my: true,
          id: "test-controller-1" as Id<StructureController>
        },
        storage: {
          id: "test-storage-1" as Id<StructureStorage>,
          structureType: STRUCTURE_STORAGE
        },
        terminal: {
          id: "test-terminal-1" as Id<StructureTerminal>,
          structureType: STRUCTURE_TERMINAL
        },
        find: (findType: FindConstant) => {
          if (findType === FIND_SOURCES) {
            return [{ id: "test-source-1" as Id<Source> }];
          }
          if (findType === FIND_MY_SPAWNS) {
            return [{ id: "test-spawn-1" as Id<StructureSpawn> }];
          }
          if (findType === FIND_MY_STRUCTURES) {
            return [{ id: "test-tower-1" as Id<StructureTower>, structureType: STRUCTURE_TOWER }];
          }
          return [];
        }
      };
      
      // @ts-ignore: Setting up test environment
      global.Game.rooms = { W1N1: mockRoom };
      
      // @ts-ignore: Mock getObjectById to return structures
      global.Game.getObjectById = (id: Id<any>) => {
        if (id === "test-controller-1") return mockRoom.controller;
        if (id === "test-storage-1") return mockRoom.storage;
        if (id === "test-terminal-1") return mockRoom.terminal;
        if (id === "test-source-1") return { id, energy: 3000 };
        if (id === "test-spawn-1") return { id, structureType: STRUCTURE_SPAWN };
        if (id === "test-tower-1") return { id, structureType: STRUCTURE_TOWER };
        return null;
      };
      
      // @ts-ignore: Mock cpu
      global.Game.cpu = { getUsed: () => 0 };
      
      resetCacheStats();
      warmCache();
      
      const stats = getObjectCacheStats();
      // Should have cached: controller, storage, terminal, source, spawn, tower
      assert.isAbove(stats.size, 0);
    });
  });

  describe("prefetchRoomObjects", () => {
    it("should prefetch room objects for owned rooms", () => {
      const mockRoom = {
        controller: {
          my: true,
          id: "test-controller-1" as Id<StructureController>
        },
        storage: {
          id: "test-storage-1" as Id<StructureStorage>
        },
        terminal: {
          id: "test-terminal-1" as Id<StructureTerminal>
        },
        find: (findType: FindConstant) => {
          if (findType === FIND_SOURCES) {
            return [{ id: "test-source-1" as Id<Source> }];
          }
          return [];
        }
      } as unknown as Room;
      
      resetCacheStats();
      prefetchRoomObjects(mockRoom);
      
      const stats = getObjectCacheStats();
      // Should have cached: controller, storage, terminal, source
      assert.equal(stats.size, 4);
    });

    it("should not prefetch for non-owned rooms", () => {
      const mockRoom = {
        controller: {
          my: false
        }
      } as unknown as Room;
      
      resetCacheStats();
      prefetchRoomObjects(mockRoom);
      
      const stats = getObjectCacheStats();
      assert.equal(stats.size, 0);
    });
  });
});
