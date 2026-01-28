#!/usr/bin/env node

/**
 * Integrate Rolling Baseline Analysis
 * 
 * This script integrates rolling baseline analysis into the strategic metrics
 * collection process. It:
 * 1. Loads the current metrics snapshot
 * 2. Calculates 7-day rolling baseline
 * 3. Detects regressions and improvements
 * 4. Calculates health score
 * 5. Generates trend report
 * 6. Saves enhanced baseline with comparison data
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { calculateRollingBaseline, calculateStandardDeviations, loadRecentBaselines } from './calculate-rolling-baseline.js';
import { detectRegressions, detectImprovements, calculateHealthScore, determineTrend } from './detect-regressions.js';
import { generateTrendReport } from './generate-trend-report.js';
import type { PerformanceBaseline, PerformanceSnapshot } from '../../packages/screeps-bot/test/performance/strategic-types.js';

// Configuration
const BASELINES_DIR = process.env.BASELINES_DIR || 'performance-baselines/strategic';
const INPUT_FILE = process.argv[2] || `${BASELINES_DIR}/collected-metrics.json`;
const ROLLING_DAYS = parseInt(process.env.ROLLING_DAYS || '7', 10);

console.log('='.repeat(60));
console.log('Rolling Baseline Analysis');
console.log('='.repeat(60));
console.log(`Input: ${INPUT_FILE}`);
console.log(`Rolling Window: ${ROLLING_DAYS} days`);
console.log('');

/**
 * Main integration function
 */
