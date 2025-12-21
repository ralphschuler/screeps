/**
 * Optimization Utilities
 *
 * Performance optimization utilities including CPU efficiency,
 * find optimizations, safe find wrappers, and idle detection.
 */

// CPU Efficiency - throttling and body part calculations
export {
  throttle,
  throttleWithDefault,
  calculateCreepDamagePotential,
  calculateCreepHealPotential,
  countActiveBodyParts
} from "./cpuEfficiency";

// Find Optimizations - optimized room.find() variants
export {
  cachedFindInRange,
  optimizedFindClosest,
  findStructuresByType,
  findPrioritizedConstructionSites,
  findDamagedStructures
} from "./findOptimizations";

// Idle Detection - skip unnecessary behavior evaluations
export {
  canSkipBehaviorEvaluation,
  executeIdleAction
} from "./idleDetection";

// Safe Find - null-safe wrappers for room.find() operations
export {
  safeFind,
  safeFindClosestByRange,
  safeFindInRange,
  safeFindClosestByPath
} from "./safeFind";
