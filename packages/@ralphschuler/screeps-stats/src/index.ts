/**
 * @ralphschuler/screeps-stats
 * 
 * Unified stats collection and export for Prometheus/Grafana
 */

// Export main stats managers
export { UnifiedStatsManager, unifiedStats } from './unifiedStats';
export { MemorySegmentStats, memorySegmentStats } from './memorySegmentStats';

// Export pathfinding metrics
export { pathfindingMetrics } from './pathfindingMetrics';

// Export adaptive budgets utilities
export { 
  calculateRoomScalingMultiplier,
  calculateBucketMultiplier,
  getAdaptiveBudgetInfo
} from './adaptiveBudgets';

// Export types
export * from './statsTypes';
export type { AdaptiveBudgetConfig } from './adaptiveBudgets';
export type { 
  StatsConfig,
  MetricPoint,
  MetricSeries,
  RoomStats,
  GlobalStats
} from './memorySegmentStats';

// Export interfaces for external dependencies
export type {
  Logger,
  MemoryManager,
  ShardManager,
  CacheStatsResult,
  GlobalCache,
  EvolutionStage,
  RoomPosture,
  PheromoneState
} from './interfaces';

export {
  VisualizationLayer
} from './interfaces';
