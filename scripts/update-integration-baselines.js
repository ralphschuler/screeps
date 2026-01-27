#!/usr/bin/env node
/**
 * Update integration test performance baselines
 * 
 * Stores performance metrics from successful test runs as baselines
 * for future regression detection
 */

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '../packages/screeps-server/test-results.json');
const BASELINES_DIR = path.join(__dirname, '../performance-baselines/integration');

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) {
    console.log('⚠️  No test results found');
    return null;
  }
  
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function saveBaseline(testName, metrics) {
  const baselinePath = path.join(BASELINES_DIR, `${testName}.json`);
  
  const baseline = {
    testName,
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF_NAME || 'local',
    ...metrics
  };
  
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`✅ Updated baseline for ${testName}`);
}

function main() {
  console.log('📊 Updating integration test baselines...\n');
  
  const results = loadResults();
  if (!results) {
    console.log('✅ No results to process');
    process.exit(0);
  }
  
  // Only update baselines if all tests passed
  if (results.failures > 0) {
    console.log(`❌ ${results.failures} test(s) failed - not updating baselines`);
    process.exit(0);
  }
  
  ensureDirectory(BASELINES_DIR);
  
  // Update baseline for each test
  let updatedCount = 0;
  for (const [testName, testResults] of Object.entries(results.tests || {})) {
    if (testResults.passed && testResults.metrics) {
      saveBaseline(testName, testResults.metrics);
      updatedCount++;
    }
  }
  
  // Create summary
  const summaryPath = path.join(BASELINES_DIR, 'summary.json');
  const summary = {
    lastUpdate: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'local',
    branch: process.env.GITHUB_REF_NAME || 'local',
    testsUpdated: updatedCount,
    totalTests: Object.keys(results.tests || {}).length
  };
  
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\n✅ Updated ${updatedCount} baseline(s)`);
}

main();
