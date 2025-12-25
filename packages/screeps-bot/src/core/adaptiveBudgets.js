"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdaptiveBudgetInfo = exports.getAdaptiveBudgets = exports.getCurrentBucket = exports.getCurrentRoomCount = exports.calculateAdaptiveBudgets = exports.calculateAdaptiveBudget = exports.calculateBucketMultiplier = exports.calculateRoomScalingMultiplier = exports.DEFAULT_ADAPTIVE_CONFIG = void 0;
/**
 * Default configuration based on ROADMAP.md requirements
 */
exports.DEFAULT_ADAPTIVE_CONFIG = {
    // Base budgets from ROADMAP.md Section 18 and current kernel defaults
    // Reduced to allow room for scaling without hitting 1.0 cap
    baseFrequencyBudgets: {
        high: 0.25,
        medium: 0.06,
        low: 0.05 // Low-frequency (market, visualization)
    },
    roomScaling: {
        minRooms: 1,
        // Logarithmic scale factor: budget increases with log(rooms)
        // This ensures smooth scaling from 1 to 100+ rooms
        scaleFactor: 20,
        maxMultiplier: 2.5 // Cap at 2.5x base budget even with many rooms (was 3.0)
    },
    bucketMultipliers: {
        highThreshold: 9000,
        lowThreshold: 2000,
        criticalThreshold: 500,
        highMultiplier: 1.2,
        lowMultiplier: 0.6,
        criticalMultiplier: 0.3 // 70% reduction in critical bucket (was 0.25)
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
function calculateRoomScalingMultiplier(roomCount, config) {
    const { minRooms, scaleFactor, maxMultiplier } = config.roomScaling;
    // Ensure we have at least minRooms
    const effectiveRooms = Math.max(roomCount, minRooms);
    // Logarithmic scaling: grows slowly as empire expands
    // log(rooms / minRooms) / log(scaleFactor)
    const multiplier = 1 + Math.log(effectiveRooms / minRooms) / Math.log(scaleFactor);
    // Clamp to reasonable range
    return Math.max(1.0, Math.min(maxMultiplier, multiplier));
}
exports.calculateRoomScalingMultiplier = calculateRoomScalingMultiplier;
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
function calculateBucketMultiplier(bucket, config) {
    const { highThreshold, lowThreshold, criticalThreshold, highMultiplier, lowMultiplier, criticalMultiplier } = config.bucketMultipliers;
    if (bucket >= highThreshold) {
        return highMultiplier;
    }
    else if (bucket < criticalThreshold) {
        return criticalMultiplier;
    }
    else if (bucket < lowThreshold) {
        return lowMultiplier;
    }
    else {
        // Normal operation - no adjustment
        return 1.0;
    }
}
exports.calculateBucketMultiplier = calculateBucketMultiplier;
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
function calculateAdaptiveBudget(frequency, roomCount, bucket, config = exports.DEFAULT_ADAPTIVE_CONFIG) {
    const baseBudget = config.baseFrequencyBudgets[frequency];
    const roomMultiplier = calculateRoomScalingMultiplier(roomCount, config);
    const bucketMultiplier = calculateBucketMultiplier(bucket, config);
    const adaptiveBudget = baseBudget * roomMultiplier * bucketMultiplier;
    // Ensure budget stays within reasonable bounds
    // Cap at 1.0 (100% of CPU limit) per process frequency
    return Math.max(0.01, Math.min(1.0, adaptiveBudget));
}
exports.calculateAdaptiveBudget = calculateAdaptiveBudget;
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
function calculateAdaptiveBudgets(roomCount, bucket, config = exports.DEFAULT_ADAPTIVE_CONFIG) {
    return {
        high: calculateAdaptiveBudget("high", roomCount, bucket, config),
        medium: calculateAdaptiveBudget("medium", roomCount, bucket, config),
        low: calculateAdaptiveBudget("low", roomCount, bucket, config)
    };
}
exports.calculateAdaptiveBudgets = calculateAdaptiveBudgets;
/**
 * Get current room count from Game object
 *
 * Counts all rooms visible in Game.rooms (owned + reserved)
 * This is used as the basis for budget scaling
 *
 * @returns Number of rooms (minimum 1)
 */
function getCurrentRoomCount() {
    // Count all visible rooms as they all consume CPU
    const roomCount = Object.keys(Game.rooms).length;
    return Math.max(1, roomCount);
}
exports.getCurrentRoomCount = getCurrentRoomCount;
/**
 * Get current bucket level from Game object
 *
 * @returns Current CPU bucket level
 */
function getCurrentBucket() {
    return Game.cpu.bucket;
}
exports.getCurrentBucket = getCurrentBucket;
/**
 * Calculate current adaptive budgets based on game state
 *
 * Convenience function that reads from Game object and calculates budgets
 *
 * @param config - Optional budget configuration (uses default if not provided)
 * @returns Adaptive budgets for all frequencies
 */
function getAdaptiveBudgets(config = exports.DEFAULT_ADAPTIVE_CONFIG) {
    const roomCount = getCurrentRoomCount();
    const bucket = getCurrentBucket();
    return calculateAdaptiveBudgets(roomCount, bucket, config);
}
exports.getAdaptiveBudgets = getAdaptiveBudgets;
/**
 * Get detailed adaptive budget information
 *
 * @param config - Optional budget configuration
 * @returns Detailed budget breakdown
 */
function getAdaptiveBudgetInfo(config = exports.DEFAULT_ADAPTIVE_CONFIG) {
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
exports.getAdaptiveBudgetInfo = getAdaptiveBudgetInfo;
