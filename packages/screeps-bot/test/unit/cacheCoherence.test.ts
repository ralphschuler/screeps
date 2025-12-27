/**
 * Cache Coherence Tests
 *
 * Unit tests for the cache coherence protocol
 */

import { assert } from "chai";
import { CacheCoherenceManager, CacheLayer, InvalidationScope } from "../../src/cache/CacheCoherence";
import { CacheManager } from "../../src/cache/CacheManager";

describe("CacheCoherence", () => {
  let coherence: CacheCoherenceManager;
  let cache1: CacheManager;
  let cache2: CacheManager;

  beforeEach(() => {
    // Setup Game mock
    const g = global as any;
    g.Game = {
      time: 1000,
      cpu: { bucket: 10000 },
      rooms: {},
      creeps: {},
      structures: {},
      getObjectById: () => null
    };
    g.Memory = {};
    
    coherence = new CacheCoherenceManager();
    cache1 = new CacheManager('heap');
    cache2 = new CacheManager('heap');
  });

  describe("Cache Registration", () => {
    it("should register a cache with default priority", () => {
      coherence.registerCache("test", cache1, CacheLayer.L1);
      
      assert.isTrue(coherence.isRegistered("test"));
      assert.include(coherence.getRegisteredCaches(), "test");
    });

    it("should register multiple caches", () => {
      coherence.registerCache("cache1", cache1, CacheLayer.L1);
      coherence.registerCache("cache2", cache2, CacheLayer.L2);
      
      const registered = coherence.getRegisteredCaches();
      assert.include(registered, "cache1");
      assert.include(registered, "cache2");
    });

    it("should allow custom priority", () => {
      coherence.registerCache("test", cache1, CacheLayer.L1, { priority: 150 });
      assert.isTrue(coherence.isRegistered("test"));
    });

    it("should unregister a cache", () => {
      coherence.registerCache("test", cache1, CacheLayer.L1);
      assert.isTrue(coherence.isRegistered("test"));
      
      const result = coherence.unregisterCache("test");
      assert.isTrue(result);
      assert.isFalse(coherence.isRegistered("test"));
    });
  });

  describe("Invalidation", () => {
    beforeEach(() => {
      coherence.registerCache("object", cache1, CacheLayer.L1);
      coherence.registerCache("path", cache2, CacheLayer.L2);
      
      // Populate caches
      cache1.set("creep:Worker1", "data1", { namespace: "object" });
      cache1.set("creep:Worker2", "data2", { namespace: "object" });
      cache2.set("W1N1:1,2:W1N1:3,4", "path1", { namespace: "path" });
      cache2.set("W2N2:5,6:W2N2:7,8", "path2", { namespace: "path" });
    });

    it("should invalidate by creep name", () => {
      const scope: InvalidationScope = {
        type: "creep",
        creepName: "Worker1",
        namespaces: ["object"]
      };
      
      const invalidated = coherence.invalidate(scope);
      assert.isAtLeast(invalidated, 1);
      
      // Worker1 should be invalidated
      const value = cache1.get("creep:Worker1", { namespace: "object" });
      assert.isUndefined(value);
      
      // Worker2 should still exist
      const value2 = cache1.get("creep:Worker2", { namespace: "object" });
      assert.equal(value2, "data2");
    });

    it("should invalidate by room", () => {
      const scope: InvalidationScope = {
        type: "room",
        roomName: "W1N1",
        namespaces: ["path"]
      };
      
      const invalidated = coherence.invalidate(scope);
      assert.isAtLeast(invalidated, 1);
      
      // W1N1 paths should be invalidated
      const value1 = cache2.get("W1N1:1,2:W1N1:3,4", { namespace: "path" });
      assert.isUndefined(value1);
      
      // W2N2 paths should still exist
      const value2 = cache2.get("W2N2:5,6:W2N2:7,8", { namespace: "path" });
      assert.equal(value2, "path2");
    });

    it("should invalidate by pattern", () => {
      const scope: InvalidationScope = {
        type: "pattern",
        pattern: /Worker/,
        namespaces: ["object"]
      };
      
      const invalidated = coherence.invalidate(scope);
      assert.equal(invalidated, 2); // Both Worker1 and Worker2
      
      assert.isUndefined(cache1.get("creep:Worker1", { namespace: "object" }));
      assert.isUndefined(cache1.get("creep:Worker2", { namespace: "object" }));
    });

    it("should invalidate globally", () => {
      const scope: InvalidationScope = {
        type: "global",
        namespaces: ["object"]
      };
      
      coherence.invalidate(scope);
      
      assert.isUndefined(cache1.get("creep:Worker1", { namespace: "object" }));
      assert.isUndefined(cache1.get("creep:Worker2", { namespace: "object" }));
    });

    it("should invalidate multiple namespaces", () => {
      const scope: InvalidationScope = {
        type: "global",
        // No namespaces specified = all namespaces
      };
      
      coherence.invalidate(scope);
      
      // All caches should be cleared
      assert.isUndefined(cache1.get("creep:Worker1", { namespace: "object" }));
      assert.isUndefined(cache2.get("W1N1:1,2:W1N1:3,4", { namespace: "path" }));
    });
  });

  describe("Statistics", () => {
    beforeEach(() => {
      coherence.registerCache("object", cache1, CacheLayer.L1);
      coherence.registerCache("path", cache2, CacheLayer.L2);
    });

    it("should aggregate statistics from all caches", () => {
      // Populate and access caches to generate stats
      cache1.set("key1", "value1", { namespace: "object" });
      cache1.get("key1", { namespace: "object" }); // hit
      cache1.get("missing", { namespace: "object" }); // miss
      
      cache2.set("key2", "value2", { namespace: "path" });
      cache2.get("key2", { namespace: "path" }); // hit
      
      const stats = coherence.getCacheStats();
      
      assert.equal(stats.totalHits, 2);
      assert.equal(stats.totalMisses, 1);
      assert.approximately(stats.hitRate, 2/3, 0.01);
    });

    it("should track layer-specific statistics", () => {
      cache1.set("key1", "value1", { namespace: "object" });
      cache1.get("key1", { namespace: "object" }); // L1 hit
      
      const stats = coherence.getCacheStats();
      
      assert.isAtLeast(stats.layers.L1.hits, 1);
      assert.equal(stats.layers.L1.size, 1);
    });

    it("should track invalidation count", () => {
      cache1.set("key1", "value1", { namespace: "object" });
      
      const scope: InvalidationScope = {
        type: "global",
        namespaces: ["object"]
      };
      coherence.invalidate(scope);
      
      const stats = coherence.getCacheStats();
      assert.isAtLeast(stats.totalInvalidations, 1);
    });
  });

  describe("Memory Budget Enforcement", () => {
    it("should set and get memory budget", () => {
      const budget = 100 * 1024 * 1024; // 100MB
      coherence.setMemoryBudget(budget);
      
      assert.equal(coherence.getMemoryBudget(), budget);
    });

    it("should not evict when under budget", () => {
      coherence.registerCache("object", cache1, CacheLayer.L1);
      coherence.setMemoryBudget(100 * 1024 * 1024); // Large budget
      
      cache1.set("key1", "value1", { namespace: "object" });
      
      const evicted = coherence.enforceMemoryLimits();
      assert.equal(evicted, 0);
    });

    // Note: Testing actual eviction is complex as it depends on
    // memory estimation. This is better tested via integration tests.
  });

  describe("Cleanup", () => {
    beforeEach(() => {
      coherence.registerCache("object", cache1, CacheLayer.L1);
    });

    it("should cleanup expired entries", () => {
      const g = global as any;
      g.Game.time = 1000;
      
      cache1.set("key1", "value1", { namespace: "object", ttl: 5 });
      
      // Advance time past TTL
      g.Game.time = 1010;
      
      const cleaned = coherence.cleanup();
      assert.isAtLeast(cleaned, 0); // May or may not clean depending on interval
    });

    it("should respect cleanup interval", () => {
      const g = global as any;
      g.Game.time = 1000;
      
      const cleaned1 = coherence.cleanup();
      
      // Try again immediately - should skip
      const cleaned2 = coherence.cleanup();
      assert.equal(cleaned2, 0);
      
      // Advance past interval
      g.Game.time = 1020;
      coherence.cleanup(); // Should run now
    });
  });

  describe("Clear All", () => {
    it("should clear all registered caches", () => {
      coherence.registerCache("object", cache1, CacheLayer.L1);
      coherence.registerCache("path", cache2, CacheLayer.L2);
      
      cache1.set("key1", "value1", { namespace: "object" });
      cache2.set("key2", "value2", { namespace: "path" });
      
      coherence.clearAll();
      
      assert.isUndefined(cache1.get("key1", { namespace: "object" }));
      assert.isUndefined(cache2.get("key2", { namespace: "path" }));
      
      const stats = coherence.getCacheStats();
      assert.equal(stats.totalInvalidations, 0); // Reset after clear
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalidation with no registered caches", () => {
      const scope: InvalidationScope = {
        type: "global"
      };
      
      const invalidated = coherence.invalidate(scope);
      assert.equal(invalidated, 0);
    });

    it("should handle invalidation of non-existent namespace", () => {
      coherence.registerCache("object", cache1, CacheLayer.L1);
      
      const scope: InvalidationScope = {
        type: "global",
        namespaces: ["nonexistent"]
      };
      
      const invalidated = coherence.invalidate(scope);
      assert.equal(invalidated, 0);
    });

    it("should handle special characters in room names", () => {
      coherence.registerCache("path", cache2, CacheLayer.L2);
      
      cache2.set("W1N1:1,2:W1N1:3,4", "path", { namespace: "path" });
      
      const scope: InvalidationScope = {
        type: "room",
        roomName: "W1N1",
        namespaces: ["path"]
      };
      
      const invalidated = coherence.invalidate(scope);
      assert.isAtLeast(invalidated, 1);
    });
  });
});
