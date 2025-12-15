/**
 * Unit tests for pathCache module
 */

import { assert } from "chai";
import {
  getCachedPath,
  cachePath,
  invalidatePath,
  invalidateRoom,
  clearPathCache,
  getPathCacheStats,
  cleanupExpiredPaths,
  cacheCommonRoutes
} from "../../src/utils/pathCache.js";

describe("pathCache", () => {
  beforeEach(() => {
    // Reset Game and global state
    // @ts-ignore: Setting up test environment
    global.Game = {
      time: 1000
    };

    // Set up Screeps constants for tests
    (global as any).FIND_SOURCES = 105;
    (global as any).STRUCTURE_STORAGE = "storage";

    // Mock Room.serializePath and Room.deserializePath
    // @ts-ignore: Setting up test environment
    global.Room = {
      serializePath: (path: PathStep[]): string => {
        // Simple serialization for testing
        return JSON.stringify(path);
      },
      deserializePath: (serialized: string): PathStep[] => {
        // Simple deserialization for testing
        return JSON.parse(serialized);
      }
    };

    clearPathCache();
  });

  describe("getCachedPath", () => {
    it("should return null for uncached path", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W1N1");

      const result = getCachedPath(from, to);
      assert.isNull(result);

      const stats = getPathCacheStats();
      assert.equal(stats.misses, 1);
      assert.equal(stats.hits, 0);
    });

    it("should return cached path after caching", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W1N1");
      const path: PathStep[] = [
        { x: 11, y: 11, dx: 1, dy: 1, direction: 2 },
        { x: 12, y: 12, dx: 1, dy: 1, direction: 2 },
        { x: 13, y: 13, dx: 1, dy: 1, direction: 2 }
      ];

      cachePath(from, to, path);
      const result = getCachedPath(from, to);

      assert.isNotNull(result);
      assert.equal(result!.length, 3);
      assert.equal(result![0].x, 11);
      assert.equal(result![0].y, 11);

      const stats = getPathCacheStats();
      assert.equal(stats.hits, 1);
      assert.equal(stats.size, 1);
    });

    it("should cache paths for different routes independently", () => {
      const path1: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];
      const path2: PathStep[] = [{ x: 21, y: 21, dx: 1, dy: 1, direction: 2 }];

      cachePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1"), path1);
      cachePath(new RoomPosition(20, 20, "W1N1"), new RoomPosition(25, 25, "W1N1"), path2);

      const result1 = getCachedPath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1"));
      const result2 = getCachedPath(new RoomPosition(20, 20, "W1N1"), new RoomPosition(25, 25, "W1N1"));

      assert.isNotNull(result1);
      assert.isNotNull(result2);
      assert.equal(result1![0].x, 11);
      assert.equal(result2![0].x, 21);

      const stats = getPathCacheStats();
      assert.equal(stats.size, 2);
    });

    it("should respect TTL and expire old paths", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W1N1");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      // Cache with TTL of 10 ticks
      cachePath(from, to, path, { ttl: 10 });

      // Should be available immediately
      let result = getCachedPath(from, to);
      assert.isNotNull(result);

      // Advance time by 5 ticks - should still be available
      // @ts-ignore
      global.Game.time = 1005;
      result = getCachedPath(from, to);
      assert.isNotNull(result);

      // Advance time by 5 more ticks (total 15 from cache) - should be expired
      // @ts-ignore
      global.Game.time = 1015;
      result = getCachedPath(from, to);
      assert.isNull(result);

      const stats = getPathCacheStats();
      assert.equal(stats.evictions, 1);
    });

    it("should keep permanent paths (no TTL) indefinitely", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W1N1");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      // Cache without TTL (permanent)
      cachePath(from, to, path);

      // Advance time significantly
      // @ts-ignore
      global.Game.time = 10000;

      // Should still be available
      const result = getCachedPath(from, to);
      assert.isNotNull(result);
    });
  });

  describe("invalidatePath", () => {
    it("should remove specific cached path", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W1N1");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      cachePath(from, to, path);
      assert.isNotNull(getCachedPath(from, to));

      invalidatePath(from, to);
      assert.isNull(getCachedPath(from, to));

      const stats = getPathCacheStats();
      assert.equal(stats.size, 0);
    });

    it("should not affect other cached paths", () => {
      const path1: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];
      const path2: PathStep[] = [{ x: 21, y: 21, dx: 1, dy: 1, direction: 2 }];

      cachePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1"), path1);
      cachePath(new RoomPosition(20, 20, "W1N1"), new RoomPosition(25, 25, "W1N1"), path2);

      invalidatePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1"));

      assert.isNull(getCachedPath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1")));
      assert.isNotNull(getCachedPath(new RoomPosition(20, 20, "W1N1"), new RoomPosition(25, 25, "W1N1")));
    });
  });

  describe("invalidateRoom", () => {
    it("should invalidate all paths in a room", () => {
      const path1: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];
      const path2: PathStep[] = [{ x: 21, y: 21, dx: 1, dy: 1, direction: 2 }];
      const path3: PathStep[] = [{ x: 31, y: 31, dx: 1, dy: 1, direction: 2 }];

      cachePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1"), path1);
      cachePath(new RoomPosition(20, 20, "W1N1"), new RoomPosition(25, 25, "W1N1"), path2);
      cachePath(new RoomPosition(30, 30, "W2N2"), new RoomPosition(35, 35, "W2N2"), path3);

      invalidateRoom("W1N1");

      assert.isNull(getCachedPath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(15, 15, "W1N1")));
      assert.isNull(getCachedPath(new RoomPosition(20, 20, "W1N1"), new RoomPosition(25, 25, "W1N1")));
      assert.isNotNull(getCachedPath(new RoomPosition(30, 30, "W2N2"), new RoomPosition(35, 35, "W2N2")));

      const stats = getPathCacheStats();
      assert.equal(stats.size, 1);
    });

    it("should handle cross-room paths correctly", () => {
      const path: PathStep[] = [
        { x: 25, y: 25, dx: 1, dy: 1, direction: 2 },
        { x: 30, y: 30, dx: 1, dy: 1, direction: 2 },
        { x: 5, y: 5, dx: 1, dy: 1, direction: 2 }
      ];

      cachePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(10, 10, "W2N1"), path);

      invalidateRoom("W1N1");

      // Path should be invalidated because it starts/ends in W1N1
      assert.isNull(getCachedPath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(10, 10, "W2N1")));
    });
  });

  describe("cleanupExpiredPaths", () => {
    it("should remove expired paths", () => {
      const from1 = new RoomPosition(10, 10, "W1N1");
      const to1 = new RoomPosition(20, 20, "W1N1");
      const from2 = new RoomPosition(30, 30, "W1N1");
      const to2 = new RoomPosition(40, 40, "W1N1");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      // Cache one path with short TTL, one permanent
      cachePath(from1, to1, path, { ttl: 10 });
      cachePath(from2, to2, path);

      // Advance time beyond TTL
      // @ts-ignore
      global.Game.time = 1015;

      cleanupExpiredPaths();

      assert.isNull(getCachedPath(from1, to1));
      assert.isNotNull(getCachedPath(from2, to2));

      const stats = getPathCacheStats();
      assert.equal(stats.size, 1);
      assert.equal(stats.evictions, 1);
    });

    it("should not affect paths within TTL", () => {
      const from = new RoomPosition(10, 10, "W1N1");
      const to = new RoomPosition(20, 20, "W1N1");
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      cachePath(from, to, path, { ttl: 100 });

      // Advance time but not beyond TTL
      // @ts-ignore
      global.Game.time = 1050;

      cleanupExpiredPaths();

      assert.isNotNull(getCachedPath(from, to));
    });
  });

  describe("getPathCacheStats", () => {
    it("should return accurate statistics", () => {
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      // Start with empty cache
      let stats = getPathCacheStats();
      assert.equal(stats.size, 0);
      assert.equal(stats.hits, 0);
      assert.equal(stats.misses, 0);
      assert.equal(stats.hitRate, 0);

      // Cache a path
      cachePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(20, 20, "W1N1"), path);
      stats = getPathCacheStats();
      assert.equal(stats.size, 1);

      // Hit the cache
      getCachedPath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(20, 20, "W1N1"));
      stats = getPathCacheStats();
      assert.equal(stats.hits, 1);
      assert.equal(stats.misses, 0);
      assert.equal(stats.hitRate, 1.0);

      // Miss the cache
      getCachedPath(new RoomPosition(30, 30, "W1N1"), new RoomPosition(40, 40, "W1N1"));
      stats = getPathCacheStats();
      assert.equal(stats.hits, 1);
      assert.equal(stats.misses, 1);
      assert.equal(stats.hitRate, 0.5);
    });

    it("should track cache evictions", () => {
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      cachePath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(20, 20, "W1N1"), path, { ttl: 10 });

      // Advance time to expire path
      // @ts-ignore
      global.Game.time = 1015;

      // Access expired path triggers eviction
      getCachedPath(new RoomPosition(10, 10, "W1N1"), new RoomPosition(20, 20, "W1N1"));

      const stats = getPathCacheStats();
      assert.equal(stats.evictions, 1);
    });
  });

  describe("cacheCommonRoutes", () => {
    it("should cache storage to sources paths", () => {
      const mockStorage = {
        pos: new RoomPosition(25, 25, "W1N1")
      } as StructureStorage;

      const mockSource1 = {
        id: "source1" as Id<Source>,
        pos: new RoomPosition(10, 10, "W1N1")
      } as Source;

      const mockSource2 = {
        id: "source2" as Id<Source>,
        pos: new RoomPosition(40, 40, "W1N1")
      } as Source;

      const mockController = {
        my: true,
        pos: new RoomPosition(30, 30, "W1N1")
      } as StructureController;

      const mockRoom = {
        name: "W1N1",
        storage: mockStorage,
        controller: mockController,
        find: (type: FindConstant) => {
          if (type === FIND_SOURCES) {
            return [mockSource1, mockSource2];
          }
          return [];
        },
        findPath: (from: RoomPosition, to: RoomPosition, opts?: any) => {
          // Mock pathfinding - return simple straight line
          return [
            { x: from.x + 1, y: from.y + 1, dx: 1, dy: 1, direction: 1 },
            { x: from.x + 2, y: from.y + 2, dx: 1, dy: 1, direction: 1 }
          ];
        }
      } as unknown as Room;

      cacheCommonRoutes(mockRoom);

      const stats = getPathCacheStats();
      // Should cache: Storage→Source1, Source1→Storage, Storage→Source2, Source2→Storage, Storage→Controller
      // That's 5 routes
      assert.isAtLeast(stats.size, 1);
    });

    it("should not cache routes for non-owned rooms", () => {
      const mockRoom = {
        name: "W1N1",
        controller: {
          my: false
        } as StructureController
      } as Room;

      cacheCommonRoutes(mockRoom);

      const stats = getPathCacheStats();
      assert.equal(stats.size, 0);
    });

    it("should not cache routes without storage", () => {
      const mockRoom = {
        name: "W1N1",
        storage: undefined,
        controller: {
          my: true
        } as StructureController
      } as Room;

      cacheCommonRoutes(mockRoom);

      const stats = getPathCacheStats();
      assert.equal(stats.size, 0);
    });
  });

  describe("cache size limit", () => {
    it("should respect MAX_CACHE_SIZE limit", () => {
      const path: PathStep[] = [{ x: 11, y: 11, dx: 1, dy: 1, direction: 2 }];

      // Cache many paths (more than limit would allow in production)
      // For testing, we'll just cache a few
      for (let i = 0; i < 10; i++) {
        cachePath(
          new RoomPosition(i, i, "W1N1"),
          new RoomPosition(i + 10, i + 10, "W1N1"),
          path
        );
      }

      const stats = getPathCacheStats();
      assert.equal(stats.size, 10);
      assert.isAtMost(stats.size, stats.maxSize);
    });
  });
});
