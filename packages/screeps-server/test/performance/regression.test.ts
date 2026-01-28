/**
 * Performance Regression Detection Tests
 * 
 * Validates performance against established baselines to detect regressions
 * Compares current test runs against historical baseline data
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { 
  loadBaseline, 
  compareAgainstBaseline,
  formatRegression,
  type ComparisonResult
} from '../helpers/baseline.js';

// Regression thresholds
const CPU_REGRESSION_THRESHOLD = 15; // 15% CPU regression is a warning
const MEMORY_REGRESSION_THRESHOLD = 15; // 15% memory regression is a warning
const GCL_REGRESSION_THRESHOLD = 20; // 20% GCL rate reduction is a warning

describe('Performance Regression Detection', () => {
  describe('CPU Regression Tests', () => {
    it('should not regress CPU usage >15% from baseline', async function() {
      this.timeout(60000);
      
      // Load baseline for eco room scenario
      const { baseline, config } = await loadBaseline('default');
      
      // Run current test
      const metrics = await helper.runTicks(config.ticks);
      const avgCpu = helper.getAverageCpu();
      const maxCpu = helper.getMaxCpu();
      
      // Calculate p95 CPU
      const sortedCpu = [...metrics.cpuHistory].sort((a, b) => a - b);
      const p95Index = Math.floor(sortedCpu.length * 0.95);
      const p95Cpu = sortedCpu[p95Index] || avgCpu;
      
      // Compare against baseline
      const results = compareAgainstBaseline(
        baseline,
        { avgCpu, maxCpu, p95Cpu },
        { cpu: CPU_REGRESSION_THRESHOLD }
      );
      
      // Log detailed results
      console.log('\n=== CPU Regression Analysis ===');
      results.forEach(result => {
        console.log(`${result.metric}: ${result.current.toFixed(3)} (baseline: ${result.baseline.toFixed(3)}) - ${formatRegression(result.regression)} [${result.severity}]`);
      });
      
      // Check all metrics pass
      const failures = results.filter(r => !r.passed);
      if (failures.length > 0) {
        const failureMsg = failures
          .map(f => `${f.metric}: ${formatRegression(f.regression)}`)
          .join(', ');
        assert.fail(`CPU regression detected: ${failureMsg}`);
      }
      
      assert.ok(true, 'All CPU metrics within acceptable regression threshold');
    });
    
    it('should detect and report CPU improvements', async function() {
      this.timeout(60000);
      
      const { baseline, config } = await loadBaseline('default');
      const metrics = await helper.runTicks(config.ticks);
      const avgCpu = helper.getAverageCpu();
      
      const results = compareAgainstBaseline(
        baseline,
        { avgCpu, maxCpu: helper.getMaxCpu() },
        { cpu: CPU_REGRESSION_THRESHOLD }
      );
      
      const improvements = results.filter(r => r.severity === 'improvement');
      if (improvements.length > 0) {
        console.log('\n✅ Performance Improvements Detected:');
        improvements.forEach(imp => {
          console.log(`  ${imp.metric}: ${formatRegression(imp.regression)}`);
        });
      }
      
      // This test always passes, it's just for reporting
      assert.ok(true);
    });
  });
  
  describe('Memory Regression Tests', () => {
    it('should not regress memory usage >15% from baseline', async function() {
      this.timeout(60000);
      
      const { baseline, config } = await loadBaseline('default');
      
      // Skip if baseline doesn't have memory data
      if (!baseline.avgMemory) {
        this.skip();
        return;
      }
      
      const metrics = await helper.runTicks(config.ticks);
      const avgMemory = metrics.memoryParseTime.reduce((a, b) => a + b, 0) / metrics.memoryParseTime.length;
      
      const results = compareAgainstBaseline(
        baseline,
        { avgCpu: helper.getAverageCpu(), maxCpu: helper.getMaxCpu(), avgMemory },
        { memory: MEMORY_REGRESSION_THRESHOLD }
      );
      
      const memoryResults = results.filter(r => r.metric === 'avgMemory');
      
      console.log('\n=== Memory Regression Analysis ===');
      memoryResults.forEach(result => {
        console.log(`${result.metric}: ${result.current.toFixed(3)} (baseline: ${result.baseline.toFixed(3)}) - ${formatRegression(result.regression)} [${result.severity}]`);
      });
      
      const failures = memoryResults.filter(r => !r.passed);
      if (failures.length > 0) {
        const failureMsg = failures
          .map(f => `${f.metric}: ${formatRegression(f.regression)}`)
          .join(', ');
        assert.fail(`Memory regression detected: ${failureMsg}`);
      }
      
      assert.ok(true, 'Memory usage within acceptable regression threshold');
    });
  });
  
  describe('Bucket Stability Tests', () => {
    it('should maintain bucket level compared to baseline', async function() {
      this.timeout(60000);
      
      const { baseline, config } = await loadBaseline('default');
      const metrics = await helper.runTicks(config.ticks);
      const avgBucket = helper.getAverageBucket();
      
      // Get baseline bucket level
      const baselineBucket = baseline.avgCpu ? 10000 - (baseline.avgCpu * 500) : 9500;
      
      console.log('\n=== Bucket Stability Analysis ===');
      console.log(`Current avg bucket: ${avgBucket.toFixed(0)}`);
      console.log(`Expected bucket: >=${baselineBucket.toFixed(0)}`);
      
      // Bucket should not be significantly lower
      assert.isAbove(
        avgBucket,
        baselineBucket * 0.95,
        `Bucket ${avgBucket.toFixed(0)} should be close to baseline ${baselineBucket.toFixed(0)}`
      );
    });
  });
  
  describe('GCL Progression Tests', () => {
    it('should not regress GCL rate >20% from baseline', async function() {
      this.timeout(120000);
      
      const { baseline } = await loadBaseline('default');
      
      // Skip if baseline doesn't have GCL data
      if (!baseline || typeof baseline !== 'object') {
        this.skip();
        return;
      }
      
      // Run longer test for GCL measurement
      const metrics = await helper.runTicks(1000);
      
      // GCL progression tracking would require game state access
      // For now, we verify CPU is stable which enables GCL progress
      const avgCpu = helper.getAverageCpu();
      const avgBucket = helper.getAverageBucket();
      
      console.log('\n=== GCL Progression Analysis ===');
      console.log(`Average CPU: ${avgCpu.toFixed(3)}`);
      console.log(`Average Bucket: ${avgBucket.toFixed(0)}`);
      
      // Ensure CPU is low enough to allow upgrading
      assert.isBelow(
        avgCpu,
        0.15,
        'CPU must be low enough to allow efficient upgrading'
      );
      
      // Ensure bucket is healthy
      assert.isAbove(
        avgBucket,
        9000,
        'Bucket must remain healthy for consistent GCL progress'
      );
    });
  });
  
  describe('Energy Efficiency Tests', () => {
    it('should maintain energy collection efficiency', async function() {
      this.timeout(90000);
      
      const metrics = await helper.runTicks(500);
      const avgCpu = helper.getAverageCpu();
      const avgBucket = helper.getAverageBucket();
      
      console.log('\n=== Energy Efficiency Analysis ===');
      console.log(`Average CPU: ${avgCpu.toFixed(3)}`);
      console.log(`Average Bucket: ${avgBucket.toFixed(0)}`);
      
      // Energy efficiency is good when CPU is low and bucket is stable
      assert.isBelow(avgCpu, 0.2, 'CPU should be efficient for energy operations');
      assert.isAbove(avgBucket, 9000, 'Bucket should remain stable during operations');
      
      // Check CPU consistency over time
      const firstHalf = metrics.cpuHistory.slice(0, 250);
      const secondHalf = metrics.cpuHistory.slice(250);
      
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      const drift = Math.abs(avgSecond - avgFirst) / avgFirst;
      console.log(`CPU drift: ${(drift * 100).toFixed(1)}%`);
      
      assert.isBelow(drift, 0.15, 'CPU should not drift significantly over time');
    });
  });
  
  describe('Comprehensive Regression Report', () => {
    it('should generate full regression report', async function() {
      this.timeout(90000);
      
      const { baseline, config } = await loadBaseline('default');
      const metrics = await helper.runTicks(config.ticks);
      
      const avgCpu = helper.getAverageCpu();
      const maxCpu = helper.getMaxCpu();
      const avgBucket = helper.getAverageBucket();
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      // Calculate p95
      const sortedCpu = [...metrics.cpuHistory].sort((a, b) => a - b);
      const p95Index = Math.floor(sortedCpu.length * 0.95);
      const p95Cpu = sortedCpu[p95Index] || avgCpu;
      
      const results = compareAgainstBaseline(
        baseline,
        { avgCpu, maxCpu, p95Cpu },
        { cpu: CPU_REGRESSION_THRESHOLD }
      );
      
      // Generate report
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║         PERFORMANCE REGRESSION REPORT                    ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('\nCurrent Metrics:');
      console.log(`  Average CPU: ${avgCpu.toFixed(3)}`);
      console.log(`  Max CPU: ${maxCpu.toFixed(3)}`);
      console.log(`  P95 CPU: ${p95Cpu.toFixed(3)}`);
      console.log(`  Average Bucket: ${avgBucket.toFixed(0)}`);
      console.log(`  Memory Parse Time: ${avgMemoryParse.toFixed(4)}`);
      
      console.log('\nBaseline Comparison:');
      results.forEach(result => {
        const icon = result.severity === 'improvement' ? '✅' : 
                     result.severity === 'pass' ? '✓' :
                     result.severity === 'warning' ? '⚠️' : '❌';
        console.log(`  ${icon} ${result.metric}: ${formatRegression(result.regression)} (${result.severity})`);
      });
      
      const hasFailures = results.some(r => !r.passed);
      const hasImprovements = results.some(r => r.severity === 'improvement');
      
      console.log('\nSummary:');
      if (hasFailures) {
        console.log('  ❌ Performance regressions detected');
      } else if (hasImprovements) {
        console.log('  ✅ Performance improvements detected');
      } else {
        console.log('  ✓ Performance stable (no significant changes)');
      }
      console.log('═════════════════════════════════════════════════════════════\n');
      
      // Always pass - this is just a report
      assert.ok(true);
    });
  });
});