async function main() {
  // Step 1: Load current metrics
  if (!existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    console.error('Please run metrics collection first (node scripts/collect-strategic-metrics.mjs)');
    process.exit(1);
  }

  console.log('📋 Loading current metrics...');
  const rawData = JSON.parse(readFileSync(INPUT_FILE, 'utf-8'));
  
  // Check if this is a PerformanceBaseline or raw collected data
  let currentSnapshot: PerformanceSnapshot;
  let baselineTemplate: Partial<PerformanceBaseline>;
  
  if (rawData.metrics && rawData.metrics.cpu && rawData.metrics.gcl) {
    // Already a PerformanceBaseline
    currentSnapshot = rawData.metrics;
    baselineTemplate = rawData;
  } else if (rawData.summary && rawData.rawData) {
    // Raw collected data - need to transform
    console.log('📊 Transforming raw data to performance snapshot...');
    currentSnapshot = transformRawDataToSnapshot(rawData);
    baselineTemplate = {
      timestamp: rawData.timestamp || new Date().toISOString(),
      runId: rawData.runId,
      runUrl: rawData.runUrl,
      issuesCreated: [],
      issuesUpdated: [],
      recommendations: []
    };
  } else {
    console.error('❌ Unrecognized data format in input file');
    process.exit(1);
  }

  console.log('✅ Current metrics loaded');
  console.log(`   Game Time: ${currentSnapshot.gameTime}`);
  console.log(`   CPU: ${currentSnapshot.cpu.current}`);
  console.log(`   GCL: ${currentSnapshot.gcl.level} (progress: ${currentSnapshot.gcl.progress})`);
  console.log('');

  // Step 2: Calculate rolling baseline
  console.log(`📊 Calculating ${ROLLING_DAYS}-day rolling baseline...`);
  const rollingBaseline = calculateRollingBaseline(ROLLING_DAYS, BASELINES_DIR);
  
  if (!rollingBaseline) {
    console.warn('⚠️  No historical baselines found - skipping comparison analysis');
    console.warn('   This is normal for the first run. Saving current baseline...');
    
    // Save current snapshot as baseline without comparison
    const outputPath = `${BASELINES_DIR}/${new Date().toISOString().replace(/[:.]/g, '-')}_${baselineTemplate.runId || 'unknown'}.json`;
    const baseline: PerformanceBaseline = {
      ...baselineTemplate as PerformanceBaseline,
      timestamp: baselineTemplate.timestamp || new Date().toISOString(),
      gameTime: currentSnapshot.gameTime,
      commit: process.env.GITHUB_SHA || 'unknown',
      branch: process.env.GITHUB_REF_NAME || 'unknown',
      metrics: currentSnapshot,
      issuesCreated: baselineTemplate.issuesCreated || [],
      issuesUpdated: baselineTemplate.issuesUpdated || [],
      recommendations: baselineTemplate.recommendations || []
    };
    
    writeFileSync(outputPath, JSON.stringify(baseline, null, 2));
    console.log(`✅ Baseline saved: ${outputPath}`);
    process.exit(0);
  }

  console.log('✅ Rolling baseline calculated');
  console.log(`   Sample Count: ${rollingBaseline.sampleCount} baselines`);
  console.log(`   Period: ${rollingBaseline.startDate} to ${rollingBaseline.endDate}`);
  console.log(`   CPU Avg: ${rollingBaseline.metrics.cpu.avg.toFixed(2)} (σ=${rollingBaseline.metrics.cpu.stdDev.toFixed(2)})`);
  console.log(`   GCL Avg: ${rollingBaseline.metrics.gcl.avgRate.toFixed(4)}/tick`);
  console.log('');

  // Step 3: Calculate standard deviations
  console.log('📈 Calculating standard deviations...');
  const baselines = loadRecentBaselines(ROLLING_DAYS, BASELINES_DIR);
  const stdDev = calculateStandardDeviations(baselines);
  console.log('✅ Standard deviations calculated');
  console.log('');

  // Step 4: Detect regressions and improvements
  console.log('🔍 Detecting regressions and improvements...');
  const regressions = detectRegressions(currentSnapshot, rollingBaseline, stdDev);
  const improvements = detectImprovements(currentSnapshot, rollingBaseline, stdDev);
  
  console.log(`   Regressions: ${regressions.length}`);
  if (regressions.length > 0) {
    for (const r of regressions) {
      console.log(`     - [${r.severity.toUpperCase()}] ${r.type}: ${r.description}`);
    }
  }
  
  console.log(`   Improvements: ${improvements.length}`);
  if (improvements.length > 0) {
    for (const i of improvements) {
      console.log(`     - ${i.type}: ${i.description}`);
    }
  }
  console.log('');

  // Step 5: Calculate health score
  console.log('💚 Calculating health score...');
  const healthScore = calculateHealthScore(currentSnapshot, rollingBaseline, regressions);
  console.log(`✅ Health Score: ${healthScore}/100`);
  console.log('');

  // Step 6: Determine trend
  console.log('📊 Determining trend...');
  const trend = determineTrend(currentSnapshot, rollingBaseline);
  console.log(`✅ Trend: ${trend}`);
  console.log('');

  // Step 7: Generate trend report
  console.log('📝 Generating trend report...');
  const enhancedBaseline: PerformanceBaseline = {
    ...baselineTemplate as PerformanceBaseline,
    timestamp: baselineTemplate.timestamp || new Date().toISOString(),
    gameTime: currentSnapshot.gameTime,
    commit: process.env.GITHUB_SHA || 'unknown',
    branch: process.env.GITHUB_REF_NAME || 'unknown',
    metrics: currentSnapshot,
    issuesCreated: baselineTemplate.issuesCreated || [],
    issuesUpdated: baselineTemplate.issuesUpdated || [],
    recommendations: baselineTemplate.recommendations || [],
    comparisonBaseline: {
      avg7d: rollingBaseline.metrics,
      stdDev: stdDev,
      trend: trend
    },
    detectedChanges: {
      regressions: regressions,
      improvements: improvements,
      healthScore: healthScore
    }
  };

  const trendReport = generateTrendReport(
    enhancedBaseline,
    rollingBaseline,
    regressions,
    improvements,
    healthScore
  );

  // Step 8: Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runId = baselineTemplate.runId || 'unknown';
  const outputPath = `${BASELINES_DIR}/${timestamp}_${runId}.json`;
  const reportPath = `${BASELINES_DIR}/${timestamp}_${runId}_report.md`;

  console.log('💾 Saving results...');
  writeFileSync(outputPath, JSON.stringify(enhancedBaseline, null, 2));
  console.log(`✅ Enhanced baseline saved: ${outputPath}`);
  
  writeFileSync(reportPath, trendReport);
  console.log(`✅ Trend report saved: ${reportPath}`);
  console.log('');

  // Print summary
  console.log('='.repeat(60));
  console.log('Analysis Complete');
  console.log('='.repeat(60));
  console.log(`Health Score: ${healthScore}/100`);
  console.log(`Trend: ${trend}`);
  console.log(`Regressions: ${regressions.length} (Critical: ${regressions.filter(r => r.severity === 'critical').length})`);
  console.log(`Improvements: ${improvements.length}`);
  console.log('');

  // Exit with appropriate code
  const criticalRegressions = regressions.filter(r => r.severity === 'critical').length;
  if (criticalRegressions > 0) {
    console.warn('⚠️  Critical regressions detected!');
    process.exit(1);
  }

  process.exit(0);
}

/**
 * Transform raw collected data to PerformanceSnapshot
 */
function transformRawDataToSnapshot(rawData: any): PerformanceSnapshot {
  const summary = rawData.summary || {};
  const screepsData = rawData.rawData?.screeps || {};
  
  return {
    timestamp: rawData.timestamp || new Date().toISOString(),
    gameTime: summary.gameTime || 0,
    cpu: {
      current: summary.cpu?.current || 0,
      limit: summary.cpu?.limit || 100,
      bucket: summary.cpu?.bucket || 0,
      avg24h: summary.cpu?.current || 0 // Use current as fallback
    },
    gcl: {
      level: summary.gcl?.level || 0,
      progress: summary.gcl?.progress || 0,
      progressRate: 0 // Will need to be calculated from historical data
    },
    rooms: {
      total: summary.rooms?.total || 0,
      byRCL: {},
      avgCPU: 0
    },
    creeps: {
      total: summary.creeps?.total || 0,
      byRole: {}
    },
    errors: {
      last24h: 0,
      currentRate: 0,
      topErrors: []
    }
  };
}

// Run main function
main().catch(error => {
  console.error('❌ Error:', error.message);
  if (process.env.VERBOSE) {
    console.error(error.stack);
  }
  process.exit(1);
});
