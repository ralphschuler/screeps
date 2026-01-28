/**
 * Performance Regression Detection
 * 
 * Detects performance regressions and improvements by comparing current metrics
 * against rolling baseline statistics using statistical thresholds.
 */

import {
  PerformanceSnapshot,
  RollingBaseline,
  PerformanceMetrics,
  Regression,
  Improvement
} from '../../packages/screeps-bot/test/performance/strategic-types.js';
import { percentChange, isStatisticallySignificant } from './utils.js';

/**
 * Detect performance regressions by comparing current snapshot to baseline
 * @param current - Current performance snapshot
 * @param baseline - Rolling baseline (7-day average)
 * @param stdDev - Standard deviations for each metric
 * @returns Array of detected regressions
 */
export function detectRegressions(
  current: PerformanceSnapshot,
  baseline: RollingBaseline,
  stdDev: PerformanceMetrics
): Regression[] {
  const regressions: Regression[] = [];

  // CPU Regression Detection
  // Threshold: avg + 1 stdDev, Critical if > 15% above threshold
  const cpuCurrent = current.cpu.avg24h || current.cpu.current;
  const cpuBaseline = baseline.metrics.cpu.avg;
  const cpuStdDev = stdDev.cpu.stdDev;
  const cpuThreshold = cpuBaseline + cpuStdDev;
  
  if (cpuCurrent > cpuThreshold) {
    const cpuChange = percentChange(cpuThreshold, cpuCurrent);
    const severity = cpuChange > 30 ? 'critical' : cpuChange > 15 ? 'high' : 'medium';
    
    regressions.push({
      type: 'cpu',
      severity,
      description: `CPU usage ${cpuChange.toFixed(1)}% above threshold (current: ${cpuCurrent.toFixed(2)}, threshold: ${cpuThreshold.toFixed(2)})`,
      current: cpuCurrent,
      baseline: cpuBaseline,
      percentChange: percentChange(cpuBaseline, cpuCurrent),
      threshold: cpuThreshold
    });
  }

  // GCL Stall Detection
  // Threshold: avg - 1 stdDev, Critical if > 20% below baseline
  const gclCurrent = current.gcl.progressRate;
  const gclBaseline = baseline.metrics.gcl.avgRate;
  const gclStdDev = stdDev.gcl.avgRate;
  const gclThreshold = Math.max(0, gclBaseline - gclStdDev);
  
  if (gclCurrent < gclThreshold) {
    const gclChange = percentChange(gclBaseline, gclCurrent);
    const severity = Math.abs(gclChange) > 30 ? 'critical' : Math.abs(gclChange) > 20 ? 'high' : 'medium';
    
    regressions.push({
      type: 'gcl',
      severity,
      description: `GCL progression ${Math.abs(gclChange).toFixed(1)}% below baseline (current: ${gclCurrent.toFixed(4)}, baseline: ${gclBaseline.toFixed(4)})`,
      current: gclCurrent,
      baseline: gclBaseline,
      percentChange: gclChange,
      threshold: gclThreshold
    });
  }

  // Error Rate Regression
  // Threshold: avg + 2 stdDev (more tolerant for errors)
  const errorCurrent = current.errors.currentRate;
  const errorBaseline = baseline.metrics.errors.avgRate;
  const errorStdDev = stdDev.errors.avgRate;
  const errorThreshold = errorBaseline + (2 * errorStdDev);
  
  if (errorCurrent > errorThreshold && errorCurrent > 0.1) { // Only flag if error rate > 0.1/tick
    const errorChange = percentChange(errorBaseline, errorCurrent);
    const severity = errorCurrent > 1.0 ? 'critical' : errorCurrent > 0.5 ? 'high' : 'medium';
    
    regressions.push({
      type: 'error',
      severity,
      description: `Error rate ${errorChange.toFixed(1)}% above threshold (current: ${errorCurrent.toFixed(3)}/tick, threshold: ${errorThreshold.toFixed(3)}/tick)`,
      current: errorCurrent,
      baseline: errorBaseline,
      percentChange: errorChange,
      threshold: errorThreshold
    });
  }

  // Room Count Regression (significant drop)
  const roomCurrent = current.rooms.total;
  const roomBaseline = baseline.metrics.rooms?.avgTotal || roomCurrent;
  const roomStdDev = stdDev.rooms?.avgTotal || 0;
  const roomThreshold = Math.max(0, roomBaseline - (2 * roomStdDev)); // 2 sigma for room loss
  
  if (roomCurrent < roomThreshold && roomCurrent < roomBaseline * 0.9) { // 10% drop minimum
    const roomChange = percentChange(roomBaseline, roomCurrent);
    
    regressions.push({
      type: 'room',
      severity: 'high',
      description: `Room count ${Math.abs(roomChange).toFixed(1)}% below baseline (current: ${roomCurrent}, baseline: ${roomBaseline.toFixed(1)})`,
      current: roomCurrent,
      baseline: roomBaseline,
      percentChange: roomChange,
      threshold: roomThreshold
    });
  }

  // Creep Count Regression (significant drop may indicate spawn issues)
  const creepCurrent = current.creeps.total;
  const creepBaseline = baseline.metrics.creeps?.avgTotal || creepCurrent;
  const creepStdDev = stdDev.creeps?.avgTotal || 0;
  const creepThreshold = Math.max(0, creepBaseline - (2 * creepStdDev));
  
  if (creepCurrent < creepThreshold && creepCurrent < creepBaseline * 0.8) { // 20% drop minimum
    const creepChange = percentChange(creepBaseline, creepCurrent);
    const severity = Math.abs(creepChange) > 40 ? 'high' : 'medium';
    
    regressions.push({
      type: 'creep',
      severity,
      description: `Creep population ${Math.abs(creepChange).toFixed(1)}% below baseline (current: ${creepCurrent}, baseline: ${creepBaseline.toFixed(1)})`,
      current: creepCurrent,
      baseline: creepBaseline,
      percentChange: creepChange,
      threshold: creepThreshold
    });
  }

  return regressions;
}

