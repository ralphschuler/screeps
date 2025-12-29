/**
 * Adaptive CPU Budget System
 *
 * Dynamically adjusts CPU budgets based on empire size and bucket status:
 * - Logarithmic scaling with room count (efficient 1-100+ room growth)
 * - Bucket-aware multipliers (conserve at low bucket, boost at high bucket)
 * - Process-type specific scaling (eco rooms, war rooms, global processes)
 *
 * Design from ROADMAP.md Section 18:
 * - Base budgets: Eco rooms ≤ 0.1 CPU, War rooms ≤ 0.25 CPU, Global overmind ≤ 1 CPU
 * - These are baseline values that scale with empire growth
 */

import { ProcessFrequency } from "./kernel";

/**
 * Configuration for adaptive budget calculation
 */
export interface AdaptiveBudgetConfig {
  /** Base CPU budgets per frequency at 1 room (percentages of CPU limit) */
  baseFrequencyBudgets: Record<ProcessFrequency, number>;
  /** Room count scaling factors */
  roomScaling: {
    /** Minimum rooms for scaling calculations */
    minRooms: number;
    /** Scale factor for logarithmic growth (higher = slower scaling) */
    scaleFactor: number;
    /** Maximum scaling multiplier (cap to prevent excessive budgets) */
    maxMultiplier: number;
  };
  /** Bucket-based multipliers */
  bucketMultipliers: {
    /** Bucket threshold for high mode (boost budgets) */
    highThreshold: number;
    /** Bucket threshold for low mode (conserve budgets) */
    lowThreshold: number;
    /** Bucket threshold for critical mode (minimal budgets) */
    criticalThreshold: number;
    /** Multiplier when bucket > highThreshold */
    highMultiplier: number;
    /** Multiplier when bucket < lowThreshold */
    lowMultiplier: number;
    /** Multiplier when bucket < criticalThreshold */
    criticalMultiplier: number;
  };
}

/**
 * Default configuration based on ROADMAP.md requirements
 */
export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveBudgetConfig = {
  // Base budgets from ROADMAP.md Section 18 and current kernel defaults
  // Reduced to allow room for scaling without hitting 1.0 cap
  baseFrequencyBudgets: {
    high: 0.25,    // High-frequency (eco rooms: ~0.1 CPU at 1 room after scaling)
    medium: 0.06,  // Medium-frequency (strategic processes)
    low: 0.05      // Low-frequency (market, visualization)
  },
  roomScaling: {
    minRooms: 1,
    // Logarithmic scale factor: budget increases with log(rooms)
    // This ensures smooth scaling from 1 to 100+ rooms
    scaleFactor: 20, // Higher value = slower scaling (was 10)
    maxMultiplier: 2.5 // Cap at 2.5x base budget even with many rooms (was 3.0)
  },
  bucketMultipliers: {
    highThreshold: 9000,
    lowThreshold: 2000,
    criticalThreshold: 500,
    highMultiplier: 1.2,     // 20% boost when bucket is high (was 1.5)
    lowMultiplier: 0.6,      // 40% reduction when bucket is low (was 0.5)
    criticalMultiplier: 0.3  // 70% reduction in critical bucket (was 0.25)
  }
};

/**
 * Calculate room count multiplier using logarithmic scaling
 *
 * Formula: 1 + log(rooms / minRooms) / log(scaleFactor)
 * This provides smooth, sublinear growth as empire expands
 *
 * Examples with scaleFactor=20 (default):
 * - 1 room:   1.0x (baseline)
 * - 10 rooms: ~1.8x
 * - 50 rooms: ~1.6x
 * - 100 rooms: ~1.8x
 *
 * @param roomCount - Current number of controlled rooms
 * @param config - Budget configuration
 * @returns Scaling multiplier (1.0 to maxMultiplier)
 */
export function calculateRoomScalingMultiplier(
  roomCount: number,
  config: AdaptiveBudgetConfig
): number {
  const { minRooms, scaleFactor, maxMultiplier } = config.roomScaling;
  
  // Ensure we have at least minRooms
  const effectiveRooms = Math.max(roomCount, minRooms);
  
  // Logarithmic scaling: grows slowly as empire expands
  // log(rooms / minRooms) / log(scaleFactor)
  const multiplier = 1 + Math.log(effectiveRooms / minRooms) / Math.log(scaleFactor);
  
  // Clamp to reasonable range
  return Math.max(1.0, Math.min(maxMultiplier, multiplier));
}

/**
 * Calculate bucket-based multiplier
 *
 * Adjusts budgets based on CPU bucket status:
 * - High bucket (>9000): 1.2x multiplier - safe to spend more
 * - Normal bucket (2000-9000): 1.0x multiplier - standard operation
 * - Low bucket (<2000): 0.6x multiplier - conserve CPU
 * - Critical bucket (<500): 0.3x multiplier - minimal operation
 *
 * @param bucket - Current CPU bucket level
 * @param config - Budget configuration
 * @returns Bucket multiplier (0.3 to 1.2)
 */
