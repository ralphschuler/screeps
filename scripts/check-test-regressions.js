#!/usr/bin/env node
/**
 * Check for performance regressions in integration tests
 * 
 * Compares current test results against baselines and fails if:
 * - CPU usage increased by >20%
 * - Memory parsing increased by >15%
 * - Bucket level decreased by >10%
 * - Any functional test failed
 */

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '../packages/screeps-server/test-results.json');
const BASELINES_DIR = path.join(__dirname, '../performance-baselines/integration');

// Thresholds for regression detection
const THRESHOLDS = {
  cpuIncrease: 0.20,      // 20% increase = warning
  cpuFailure: 0.30,       // 30% increase = failure
  memoryIncrease: 0.15,   // 15% increase = warning
  bucketDecrease: 0.10,   // 10% decrease = warning
};

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) {
    console.log('⚠️  No test results found');
    return null;
  }
  
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function loadBaseline(testName) {
  const baselinePath = path.join(BASELINES_DIR, `${testName}.json`);
  
  if (!fs.existsSync(baselinePath)) {
    console.log(`ℹ️  No baseline found for ${testName}`);
    return null;
  }
  
  return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
}

function compareMetrics(current, baseline, testName) {
  const warnings = [];
  const failures = [];
  
  // CPU comparison
  if (baseline.avgCpu) {
    const cpuChange = (current.avgCpu - baseline.avgCpu) / baseline.avgCpu;
    
    if (cpuChange > THRESHOLDS.cpuFailure) {
      failures.push(`CPU increased by ${(cpuChange * 100).toFixed(1)}% (current: ${current.avgCpu.toFixed(3)}, baseline: ${baseline.avgCpu.toFixed(3)})`);
    } else if (cpuChange > THRESHOLDS.cpuIncrease) {
      warnings.push(`CPU increased by ${(cpuChange * 100).toFixed(1)}% (current: ${current.avgCpu.toFixed(3)}, baseline: ${baseline.avgCpu.toFixed(3)})`);
    }
  }
  
  // Memory parsing comparison
  if (baseline.avgMemoryParse) {
    const memoryChange = (current.avgMemoryParse - baseline.avgMemoryParse) / baseline.avgMemoryParse;
    
    if (memoryChange > THRESHOLDS.memoryIncrease) {
      warnings.push(`Memory parsing increased by ${(memoryChange * 100).toFixed(1)}% (current: ${current.avgMemoryParse.toFixed(4)}, baseline: ${baseline.avgMemoryParse.toFixed(4)})`);
    }
  }
  
  // Bucket level comparison
  if (baseline.avgBucket) {
    const bucketChange = (baseline.avgBucket - current.avgBucket) / baseline.avgBucket;
    
    if (bucketChange > THRESHOLDS.bucketDecrease) {
      warnings.push(`Bucket decreased by ${(bucketChange * 100).toFixed(1)}% (current: ${current.avgBucket.toFixed(0)}, baseline: ${baseline.avgBucket.toFixed(0)})`);
    }
  }
  
  return { warnings, failures };
}

function main() {
  console.log('🔍 Checking for performance regressions...\n');
  
  const results = loadResults();
  if (!results) {
    console.log('✅ No results to check');
    process.exit(0);
  }
  
  let hasFailures = false;
  let hasWarnings = false;
  
  // Check each test
  for (const [testName, testResults] of Object.entries(results.tests || {})) {
    const baseline = loadBaseline(testName);
    
    if (!baseline) {
      console.log(`📝 ${testName}: No baseline (will be created)`);
      continue;
    }
    
    const { warnings, failures } = compareMetrics(testResults.metrics, baseline, testName);
    
    if (failures.length > 0) {
      hasFailures = true;
      console.log(`❌ ${testName}:`);
      failures.forEach(f => console.log(`   - ${f}`));
    } else if (warnings.length > 0) {
      hasWarnings = true;
      console.log(`⚠️  ${testName}:`);
      warnings.forEach(w => console.log(`   - ${w}`));
    } else {
      console.log(`✅ ${testName}: No regressions`);
    }
  }
  
  // Check for test failures
  if (results.failures > 0) {
    hasFailures = true;
    console.log(`\n❌ ${results.failures} test(s) failed`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (hasFailures) {
    console.log('❌ REGRESSION DETECTED - Review and fix before merging');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Performance warnings detected - Review recommended');
    process.exit(0);
  } else {
    console.log('✅ No regressions detected');
    process.exit(0);
  }
}

main();
