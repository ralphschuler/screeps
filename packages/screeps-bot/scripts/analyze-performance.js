#!/usr/bin/env node

/**
 * Performance Analysis Script
 * 
 * Analyzes performance test results from screeps-performance-server:
 * 1. Parses console logs and milestone results
 * 2. Calculates CPU metrics (avg, max, p95, p99)
 * 3. Compares against baselines
 * 4. Detects performance regressions
 * 5. Generates comprehensive performance report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REGRESSION_THRESHOLD = 0.10; // 10% increase is considered a regression
const MEMORY_REGRESSION_THRESHOLD = 0.10; // 10% increase in memory is considered a regression
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const CONSOLE_LOG_FILE = path.join(LOGS_DIR, 'console.log');
const RESULTS_FILE = path.join(__dirname, '..', 'performance-results.json');
const BASELINE_DIR = path.join(__dirname, '..', '..', '..', 'performance-baselines');
const REPORT_FILE = path.join(__dirname, '..', 'performance-report.json');

/**
 * Parse CPU usage and memory metrics from console logs
 * Supports two formats:
 * 1. JSON stats output: {"type":"stats","tick":123,"data":{"cpu":{"used":0.5},"memory":{"used":150000}}}
 * 2. Plain text: CPU: 0.5 Bucket: 9500 Memory: 150KB
 */
function parseCpuMetrics(consoleLog) {
  const cpuHistory = [];
  const bucketHistory = [];
  const memoryHistory = [];
  
  // Split into lines
  const lines = consoleLog.split('\n');
  
  for (const line of lines) {
    // Try parsing JSON stats format first
    if (line.includes('"type":"stats"') || line.includes('"type": "stats"')) {
      try {
        const stats = JSON.parse(line);
        if (stats.data && stats.data.cpu) {
          if (typeof stats.data.cpu.used === 'number') {
            cpuHistory.push(stats.data.cpu.used);
          }
          if (typeof stats.data.cpu.bucket === 'number') {
            bucketHistory.push(stats.data.cpu.bucket);
          }
        }
        // Parse memory usage
        if (stats.data && stats.data.memory) {
          if (typeof stats.data.memory.used === 'number') {
            memoryHistory.push(stats.data.memory.used);
          }
        }
        continue; // Skip plain text parsing if JSON was successful
      } catch {
        // Not valid JSON, continue to plain text parsing
      }
    }
    
    // Try plain text format
    const cpuMatch = line.match(/CPU:\s*([\d.]+)/i);
    if (cpuMatch) {
      const cpu = parseFloat(cpuMatch[1]);
      if (!isNaN(cpu)) {
        cpuHistory.push(cpu);
      }
    }
    
    const bucketMatch = line.match(/Bucket:\s*(\d+)/i);
    if (bucketMatch) {
      const bucket = parseInt(bucketMatch[1], 10);
      if (!isNaN(bucket)) {
        bucketHistory.push(bucket);
      }
    }
    
    // Parse memory in KB or bytes
    const memoryMatch = line.match(/Memory:\s*([\d.]+)\s*(KB|MB|bytes)?/i);
    if (memoryMatch) {
      let memory = parseFloat(memoryMatch[1]);
      const unit = memoryMatch[2] ? memoryMatch[2].toLowerCase() : 'kb';
      
      // Convert to bytes for consistent storage
      if (unit === 'kb') {
        memory = memory * 1024;
      } else if (unit === 'mb') {
        memory = memory * 1024 * 1024;
      }
      
      if (!isNaN(memory)) {
        memoryHistory.push(memory);
      }
    }
  }
  
  return { cpuHistory, bucketHistory, memoryHistory };
}

/**
 * Calculate statistics from array of numbers
 */
