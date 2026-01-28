/**
 * Baseline Helper
 * 
 * Provides utilities for loading and comparing performance baselines
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface BaselineScenario {
  avgCpu: number;
  maxCpu: number;
  p95Cpu?: number;
  p99Cpu?: number;
  avgMemory?: number;
  maxMemory?: number;
  p95Memory?: number;
}

export interface Baseline {
  commit: string;
  timestamp: string;
  branch: string;
  scenarios: {
    [key: string]: BaselineScenario;
  };
  cpu?: {
    avg: number;
    p95: number;
    max: number;
    bucket: number;
  };
  gcl?: {
    progressPerTick: number;
    level: number;
    progress: number;
  };
  energy?: {
    incomePerTick: number;
  };
}

export interface TestConfig {
  rooms: string[];
  rcl: number;
  hostiles?: boolean;
  ticks: number;
}

/**
 * Load baseline for a specific scenario
 * Falls back to develop branch if current branch baseline doesn't exist
 */
export async function loadBaseline(scenarioName: string = 'default'): Promise<{
  baseline: BaselineScenario;
  config: TestConfig;
}> {
  const baselineDir = join(__dirname, '../../../../performance-baselines');
  
  // Try to load from current branch first, then develop, then main
  const branch = process.env.GITHUB_REF_NAME || process.env.GITHUB_BASE_REF || 'develop';
  const candidates = [
    join(baselineDir, `${branch}.json`),
    join(baselineDir, 'develop.json'),
    join(baselineDir, 'main.json')
  ];
  
  let baselineData: Baseline | null = null;
  let loadedFrom = '';
  
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const data = readFileSync(candidate, 'utf-8');
      baselineData = JSON.parse(data);
      loadedFrom = candidate;
      break;
    }
  }
  
  if (!baselineData) {
    throw new Error(`No baseline found. Searched: ${candidates.join(', ')}`);
  }
  
  const scenario = baselineData.scenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Scenario '${scenarioName}' not found in baseline (${loadedFrom})`);
  }
  
  // Create default test config based on scenario name
  const config: TestConfig = {
    rooms: ['W0N1'],
    rcl: 8,
    ticks: 100
  };
  
  // Customize config based on scenario
  if (scenarioName.includes('empty')) {
    config.rcl = 1;
    config.ticks = 50;
  } else if (scenarioName.includes('remote')) {
    config.ticks = 150;
  } else if (scenarioName.includes('defense')) {
    config.hostiles = true;
    config.ticks = 100;
  } else if (scenarioName.includes('gcl')) {
    config.ticks = 1000;
  }
  
  return {
    baseline: scenario,
    config
  };
}

/**
 * Calculate regression percentage
 */
export function calculateRegression(baseline: number, current: number): number {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

/**
 * Check if regression is within acceptable threshold
 */
export function isRegressionAcceptable(regression: number, threshold: number = 15): boolean {
  return regression <= threshold;
}

/**
 * Format regression for display
 */
export function formatRegression(regression: number): string {
  const sign = regression > 0 ? '+' : '';
  return `${sign}${regression.toFixed(1)}%`;
}

/**
 * Get regression severity level
 */
export function getRegressionSeverity(regression: number): 'improvement' | 'pass' | 'warning' | 'critical' {
  // Improvement: More than 10% better
  if (regression < -10) return 'improvement';
  // Pass: Within 10% range
  if (Math.abs(regression) <= 10) return 'pass';
  // Warning: 10-20% regression
  if (regression <= 20) return 'warning';
  // Critical: More than 20% regression
  return 'critical';
}

/**
 * Compare current metrics against baseline
 */
export interface ComparisonResult {
  metric: string;
  baseline: number;
  current: number;
  regression: number;
  severity: 'improvement' | 'pass' | 'warning' | 'critical';
  passed: boolean;
}

export function compareAgainstBaseline(
  baselineScenario: BaselineScenario,
  currentMetrics: {
    avgCpu: number;
    maxCpu: number;
    p95Cpu?: number;
    avgMemory?: number;
  },
  thresholds: {
    cpu?: number;
    memory?: number;
  } = {}
): ComparisonResult[] {
  const results: ComparisonResult[] = [];
  const cpuThreshold = thresholds.cpu || 15; // Default 15% threshold
  const memoryThreshold = thresholds.memory || 15;
  
  // Compare average CPU
  const cpuRegression = calculateRegression(baselineScenario.avgCpu, currentMetrics.avgCpu);
  results.push({
    metric: 'avgCpu',
    baseline: baselineScenario.avgCpu,
    current: currentMetrics.avgCpu,
    regression: cpuRegression,
    severity: getRegressionSeverity(cpuRegression),
    passed: isRegressionAcceptable(cpuRegression, cpuThreshold)
  });
  
  // Compare max CPU
  const maxCpuRegression = calculateRegression(baselineScenario.maxCpu, currentMetrics.maxCpu);
  results.push({
    metric: 'maxCpu',
    baseline: baselineScenario.maxCpu,
    current: currentMetrics.maxCpu,
    regression: maxCpuRegression,
    severity: getRegressionSeverity(maxCpuRegression),
    passed: isRegressionAcceptable(maxCpuRegression, cpuThreshold)
  });
  
  // Compare p95 CPU if available
  if (baselineScenario.p95Cpu && currentMetrics.p95Cpu) {
    const p95Regression = calculateRegression(baselineScenario.p95Cpu, currentMetrics.p95Cpu);
    results.push({
      metric: 'p95Cpu',
      baseline: baselineScenario.p95Cpu,
      current: currentMetrics.p95Cpu,
      regression: p95Regression,
      severity: getRegressionSeverity(p95Regression),
      passed: isRegressionAcceptable(p95Regression, cpuThreshold)
    });
  }
  
  // Compare memory if available
  if (baselineScenario.avgMemory && currentMetrics.avgMemory) {
    const memoryRegression = calculateRegression(baselineScenario.avgMemory, currentMetrics.avgMemory);
    results.push({
      metric: 'avgMemory',
      baseline: baselineScenario.avgMemory,
      current: currentMetrics.avgMemory,
      regression: memoryRegression,
      severity: getRegressionSeverity(memoryRegression),
      passed: isRegressionAcceptable(memoryRegression, memoryThreshold)
    });
  }
  
  return results;
}
