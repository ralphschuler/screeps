/**
 * Remote Room Utilities
 *
 * Shared utility functions for remote mining operations.
 * Provides room analysis, distance calculation, and pathfinding callbacks.
 */

import { getActualHostileStructures, isHighwayRoom } from "@ralphschuler/screeps-core";
import type { ILogger } from "../types";

/**
 * Get list of remote rooms being mined by a home room.
 * Scans for creeps with remoteHarvester or remoteHauler roles assigned to this home room.
 * 
 * @param room - Home room
 * @returns Array of remote room names
 */
export function getRemoteRoomsForRoom(room: Room): string[] {
  const remoteRooms = new Set<string>();
  
  // Look for remote creeps assigned to this room
  for (const creep of Object.values(Game.creeps)) {
    // Type guard to safely access memory properties
    const memory = creep.memory as {
      role?: string;
      homeRoom?: string;
      targetRoom?: string;
    };
    
    // Check if this is a remote creep assigned to our room
    if ((memory.role === "remoteHarvester" || memory.role === "remoteHauler") &&
        memory.homeRoom === room.name &&
        memory.targetRoom &&
        memory.targetRoom !== room.name) {
      remoteRooms.add(memory.targetRoom);
    }
  }
  
  return Array.from(remoteRooms);
}

/**
 * Shared room callback for remote mining pathfinding.
 * Handles hostile structure avoidance, highway detection, and road preferencing.
 *
 * @param roomName - Room name being evaluated
 * @param logger - Optional logger for debugging
 * @returns Cost matrix or false to avoid the room
 */
export function getRemoteMiningRoomCallback(roomName: string, logger?: ILogger): CostMatrix | boolean {
  const room = Game.rooms[roomName];
  if (!room) {
    // Room not visible - allow pathfinding through it
    return true;
  }
  
  // Avoid rooms with hostile structures unless the room is a highway corridor.
  if (!isHighwayRoom(roomName)) {
    const hostileStructures = getActualHostileStructures(room).filter(
      s => s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_KEEPER_LAIR
    );
    
    if (hostileStructures.length > 0) {
      if (logger) {
        logger.debug(`Avoiding room ${roomName} with hostile structures`, {
          meta: { hostileCount: hostileStructures.length }
        });
      }
      // Avoid this room
      return false;
    }
  }
  
  // Create cost matrix preferring roads
  const costs = new PathFinder.CostMatrix();
  
  // Mark roads as cheaper
  const roads = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });
  
  for (const road of roads) {
    costs.set(road.pos.x, road.pos.y, 1);
  }
  
  // Mark creeps as obstacles (will be avoided in pathfinding)
  const creeps = room.find(FIND_CREEPS);
  for (const creep of creeps) {
    costs.set(creep.pos.x, creep.pos.y, 255);
  }
  
  return costs;
}
