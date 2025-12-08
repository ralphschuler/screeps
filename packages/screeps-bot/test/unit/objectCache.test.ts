/**
 * Unit tests for objectCache module
 */

import { assert } from "chai";
import {
  getCachedObjectById,
  getCachedStorage,
  getCachedController,
  getObjectCacheStats,
  clearObjectCache
} from "../../src/utils/objectCache";

describe("objectCache", () => {
  beforeEach(() => {
    // Reset Game and global state
    // @ts-ignore: Setting up test environment
    global.Game = {
      time: 1000,
      getObjectById: (id: Id<any>) => {
        // Mock implementation - return different objects based on ID
        if (id === "test-storage-1") {
          return { id, structureType: STRUCTURE_STORAGE };
        }
        if (id === "test-source-1") {
          return { id, energy: 3000 };
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
    it("should clear cache on new tick", () => {
      // Cache an object
      getCachedObjectById("test-storage-1" as Id<any>);
      
      const stats1 = getObjectCacheStats();
      assert.equal(stats1.size, 1);
      
      // Advance game time
      // @ts-ignore: Modifying test environment
      global.Game.time = 1001;
      
      // Cache should be cleared
      const stats2 = getObjectCacheStats();
      assert.equal(stats2.size, 0);
      assert.equal(stats2.tick, 1001);
    });
  });
});
