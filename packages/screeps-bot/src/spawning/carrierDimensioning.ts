/**
 * Carrier Dimensioning
 *
 * Dynamically calculates optimal hauler/carrier body size based on:
 * - Distance to energy sources
 * - Energy production rate
 * - Available energy capacity
 * - Road infrastructure
 *
 * Addresses Issue: #15
 */

import type { BodyTemplate } from "../logic/spawn";
import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("CarrierDimensioning");

/**
 * Calculate optimal carrier size for a route
 */
export function calculateOptimalCarrierSize(
  distance: number,
  energyPerTick: number,
  maxEnergy: number,
  hasRoads = false
): BodyTemplate {
  // Base movement cost (1 tick per tile without roads, 0.5 with roads)
  const movementCost = hasRoads ? 0.5 : 1.0;
  
  // Round trip time in ticks
  const roundTripTime = distance * 2 * movementCost;
  
  // Energy needed to sustain production during round trip
  const energyNeeded = energyPerTick * roundTripTime;
  
  // Calculate CARRY parts needed (50 energy per CARRY)
  let carryParts = Math.ceil(energyNeeded / 50);
  
  // Minimum 2 CARRY parts
  carryParts = Math.max(2, carryParts);
  
  // Calculate MOVE parts (1 MOVE per 2 CARRY for roads, 1:1 without)
  const moveParts = hasRoads ? Math.ceil(carryParts / 2) : carryParts;
  
  // Build body parts array
  const parts: BodyPartConstant[] = [];
  
  // Add CARRY parts
  for (let i = 0; i < carryParts; i++) {
    parts.push(CARRY);
  }
  
  // Add MOVE parts
  for (let i = 0; i < moveParts; i++) {
    parts.push(MOVE);
  }
  
  // Calculate cost
  const cost = carryParts * 50 + moveParts * 50;
  
  // Cap at max energy
  if (cost > maxEnergy) {
    // Scale down proportionally
    const scale = maxEnergy / cost;
    const scaledCarry = Math.max(2, Math.floor(carryParts * scale));
    const scaledMove = hasRoads ? Math.ceil(scaledCarry / 2) : scaledCarry;
    
    const scaledParts: BodyPartConstant[] = [];
    for (let i = 0; i < scaledCarry; i++) {
      scaledParts.push(CARRY);
    }
    for (let i = 0; i < scaledMove; i++) {
      scaledParts.push(MOVE);
    }
    
    return {
      parts: scaledParts,
      cost: scaledCarry * 50 + scaledMove * 50,
      minCapacity: scaledCarry * 50 + scaledMove * 50
    };
  }
  
  return {
    parts,
    cost,
    minCapacity: cost
  };
}

/**
 * Calculate distance with road consideration
 */
export function calculateEffectiveDistance(path: RoomPosition[]): { distance: number; hasRoads: boolean } {
  let roadTiles = 0;
  const totalTiles = path.length;
  
  for (const pos of path) {
    const room = Game.rooms[pos.roomName];
    if (!room) continue;
    
    const structures = pos.lookFor(LOOK_STRUCTURES);
    if (structures.some(s => s.structureType === STRUCTURE_ROAD)) {
      roadTiles++;
    }
  }
  
  const hasRoads = roadTiles > totalTiles * 0.5; // More than 50% roads
  
  return {
    distance: totalTiles,
    hasRoads
  };
}

/**
 * Get optimal hauler body for source
 */
export function getOptimalHaulerBody(
  sourcePos: RoomPosition,
  storagePos: RoomPosition,
  energyCapacity: number
): BodyTemplate {
  // Calculate path distance using room-local pathfinder
  // Note: findPathTo only works within a single room, so sourcePos.roomName is correct
  const path = sourcePos.findPathTo(storagePos, {
    ignoreCreeps: true,
    range: 1
  });
  
  const { distance, hasRoads } = calculateEffectiveDistance(path
    .filter(p => typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y))
    .map(p => new RoomPosition(p.x, p.y, sourcePos.roomName)
  ));
  
  // Assume 10 energy/tick from source (conservative estimate)
  const energyPerTick = 10;
  
  return calculateOptimalCarrierSize(distance, energyPerTick, energyCapacity, hasRoads);
}

/**
 * Get optimal remote hauler body
 */
export function getOptimalRemoteHaulerBody(
  remoteRoomName: string,
  homeRoomName: string,
  energyCapacity: number
): BodyTemplate {
  // Estimate distance between rooms (linear distance * 50)
  const linearDist = Game.map.getRoomLinearDistance(remoteRoomName, homeRoomName);
  const estimatedDistance = linearDist * 50;
  
  // Remote mining typically produces 10 energy/tick per source
  const energyPerTick = 10;
  
  // Assume no roads for remote mining initially
  const hasRoads = false;
  
  return calculateOptimalCarrierSize(estimatedDistance, energyPerTick, energyCapacity, hasRoads);
}

/**
 * Generate hauler body templates for different energy levels
 */
export function generateHaulerBodies(): BodyTemplate[] {
  const bodies: BodyTemplate[] = [];
  
  // Small hauler (300 energy)
  bodies.push({
    parts: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
    cost: 300,
    minCapacity: 300
  });
  
  // Medium hauler (600 energy)
  bodies.push({
    parts: [
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
    ],
    cost: 600,
    minCapacity: 600
  });
  
  // Large hauler (1000 energy)
  bodies.push({
    parts: [
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
    ],
    cost: 1000,
    minCapacity: 1000
  });
  
  // Extra large hauler (1500 energy)
  bodies.push({
    parts: [
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      MOVE, MOVE, MOVE, MOVE, MOVE
    ],
    cost: 1500,
    minCapacity: 1500
  });
  
  return bodies;
}
