/**
 * Unit tests for roomFindCache module
 */

import { assert } from "chai";
import {
  cachedRoomFind,
  invalidateRoomCache,
  invalidateFindType,
  invalidateStructureCache,
  getRoomFindCacheStats,
  clearRoomFindCache,
  cachedFindSources,
  cachedFindHostileCreeps,
  cachedFindStructures,
  cachedFindMyStructures,
  cachedFindConstructionSites,
  cachedFindDroppedResources
} from "../../src/utils/roomFindCache";

describe("roomFindCache", () => {
  beforeEach(() => {
    // Reset Game
    // @ts-ignore: Setting up test environment
    global.Game = { time: 1000 };
    
    clearRoomFindCache();
  });

  interface MockRoom extends Room {
    _getFindCallCount: () => number;
  }

  function createMockRoom(name: string): MockRoom {
    const sources = [
      { id: "source1" as Id<Source>, pos: { x: 10, y: 10 } },
      { id: "source2" as Id<Source>, pos: { x: 20, y: 20 } }
    ];
    
    const structures = [
      { id: "spawn1" as Id<StructureSpawn>, structureType: STRUCTURE_SPAWN },
      { id: "tower1" as Id<StructureTower>, structureType: STRUCTURE_TOWER }
    ];
    
    let findCallCount = 0;
    
    return {
      name,
      find: (type: FindConstant, opts?: any) => {
        findCallCount++;
        if (type === FIND_SOURCES) {
          return sources;
        } else if (type === FIND_STRUCTURES) {
          if (opts?.filter) {
            return structures.filter(opts.filter);
          }
          return structures;
        } else if (type === FIND_MY_STRUCTURES) {
          if (opts?.filter) {
            return structures.filter(opts.filter);
          }
          return structures;
        } else if (type === FIND_HOSTILE_CREEPS) {
          return [];
        } else if (type === FIND_DROPPED_RESOURCES) {
          return [];
        } else if (type === FIND_MY_CONSTRUCTION_SITES) {
          return [];
        }
        return [];
      },
      _getFindCallCount: () => findCallCount
    } as unknown as MockRoom;
  }

  describe("cachedRoomFind", () => {
    it("should cache find results", () => {
      const room = createMockRoom("W1N1");
      
      // First call - cache miss
      const result1 = cachedRoomFind(room, FIND_SOURCES);
      assert.equal(result1.length, 2);
      assert.equal(room._getFindCallCount(), 1);
      
      // Second call - cache hit
      const result2 = cachedRoomFind(room, FIND_SOURCES);
      assert.equal(result2.length, 2);
      assert.equal(room._getFindCallCount(), 1); // No additional find call
      assert.strictEqual(result1, result2); // Same array reference
    });

    it("should respect TTL and refresh after expiration", () => {
      const room = createMockRoom("W1N1");
      
      // Cache with short TTL
      const result1 = cachedRoomFind(room, FIND_SOURCES, { ttl: 5 });
      assert.equal(room._getFindCallCount(), 1);
      
      // Within TTL - cache hit
      // @ts-ignore
      global.Game.time = 1003;
      const result2 = cachedRoomFind(room, FIND_SOURCES, { ttl: 5 });
      assert.equal(room._getFindCallCount(), 1);
      assert.strictEqual(result1, result2);
      
      // After TTL - cache miss, refresh
      // @ts-ignore
      global.Game.time = 1006;
      const result3 = cachedRoomFind(room, FIND_SOURCES, { ttl: 5 });
      assert.equal(room._getFindCallCount(), 2);
      assert.notStrictEqual(result1, result3);
    });

    it("should cache filtered results separately", () => {
      const room = createMockRoom("W1N1");
      
      // Cache all structures
      const all = cachedRoomFind(room, FIND_STRUCTURES);
      assert.equal(all.length, 2);
      assert.equal(room._getFindCallCount(), 1);
      
      // Cache filtered structures with key
      const spawns = cachedRoomFind(room, FIND_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_SPAWN,
        filterKey: "spawn"
      });
      assert.equal(spawns.length, 1);
      assert.equal(room._getFindCallCount(), 2);
      
      // Cache hit for filtered
      const spawns2 = cachedRoomFind(room, FIND_STRUCTURES, {
        filter: (s: Structure) => s.structureType === STRUCTURE_SPAWN,
        filterKey: "spawn"
      });
      assert.equal(room._getFindCallCount(), 2); // No new call
      assert.strictEqual(spawns, spawns2);
      
      // Cache hit for all
      const all2 = cachedRoomFind(room, FIND_STRUCTURES);
      assert.equal(room._getFindCallCount(), 2); // No new call
      assert.strictEqual(all, all2);
    });

    it("should track cache statistics", () => {
      const room = createMockRoom("W1N1");
      
      clearRoomFindCache();
      let stats = getRoomFindCacheStats();
      assert.equal(stats.hits, 0);
      assert.equal(stats.misses, 0);
      
      // First call - miss
      cachedRoomFind(room, FIND_SOURCES);
      stats = getRoomFindCacheStats();
      assert.equal(stats.misses, 1);
      assert.equal(stats.hits, 0);
      
      // Second call - hit
      cachedRoomFind(room, FIND_SOURCES);
      stats = getRoomFindCacheStats();
      assert.equal(stats.misses, 1);
      assert.equal(stats.hits, 1);
      assert.equal(stats.hitRate, 0.5);
    });
  });

  describe("invalidation", () => {
    it("should invalidate entire room cache", () => {
      const room = createMockRoom("W1N1");
      
      // Cache some results
      cachedRoomFind(room, FIND_SOURCES);
      cachedRoomFind(room, FIND_STRUCTURES);
      assert.equal(room._getFindCallCount(), 2);
      
      // Invalidate room
      invalidateRoomCache("W1N1");
      
      // Should be cache misses now
      cachedRoomFind(room, FIND_SOURCES);
      cachedRoomFind(room, FIND_STRUCTURES);
      assert.equal(room._getFindCallCount(), 4);
    });

    it("should invalidate specific find type", () => {
      const room = createMockRoom("W1N1");
      
      // Cache multiple types
      cachedRoomFind(room, FIND_SOURCES);
      cachedRoomFind(room, FIND_STRUCTURES);
      assert.equal(room._getFindCallCount(), 2);
      
      // Invalidate only structures
      invalidateFindType("W1N1", FIND_STRUCTURES);
      
      // Sources still cached, structures invalidated
      cachedRoomFind(room, FIND_SOURCES);
      assert.equal(room._getFindCallCount(), 2); // No new call
      
      cachedRoomFind(room, FIND_STRUCTURES);
      assert.equal(room._getFindCallCount(), 3); // New call
    });

    it("should invalidate structure-related caches", () => {
      const room = createMockRoom("W1N1");
      
      // Cache various structure types
      cachedRoomFind(room, FIND_STRUCTURES);
      cachedRoomFind(room, FIND_MY_STRUCTURES);
      cachedRoomFind(room, FIND_SOURCES); // Non-structure
      assert.equal(room._getFindCallCount(), 3);
      
      // Invalidate structure caches
      invalidateStructureCache("W1N1");
      
      // Sources still cached (not structure-related)
      cachedRoomFind(room, FIND_SOURCES);
      assert.equal(room._getFindCallCount(), 3); // No new call
      
      // Structure caches invalidated
      cachedRoomFind(room, FIND_STRUCTURES);
      cachedRoomFind(room, FIND_MY_STRUCTURES);
      assert.equal(room._getFindCallCount(), 5); // Two new calls
    });
  });

  describe("convenience functions", () => {
    it("should cache sources via convenience function", () => {
      const room = createMockRoom("W1N1");
      
      const sources1 = cachedFindSources(room);
      assert.equal(sources1.length, 2);
      assert.equal(room._getFindCallCount(), 1);
      
      const sources2 = cachedFindSources(room);
      assert.equal(room._getFindCallCount(), 1); // Cached
      assert.strictEqual(sources1, sources2);
    });

    it("should cache hostile creeps via convenience function", () => {
      const room = createMockRoom("W1N1");
      
      const hostiles1 = cachedFindHostileCreeps(room);
      assert.equal(hostiles1.length, 0);
      assert.equal(room._getFindCallCount(), 1);
      
      const hostiles2 = cachedFindHostileCreeps(room);
      assert.equal(room._getFindCallCount(), 1); // Cached
      assert.strictEqual(hostiles1, hostiles2);
    });

    it("should cache structures with type filter", () => {
      const room = createMockRoom("W1N1");
      
      // All structures
      const all = cachedFindStructures(room);
      assert.equal(all.length, 2);
      assert.equal(room._getFindCallCount(), 1);
      
      // Filtered structures
      const spawns = cachedFindStructures(room, STRUCTURE_SPAWN);
      assert.equal(spawns.length, 1);
      assert.equal(room._getFindCallCount(), 2);
      
      // Both should be cached independently
      const all2 = cachedFindStructures(room);
      const spawns2 = cachedFindStructures(room, STRUCTURE_SPAWN);
      assert.equal(room._getFindCallCount(), 2); // No new calls
      assert.strictEqual(all, all2);
      assert.strictEqual(spawns, spawns2);
    });

    it("should cache my structures with type filter", () => {
      const room = createMockRoom("W1N1");
      
      const spawns = cachedFindMyStructures(room, STRUCTURE_SPAWN);
      assert.equal(spawns.length, 1);
      assert.equal(room._getFindCallCount(), 1);
      
      const spawns2 = cachedFindMyStructures(room, STRUCTURE_SPAWN);
      assert.equal(room._getFindCallCount(), 1); // Cached
      assert.strictEqual(spawns, spawns2);
    });

    it("should cache construction sites", () => {
      const room = createMockRoom("W1N1");
      
      const sites1 = cachedFindConstructionSites(room);
      assert.equal(sites1.length, 0);
      assert.equal(room._getFindCallCount(), 1);
      
      const sites2 = cachedFindConstructionSites(room);
      assert.equal(room._getFindCallCount(), 1); // Cached
      assert.strictEqual(sites1, sites2);
    });

    it("should cache dropped resources", () => {
      const room = createMockRoom("W1N1");
      
      const resources1 = cachedFindDroppedResources(room);
      assert.equal(resources1.length, 0);
      assert.equal(room._getFindCallCount(), 1);
      
      const resources2 = cachedFindDroppedResources(room);
      assert.equal(room._getFindCallCount(), 1); // Cached
      assert.strictEqual(resources1, resources2);
    });
  });

  describe("multi-room caching", () => {
    it("should cache independently per room", () => {
      const room1 = createMockRoom("W1N1");
      const room2 = createMockRoom("W2N2");
      
      // Cache for both rooms
      cachedRoomFind(room1, FIND_SOURCES);
      cachedRoomFind(room2, FIND_SOURCES);
      assert.equal(room1._getFindCallCount(), 1);
      assert.equal(room2._getFindCallCount(), 1);
      
      // Verify independent caching
      cachedRoomFind(room1, FIND_SOURCES);
      cachedRoomFind(room2, FIND_SOURCES);
      assert.equal(room1._getFindCallCount(), 1); // Cached
      assert.equal(room2._getFindCallCount(), 1); // Cached
      
      // Invalidate one room
      invalidateRoomCache("W1N1");
      
      // Room1 invalidated, room2 still cached
      cachedRoomFind(room1, FIND_SOURCES);
      cachedRoomFind(room2, FIND_SOURCES);
      assert.equal(room1._getFindCallCount(), 2); // New call
      assert.equal(room2._getFindCallCount(), 1); // Still cached
    });
  });

  describe("cache statistics", () => {
    it("should track multiple rooms", () => {
      const room1 = createMockRoom("W1N1");
      const room2 = createMockRoom("W2N2");
      
      cachedRoomFind(room1, FIND_SOURCES);
      cachedRoomFind(room1, FIND_STRUCTURES);
      cachedRoomFind(room2, FIND_SOURCES);
      
      const stats = getRoomFindCacheStats();
      assert.equal(stats.rooms, 2);
      assert.equal(stats.totalEntries, 3);
    });

    it("should track invalidations", () => {
      const room = createMockRoom("W1N1");
      
      cachedRoomFind(room, FIND_SOURCES);
      cachedRoomFind(room, FIND_STRUCTURES);
      
      let stats = getRoomFindCacheStats();
      assert.equal(stats.invalidations, 0);
      
      invalidateFindType("W1N1", FIND_SOURCES);
      stats = getRoomFindCacheStats();
      assert.equal(stats.invalidations, 1);
      
      invalidateRoomCache("W1N1");
      stats = getRoomFindCacheStats();
      assert.equal(stats.invalidations, 2);
    });
  });
});
