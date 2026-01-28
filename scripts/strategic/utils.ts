/**
 * Statistical Utility Functions for Performance Analysis
 * 
 * Provides statistical calculations for rolling baseline comparison,
 * including mean, standard deviation, and percentile calculations.
 */

/**
 * Calculate the arithmetic mean (average) of an array of numbers
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 * Uses sample standard deviation (n-1 denominator)
 */
export function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const mean = average(values);
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / (values.length - 1);
  
  return Math.sqrt(variance);
}

/**
 * Calculate a specific percentile from an array of numbers
 * @param values - Array of numeric values
 * @param percentile - Percentile to calculate (0-100)
 * @returns The value at the specified percentile
 */
export function percentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  // Linear interpolation between two values if index is not an integer
  if (Number.isInteger(index)) {
    return sorted[index];
  } else {
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const weight = index - lowerIndex;
    
    return sorted[lowerIndex] * (1 - weight) + sorted[upperIndex] * weight;
  }
}

/**
 * Calculate minimum value in array
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * Calculate maximum value in array
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

/**
 * Determine if a value is statistically significant compared to baseline
 * Uses the threshold: baseline ± (stdDev * sigmaMultiplier)
 * 
 * @param current - Current value
 * @param baseline - Baseline (mean) value
 * @param stdDev - Standard deviation
 * @param sigmaMultiplier - Number of standard deviations (default: 1)
 * @returns Object with isSignificant flag and direction
 */
export function isStatisticallySignificant(
  current: number,
  baseline: number,
  stdDev: number,
  sigmaMultiplier: number = 1
): { isSignificant: boolean; direction: 'higher' | 'lower' | 'stable' } {
  const threshold = stdDev * sigmaMultiplier;
  const difference = current - baseline;
  
  if (Math.abs(difference) <= threshold) {
    return { isSignificant: false, direction: 'stable' };
  }
  
  return {
    isSignificant: true,
    direction: difference > 0 ? 'higher' : 'lower'
  };
}

/**
 * Calculate percentage change from baseline to current
 */
export function percentChange(baseline: number, current: number): number {
  if (baseline === 0) return current === 0 ? 0 : 100;
  return ((current - baseline) / baseline) * 100;
}
