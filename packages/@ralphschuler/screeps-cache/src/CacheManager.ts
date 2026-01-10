/**
 * Cache Manager - Unified cache orchestration
 *
 * Central cache management system that coordinates storage backends,
 * eviction strategies, and provides a unified API for all caching needs.
 */

import { CacheEntry, CacheOptions, CacheStats } from "./CacheEntry";
import { CacheStore } from "./CacheStore";
import { HeapStore } from "./stores/HeapStore";
import { MemoryStore } from "./stores/MemoryStore";
import { HybridStore } from "./stores/HybridStore";

/**
 * Central cache manager with pluggable strategies
 */
export class CacheManager {
  private readonly stores: Map<string, CacheStore>;
  private readonly stats: Map<string, { hits: number; misses: number; evictions: number }>;
  private readonly defaultStore: 'heap' | 'memory' | 'hybrid';

  constructor(defaultStore: 'heap' | 'memory' | 'hybrid' = 'heap') {
    this.stores = new Map();
    this.stats = new Map();
    this.defaultStore = defaultStore;
  }

  /**
   * Get or create a store for the given namespace
   */
  private getStore(namespace: string, storeType?: 'heap' | 'memory' | 'hybrid'): CacheStore {
    const type = storeType ?? this.defaultStore;
    const key = `${namespace}:${type}`;
    
    let store = this.stores.get(key);
    if (!store) {
      if (type === 'memory') {
        store = new MemoryStore(namespace);
      } else if (type === 'hybrid') {
        store = new HybridStore(namespace);
      } else {
        store = new HeapStore(namespace);
      }
      this.stores.set(key, store);
    }
    
    return store;
  }

  /**
   * Get or initialize stats for a namespace
   */
  private getStats(namespace: string) {
    let stats = this.stats.get(namespace);
    if (!stats) {
      stats = { hits: 0, misses: 0, evictions: 0 };
      this.stats.set(namespace, stats);
    }
    return stats;
  }

