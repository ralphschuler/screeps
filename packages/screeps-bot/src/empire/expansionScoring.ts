/**
 * Expansion Scoring Utilities
 *
 * Shared scoring logic for expansion candidate evaluation used by both
 * EmpireManager and ExpansionManager to maintain consistency and avoid duplication.
 */

import { memoryManager } from "../memory/manager";
import type { RoomIntel } from "../memory/schemas";

/**
 * Get mineral value bonus based on mineral rarity
 * Values verified via screeps-docs-mcp for mineral resource constants
 */
export function getMineralBonus(mineralType?: MineralConstant): number {
  if (!mineralType) return 0;

  // Rare/valuable minerals get higher scores
  const mineralValues: Partial<Record<MineralConstant, number>> = {
    X: 15, // Catalyst - very rare and valuable
    Z: 12, // Zynthium - valuable for combat
    K: 12, // Keanium - valuable for combat
    L: 10, // Lemergium - valuable for healing
    U: 10, // Utrium - valuable for attack/harvest
    O: 8, // Oxygen - common but useful
    H: 8 // Hydrogen - common but useful
  };

  return mineralValues[mineralType] ?? 5;
}

/**
 * Calculate hostile presence penalty by scanning adjacent rooms
 */
export function calculateHostilePenalty(roomName: string): number {
  const overmind = memoryManager.getOvermind();
  let penalty = 0;
  const adjacentRooms = getAdjacentRoomNames(roomName);

  for (const adjRoom of adjacentRooms) {
    const intel = overmind.roomIntel[adjRoom];
    if (!intel) continue;

    // Heavy penalty for hostile-owned adjacent rooms
    if (intel.owner && !isAlly(intel.owner)) {
      penalty += 30;
    }

    // Penalty for high threat adjacent rooms
    if (intel.threatLevel >= 2) {
      penalty += intel.threatLevel * 10;
    }

    // Penalty for hostile structures (towers, spawns)
    if (intel.towerCount && intel.towerCount > 0) {
      penalty += intel.towerCount * 5;
    }
  }

  return penalty;
}

/**
 * Get terrain bonus/penalty
 */
export function getTerrainBonus(terrain: "plains" | "swamp" | "mixed"): number {
  if (terrain === "plains") {
    return 15; // Plains are easier to traverse and build on
  } else if (terrain === "swamp") {
    return -10; // Swamps are expensive to traverse
  }
  return 0; // Mixed terrain is neutral
}

/**
 * Check if room is near a highway (within 1 room distance)
 * Highway rooms verified via screeps-docs-mcp: coordinates divisible by 10
 */
export function isNearHighway(roomName: string): boolean {
  const adjacentRooms = getAdjacentRoomNames(roomName);
  for (const adjRoom of adjacentRooms) {
    const parsed = parseRoomName(adjRoom);
    if (!parsed) continue;

    // Highway rooms have coordinates divisible by 10
    if (parsed.x % 10 === 0 || parsed.y % 10 === 0) {
      return true;
    }
  }
  return false;
}

/**
 * Get portal proximity bonus (strategic value)
 */
export function getPortalProximityBonus(roomName: string): number {
  const overmind = memoryManager.getOvermind();
  // Check if any adjacent rooms have portals
  const adjacentRooms = getAdjacentRoomNames(roomName);

  for (const adjRoom of adjacentRooms) {
    const intel = overmind.roomIntel[adjRoom];
    if (!intel) continue;

    // TODO: Add portal tracking to RoomIntel schema
    // For now, highway rooms are potential portal locations
    if (intel.isHighway) {
      return 5; // Small bonus for highway proximity (potential portals)
    }
  }

  return 0;
}

/**
 * Get cluster proximity bonus
 * Heavily favors expansion adjacent to existing owned rooms
 */
export function getClusterProximityBonus(roomName: string, ownedRooms: Room[], distance: number): number {
  if (ownedRooms.length === 0) return 0;

  // Strong bonus for being very close to existing cluster
  if (distance <= 2) {
    return 25;
  } else if (distance <= 3) {
    return 15;
  } else if (distance <= 5) {
    return 5;
  }

  return 0;
}

/**
 * Get adjacent room names (up, down, left, right, and diagonals)
 */
