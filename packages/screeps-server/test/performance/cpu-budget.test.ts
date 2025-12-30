/**
 * Performance tests for CPU budget validation
 * 
 * Validates ROADMAP.md CPU targets:
 * - Eco room: ≤0.1 CPU per tick
 * - Combat room: ≤0.25 CPU per tick
 * - Global kernel: ≤1 CPU every 20-50 ticks
 * - Bucket stability: ≥9500
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { 
  singleRoomEcoScenario,
  emptyRoomScenario,
  type TestScenario
} from '../fixtures/scenarios.js';

describe('Performance Tests', () => {
  describe('CPU Budget Validation', () => {
    it('should stay within CPU budget for empty room', async function() {
      this.timeout(30000);
      
      const scenario = emptyRoomScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      const maxCpu = helper.getMaxCpu();
      
      assert.isBelow(
        avgCpu, 
        scenario.performance.avgCpuPerTick,
        `Average CPU ${avgCpu.toFixed(3)} should be below ${scenario.performance.avgCpuPerTick}`
      );
      
      assert.isBelow(
        maxCpu,
        scenario.performance.maxCpuPerTick,
        `Max CPU ${maxCpu.toFixed(3)} should be below ${scenario.performance.maxCpuPerTick}`
      );
    });

    it('should stay within CPU budget for single eco room', async function() {
      this.timeout(60000);
      
      const scenario = singleRoomEcoScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      const maxCpu = helper.getMaxCpu();
      
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick,
        `Average CPU ${avgCpu.toFixed(3)} should be below ${scenario.performance.avgCpuPerTick}`
      );
      
      assert.isBelow(
        maxCpu,
        scenario.performance.maxCpuPerTick,
        `Max CPU ${maxCpu.toFixed(3)} should be below ${scenario.performance.maxCpuPerTick}`
      );
    });

    it('should measure memory parsing time', async function() {
      this.timeout(30000);
      
      const metrics = await helper.runTicks(50);
      
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      assert.isBelow(
        avgMemoryParse,
        0.02,
        `Memory parsing ${avgMemoryParse.toFixed(3)} should be below 0.02 CPU`
      );
    });
  });

  describe('Bucket Stability', () => {
    it('should maintain healthy bucket level', async function() {
      this.timeout(60000);
      
      const scenario = singleRoomEcoScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      const avgBucket = helper.getAverageBucket();
      
      assert.isAbove(
        avgBucket,
        scenario.performance.minBucketLevel,
        `Bucket ${avgBucket.toFixed(0)} should be above ${scenario.performance.minBucketLevel}`
      );
    });

    it('should not drain bucket over time', async function() {
      this.timeout(60000);
      
      const metrics = await helper.runTicks(100);
      
      // Check that bucket isn't trending downward
      const firstHalf = metrics.bucketLevel.slice(0, 50);
      const secondHalf = metrics.bucketLevel.slice(50);
      
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Second half should not be significantly lower (allow 5% variance)
      assert.isAbove(
        avgSecond,
        avgFirst * 0.95,
        'Bucket should not be draining over time'
      );
    });
  });

  describe('Scaling Tests', () => {
    it('should handle multiple consecutive ticks', async function() {
      this.timeout(120000);
      
      const metrics = await helper.runTicks(200);
      
      // All ticks should complete
      assert.equal(metrics.tickTime.length, 200);
      
      // CPU should remain stable
      const firstQuarter = metrics.cpuHistory.slice(0, 50);
      const lastQuarter = metrics.cpuHistory.slice(-50);
      
      const avgFirst = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
      const avgLast = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
      
      // CPU shouldn't increase significantly over time (allow 20% variance for warmup)
      assert.isBelow(
        avgLast,
        avgFirst * 1.2,
        'CPU should not increase significantly over time'
      );
    });

    it('should execute ticks in reasonable time', async function() {
      this.timeout(60000);
      
      const metrics = await helper.runTicks(100);
      
      // Calculate average tick execution time
      const avgTickTime = metrics.tickTime.reduce((a, b) => a + b, 0) / metrics.tickTime.length;
      
      // Ticks should execute quickly (under 100ms average)
      assert.isBelow(
        avgTickTime,
        100,
        `Average tick time ${avgTickTime.toFixed(2)}ms should be below 100ms`
      );
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect CPU spikes', async function() {
      this.timeout(60000);
      
      const metrics = await helper.runTicks(100);
      
      const avgCpu = helper.getAverageCpu();
      const maxCpu = helper.getMaxCpu();
      
      // Max should not be more than 3x average (spike detection)
      const spikeRatio = maxCpu / avgCpu;
      assert.isBelow(
        spikeRatio,
        3.0,
        `CPU spikes detected: max ${maxCpu.toFixed(3)} vs avg ${avgCpu.toFixed(3)}`
      );
    });

    it('should have consistent CPU usage', async function() {
      this.timeout(60000);
      
      const metrics = await helper.runTicks(100);
      
      // Calculate standard deviation
      const avg = helper.getAverageCpu();
      const squaredDiffs = metrics.cpuHistory.map(cpu => Math.pow(cpu - avg, 2));
      const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / metrics.cpuHistory.length);
      
      // Standard deviation should be low (consistent performance)
      const coefficientOfVariation = stdDev / avg;
      assert.isBelow(
        coefficientOfVariation,
        0.5,
        `CPU variance too high: stddev ${stdDev.toFixed(3)}, avg ${avg.toFixed(3)}`
      );
    });
  });
});
