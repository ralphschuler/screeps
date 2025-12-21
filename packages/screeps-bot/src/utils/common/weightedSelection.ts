/**
 * Generic weighted roulette selection utility.
 */

import { random } from "./random";

/** Weighted entry type */
export interface WeightedEntry<T> {
  key: T;
  weight: number;
}

/**
 * Perform weighted random selection (deterministic)
 * @param entries Array of {key, weight} objects
 * @returns Selected key or undefined if no valid entries
 */
export function weightedSelection<T>(entries: WeightedEntry<T>[]): T | undefined {
  // Filter out zero and negative weights
  const validEntries = entries.filter(e => e.weight > 0);

  if (validEntries.length === 0) {
    return undefined;
  }

  // Calculate total weight
  const totalWeight = validEntries.reduce((sum, e) => sum + e.weight, 0);

  if (totalWeight <= 0) {
    return undefined;
  }

  // Deterministic random selection using seeded RNG
  let threshold = random() * totalWeight;

  for (const entry of validEntries) {
    threshold -= entry.weight;
    if (threshold <= 0) {
      return entry.key;
    }
  }

  // Fallback to last entry (mathematical edge case with floating point)
  return validEntries[validEntries.length - 1]?.key;
}

/**
 * Perform weighted selection and return the entry
 */
export function weightedSelectionEntry<T>(entries: WeightedEntry<T>[]): WeightedEntry<T> | undefined {
  const selected = weightedSelection(entries);
  if (selected === undefined) return undefined;
  return entries.find(e => e.key === selected);
}

/**
 * Select top N items by weight
 */
export function selectTopN<T>(entries: WeightedEntry<T>[], n: number): T[] {
  const sorted = [...entries].sort((a, b) => b.weight - a.weight);
  return sorted.slice(0, n).map(e => e.key);
}

/**
 * Select top N entries by weight
 */
export function selectTopNEntries<T>(entries: WeightedEntry<T>[], n: number): WeightedEntry<T>[] {
  const sorted = [...entries].sort((a, b) => b.weight - a.weight);
  return sorted.slice(0, n);
}

/**
 * Normalize weights to sum to 1
 */
export function normalizeWeights<T>(entries: WeightedEntry<T>[]): WeightedEntry<T>[] {
  const validEntries = entries.filter(e => e.weight > 0);
  const totalWeight = validEntries.reduce((sum, e) => sum + e.weight, 0);

  if (totalWeight <= 0) return [];

  return validEntries.map(e => ({
    key: e.key,
    weight: e.weight / totalWeight
  }));
}

/**
 * Scale weights by a factor
 */
export function scaleWeights<T>(entries: WeightedEntry<T>[], factor: number): WeightedEntry<T>[] {
  return entries.map(e => ({
    key: e.key,
    weight: Math.max(0, e.weight * factor)
  }));
}

/**
 * Add bonus weight to specific entries
 */
export function addBonusWeight<T>(
  entries: WeightedEntry<T>[],
  predicate: (entry: WeightedEntry<T>) => boolean,
  bonus: number
): WeightedEntry<T>[] {
  return entries.map(e => ({
    key: e.key,
    weight: predicate(e) ? Math.max(0, e.weight + bonus) : e.weight
  }));
}

/**
 * Combine multiple weighted lists (merge by key)
 */
export function combineWeights<T>(
  lists: WeightedEntry<T>[][],
  combiner: (weights: number[]) => number = weights => weights.reduce((a, b) => a + b, 0)
): WeightedEntry<T>[] {
  const keyMap = new Map<T, number[]>();

  for (const list of lists) {
    for (const entry of list) {
      const existing = keyMap.get(entry.key) ?? [];
      existing.push(entry.weight);
      keyMap.set(entry.key, existing);
    }
  }

  return Array.from(keyMap.entries()).map(([key, weights]) => ({
    key,
    weight: combiner(weights)
  }));
}

/**
 * Create weighted entries from a record
 */
export function fromRecord<T extends string | number | symbol>(record: Record<T, number>): WeightedEntry<T>[] {
  return Object.entries(record).map(([key, weight]) => ({
    key: key as T,
    weight: weight as number
  }));
}

/**
 * Convert weighted entries to a record
 */
export function toRecord<T extends string | number | symbol>(entries: WeightedEntry<T>[]): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const entry of entries) {
    result[entry.key] = entry.weight;
  }
  return result;
}

/**
 * Filter entries by minimum weight
 */
export function filterByMinWeight<T>(entries: WeightedEntry<T>[], minWeight: number): WeightedEntry<T>[] {
  return entries.filter(e => e.weight >= minWeight);
}

/**
 * Get entry with highest weight
 */
export function getHighest<T>(entries: WeightedEntry<T>[]): WeightedEntry<T> | undefined {
  if (entries.length === 0) return undefined;

  return entries.reduce((max, e) => (e.weight > max.weight ? e : max));
}

/**
 * Get entry with lowest positive weight
 */
export function getLowest<T>(entries: WeightedEntry<T>[]): WeightedEntry<T> | undefined {
  const positiveEntries = entries.filter(e => e.weight > 0);
  if (positiveEntries.length === 0) return undefined;

  return positiveEntries.reduce((min, e) => (e.weight < min.weight ? e : min));
}

/**
 * Apply decay to all weights
 */
export function applyDecay<T>(entries: WeightedEntry<T>[], decayFactor: number): WeightedEntry<T>[] {
  return entries.map(e => ({
    key: e.key,
    weight: e.weight * decayFactor
  }));
}

/**
 * Clamp weights to a range
 */
export function clampWeights<T>(entries: WeightedEntry<T>[], min: number, max: number): WeightedEntry<T>[] {
  return entries.map(e => ({
    key: e.key,
    weight: Math.max(min, Math.min(max, e.weight))
  }));
}
