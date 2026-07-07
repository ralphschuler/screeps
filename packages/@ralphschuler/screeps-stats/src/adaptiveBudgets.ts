/**
 * Stats adapter for the shared adaptive CPU budget policy.
 *
 * The policy lives in @ralphschuler/screeps-core so stats, kernel scheduling,
 * and dashboard visualizations cannot drift.
 */

export {
  DEFAULT_ADAPTIVE_CONFIG,
  calculateAdaptiveBudget,
  calculateAdaptiveBudgets,
  calculateBucketMultiplier,
  calculateRoomScalingMultiplier,
  getAdaptiveBudgetInfo,
  getAdaptiveBudgets,
  getCurrentBucket,
  getCurrentRoomCount
} from "@ralphschuler/screeps-core";

export type {
  AdaptiveBudgetConfig,
  AdaptiveBudgetInfo,
  FrequencyUtilizationSnapshot
} from "@ralphschuler/screeps-core";
