#!/usr/bin/env node

/**
 * Compare current performance test results against baseline
 * 
 * Detects performance regressions by comparing metrics against stored baselines
 * Classifies regressions as critical, warning, or pass
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASELINES_DIR = join(__dirname, '../../../performance-baselines');
const RESULTS_PATH = join(__dirname, '..', 'test-results.json');

/**
 * Load baseline for current branch
 */
function loadBaseline(branch = 'develop') {
  const baselinePath = join(BASELINES_DIR, `${branch}.json`);
  
  if (!existsSync(baselinePath)) {
    console.warn(`⚠️ No baseline found for branch '${branch}', using develop baseline`);
    const developPath = join(BASELINES_DIR, 'develop.json');
    if (!existsSync(developPath)) {
      throw new Error('No baseline available for comparison');
    }
    return JSON.parse(readFileSync(developPath, 'utf-8'));
  }
  
  return JSON.parse(readFileSync(baselinePath, 'utf-8'));
}

/**
 * Load current test results
 */
function loadResults() {
  if (!existsSync(RESULTS_PATH)) {
    throw new Error('No test results found. Run tests first.');
  }
  
  return JSON.parse(readFileSync(RESULTS_PATH, 'utf-8'));
}

/**
 * Calculate percentage change
 */
function percentChange(current, baseline) {
  if (baseline === 0) return current === 0 ? 0 : 100;
  return ((current - baseline) / baseline) * 100;
}

/**
 * Classify regression severity
 */
function classifyRegression(metric, current, baseline, threshold = 10) {
  const change = percentChange(current, baseline);
  
  // For metrics where lower is better (CPU, memory parse time)
  const isLowerBetter = ['cpu', 'avgCpu', 'maxCpu', 'memoryParsing'].some(m => metric.includes(m));
  
  if (isLowerBetter) {
    if (change > threshold * 2) return { severity: 'critical', change };
    if (change > threshold) return { severity: 'warning', change };
    if (change < -threshold) return { severity: 'improvement', change };
  } else {
    // For metrics where higher is better (bucket level)
    if (change < -threshold * 2) return { severity: 'critical', change };
    if (change < -threshold) return { severity: 'warning', change };
    if (change > threshold) return { severity: 'improvement', change };
  }
  
  return { severity: 'pass', change };
}

/**
 * Compare performance metrics
 */