/**
 * Detect performance improvements by comparing current snapshot to baseline
 * @param current - Current performance snapshot
 * @param baseline - Rolling baseline (7-day average)
 * @param stdDev - Standard deviations for each metric
 * @returns Array of detected improvements
 */
export function detectImprovements(
  current: PerformanceSnapshot,
  baseline: RollingBaseline,
  stdDev: PerformanceMetrics
): Improvement[] {
  const improvements: Improvement[] = [];

  // CPU Improvement (significantly below baseline)
  const cpuCurrent = current.cpu.avg24h || current.cpu.current;
  const cpuBaseline = baseline.metrics.cpu.avg;
  const cpuStdDev = stdDev.cpu.stdDev;
  const cpuThreshold = cpuBaseline - cpuStdDev;
  
  if (cpuCurrent < cpuThreshold && cpuCurrent < cpuBaseline * 0.85) { // 15% improvement minimum
    const cpuChange = percentChange(cpuBaseline, cpuCurrent);
    
    improvements.push({
      type: 'cpu',
      description: `CPU usage reduced by ${Math.abs(cpuChange).toFixed(1)}% (current: ${cpuCurrent.toFixed(2)}, baseline: ${cpuBaseline.toFixed(2)})`,
      current: cpuCurrent,
      baseline: cpuBaseline,
      percentChange: cpuChange
    });
  }

  // GCL Improvement (significantly above baseline)
  const gclCurrent = current.gcl.progressRate;
  const gclBaseline = baseline.metrics.gcl.avgRate;
  const gclStdDev = stdDev.gcl.avgRate;
  const gclThreshold = gclBaseline + gclStdDev;
  
  if (gclCurrent > gclThreshold && gclCurrent > gclBaseline * 1.15) { // 15% improvement minimum
    const gclChange = percentChange(gclBaseline, gclCurrent);
    
    improvements.push({
      type: 'gcl',
      description: `GCL progression increased by ${gclChange.toFixed(1)}% (current: ${gclCurrent.toFixed(4)}, baseline: ${gclBaseline.toFixed(4)})`,
      current: gclCurrent,
      baseline: gclBaseline,
      percentChange: gclChange
    });
  }

  // Error Rate Improvement (significantly below baseline)
  const errorCurrent = current.errors.currentRate;
  const errorBaseline = baseline.metrics.errors.avgRate;
  const errorStdDev = stdDev.errors.avgRate;
  const errorThreshold = Math.max(0, errorBaseline - errorStdDev);
  
  if (errorCurrent < errorThreshold && errorBaseline > 0.05) { // Only flag if baseline had meaningful errors
    const errorChange = percentChange(errorBaseline, errorCurrent);
    
    improvements.push({
      type: 'error',
      description: `Error rate reduced by ${Math.abs(errorChange).toFixed(1)}% (current: ${errorCurrent.toFixed(3)}/tick, baseline: ${errorBaseline.toFixed(3)}/tick)`,
      current: errorCurrent,
      baseline: errorBaseline,
      percentChange: errorChange
    });
  }

  return improvements;
}

