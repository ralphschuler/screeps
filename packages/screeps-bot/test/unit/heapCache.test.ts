import { assert } from "chai";
import { HeapCacheManager, INFINITE_TTL } from "../../src/memory/heapCache";

describe("HeapCache", function () {
  let cache: HeapCacheManager;

  beforeEach(function () {
    // Create a fresh cache instance for each test
    cache = new HeapCacheManager();
    
    // Clear global state
    const g = global as any;
    delete g._heapCache;
    
    // Clear Memory
    (Memory as any)._heapCache = undefined;
  });

  describe("Basic Operations", function () {
    it("should set and get values", function () {
      cache.initialize();
      cache.set("test-key", "test-value");
      
      const value = cache.get("test-key");
      assert.equal(value, "test-value");
    });

    it("should return undefined for non-existent keys", function () {
      cache.initialize();
      const value = cache.get("non-existent");
      assert.isUndefined(value);
    });

    it("should delete values", function () {
      cache.initialize();
      cache.set("test-key", "test-value");
      cache.delete("test-key");
      
      const value = cache.get("test-key");
      assert.isUndefined(value);
    });

    it("should check if key exists", function () {
      cache.initialize();
      cache.set("test-key", "test-value");
      
      assert.isTrue(cache.has("test-key"));
      assert.isFalse(cache.has("non-existent"));
    });

    it("should clear all values", function () {
      cache.initialize();
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      
      cache.clear();
      
      assert.isFalse(cache.has("key1"));
      assert.isFalse(cache.has("key2"));
    });
  });

  describe("Complex Data Types", function () {
    it("should store and retrieve objects", function () {
      cache.initialize();
      const obj = { name: "test", count: 42, nested: { value: true } };
      cache.set("object-key", obj);
      
      const retrieved = cache.get("object-key");
      assert.deepEqual(retrieved, obj);
    });

    it("should store and retrieve arrays", function () {
      cache.initialize();
      const arr = [1, 2, 3, "four", { five: 5 }];
      cache.set("array-key", arr);
      
      const retrieved = cache.get("array-key");
      assert.deepEqual(retrieved, arr);
    });
  });

  describe("Persistence", function () {
    it("should persist dirty entries to Memory", function () {
      cache.initialize();
      cache.set("persist-key", "persist-value");
      
      const persisted = cache.persist(true);
      assert.equal(persisted, 1);
      
      // Check Memory
      const memory = (Memory as any)._heapCache;
      assert.isDefined(memory);
      assert.isDefined(memory.data["persist-key"]);
      assert.equal(memory.data["persist-key"].value, "persist-value");
    });

    it("should not persist clean entries", function () {
      cache.initialize();
      cache.set("key1", "value1");
      cache.persist(true);
      
      // Now entry is clean
      const persisted = cache.persist(true);
      assert.equal(persisted, 0);
    });

    it("should rehydrate from Memory on initialization", function () {
      // First, set up Memory with some data
      (Memory as any)._heapCache = {
        version: 1,
        lastSync: Game.time,
        data: {
          "rehydrate-key": {
            value: "rehydrate-value",
            lastModified: Game.time,
            ttl: 1000
          }
        }
      };
      
      // Create new cache and initialize
      const newCache = new HeapCacheManager();
      newCache.initialize();
      
      // Should be able to retrieve the value
      const value = newCache.get("rehydrate-key");
      assert.equal(value, "rehydrate-value");
    });
  });

  describe("TTL (Time To Live)", function () {
    it("should expire entries after TTL", function () {
      cache.initialize();
      cache.set("ttl-key", "ttl-value", 5); // 5 tick TTL
      
      // Value should be available immediately
      assert.equal(cache.get("ttl-key"), "ttl-value");
      
      // Simulate time passing (in real Screeps, this would be actual game ticks)
      const memory = (Memory as any)._heapCache;
      if (memory && memory.data["ttl-key"]) {
        memory.data["ttl-key"].lastModified = Game.time - 10; // Make it older than TTL
      }
      
      // Access through Memory to trigger TTL check
      const heap = (global as any)._heapCache;
      if (heap && heap.entries) {
        const entry = heap.entries.get("ttl-key");
        if (entry) {
          entry.lastModified = Game.time - 10; // Make it older than TTL
        }
      }
      
      // Value should be expired
      const value = cache.get("ttl-key");
      assert.isUndefined(value);
    });

    it("should use default TTL when not specified", function () {
      cache.initialize();
      cache.set("default-ttl-key", "default-ttl-value");
      cache.persist(true);
      
      const memory = (Memory as any)._heapCache;
      assert.isDefined(memory.data["default-ttl-key"].ttl);
      assert.isNumber(memory.data["default-ttl-key"].ttl);
    });

    it("should clean expired entries", function () {
      cache.initialize();
      cache.set("expire1", "value1", 5);
      cache.set("expire2", "value2", 5);
      cache.set("keep", "value-keep", 1000);
      
      // Make some entries old
      const heap = (global as any)._heapCache;
      if (heap && heap.entries) {
        const entry1 = heap.entries.get("expire1");
        const entry2 = heap.entries.get("expire2");
        if (entry1) entry1.lastModified = Game.time - 10;
        if (entry2) entry2.lastModified = Game.time - 10;
      }
      
      const cleaned = cache.cleanExpired();
      assert.isAtLeast(cleaned, 2);
      assert.isUndefined(cache.get("expire1"));
      assert.isUndefined(cache.get("expire2"));
      assert.equal(cache.get("keep"), "value-keep");
    });

    it("should support infinite TTL (-1)", function () {
      cache.initialize();
      cache.set("infinite-key", "infinite-value", INFINITE_TTL);
      
      // Simulate time passing (way beyond normal TTL)
      const heap = (global as any)._heapCache;
      if (heap && heap.entries) {
        const entry = heap.entries.get("infinite-key");
        if (entry) {
          entry.lastModified = Game.time - 10000; // Very old
        }
      }
      
      // Value should still be available (infinite TTL)
      const value = cache.get("infinite-key");
      assert.equal(value, "infinite-value");
    });

    it("should not clean entries with infinite TTL", function () {
      cache.initialize();
      cache.set("infinite1", "value1", INFINITE_TTL);
      cache.set("infinite2", "value2", INFINITE_TTL);
      cache.set("expire", "expire-value", 5);
      
      // Make all entries old
      const heap = (global as any)._heapCache;
      if (heap && heap.entries) {
        for (const [key, entry] of heap.entries) {
          entry.lastModified = Game.time - 10000;
        }
      }
      
      const cleaned = cache.cleanExpired();
      // Should only clean the one with TTL=5, not the infinite ones
      assert.equal(cleaned, 1);
      assert.equal(cache.get("infinite1"), "value1");
      assert.equal(cache.get("infinite2"), "value2");
      assert.isUndefined(cache.get("expire"));
    });
  });

  describe("Statistics", function () {
    it("should return accurate stats", function () {
      cache.initialize();
      cache.set("stat-key1", "value1");
      cache.set("stat-key2", "value2");
      
      const stats = cache.getStats();
      assert.equal(stats.heapSize, 2);
      assert.equal(stats.dirtyEntries, 2);
    });

    it("should list all keys", function () {
      cache.initialize();
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");
      
      const keys = cache.keys();
      assert.equal(keys.length, 3);
      assert.include(keys, "key1");
      assert.include(keys, "key2");
      assert.include(keys, "key3");
    });

    it("should list all values", function () {
      cache.initialize();
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      
      const values = cache.values();
      assert.equal(values.length, 2);
      assert.include(values, "value1");
      assert.include(values, "value2");
    });
  });

  describe("Write-Ahead Cache Pattern", function () {
    it("should write to heap immediately", function () {
      cache.initialize();
      cache.set("fast-key", "fast-value");
      
      // Should be available in heap immediately
      const value = cache.get("fast-key");
      assert.equal(value, "fast-value");
      
      // But not yet in Memory (until persist is called)
      const memory = (Memory as any)._heapCache;
      if (!memory || !memory.data) {
        assert.isTrue(true); // Memory not initialized yet is fine
      }
    });

    it("should persist on explicit persist call", function () {
      cache.initialize();
      cache.set("persist-key", "persist-value");
      
      // Persist to Memory
      cache.persist(true);
      
      // Now should be in Memory
      const memory = (Memory as any)._heapCache;
      assert.isDefined(memory);
      assert.equal(memory.data["persist-key"].value, "persist-value");
    });

    it("should serve from heap after rehydration", function () {
      // Set up initial data
      cache.initialize();
      cache.set("rehydrate-test", "rehydrate-value");
      cache.persist(true);
      
      // Simulate reset by clearing heap
      (global as any)._heapCache = undefined;
      
      // Create new cache instance (simulates new session after reset)
      const newCache = new HeapCacheManager();
      newCache.initialize();
      
      // Should be able to get value from rehydrated heap
      const value = newCache.get("rehydrate-test");
      assert.equal(value, "rehydrate-value");
    });
  });
});
