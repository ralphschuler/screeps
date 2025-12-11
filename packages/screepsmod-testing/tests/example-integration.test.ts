/**
 * Example integration test file
 * 
 * This file demonstrates how to write tests that will run inside the Screeps server.
 * To use these tests, import this file from your bot's main code or initialization.
 */

import { describe, it, beforeEach, expect, Assert } from '../src/index';

// Example test suite that validates basic game state
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
});

// Example test suite for CPU monitoring
describe('CPU Performance', () => {
  it('should have CPU limit defined', () => {
    Assert.isNotNullish(Game.cpu);
    Assert.isNotNullish(Game.cpu.limit);
    Assert.greaterThan(Game.cpu.limit, 0);
  });

  it('should track CPU usage', () => {
    const cpuUsed = Game.cpu.getUsed();
    Assert.isType(cpuUsed, 'number');
    Assert.greaterThan(cpuUsed, 0);
  });

  it('should have CPU bucket available', () => {
    Assert.isNotNullish(Game.cpu.bucket);
    Assert.inRange(Game.cpu.bucket, 0, 10000);
  });
});

// Example test suite for room management
describe('Room Management', () => {
  it('should have rooms object', () => {
    Assert.isNotNullish(Game.rooms);
    Assert.isType(Game.rooms, 'object');
  });

  it('should track controlled rooms', () => {
    let controlledCount = 0;
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        controlledCount++;
        Assert.greaterThan(room.controller.level, 0);
        Assert.inRange(room.controller.level, 1, 8);
      }
    }
    // Note: This might be 0 in very early game
    console.log(`[Test] Found ${controlledCount} controlled rooms`);
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

// Example test suite for spawn management
describe('Spawn Management', () => {
  it('should have spawns object', () => {
    Assert.isNotNullish(Game.spawns);
    Assert.isType(Game.spawns, 'object');
  });

  it('should have spawns in controlled rooms', () => {
    const spawnCount = Object.keys(Game.spawns).length;
    const controlledRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    if (controlledRooms.length > 0) {
      // If we have controlled rooms, we should eventually have spawns
      // (may not be true in first few ticks)
      if (Game.time > 50) {
        Assert.greaterThan(spawnCount, 0, 'Should have at least one spawn');
      }
    }
  });

  it('should track spawning status', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      Assert.isNotNullish(spawn.spawning);
      // spawning is either null or an object
      if (spawn.spawning) {
        Assert.isType(spawn.spawning, 'object');
        Assert.isNotNullish(spawn.spawning.name);
        Assert.greaterThan(spawn.spawning.remainingTime, 0);
      }
    }
  });
});

// Example test suite for creep management
describe('Creep Management', () => {
  it('should have creeps object', () => {
    Assert.isNotNullish(Game.creeps);
    Assert.isType(Game.creeps, 'object');
  });

  it('should have valid creep properties', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.isNotNullish(creep.name);
      Assert.isNotNullish(creep.body);
      Assert.isNotNullish(creep.memory);
      Assert.isNotNullish(creep.room);
      Assert.isTrue(Array.isArray(creep.body));
    }
  });

  it('should track creep hits', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.greaterThan(creep.hits, 0);
      Assert.greaterThan(creep.hitsMax, 0);
      Assert.lessThan(creep.hits, creep.hitsMax + 1);
    }
  });
});

// Example test suite for memory management
describe('Memory Management', () => {
  it('should allow reading from memory', () => {
    // Memory should be readable
    const keys = Object.keys(Memory);
    Assert.isTrue(Array.isArray(keys));
  });

  it('should allow writing to memory', () => {
    // Store a test value
    Memory.test = { timestamp: Game.time };
    Assert.isNotNullish(Memory.test);
    Assert.equal(Memory.test.timestamp, Game.time);
  });

  it('should persist memory across ticks', () => {
    // Initialize test data if not exists
    if (!Memory.testPersistence) {
      Memory.testPersistence = {
        createdAt: Game.time,
        counter: 0
      };
    }
    
    // Increment counter
    Memory.testPersistence.counter++;
    
    Assert.greaterThan(Memory.testPersistence.counter, 0);
    Assert.lessThan(Memory.testPersistence.createdAt, Game.time + 1);
  });
});

// Example test suite with lifecycle hooks
describe('Lifecycle Hooks Example', () => {
  let testCounter: number;

  beforeEach(() => {
    testCounter = 0;
  });

  it('should initialize test data', () => {
    expect(testCounter).toBe(0);
  });

  it('should have independent state', () => {
    testCounter = 42;
    expect(testCounter).toBe(42);
  });

  it('should reset between tests', () => {
    expect(testCounter).toBe(0);
  });
});

console.log('[screepsmod-testing] Example integration tests registered');