/**
 * Calculate overall health score (0-100) based on current metrics vs baseline
 * @param current - Current performance snapshot
 * @param baseline - Rolling baseline
 * @param regressions - Detected regressions
 * @returns Health score from 0 (critical) to 100 (excellent)
 */
export function calculateHealthScore(
  current: PerformanceSnapshot,
  baseline: RollingBaseline,
  regressions: Regression[]
): number {
  let score = 100;

  // Deduct points for regressions
  for (const regression of regressions) {
    switch (regression.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 8;
        break;
      case 'low':
        score -= 3;
        break;
    }
  }

  // Additional penalties for critical metrics
  const cpuCurrent = current.cpu.avg24h || current.cpu.current;
  if (cpuCurrent > 95) {
    score -= 15; // Near CPU limit
  } else if (cpuCurrent > 90) {
    score -= 10;
  }

  if (current.cpu.bucket < 5000) {
    score -= 20; // Low bucket is critical
  } else if (current.cpu.bucket < 7000) {
    score -= 10;
  }

  // Bonus points for good metrics
  if (current.gcl.progressRate > baseline.metrics.gcl.avgRate * 1.2) {
    score += 5; // Excellent GCL progress
  }

  if (current.errors.currentRate < 0.01) {
    score += 5; // Very low error rate
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Determine overall performance trend
 * @param current - Current performance snapshot
 * @param baseline - Rolling baseline
 * @returns Trend direction
 */
export function determineTrend(
  current: PerformanceSnapshot,
  baseline: RollingBaseline
): 'improving' | 'degrading' | 'stable' {
  let improvementScore = 0;
  let degradationScore = 0;

  // CPU trend
  const cpuCurrent = current.cpu.avg24h || current.cpu.current;
  const cpuChange = percentChange(baseline.metrics.cpu.avg, cpuCurrent);
  if (cpuChange < -10) improvementScore += 2;
  else if (cpuChange > 10) degradationScore += 2;

  // GCL trend
  const gclChange = percentChange(baseline.metrics.gcl.avgRate, current.gcl.progressRate);
  if (gclChange > 10) improvementScore += 2;
  else if (gclChange < -10) degradationScore += 2;

  // Error trend
  const errorChange = percentChange(baseline.metrics.errors.avgRate, current.errors.currentRate);
  if (errorChange < -20) improvementScore += 1;
  else if (errorChange > 20) degradationScore += 1;

  if (improvementScore > degradationScore) return 'improving';
  if (degradationScore > improvementScore) return 'degrading';
  return 'stable';
}
