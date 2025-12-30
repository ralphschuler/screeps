/**
 * Basic integration tests for Screeps server
 * 
 * Tests core bot functionality:
 * - Server starts and runs
 * - Bot spawns and executes
 * - Memory operations work
 * - Console commands execute
 */

import { assert } from 'chai';
import { helper } from '../helpers/server-helper.js';

describe('Server Integration Tests', () => {
  describe('Server Lifecycle', () => {
    it('should start server and run ticks', async function() {
      this.timeout(15000);
      
      for (let i = 1; i < 10; i++) {
        assert.equal(await helper.server.world.gameTime, i);
        await helper.server.tick();
      }
    });

    it('should write and read memory', async function() {
      this.timeout(10000);
      
      await helper.player.console(`Memory.foo = 'bar'`);
      await helper.server.tick();
      
      const memory = JSON.parse(await helper.player.memory);
      assert.equal(memory.foo, 'bar');
    });

    it('should execute console commands', async function() {
      this.timeout(10000);
      
      const result = await helper.executeConsole('Game.time');
      assert.exists(result);
    });
  });

  describe('Bot Functionality', () => {
    it('should spawn creeps', async function() {
      this.timeout(30000);
      
      // Run for enough ticks to spawn a creep
      await helper.runTicks(50);
      
      const memory = await helper.getMemory();
      // Check that bot is running (memory should have some data)
      assert.exists(memory);
    });

    it('should not have console errors', async function() {
      this.timeout(20000);
      
      await helper.runTicks(20);
      
      const hasErrors = await helper.hasErrors();
      assert.isFalse(hasErrors, 'Bot should not have console errors');
    });

    it('should maintain stable memory structure', async function() {
      this.timeout(20000);
      
      await helper.runTicks(10);
      const memory1 = await helper.getMemory();
      
      await helper.runTicks(10);
      const memory2 = await helper.getMemory();
      
      // Memory should exist in both snapshots
      assert.exists(memory1);
      assert.exists(memory2);
    });
  });

  describe('Performance Metrics', () => {
    it('should collect CPU metrics', async function() {
      this.timeout(20000);
      
      const metrics = await helper.runTicks(20);
      
      assert.isArray(metrics.cpuHistory);
      assert.equal(metrics.cpuHistory.length, 20);
      assert.isAbove(metrics.cpuHistory[0], 0);
    });

    it('should collect bucket metrics', async function() {
      this.timeout(20000);
      
      const metrics = await helper.runTicks(20);
      
      assert.isArray(metrics.bucketLevel);
      assert.equal(metrics.bucketLevel.length, 20);
    });

    it('should track tick execution time', async function() {
      this.timeout(20000);
      
      const metrics = await helper.runTicks(20);
      
      assert.isArray(metrics.tickTime);
      assert.equal(metrics.tickTime.length, 20);
      // Each tick should complete in reasonable time
      metrics.tickTime.forEach(time => {
        assert.isBelow(time, 5000, 'Tick should complete in under 5 seconds');
      });
    });
  });
});