export function getAdjacentRoomNames(roomName: string): string[] {
  const parsed = parseRoomName(roomName);
  if (!parsed) return [];

  const { x, y, xDir, yDir } = parsed;
  const adjacent: string[] = [];

  // Generate all 8 adjacent rooms
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip the room itself

      const newX = x + dx;
      const newY = y + dy;

      // Handle coordinate wrapping and direction
      let adjXDir = xDir;
      let adjYDir = yDir;
      let adjX = newX;
      let adjY = newY;

      if (newX < 0) {
        adjXDir = xDir === "E" ? "W" : "E";
        adjX = Math.abs(newX) - 1;
      }
      if (newY < 0) {
        adjYDir = yDir === "N" ? "S" : "N";
        adjY = Math.abs(newY) - 1;
      }

      adjacent.push(`${adjXDir}${adjX}${adjYDir}${adjY}`);
    }
  }

  return adjacent;
}

/**
 * Parse room name into coordinates
 */
export function parseRoomName(roomName: string): { x: number; y: number; xDir: string; yDir: string } | null {
  const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return null;

  return {
    xDir: match[1],
    x: parseInt(match[2], 10),
    yDir: match[3],
    y: parseInt(match[4], 10)
  };
}

/**
 * Check if a player is an ally
 */
export function isAlly(_username: string): boolean {
  // TODO: Implement alliance checking from config or memory
  // For now, always return false (no allies)
  return false;
}

/**
 * Get rooms within a certain range
 */
export function getRoomsInRange(roomName: string, range: number): string[] {
  const rooms: string[] = [];
  const parsed = parseRoomName(roomName);
  if (!parsed) return [];

  const { x, y, xDir, yDir } = parsed;

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      if (dx === 0 && dy === 0) continue;

      const newX = x + dx;
      const newY = y + dy;

      let adjXDir = xDir;
      let adjYDir = yDir;
      let adjX = newX;
      let adjY = newY;

      if (newX < 0) {
        adjXDir = xDir === "E" ? "W" : "E";
        adjX = Math.abs(newX) - 1;
      }
      if (newY < 0) {
        adjYDir = yDir === "N" ? "S" : "N";
        adjY = Math.abs(newY) - 1;
      }

      rooms.push(`${adjXDir}${adjX}${adjYDir}${adjY}`);
    }
  }

  return rooms;
}

/**
 * Check if room is in a war zone (between two hostile players)
 */
export function isInWarZone(roomName: string): boolean {
  const overmind = memoryManager.getOvermind();
  const adjacentRooms = getAdjacentRoomNames(roomName);
  const hostilePlayers = new Set<string>();

  for (const adjRoom of adjacentRooms) {
    const intel = overmind.roomIntel[adjRoom];
    if (intel?.owner && !isAlly(intel.owner)) {
      hostilePlayers.add(intel.owner);
    }
  }

  // If there are 2+ different hostile players adjacent, it's a war zone
  return hostilePlayers.size >= 2;
}

/**
 * Calculate remote mining profitability
 * Returns true if the remote is profitable (>2x ROI)
 * Energy costs and mechanics verified via screeps-docs-mcp
 */
export function calculateRemoteProfitability(
  roomName: string,
  homeRoom: string,
  intel: RoomIntel
): {
  isProfitable: boolean;
  energyCost: number;
  energyGain: number;
  roi: number;
} {
  const distance = Game.map.getRoomLinearDistance(homeRoom, roomName);

  // Calculate energy cost
  // Body costs verified via screeps-docs-mcp:
  // WORK: 100, CARRY: 50, MOVE: 50
  // Remote harvester: 5 WORK (500) + 3 MOVE (150) = 650
  // Remote hauler: 6 CARRY (300) + 3 MOVE (150) = 450
  const harvesterCost = 650;
  const haulerCost = 450;
  const totalBodyCost = harvesterCost + haulerCost * intel.sources;

  // Trip frequency: haulers make round trips
  // Assume average trip time is distance * 50 ticks (accounting for roads/swamps)
  const tripTime = distance * 50;
  const tripsPerLifetime = 1500 / tripTime; // 1500 tick lifespan verified via screeps-docs-mcp
  const energyCostPerTrip = totalBodyCost / tripsPerLifetime;

  // Energy cost per tick (amortized)
  const energyCost = energyCostPerTrip / tripTime;

  // Calculate energy gain
  // Source output verified via screeps-docs-mcp: 3000 energy per 300 ticks in reserved rooms, 1500 in non-reserved
  const sourceOutput = 3000; // Assume reservation
  const energyPerTick = (sourceOutput / 300) * intel.sources;

  // Net gain per tick
  const energyGain = energyPerTick - energyCost;

  // ROI: gain / cost ratio
  const roi = energyGain / energyCost;

  return {
    isProfitable: roi > 2.0, // Must generate >2x energy vs cost
    energyCost,
    energyGain,
    roi
  };
}