  /**
   * Generate cache key with namespace
   */
  private makeKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string, options?: CacheOptions & { namespace?: string }): T | undefined {
    const namespace = options?.namespace ?? 'default';
    const store = this.getStore(namespace, options?.store);
    const stats = this.getStats(namespace);
    const fullKey = this.makeKey(namespace, key);

    const entry = store.get<T>(fullKey);
    
    if (!entry) {
      stats.misses++;
      
      // If compute function provided, compute and cache
      if (options?.compute) {
        const value = options.compute();
        this.set(key, value, options);
        return value;
      }
      
      return undefined;
    }

    // Check TTL
    if (entry.ttl !== undefined && entry.ttl !== -1) {
      const age = Game.time - entry.cachedAt;
      if (age > entry.ttl) {
        // Expired
        store.delete(fullKey);
        stats.evictions++;
        stats.misses++;
        
        // Try compute if provided
        if (options?.compute) {
          const value = options.compute();
          this.set(key, value, options);
          return value;
        }
        
        return undefined;
      }
    }

    // Cache hit
    stats.hits++;
    entry.hits++;
    entry.lastAccessed = Game.time;
    // Note: Don't call store.set() on every hit to avoid expensive writes
    // The in-memory entry is already updated

    return entry.value as T;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, options?: CacheOptions & { namespace?: string }): void {
    const namespace = options?.namespace ?? 'default';
    const store = this.getStore(namespace, options?.store);
    const fullKey = this.makeKey(namespace, key);

    // Check max size and evict if needed
    if (options?.maxSize && store.size() >= options.maxSize) {
      // Evict 10% of cache to reduce eviction frequency
      const toEvict = Math.max(1, Math.floor(options.maxSize * 0.1));
      for (let i = 0; i < toEvict; i++) {
        this.evictLRU(namespace, store);
      }
      this.getStats(namespace).evictions += toEvict;
    }

    const entry: CacheEntry<T> = {
      value,
      cachedAt: Game.time,
      lastAccessed: Game.time,
      ttl: options?.ttl,
      hits: 0,
      dirty: true
    };

    store.set(fullKey, entry);
  }

  /**
   * Delete a value from the cache
   */
  invalidate(key: string, namespace: string = 'default'): boolean {
    const heapKey = `${namespace}:heap`;
    const memoryKey = `${namespace}:memory`;
    const hybridKey = `${namespace}:hybrid`;
    const fullKey = this.makeKey(namespace, key);
    
    let deleted = false;
    
    const heapStore = this.stores.get(heapKey);
    if (heapStore) {
      deleted = heapStore.delete(fullKey) || deleted;
    }
    
    const memoryStore = this.stores.get(memoryKey);
    if (memoryStore) {
      deleted = memoryStore.delete(fullKey) || deleted;
    }
    
    const hybridStore = this.stores.get(hybridKey);
    if (hybridStore) {
      deleted = hybridStore.delete(fullKey) || deleted;
    }
    
    return deleted;
  }

  /**
   * Invalidate all keys matching a pattern
   */
  invalidatePattern(pattern: RegExp, namespace: string = 'default'): number {
    const heapKey = `${namespace}:heap`;
    const memoryKey = `${namespace}:memory`;
    const hybridKey = `${namespace}:hybrid`;
    let count = 0;

    const stores = [
      this.stores.get(heapKey),
      this.stores.get(memoryKey),
      this.stores.get(hybridKey)
    ].filter(Boolean);
    
    for (const store of stores) {
      if (!store) continue;
      
      const keys = store.keys();
      for (const key of keys) {
        // Extract the actual key after namespace prefix
        // Keys are formatted as "namespace:actualKey" where actualKey may contain colons
        // (e.g., "path:W1N1:1,2:W2N2:3,4"). We skip the first colon to get actualKey.
        const colonIndex = key.indexOf(':');
        if (colonIndex === -1) continue;
        
        const actualKey = key.substring(colonIndex + 1);
        if (pattern.test(actualKey)) {
          store.delete(key);
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Clear all caches in a namespace
   */
  clear(namespace?: string): void {
    if (namespace) {
      const heapKey = `${namespace}:heap`;
      const memoryKey = `${namespace}:memory`;
      const hybridKey = `${namespace}:hybrid`;
      
      this.stores.get(heapKey)?.clear();
      this.stores.get(memoryKey)?.clear();
      this.stores.get(hybridKey)?.clear();
      this.stats.delete(namespace);
    } else {
      // Clear all
      for (const store of this.stores.values()) {
        store.clear();
      }
      this.stats.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(namespace?: string): CacheStats {
    if (namespace) {
      const stats = this.getStats(namespace);
      const heapKey = `${namespace}:heap`;
      const memoryKey = `${namespace}:memory`;
      const hybridKey = `${namespace}:hybrid`;
      
      const heapSize = this.stores.get(heapKey)?.size() ?? 0;
      const memorySize = this.stores.get(memoryKey)?.size() ?? 0;
      const hybridSize = this.stores.get(hybridKey)?.size() ?? 0;
      
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? stats.hits / total : 0;

      return {
        hits: stats.hits,
        misses: stats.misses,
        hitRate,
        size: heapSize + memorySize + hybridSize,
        evictions: stats.evictions
      };
    } else {
      // Aggregate all namespaces
      let totalHits = 0;
      let totalMisses = 0;
      let totalEvictions = 0;
      let totalSize = 0;

      for (const stats of this.stats.values()) {
        totalHits += stats.hits;
        totalMisses += stats.misses;
        totalEvictions += stats.evictions;
      }

      for (const store of this.stores.values()) {
        totalSize += store.size();
      }

      const total = totalHits + totalMisses;
      const hitRate = total > 0 ? totalHits / total : 0;

      return {
        hits: totalHits,
        misses: totalMisses,
        hitRate,
        size: totalSize,
        evictions: totalEvictions
      };
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(namespace: string, store: CacheStore): void {
    const keys = store.keys();
    if (keys.length === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const key of keys) {
      const entry = store.get(key);
      if (entry && entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      store.delete(oldestKey);
    }
  }

  /**
   * Cleanup expired entries across all stores
   */
  cleanup(): number {
    let total = 0;
    
    for (const store of this.stores.values()) {
      if (store.cleanup) {
        total += store.cleanup();
      }
    }
    
    return total;
  }

  /**
   * Persist all memory stores
   */
  persist(): number {
    let total = 0;
    
    for (const store of this.stores.values()) {
      if (store.persist) {
        total += store.persist();
      }
    }
    
    return total;
  }
}

/**
 * Global cache manager instance
 */
export const globalCache = new CacheManager('heap');
