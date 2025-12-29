/**
 * Cache Registration
 *
 * Registers all domain-specific caches with the cache coherence manager.
 * This establishes the cache hierarchy and enables coordinated invalidation.
 */

import { globalCache } from "./CacheManager";
import { cacheCoherence, CacheLayer } from "./CacheCoherence";

/**
 * Register all caches with the coherence manager
 * Call this during bot initialization
 * 
 * Total allocated budgets: 38MB
 *   Core caches: 5+2+10+8+3+5 = 33MB
 *   Migrated caches: 1+2+1+1 = 5MB
 * Default total budget in CacheCoherence: 50MB
 * The 12MB difference allows for overhead and future expansion
 * 
 * Note: All caches currently share the same globalCache CacheManager instance.
 * The namespace separation provides logical isolation while using shared storage.
 * Future enhancement: Use separate CacheManager instances per layer.
 */
export function registerAllCaches(): void {
  // L1 Cache: Fast, short-lived data (object references, body parts)
  // Highest priority - keep these in cache longest
  
  cacheCoherence.registerCache(
    "object",
    globalCache,
    CacheLayer.L1,
    {
      priority: 100,
      maxMemory: 5 * 1024 * 1024 // 5MB
    }
  );

  cacheCoherence.registerCache(
    "bodypart",
    globalCache,
    CacheLayer.L1,
    {
      priority: 95,
      maxMemory: 2 * 1024 * 1024 // 2MB
    }
  );

  // L2 Cache: Medium-lived data (paths, find results, roles)
  // Medium priority
  
  cacheCoherence.registerCache(
    "path",
    globalCache,
    CacheLayer.L2,
    {
      priority: 70,
      maxMemory: 10 * 1024 * 1024 // 10MB
    }
  );

  cacheCoherence.registerCache(
    "roomFind",
    globalCache,
    CacheLayer.L2,
    {
      priority: 65,
      maxMemory: 8 * 1024 * 1024 // 8MB
    }
  );

  cacheCoherence.registerCache(
    "role",
    globalCache,
    CacheLayer.L2,
    {
      priority: 60,
      maxMemory: 3 * 1024 * 1024 // 3MB
    }
  );

  cacheCoherence.registerCache(
    "closest",
    globalCache,
    CacheLayer.L2,
    {
      priority: 55,
      maxMemory: 5 * 1024 * 1024 // 5MB
    }
  );

  // Additional application caches (migrated from duplicate implementations)
  
  cacheCoherence.registerCache(
    "collectionPoint",
    globalCache,
    CacheLayer.L2,
    {
      priority: 50,
      maxMemory: 1 * 1024 * 1024 // 1MB - collection points cached per room
    }
  );

  cacheCoherence.registerCache(
    "patrol",
    globalCache,
    CacheLayer.L2,
    {
      priority: 50,
      maxMemory: 2 * 1024 * 1024 // 2MB - patrol waypoints per room
    }
  );

  cacheCoherence.registerCache(
    "targetAssignment",
    globalCache,
    CacheLayer.L1,
    {
      priority: 90,
      maxMemory: 1 * 1024 * 1024 // 1MB - per-tick assignments
    }
  );

  cacheCoherence.registerCache(
    "evolution:structures",
    globalCache,
    CacheLayer.L2,
    {
      priority: 50,
      maxMemory: 1 * 1024 * 1024 // 1MB - structure counts per room
    }
  );

  // L3 Cache: Long-lived, persistent data
  // Lower priority - can be evicted first
  
  // Note: Currently all caches use the same globalCache instance
  // Future enhancement: Create separate CacheManager instances for L3
  // that use memory-backed storage
}

/**
 * Get total memory budget for all caches
 */
export function getTotalCacheBudget(): number {
  return cacheCoherence.getMemoryBudget();
}

/**
 * Set total memory budget for all caches
 */
export function setTotalCacheBudget(bytes: number): void {
  cacheCoherence.setMemoryBudget(bytes);
}
