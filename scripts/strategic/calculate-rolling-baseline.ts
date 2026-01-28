/**
 * Rolling Baseline Calculator
 * 
 * Calculates rolling baselines (7-day, 30-day) from historical performance data
 * for trend analysis and regression detection.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  PerformanceBaseline,
  PerformanceSnapshot,
  PerformanceMetrics,
  RollingBaseline
} from '../../packages/screeps-bot/test/performance/strategic-types.js';
import {
  average,
  standardDeviation,
  percentile,
  min,
  max
} from './utils.js';

/**
 * Load recent baselines from the strategic baselines directory
 * @param days - Number of days to look back
 * @param baselinesDir - Directory containing baseline files
 * @returns Array of performance baselines within the time window
 */
export function loadRecentBaselines(
  days: number,
  baselinesDir: string = 'performance-baselines/strategic'
): PerformanceBaseline[] {
  if (!existsSync(baselinesDir)) {
    console.warn(`Baselines directory does not exist: ${baselinesDir}`);
    return [];
  }

  const files = readdirSync(baselinesDir)
    .filter(f => f.endsWith('.json') && f !== 'README.md')
    .sort()
    .reverse(); // Most recent first

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTime = cutoffDate.getTime();

  const baselines: PerformanceBaseline[] = [];

  for (const file of files) {
    try {
      const filePath = join(baselinesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const baseline = JSON.parse(content) as PerformanceBaseline;

      // Check if baseline is within time window
      const baselineTime = new Date(baseline.timestamp).getTime();
      if (baselineTime >= cutoffTime) {
        baselines.push(baseline);
      } else {
        // Files are sorted newest first, so we can stop once we hit old data
        break;
      }
    } catch (error) {
      console.warn(`Failed to load baseline file ${file}:`, error);
    }
  }

  return baselines;
}

/**
 * Calculate rolling baseline statistics from historical baselines
 * @param days - Number of days for rolling window (e.g., 7, 30)
 * @param baselinesDir - Directory containing baseline files
 * @returns Rolling baseline with aggregated statistics
 */
export function calculateRollingBaseline(
  days: number,
  baselinesDir: string = 'performance-baselines/strategic'
): RollingBaseline | null {
  const baselines = loadRecentBaselines(days, baselinesDir);

  if (baselines.length === 0) {
    console.warn(`No baselines found for ${days}-day rolling window`);
    return null;
  }

  // Extract metric arrays for statistical calculations
  const cpuValues = baselines.map(b => b.metrics.cpu.avg24h || b.metrics.cpu.current);
  const cpuBuckets = baselines.map(b => b.metrics.cpu.bucket);
  const gclRates = baselines.map(b => b.metrics.gcl.progressRate);
  const errorRates = baselines.map(b => b.metrics.errors.currentRate);
  const roomTotals = baselines.map(b => b.metrics.rooms.total);
  const roomCPUs = baselines.map(b => b.metrics.rooms.avgCPU);
  const creepTotals = baselines.map(b => b.metrics.creeps.total);
  const creepPerRoom = baselines.map(b => b.metrics.creeps.avgPerRoom || 0);

  const rollingBaseline: RollingBaseline = {
    period: `${days}d`,
    startDate: baselines[baselines.length - 1].timestamp,
    endDate: baselines[0].timestamp,
    sampleCount: baselines.length,
    metrics: {
      cpu: {
        avg: average(cpuValues),
        min: min(cpuValues),
        max: max(cpuValues),
        stdDev: standardDeviation(cpuValues),
        p50: percentile(cpuValues, 50),
        p95: percentile(cpuValues, 95),
        p99: percentile(cpuValues, 99)
      },
      gcl: {
        avgRate: average(gclRates),
        minRate: min(gclRates),
        maxRate: max(gclRates)
      },
      errors: {
        avgRate: average(errorRates),
        minRate: min(errorRates),
        maxRate: max(errorRates)
      },
      rooms: {
        avgTotal: average(roomTotals),
        avgCPU: average(roomCPUs)
      },
      creeps: {
        avgTotal: average(creepTotals),
        avgPerRoom: average(creepPerRoom)
      }
    }
  };

  return rollingBaseline;
}

/**
 * Calculate standard deviations for all metrics
 * @param baselines - Array of performance baselines
 * @returns Performance metrics containing standard deviations
 */
export function calculateStandardDeviations(baselines: PerformanceBaseline[]): PerformanceMetrics {
  if (baselines.length <= 1) {
    // Return zeros if insufficient data
    return {
      cpu: {
        avg: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      gcl: {
        avgRate: 0,
        minRate: 0,
        maxRate: 0
      },
      errors: {
        avgRate: 0,
        minRate: 0,
        maxRate: 0
      },
      rooms: {
        avgTotal: 0,
        avgCPU: 0
      },
      creeps: {
        avgTotal: 0,
        avgPerRoom: 0
      }
    };
  }

  const cpuValues = baselines.map(b => b.metrics.cpu.avg24h || b.metrics.cpu.current);
  const gclRates = baselines.map(b => b.metrics.gcl.progressRate);
  const errorRates = baselines.map(b => b.metrics.errors.currentRate);
  const roomTotals = baselines.map(b => b.metrics.rooms.total);
  const roomCPUs = baselines.map(b => b.metrics.rooms.avgCPU);
  const creepTotals = baselines.map(b => b.metrics.creeps.total);
  const creepPerRoom = baselines.map(b => b.metrics.creeps.avgPerRoom || 0);

  return {
    cpu: {
      avg: standardDeviation(cpuValues),
      min: 0,
      max: 0,
      stdDev: standardDeviation(cpuValues),
      p50: 0,
      p95: 0,
      p99: 0
    },
    gcl: {
      avgRate: standardDeviation(gclRates),
      minRate: 0,
      maxRate: 0
    },
    errors: {
      avgRate: standardDeviation(errorRates),
      minRate: 0,
      maxRate: 0
    },
    rooms: {
      avgTotal: standardDeviation(roomTotals),
      avgCPU: standardDeviation(roomCPUs)
    },
    creeps: {
      avgTotal: standardDeviation(creepTotals),
      avgPerRoom: standardDeviation(creepPerRoom)
    }
  };
}
