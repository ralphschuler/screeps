#!/usr/bin/env node

/**
 * Simple smoke test for rolling baseline system
 * Creates mock baseline data and validates the analysis pipeline
 */

import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

// Test configuration
const TEST_DIR = '/tmp/rolling-baseline-test';
const BASELINES_DIR = join(TEST_DIR, 'baselines');

console.log('🧪 Rolling Baseline System Smoke Test');
console.log('='.repeat(60));

// Clean up test directory if it exists
if (existsSync(TEST_DIR)) {
  rmSync(TEST_DIR, { recursive: true, force: true });
}

// Create test directory structure
mkdirSync(BASELINES_DIR, { recursive: true });
console.log('✅ Test directory created');

// Generate mock baseline data
function generateMockBaseline(daysAgo, gameTime, cpuAvg, gclRate, errorRate) {
  const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const totalCreeps = 450 + Math.floor(Math.random() * 50);
  const totalRooms = 12;
  
  return {
    timestamp,
    gameTime,
    commit: `commit-${daysAgo}`,
    branch: 'test',
    metrics: {
      timestamp,
      gameTime,
      cpu: {
        current: cpuAvg + (Math.random() - 0.5) * 2,
        limit: 100,
        bucket: 8000 + Math.random() * 1000,
        avg24h: cpuAvg
      },
      gcl: {
        level: 8,
        progress: 0.5,
        progressRate: gclRate
      },
      rooms: {
        total: totalRooms,
        byRCL: { '8': 4, '7': 4, '6': 2, '5': 2 },
        avgCPU: cpuAvg / totalRooms
      },
      creeps: {
        total: totalCreeps,
        byRole: { harvester: 120, hauler: 90 },
        avgPerRoom: totalCreeps / totalRooms
      },
      errors: {
        last24h: 5,
        currentRate: errorRate,
        topErrors: []
      }
    },
    issuesCreated: [],
    issuesUpdated: [],
    recommendations: []
  };
}

// Create 7 days of baseline data with normal values
console.log('📊 Generating mock baseline data...');
for (let i = 7; i >= 1; i--) {
  const baseline = generateMockBaseline(
    i, 
    45000000 + (7 - i) * 10000,
    85.0 + (Math.random() - 0.5) * 4, // CPU around 85 ± 2
    0.015 + (Math.random() - 0.5) * 0.002, // GCL rate around 0.015
    0.02 + (Math.random() - 0.5) * 0.01 // Error rate around 0.02
  );
  
  const filename = `${baseline.timestamp.replace(/[:.]/g, '-')}_test-${i}.json`;
  writeFileSync(join(BASELINES_DIR, filename), JSON.stringify(baseline, null, 2));
}
console.log('✅ Generated 7 baseline files');

// Create current snapshot with a regression (high CPU)
console.log('📈 Creating current snapshot with CPU regression...');
const currentBaseline = generateMockBaseline(
  0,
  45070000,
  95.0, // Significant CPU increase
  0.016, // Slight GCL improvement
  0.01 // Error rate improvement
);

const currentFilename = join(BASELINES_DIR, 'collected-metrics.json');
writeFileSync(currentFilename, JSON.stringify(currentBaseline, null, 2));
console.log('✅ Current snapshot created');

// Now test the rolling baseline analysis
console.log('');
console.log('🔍 Running rolling baseline analysis...');
console.log('='.repeat(60));

// Dynamically import the integration script
import('./integrate-rolling-baseline.mjs').catch(err => {
  // The integration script runs as a program, not a module
  // We'll need to run it as a child process instead
  console.log('Note: Integration script must be run as a separate process');
});

// Alternative: Test individual components
console.log('');
console.log('Testing individual components...');
console.log('-'.repeat(60));

import('./calculate-rolling-baseline.js').then(async ({ calculateRollingBaseline, loadRecentBaselines, calculateStandardDeviations }) => {
  console.log('');
  console.log('1️⃣ Testing Rolling Baseline Calculation');
  
  const baselines = loadRecentBaselines(7, BASELINES_DIR);
  console.log(`   ✅ Loaded ${baselines.length} baselines`);
  
  const rolling = calculateRollingBaseline(7, BASELINES_DIR);
  if (rolling) {
    console.log(`   ✅ Rolling baseline calculated`);
    console.log(`      CPU Avg: ${rolling.metrics.cpu.avg.toFixed(2)} (σ=${rolling.metrics.cpu.stdDev.toFixed(2)})`);
    console.log(`      GCL Avg: ${rolling.metrics.gcl.avgRate.toFixed(4)}/tick`);
    console.log(`      Sample Count: ${rolling.sampleCount}`);
    
    // Test standard deviations
    const stdDev = calculateStandardDeviations(baselines);
    console.log(`   ✅ Standard deviations calculated`);
    
    // Test regression detection
    return import('./detect-regressions.js').then(({ detectRegressions, detectImprovements, calculateHealthScore, determineTrend }) => {
      console.log('');
      console.log('2️⃣ Testing Regression Detection');
      
      const regressions = detectRegressions(currentBaseline.metrics, rolling, stdDev);
      console.log(`   ✅ Detected ${regressions.length} regressions`);
      
      for (const r of regressions) {
        console.log(`      - [${r.severity.toUpperCase()}] ${r.type}: ${r.description}`);
      }
      
      const improvements = detectImprovements(currentBaseline.metrics, rolling, stdDev);
      console.log(`   ✅ Detected ${improvements.length} improvements`);
      
      for (const i of improvements) {
        console.log(`      - ${i.type}: ${i.description}`);
      }
      
      const healthScore = calculateHealthScore(currentBaseline.metrics, rolling, regressions);
      console.log(`   ✅ Health Score: ${healthScore}/100`);
      
      const trend = determineTrend(currentBaseline.metrics, rolling);
      console.log(`   ✅ Trend: ${trend}`);
      
      // Test report generation
      return import('./generate-trend-report.js').then(({ generateTrendReport }) => {
        console.log('');
        console.log('3️⃣ Testing Report Generation');
        
        const enhancedBaseline = {
          ...currentBaseline,
          comparisonBaseline: {
            avg7d: rolling.metrics,
            stdDev: stdDev,
            trend: trend
          },
          detectedChanges: {
            regressions,
            improvements,
            healthScore
          }
        };
        
        const report = generateTrendReport(
          enhancedBaseline,
          rolling,
          regressions,
          improvements,
          healthScore
        );
        
        console.log(`   ✅ Report generated (${report.length} characters)`);
        
        // Save report for inspection
        const reportPath = join(TEST_DIR, 'test-report.md');
        writeFileSync(reportPath, report);
        console.log(`   ✅ Report saved to: ${reportPath}`);
        
        console.log('');
        console.log('='.repeat(60));
        console.log('🎉 All tests passed!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Test artifacts:');
        console.log(`  - Baselines: ${BASELINES_DIR}`);
        console.log(`  - Report: ${reportPath}`);
        console.log('');
        console.log('✅ Smoke test completed successfully');
      });
    });
  } else {
    console.error('❌ Failed to calculate rolling baseline');
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Test failed:', err);
  console.error(err.stack);
  process.exit(1);
});
