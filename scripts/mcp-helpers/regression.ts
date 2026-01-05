/**
 * Performance Regression Detection
 * 
 * This module provides utilities for detecting performance regressions
 * by comparing current metrics against baselines.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PerformanceBaseline, RegressionReport, CPUMetrics } from './types.js';

const BASELINES_DIR = path.join(process.cwd(), 'performance-baselines');

/**
 * Load performance baseline for a branch
 */
export function getBaseline(branch: string = 'main'): PerformanceBaseline | null {
  const baselinePath = path.join(BASELINES_DIR, `${branch}.json`);
  
  if (!fs.existsSync(baselinePath)) {
    console.warn(`No baseline found for branch: ${branch}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(baselinePath, 'utf-8');
    return JSON.parse(content) as PerformanceBaseline;
  } catch (error) {
    console.error(`Error loading baseline for ${branch}:`, error);
    return null;
  }
}

/**
 * Detect performance regression by comparing current metrics to baseline
 * 
 * AI Agent Usage:
 * Agents should:
 * 1. Query current metrics using grafana-mcp (query_prometheus)
 * 2. Load baseline using this function
 * 3. Compare and generate regression report
 * 
 * @param current - Current CPU metrics (from Grafana)
 * @param branch - Branch name for baseline comparison
 * @returns Regression report
 */
export function detectRegression(
  current: CPUMetrics,
  branch: string = 'main'
): RegressionReport {
  const baseline = getBaseline(branch);
  
  if (!baseline) {
    return {
      severity: 'none',
      message: `No baseline available for branch: ${branch}`,
      current,
      recommendation: 'Create initial baseline for this branch'
    };
  }
  
  // Calculate CPU increase
  const cpuIncrease = (current.avg - baseline.cpu.avg) / baseline.cpu.avg;
  const p95Increase = (current.p95 - baseline.cpu.p95) / baseline.cpu.p95;
  
  // Determine severity
  let severity: RegressionReport['severity'] = 'none';
  let message = '';
  let recommendation = '';
  
  if (cpuIncrease > 0.30 || p95Increase > 0.30) {
    severity = 'critical';
    message = `Critical CPU regression detected: ${(cpuIncrease * 100).toFixed(1)}% increase in average CPU, ${(p95Increase * 100).toFixed(1)}% increase in P95`;
    recommendation = 'Immediate rollback recommended. Review recent changes and investigate CPU spike causes.';
  } else if (cpuIncrease > 0.20 || p95Increase > 0.20) {
    severity = 'high';
    message = `High CPU regression: ${(cpuIncrease * 100).toFixed(1)}% increase in average CPU, ${(p95Increase * 100).toFixed(1)}% increase in P95`;
    recommendation = 'Consider rollback. Review recent changes for performance issues.';
  } else if (cpuIncrease > 0.10 || p95Increase > 0.10) {
    severity = 'medium';
    message = `Moderate CPU increase: ${(cpuIncrease * 100).toFixed(1)}% increase in average CPU, ${(p95Increase * 100).toFixed(1)}% increase in P95`;
    recommendation = 'Monitor closely. May need optimization if trend continues.';
  } else if (cpuIncrease > 0.05 || p95Increase > 0.05) {
    severity = 'low';
    message = `Minor CPU increase: ${(cpuIncrease * 100).toFixed(1)}% increase in average CPU, ${(p95Increase * 100).toFixed(1)}% increase in P95`;
    recommendation = 'Within acceptable variance. Continue monitoring.';
  } else {
    severity = 'none';
    message = `No significant regression detected. CPU usage: ${(cpuIncrease * 100).toFixed(1)}% change`;
    recommendation = 'Performance is stable or improved.';
  }
  
  return {
    severity,
    message,
    baseline: baseline.cpu,
    current: {
      avg: current.avg,
      p95: current.p95,
      max: current.max
    },
    recommendation,
    details: {
      cpuIncrease: `${(cpuIncrease * 100).toFixed(1)}%`,
      p95Increase: `${(p95Increase * 100).toFixed(1)}%`,
      baselineBranch: branch,
      baselineTimestamp: baseline.timestamp
    }
  };
}

/**
 * Save current metrics as new baseline
 */
export function saveBaseline(
  metrics: CPUMetrics,
  branch: string = 'main',
  additionalData?: Partial<PerformanceBaseline>
): void {
  const baseline: PerformanceBaseline = {
    cpu: {
      avg: metrics.avg,
      p95: metrics.p95
    },
    gcl: additionalData?.gcl || {
      progressPerTick: 0
    },
    energy: additionalData?.energy || {
      incomePerTick: 0
    },
    timestamp: Date.now(),
    branch
  };
  
  // Ensure directory exists
  if (!fs.existsSync(BASELINES_DIR)) {
    fs.mkdirSync(BASELINES_DIR, { recursive: true });
  }
  
  // Save baseline
  const baselinePath = path.join(BASELINES_DIR, `${branch}.json`);
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2), 'utf-8');
  
  // Save to history
  const historyDir = path.join(BASELINES_DIR, 'history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  const historyPath = path.join(
    historyDir,
    `${branch}-${new Date().toISOString().split('T')[0]}.json`
  );
  fs.writeFileSync(historyPath, JSON.stringify(baseline, null, 2), 'utf-8');
  
  console.log(`Baseline saved for ${branch} at ${baselinePath}`);
}

/**
 * Get regression history for a branch
 */
export function getRegressionHistory(branch: string = 'main', days: number = 30): PerformanceBaseline[] {
  const historyDir = path.join(BASELINES_DIR, 'history');
  
  if (!fs.existsSync(historyDir)) {
    return [];
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const files = fs.readdirSync(historyDir)
    .filter(f => f.startsWith(`${branch}-`) && f.endsWith('.json'))
    .sort()
    .reverse();
  
  const history: PerformanceBaseline[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(historyDir, file), 'utf-8');
      const baseline = JSON.parse(content) as PerformanceBaseline;
      
      if (new Date(baseline.timestamp) >= cutoffDate) {
        history.push(baseline);
      }
    } catch (error) {
      console.error(`Error reading history file ${file}:`, error);
    }
  }
  
  return history;
}
