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
export declare const DEFAULT_ADAPTIVE_CONFIG: AdaptiveBudgetConfig;
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
export declare function calculateRoomScalingMultiplier(roomCount: number, config: AdaptiveBudgetConfig): number;
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
export declare function calculateBucketMultiplier(bucket: number, config: AdaptiveBudgetConfig): number;
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
export declare function calculateAdaptiveBudget(frequency: ProcessFrequency, roomCount: number, bucket: number, config?: AdaptiveBudgetConfig): number;
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
export declare function calculateAdaptiveBudgets(roomCount: number, bucket: number, config?: AdaptiveBudgetConfig): Record<ProcessFrequency, number>;
/**
 * Get current room count from Game object
 *
 * Counts all rooms visible in Game.rooms (owned + reserved)
 * This is used as the basis for budget scaling
 *
 * @returns Number of rooms (minimum 1)
 */
export declare function getCurrentRoomCount(): number;
/**
 * Get current bucket level from Game object
 *
 * @returns Current CPU bucket level
 */
export declare function getCurrentBucket(): number;
/**
 * Calculate current adaptive budgets based on game state
 *
 * Convenience function that reads from Game object and calculates budgets
 *
 * @param config - Optional budget configuration (uses default if not provided)
 * @returns Adaptive budgets for all frequencies
 */
export declare function getAdaptiveBudgets(config?: AdaptiveBudgetConfig): Record<ProcessFrequency, number>;
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
export declare function getAdaptiveBudgetInfo(config?: AdaptiveBudgetConfig): AdaptiveBudgetInfo;
//# sourceMappingURL=adaptiveBudgets.d.ts.map