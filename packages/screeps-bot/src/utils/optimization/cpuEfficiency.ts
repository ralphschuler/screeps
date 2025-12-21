/**
 * CPU efficiency utilities with throttled execution and lazy evaluation.
 */

/**
 * Execute a function only every N ticks.
 * @param offset - Optional offset to spread load across ticks
 */
export function throttle<T>(fn: () => T, interval: number, offset = 0): T | undefined {
  if ((Game.time + offset) % interval === 0) {
    return fn();
  }
  return undefined;
}

/** Execute a function only every N ticks, with a default value for non-execution ticks. */
export function throttleWithDefault<T>(
  fn: () => T,
  interval: number,
  defaultValue: T,
  offset = 0
): T {
  if ((Game.time + offset) % interval === 0) {
    return fn();
  }
  return defaultValue;
}

// Deprecated: Use cached versions from bodyPartCache.ts for better performance
import {
  getCachedBodyPartCount,
  getCachedDamagePotential,
  getCachedHealPotential,
  hasCachedBodyPart
} from "../caching/bodyPartCache";

/**
 * @deprecated Use getCachedDamagePotential from bodyPartCache instead
 */
export function calculateCreepDamagePotential(creep: Creep): number {
  return getCachedDamagePotential(creep);
}

/**
 * @deprecated Use getCachedHealPotential from bodyPartCache instead
 */
export function calculateCreepHealPotential(creep: Creep): number {
  return getCachedHealPotential(creep);
}

/**
 * @deprecated Use getCachedBodyPartCount from bodyPartCache instead
 */
export function countActiveBodyParts(creep: Creep, partType: BodyPartConstant): number {
  return getCachedBodyPartCount(creep, partType, true);
}

/**
 * Check if a creep has any active parts of a specific type.
 * More efficient than counting when you only need to know presence.
 * 
 * @deprecated Use hasCachedBodyPart from bodyPartCache instead for better performance
 * @param creep - Creep to check
 * @param partType - Type of body part to check for
 * @returns true if creep has at least one active part of the specified type
 */
export function hasActiveBodyPart(creep: Creep, partType: BodyPartConstant): boolean {
  return hasCachedBodyPart(creep, partType, true);
}

/**
 * Filter array efficiently by running predicate only once per unique value.
 * Useful when the predicate is expensive and there may be duplicates.
 *
 * @param array - Array to filter
 * @param keyFn - Function to extract a unique key from each item
 * @param predicate - Predicate function to test items
 * @returns Filtered array
 */
export function filterWithMemoization<T, K>(
  array: T[],
  keyFn: (item: T) => K,
  predicate: (item: T) => boolean
): T[] {
  const cache = new Map<K, boolean>();
  return array.filter(item => {
    const key = keyFn(item);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = predicate(item);
    cache.set(key, result);
    return result;
  });
}

/**
 * Calculate Chebyshev distance (max of absolute differences).
 * This is the same as getRangeTo() but can be used without creating RoomPosition objects.
 *
 * @param x1 - X coordinate of first position
 * @param y1 - Y coordinate of first position
 * @param x2 - X coordinate of second position
 * @param y2 - Y coordinate of second position
 * @returns Chebyshev distance between the two positions
 */
export function chebyshevDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

/**
 * Check if two positions are within a specified range.
 * More efficient than getRangeTo() when you only need a boolean result.
 *
 * @param x1 - X coordinate of first position
 * @param y1 - Y coordinate of first position
 * @param x2 - X coordinate of second position
 * @param y2 - Y coordinate of second position
 * @param range - Maximum allowed distance
 * @returns true if positions are within range
 */
export function isWithinRange(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  range: number
): boolean {
  return Math.abs(x1 - x2) <= range && Math.abs(y1 - y2) <= range;
}

/**
 * Find the closest item from an array using Chebyshev distance.
 * More efficient than findClosestByRange for small arrays.
 *
 * @param pos - Position to measure from
 * @param items - Array of items with pos property
 * @returns Closest item, or null if array is empty
 */
export function findClosestByRangeFast<T extends { pos: RoomPosition }>(
  pos: RoomPosition,
  items: T[]
): T | null {
  if (items.length === 0) return null;

  let closest: T | null = null;
  let closestRange = Infinity;

  for (const item of items) {
    // Skip items in different rooms
    if (item.pos.roomName !== pos.roomName) continue;

    const range = chebyshevDistance(pos.x, pos.y, item.pos.x, item.pos.y);
    if (range < closestRange) {
      closestRange = range;
      closest = item;
    }
  }

  return closest;
}

/**
 * Sum values from an array using a single iteration.
 * More efficient than array.reduce() for simple summation.
 *
 * @param array - Array of items
 * @param valueFn - Function to extract numeric value from each item
 * @returns Sum of all values
 */
export function sumValues<T>(array: T[], valueFn: (item: T) => number): number {
  let sum = 0;
  for (const item of array) {
    sum += valueFn(item);
  }
  return sum;
}

/**
 * Group items by a key efficiently using a Map.
 *
 * @param array - Array of items
 * @param keyFn - Function to extract grouping key from each item
 * @returns Map of key to array of items
 */
export function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of array) {
    const key = keyFn(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

/**
 * Check if CPU bucket is low enough to skip non-essential work.
 * Allows early exit from expensive operations when CPU is limited.
 *
 * @param threshold - Bucket level below which to return true (default: 2000)
 * @returns true if bucket is below threshold
 */
export function isLowBucket(threshold = 2000): boolean {
  return Game.cpu.bucket < threshold;
}

/**
 * Check if there's enough CPU remaining in this tick.
 *
 * @param minCpuNeeded - Minimum CPU needed for the operation
 * @param targetUsage - Target usage as fraction of limit (default: 0.8)
 * @returns true if there's enough CPU remaining
 */
export function hasCpuBudget(minCpuNeeded = 0, targetUsage = 0.8): boolean {
  const used = Game.cpu.getUsed();
  const limit = Game.cpu.limit * targetUsage;
  return limit - used >= minCpuNeeded;
}
