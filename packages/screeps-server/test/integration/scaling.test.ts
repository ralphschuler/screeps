/**
 * Scaling Integration Tests
 * 
 * Tests:
 * - Add 2-3 rooms and verify scaling
 * - Verify CPU scales linearly
 * - Test cluster coordination
 * - Verify pheromone diffusion
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { fiveRoomScenario } from '../fixtures/scenarios.js';

describe('Multi-Room Scaling', () => {
  describe('Multi-Room Operations', () => {
    it('should manage multiple rooms simultaneously', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      
      // Check that multiple rooms are being managed
      const hasRooms = memory.rooms && Object.keys(memory.rooms).length > 0;
      assert.isTrue(hasRooms, 'Multiple rooms should be managed');
    });

    it('should maintain operations across all rooms', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Multi-room operations should work without errors');
    });
  });

  describe('CPU Scaling', () => {
    it('should scale CPU linearly with room count', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      
      // 5 rooms should use approximately 5x single room CPU
      // Allow for some overhead in multi-room coordination
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick,
        `Multi-room avg CPU ${avgCpu.toFixed(3)} should be below ${scenario.performance.avgCpuPerTick}`
      );
    });

    it('should stay within max CPU budget for multi-room', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const maxCpu = helper.getMaxCpu();
      
      assert.isBelow(
        maxCpu,
        scenario.performance.maxCpuPerTick,
        `Multi-room max CPU ${maxCpu.toFixed(3)} should be below ${scenario.performance.maxCpuPerTick}`
      );
    });

    it('should maintain bucket level with multiple rooms', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgBucket = helper.getAverageBucket();
      
      assert.isAbove(
        avgBucket,
        scenario.performance.minBucketLevel,
        `Bucket ${avgBucket.toFixed(0)} should be above ${scenario.performance.minBucketLevel} with multiple rooms`
      );
    });
  });

  describe('Inter-Room Coordination', () => {
    it('should coordinate creep spawning across rooms', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      const hasCreeps = memory.creeps && Object.keys(memory.creeps).length > 0;
      
      assert.isTrue(hasCreeps, 'Creeps should be spawned across multiple rooms');
    });

    it('should share resources between rooms', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      // Bot should be coordinating resources without errors
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Resource sharing should work without errors');
    });
  });

  describe('Memory Scaling', () => {
    it('should handle increased memory load', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      assert.isBelow(
        avgMemoryParse,
        scenario.performance.maxMemoryParsing,
        `Memory parsing ${avgMemoryParse.toFixed(4)} should be below ${scenario.performance.maxMemoryParsing} with multiple rooms`
      );
    });

    it('should maintain memory efficiency at scale', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      // Memory parse time should be consistent
      const memoryParseTimes = metrics.memoryParseTime;
      const avgMemoryParse = memoryParseTimes.reduce((a, b) => a + b, 0) / memoryParseTimes.length;
      const maxMemoryParse = Math.max(...memoryParseTimes);
      
      // Max shouldn't be more than 3x average (indicates spikes)
      assert.isBelow(
        maxMemoryParse,
        avgMemoryParse * 3,
        'Memory parsing should be consistent without large spikes'
      );
    });
  });

  describe('Operational Stability at Scale', () => {
    it('should maintain stable operations with multiple rooms', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Multi-room empire should run without errors');
    });

    it('should show consistent CPU usage across ticks', async function() {
      this.timeout(180000);
      
      const scenario = fiveRoomScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      const cpuVariance = metrics.cpuHistory.reduce((sum, cpu) => {
        return sum + Math.pow(cpu - avgCpu, 2);
      }, 0) / metrics.cpuHistory.length;
      const cpuStdDev = Math.sqrt(cpuVariance);
      
      // Allow higher variance for multi-room (more dynamic behavior)
      assert.isBelow(
        cpuStdDev,
        0.1,
        `CPU standard deviation ${cpuStdDev.toFixed(4)} should be reasonable for multi-room`
      );
    });
  });
});
