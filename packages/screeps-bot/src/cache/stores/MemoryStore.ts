/**
 * Memory Store - Persistent cache storage
 *
 * Stores cache entries in Memory for persistence across global resets.
 * Uses a write-ahead pattern: heap cache with periodic Memory sync.
 */

import { CacheEntry } from "../CacheEntry";
import { CacheStore } from "../CacheStore";

// Augment Memory interface
declare global {
  interface Memory {
    _cacheMemory?: Record<string, {
      version: number;
      lastSync: number;
      data: Record<string, { value: any; cachedAt: number; ttl?: number; hits: number }>;
    }>;
  }
}

/**
 * Heap cache layer for fast access
 */
interface HeapLayer {
  tick: number;
  entries: Map<string, CacheEntry>;
  rehydrated: boolean;
}

/**
 * Memory-backed cache store (persistent, slower)
 */
export class MemoryStore implements CacheStore {
  private readonly namespace: string;
  private lastPersistTick = 0;
  private readonly persistInterval: number;
  private static readonly CACHE_VERSION = 1;

  constructor(namespace: string = "default", persistInterval: number = 10) {
    this.namespace = namespace;
    this.persistInterval = persistInterval;
  }

  /**
   * Get or initialize heap layer
   */
  private getHeap(): HeapLayer {
    const g = global as any;
    const key = `_cacheMemoryHeap_${this.namespace}`;
    
    if (!g[key] || g[key].tick !== Game.time) {
      if (g[key]) {
        g[key].tick = Game.time;
      } else {
        g[key] = {
          tick: Game.time,
          entries: new Map(),
          rehydrated: false
        };
      }
    }
    
    const heap = g[key] as HeapLayer;
    
    // Rehydrate from Memory if needed
    if (!heap.rehydrated) {
      this.rehydrate(heap);
      heap.rehydrated = true;
    }
    
    return heap;
  }

  /**
   * Get or initialize Memory storage
   */
  private getMemory() {
    if (!Memory._cacheMemory) {
      Memory._cacheMemory = {};
    }
    if (!Memory._cacheMemory[this.namespace]) {
      Memory._cacheMemory[this.namespace] = {
        version: MemoryStore.CACHE_VERSION,
        lastSync: Game.time,
        data: {}
      };
    }
    return Memory._cacheMemory[this.namespace];
  }

  /**
   * Rehydrate heap from Memory after reset
   */
  private rehydrate(heap: HeapLayer): void {
    const memory = this.getMemory();
    let count = 0;
    let expired = 0;

    // Clean up expired entries during rehydration
    const keysToDelete: string[] = [];
    
    for (const [key, memEntry] of Object.entries(memory.data)) {
      // Check TTL
      if (memEntry.ttl !== undefined && memEntry.ttl !== -1) {
        const age = Game.time - memEntry.cachedAt;
        if (age > memEntry.ttl) {
          keysToDelete.push(key);
          expired++;
          continue; // Skip expired
        }
      }

      heap.entries.set(key, {
        value: memEntry.value,
        cachedAt: memEntry.cachedAt,
        lastAccessed: Game.time,
        ttl: memEntry.ttl,
        hits: memEntry.hits,
        dirty: false
      });
      count++;
    }
    
    // Clean up expired entries from Memory
    for (const key of keysToDelete) {
      delete memory.data[key];
    }
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    const heap = this.getHeap();
    const entry = heap.entries.get(key);
    
    if (entry) {
      // Update last accessed and mark dirty so it can be persisted.
      // Only mark dirty once per tick for this entry to reduce persistence overhead.
      if (entry.lastAccessed !== Game.time) {
        entry.lastAccessed = Game.time;
        entry.dirty = true;
      }
      return entry as CacheEntry<T>;
    }
    
    return undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    const heap = this.getHeap();
    heap.entries.set(key, { ...entry, dirty: true });
  }

  delete(key: string): boolean {
    const heap = this.getHeap();
    const deleted = heap.entries.delete(key);
    
    // Also remove from Memory
    const memory = this.getMemory();
    delete memory.data[key];
    
    return deleted;
  }

  has(key: string): boolean {
    const heap = this.getHeap();
    return heap.entries.has(key);
  }

  keys(): string[] {
    const heap = this.getHeap();
    return Array.from(heap.entries.keys());
  }

  size(): number {
    const heap = this.getHeap();
    return heap.entries.size;
  }

  clear(): void {
    const heap = this.getHeap();
    heap.entries.clear();
    
    const memory = this.getMemory();
    memory.data = {};
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const heap = this.getHeap();
    const memory = this.getMemory();
    let cleaned = 0;

    // Clean heap
    for (const [key, entry] of heap.entries) {
      if (entry.ttl !== undefined && entry.ttl !== -1) {
        const age = Game.time - entry.cachedAt;
        if (age > entry.ttl) {
          heap.entries.delete(key);
          cleaned++;
        }
      }
    }

    // Clean Memory
    for (const [key, memEntry] of Object.entries(memory.data)) {
      if (memEntry.ttl !== undefined && memEntry.ttl !== -1) {
        const age = Game.time - memEntry.cachedAt;
        if (age > memEntry.ttl) {
          delete memory.data[key];
          cleaned++;
        }
      }
    }

    return cleaned;
  }

  /**
   * Persist dirty entries to Memory
   */
  persist(): number {
    // Check interval
    if (Game.time - this.lastPersistTick < this.persistInterval) {
      return 0;
    }

    const heap = this.getHeap();
    const memory = this.getMemory();
    let persisted = 0;

    // Persist dirty entries
    for (const [key, entry] of heap.entries) {
      if (entry.dirty) {
        memory.data[key] = {
          value: entry.value,
          cachedAt: entry.cachedAt,
          ttl: entry.ttl,
          hits: entry.hits
        };
        entry.dirty = false;
        persisted++;
      }
    }

    memory.lastSync = Game.time;
    this.lastPersistTick = Game.time;

    return persisted;
  }
}
