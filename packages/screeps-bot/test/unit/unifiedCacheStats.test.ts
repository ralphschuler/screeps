/**
 * Integration tests for unified cache stats collection
 */

import { assert } from "chai";
import { globalCache } from "../../src/cache";
import {
  getRoomFindCacheStats,
  getBodyPartCacheStats,
  getObjectCacheStats,
  getPathCacheStats,
  getRoleCacheStats
} from "../../src/utils/caching";

describe("Unified Cache Stats Integration", () => {
  beforeEach(() => {
    // @ts-ignore: Test environment setup - mocking global Game object for cache testing
    global.Game = { time: 1000 };
    
    // Clear all caches
    globalCache.clear();
  });

  describe("Stats Collection", () => {
    it("should collect stats from all cache namespaces", () => {
      // Global stats should be available
      const globalStats = globalCache.getCacheStats();
      
      assert.isDefined(globalStats, "Global stats should be defined");
      assert.isDefined(globalStats.hits, "Global stats should have hits");
      assert.isDefined(globalStats.misses, "Global stats should have misses");
      assert.isDefined(globalStats.hitRate, "Global stats should have hitRate");
      assert.isDefined(globalStats.size, "Global stats should have size");
      assert.isDefined(globalStats.evictions, "Global stats should have evictions");
    });

    it("should collect roomFind cache stats", () => {
      const stats = getRoomFindCacheStats();
      
      assert.isDefined(stats, "RoomFind stats should be defined");
      assert.isDefined(stats.rooms, "RoomFind stats should have rooms count");
      assert.isDefined(stats.totalEntries, "RoomFind stats should have totalEntries");
      assert.isDefined(stats.hits, "RoomFind stats should have hits");
      assert.isDefined(stats.misses, "RoomFind stats should have misses");
      assert.isDefined(stats.invalidations, "RoomFind stats should have invalidations");
      assert.isDefined(stats.hitRate, "RoomFind stats should have hitRate");
    });

    it("should collect bodyPart cache stats", () => {
      const stats = getBodyPartCacheStats();
      
      assert.isDefined(stats, "BodyPart stats should be defined");
      assert.isDefined(stats.size, "BodyPart stats should have size");
      assert.isDefined(stats.tick, "BodyPart stats should have tick");
    });

    it("should collect object cache stats", () => {
      const stats = getObjectCacheStats();
      
      assert.isDefined(stats, "Object stats should be defined");
      assert.isDefined(stats.hits, "Object stats should have hits");
      assert.isDefined(stats.misses, "Object stats should have misses");
      assert.isDefined(stats.hitRate, "Object stats should have hitRate");
      assert.isDefined(stats.size, "Object stats should have size");
      assert.isDefined(stats.evictions, "Object stats should have evictions");
    });

    it("should collect path cache stats", () => {
      const stats = getPathCacheStats();
      
      assert.isDefined(stats, "Path stats should be defined");
      assert.isDefined(stats.size, "Path stats should have size");
      assert.isDefined(stats.maxSize, "Path stats should have maxSize");
      assert.isDefined(stats.hits, "Path stats should have hits");
      assert.isDefined(stats.misses, "Path stats should have misses");
      assert.isDefined(stats.evictions, "Path stats should have evictions");
      assert.isDefined(stats.hitRate, "Path stats should have hitRate");
    });

    it("should collect role cache stats", () => {
      const stats = getRoleCacheStats();
      
      assert.isDefined(stats, "Role stats should be defined");
      assert.isDefined(stats.totalEntries, "Role stats should have totalEntries");
    });
  });

  describe("Stats Aggregation", () => {
    it("should aggregate stats across all namespaces", () => {
      // Add some data to different namespaces
      globalCache.set("test1", "value1", { namespace: "object" });
      globalCache.set("test2", "value2", { namespace: "path" });
      globalCache.set("test3", "value3", { namespace: "roomFind" });
      
      // Access some entries to generate hits
      globalCache.get("test1", { namespace: "object" });
      globalCache.get("test2", { namespace: "path" });
      
      // Get global aggregate stats
      const globalStats = globalCache.getCacheStats();
      
      // Should have entries from multiple namespaces
      assert.isAtLeast(globalStats.size, 3, "Global stats should aggregate size from all namespaces");
      assert.isAtLeast(globalStats.hits, 2, "Global stats should aggregate hits from all namespaces");
    });

    it("should track hit rate correctly", () => {
      // Set and get to create a hit
      globalCache.set("key1", "value1", { namespace: "test" });
      globalCache.get("key1", { namespace: "test" });
      
      // Try to get non-existent key to create a miss
      globalCache.get("nonexistent", { namespace: "test" });
      
      const stats = globalCache.getCacheStats("test");
      
      assert.equal(stats.hits, 1, "Should have 1 hit");
      assert.equal(stats.misses, 1, "Should have 1 miss");
      assert.equal(stats.hitRate, 0.5, "Hit rate should be 50%");
    });
  });

  describe("Cache Efficiency Metrics", () => {
    it("should provide metrics for monitoring cache effectiveness", () => {
      // Simulate cache usage
      for (let i = 0; i < 10; i++) {
        globalCache.set(`key${i}`, `value${i}`, { namespace: "efficiency", ttl: 100 });
      }
      
      // Access half of them (successful gets that were previously cached)
      for (let i = 0; i < 5; i++) {
        globalCache.get(`key${i}`, { namespace: "efficiency" });
      }
      
      const stats = globalCache.getCacheStats("efficiency");
      
      // Verify we can measure cache effectiveness
      assert.equal(stats.size, 10, "Cache should contain 10 entries");
      assert.equal(stats.hits, 5, "Should have 5 hits from successful gets");
      // Note: Cache misses only count when compute function is provided and called
      assert.equal(stats.hitRate, 1.0, "Hit rate should be 100% (only hits counted, no compute misses)");
    });

    it("should track evictions when cache is full", () => {
      const maxSize = 5;
      
      // Fill cache beyond max size
      for (let i = 0; i < 10; i++) {
        globalCache.set(`key${i}`, `value${i}`, { 
          namespace: "eviction-test",
          maxSize: maxSize
        });
      }
      
      const stats = globalCache.getCacheStats("eviction-test");
      
      // Should have evicted some entries
      assert.isAtMost(stats.size, maxSize, "Cache size should not exceed maxSize");
      assert.isAtLeast(stats.evictions, 1, "Should have performed evictions");
    });
  });

  describe("Cross-Domain Stats Consistency", () => {
    it("should maintain consistent stats across all cache domains", () => {
      // Collect all domain stats
      const roomFindStats = getRoomFindCacheStats();
      const bodyPartStats = getBodyPartCacheStats();
      const objectStats = getObjectCacheStats();
      const pathStats = getPathCacheStats();
      const roleStats = getRoleCacheStats();
      const globalStats = globalCache.getCacheStats();
      
      // All stats should be valid numbers (not NaN or undefined)
      assert.isNumber(roomFindStats.hits);
      assert.isNumber(bodyPartStats.size);
      assert.isNumber(objectStats.hitRate);
      assert.isNumber(pathStats.evictions);
      assert.isNumber(roleStats.totalEntries);
      assert.isNumber(globalStats.size);
      
      // Hit rates should be between 0 and 1
      assert.isAtLeast(roomFindStats.hitRate, 0);
      assert.isAtMost(roomFindStats.hitRate, 1);
      assert.isAtLeast(objectStats.hitRate, 0);
      assert.isAtMost(objectStats.hitRate, 1);
      assert.isAtLeast(pathStats.hitRate, 0);
      assert.isAtMost(pathStats.hitRate, 1);
      assert.isAtLeast(globalStats.hitRate, 0);
      assert.isAtMost(globalStats.hitRate, 1);
    });
  });
});
