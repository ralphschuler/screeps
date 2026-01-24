/**
 * Cache Coherence Protocol
 *
 * Coordinates multiple cache layers to ensure consistency, efficient memory usage,
 * and optimal cache hit rates through event-based invalidation and priority-based eviction.
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Event-driven invalidation for cache consistency
 * - Hierarchical cache layers (L1/L2/L3) for optimal performance
 * - Memory budget enforcement with priority-based eviction
 * - Unified statistics and monitoring
 *
 * Cache Hierarchy:
 * - L1 (heap-based, fastest): Object references, body parts (short-lived data)
 * - L2 (heap-based, larger): Paths, find results (medium-lived data)
 * - L3 (memory-based): Cross-tick persistent data
 */

import { CacheStats } from "./CacheEntry";
import { CacheManager } from "./CacheManager";

/**
 * Cache layer designation for hierarchical caching
 */
export enum CacheLayer {
  /** L1 cache - heap-based, fastest, shortest TTL */
  L1 = "L1",
  /** L2 cache - heap-based, larger, medium TTL */
  L2 = "L2",
  /** L3 cache - memory-based, persistent across ticks */
  L3 = "L3"
}

/**
 * Scope for cache invalidation
 */
export interface InvalidationScope {
  /** Scope type */
  type: "room" | "creep" | "object" | "structure" | "global" | "pattern";
  /** Room name for room-scoped invalidation */
  roomName?: string;
  /** Creep name for creep-scoped invalidation */
  creepName?: string;
  /** Object ID for object-scoped invalidation */
  objectId?: string;
  /** Structure type for structure-scoped invalidation */
  structureType?: StructureConstant;
  /** Pattern for pattern-based invalidation */
  pattern?: RegExp;
  /** Namespaces to invalidate (empty = all) */
  namespaces?: string[];
}

/**
 * Registered cache layer information
 */
export interface RegisteredCache {
  /** Cache namespace */
  namespace: string;
  /** Cache layer (L1/L2/L3) */
  layer: CacheLayer;
  /** Cache manager instance */
  manager: CacheManager;
  /** Priority for eviction (higher = keep longer) */
  priority: number;
  /** Maximum memory budget in bytes (approximate) */
  maxMemory?: number;
}

/**
 * Cache coherence statistics
 */
export interface CacheCoherenceStats {
  /** Total cache hits across all layers */
  totalHits: number;
  /** Total cache misses across all layers */
  totalMisses: number;
  /** Overall hit rate */
  hitRate: number;
  /** Total memory usage (approximate) */
  totalMemory: number;
  /** Total evictions */
  totalEvictions: number;
  /** Total invalidations */
  totalInvalidations: number;
  /** Per-layer statistics */
  layers: {
    [key in CacheLayer]: {
      size: number;
      hits: number;
      misses: number;
      hitRate: number;
      evictions: number;
    };
  };
  /** Per-namespace statistics */
  namespaces: Record<string, CacheStats>;
}

/**
 * Cache Coherence Manager
 *
 * Coordinates multiple cache systems for consistency and efficiency
 */
export class CacheCoherenceManager {
  private registeredCaches: Map<string, RegisteredCache> = new Map();
  private invalidationCount = 0;
  private lastCleanupTick = 0;
  
  /** Cleanup interval in ticks */
  private readonly CLEANUP_INTERVAL = 10;
  
  /** Default memory budget in bytes (approximate) */
  private readonly DEFAULT_MEMORY_BUDGET = 50 * 1024 * 1024; // 50MB
  
  /** Total memory budget across all caches */
  private totalMemoryBudget = this.DEFAULT_MEMORY_BUDGET;
  
  /** Cached regex patterns for common invalidations */
  private regexCache = new Map<string, RegExp>();
  
  /** Estimated bytes per cache entry by namespace (configurable) */
  private estimatedBytesPerEntry: Record<string, number> = {
    object: 512,      // Small - mostly object references
    bodypart: 256,    // Very small - just numbers
    path: 2048,       // Large - serialized paths
    roomFind: 1024,   // Medium - array of objects
    role: 512,        // Small - role assignments
    closest: 256,     // Small - single object reference
    default: 1024     // Default estimate
  };

  /**
   * Register a cache layer with the coherence manager
   */
  public registerCache(
    namespace: string,
    manager: CacheManager,
    layer: CacheLayer,
    options: {
      priority?: number;
      maxMemory?: number;
    } = {}
  ): void {
    const registration: RegisteredCache = {
      namespace,
      layer,
      manager,
      priority: options.priority ?? this.getDefaultPriority(layer),
      maxMemory: options.maxMemory
    };

    this.registeredCaches.set(namespace, registration);
  }

  /**
   * Get default priority based on cache layer
   */
  private getDefaultPriority(layer: CacheLayer): number {
    switch (layer) {
      case CacheLayer.L1:
        return 100; // Highest priority - keep longest
      case CacheLayer.L2:
        return 50;  // Medium priority
      case CacheLayer.L3:
        return 25;  // Lower priority - evict first
    }
  }

