#!/usr/bin/env node

/**
 * Compare Performance Baseline Script
 * 
 * Compares current performance test results against baseline
 * Used in CI to detect regressions before merge
 * 
 * Usage:
 *   node scripts/compare-performance-baseline.js \
 *     --current performance-report.json \
 *     --baseline performance-baselines/main.json \
 *     --threshold-cpu 0.15 \
 *     --threshold-gcl 0.20
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    current: null,
    baseline: null,
    thresholdCpu: 0.15,
    thresholdGcl: 0.20,
    thresholdMemory: 0.15,
    failOnRegression: true
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--current':
        options.current = args[++i];
        break;
      case '--baseline':
        options.baseline = args[++i];
        break;
      case '--threshold-cpu':
        options.thresholdCpu = parseFloat(args[++i]);
        break;
      case '--threshold-gcl':
        options.thresholdGcl = parseFloat(args[++i]);
        break;
      case '--threshold-memory':
        options.thresholdMemory = parseFloat(args[++i]);
        break;
      case '--no-fail':
        options.failOnRegression = false;
        break;
    }
  }
  
  return options;
}

/**
 * Load JSON file
 */
function loadJson(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  const data = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Calculate regression percentage
 */
function calculateRegression(baseline, current) {
  if (baseline === 0) return 0;
  return ((current - baseline) / baseline);
}

/**
 * Get severity level based on regression
 */
function getSeverity(regression, threshold) {
  if (regression < -0.10) return 'improvement';
  if (regression <= threshold) return 'pass';
  if (regression <= threshold * 1.5) return 'warning';
  return 'critical';
}

/**
 * Format percentage
 */
function formatPercentage(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

/**
 * Compare metrics
 */
function compareMetrics(baseline, current, options) {
  const results = {
    passed: true,
    regressions: [],
    improvements: [],
    stable: []
  };
  
  // Compare CPU metrics
  if (baseline.scenarios?.default && current.analysis?.cpu) {
    const cpuMetrics = [
      { name: 'avgCpu', baseline: baseline.scenarios.default.avgCpu, current: current.analysis.cpu.avg },
      { name: 'maxCpu', baseline: baseline.scenarios.default.maxCpu, current: current.analysis.cpu.max },
      { name: 'p95Cpu', baseline: baseline.scenarios.default.p95Cpu || baseline.scenarios.default.avgCpu * 1.2, current: current.analysis.cpu.p95 }
    ];
    
    for (const metric of cpuMetrics) {
      if (metric.baseline && metric.current) {
        const regression = calculateRegression(metric.baseline, metric.current);
        const severity = getSeverity(regression, options.thresholdCpu);
        
        const result = {
          metric: metric.name,
          baseline: metric.baseline,
          current: metric.current,
          regression,
          severity,
          passed: severity !== 'critical' && severity !== 'warning'
        };
        
        if (severity === 'critical' || severity === 'warning') {
          results.regressions.push(result);
          if (severity === 'critical') {
            results.passed = false;
          }
        } else if (severity === 'improvement') {
          results.improvements.push(result);
        } else {
          results.stable.push(result);
        }
      }
    }
  }
  
  // Compare memory metrics if available
  if (baseline.scenarios?.default?.avgMemory && current.analysis?.memory?.avg) {
    const regression = calculateRegression(baseline.scenarios.default.avgMemory, current.analysis.memory.avg);
    const severity = getSeverity(regression, options.thresholdMemory);
    
    const result = {
      metric: 'avgMemory',
      baseline: baseline.scenarios.default.avgMemory,
      current: current.analysis.memory.avg,
      regression,
      severity,
      passed: severity !== 'critical' && severity !== 'warning'
    };
    
    if (severity === 'critical' || severity === 'warning') {
      results.regressions.push(result);
      if (severity === 'critical') {
        results.passed = false;
      }
    } else if (severity === 'improvement') {
      results.improvements.push(result);
    } else {
      results.stable.push(result);
    }
  }
  
  // Compare GCL if available
  if (baseline.gcl?.progressPerTick && current.expandedMetrics?.gcl?.progressPerTick) {
    const regression = -calculateRegression(baseline.gcl.progressPerTick, current.expandedMetrics.gcl.progressPerTick);
    const severity = getSeverity(regression, options.thresholdGcl);
    
    const result = {
      metric: 'gclProgressPerTick',
      baseline: baseline.gcl.progressPerTick,
      current: current.expandedMetrics.gcl.progressPerTick,
      regression,
      severity,
      passed: severity !== 'critical' && severity !== 'warning'
    };
    
    if (severity === 'critical' || severity === 'warning') {
      results.regressions.push(result);
      if (severity === 'critical') {
        results.passed = false;
      }
    } else if (severity === 'improvement') {
      results.improvements.push(result);
    } else {
      results.stable.push(result);
    }
  }
  
  return results;
}

/**
 * Print comparison report
 */
function printReport(results, options) {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     PERFORMANCE BASELINE COMPARISON REPORT               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('Configuration:');
  console.log(`  CPU Threshold: ${(options.thresholdCpu * 100).toFixed(0)}%`);
  console.log(`  GCL Threshold: ${(options.thresholdGcl * 100).toFixed(0)}%`);
  console.log(`  Memory Threshold: ${(options.thresholdMemory * 100).toFixed(0)}%`);
  console.log(`  Fail on Regression: ${options.failOnRegression ? 'Yes' : 'No'}\n`);
  
  if (results.regressions.length > 0) {
    console.log('❌ REGRESSIONS DETECTED:\n');
    for (const r of results.regressions) {
      const icon = r.severity === 'critical' ? '🔴' : '🟡';
      console.log(`  ${icon} ${r.metric}: ${formatPercentage(r.regression)}`);
      console.log(`     Baseline: ${r.baseline.toFixed(4)}`);
      console.log(`     Current:  ${r.current.toFixed(4)}`);
      console.log(`     Severity: ${r.severity.toUpperCase()}\n`);
    }
  }
  
  if (results.improvements.length > 0) {
    console.log('✅ IMPROVEMENTS DETECTED:\n');
    for (const i of results.improvements) {
      console.log(`  ✨ ${i.metric}: ${formatPercentage(i.regression)}`);
      console.log(`     Baseline: ${i.baseline.toFixed(4)}`);
      console.log(`     Current:  ${i.current.toFixed(4)}\n`);
    }
  }
  
  if (results.stable.length > 0) {
    console.log('✓ STABLE METRICS:\n');
    for (const s of results.stable) {
      console.log(`  ✓ ${s.metric}: ${formatPercentage(s.regression)}`);
    }
    console.log();
  }
  
  console.log('SUMMARY:');
  console.log(`  Total Metrics: ${results.regressions.length + results.improvements.length + results.stable.length}`);
  console.log(`  Regressions: ${results.regressions.length}`);
  console.log(`  Improvements: ${results.improvements.length}`);
  console.log(`  Stable: ${results.stable.length}`);
  console.log(`  Overall: ${results.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
  
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Main execution
 */
function main() {
  try {
    const options = parseArgs();
    
    // Validate required arguments
    if (!options.current) {
      throw new Error('--current argument is required');
    }
    
    // Determine baseline file
    let baselineFile = options.baseline;
    if (!baselineFile) {
      // Auto-detect based on branch
      const baselineDir = path.join(__dirname, '../../performance-baselines');
      const branch = process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME || 'develop';
      
      const candidates = [
        path.join(baselineDir, `${branch}.json`),
        path.join(baselineDir, 'develop.json'),
        path.join(baselineDir, 'main.json')
      ];
      
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          baselineFile = candidate;
          break;
        }
      }
      
      if (!baselineFile) {
        throw new Error(`No baseline found. Searched: ${candidates.join(', ')}`);
      }
    }
    
    console.log(`Loading current results from: ${options.current}`);
    console.log(`Loading baseline from: ${baselineFile}\n`);
    
    // Load files
    const current = loadJson(options.current);
    const baseline = loadJson(baselineFile);
    
    // Compare metrics
    const results = compareMetrics(baseline, current, options);
    
    // Print report
    printReport(results, options);
    
    // Exit with appropriate code
    if (!results.passed && options.failOnRegression) {
      console.error('Performance regression detected. Exiting with error code 1.');
      process.exit(1);
    } else {
      console.log('Performance comparison complete.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error comparing performance baseline:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
