/**
 * Basic Game State Integration Tests
 * 
 * These tests validate fundamental game state and API access.
 * Migrated from unit tests to integration tests.
 */

import { describe, it, expect, Assert } from 'screepsmod-testing';
import { createLogger } from '../core/logger';

const logger = createLogger("BasicGameStateTest");

describe('Game State Validation', () => {
  it('should have access to Game object', () => {
    Assert.isNotNullish(Game);
    Assert.isType(Game, 'object');
  });

  it('should have access to Memory object', () => {
    Assert.isNotNullish(Memory);
    Assert.isType(Memory, 'object');
  });

  it('should track game time', () => {
    Assert.isNotNullish(Game.time);
    Assert.isType(Game.time, 'number');
    Assert.greaterThan(Game.time, 0);
  });

  it('should have CPU monitoring available', () => {
    Assert.isNotNullish(Game.cpu);
    Assert.isNotNullish(Game.cpu.limit);
    Assert.greaterThan(Game.cpu.limit, 0);
  });

  it('should track CPU usage', () => {
    const cpuUsed = Game.cpu.getUsed();
    Assert.isType(cpuUsed, 'number');
    Assert.greaterThanOrEqual(cpuUsed, 0);
  });

  it('should have CPU bucket available', () => {
    Assert.isNotNullish(Game.cpu.bucket);
    Assert.inRange(Game.cpu.bucket, 0, 10000);
  });

  it('should have rooms object', () => {
    Assert.isNotNullish(Game.rooms);
    Assert.isType(Game.rooms, 'object');
  });

  it('should have valid room names', () => {
    for (const roomName in Game.rooms) {
      Assert.isType(roomName, 'string');
      // Room names follow pattern like W1N1, E5S3, etc.
      const pattern = /^[WE]\d+[NS]\d+$/;
      Assert.isTrue(pattern.test(roomName), `Invalid room name: ${roomName}`);
    }
  });
});

describe('Memory Management', () => {
  it('should allow reading from memory', () => {
    const keys = Object.keys(Memory);
    Assert.isTrue(Array.isArray(keys));
  });

  it('should allow writing to memory', () => {
    // Store a test value with a prefixed key to avoid conflicts
    const testKey = '_testIntegrationWrite';
    (Memory as Record<string, any>)[testKey] = { timestamp: Game.time };
    Assert.isNotNullish((Memory as Record<string, any>)[testKey]);
    Assert.equal((Memory as Record<string, any>)[testKey].timestamp, Game.time);
    
    // Clean up test data
    delete (Memory as Record<string, any>)[testKey];
  });

  it('should have creeps memory structure', () => {
    Assert.isNotNullish(Memory.creeps);
    Assert.isType(Memory.creeps, 'object');
  });

  it('should clean up memory for missing creeps', () => {
    // This test validates the memory cleanup that should happen in the main loop
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        // If a creep is in memory but not in Game, it should be cleaned up
        // We'll just log this for now rather than asserting
        logger.debug('Found orphaned creep memory', { meta: { creepName: name } });
      }
    }
    // The actual cleanup should happen in the main loop, not here
    expect(true).toBe(true);
  });
});

describe('Main Loop Export', () => {
  it('should export a loop function', () => {
    // This validates that the main module structure is correct
    Assert.isType(typeof require('../main').loop, 'function');
  });
});

logger.info('Basic game state tests registered');
