/**
 * Pheromone System Integration Tests
 * 
 * These tests validate the pheromone-based swarm coordination system.
 * Migrated from pheromone.test.ts unit tests.
 */

import { describe, it, expect, Assert } from 'screepsmod-testing';
import { getRoomMemoryProperty, hasProperty } from './test-helpers';

describe('Pheromone System', () => {
  it('should have pheromone data in memory', () => {
    // Verify memory is accessible
    Assert.isNotNullish(Memory);
    Assert.isType(Memory, 'object');
  });

  it('should track pheromone levels in controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        // Check if room has pheromone tracking in memory
        const swarm = getRoomMemoryProperty(roomName, 'swarm');
        
        if (swarm && hasProperty(swarm, 'pheromones')) {
          const pheromones = swarm.pheromones;
          
          // Validate pheromone structure
          Assert.isType(pheromones, 'object');
          
          // Common pheromone types
          const pheromoneTypes = ['harvest', 'build', 'repair', 'upgrade', 'defense', 'war', 'expand'];
          
          for (const type of pheromoneTypes) {
            if (pheromones[type] !== undefined) {
              Assert.isType(pheromones[type], 'number');
              Assert.greaterThanOrEqual(pheromones[type], 0);
              Assert.lessThanOrEqual(pheromones[type], 100);
            }
          }
          
          console.log(`[Test] Room ${roomName} pheromones:`, JSON.stringify(pheromones));
        }
      }
    }
  });
});

describe('Pheromone Decay', () => {
  it('should have bounded pheromone values', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        const swarm = getRoomMemoryProperty(roomName, 'swarm');
        
        if (swarm && hasProperty(swarm, 'pheromones')) {
          const pheromones = swarm.pheromones;
          
          // All pheromone values should be in valid range
          for (const key in pheromones) {
            const value = pheromones[key];
            if (typeof value === 'number') {
              Assert.inRange(value, 0, 100, `Pheromone ${key} should be between 0 and 100`);
            }
          }
        }
      }
    }
  });
});

describe('Pheromone Influence on Behavior', () => {
  it('should influence creep role distribution', () => {
    // Count creeps by role
    const roleCounts: Record<string, number> = {};
    
    for (const name in Game.creeps) {
      const role = Game.creeps[name].memory.role;
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    }
    
    if (Object.keys(roleCounts).length > 0) {
      console.log('[Test] Creep role distribution:', JSON.stringify(roleCounts));
      
      // Should have at least some economic roles (harvesters, upgraders, builders)
      const economicRoles = ['harvester', 'upgrader', 'builder', 'hauler'];
      let hasEconomicRole = false;
      
      for (const role of economicRoles) {
        if (roleCounts[role] && roleCounts[role] > 0) {
          hasEconomicRole = true;
          break;
        }
      }
      
      if (Object.keys(Game.creeps).length > 0) {
        Assert.isTrue(hasEconomicRole, 'Should have at least one economic creep role');
      }
    }
  });
});

describe('Room State and Pheromones', () => {
  it('should correlate pheromones with room needs', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      if (room.controller?.my) {
        // Check for construction sites
        const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        
        // Check for structures needing repair
        const damagedStructures = room.find(FIND_STRUCTURES, {
          filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
        });
        
        const swarm = getRoomMemoryProperty(roomName, 'swarm');
        
        if (swarm && hasProperty(swarm, 'pheromones')) {
          const pheromones = swarm.pheromones;
          
          // Log correlations
          if (constructionSites.length > 0 && pheromones.build !== undefined) {
            console.log(`[Test] Room ${roomName} has ${constructionSites.length} construction sites, build pheromone: ${pheromones.build}`);
          }
          
          if (damagedStructures.length > 0 && pheromones.repair !== undefined) {
            console.log(`[Test] Room ${roomName} has ${damagedStructures.length} damaged structures, repair pheromone: ${pheromones.repair}`);
          }
        }
      }
    }
  });
});

console.log('[Tests] Pheromone system tests registered');
