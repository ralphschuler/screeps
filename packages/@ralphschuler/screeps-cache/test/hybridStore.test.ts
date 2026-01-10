/**
 * Hybrid Store Tests
 *
 * Unit tests for the HybridStore implementation
 */

import { assert } from "chai";
import { HybridStore, HybridStoreConfig } from "../src/stores/HybridStore";
import { CacheEntry } from "../src/CacheEntry";

describe("HybridStore", () => {
  let store: HybridStore;

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
    
    store = new HybridStore("test");
  });

  describe("Basic Operations", () => {
    it("should store and retrieve entries", () => {
      const entry: CacheEntry<string> = {
        value: "test-value",
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 100,
        hits: 0,
        dirty: false
      };

      store.set("key1", entry);
      const retrieved = store.get<string>("key1");

      assert.isDefined(retrieved);
      assert.equal(retrieved?.value, "test-value");
    });

    it("should return undefined for non-existent keys", () => {
      const retrieved = store.get("nonexistent");
      assert.isUndefined(retrieved);
    });

    it("should delete entries", () => {
      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("key1", entry);
      assert.isTrue(store.has("key1"));

      const deleted = store.delete("key1");
      assert.isTrue(deleted);
      assert.isFalse(store.has("key1"));
    });

    it("should report correct size", () => {
      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      assert.equal(store.size(), 0);

      store.set("key1", entry);
      assert.equal(store.size(), 1);

      store.set("key2", entry);
      assert.equal(store.size(), 2);

      store.delete("key1");
      assert.equal(store.size(), 1);
    });

    it("should list all keys", () => {
      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("key1", entry);
      store.set("key2", entry);
      store.set("key3", entry);

      const keys = store.keys();
      assert.equal(keys.length, 3);
      assert.include(keys, "key1");
      assert.include(keys, "key2");
      assert.include(keys, "key3");
    });

    it("should clear all entries", () => {
      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("key1", entry);
      store.set("key2", entry);
      assert.equal(store.size(), 2);

      store.clear();
      assert.equal(store.size(), 0);
    });
  });

  describe("Selective Persistence", () => {
    it("should persist path cache entries", () => {
      const pathEntry: CacheEntry<string> = {
        value: "path-data",
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 100,
        hits: 0
      };

      store.set("path:W1N1:1,2:W2N2:3,4", pathEntry);
      
      // Trigger persistence
      store.persist();

      // Check Memory was updated
      const g = global as any;
      assert.isDefined(g.Memory._hybridCache);
      assert.isDefined(g.Memory._hybridCache.test);
      assert.isDefined(g.Memory._hybridCache.test.data["path:W1N1:1,2:W2N2:3,4"]);
    });

    it("should persist room scan entries", () => {
      const scanEntry: CacheEntry<any[]> = {
        value: [{ id: "obj1" }, { id: "obj2" }],
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 50,
        hits: 0
      };

      store.set("roomFind:W1N1:structures", scanEntry);
      store.persist();

      const g = global as any;
      assert.isDefined(g.Memory._hybridCache.test.data["roomFind:W1N1:structures"]);
    });

    it("should persist target assignments", () => {
      const targetEntry: CacheEntry<string> = {
        value: "target-id",
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 20,
        hits: 0
      };

      store.set("role:harvester:source", targetEntry);
      store.persist();

      const g = global as any;
      assert.isDefined(g.Memory._hybridCache.test.data["role:harvester:source"]);
    });

    it("should NOT persist object lookups (cheap data)", () => {
      const objectEntry: CacheEntry<any> = {
        value: { id: "obj1" },
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 1,
        hits: 0
      };

      store.set("object:5a3b4c5d", objectEntry);
      store.persist();

      const g = global as any;
      // Should not be in Memory (not persisted)
      assert.isUndefined(g.Memory._hybridCache?.test?.data?.["object:5a3b4c5d"]);
    });

    it("should respect custom persistence filter", () => {
      const customStore = new HybridStore("custom", {
        persistenceFilter: (key) => key.startsWith("important:")
      });

      const entry: CacheEntry<string> = {
        value: "data",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      customStore.set("important:key1", entry);
      customStore.set("unimportant:key2", entry);
      customStore.persist();

      const g = global as any;
      assert.isDefined(g.Memory._hybridCache.custom.data["important:key1"]);
      assert.isUndefined(g.Memory._hybridCache.custom.data["unimportant:key2"]);
    });
  });

  describe("Cache Rehydration After Global Reset", () => {
    it("should restore entries from Memory on initialization", () => {
      // Setup Memory with persisted data
      const g = global as any;
      g.Memory._hybridCache = {
        test: {
          version: 1,
          lastSync: 900,
          memoryUsageBytes: 100,
          data: {
            "path:W1N1:1,2": {
              value: "path-data",
              cachedAt: 900,
              ttl: 100,
              hits: 5
            },
            "roomFind:W1N1": {
              value: ["obj1", "obj2"],
              cachedAt: 950,
              ttl: 50,
              hits: 10
            }
          }
        }
      };

      // Create new store (simulates global reset)
      const newStore = new HybridStore("test");

      // Should have rehydrated entries
      assert.equal(newStore.size(), 2);

      const pathEntry = newStore.get("path:W1N1:1,2");
      assert.isDefined(pathEntry);
      assert.equal(pathEntry?.value, "path-data");
      assert.equal(pathEntry?.hits, 5);

      const scanEntry = newStore.get("roomFind:W1N1");
      assert.isDefined(scanEntry);
      assert.deepEqual(scanEntry?.value, ["obj1", "obj2"]);
      assert.equal(scanEntry?.hits, 10);
    });

    it("should skip expired entries during rehydration", () => {
      const g = global as any;
      g.Game.time = 2000;

      g.Memory._hybridCache = {
        test: {
          version: 1,
          lastSync: 900,
          memoryUsageBytes: 100,
          data: {
            "valid": {
              value: "valid-data",
              cachedAt: 1950,
              ttl: 100,
              hits: 1
            },
            "expired": {
              value: "expired-data",
              cachedAt: 1000,
              ttl: 50,  // Expired at 1050, now it's 2000
              hits: 1
            }
          }
        }
      };

      const newStore = new HybridStore("test");

      // Should only have valid entry
      assert.equal(newStore.size(), 1);
      assert.isDefined(newStore.get("valid"));
      assert.isUndefined(newStore.get("expired"));

      // Expired entry should be removed from Memory
      assert.isUndefined(g.Memory._hybridCache.test.data["expired"]);
    });

    it("should provide recovery statistics", () => {
      const g = global as any;
      g.Memory._hybridCache = {
        test: {
          version: 1,
          lastSync: 900,
          memoryUsageBytes: 5000,
          data: {
            "key1": { value: "data1", cachedAt: 900, hits: 1 },
            "key2": { value: "data2", cachedAt: 900, hits: 1 },
            "key3": { value: "data3", cachedAt: 900, hits: 1 }
          }
        }
      };

      const newStore = new HybridStore("test", { maxMemoryBytes: 10000 });
      const stats = newStore.getRecoveryStats();

      assert.equal(stats.rehydratedEntries, 3);
      assert.equal(stats.memoryBudgetBytes, 10000);
      assert.isAtLeast(stats.memoryUsageBytes, 0);
      assert.isAtMost(stats.budgetUtilization, 1);
    });
  });

  describe("TTL Expiration", () => {
    it("should cleanup expired entries from heap", () => {
      const g = global as any;
      g.Game.time = 1000;

      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 10,
        hits: 0
      };

      store.set("key1", entry);
      assert.equal(store.size(), 1);

      // Advance time past TTL
      g.Game.time = 1020;

      const cleaned = store.cleanup();
      assert.isAtLeast(cleaned, 1);
      assert.equal(store.size(), 0);
    });

    it("should cleanup expired entries from Memory", () => {
      const g = global as any;
      g.Game.time = 1000;

      const entry: CacheEntry<string> = {
        value: "path-data",
        cachedAt: 1000,
        lastAccessed: 1000,
        ttl: 10,
        hits: 0
      };

      store.set("path:W1N1", entry);
      store.persist();

      // Verify it's in Memory
      assert.isDefined(g.Memory._hybridCache.test.data["path:W1N1"]);

      // Advance time past TTL
      g.Game.time = 1020;

      store.cleanup();

      // Should be removed from Memory
      assert.isUndefined(g.Memory._hybridCache.test.data["path:W1N1"]);
    });
  });

  describe("Memory Budget Enforcement", () => {
    it("should respect memory budget limit", () => {
      const smallStore = new HybridStore("budget-test", {
        maxMemoryBytes: 500  // Small budget
      });

      // Add many large entries
      for (let i = 0; i < 20; i++) {
        const entry: CacheEntry<string> = {
          value: "large-data".repeat(50),  // Make it larger
          cachedAt: 1000 + i,
          lastAccessed: 1000 + i,
          hits: 0
        };
        smallStore.set(`path:key${i}`, entry);
      }

      // Trigger persistence multiple times to trigger budget check
      for (let i = 0; i < 12; i++) {
        const g = global as any;
        g.Game.time = 1000 + (i * 10);
        smallStore.persist();
      }

      const stats = smallStore.getRecoveryStats();
      
      // Memory usage should be at or below budget
      assert.isAtMost(stats.memoryUsageBytes, stats.memoryBudgetBytes * 1.1); // 10% tolerance
    });

    it("should evict LRU entries when over budget", () => {
      const g = global as any;
      const smallStore = new HybridStore("lru-test", {
        maxMemoryBytes: 1000,
        syncInterval: 1
      });

      // Add entries with different access times
      for (let i = 0; i < 10; i++) {
        const entry: CacheEntry<string> = {
          value: "data".repeat(20),
          cachedAt: 1000,
          lastAccessed: 1000 + i,
          hits: 0
        };
        smallStore.set(`path:key${i}`, entry);
      }

      // Persist and trigger multiple budget checks
      for (let i = 0; i < 15; i++) {
        g.Game.time = 1000 + (i * 10);
        smallStore.persist();
      }

      const stats = smallStore.getRecoveryStats();
      
      // Should have evicted some entries
      assert.isAtMost(stats.memoryUsageBytes, stats.memoryBudgetBytes * 1.1);
    });
  });

  describe("Sync Interval", () => {
    it("should respect sync interval", () => {
      const g = global as any;
      g.Game.time = 1000;

      const timedStore = new HybridStore("timed", {
        syncInterval: 20
      });

      const entry: CacheEntry<string> = {
        value: "path-data",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      timedStore.set("path:key1", entry);

      // First persist should return 0 (not time yet)
      const persisted1 = timedStore.persist();
      assert.equal(persisted1, 0);

      // Advance time to sync interval
      g.Game.time = 1020;

      // Now should persist
      const persisted2 = timedStore.persist();
      assert.isAtLeast(persisted2, 1);

      // Verify in Memory
      assert.isDefined(g.Memory._hybridCache.timed.data["path:key1"]);
    });

    it("should use default sync interval", () => {
      const defaultStore = new HybridStore("default");
      const g = global as any;
      
      g.Game.time = 1000;
      
      const entry: CacheEntry<string> = {
        value: "path-data",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      defaultStore.set("path:key1", entry);
      
      // Default is 10 ticks
      g.Game.time = 1009;
      assert.equal(defaultStore.persist(), 0);
      
      g.Game.time = 1010;
      assert.isAtLeast(defaultStore.persist(), 1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty store operations", () => {
      assert.equal(store.size(), 0);
      assert.deepEqual(store.keys(), []);
      
      const deleted = store.delete("nonexistent");
      assert.isFalse(deleted);
      
      const cleaned = store.cleanup();
      assert.equal(cleaned, 0);
      
      const persisted = store.persist();
      assert.equal(persisted, 0);
    });

    it("should handle entries without TTL", () => {
      const entry: CacheEntry<string> = {
        value: "permanent",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
        // No TTL = permanent
      };

      store.set("path:permanent", entry);
      store.persist();

      const g = global as any;
      g.Game.time = 10000; // Advance far in time

      // Should not be cleaned up
      const cleaned = store.cleanup();
      assert.equal(store.size(), 1);
      
      const retrieved = store.get("path:permanent");
      assert.isDefined(retrieved);
    });

    it("should handle very large values", () => {
      const largeValue = "x".repeat(10000);
      const entry: CacheEntry<string> = {
        value: largeValue,
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("path:large", entry);
      store.persist();

      const retrieved = store.get("path:large");
      assert.equal(retrieved?.value.length, 10000);
    });
  });
});
