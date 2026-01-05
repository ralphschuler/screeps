#!/usr/bin/env node

/**
 * Performance Regression Detection Script
 * 
 * This script demonstrates how to use the regression detection module
 * to check for performance regressions after code changes.
 * 
 * Prerequisites:
 *   cd scripts/mcp-helpers && npx tsc
 * 
 * Usage:
 *   node scripts/check-performance-regression.js [branch] [cpu-avg] [cpu-p95]
 * 
 * Example:
 *   node scripts/check-performance-regression.js main 52.3 78.5
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

const { detectRegression, getBaseline, getRegressionHistory } = require('./mcp-helpers/dist/regression');

// Parse command line arguments
const args = process.argv.slice(2);
const branch = args[0] || 'main';
const cpuAvg = parseFloat(args[1]) || null;
const cpuP95 = parseFloat(args[2]) || null;

async function main() {
  console.log('=== Performance Regression Detection ===\n');
  
  // Show current baseline
  console.log(`Branch: ${branch}`);
  const baseline = getBaseline(branch);
  
  if (!baseline) {
    console.error(`❌ No baseline found for branch: ${branch}`);
    console.log('\nTo create a baseline, use:');
    console.log('  node scripts/update-baseline.js');
    process.exit(1);
  }
  
  console.log('\nBaseline Metrics:');
  console.log(`  CPU Average: ${baseline.cpu.avg.toFixed(2)}`);
  console.log(`  CPU P95: ${baseline.cpu.p95.toFixed(2)}`);
  console.log(`  GCL Progress/Tick: ${baseline.gcl?.progressPerTick?.toFixed(4) || 'N/A'}`);
  console.log(`  Timestamp: ${new Date(baseline.timestamp).toISOString()}`);
  
  // Check regression if metrics provided
  if (cpuAvg !== null && cpuP95 !== null) {
    console.log('\nCurrent Metrics:');
    console.log(`  CPU Average: ${cpuAvg.toFixed(2)}`);
    console.log(`  CPU P95: ${cpuP95.toFixed(2)}`);
    
    const currentMetrics = {
      avg: cpuAvg,
      p95: cpuP95,
      max: cpuP95 * 1.1, // Estimate
      min: cpuAvg * 0.5, // Estimate
      p99: cpuP95 * 1.05, // Estimate
      timestamp: Date.now()
    };
    
    console.log('\nDetecting Regression...\n');
    const regression = await detectRegression(currentMetrics, branch);
    
    // Display results
    const icons = {
      none: '🟢',
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '💥'
    };
    
    console.log(`${icons[regression.severity]} Severity: ${regression.severity.toUpperCase()}`);
    console.log(`\n${regression.message}`);
    
    if (regression.recommendation) {
      console.log(`\nRecommendation: ${regression.recommendation}`);
    }
    
    if (regression.details) {
      console.log('\nDetails:');
      Object.entries(regression.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
    
    // Exit with error code if regression detected
    if (regression.severity === 'high' || regression.severity === 'critical') {
      process.exit(1);
    }
  } else {
    console.log('\n💡 To check for regression, provide current metrics:');
    console.log(`  node scripts/check-performance-regression.js ${branch} <cpu-avg> <cpu-p95>`);
  }
  
  // Show regression history
  console.log('\n=== Regression History (Last 30 Days) ===\n');
  const history = getRegressionHistory(branch, 30);
  
  if (history.length === 0) {
    console.log('No historical data available');
  } else {
    console.log(`Found ${history.length} baseline entries:\n`);
    
    history.slice(0, 10).forEach((entry, index) => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      console.log(`${index + 1}. ${date}`);
      console.log(`   CPU: ${entry.cpu.avg.toFixed(2)} (P95: ${entry.cpu.p95.toFixed(2)})`);
      if (entry.gcl?.progressPerTick) {
        console.log(`   GCL: ${entry.gcl.progressPerTick.toFixed(4)}/tick`);
      }
    });
    
    if (history.length > 10) {
      console.log(`\n... and ${history.length - 10} more entries`);
    }
  }
  
  console.log('\n✅ Regression check complete');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
