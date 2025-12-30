/**
 * Minimal Screeps Bot using Framework Packages
 * 
 * This example demonstrates how to build a simple but functional Screeps bot
 * using the @ralphschuler/screeps framework packages.
 * 
 * Features:
 * - Automated spawning with @ralphschuler/screeps-spawn
 * - Link network management with @ralphschuler/screeps-economy
 * - Basic economy with harvesters, haulers, and upgraders
 */

import { SpawnManager, SpawnRequest } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';

// Create spawn manager with default configuration
const spawnManager = new SpawnManager({
  debug: false, // Set to true for spawn debugging
  rolePriorities: {
    harvester: 100,
    hauler: 90,
    upgrader: 80,
    builder: 70
  }
});

/**
 * Main game loop
 */
export const loop = () => {
  // Clean up dead creep memory
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }

  // Process each owned room
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    
    // Skip rooms we don't own
    if (!room.controller?.my) continue;

    // Run room logic
    runRoom(room);
  }

  // Run creep logic
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    runCreep(creep);
  }
};

/**
 * Room management logic
 */
function runRoom(room: Room): void {
  // Handle spawning
  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length > 0) {
    const requests = buildSpawnRequests(room);
    spawnManager.processSpawnQueue(spawns, requests);
  }

  // Manage link network (RCL 5+)
  if (room.controller && room.controller.level >= 5) {
    const links = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_LINK
    });
    if (links.length > 0) {
      linkManager.run(room);
    }
  }

  // Visualize room info
  if (room.controller) {
    room.visual.text(
      `RCL ${room.controller.level} | Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}`,
      1,
      1,
      { align: 'left', font: 0.5 }
    );
  }
}

/**
 * Build spawn requests based on room needs
 */
function buildSpawnRequests(room: Room): SpawnRequest[] {
  const requests: SpawnRequest[] = [];
  
  // Count existing creeps by role
  const creeps = room.find(FIND_MY_CREEPS);
  const counts: Record<string, number> = {};
  for (const creep of creeps) {
    const role = creep.memory.role as string;
    counts[role] = (counts[role] || 0) + 1;
  }

  // Get energy sources
  const sources = room.find(FIND_SOURCES);
  const sourceCount = sources.length;

  // Determine spawn needs
  const needs: Array<{ role: string; count: number; priority: number }> = [
    { role: 'harvester', count: sourceCount * 2, priority: 100 },
    { role: 'hauler', count: Math.max(2, sourceCount), priority: 90 },
    { role: 'upgrader', count: 3, priority: 80 },
    { role: 'builder', count: 2, priority: 70 }
  ];

  // Create spawn requests for roles under target count
  for (const need of needs) {
    const current = counts[need.role] || 0;
    if (current < need.count) {
      requests.push({
        role: need.role,
        priority: need.priority,
        memory: {
          role: need.role,
          room: room.name,
          working: false
        }
      });
    }
  }

  return requests;
}

/**
 * Creep behavior logic
 */
function runCreep(creep: Creep): void {
  const role = creep.memory.role as string;

  switch (role) {
    case 'harvester':
      runHarvester(creep);
      break;
    case 'hauler':
      runHauler(creep);
      break;
    case 'upgrader':
      runUpgrader(creep);
      break;
    case 'builder':
      runBuilder(creep);
      break;
    default:
      console.log(`Unknown role: ${role} for creep ${creep.name}`);
  }
}

/**
 * Harvester: Harvests energy from sources
 */
function runHarvester(creep: Creep): void {
  const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  
  if (source) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }
}

/**
 * Hauler: Transfers energy from containers/dropped to storage/spawn
 */
function runHauler(creep: Creep): void {
  // Toggle working state
  if (creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  } else if (creep.store.getUsedCapacity() === 0) {
    creep.memory.working = false;
  }

  if (creep.memory.working) {
    // Deliver energy
    const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_EXTENSION) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });

    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      // If no spawn/extension needs energy, upgrade controller
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  } else {
    // Pickup energy
    const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY
    });

    if (droppedEnergy) {
      if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedEnergy, { visualizePathStyle: { stroke: '#ffff00' } });
      }
    } else {
      // If no dropped energy, harvest from source
      const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#ffff00' } });
        }
      }
    }
  }
}

/**
 * Upgrader: Upgrades room controller
 */
function runUpgrader(creep: Creep): void {
  // Toggle working state
  if (creep.store.getUsedCapacity() === 0) {
    creep.memory.working = false;
  } else if (creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }

  if (creep.memory.working) {
    // Upgrade controller
    if (creep.room.controller) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#00ff00' } });
      }
    }
  } else {
    // Get energy
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#00ff00' } });
      }
    }
  }
}

/**
 * Builder: Constructs buildings
 */
function runBuilder(creep: Creep): void {
  // Toggle working state
  if (creep.store.getUsedCapacity() === 0) {
    creep.memory.working = false;
  } else if (creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }

  if (creep.memory.working) {
    // Find construction sites
    const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (target) {
      if (creep.build(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#0000ff' } });
      }
    } else {
      // If no construction sites, repair structures
      const damagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
      });
      if (damagedStructure) {
        if (creep.repair(damagedStructure) === ERR_NOT_IN_RANGE) {
          creep.moveTo(damagedStructure, { visualizePathStyle: { stroke: '#0000ff' } });
        }
      } else {
        // If nothing to build/repair, upgrade controller
        if (creep.room.controller) {
          if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#0000ff' } });
          }
        }
      }
    }
  } else {
    // Get energy
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#0000ff' } });
      }
    }
  }
}