function comparePerformance(results, baseline) {
  const comparison = {
    timestamp: new Date().toISOString(),
    branch: process.env.GITHUB_REF_NAME || 'unknown',
    commit: process.env.GITHUB_SHA || 'unknown',
    passed: true,
    regressions: [],
    warnings: [],
    improvements: [],
    summary: {
      critical: 0,
      warning: 0,
      improvement: 0,
      pass: 0
    }
  };

  // Compare CPU metrics
  if (results.performance && baseline.scenarios && baseline.scenarios.default) {
    const current = results.performance.cpuMetrics;
    const baselineMetrics = baseline.scenarios.default;
    
    // Average CPU
    const avgCpuResult = classifyRegression(
      'avgCpu',
      current.avgCpu,
      baselineMetrics.avgCpu
    );
    
    if (avgCpuResult.severity === 'critical') {
      comparison.regressions.push({
        metric: 'Average CPU',
        baseline: baselineMetrics.avgCpu.toFixed(3),
        current: current.avgCpu.toFixed(3),
        change: avgCpuResult.change.toFixed(1) + '%',
        severity: 'critical'
      });
      comparison.passed = false;
      comparison.summary.critical++;
    } else if (avgCpuResult.severity === 'warning') {
      comparison.warnings.push({
        metric: 'Average CPU',
        baseline: baselineMetrics.avgCpu.toFixed(3),
        current: current.avgCpu.toFixed(3),
        change: avgCpuResult.change.toFixed(1) + '%',
        severity: 'warning'
      });
      comparison.summary.warning++;
    } else if (avgCpuResult.severity === 'improvement') {
      comparison.improvements.push({
        metric: 'Average CPU',
        baseline: baselineMetrics.avgCpu.toFixed(3),
        current: current.avgCpu.toFixed(3),
        change: avgCpuResult.change.toFixed(1) + '%'
      });
      comparison.summary.improvement++;
    } else {
      comparison.summary.pass++;
    }
    
    // Max CPU
    const maxCpuResult = classifyRegression(
      'maxCpu',
      current.maxCpu,
      baselineMetrics.maxCpu
    );
    
    if (maxCpuResult.severity === 'critical') {
      comparison.regressions.push({
        metric: 'Max CPU',
        baseline: baselineMetrics.maxCpu.toFixed(3),
        current: current.maxCpu.toFixed(3),
        change: maxCpuResult.change.toFixed(1) + '%',
        severity: 'critical'
      });
      comparison.passed = false;
      comparison.summary.critical++;
    } else if (maxCpuResult.severity === 'warning') {
      comparison.warnings.push({
        metric: 'Max CPU',
        baseline: baselineMetrics.maxCpu.toFixed(3),
        current: current.maxCpu.toFixed(3),
        change: maxCpuResult.change.toFixed(1) + '%',
        severity: 'warning'
      });
      comparison.summary.warning++;
    } else if (maxCpuResult.severity === 'improvement') {
      comparison.improvements.push({
        metric: 'Max CPU',
        baseline: baselineMetrics.maxCpu.toFixed(3),
        current: current.maxCpu.toFixed(3),
        change: maxCpuResult.change.toFixed(1) + '%'
      });
      comparison.summary.improvement++;
    } else {
      comparison.summary.pass++;
    }
    
    // Bucket level
    const bucketResult = classifyRegression(
      'avgBucket',
      current.avgBucket,
      baselineMetrics.p95Cpu // Using p95Cpu as proxy since bucket not in old baseline
    );
    
    if (bucketResult.severity === 'improvement') {
      comparison.improvements.push({
        metric: 'Bucket Level',
        baseline: 'N/A',
        current: current.avgBucket.toFixed(0),
        change: 'N/A'
      });
      comparison.summary.improvement++;
    } else {
      comparison.summary.pass++;
    }
  }
  
  return comparison;
}

/**
 * Generate comparison report
 */
function generateReport(comparison) {
  const emoji = comparison.passed ? '✅' : '❌';
  const status = comparison.passed ? 'PASSED' : 'FAILED';
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Performance Baseline Comparison ${emoji}`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log(`Branch: ${comparison.branch}`);
  console.log(`Commit: ${comparison.commit.substring(0, 8)}`);
  console.log(`Status: ${status}\n`);
  
  console.log(`Summary:`);
  console.log(`  Critical Regressions: ${comparison.summary.critical}`);
  console.log(`  Warnings: ${comparison.summary.warning}`);
  console.log(`  Improvements: ${comparison.summary.improvement}`);
  console.log(`  Passed: ${comparison.summary.pass}\n`);
  
  if (comparison.regressions.length > 0) {
    console.log(`❌ Critical Regressions (>20% increase):\n`);
    comparison.regressions.forEach(r => {
      console.log(`  - ${r.metric}: ${r.baseline} → ${r.current} (${r.change})`);
    });
    console.log();
  }
  
  if (comparison.warnings.length > 0) {
    console.log(`⚠️  Warnings (10-20% increase):\n`);
    comparison.warnings.forEach(w => {
      console.log(`  - ${w.metric}: ${w.baseline} → ${w.current} (${w.change})`);
    });
    console.log();
  }
  
  if (comparison.improvements.length > 0) {
    console.log(`✅ Improvements (>10% decrease):\n`);
    comparison.improvements.forEach(i => {
      console.log(`  - ${i.metric}: ${i.baseline} → ${i.current} (${i.change})`);
    });
    console.log();
  }
  
  console.log(`${'='.repeat(70)}\n`);
}

try {
  const branch = process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME || 'develop';
  const baseline = loadBaseline(branch);
  const results = loadResults();
  
  const comparison = comparePerformance(results, baseline);
  generateReport(comparison);
  
  // Exit with error if regressions detected
  if (!comparison.passed) {
    console.error('❌ Performance regression detected. Please investigate.');
    process.exit(1);
  }
  
  console.log('✅ Performance within acceptable range.');
  process.exit(0);
} catch (error) {
  console.error('Error comparing baseline:', error.message);
  process.exit(1);
}
