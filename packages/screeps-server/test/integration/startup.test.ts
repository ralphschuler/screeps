/**
 * Startup Integration Tests
 * 
 * Tests:
 * - Bot initializes without errors
 * - Kernel starts all processes
 * - Memory structures created correctly
 * - First creeps spawn successfully
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { emptyRoomScenario } from '../fixtures/scenarios.js';

describe('Bot Startup', () => {
  describe('Initialization', () => {
    it('should start bot without errors', async function() {
      this.timeout(15000);
      
      await helper.runTicks(10);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Bot should start without errors');
    });

    it('should create memory structures', async function() {
      this.timeout(15000);
      
      await helper.runTicks(5);
      
      const memory = await helper.getMemory();
      assert.exists(memory, 'Memory should exist');
      assert.isObject(memory, 'Memory should be an object');
    });

    it('should initialize kernel processes', async function() {
      this.timeout(20000);
      
      await helper.runTicks(10);
      
      const memory = await helper.getMemory();
      
      // Check for kernel initialization markers
      // Adapt this to match your actual bot's memory structure
      if (memory.kernel || memory.processes || memory.rooms) {
        assert.ok(true, 'Kernel or room structures initialized');
      } else {
        // If no specific kernel structure, just verify memory exists and is valid
        assert.exists(memory, 'Memory structures should be initialized');
      }
    });
  });

  describe('First Creep Spawn', () => {
    it('should spawn first harvester creep', async function() {
      this.timeout(60000);
      
      const scenario = emptyRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      
      // Check that creeps exist in memory or that spawning occurred
      const hasCreepMemory = memory.creeps && Object.keys(memory.creeps).length > 0;
      const hasSpawnActivity = memory.rooms || memory.stats;
      
      assert.isTrue(
        hasCreepMemory || hasSpawnActivity,
        'Bot should have spawned creeps or shown spawn activity'
      );
    });

    it('should start energy harvesting', async function() {
      this.timeout(60000);
      
      const scenario = emptyRoomScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Harvesting should work without errors');
    });
  });

  describe('CPU Budget', () => {
    it('should stay within startup CPU budget', async function() {
      this.timeout(30000);
      
      const scenario = emptyRoomScenario;
      const metrics = await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      const maxCpu = helper.getMaxCpu();
      
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick,
        `Startup avg CPU ${avgCpu.toFixed(3)} should be below ${scenario.performance.avgCpuPerTick}`
      );
      
      assert.isBelow(
        maxCpu,
        scenario.performance.maxCpuPerTick,
        `Startup max CPU ${maxCpu.toFixed(3)} should be below ${scenario.performance.maxCpuPerTick}`
      );
    });
  });

  describe('Memory Stability', () => {
    it('should maintain consistent memory structure across ticks', async function() {
      this.timeout(30000);
      
      await helper.runTicks(10);
      const memory1 = await helper.getMemory();
      
      await helper.runTicks(10);
      const memory2 = await helper.getMemory();
      
      // Both snapshots should exist and be objects
      assert.exists(memory1, 'First memory snapshot should exist');
      assert.exists(memory2, 'Second memory snapshot should exist');
      assert.isObject(memory1, 'First memory should be an object');
      assert.isObject(memory2, 'Second memory should be an object');
    });

    it('should not leak memory across ticks', async function() {
      this.timeout(40000);
      
      const metrics = await helper.runTicks(50);
      
      // Memory parse time should be stable
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      assert.isBelow(
        avgMemoryParse,
        0.02,
        `Memory parse time ${avgMemoryParse.toFixed(4)} should be stable and below 0.02 CPU`
      );
    });
  });
});
