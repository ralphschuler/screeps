/**
 * Shared adaptive CPU budget policy.
 *
 * Kernel scheduling, stats export, and visuals consume this pure policy so
 * room/bucket/performance feedback cannot drift between packages.
 */

export type ProcessFrequency = "high" | "medium" | "low";

/** Configuration for adaptive budget calculation. */
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
  /** Performance tuning for adaptive feedback */
  performance: {
    /** Target average frequency utilization (0..1, where 1 == budget slice fully used) */
    targetUtilization: number;
    /** Max multiplier when a frequency is underutilized */
    maxPerformanceBoost: number;
    /** Min multiplier when a frequency is overutilized */
    minPerformanceBoost: number;
    /** Smoothing strength per tick (0..1) */
    responsiveness: number;
  };
}

/** Default configuration based on ROADMAP.md Section 18 requirements. */
export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveBudgetConfig = {
  // Base budgets from ROADMAP.md Section 18 and current kernel defaults.
  // Reduced to allow room for scaling without hitting 1.0 cap.
  baseFrequencyBudgets: {
    high: 0.25,
    medium: 0.06,
    low: 0.05
  },
  roomScaling: {
    minRooms: 1,
    scaleFactor: 100,
    maxMultiplier: 2.5
  },
  bucketMultipliers: {
    highThreshold: 9000,
    lowThreshold: 2000,
    criticalThreshold: 500,
    highMultiplier: 1.2,
    lowMultiplier: 0.6,
    criticalMultiplier: 0.3
  },
  performance: {
    targetUtilization: 0.75,
    maxPerformanceBoost: 1.15,
    minPerformanceBoost: 0.85,
    responsiveness: 0.30
  }
};

/**
 * Frequency utilization snapshot used for performance-aware budget tuning.
 *
 * Value is process frequency utilization ratio from previous run:
 * - 0.75 = at target workload
 * - >0.75 = overutilized
 * - <0.75 = underutilized
 */
export type FrequencyUtilizationSnapshot = Partial<Record<ProcessFrequency, number>>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Calculate room count multiplier using logarithmic scaling. */
export function calculateRoomScalingMultiplier(
  roomCount: number,
  config: AdaptiveBudgetConfig
): number {
  const { minRooms, scaleFactor, maxMultiplier } = config.roomScaling;
  const safeMinRooms = Math.max(1, minRooms);
  const safeScaleFactor = scaleFactor > 1 ? scaleFactor : DEFAULT_ADAPTIVE_CONFIG.roomScaling.scaleFactor;
  const safeMaxMultiplier = maxMultiplier >= 1 ? maxMultiplier : 1;

  const effectiveRooms = Math.max(roomCount, safeMinRooms);
  const multiplier = 1 + Math.log(effectiveRooms / safeMinRooms) / Math.log(safeScaleFactor);

  return Math.max(1.0, Math.min(safeMaxMultiplier, multiplier));
}

/** Calculate bucket-based multiplier. */
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
  }

  return 1.0;
}

function calculatePerformanceMultiplier(
  frequencyUtilization: number | undefined,
  config: AdaptiveBudgetConfig
): number {
  if (frequencyUtilization === undefined) {
    return 1;
  }

  const target = config.performance.targetUtilization;
  const delta = target - frequencyUtilization;
  const raw = 1 + delta * config.performance.responsiveness;

  return clamp(raw, config.performance.minPerformanceBoost, config.performance.maxPerformanceBoost);
}

/** Calculate adaptive CPU budget for a process frequency. */
export function calculateAdaptiveBudget(
  frequency: ProcessFrequency,
  roomCount: number,
  bucket: number,
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG,
  frequencyUtilization: FrequencyUtilizationSnapshot = {}
): number {
  const baseBudget = config.baseFrequencyBudgets[frequency];
  const roomMultiplier = calculateRoomScalingMultiplier(roomCount, config);
  const bucketMultiplier = calculateBucketMultiplier(bucket, config);
  const performanceMultiplier = calculatePerformanceMultiplier(
    frequencyUtilization[frequency],
    config
  );

  const adaptiveBudget = baseBudget * roomMultiplier * bucketMultiplier * performanceMultiplier;

  return Math.max(0.01, Math.min(1.0, adaptiveBudget));
}

/** Calculate adaptive budgets for all process frequencies. */
export function calculateAdaptiveBudgets(
  roomCount: number,
  bucket: number,
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG,
  frequencyUtilization: FrequencyUtilizationSnapshot = {}
): Record<ProcessFrequency, number> {
  return {
    high: calculateAdaptiveBudget("high", roomCount, bucket, config, frequencyUtilization),
    medium: calculateAdaptiveBudget("medium", roomCount, bucket, config, frequencyUtilization),
    low: calculateAdaptiveBudget("low", roomCount, bucket, config, frequencyUtilization)
  };
}

/** Get current room count from Game object. */
export function getCurrentRoomCount(): number {
  const roomCount = Object.keys(Game.rooms).length;
  return Math.max(1, roomCount);
}

/** Get current bucket level from Game object. */
export function getCurrentBucket(): number {
  return Game.cpu.bucket;
}

/** Calculate current adaptive budgets based on game state. */
export function getAdaptiveBudgets(
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG,
  frequencyUtilization: FrequencyUtilizationSnapshot = {}
): Record<ProcessFrequency, number> {
  const roomCount = getCurrentRoomCount();
  const bucket = getCurrentBucket();
  return calculateAdaptiveBudgets(roomCount, bucket, config, frequencyUtilization);
}

/** Detailed budget information for diagnostics. */
export interface AdaptiveBudgetInfo {
  roomCount: number;
  bucket: number;
  roomMultiplier: number;
  bucketMultiplier: number;
  budgets: Record<ProcessFrequency, number>;
  baseBudgets: Record<ProcessFrequency, number>;
}

/** Get detailed adaptive budget information. */
export function getAdaptiveBudgetInfo(
  config: AdaptiveBudgetConfig = DEFAULT_ADAPTIVE_CONFIG,
  frequencyUtilization: FrequencyUtilizationSnapshot = {}
): AdaptiveBudgetInfo {
  const roomCount = getCurrentRoomCount();
  const bucket = getCurrentBucket();
  const roomMultiplier = calculateRoomScalingMultiplier(roomCount, config);
  const bucketMultiplier = calculateBucketMultiplier(bucket, config);
  const budgets = calculateAdaptiveBudgets(roomCount, bucket, config, frequencyUtilization);

  return {
    roomCount,
    bucket,
    roomMultiplier,
    bucketMultiplier,
    budgets,
    baseBudgets: config.baseFrequencyBudgets
  };
}
