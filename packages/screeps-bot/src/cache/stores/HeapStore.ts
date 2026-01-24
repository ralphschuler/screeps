/**
 * Heap Store - Fast in-memory cache storage
 *
 * Stores cache entries in the global object for maximum performance.
 * Data is lost on global reset but provides fastest access.
 */

import { CacheEntry } from "../CacheEntry";
import { CacheStore } from "../CacheStore";

/**
 * Global heap storage structure
 */
interface HeapStoreData {
  /** Current game tick */
  tick: number;
  /** Cache entries by key */
  entries: Map<string, CacheEntry>;
}

/**
 * Heap-based cache store (fast, non-persistent)
 */
export class HeapStore implements CacheStore {
  private readonly namespace: string;

  constructor(namespace: string = "default") {
    this.namespace = namespace;
  }

  /**
   * Get or initialize the heap storage
   */
  private getStore(): HeapStoreData {
    const g = global as any;
    const key = `_cacheHeap_${this.namespace}`;
    
    if (!g[key] || g[key].tick !== Game.time) {
      // Preserve entries across ticks, only update tick
      if (g[key]) {
        g[key].tick = Game.time;
      } else {
        g[key] = {
          tick: Game.time,
          entries: new Map()
        };
      }
    }
    
    return g[key] as HeapStoreData;
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    const store = this.getStore();
    return store.entries.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    const store = this.getStore();
    store.entries.set(key, entry);
  }

  delete(key: string): boolean {
    const store = this.getStore();
    return store.entries.delete(key);
  }

  has(key: string): boolean {
    const store = this.getStore();
    return store.entries.has(key);
  }

  keys(): string[] {
    const store = this.getStore();
    return Array.from(store.entries.keys());
  }

  size(): number {
    const store = this.getStore();
    return store.entries.size;
  }

  clear(): void {
    const store = this.getStore();
    store.entries.clear();
  }

  /**
   * Cleanup expired entries based on TTL
   */
  cleanup(): number {
    const store = this.getStore();
    let cleaned = 0;

    for (const [key, entry] of store.entries) {
      if (entry.ttl !== undefined && entry.ttl !== -1) {
        const age = Game.time - entry.cachedAt;
        if (age > entry.ttl) {
          store.entries.delete(key);
          cleaned++;
        }
      }
    }

    return cleaned;
  }
}
