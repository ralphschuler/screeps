/**
 * Deterministic Random Utility
 *
 * Provides deterministic random number generation for Screeps runtime.
 * Uses Game.time as a seed factor to ensure reproducible behavior across ticks.
 */

/**
 * Simple seeded pseudo-random number generator (Mulberry32)
 * Provides deterministic randomness based on a seed value.
 */
class SeededRandom {
  private state: number;

  public constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  public next(): number {
    /* eslint-disable no-bitwise */
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    /* eslint-enable no-bitwise */
  }

  /**
   * Generate random integer in range [min, max)
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Reset with new seed
   */
  public reset(seed: number): void {
    this.state = seed;
  }
}

/**
 * Global seeded random instance
 * Seeded with Game.time for deterministic behavior per tick
 */
let globalRandom: SeededRandom | null = null;
let lastSeedTick = -1;

/**
 * Get the seeded random instance for the current tick
 * Automatically reseeds at the start of each tick
 */
function getSeededRandom(): SeededRandom {
  // Check if Game is available (for tests)
  const currentTick = typeof Game !== "undefined" ? Game.time : 0;

  if (!globalRandom || lastSeedTick !== currentTick) {
    // Create new seed based on tick
    const seed = currentTick * 2654435761; // Use Knuth's multiplicative hash
    globalRandom = new SeededRandom(seed);
    lastSeedTick = currentTick;
  }

  return globalRandom;
}

/**
 * Get a deterministic random number between 0 and 1
 * Uses Game.time as seed factor for reproducibility
 */
export function random(): number {
  return getSeededRandom().next();
}

/**
 * Get a deterministic random integer in range [min, max)
 */
export function randomInt(min: number, max: number): number {
  return getSeededRandom().nextInt(min, max);
}

/**
 * Shuffle array deterministically
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  const rng = getSeededRandom();

  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }

  return result;
}

/**
 * Pick random element from array deterministically
 */
export function pick<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[randomInt(0, array.length)];
}

/**
 * Create a random instance with a custom seed
 * Useful for isolated random sequences
 */
export function createSeededRandom(seed: number): {
  next: () => number;
  nextInt: (min: number, max: number) => number;
} {
  const rng = new SeededRandom(seed);
  return {
    next: () => rng.next(),
    nextInt: (min: number, max: number) => rng.nextInt(min, max)
  };
}

/**
 * Reset the global random state (for testing)
 */
export function resetRandom(): void {
  globalRandom = null;
  lastSeedTick = -1;
}
