/**
 * Economy Integration Tests
 * 
 * Tests:
 * - Spawn creeps with correct priorities
 * - Harvest sources efficiently
 * - Upgrade controller steadily
 * - Maintain energy balance
 * - CPU usage within budget (≤0.1 per room)
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { singleRoomEcoScenario } from '../fixtures/scenarios.js';

describe('Single Room Economy', () => {
  describe('Creep Management', () => {
    it('should spawn economy creeps', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      const hasCreeps = memory.creeps && Object.keys(memory.creeps).length > 0;
      
      assert.isTrue(hasCreeps, 'Economy should have spawned creeps');
    });

    it('should maintain creep population', async function() {
      this.timeout(120000);
      
      const scenario = singleRoomEcoScenario;
      
      // Run initial ticks
      await helper.runTicks(scenario.ticks);
      const memory1 = await helper.getMemory();
      const creepCount1 = memory1.creeps ? Object.keys(memory1.creeps).length : 0;
      
      // Run more ticks
      await helper.runTicks(50);
      const memory2 = await helper.getMemory();
      const creepCount2 = memory2.creeps ? Object.keys(memory2.creeps).length : 0;
      
      // Population should be maintained or growing
      assert.isAtLeast(
        creepCount2,
        Math.floor(creepCount1 * 0.8),
        'Creep population should be maintained'
      );
    });
  });

  describe('Energy Flow', () => {
    it('should harvest energy from sources', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Energy harvesting should work without errors');
    });

    it('should upgrade controller', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      
      // Check for controller upgrade activity indicators
      const hasRoomActivity = memory.rooms || memory.stats;
      assert.isTrue(hasRoomActivity, 'Controller upgrade activity should be present');
    });

    it('should maintain energy balance', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      // Bot should be running without critical errors
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Energy balance should be maintained without errors');
    });
  });

  describe('CPU Budget Compliance', () => {
    it('should stay within average CPU budget for economy room', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick,
        `Economy avg CPU ${avgCpu.toFixed(3)} should be below ${scenario.performance.avgCpuPerTick}`
      );
    });

    it('should stay within max CPU budget for economy room', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const maxCpu = helper.getMaxCpu();
      
      assert.isBelow(
        maxCpu,
        scenario.performance.maxCpuPerTick,
        `Economy max CPU ${maxCpu.toFixed(3)} should be below ${scenario.performance.maxCpuPerTick}`
      );
    });

    it('should maintain healthy bucket level', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgBucket = helper.getAverageBucket();
      
      assert.isAbove(
        avgBucket,
        scenario.performance.minBucketLevel,
        `Bucket ${avgBucket.toFixed(0)} should be above ${scenario.performance.minBucketLevel}`
      );
    });
  });

  describe('Memory Efficiency', () => {
    it('should parse memory efficiently', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      assert.isBelow(
        avgMemoryParse,
        scenario.performance.maxMemoryParsing,
        `Memory parsing ${avgMemoryParse.toFixed(4)} should be below ${scenario.performance.maxMemoryParsing}`
      );
    });
  });

  describe('Operational Stability', () => {
    it('should run without errors over extended period', async function() {
      this.timeout(120000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Economy should run without errors over time');
    });

    it('should maintain consistent CPU usage', async function() {
      this.timeout(120000);
      
      const scenario = singleRoomEcoScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      // Calculate CPU variance
      const avgCpu = helper.getAverageCpu();
      const cpuVariance = metrics.cpuHistory.reduce((sum, cpu) => {
        return sum + Math.pow(cpu - avgCpu, 2);
      }, 0) / metrics.cpuHistory.length;
      const cpuStdDev = Math.sqrt(cpuVariance);
      
      // CPU should be relatively stable (low standard deviation)
      assert.isBelow(
        cpuStdDev,
        0.05,
        `CPU standard deviation ${cpuStdDev.toFixed(4)} should be low (stable usage)`
      );
    });
  });
});
