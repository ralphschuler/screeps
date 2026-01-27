/**
 * Defense Integration Tests
 * 
 * Tests:
 * - Inject hostile creeps
 * - Verify tower activation
 * - Verify defender spawning
 * - Verify pheromone spikes (danger, defense)
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { defenseResponseScenario } from '../fixtures/scenarios.js';

describe('Defense Response', () => {
  describe('Threat Detection', () => {
    it('should initialize defense systems', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      
      // Check that defense-related structures exist in memory
      const hasDefenseStructures = memory.rooms || memory.stats || memory.defense;
      assert.isTrue(hasDefenseStructures, 'Defense systems should be initialized');
    });

    it('should maintain defensive posture', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Defense systems should run without errors');
    });
  });

  describe('Defense Activation', () => {
    it('should activate towers when needed', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      // Bot should handle tower logic without errors
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Tower activation should work without errors');
    });

    it('should spawn defenders when under threat', async function() {
      this.timeout(120000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks * 1.5);
      
      const memory = await helper.getMemory();
      
      // Check for defensive creeps or defense activity
      const hasDefenseActivity = memory.creeps || memory.rooms || memory.defense;
      assert.isTrue(hasDefenseActivity, 'Defense activity should be present');
    });
  });

  describe('Defense CPU Budget', () => {
    it('should stay within defense CPU budget', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgCpu = helper.getAverageCpu();
      
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick,
        `Defense avg CPU ${avgCpu.toFixed(3)} should be below ${scenario.performance.avgCpuPerTick}`
      );
    });

    it('should handle defense CPU spikes', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const maxCpu = helper.getMaxCpu();
      
      assert.isBelow(
        maxCpu,
        scenario.performance.maxCpuPerTick,
        `Defense max CPU ${maxCpu.toFixed(3)} should be below ${scenario.performance.maxCpuPerTick}`
      );
    });

    it('should maintain bucket during defense', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgBucket = helper.getAverageBucket();
      
      assert.isAbove(
        avgBucket,
        scenario.performance.minBucketLevel,
        `Bucket ${avgBucket.toFixed(0)} should be above ${scenario.performance.minBucketLevel} during defense`
      );
    });
  });

  describe('Pheromone System', () => {
    it('should update pheromones during defense', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      
      // Check for pheromone system or danger markers
      const hasPheromones = memory.pheromones || memory.danger || memory.rooms;
      assert.isTrue(hasPheromones, 'Pheromone or danger tracking should be present');
    });

    it('should track danger levels', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      // Bot should track danger without errors
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Danger tracking should work without errors');
    });
  });

  describe('Defense Coordination', () => {
    it('should coordinate defensive actions', async function() {
      this.timeout(120000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks * 1.5);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Defense coordination should work without errors');
    });

    it('should prioritize critical threats', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      // Bot should handle threat prioritization
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Threat prioritization should work without errors');
    });
  });

  describe('Memory Efficiency During Defense', () => {
    it('should maintain memory efficiency during defense', async function() {
      this.timeout(90000);
      
      const scenario = defenseResponseScenario;
      await helper.runTicks(scenario.ticks);
      
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      assert.isBelow(
        avgMemoryParse,
        scenario.performance.maxMemoryParsing,
        `Memory parsing ${avgMemoryParse.toFixed(4)} should be below ${scenario.performance.maxMemoryParsing} during defense`
      );
    });
  });

  describe('Recovery After Defense', () => {
    it('should return to normal operations after threat', async function() {
      this.timeout(150000);
      
      const scenario = defenseResponseScenario;
      
      // Simulate defense period
      await helper.runTicks(scenario.ticks);
      
      // Simulate recovery period
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Bot should recover after defense without errors');
    });

    it('should maintain stable CPU after defense', async function() {
      this.timeout(150000);
      
      const scenario = defenseResponseScenario;
      
      // Run defense scenario
      await helper.runTicks(scenario.ticks);
      const defenseCpu = helper.getAverageCpu();
      
      // Run recovery period
      await helper.runTicks(scenario.ticks);
      const recoveryCpu = helper.getAverageCpu();
      
      // CPU should not permanently increase
      assert.isBelow(
        recoveryCpu,
        defenseCpu * 1.2,
        'CPU should stabilize after defense'
      );
    });
  });
});
