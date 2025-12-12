/**
 * Spawn System Integration Tests
 * 
 * These tests validate spawn management and creep spawning logic.
 */

import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('Spawn Management', () => {
  it('should have spawns object', () => {
    Assert.isNotNullish(Game.spawns);
    Assert.isType(Game.spawns, 'object');
  });

  it('should have spawns in controlled rooms', () => {
    const spawnCount = Object.keys(Game.spawns).length;
    const controlledRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    if (controlledRooms.length > 0) {
      // If we have controlled rooms at RCL 1+, we should have spawns
      const roomsWithSpawnCapability = controlledRooms.filter(r => r.controller!.level >= 1);
      if (roomsWithSpawnCapability.length > 0 && Game.time > 50) {
        Assert.greaterThan(spawnCount, 0, 'Should have at least one spawn in controlled rooms');
      }
    }
  });

  it('should track spawning status', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      Assert.isNotNullish(spawn.spawning);
      
      if (spawn.spawning) {
        Assert.isType(spawn.spawning, 'object');
        Assert.isNotNullish(spawn.spawning.name);
        Assert.greaterThan(spawn.spawning.remainingTime, 0);
      }
    }
  });

  it('should have spawns with valid energy capacity', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      Assert.isNotNullish(spawn.store);
      Assert.greaterThanOrEqual(spawn.store.getCapacity(RESOURCE_ENERGY) || 0, 300);
    }
  });

  it('should have spawns in rooms they control', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      const room = spawn.room;
      
      Assert.isNotNullish(room);
      Assert.isNotNullish(room.controller);
      Assert.isTrue(room.controller!.my, `Spawn ${name} should be in a controlled room`);
    }
  });
});

describe('Spawn Room Context', () => {
  it('should have spawns in rooms with sources', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      const sources = spawn.room.find(FIND_SOURCES);
      
      Assert.greaterThan(sources.length, 0, `Room ${spawn.room.name} should have at least one source`);
    }
  });

  it('should track room controller progress', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      const controller = spawn.room.controller;
      
      if (controller?.my) {
        Assert.isNotNullish(controller.level);
        Assert.inRange(controller.level, 1, 8);
        Assert.greaterThanOrEqual(controller.progress, 0);
        
        if (controller.level < 8) {
          Assert.greaterThan(controller.progressTotal, 0);
        }
      }
    }
  });
});

describe('Controlled Rooms', () => {
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
    
    console.log(`[Test] Found ${controlledCount} controlled rooms`);
  });

  it('should have valid structures in controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        const structures = room.find(FIND_MY_STRUCTURES);
        
        // Every controlled room should have at least a spawn (eventually)
        if (room.controller.level >= 1 && Game.time > 50) {
          Assert.greaterThan(structures.length, 0, `Room ${roomName} should have structures`);
        }
      }
    }
  });
});

console.log('[Tests] Spawn system tests registered');
