/**
 * Memory-budget policy for cache coherence.
 *
 * The coherence manager keeps the public orchestration API.  This module owns the
 * pure sizing and priority policy so the eviction rules stay easy to reason about:
 * estimate bytes, evict lower-priority namespaces first, and stop once enough
 * bytes have actually been freed.
 */

import type { CacheManager } from "../CacheManager";

const MIN_EVICTION_FRACTION = 0.1;

export type NamespaceMemoryEstimates = Record<string, number>;

export interface MemoryBudgetCache {
  namespace: string;
  priority: number;
  manager: Pick<CacheManager, "getCacheStats" | "cleanup"> & {
    evictLRU?: (namespace: string, count?: number) => number;
  };
}

/** Default approximate bytes per cache entry by namespace. */
export function createDefaultMemoryEstimates(): NamespaceMemoryEstimates {
  return {
    object: 512,      // Small - mostly object references
    bodypart: 256,    // Very small - just numbers
    path: 2048,       // Large - serialized paths
    roomFind: 1024,   // Medium - array of objects
    role: 512,        // Small - role assignments
    closest: 256,     // Small - single object reference
    default: 1024     // Default estimate
  };
}

export function getEstimatedBytesPerEntry(
  namespace: string,
  estimates: NamespaceMemoryEstimates
): number {
  return estimates[namespace] ?? estimates.default;
}

/** Estimate total cache bytes from namespace sizes and configured per-entry costs. */
export function estimateTotalMemory(
  caches: Iterable<MemoryBudgetCache>,
  estimates: NamespaceMemoryEstimates
): number {
  let total = 0;

  for (const cache of caches) {
    const stats = cache.manager.getCacheStats(cache.namespace);
    const bytesPerEntry = getEstimatedBytesPerEntry(cache.namespace, estimates);
    total += stats.size * bytesPerEntry;
  }

  return total;
}

/**
 * Pick a bounded eviction batch for one namespace.
 *
 * At least 10% of the namespace is trimmed once selected. If the remaining byte
 * target needs a larger batch, evict enough from the selected lower-priority
 * namespace before moving on to protected higher-priority caches.
 */
export function calculateEvictionCount(
  cacheSize: number,
  remainingBytesToFree: number,
  bytesPerEntry: number
): number {
  if (cacheSize <= 0 || remainingBytesToFree <= 0) return 0;

  const entriesNeeded = Math.ceil(remainingBytesToFree / bytesPerEntry);
  const minimumBatch = Math.max(1, Math.floor(cacheSize * MIN_EVICTION_FRACTION));

  return Math.min(cacheSize, Math.max(minimumBatch, entriesNeeded));
}

/** Enforce the global memory budget and return the number of entries evicted. */
export function enforceMemoryBudget(
  caches: Iterable<MemoryBudgetCache>,
  memoryBudget: number,
  estimates: NamespaceMemoryEstimates
): number {
  const cacheList = Array.from(caches);
  const currentMemory = estimateTotalMemory(cacheList, estimates);

  if (currentMemory <= memoryBudget) {
    return 0;
  }

  let bytesToFree = currentMemory - memoryBudget;
  let totalEvicted = 0;

  const sortedCaches = cacheList.sort((a, b) => a.priority - b.priority);

  for (const cache of sortedCaches) {
    if (bytesToFree <= 0) break;

    const stats = cache.manager.getCacheStats(cache.namespace);
    if (stats.size === 0) continue;

    const bytesPerEntry = getEstimatedBytesPerEntry(cache.namespace, estimates);
    const toEvict = calculateEvictionCount(stats.size, bytesToFree, bytesPerEntry);
    const evicted = evictEntries(cache, toEvict);

    totalEvicted += evicted;
    bytesToFree -= evicted * bytesPerEntry;
  }

  return totalEvicted;
}

function evictEntries(cache: MemoryBudgetCache, count: number): number {
  if (count <= 0) return 0;

  if (typeof cache.manager.evictLRU === "function") {
    return cache.manager.evictLRU(cache.namespace, count);
  }

  let evicted = 0;
  for (let i = 0; i < count; i++) {
    const cleaned = cache.manager.cleanup();
    if (cleaned <= 0) break;
    evicted += cleaned;
  }

  return evicted;
}
