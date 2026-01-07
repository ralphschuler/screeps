/**
 * Cache Statistics for Grafana Integration
 *
 * Exports cache coherence metrics to the stats system for Grafana monitoring.
 * Tracks cache performance, hit rates, memory usage, and invalidation events.
 */

import { cacheCoherence } from "./CacheCoherence";
import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("CacheStats");

/**
 * Collect cache coherence statistics for Grafana
 * Call this from the main stats collection routine
 */
export function collectCacheStats(): Record<string, number> {
  const stats = cacheCoherence.getCacheStats();

  return {
    // Overall cache metrics
    "cache.total.hits": stats.totalHits,
    "cache.total.misses": stats.totalMisses,
    "cache.total.hitRate": stats.hitRate,
    "cache.total.memory": stats.totalMemory,
    "cache.total.evictions": stats.totalEvictions,
    "cache.total.invalidations": stats.totalInvalidations,

    // L1 cache metrics (heap-based, fastest)
    "cache.l1.size": stats.layers.L1.size,
    "cache.l1.hits": stats.layers.L1.hits,
    "cache.l1.misses": stats.layers.L1.misses,
    "cache.l1.hitRate": stats.layers.L1.hitRate,
    "cache.l1.evictions": stats.layers.L1.evictions,

    // L2 cache metrics (heap-based, larger)
    "cache.l2.size": stats.layers.L2.size,
    "cache.l2.hits": stats.layers.L2.hits,
    "cache.l2.misses": stats.layers.L2.misses,
    "cache.l2.hitRate": stats.layers.L2.hitRate,
    "cache.l2.evictions": stats.layers.L2.evictions,

    // L3 cache metrics (memory-based)
    "cache.l3.size": stats.layers.L3.size,
    "cache.l3.hits": stats.layers.L3.hits,
    "cache.l3.misses": stats.layers.L3.misses,
    "cache.l3.hitRate": stats.layers.L3.hitRate,
    "cache.l3.evictions": stats.layers.L3.evictions,

    // Per-namespace metrics
    ...flattenNamespaceStats(stats.namespaces)
  };
}

/**
 * Flatten namespace statistics for Grafana
 */
function flattenNamespaceStats(
  namespaces: Record<string, { hits: number; misses: number; hitRate: number; size: number; evictions: number }>
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [namespace, stats] of Object.entries(namespaces)) {
    result[`cache.${namespace}.size`] = stats.size;
    result[`cache.${namespace}.hits`] = stats.hits;
    result[`cache.${namespace}.misses`] = stats.misses;
    result[`cache.${namespace}.hitRate`] = stats.hitRate;
    result[`cache.${namespace}.evictions`] = stats.evictions;
  }

  return result;
}

/**
 * Get cache performance summary
 */
export function getCachePerformanceSummary(): {
  overallHitRate: number;
  l1HitRate: number;
  l2HitRate: number;
  l3HitRate: number;
  totalMemoryKB: number;
  cacheEfficiency: string;
} {
  const stats = cacheCoherence.getCacheStats();

  // Determine cache efficiency rating
  let efficiency = "poor";
  if (stats.hitRate >= 0.9) efficiency = "excellent";
  else if (stats.hitRate >= 0.75) efficiency = "good";
  else if (stats.hitRate >= 0.5) efficiency = "fair";

  return {
    overallHitRate: stats.hitRate,
    l1HitRate: stats.layers.L1.hitRate,
    l2HitRate: stats.layers.L2.hitRate,
    l3HitRate: stats.layers.L3.hitRate,
    totalMemoryKB: Math.round(stats.totalMemory / 1024),
    cacheEfficiency: efficiency
  };
}

/**
 * Log cache statistics to console
 * Useful for debugging
 */
export function logCacheStats(): void {
  const summary = getCachePerformanceSummary();
  const stats = cacheCoherence.getCacheStats();

  logger.info("Cache Performance Summary", {
    meta: {
      overallHitRate: `${(summary.overallHitRate * 100).toFixed(1)}%`,
      cacheEfficiency: summary.cacheEfficiency,
      l1HitRate: `${(summary.l1HitRate * 100).toFixed(1)}%`,
      l2HitRate: `${(summary.l2HitRate * 100).toFixed(1)}%`,
      l3HitRate: `${(summary.l3HitRate * 100).toFixed(1)}%`,
      totalMemoryKB: `${summary.totalMemoryKB}KB`,
      totalEvictions: stats.totalEvictions,
      totalInvalidations: stats.totalInvalidations
    }
  });
}
