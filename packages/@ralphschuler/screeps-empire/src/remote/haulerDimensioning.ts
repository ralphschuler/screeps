/**
 * Remote Hauler Dimensioning
 *
 * Calculates optimal number and size of haulers for remote mining operations.
 * Takes into account:
 * - Distance from home room to remote room
 * - Number of sources in remote room
 * - Energy generation rate per source
 * - Path terrain (plains vs swamp)
 *
 * Addresses remote mining gaps from Issue: Remote Mining
 */

import { logger } from "@ralphschuler/screeps-core";

/**
 * Source energy generation constants
 * 
 * ASSUMPTION: Remote harvesters are assumed to have 5 WORK parts, harvesting at maximum
 * efficiency (2 energy per WORK per tick = 10 energy/tick per source).
 * If actual harvesters have fewer WORK parts, actual energy generation will be lower.
 */
const ENERGY_PER_SOURCE_TICK = 10; // Assumes 5 WORK parts (optimal harvester)

/**
 * Hauler energy calculation
 */
interface HaulerCapacity {
  /** Carry parts in the hauler */
  carryParts: number;
  /** Energy capacity (50 per CARRY part) */
  capacity: number;
  /** Move parts (should equal carry parts for 1:1 ratio) */
  moveParts: number;
  /** Body cost in energy */
  cost: number;
}

/**
 * Constants for hauler dimensioning
 */
const HAULER_SAFETY_BUFFER = 1.2; // 20% buffer for safety margin
const TILES_PER_ROOM = 50; // Average tiles to traverse per room (diagonal movement estimate)

/**
 * Remote hauler requirement calculation result
 */
export interface RemoteHaulerRequirement {
  /** Minimum number of haulers needed */
  minHaulers: number;
  /** Recommended number of haulers for efficiency */
  recommendedHaulers: number;
  /** Recommended hauler body configuration */
  haulerConfig: HaulerCapacity;
  /** Distance in rooms */
  distance: number;
  /** Round trip ticks */
  roundTripTicks: number;
  /** Energy generation per tick for all sources */
  energyPerTick: number;
}

/**
 * Standard hauler configurations by tier
 */
export const HAULER_TIERS: HaulerCapacity[] = [
  // Tier 1: Small hauler (400 energy)
  {
    carryParts: 4,
    capacity: 200,
    moveParts: 4,
    cost: 400
  },
  // Tier 2: Medium hauler (800 energy)
  {
    carryParts: 8,
    capacity: 400,
    moveParts: 8,
    cost: 800
  },
  // Tier 3: Large hauler (1600 energy)
  {
    carryParts: 16,
    capacity: 800,
    moveParts: 16,
    cost: 1600
  },
  // Tier 4: Mega hauler (2400 energy) - for very long distances
  {
    carryParts: 24,
    capacity: 1200,
    moveParts: 24,
    cost: 2400
  }
];

/**
 * Calculate path distance between two rooms
 */
export function calculatePathDistance(fromRoom: string, toRoom: string): number {
  // Simple room distance calculation
  // Parse room names (e.g., "E1N1", "W2S3")
  const parseRoom = (roomName: string): { x: number; y: number } => {
    const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
    if (!match) return { x: 0, y: 0 };

    const x = match[1] === "W" ? -parseInt(match[2], 10) : parseInt(match[2], 10);
    const y = match[3] === "N" ? parseInt(match[4], 10) : -parseInt(match[4], 10);

    return { x, y };
  };

  const from = parseRoom(fromRoom);
  const to = parseRoom(toRoom);

  // Manhattan distance in rooms
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

/**
 * Estimate round trip ticks for a hauler
 */
export function estimateRoundTripTicks(distance: number, terrainFactor = 1.2): number {
  // Base movement: 1 tile per tick with 1:1 MOVE:CARRY ratio
  // Terrain factor accounts for swamps (1.0 = all plains, 1.5 = all swamps, 1.2 = mixed)
  const onewayTicks = distance * TILES_PER_ROOM * terrainFactor;

  // Round trip
  return Math.ceil(onewayTicks * 2);
}

/**
 * Calculate optimal hauler configuration for a remote room
 */
export function calculateRemoteHaulerRequirement(
  homeRoom: string,
  remoteRoom: string,
  sourceCount: number,
  availableEnergy: number
): RemoteHaulerRequirement {
  // Calculate distance
  const distance = calculatePathDistance(homeRoom, remoteRoom);

  // Estimate round trip time (assuming mixed terrain)
  const roundTripTicks = estimateRoundTripTicks(distance);

  // Calculate energy generation rate for all sources
  const energyPerTick = sourceCount * ENERGY_PER_SOURCE_TICK;

  // Select appropriate hauler size based on available energy
  let haulerConfig = HAULER_TIERS[0];
  for (const tier of HAULER_TIERS) {
    if (tier.cost <= availableEnergy) {
      haulerConfig = tier;
    } else {
      break;
    }
  }

  // Calculate minimum haulers needed to keep up with energy generation
  // Energy generated during round trip
  const energyGeneratedPerTrip = energyPerTick * roundTripTicks;

  // Minimum haulers = energy generated per trip / hauler capacity
  // Add safety buffer for reliability
  const minHaulers = Math.max(1, Math.ceil((energyGeneratedPerTrip / haulerConfig.capacity) * HAULER_SAFETY_BUFFER));

  // Recommended haulers = add one extra for reliability
  const recommendedHaulers = Math.min(sourceCount * 2, minHaulers + 1);

  logger.debug(
    `Remote hauler calculation: ${homeRoom} -> ${remoteRoom} (${sourceCount} sources, ${distance} rooms away) - RT: ${roundTripTicks} ticks, E/tick: ${energyPerTick}, Min: ${minHaulers}, Rec: ${recommendedHaulers}, Cap: ${haulerConfig.capacity}`,
    { subsystem: "HaulerDimensioning" }
  );

  return {
    minHaulers,
    recommendedHaulers,
    haulerConfig,
    distance,
    roundTripTicks,
    energyPerTick
  };
}

/**
 * Get current hauler count for a remote room
 */
export function getCurrentRemoteHaulerCount(homeRoom: string, remoteRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as { role?: string; homeRoom?: string; targetRoom?: string };
    if (memory.role === "remoteHauler" && memory.homeRoom === homeRoom && memory.targetRoom === remoteRoom) {
      count++;
    }
  }
  return count;
}

/**
 * Check if more haulers are needed for a remote room
 */
export function needsMoreHaulers(homeRoom: string, remoteRoom: string, sourceCount: number, availableEnergy: number): boolean {
  const requirement = calculateRemoteHaulerRequirement(homeRoom, remoteRoom, sourceCount, availableEnergy);
  const currentCount = getCurrentRemoteHaulerCount(homeRoom, remoteRoom);

  return currentCount < requirement.recommendedHaulers;
}

/**
 * Get recommended hauler body for a remote room
 */
export function getRecommendedHaulerBody(homeRoom: string, remoteRoom: string, sourceCount: number, availableEnergy: number): BodyPartConstant[] {
  const requirement = calculateRemoteHaulerRequirement(homeRoom, remoteRoom, sourceCount, availableEnergy);
  const config = requirement.haulerConfig;

  // Build body: alternating CARRY and MOVE for balanced movement
  const body: BodyPartConstant[] = [];
  for (let i = 0; i < config.carryParts; i++) {
    body.push(CARRY, MOVE);
  }

  return body;
}
