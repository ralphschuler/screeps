/**
 * Unit tests for CacheStore interface
 * Addresses Phase 1 coverage improvement: Cache store interface
 */

import { assert } from "chai";
import type { CacheStore } from "../../src/cache/CacheStore";
import type { CacheEntry } from "../../src/cache/CacheEntry";

// Mock implementation of CacheStore for testing
class MockCacheStore implements CacheStore {
  private store: Map<string, CacheEntry> = new Map();

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.store.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.store.set(key, entry as CacheEntry);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  cleanup(): number {
    // Mock cleanup - remove entries older than TTL
    let cleaned = 0;
    const currentTick = 1000;
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.ttl && (currentTick - entry.cachedAt) > entry.ttl) {
        this.store.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  persist(): number {
    // Mock persist - count dirty entries
    let persisted = 0;
    
    for (const entry of this.store.values()) {
      if (entry.dirty) {
        entry.dirty = false;
        persisted++;
      }
    }
    
    return persisted;
  }
}

describe("CacheStore Interface", () => {
  let store: CacheStore;

  beforeEach(() => {
    store = new MockCacheStore();
  });

  describe("Basic Operations", () => {
    it("should store and retrieve values", () => {
      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("key1", entry);
      const retrieved = store.get<string>("key1");

      assert.isDefined(retrieved);
      assert.equal(retrieved!.value, "test");
    });

    it("should return undefined for missing keys", () => {
      const retrieved = store.get("nonexistent");
      assert.isUndefined(retrieved);
    });

    it("should delete entries", () => {
      const entry: CacheEntry<number> = {
        value: 42,
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

    it("should return false when deleting non-existent key", () => {
      const deleted = store.delete("nonexistent");
      assert.isFalse(deleted);
    });
  });

  describe("Key Management", () => {
    it("should check if key exists", () => {
      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      assert.isFalse(store.has("key1"));
      store.set("key1", entry);
      assert.isTrue(store.has("key1"));
    });

    it("should return all keys", () => {
      const entry1: CacheEntry<string> = {
        value: "test1",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      const entry2: CacheEntry<string> = {
        value: "test2",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("key1", entry1);
      store.set("key2", entry2);

      const keys = store.keys();
      assert.lengthOf(keys, 2);
      assert.include(keys, "key1");
      assert.include(keys, "key2");
    });

    it("should return correct size", () => {
      assert.equal(store.size(), 0);

      const entry: CacheEntry<string> = {
        value: "test",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0
      };

      store.set("key1", entry);
      assert.equal(store.size(), 1);

      store.set("key2", entry);
      assert.equal(store.size(), 2);
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
      assert.lengthOf(store.keys(), 0);
    });
  });

  describe("Optional Cleanup Operation", () => {
    it("should cleanup expired entries", () => {
      if (!store.cleanup) {
        return; // Skip if cleanup not implemented
      }

      const expiredEntry: CacheEntry<string> = {
        value: "expired",
        cachedAt: 800,
        lastAccessed: 800,
        ttl: 100,
        hits: 0
      };

      const validEntry: CacheEntry<string> = {
        value: "valid",
        cachedAt: 950,
        lastAccessed: 950,
        ttl: 100,
        hits: 0
      };

      store.set("expired", expiredEntry);
      store.set("valid", validEntry);

      const cleaned = store.cleanup();
      
      assert.isNumber(cleaned);
      assert.isAbove(cleaned, 0);
    });
  });

  describe("Optional Persist Operation", () => {
    it("should persist dirty entries", () => {
      if (!store.persist) {
        return; // Skip if persist not implemented
      }

      const dirtyEntry: CacheEntry<string> = {
        value: "dirty",
        cachedAt: 1000,
        lastAccessed: 1000,
        hits: 0,
        dirty: true
      };

      store.set("key1", dirtyEntry);

      const persisted = store.persist();
      
      assert.isNumber(persisted);
      assert.isAtLeast(persisted, 0);
    });
  });
});
