/**
 * Hybrid Store - Combines heap performance with Memory persistence
 *
 * Stores cache entries in heap for fast access while selectively persisting
 * high-value entries to Memory to survive global resets. This provides the
 * best of both worlds: speed during normal operation and resilience during resets.
 *
 * Key Features:
 * - Fast heap access for all reads/writes
 * - Selective Memory persistence for expensive-to-compute data
 * - Memory budget enforcement to prevent bloat
 * - Automatic cache warming on global reset
 * - LRU eviction when memory budget exceeded
 */

import { CacheStore } from "../CacheStore";
import { CacheEntry } from "../CacheEntry";

// Augment Memory interface
declare global {
  interface Memory {
    _hybridCache?: Record<string, {
      version: number;
      lastSync: number;
      memoryUsageBytes: number;
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
  dirtyKeys: Set<string>;
}

/**
 * Configuration for HybridStore
 */
export interface HybridStoreConfig {
  /** Ticks between Memory sync operations */
  syncInterval?: number;
  /** Maximum Memory usage in bytes (default: 100KB) */
  maxMemoryBytes?: number;
  /** Filter function to determine if entry should be persisted */
  persistenceFilter?: (key: string, entry: CacheEntry) => boolean;
}

/**
 * Default persistence filter - persist expensive-to-compute data
 */
function defaultPersistenceFilter(key: string, entry: CacheEntry): boolean {
  // Persist paths (expensive pathfinding)
  if (key.includes('path:') || key.includes(':path:')) return true;
  
  // Persist room scans (expensive Room.find operations)
  if (key.includes('scan:') || key.includes('roomFind:')) return true;
  
  // Persist target assignments (moderate cost but important)
  if (key.includes('target:') || key.includes('role:')) return true;
  
  // Don't persist cheap data (object lookups, body parts)
  return false;
}

/**
 * Hybrid cache store (heap + selective Memory persistence)
 */
export class HybridStore implements CacheStore {
  private readonly namespace: string;
  private readonly config: Required<HybridStoreConfig>;
  private lastPersistTick = 0;
  private lastSizeCheck = 0;
  private static readonly CACHE_VERSION = 1;

  constructor(namespace: string = "default", config: HybridStoreConfig = {}) {
    this.namespace = namespace;
    this.config = {
      syncInterval: config.syncInterval ?? 10,
      maxMemoryBytes: config.maxMemoryBytes ?? 100 * 1024, // 100KB default
      persistenceFilter: config.persistenceFilter ?? defaultPersistenceFilter
    };
  }

  /**
   * Get or initialize heap layer
   */
  private getHeap(): HeapLayer {
    const g = global as any;
    const key = `_hybridCacheHeap_${this.namespace}`;
    
    if (!g[key] || g[key].tick !== Game.time) {
      if (g[key]) {
        g[key].tick = Game.time;
      } else {
        g[key] = {
          tick: Game.time,
          entries: new Map(),
          rehydrated: false,
          dirtyKeys: new Set()
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
    if (!Memory._hybridCache) {
      Memory._hybridCache = {};
    }
    if (!Memory._hybridCache[this.namespace]) {
      Memory._hybridCache[this.namespace] = {
        version: HybridStore.CACHE_VERSION,
        lastSync: Game.time,
        memoryUsageBytes: 0,
        data: {}
      };
    }
    return Memory._hybridCache[this.namespace];
  }

  /**
   * Rehydrate heap from Memory after global reset
   */
  private rehydrate(heap: HeapLayer): void {
    const memory = this.getMemory();
    let loaded = 0;
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
      loaded++;
    }
    
    // Clean up expired entries from Memory
    for (const key of keysToDelete) {
      delete memory.data[key];
    }
    
    // Update memory usage estimate
    if (loaded > 0) {
      memory.memoryUsageBytes = this.estimateMemorySize(memory.data);
    }
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    const heap = this.getHeap();
    const entry = heap.entries.get(key);
    
    if (entry) {
      // Update last accessed (but don't mark dirty unless persistence filter matches)
      entry.lastAccessed = Game.time;
      return entry as CacheEntry<T>;
    }
    
    return undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    const heap = this.getHeap();
    
    // Determine if this entry should be persisted
    const shouldPersist = this.config.persistenceFilter(key, entry);
    
    heap.entries.set(key, { ...entry, dirty: shouldPersist });
    
    if (shouldPersist) {
      heap.dirtyKeys.add(key);
    }
  }

  delete(key: string): boolean {
    const heap = this.getHeap();
    const deleted = heap.entries.delete(key);
    
    // Also remove from Memory
    const memory = this.getMemory();
    if (memory.data[key]) {
      delete memory.data[key];
      memory.memoryUsageBytes = this.estimateMemorySize(memory.data);
    }
    
    heap.dirtyKeys.delete(key);
    
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
    heap.dirtyKeys.clear();
    
    const memory = this.getMemory();
    memory.data = {};
    memory.memoryUsageBytes = 0;
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
          heap.dirtyKeys.delete(key);
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

    // Update memory usage estimate after cleanup
    if (cleaned > 0) {
      memory.memoryUsageBytes = this.estimateMemorySize(memory.data);
    }

    return cleaned;
  }

  /**
   * Persist dirty entries to Memory
   */
  persist(): number {
    // Check interval
    if (Game.time - this.lastPersistTick < this.config.syncInterval) {
      return 0;
    }

    const heap = this.getHeap();
    const memory = this.getMemory();
    let persisted = 0;

    // Persist dirty entries
    for (const key of heap.dirtyKeys) {
      const entry = heap.entries.get(key);
      if (entry) {
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

    heap.dirtyKeys.clear();
    memory.lastSync = Game.time;
    this.lastPersistTick = Game.time;

    // Update memory usage and enforce budget
    memory.memoryUsageBytes = this.estimateMemorySize(memory.data);
    
    // Check memory budget (throttle checks to every 10 syncs)
    if (Game.time - this.lastSizeCheck >= this.config.syncInterval * 10) {
      this.enforceMemoryBudget();
      this.lastSizeCheck = Game.time;
    }

    return persisted;
  }

  /**
   * Estimate Memory size in bytes
   */
  private estimateMemorySize(data: Record<string, any>): number {
    // Approximate JSON serialization size
    try {
      return JSON.stringify(data).length;
    } catch {
      // Fallback to rough estimate
      return Object.keys(data).length * 1024; // ~1KB per entry
    }
  }

  /**
   * Enforce memory budget by evicting LRU entries
   */
  private enforceMemoryBudget(): void {
    const memory = this.getMemory();
    
    if (memory.memoryUsageBytes <= this.config.maxMemoryBytes) {
      return; // Within budget
    }

    const heap = this.getHeap();
    
    // Get all persisted entries sorted by last access (LRU first)
    const entries = Array.from(heap.entries.entries())
      .filter(([key]) => memory.data[key] !== undefined)
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Evict entries until we're under budget
    let evicted = 0;
    for (const [key, entry] of entries) {
      if (memory.memoryUsageBytes <= this.config.maxMemoryBytes) {
        break;
      }
      
      delete memory.data[key];
      evicted++;
      
      // Re-estimate size
      memory.memoryUsageBytes = this.estimateMemorySize(memory.data);
    }
  }

  /**
   * Get cache recovery statistics (for monitoring post-reset recovery)
   */
  getRecoveryStats(): {
    rehydratedEntries: number;
    memoryUsageBytes: number;
    memoryBudgetBytes: number;
    budgetUtilization: number;
  } {
    const memory = this.getMemory();
    const rehydratedEntries = Object.keys(memory.data).length;
    
    return {
      rehydratedEntries,
      memoryUsageBytes: memory.memoryUsageBytes,
      memoryBudgetBytes: this.config.maxMemoryBytes,
      budgetUtilization: memory.memoryUsageBytes / this.config.maxMemoryBytes
    };
  }
}