  /**
   * Invalidate caches based on scope
   */
  public invalidate(scope: InvalidationScope): number {
    let invalidated = 0;
    const namespaces = scope.namespaces ?? Array.from(this.registeredCaches.keys());

    for (const namespace of namespaces) {
      const cache = this.registeredCaches.get(namespace);
      if (!cache) continue;

      switch (scope.type) {
        case "global":
          cache.manager.clear(namespace);
          invalidated++;
          break;

        case "pattern":
          if (scope.pattern) {
            const count = cache.manager.invalidatePattern(scope.pattern, namespace);
            invalidated += count;
          }
          break;

        case "room":
          if (scope.roomName) {
            // Use cached regex pattern
            const pattern = this.getRoomPattern(scope.roomName);
            const count = cache.manager.invalidatePattern(pattern, namespace);
            invalidated += count;
          }
          break;

        case "creep":
          if (scope.creepName) {
            // Use cached regex pattern
            const pattern = this.getCreepPattern(scope.creepName);
            const count = cache.manager.invalidatePattern(pattern, namespace);
            invalidated += count;
          }
          break;

        case "object":
          if (scope.objectId) {
            // Invalidate by exact object ID
            cache.manager.invalidate(scope.objectId, namespace);
            invalidated++;
          }
          break;

        case "structure":
          if (scope.structureType && scope.roomName) {
            // Use cached regex pattern
            const patternStr = `${this.escapeRegex(scope.roomName)}.*${scope.structureType}`;
            const pattern = this.getCachedRegex(patternStr);
            const count = cache.manager.invalidatePattern(pattern, namespace);
            invalidated += count;
          }
          break;
      }
    }

    this.invalidationCount += invalidated;
    return invalidated;
  }

