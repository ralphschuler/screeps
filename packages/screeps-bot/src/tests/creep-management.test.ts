/**
 * Creep Management Integration Tests
 * 
 * These tests validate creep lifecycle, roles, and behavior.
 */

import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('Creep Lifecycle', () => {
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

  it('should track creep hits and health', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.greaterThan(creep.hits, 0);
      Assert.greaterThan(creep.hitsMax, 0);
      Assert.lessThanOrEqual(creep.hits, creep.hitsMax);
    }
  });

  it('should have valid body parts', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.greaterThan(creep.body.length, 0, `Creep ${name} should have at least one body part`);
      
      for (const part of creep.body) {
        Assert.isNotNullish(part.type);
        Assert.isNotNullish(part.hits);
        Assert.greaterThan(part.hits, 0);
      }
    }
  });

  it('should track creep store capacity', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      if (creep.store) {
        const capacity = creep.store.getCapacity();
        const usedCapacity = creep.store.getUsedCapacity();
        
        Assert.greaterThanOrEqual(capacity || 0, 0);
        Assert.greaterThanOrEqual(usedCapacity, 0);
        Assert.lessThanOrEqual(usedCapacity, capacity || 0);
      }
    }
  });
});

describe('Creep Roles and Memory', () => {
  it('should assign roles to all creeps', () => {
    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      Assert.isNotNullish(
        creep.memory.role,
        `Creep ${creepName} should have a role assigned`
      );
    }
  });

  it('should assign rooms to creeps', () => {
    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      // Creeps should have a room assignment in memory
      Assert.isNotNullish(
        creep.memory.room,
        `Creep ${creepName} should have a room assigned`
      );
    }
  });

  it('should maintain working state', () => {
    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      // Working state should be defined (true or false)
      Assert.isType(
        typeof creep.memory.working,
        'boolean',
        `Creep ${creepName} should have working state defined`
      );
    }
  });
});

describe('Creep Spawning', () => {
  it('should track spawning creeps', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      if (creep.spawning) {
        // Spawning creeps should be in a spawn's room
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        Assert.greaterThan(spawns.length, 0, `Spawning creep ${name} should be in a room with spawns`);
      }
    }
  });

  it('should eventually complete spawning', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      if (creep.spawning && creep.ticksToLive) {
        // Spawning creeps should have full TTL or close to it
        Assert.greaterThan(creep.ticksToLive, 1400, `Spawning creep ${name} should have high TTL`);
      }
    }
  });
});

describe('Creep Movement and Position', () => {
  it('should have valid positions', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.isNotNullish(creep.pos);
      Assert.isType(creep.pos.x, 'number');
      Assert.isType(creep.pos.y, 'number');
      Assert.inRange(creep.pos.x, 0, 49);
      Assert.inRange(creep.pos.y, 0, 49);
      Assert.isNotNullish(creep.pos.roomName);
    }
  });

  it('should be in the correct room', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.equal(creep.pos.roomName, creep.room.name, `Creep ${name} position should match room`);
    }
  });
});

describe('Creep Age and Recycling', () => {
  it('should track ticksToLive', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      // Not all creeps have TTL (e.g., claimed controller rooms might have invader creeps)
      if (creep.ticksToLive) {
        Assert.greaterThan(creep.ticksToLive, 0, `Creep ${name} should have positive TTL`);
        Assert.lessThanOrEqual(creep.ticksToLive, 1500, `Creep ${name} TTL should not exceed max`);
      }
    }
  });

  it('should consider recycling near-death creeps', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      if (creep.ticksToLive && creep.ticksToLive < 50) {
        // Creeps near death might be recycling or have an exception
        // This is more of a logging test than an assertion
        const isRecycling = 'recycling' in creep.memory && creep.memory.recycling === true;
        console.log(`[Test] Creep ${name} has ${creep.ticksToLive} TTL, recycling: ${isRecycling}`);
      }
    }
  });
});

describe('Memory Synchronization', () => {
  it('should have consistent creep memory', () => {
    // All creeps in Game should have memory entries
    for (const name in Game.creeps) {
      Assert.isNotNullish(Memory.creeps[name], `Creep ${name} should have memory entry`);
    }
  });

  it('should have valid memory structure', () => {
    for (const name in Game.creeps) {
      const memory = Memory.creeps[name];
      Assert.isType(memory, 'object', `Creep ${name} memory should be an object`);
    }
  });
});

console.log('[Tests] Creep management tests registered');
