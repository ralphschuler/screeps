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
  
  // Update baseline with new values
  baseline.commit = report.commit;
  baseline.timestamp = report.timestamp;
  baseline.branch = branch;
  
  // Update default scenario
  if (report.analysis && report.analysis.cpu) {
    baseline.scenarios.default = {
      avgCpu: report.analysis.cpu.avg,
      maxCpu: report.analysis.cpu.max,
      p95Cpu: report.analysis.cpu.p95,
      p99Cpu: report.analysis.cpu.p99
    };
  }
  
  // Write updated baseline
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));
  console.log(`✅ Updated baseline for branch: ${branch}`);
  console.log(`   File: ${baselineFile}`);
  console.log(`   Commit: ${baseline.commit}`);
  console.log(`   Avg CPU: ${baseline.scenarios.default.avgCpu.toFixed(3)}`);
  console.log(`   Max CPU: ${baseline.scenarios.default.maxCpu.toFixed(3)}`);
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