  /**
   * Get or create cached regex pattern
   * Uses LRU eviction by re-inserting on access
   */
  private getCachedRegex(pattern: string): RegExp {
    let regex = this.regexCache.get(pattern);
    
    if (regex) {
      // Refresh entry to maintain LRU ordering (most recently used at the end)
      this.regexCache.delete(pattern);
    } else {
      regex = new RegExp(pattern);
    }
    
    this.regexCache.set(pattern, regex);
    
    // Limit cache size to prevent memory leak
    if (this.regexCache.size > 100) {
      // Remove least recently used entry (first in Map due to insertion order)
      const firstKey = this.regexCache.keys().next().value;
      if (firstKey !== undefined) {
        this.regexCache.delete(firstKey);
      }
    }
    
    return regex;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Build and cache regex pattern for room invalidation
   */
  private getRoomPattern(roomName: string): RegExp {
    const escapedRoom = this.escapeRegex(roomName);
    const patternStr = `(^|:)${escapedRoom}($|:)`;
    return this.getCachedRegex(patternStr);
  }

  /**
   * Build and cache regex pattern for creep invalidation
   */
  private getCreepPattern(creepName: string): RegExp {
    const escapedCreep = this.escapeRegex(creepName);
    return this.getCachedRegex(escapedCreep);
  }

  /**
   * Enforce memory limits across all caches
   */
  public enforceMemoryLimits(): number {
    // Get current memory usage estimate
    const currentMemory = this.estimateTotalMemory();
    
    if (currentMemory <= this.totalMemoryBudget) {
      return 0; // Within budget
    }

    // Need to evict - calculate how much
    const targetReduction = currentMemory - this.totalMemoryBudget;
    let totalEvicted = 0;

    // Sort caches by priority (lower priority evicted first)
    const sortedCaches = Array.from(this.registeredCaches.values())
      .sort((a, b) => a.priority - b.priority);

    // Evict from lowest priority caches first using LRU
    for (const cache of sortedCaches) {
      if (totalEvicted >= targetReduction) break;

      const stats = cache.manager.getCacheStats(cache.namespace);
      const cacheSize = stats.size;
      
      if (cacheSize === 0) continue;

      // Calculate how many entries to evict (10% or enough to meet target)
      const bytesPerEntry = this.estimatedBytesPerEntry[cache.namespace] 
        ?? this.estimatedBytesPerEntry.default;
      const entriesNeeded = Math.ceil((targetReduction - totalEvicted) / bytesPerEntry);
      const toEvict = Math.min(
        Math.max(1, Math.floor(cacheSize * 0.1)),
        entriesNeeded
      );
      
      // Evict using the cache manager's LRU eviction when available
      const managerAny = cache.manager as any;
      let actuallyEvicted = 0;
      
      if (typeof managerAny.evictLRU === "function") {
        // Use proper LRU eviction if available
        managerAny.evictLRU(cache.namespace, toEvict);
        actuallyEvicted = toEvict;
      } else {
        // Fallback: use cleanup which only removes expired entries
        // This isn't true LRU but will reduce cache size
        // TODO: Implement proper LRU eviction in CacheManager.evictLRU(namespace, count)
        // Issue URL: https://github.com/ralphschuler/screeps/issues/883
        for (let i = 0; i < toEvict; i++) {
          const evicted = cache.manager.cleanup();
          if (evicted > 0) {
            actuallyEvicted += evicted;
          } else {
            break; // No more to evict
          }
        }
      }

      totalEvicted += actuallyEvicted;
    }

    return totalEvicted;
  }

  /**
   * Estimate total memory usage across all caches
   * Uses configurable per-namespace estimates for accuracy
   */
  private estimateTotalMemory(): number {
    let total = 0;
    
    for (const cache of this.registeredCaches.values()) {
      const stats = cache.manager.getCacheStats(cache.namespace);
      const bytesPerEntry = this.estimatedBytesPerEntry[cache.namespace] 
        ?? this.estimatedBytesPerEntry.default;
      total += stats.size * bytesPerEntry;
    }
    
    return total;
  }

  /**
   * Set estimated bytes per entry for a namespace
   * Allows fine-tuning memory estimation
   */
  public setMemoryEstimate(namespace: string, bytesPerEntry: number): void {
    this.estimatedBytesPerEntry[namespace] = bytesPerEntry;
  }

  /**
   * Get comprehensive cache statistics
   */
  public getCacheStats(): CacheCoherenceStats {
    let totalHits = 0;
    let totalMisses = 0;
    let totalEvictions = 0;
    
    const layerStats: CacheCoherenceStats['layers'] = {
      [CacheLayer.L1]: { size: 0, hits: 0, misses: 0, hitRate: 0, evictions: 0 },
      [CacheLayer.L2]: { size: 0, hits: 0, misses: 0, hitRate: 0, evictions: 0 },
      [CacheLayer.L3]: { size: 0, hits: 0, misses: 0, hitRate: 0, evictions: 0 }
    };
    
    const namespaceStats: Record<string, CacheStats> = {};

    for (const cache of this.registeredCaches.values()) {
      const stats = cache.manager.getCacheStats(cache.namespace);
      
      // Aggregate totals
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalEvictions += stats.evictions;
      
      // Aggregate by layer
      const layer = cache.layer;
      layerStats[layer].size += stats.size;
      layerStats[layer].hits += stats.hits;
      layerStats[layer].misses += stats.misses;
      layerStats[layer].evictions += stats.evictions;
      
      // Per-namespace stats
      namespaceStats[cache.namespace] = stats;
    }

    // Calculate hit rates
    const total = totalHits + totalMisses;
    const hitRate = total > 0 ? totalHits / total : 0;
    
    for (const layer of Object.values(CacheLayer)) {
      const layerTotal = layerStats[layer].hits + layerStats[layer].misses;
      layerStats[layer].hitRate = layerTotal > 0 
        ? layerStats[layer].hits / layerTotal 
        : 0;
    }

    return {
      totalHits,
      totalMisses,
      hitRate,
      totalMemory: this.estimateTotalMemory(),
      totalEvictions,
      totalInvalidations: this.invalidationCount,
      layers: layerStats,
      namespaces: namespaceStats
    };
  }

  /**
   * Cleanup expired entries across all caches
   * Should be called periodically
   */
  public cleanup(): number {
    // Skip if not time yet
    if (Game.time - this.lastCleanupTick < this.CLEANUP_INTERVAL) {
      return 0;
    }

    let totalCleaned = 0;
    
    for (const cache of this.registeredCaches.values()) {
      totalCleaned += cache.manager.cleanup();
    }

    this.lastCleanupTick = Game.time;
    
    // Also enforce memory limits during cleanup
    totalCleaned += this.enforceMemoryLimits();
    
    return totalCleaned;
  }

  /**
   * Persist all memory-backed caches
   */
  public persist(): number {
    let totalPersisted = 0;
    
    for (const cache of this.registeredCaches.values()) {
      // Only persist L3 (memory-backed) caches
      if (cache.layer === CacheLayer.L3) {
        totalPersisted += cache.manager.persist();
      }
    }
    
    return totalPersisted;
  }

  /**
   * Get all registered cache namespaces
   */
  public getRegisteredCaches(): string[] {
    return Array.from(this.registeredCaches.keys());
  }

  /**
   * Check if a cache is registered
   */
  public isRegistered(namespace: string): boolean {
    return this.registeredCaches.has(namespace);
  }

  /**
   * Unregister a cache
   */
  public unregisterCache(namespace: string): boolean {
    return this.registeredCaches.delete(namespace);
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    for (const cache of this.registeredCaches.values()) {
      cache.manager.clear(cache.namespace);
    }
    this.invalidationCount = 0;
  }

  /**
   * Set total memory budget
   */
  public setMemoryBudget(bytes: number): void {
    this.totalMemoryBudget = bytes;
  }

  /**
   * Get current memory budget
   */
  public getMemoryBudget(): number {
    return this.totalMemoryBudget;
  }
}

/**
 * Global cache coherence manager instance
 */
export const cacheCoherence = new CacheCoherenceManager();
