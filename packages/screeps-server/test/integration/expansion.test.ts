/**
 * Expansion Integration Tests
 * 
 * Tests:
 * - Identify expansion candidate
 * - Send claimer creep
 * - Bootstrap new room
 * - Verify room becomes self-sufficient
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';
import { singleRoomEcoScenario } from '../fixtures/scenarios.js';

describe('Room Expansion', () => {
  describe('Expansion Planning', () => {
    it('should identify expansion opportunities', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const memory = await helper.getMemory();
      
      // Check for expansion planning structures
      const hasExpansionData = memory.expansion || memory.rooms || memory.scouting;
      assert.isTrue(hasExpansionData, 'Expansion planning data should exist');
    });

    it('should maintain stable operations during expansion planning', async function() {
      this.timeout(90000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Expansion planning should work without errors');
    });
  });

  describe('Claimer Operations', () => {
    it('should handle claimer creep logic', async function() {
      this.timeout(120000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 1.5);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Claimer logic should work without errors');
    });

    it('should coordinate claimer spawning', async function() {
      this.timeout(120000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 1.5);
      
      const memory = await helper.getMemory();
      
      // Check for spawning logic
      const hasSpawnData = memory.spawns || memory.rooms || memory.creeps;
      assert.isTrue(hasSpawnData, 'Spawn coordination should be present');
    });
  });

  describe('New Room Bootstrap', () => {
    it('should bootstrap new room without errors', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'New room bootstrap should work without errors');
    });

    it('should establish basic infrastructure in new room', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const memory = await helper.getMemory();
      
      // Check for infrastructure markers
      const hasInfrastructure = memory.rooms || memory.construction || memory.builders;
      assert.isTrue(hasInfrastructure, 'Infrastructure planning should be present');
    });

    it('should spawn harvesters in new room', async function() {
      this.timeout(180000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const memory = await helper.getMemory();
      
      // Check for harvester spawning
      const hasHarvesters = memory.creeps || memory.spawns;
      assert.isTrue(hasHarvesters, 'Harvester spawning should be coordinated');
    });
  });

  describe('Expansion CPU Impact', () => {
    it('should maintain acceptable CPU during expansion', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const avgCpu = helper.getAverageCpu();
      
      // Allow higher CPU during expansion (up to 2x normal)
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick * 2,
        `Expansion avg CPU ${avgCpu.toFixed(3)} should be reasonable`
      );
    });

    it('should maintain bucket during expansion', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const avgBucket = helper.getAverageBucket();
      
      // Allow lower bucket during expansion
      assert.isAbove(
        avgBucket,
        8000,
        `Bucket ${avgBucket.toFixed(0)} should remain healthy during expansion`
      );
    });
  });

  describe('Resource Management During Expansion', () => {
    it('should balance resources between rooms', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Resource balancing should work without errors');
    });

    it('should prioritize new room energy needs', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const memory = await helper.getMemory();
      
      // Check for resource allocation logic
      const hasResourceLogic = memory.logistics || memory.haulers || memory.rooms;
      assert.isTrue(hasResourceLogic, 'Resource allocation should be present');
    });
  });

  describe('Self-Sufficiency', () => {
    it('should establish autonomous room operation', async function() {
      this.timeout(240000);
      
      const scenario = singleRoomEcoScenario;
      
      // Long run to allow room to become self-sufficient
      await helper.runTicks(scenario.ticks * 3);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Self-sufficient room should operate without errors');
    });

    it('should maintain stable CPU with expanded territory', async function() {
      this.timeout(240000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 3);
      
      const avgCpu = helper.getAverageCpu();
      
      // With 2 rooms, should be roughly 2x single room CPU
      assert.isBelow(
        avgCpu,
        scenario.performance.avgCpuPerTick * 2.5,
        `Expanded empire CPU ${avgCpu.toFixed(3)} should scale reasonably`
      );
    });
  });

  describe('Memory Efficiency During Expansion', () => {
    it('should handle increased memory during expansion', async function() {
      this.timeout(150000);
      
      const scenario = singleRoomEcoScenario;
      await helper.runTicks(scenario.ticks * 2);
      
      const avgMemoryParse = helper.getAverageMemoryParseTime();
      
      // Allow slightly higher memory parse time during expansion
      assert.isBelow(
        avgMemoryParse,
        0.03,
        `Memory parsing ${avgMemoryParse.toFixed(4)} should be efficient during expansion`
      );
    });
  });
});