function calculateStats(values) {
  if (!values || values.length === 0) {
    return {
      avg: 0,
      max: 0,
      min: 0,
      median: 0,
      p95: 0,
      p99: 0
    };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const len = sorted.length;
  
  // Calculate median (average of two middle values for even-length arrays)
  let median;
  if (len % 2 === 0) {
    median = (sorted[len / 2 - 1] + sorted[len / 2]) / 2;
  } else {
    median = sorted[Math.floor(len / 2)];
  }
  
  // Calculate percentiles using linear interpolation
  const percentile = (p) => {
    const index = (p / 100) * (len - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) {
      return sorted[lower];
    }
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };
  
  return {
    avg: sum / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
    median: median,
    p95: percentile(95),
    p99: percentile(99)
  };
}

/**
 * Load baseline data for comparison
 */
function loadBaseline(branch = 'main') {
  const baselineFile = path.join(BASELINE_DIR, `${branch}.json`);
  
  if (!fs.existsSync(baselineFile)) {
    console.log(`No baseline found for branch: ${branch}`);
    return null;
  }
  
  try {
    const data = fs.readFileSync(baselineFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading baseline: ${error.message}`);
    return null;
  }
}

/**
 * Detect performance regression
 */
function detectRegression(current, baseline, threshold = REGRESSION_THRESHOLD) {
  if (!baseline) {
    return {
      detected: false,
      reason: 'No baseline available for comparison'
    };
  }
  
  // Use safe denominators to avoid division by zero
  const avgCpuDenom = baseline.avgCpu || Number.EPSILON;
  const maxCpuDenom = baseline.maxCpu || Number.EPSILON;
  const avgMemoryDenom = baseline.avgMemory || Number.EPSILON;
  const maxMemoryDenom = baseline.maxMemory || Number.EPSILON;
  
  const avgCpuChange = (current.avgCpu - baseline.avgCpu) / avgCpuDenom;
  const maxCpuChange = (current.maxCpu - baseline.maxCpu) / maxCpuDenom;
  
  // Only calculate memory changes if both current and baseline have memory data
  const avgMemoryChange = (current.avgMemory !== undefined && baseline.avgMemory !== undefined)
    ? (current.avgMemory - baseline.avgMemory) / avgMemoryDenom
    : 0;
  const maxMemoryChange = (current.maxMemory !== undefined && baseline.maxMemory !== undefined)
    ? (current.maxMemory - baseline.maxMemory) / maxMemoryDenom
    : 0;
  
  const avgRegression = avgCpuChange > threshold;
  const maxRegression = maxCpuChange > threshold;
  const memoryRegression = avgMemoryChange > MEMORY_REGRESSION_THRESHOLD || maxMemoryChange > MEMORY_REGRESSION_THRESHOLD;
  
  return {
    detected: avgRegression || maxRegression || memoryRegression,
    avgCpuChange: avgCpuChange * 100,
    maxCpuChange: maxCpuChange * 100,
    avgMemoryChange: avgMemoryChange * 100,
    maxMemoryChange: maxMemoryChange * 100,
    avgRegression,
    maxRegression,
    memoryRegression,
    threshold: threshold * 100,
    memoryThreshold: MEMORY_REGRESSION_THRESHOLD * 100,
    current,
    baseline
  };
}

/**
 * Generate performance report
 */
function generateReport(analysis, regression, milestones) {
  const formatMemory = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };
  
  const summary = {
    avgCpu: analysis.cpu.avg.toFixed(3),
    maxCpu: analysis.cpu.max.toFixed(3),
    p95Cpu: analysis.cpu.p95.toFixed(3),
    p99Cpu: analysis.cpu.p99.toFixed(3),
    avgBucket: analysis.bucket.avg.toFixed(0),
    minBucket: analysis.bucket.min.toFixed(0),
    sampleCount: analysis.cpu.sampleCount
  };
  
  // Add memory metrics if available
  if (analysis.memory && analysis.memory.sampleCount > 0) {
    summary.avgMemory = formatMemory(analysis.memory.avg);
    summary.maxMemory = formatMemory(analysis.memory.max);
    summary.avgMemoryBytes = analysis.memory.avg;
    summary.maxMemoryBytes = analysis.memory.max;
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'unknown',
    branch: process.env.GITHUB_REF_NAME || 'unknown',
    pr: process.env.GITHUB_EVENT_NAME === 'pull_request' ? process.env.GITHUB_EVENT_NUMBER : null,
    analysis,
    regression,
    milestones: milestones || {},
    passed: !regression.detected,
    summary
  };
  
  return report;
}

/**
 * Format report as markdown table for PR comment
 */
function formatMarkdownReport(report) {
  const { analysis, regression } = report;
  
  let markdown = '## 📊 Performance Test Results\n\n';
  
  // Summary table
  markdown += '### Summary\n\n';
  markdown += '| Metric | Value | Status |\n';
  markdown += '|--------|-------|--------|\n';
  markdown += `| Avg CPU | ${report.summary.avgCpu} | ${regression.avgRegression === true ? '❌' : '✅'} |\n`;
  markdown += `| Max CPU | ${report.summary.maxCpu} | ${regression.maxRegression === true ? '❌' : '✅'} |\n`;
  markdown += `| P95 CPU | ${report.summary.p95Cpu} | ℹ️ |\n`;
  markdown += `| P99 CPU | ${report.summary.p99Cpu} | ℹ️ |\n`;
  
  // Add memory metrics if available
  if (report.summary.avgMemory) {
    markdown += `| Avg Memory | ${report.summary.avgMemory} | ${regression.memoryRegression === true ? '❌' : '✅'} |\n`;
    markdown += `| Max Memory | ${report.summary.maxMemory} | ℹ️ |\n`;
  }
  
  markdown += `| Avg Bucket | ${report.summary.avgBucket} | ${analysis.bucket.avg > 9000 ? '✅' : '⚠️'} |\n`;
  markdown += `| Min Bucket | ${report.summary.minBucket} | ${analysis.bucket.min > 5000 ? '✅' : '⚠️'} |\n`;
  markdown += `| Samples | ${report.summary.sampleCount} | ℹ️ |\n\n`;
  
  // Regression details
  if (regression.detected) {
    markdown += '### ⚠️ Performance Regression Detected\n\n';
    markdown += '| Metric | Current | Baseline | Change |\n';
    markdown += '|--------|---------|----------|--------|\n';
    
    if (regression.avgRegression === true && regression.current && regression.baseline) {
      markdown += `| Avg CPU | ${regression.current.avgCpu.toFixed(3)} | ${regression.baseline.avgCpu.toFixed(3)} | +${regression.avgCpuChange.toFixed(1)}% |\n`;
    }
    
    if (regression.maxRegression === true && regression.current && regression.baseline) {
      markdown += `| Max CPU | ${regression.current.maxCpu.toFixed(3)} | ${regression.baseline.maxCpu.toFixed(3)} | +${regression.maxCpuChange.toFixed(1)}% |\n`;
    }
    
    if (regression.memoryRegression === true && regression.current && regression.baseline) {
      if (regression.current.avgMemory !== undefined && regression.baseline.avgMemory !== undefined) {
        const formatMemory = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
        markdown += `| Avg Memory | ${formatMemory(regression.current.avgMemory)} | ${formatMemory(regression.baseline.avgMemory)} | +${regression.avgMemoryChange.toFixed(1)}% |\n`;
      }
    }
    
    markdown += `\n⚠️ CPU Regression threshold: ${regression.threshold}%\n`;
    markdown += `⚠️ Memory Regression threshold: ${regression.memoryThreshold}%\n\n`;
  } else if (regression.baseline) {
    markdown += '### ✅ No Performance Regression\n\n';
    markdown += 'Performance is within acceptable limits compared to baseline.\n\n';
  } else {
    markdown += '### ℹ️ No Baseline Available\n\n';
    markdown += 'This is the first performance test run. Future runs will be compared against this baseline.\n\n';
  }
  
  // Milestones
  if (report.milestones && Object.keys(report.milestones).length > 0) {
    markdown += '### 🎯 Milestones\n\n';
    markdown += '| Milestone | Status |\n';
    markdown += '|-----------|--------|\n';
    
    for (const [name, achieved] of Object.entries(report.milestones)) {
      markdown += `| ${name} | ${achieved ? '✅' : '❌'} |\n`;
    }
    
    markdown += '\n';
  }
  
  // Footer
  markdown += `\n---\n`;
  markdown += `*Performance test completed at ${new Date(report.timestamp).toLocaleString()}*\n`;
  markdown += `*Commit: ${report.commit.substring(0, 7)}*\n`;
  
  return markdown;
}

/**
 * Load milestone results if available
 */
function loadMilestones() {
  if (!fs.existsSync(RESULTS_FILE)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(data);
    
    if (results.milestones) {
      const milestones = {};
      for (const milestone of results.milestones) {
        milestones[milestone.name] = milestone.achieved || false;
      }
      return milestones;
    }
  } catch (error) {
    console.error(`Error loading milestones: ${error.message}`);
  }
  
  return null;
}

/**
 * Main analysis function
 */
async function main() {
  console.log('=== Performance Analysis ===\n');
  
  // Check if logs exist
  if (!fs.existsSync(CONSOLE_LOG_FILE)) {
    console.error(`Console log not found: ${CONSOLE_LOG_FILE}`);
    console.log('Performance test may not have completed successfully.');
    
    // Create a minimal report indicating failure
    const failureReport = {
      timestamp: new Date().toISOString(),
      commit: process.env.GITHUB_SHA || 'unknown',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      passed: false,
      error: 'Console logs not found - test may have failed',
      summary: {
        avgCpu: 0,
        maxCpu: 0,
        p95Cpu: 0,
        sampleCount: 0
      }
    };
    
    fs.writeFileSync(REPORT_FILE, JSON.stringify(failureReport, null, 2));
    console.log(`\nFailure report written to: ${REPORT_FILE}`);
    process.exit(1);
  }
  
  // Read console log
  console.log('Reading console logs...');
  const consoleLog = fs.readFileSync(CONSOLE_LOG_FILE, 'utf-8');
  
  // Parse CPU and memory metrics
  console.log('Parsing CPU and memory metrics...');
  const { cpuHistory, bucketHistory, memoryHistory } = parseCpuMetrics(consoleLog);
  
  console.log(`Found ${cpuHistory.length} CPU samples`);
  console.log(`Found ${bucketHistory.length} bucket samples`);
  console.log(`Found ${memoryHistory.length} memory samples`);
  
  if (cpuHistory.length === 0) {
    console.warn('Warning: No CPU metrics found in logs');
    console.log('The bot may not be logging CPU usage. Consider adding CPU logging.');
  }
  
  // Calculate statistics
  console.log('\nCalculating statistics...');
  const cpuStats = calculateStats(cpuHistory);
  const bucketStats = calculateStats(bucketHistory);
  const memoryStats = calculateStats(memoryHistory);
  
  const analysis = {
    cpu: {
      ...cpuStats,
      sampleCount: cpuHistory.length
    },
    bucket: {
      ...bucketStats,
      sampleCount: bucketHistory.length
    },
    memory: {
      ...memoryStats,
      sampleCount: memoryHistory.length
    }
  };
  
  console.log('\nCPU Statistics:');
  console.log(`  Average: ${cpuStats.avg.toFixed(3)}`);
  console.log(`  Maximum: ${cpuStats.max.toFixed(3)}`);
  console.log(`  P95:     ${cpuStats.p95.toFixed(3)}`);
  console.log(`  P99:     ${cpuStats.p99.toFixed(3)}`);
  
  if (bucketHistory.length > 0) {
    console.log('\nBucket Statistics:');
    console.log(`  Average: ${bucketStats.avg.toFixed(0)}`);
    console.log(`  Minimum: ${bucketStats.min.toFixed(0)}`);
    console.log(`  Maximum: ${bucketStats.max.toFixed(0)}`);
  }
  
  if (memoryHistory.length > 0) {
    console.log('\nMemory Statistics:');
    const formatMemory = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    console.log(`  Average: ${formatMemory(memoryStats.avg)}`);
    console.log(`  Maximum: ${formatMemory(memoryStats.max)}`);
    console.log(`  P95:     ${formatMemory(memoryStats.p95)}`);
  }
  
  // Load baseline and detect regression
  console.log('\nLoading baseline...');
  const branch = process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME || 'main';
  const baseline = loadBaseline(branch);
  
  let regression;
  if (baseline && baseline.scenarios && baseline.scenarios['default']) {
    console.log(`Comparing against baseline for branch: ${branch}`);
    
    const currentMetrics = {
      avgCpu: cpuStats.avg,
      maxCpu: cpuStats.max,
      p95Cpu: cpuStats.p95
    };
    
    // Add memory metrics if available
    if (memoryHistory.length > 0) {
      currentMetrics.avgMemory = memoryStats.avg;
      currentMetrics.maxMemory = memoryStats.max;
    }
    
    regression = detectRegression(
      currentMetrics,
      baseline.scenarios['default'],
      REGRESSION_THRESHOLD
    );
    
    if (regression.detected) {
      console.log('\n⚠️  PERFORMANCE REGRESSION DETECTED');
      if (regression.avgRegression) {
        console.log(`   Avg CPU increased by ${regression.avgCpuChange.toFixed(1)}%`);
      }
      if (regression.maxRegression) {
        console.log(`   Max CPU increased by ${regression.maxCpuChange.toFixed(1)}%`);
      }
      if (regression.memoryRegression) {
        console.log(`   Memory increased by ${regression.avgMemoryChange.toFixed(1)}%`);
      }
    } else {
      console.log('\n✅ No performance regression detected');
    }
  } else {
    console.log('No baseline available - this will be the new baseline');
    regression = {
      detected: false,
      reason: 'No baseline available'
    };
  }
  
  // Load milestones
  const milestones = loadMilestones();
  
  // Generate report
  console.log('\nGenerating report...');
  const report = generateReport(analysis, regression, milestones);
  
  // Write report to file
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\nReport written to: ${REPORT_FILE}`);
  
  // Write markdown report for PR comment
  const markdown = formatMarkdownReport(report);
  const markdownFile = path.join(__dirname, '..', 'performance-report.md');
  fs.writeFileSync(markdownFile, markdown);
  console.log(`Markdown report written to: ${markdownFile}`);
  
  // Exit with error code if regression detected
  if (regression.detected) {
    console.log('\n❌ Exiting with error due to performance regression');
    process.exit(1);
  }
  
  console.log('\n✅ Performance analysis complete');
  process.exit(0);
}

// Run the analysis
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
