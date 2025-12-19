/**
 * Expansion Scoring Utilities
 *
 * Shared scoring logic for expansion candidate evaluation used by both
 * EmpireManager and ExpansionManager to maintain consistency and avoid duplication.
 */

import { getConfig } from "../config";
import { memoryManager } from "../memory/manager";
import type { RoomIntel } from "../memory/schemas";

/**
 * Remote mining configuration constants
 */
const REMOTE_MINING_CONSTANTS = {
  /** Infrastructure lifetime in ticks before decay/replacement (50000 ticks ≈ 33 hours) */
  INFRASTRUCTURE_LIFETIME_TICKS: 50000,
  /** Source output in reserved rooms (energy per 300 ticks) */
  SOURCE_OUTPUT_RESERVED: 3000,
  /** Source output in non-reserved rooms (energy per 300 ticks) */
  SOURCE_OUTPUT_UNRESERVED: 1500,
  /** Source regeneration time in ticks */
  SOURCE_REGEN_TIME: 300,
  /** Creep lifespan in ticks */
  CREEP_LIFETIME: 1500,
  /** Estimated ticks per room of linear distance for path calculation */
  TICKS_PER_ROOM_DISTANCE: 50
} as const;

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

    // Check for actual portal presence
    if (intel.hasPortal) {
      return 10; // Moderate bonus for confirmed portal proximity
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
 * 
 * @param username - The username to check for alliance status
 * @returns Always returns false since alliance system has been removed
 */
export function isAlly(username: string): boolean {
  // Alliance system removed - no allies
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
 * Detailed remote mining profitability analysis result
 */
export interface RemoteProfitability {
  roomName: string;
  sourceId?: Id<Source>;
  energyPerTick: number;
  carrierCostPerTick: number;
  pathDistance: number;
  infrastructureCost: number;
  threatCost: number;
  netProfitPerTick: number;
  roi: number;
  profitabilityScore: number;
  isProfitable: boolean;

  /**
   * @deprecated Use {@link energyPerTick} instead.
   * Kept for backward compatibility with older expansion scoring consumers.
   */
  energyGain?: number;

  /**
   * @deprecated Prefer deriving cost from {@link carrierCostPerTick} and {@link infrastructureCost}.
   * Kept for backward compatibility with older expansion scoring consumers.
   */
  energyCost?: number;
}

/**
 * Calculate comprehensive remote mining profitability
 * Implements detailed analysis with infrastructure and threat costs
 * Energy costs and mechanics verified via screeps-docs-mcp
 * 
 * @param roomName - The remote room to analyze
 * @param homeRoom - The home room that would manage this remote
 * @param intel - Room intelligence data for the remote room
 * @param sourceId - Optional specific source ID to analyze
 * @returns Detailed profitability analysis including costs, revenue, and scoring
 * @throws Error if distance is invalid or intel.sources is not positive
 */
export function calculateRemoteProfitability(
  roomName: string,
  homeRoom: string,
  intel: RoomIntel,
  sourceId?: Id<Source>
): RemoteProfitability {
  const distance = Game.map.getRoomLinearDistance(homeRoom, roomName);

  // Input validation to prevent invalid calculations or division by zero
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error(
      `calculateRemoteProfitability: invalid distance ${distance} between ${homeRoom} and ${roomName}`
    );
  }

  if (intel.sources <= 0) {
    throw new Error(
      `calculateRemoteProfitability: intel.sources must be positive, got ${intel.sources} for ${roomName}`
    );
  }

  if (
    intel.threatLevel !== undefined &&
    intel.threatLevel !== null &&
    (intel.threatLevel < 0 || intel.threatLevel > 3)
  ) {
    throw new Error(
      `calculateRemoteProfitability: intel.threatLevel must be in [0, 3], got ${intel.threatLevel} for ${roomName}`
    );
  }

  // === Energy Harvest Rate ===
  // Source output verified via screeps-docs-mcp:
  // - Reserved rooms: 3000 energy per 300 ticks
  // - Non-reserved rooms: 1500 energy per 300 ticks
  // 
  // ASSUMPTION: We assume reservation since remote mining should include a reserver.
  // This is a critical assumption - without reservation, actual output would be 50% lower
  // (1500 energy per 300 ticks), which could make unprofitable remotes that appear profitable.
  // Callers should ensure reservers are spawned to match this assumption.
  const sourceOutput = REMOTE_MINING_CONSTANTS.SOURCE_OUTPUT_RESERVED;
  const energyPerTick = (sourceOutput / REMOTE_MINING_CONSTANTS.SOURCE_REGEN_TIME) * intel.sources;

  // === Carrier (Hauler) Cost Per Tick ===
  // Body costs verified via screeps-docs-mcp:
  // WORK: 100, CARRY: 50, MOVE: 50
  // Remote harvester: 5 WORK (500) + 3 MOVE (150) = 650
  // Remote hauler: 6 CARRY (300) + 3 MOVE (150) = 450
  const harvesterCost = 650;
  const haulerCost = 450;
  const totalBodyCost = harvesterCost + haulerCost * intel.sources;

  // Trip frequency: haulers make round trips
  // Round trip time: distance * TICKS_PER_ROOM_DISTANCE * 2 (to remote and back)
  // NOTE: This is an approximation that doesn't account for:
  // - Loading/unloading time at containers and storage
  // - Spawn time before creep becomes operational
  // - Partial trips at end of creep lifetime
  // These optimistic assumptions may underestimate actual carrier costs.
  const oneWayTripTime = distance * REMOTE_MINING_CONSTANTS.TICKS_PER_ROOM_DISTANCE;
  const roundTripTime = oneWayTripTime * 2;
  const tripsPerLifetime = REMOTE_MINING_CONSTANTS.CREEP_LIFETIME / roundTripTime;
  const energyCostPerTrip = totalBodyCost / tripsPerLifetime;

  // Energy cost per tick (amortized over creep lifetime)
  const carrierCostPerTick = energyCostPerTrip / roundTripTime;

  // === Infrastructure Cost (one-time, amortized over expected lifetime) ===
  // Container: 5000 energy (verified via screeps-docs-mcp)
  // Road: 300 energy per tile (verified via screeps-docs-mcp)
  // Road tiles estimate: distance * 50 tiles
  // 
  // APPROXIMATION: This uses a rough estimate that may not match actual pathfinding results.
  // Rationale: Each room is 50x50, and paths are typically ~50 tiles per room distance
  // accounting for obstacles and optimal routing. Actual costs may vary significantly
  // based on terrain (swamps, obstacles) which could affect both infrastructure cost
  // and trip time calculations.
  const containerCost = 5000 * intel.sources; // One container per source
  const roadTiles = distance * REMOTE_MINING_CONSTANTS.TICKS_PER_ROOM_DISTANCE;
  const roadCost = roadTiles * 300;
  const totalInfrastructureCost = containerCost + roadCost;
  
  // Amortize over infrastructure lifetime (50000 ticks ≈ 33 hours)
  const infrastructureCostPerTick = totalInfrastructureCost / REMOTE_MINING_CONSTANTS.INFRASTRUCTURE_LIFETIME_TICKS;

  // === Threat Cost ===
  // Estimate energy loss from hostile activity
  // Threat level 0: no cost
  // Threat level 1: 10% loss (occasional raids)
  // Threat level 2: 30% loss (frequent attacks)
  // Threat level 3: 60% loss (constant warfare)
  const threatMultipliers = [0, 0.1, 0.3, 0.6];
  const threatMultiplier = threatMultipliers[intel.threatLevel] ?? 0;
  const threatCost = energyPerTick * threatMultiplier;

  // === Net Profit Per Tick ===
  const netProfitPerTick = energyPerTick - carrierCostPerTick - infrastructureCostPerTick - threatCost;

  // === ROI: net profit / investment cost ratio ===
  // ROI measures return on investment - the ratio of profit to actual investment costs.
  // threatCost represents lost revenue (opportunity cost), not an investment cost,
  // so it should NOT be in the denominator. It's already factored into netProfitPerTick.
  const totalInvestmentCost = carrierCostPerTick + infrastructureCostPerTick;
  const roi = totalInvestmentCost > 0 ? netProfitPerTick / totalInvestmentCost : 0;

  // === Profitability Score (0-100) ===
  const profitabilityScore = calculateProfitabilityScore({
    distance,
    energyPerTick,
    threatCost,
    roi,
    netProfitPerTick
  });

  return {
    roomName,
    sourceId,
    energyPerTick,
    carrierCostPerTick,
    pathDistance: distance,
    infrastructureCost: totalInfrastructureCost,
    threatCost,
    netProfitPerTick,
    roi,
    profitabilityScore,
    isProfitable: roi > 2.0 && netProfitPerTick > 0, // Must generate >2x energy vs cost AND be net positive
    
    // Deprecated fields for backward compatibility
    energyGain: netProfitPerTick,
    energyCost: carrierCostPerTick + infrastructureCostPerTick
  };
}

/**
 * Calculate profitability score (0-100) based on multiple factors
 * 
 * Scoring algorithm as specified in issue requirements:
 * - Base score: 50 points
 * - Distance penalty: -2 points per room distance
 * - Revenue bonus/penalty: +1 point per 10 energy/tick net profit (can be negative for unprofitable remotes)
 * - Threat penalty: -10 points if hostile activity detected
 * - ROI bonus: +5 points per 1.0 ROI (e.g., ROI of 2.0 = 10 bonus points)
 * 
 * Final score is clamped to [0, 100] range.
 */
function calculateProfitabilityScore(metrics: {
  distance: number;
  energyPerTick: number;
  threatCost: number;
  roi: number;
  netProfitPerTick: number;
}): number {
  const baseScore = 50;

  // Distance penalty: -2 points per room distance
  const distancePenalty = metrics.distance * 2;

  // Revenue bonus/penalty: +1 point per 10 energy/tick net profit
  // Note: This can be negative for unprofitable remotes, effectively applying a penalty
  const revenueBonus = metrics.netProfitPerTick / 10;

  // Threat penalty: -10 points if hostile activity detected
  const threatPenalty = metrics.threatCost > 0 ? 10 : 0;

  // ROI bonus: +5 points per 1.0 ROI (e.g., ROI of 2.0 = 10 bonus points)
  const roiBonus = metrics.roi * 5;

  return Math.max(0, Math.min(100, baseScore - distancePenalty + revenueBonus - threatPenalty + roiBonus));
}
