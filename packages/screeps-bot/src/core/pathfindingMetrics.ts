/**
 * Pathfinding Metrics Tracker
 * 
 * Tracks pathfinding performance metrics for CPU optimization analysis.
 * Integrates with unifiedStats system.
 */

import type { PathfindingStats } from "../stats/types";

/**
 * Estimated CPU cost for uncached pathfinding operation
 * Used for calculating CPU savings from cache hits
 */
const ESTIMATED_UNCACHED_CPU_COST = 0.5;

/**
 * Global pathfinding metrics for the current tick
 */
class PathfindingMetricsTracker {
  private metrics: PathfindingStats = {
    totalCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: 0,
    cpuUsed: 0,
    avgCpuPerCall: 0,
    cpuSaved: 0,
    callsByType: {
      moveTo: 0,
      pathFinderSearch: 0,
      findPath: 0,
      moveByPath: 0
    }
  };

  /**
   * Record a pathfinding call
   */
  public recordCall(
    type: 'moveTo' | 'pathFinderSearch' | 'findPath' | 'moveByPath',
    wasCached: boolean,
    cpuCost: number
  ): void {
    this.metrics.totalCalls++;
    this.metrics.callsByType[type]++;
    this.metrics.cpuUsed += cpuCost;

    if (wasCached) {
      this.metrics.cacheHits++;
      // Estimate CPU saved: uncached would cost ~0.5 CPU, cached costs actual
      const savedCpu = Math.max(ESTIMATED_UNCACHED_CPU_COST - cpuCost, 0);
      this.metrics.cpuSaved += savedCpu;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Get current metrics snapshot
   */
  public getMetrics(): PathfindingStats {
    // Calculate derived metrics
    this.metrics.cacheHitRate = this.metrics.totalCalls > 0
      ? this.metrics.cacheHits / this.metrics.totalCalls
      : 0;

    this.metrics.avgCpuPerCall = this.metrics.totalCalls > 0
      ? this.metrics.cpuUsed / this.metrics.totalCalls
      : 0;

    return { ...this.metrics };
  }

  /**
   * Reset metrics for new tick
   */
  public reset(): void {
    this.metrics = {
      totalCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      cpuUsed: 0,
      avgCpuPerCall: 0,
      cpuSaved: 0,
      callsByType: {
        moveTo: 0,
        pathFinderSearch: 0,
        findPath: 0,
        moveByPath: 0
      }
    };
  }
}

/**
 * Global singleton instance
 */
export const pathfindingMetrics = new PathfindingMetricsTracker();

/**
 * Wrapper for tracking pathfinding calls with CPU measurement
 */
export function trackPathfindingCall<T>(
  type: 'moveTo' | 'pathFinderSearch' | 'findPath' | 'moveByPath',
  wasCached: boolean,
  fn: () => T
): T {
  const startCpu = Game.cpu.getUsed();
  const result = fn();
  const cpuCost = Game.cpu.getUsed() - startCpu;

  pathfindingMetrics.recordCall(type, wasCached, cpuCost);

  return result;
}
