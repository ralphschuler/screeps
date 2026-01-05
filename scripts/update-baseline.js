#!/usr/bin/env node

/**
 * Update Performance Baseline Script
 * 
 * Updates the performance baseline for a branch with current metrics.
 * 
 * Prerequisites:
 *   cd scripts/mcp-helpers && npx tsc
 * 
 * Usage:
 *   node scripts/update-baseline.js [branch] [cpu-avg] [cpu-p95] [gcl-progress]
 * 
 * Example:
 *   node scripts/update-baseline.js main 48.5 72.3 0.012
 * 
 * If metrics are not provided, they will be loaded from the latest
 * performance test results.
 */

const fs = require('fs');
const path = require('path');

// Check if compiled files exist
const distPath = path.join(__dirname, 'mcp-helpers', 'dist', 'regression.js');
if (!fs.existsSync(distPath)) {
  console.error('❌ MCP helpers not compiled. Please run:');
  console.error('   cd scripts/mcp-helpers && npx tsc');
  process.exit(1);
}

const { saveBaseline } = require('./mcp-helpers/dist/regression');

const args = process.argv.slice(2);
const branch = args[0] || process.env.GITHUB_REF_NAME || 'develop';
const cpuAvg = parseFloat(args[1]) || null;
const cpuP95 = parseFloat(args[2]) || null;
const gclProgress = parseFloat(args[3]) || null;

async function main() {
  console.log('=== Update Performance Baseline ===\n');
  console.log(`Branch: ${branch}`);
  
  let metrics;
  
  // If metrics provided via command line, use them
  if (cpuAvg !== null && cpuP95 !== null) {
    console.log('\nUsing provided metrics:');
    console.log(`  CPU Average: ${cpuAvg.toFixed(2)}`);
    console.log(`  CPU P95: ${cpuP95.toFixed(2)}`);
    
    metrics = {
      avg: cpuAvg,
      p95: cpuP95,
      max: cpuP95 * 1.1,
      min: cpuAvg * 0.5,
      p99: cpuP95 * 1.05,
      timestamp: Date.now()
    };
  } else {
    // Try to load from performance test results
    const resultsPath = path.join(process.cwd(), 'packages/screeps-bot/performance-results.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.error('\n❌ No performance results found and no metrics provided');
      console.log('\nProvide metrics manually:');
      console.log('  node scripts/update-baseline.js <branch> <cpu-avg> <cpu-p95> [gcl-progress]');
      process.exit(1);
    }
    
    console.log('\nLoading metrics from performance-results.json...');
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    
    // Extract metrics from results
    // TODO: Adjust based on actual performance-results.json structure
    metrics = {
      avg: results.cpu?.average || 50,
      p95: results.cpu?.p95 || 75,
      max: results.cpu?.max || 100,
      min: results.cpu?.min || 10,
      p99: results.cpu?.p99 || 90,
      timestamp: Date.now()
    };
    
    console.log(`  CPU Average: ${metrics.avg.toFixed(2)}`);
    console.log(`  CPU P95: ${metrics.p95.toFixed(2)}`);
  }
  
  // Additional data
  const additionalData = {};
  
  if (gclProgress !== null) {
    additionalData.gcl = {
      progressPerTick: gclProgress
    };
    console.log(`  GCL Progress/Tick: ${gclProgress.toFixed(4)}`);
  }
  
  // Save baseline
  console.log('\nSaving baseline...');
  saveBaseline(metrics, branch, additionalData);
  
  console.log('\n✅ Baseline updated successfully');
  console.log(`\nBaseline saved to: performance-baselines/${branch}.json`);
  console.log(`History saved to: performance-baselines/history/${branch}-${new Date().toISOString().split('T')[0]}.json`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
