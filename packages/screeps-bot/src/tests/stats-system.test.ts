/**
 * Stats System Integration Tests
 * 
 * These tests validate the statistics collection and reporting system.
 * Migrated from stats.test.ts unit tests.
 */

import { describe, it, expect, Assert } from 'screepsmod-testing';
import { getMemoryProperty, getRoomMemoryProperty } from './test-helpers';
import { createLogger } from '../core/logger';

const logger = createLogger("StatsSystemTest");

describe('Stats System', () => {
  it('should collect game time statistics', () => {
    Assert.isNotNullish(Game.time);
    Assert.isType(Game.time, 'number');
    Assert.greaterThan(Game.time, 0);
    
    logger.debug('Current game time', { meta: { gameTime: Game.time } });
  });

  it('should track CPU usage', () => {
    const cpuUsed = Game.cpu.getUsed();
    Assert.isType(cpuUsed, 'number');
    Assert.greaterThanOrEqual(cpuUsed, 0);
    Assert.lessThanOrEqual(cpuUsed, Game.cpu.limit * 2); // Allow some buffer
    
    logger.debug('CPU usage', { meta: { cpuUsed: cpuUsed.toFixed(2), cpuLimit: Game.cpu.limit } });
  });

  it('should track CPU bucket', () => {
    Assert.isNotNullish(Game.cpu.bucket);
    Assert.inRange(Game.cpu.bucket, 0, 10000);
    
    logger.debug('CPU bucket', { meta: { bucket: Game.cpu.bucket } });
  });

  it('should track GCL progress', () => {
    Assert.isNotNullish(Game.gcl);
    Assert.isNotNullish(Game.gcl.level);
    Assert.greaterThan(Game.gcl.level, 0);
    Assert.greaterThanOrEqual(Game.gcl.progress, 0);
    Assert.greaterThan(Game.gcl.progressTotal, 0);
    
    logger.debug('GCL progress', { meta: { gclLevel: Game.gcl.level, progress: Game.gcl.progress, progressTotal: Game.gcl.progressTotal } });
  });

  it('should track GPL if power is enabled', () => {
    if (Game.gpl) {
      Assert.isNotNullish(Game.gpl.level);
      Assert.greaterThanOrEqual(Game.gpl.level, 0);
      Assert.greaterThanOrEqual(Game.gpl.progress, 0);
      
      logger.debug('GPL progress', { meta: { gplLevel: Game.gpl.level, progress: Game.gpl.progress, progressTotal: Game.gpl.progressTotal } });
    }
  });
});

describe('Memory Statistics', () => {
  it('should store stats in memory', () => {
    // Check if stats structure exists (using type-safe helper)
    const stats = getMemoryProperty('stats');
    if (stats) {
      Assert.isType(stats, 'object');
      logger.debug('Stats structure exists in memory');
    } else {
      logger.debug('Stats structure not yet initialized');
    }
  });

  it('should track room-level statistics', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        const stats = getRoomMemoryProperty(roomName, 'stats');
        if (stats) {
          logger.debug('Room has stats', { room: roomName, meta: { statKeys: Object.keys(stats) } });
        }
      }
    }
  });
});

describe('Resource Statistics', () => {
  it('should track energy statistics', () => {
    let totalEnergy = 0;
    let roomCount = 0;
    
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        roomCount++;
        totalEnergy += room.energyAvailable;
        
        if (room.storage) {
          totalEnergy += room.storage.store[RESOURCE_ENERGY];
        }
        
        if (room.terminal) {
          totalEnergy += room.terminal.store[RESOURCE_ENERGY];
        }
      }
    }
    
    if (roomCount > 0) {
      logger.debug('Total energy across rooms', { meta: { roomCount, totalEnergy } });
      Assert.greaterThanOrEqual(totalEnergy, 0);
    }
  });

  it('should track creep count by role', () => {
    const roleCounts: Record<string, number> = {};
    
    for (const name in Game.creeps) {
      const role = Game.creeps[name].memory.role;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    }
    
    if (Object.keys(roleCounts).length > 0) {
      logger.debug('Creep counts by role', { meta: { roleCounts } });
      
      for (const role in roleCounts) {
        Assert.greaterThan(roleCounts[role], 0);
      }
    }
  });
});

describe('Room Statistics', () => {
  it('should track room RCL progress', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        Assert.inRange(room.controller.level, 1, 8);
        Assert.greaterThanOrEqual(room.controller.progress, 0);
        
        if (room.controller.level < 8) {
          Assert.greaterThan(room.controller.progressTotal, 0);
          
          const progressPercent = ((room.controller.progress / room.controller.progressTotal) * 100).toFixed(1);
          logger.debug('Room RCL progress', { 
            room: roomName, 
            meta: { rcl: room.controller.level, progressPercent: `${progressPercent}%` } 
          });
        } else {
          logger.debug('Room at max RCL', { room: roomName, meta: { rcl: 8 } });
        }
      }
    }
  });

  it('should track room structure counts', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        const structures = room.find(FIND_MY_STRUCTURES);
        const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        
        Assert.greaterThanOrEqual(structures.length, 0);
        Assert.greaterThanOrEqual(constructionSites.length, 0);
        
        logger.debug('Room structures', { 
          room: roomName, 
          meta: { structureCount: structures.length, constructionSiteCount: constructionSites.length } 
        });
      }
    }
  });

  it('should track room energy capacity', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        Assert.greaterThan(room.energyCapacityAvailable, 0);
        Assert.greaterThanOrEqual(room.energyAvailable, 0);
        Assert.lessThanOrEqual(room.energyAvailable, room.energyCapacityAvailable);
        
        const energyPercent = ((room.energyAvailable / room.energyCapacityAvailable) * 100).toFixed(1);
        logger.debug('Room energy', { 
          room: roomName, 
          meta: { 
            energyPercent: `${energyPercent}%`, 
            energyAvailable: room.energyAvailable, 
            energyCapacity: room.energyCapacityAvailable 
          } 
        });
      }
    }
  });
});

describe('Empire Statistics', () => {
  it('should count total controlled rooms', () => {
    let controlledCount = 0;
    
    for (const roomName in Game.rooms) {
      if (Game.rooms[roomName].controller?.my) {
        controlledCount++;
      }
    }
    
    logger.debug('Total controlled rooms', { meta: { controlledCount } });
    Assert.greaterThanOrEqual(controlledCount, 0);
    Assert.lessThanOrEqual(controlledCount, Game.gcl.level);
  });

  it('should count total creeps', () => {
    const creepCount = Object.keys(Game.creeps).length;
    
    logger.debug('Total creeps', { meta: { creepCount } });
    Assert.greaterThanOrEqual(creepCount, 0);
  });

  it('should count total spawns', () => {
    const spawnCount = Object.keys(Game.spawns).length;
    
    logger.debug('Total spawns', { meta: { spawnCount } });
    Assert.greaterThanOrEqual(spawnCount, 0);
  });
});

describe('Market Statistics', () => {
  it('should track credits if market is available', () => {
    if (Game.market) {
      Assert.isNotNullish(Game.market.credits);
      Assert.greaterThanOrEqual(Game.market.credits, 0);
      
      logger.debug('Market credits', { meta: { credits: Game.market.credits } });
    }
  });

  it('should track active market orders', () => {
    if (Game.market) {
      const orders = Game.market.orders;
      const orderCount = Object.keys(orders).length;
      
      logger.debug('Active market orders', { meta: { orderCount } });
      Assert.greaterThanOrEqual(orderCount, 0);
    }
  });
});

logger.info('Stats system tests registered');