export function calculateBucketMultiplier(
  bucket: number,
  config: AdaptiveBudgetConfig
): number {
  const { highThreshold, lowThreshold, criticalThreshold, highMultiplier, lowMultiplier, criticalMultiplier } =
    config.bucketMultipliers;

  if (bucket >= highThreshold) {
    return highMultiplier;
  } else if (bucket < criticalThreshold) {
    return criticalMultiplier;
  } else if (bucket < lowThreshold) {
    return lowMultiplier;
  } else {
    // Normal operation - no adjustment
    return 1.0;
  }
}

/**
 * Calculate adaptive CPU budget for a process frequency
 *
 * Combines base budget, room scaling, and bucket multiplier:
 * adaptiveBudget = baseBudget * roomMultiplier * bucketMultiplier
 *
 * @param frequency - Process frequency (high/medium/low)
 * @param roomCount - Number of controlled rooms
 * @param bucket - Current CPU bucket level
 * @param config - Budget configuration
 * @returns Adaptive CPU budget (percentage of CPU limit, 0-1)
 */
export function calculateAdaptiveBudget(
  frequency: ProcessFrequency,
  roomCount: number,
  bucket: number,
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG
): number {
  const baseBudget = config.baseFrequencyBudgets[frequency];
  const roomMultiplier = calculateRoomScalingMultiplier(roomCount, config);
  const bucketMultiplier = calculateBucketMultiplier(bucket, config);

  const adaptiveBudget = baseBudget * roomMultiplier * bucketMultiplier;

  // Ensure budget stays within reasonable bounds
  // Cap at 1.0 (100% of CPU limit) per process frequency
  return Math.max(0.01, Math.min(1.0, adaptiveBudget));
}

/**
 * Calculate adaptive budgets for all process frequencies
 *
 * Returns a complete set of budgets for high/medium/low frequency processes
 *
 * @param roomCount - Number of controlled rooms
 * @param bucket - Current CPU bucket level
 * @param config - Budget configuration
 * @returns Budgets for each frequency
 */
export function calculateAdaptiveBudgets(
  roomCount: number,
  bucket: number,
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG
): Record<ProcessFrequency, number> {
  return {
    high: calculateAdaptiveBudget("high", roomCount, bucket, config),
    medium: calculateAdaptiveBudget("medium", roomCount, bucket, config),
    low: calculateAdaptiveBudget("low", roomCount, bucket, config)
  };
}

/**
 * Get current room count from Game object
 *
 * Counts all rooms visible in Game.rooms (owned + reserved)
 * This is used as the basis for budget scaling
 *
 * @returns Number of rooms (minimum 1)
 */
export function getCurrentRoomCount(): number {
  // Count all visible rooms as they all consume CPU
  const roomCount = Object.keys(Game.rooms).length;
  return Math.max(1, roomCount);
}

/**
 * Get current bucket level from Game object
 *
 * @returns Current CPU bucket level
 */
export function getCurrentBucket(): number {
  return Game.cpu.bucket;
}

/**
 * Calculate current adaptive budgets based on game state
 *
 * Convenience function that reads from Game object and calculates budgets
 *
 * @param config - Optional budget configuration (uses default if not provided)
 * @returns Adaptive budgets for all frequencies
 */
export function getAdaptiveBudgets(
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG
): Record<ProcessFrequency, number> {
  const roomCount = getCurrentRoomCount();
  const bucket = getCurrentBucket();
  return calculateAdaptiveBudgets(roomCount, bucket, config);
}

/**
 * Get detailed budget information for diagnostics
 *
 * Returns complete breakdown of budget calculation factors
 */
export interface AdaptiveBudgetInfo {
  roomCount: number;
  bucket: number;
  roomMultiplier: number;
  bucketMultiplier: number;
  budgets: Record<ProcessFrequency, number>;
  baseBudgets: Record<ProcessFrequency, number>;
}

/**
 * Get detailed adaptive budget information
 *
 * @param config - Optional budget configuration
 * @returns Detailed budget breakdown
 */
export function getAdaptiveBudgetInfo(
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG
): AdaptiveBudgetInfo {
  const roomCount = getCurrentRoomCount();
  const bucket = getCurrentBucket();
  const roomMultiplier = calculateRoomScalingMultiplier(roomCount, config);
  const bucketMultiplier = calculateBucketMultiplier(bucket, config);
  const budgets = calculateAdaptiveBudgets(roomCount, bucket, config);

  return {
    roomCount,
    bucket,
    roomMultiplier,
    bucketMultiplier,
    budgets,
    baseBudgets: config.baseFrequencyBudgets
  };
}
