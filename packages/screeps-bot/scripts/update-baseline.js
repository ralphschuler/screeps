#!/usr/bin/env node

/**
 * Update Performance Baseline Script
 * 
 * Updates the performance baseline file for a branch after a successful test run.
 * This should be run after performance tests pass on main/develop branches.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_FILE = path.join(__dirname, '..', 'performance-report.json');
const BASELINE_DIR = path.join(__dirname, '..', '..', '..', 'performance-baselines');

/**
 * Load performance report
 */
function loadReport() {
  if (!fs.existsSync(REPORT_FILE)) {
    throw new Error(`Performance report not found: ${REPORT_FILE}`);
  }
  
  const data = fs.readFileSync(REPORT_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Update baseline file
 */
function updateBaseline(branch, report) {
  const baselineFile = path.join(BASELINE_DIR, `${branch}.json`);
  
  // Load existing baseline or create new one
  let baseline = {
    commit: report.commit,
    timestamp: report.timestamp,
    branch: branch,
    scenarios: {}
  };
  
  if (fs.existsSync(baselineFile)) {
    const data = fs.readFileSync(baselineFile, 'utf-8');
    baseline = JSON.parse(data);
  }
  
  // Update baseline metadata
  baseline.commit = report.commit;
  baseline.timestamp = report.timestamp;
  baseline.branch = branch;
  
  // Preserve existing scenarios object if it exists
  if (!baseline.scenarios) {
    baseline.scenarios = {};
  }
  
  // Update default scenario - check for proper nested structure
  if (report.analysis && report.analysis.cpu && 
      typeof report.analysis.cpu.avg === 'number' &&
      typeof report.analysis.cpu.max === 'number') {
    baseline.scenarios.default = {
      avgCpu: report.analysis.cpu.avg,
      maxCpu: report.analysis.cpu.max,
      p95Cpu: report.analysis.cpu.p95 || 0,
      p99Cpu: report.analysis.cpu.p99 || 0
    };
    
    // Add memory metrics if available
    if (report.analysis.memory && 
        report.analysis.memory.sampleCount > 0 &&
        typeof report.analysis.memory.avg === 'number') {
      baseline.scenarios.default.avgMemory = report.analysis.memory.avg;
      baseline.scenarios.default.maxMemory = report.analysis.memory.max || 0;
      baseline.scenarios.default.p95Memory = report.analysis.memory.p95 || 0;
    }
  } else {
    console.warn('Warning: Report missing CPU analysis data, baseline not updated');
    return;
  }
  
  // Write updated baseline
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));
  console.log(`✅ Updated baseline for branch: ${branch}`);
  console.log(`   File: ${baselineFile}`);
  console.log(`   Commit: ${baseline.commit}`);
  console.log(`   Avg CPU: ${baseline.scenarios.default.avgCpu.toFixed(3)}`);
  console.log(`   Max CPU: ${baseline.scenarios.default.maxCpu.toFixed(3)}`);
  
  if (baseline.scenarios.default.avgMemory) {
    const formatMemory = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    console.log(`   Avg Memory: ${formatMemory(baseline.scenarios.default.avgMemory)}`);
  }
  
  // Archive historical snapshot
  archiveHistoricalSnapshot(branch, baseline);
}

/**
 * Archive a historical snapshot of the baseline
 */
function archiveHistoricalSnapshot(branch, baseline) {
  const historyDir = path.join(BASELINE_DIR, 'history');
  
  // Ensure history directory exists
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  // Create filename with date and commit
  const date = new Date(baseline.timestamp).toISOString().split('T')[0];
  const commitShort = baseline.commit.substring(0, 7);
  const filename = `${date}_${branch}_${commitShort}.json`;
  const filepath = path.join(historyDir, filename);
  
  // Write historical snapshot
  fs.writeFileSync(filepath, JSON.stringify(baseline, null, 2));
  console.log(`📊 Archived historical snapshot: ${filename}`);
}

/**
 * Main function
 */
async function main() {
  console.log('=== Update Performance Baseline ===\n');
  
  // Get branch name from environment or arguments
  const branch = process.argv[2] || process.env.GITHUB_REF_NAME || 'main';
  
  console.log(`Branch: ${branch}`);
  
  // Only update baselines for main and develop branches
  if (branch !== 'main' && branch !== 'develop') {
    console.log(`Skipping baseline update for branch: ${branch}`);
    console.log('Baselines are only updated for main and develop branches');
    process.exit(0);
  }
  
  // Load performance report
  console.log('\nLoading performance report...');
  const report = loadReport();
  
  // Check if test passed
  if (!report.passed) {
    console.log('Performance test failed, not updating baseline');
    process.exit(1);
  }
  
  // Check if regression was detected
  if (report.regression && report.regression.detected) {
    console.log('Performance regression detected, not updating baseline');
    process.exit(1);
  }
  
  // Ensure baseline directory exists
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }
  
  // Update baseline
  console.log('\nUpdating baseline...');
  updateBaseline(branch, report);
  
  console.log('\n✅ Baseline update complete');
}

// Run the script
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
