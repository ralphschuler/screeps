/**
 * Road Network Planner
 *
 * Calculates optimal road positions for:
 * - Base infrastructure (spawn/storage to sources, controller, mineral)
 * - Remote mining routes
 * - Multi-room highways
 *
 * These calculated road positions are used by the blueprint system to determine
 * which roads are valid and should NOT be destroyed during blueprint enforcement.
 *
 * Addresses Issue: Layout planner should incorporate roads so destruction routing
 * does not destroy all roads.
 */

import { logger } from "../core/logger";

/**
 * Road segment for multi-room paths
 */
export interface RoadSegment {
  /** Room name */
  roomName: string;
  /** Positions in this room */
  positions: { x: number; y: number }[];
}

/**
 * Road network for a room
 */
export interface RoomRoadNetwork {
  /** Room name */
  roomName: string;
  /** Positions that are part of the road network */
  positions: Set<string>;
  /** Last calculated tick */
  lastCalculated: number;
}

/**
 * Configuration for road network calculation
 */
export interface RoadNetworkConfig {
  /** How often to recalculate roads (in ticks) */
  recalculateInterval: number;
  /** Maximum path operations per room */
  maxPathOps: number;
  /** Whether to include roads to remote rooms */
  includeRemoteRoads: boolean;
}

const DEFAULT_CONFIG: RoadNetworkConfig = {
  recalculateInterval: 1000,
  maxPathOps: 2000,
  includeRemoteRoads: true
};

/**
 * Cache of calculated road networks per room
 */
const roadNetworkCache = new Map<string, RoomRoadNetwork>();

/**
 * Calculate road network for a room
 *
 * This includes roads to:
 * - All sources from spawn/storage
 * - Controller from spawn/storage
 * - Mineral from spawn/storage (if RCL >= 6)
 */
export function calculateRoadNetwork(
  room: Room,
  anchor: RoomPosition,
  config: Partial<RoadNetworkConfig> = {}
): RoomRoadNetwork {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Check cache
  const cached = roadNetworkCache.get(room.name);
  if (cached && Game.time - cached.lastCalculated < cfg.recalculateInterval) {
    return cached;
  }

  const positions = new Set<string>();
  const rcl = room.controller?.level ?? 0;

  // Find key positions
  const sources = room.find(FIND_SOURCES);
  const controller = room.controller;
  const storage = room.storage;
  const mineral = room.find(FIND_MINERALS)[0];

  // Primary hub position (storage if available, otherwise anchor/spawn position)
  const hubPos = storage?.pos ?? anchor;

  // Add roads to all sources
  for (const source of sources) {
    const path = findRoadPath(hubPos, source.pos, room.name, cfg.maxPathOps);
    for (const pos of path) {
      positions.add(`${pos.x},${pos.y}`);
    }
  }

  // Add roads to controller
  if (controller) {
    const path = findRoadPath(hubPos, controller.pos, room.name, cfg.maxPathOps);
    for (const pos of path) {
      positions.add(`${pos.x},${pos.y}`);
    }
  }

  // Add roads to mineral (RCL 6+)
  if (mineral && rcl >= 6) {
    const path = findRoadPath(hubPos, mineral.pos, room.name, cfg.maxPathOps);
    for (const pos of path) {
      positions.add(`${pos.x},${pos.y}`);
    }
  }

  // If anchor is different from hub (no storage yet), add roads from anchor to sources/controller
  if (!storage) {
    for (const source of sources) {
      const path = findRoadPath(anchor, source.pos, room.name, cfg.maxPathOps);
      for (const pos of path) {
        positions.add(`${pos.x},${pos.y}`);
      }
    }

    if (controller) {
      const path = findRoadPath(anchor, controller.pos, room.name, cfg.maxPathOps);
      for (const pos of path) {
        positions.add(`${pos.x},${pos.y}`);
      }
    }
  }

  const network: RoomRoadNetwork = {
    roomName: room.name,
    positions,
    lastCalculated: Game.time
  };

  roadNetworkCache.set(room.name, network);

  logger.debug(
    `Calculated road network for ${room.name}: ${positions.size} positions`,
    { subsystem: "RoadNetwork" }
  );

  return network;
}

/**
 * Calculate roads for remote mining routes
 *
 * @param homeRoom The home room with spawn/storage
 * @param remoteRoomNames Array of remote room names to connect
 * @returns Map of room name to road positions
 */
export function calculateRemoteRoads(
  homeRoom: Room,
  remoteRoomNames: string[],
  config: Partial<RoadNetworkConfig> = {}
): Map<string, Set<string>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const result = new Map<string, Set<string>>();

  if (!cfg.includeRemoteRoads) {
    return result;
  }

  const storage = homeRoom.storage;
  const spawn = homeRoom.find(FIND_MY_SPAWNS)[0];
  const hubPos = storage?.pos ?? spawn?.pos;

  if (!hubPos) {
    return result;
  }

  for (const remoteRoomName of remoteRoomNames) {
    // Calculate multi-room path to remote room center
    const remoteTarget = new RoomPosition(25, 25, remoteRoomName);

    try {
      const pathResult = PathFinder.search(
        hubPos,
        { pos: remoteTarget, range: 20 },
        {
          plainCost: 2,
          swampCost: 10,
          maxOps: cfg.maxPathOps,
          roomCallback: (roomName: string) => {
            return generateRoadCostMatrix(roomName);
          }
        }
      );

      if (!pathResult.incomplete) {
        // Group positions by room
        for (const pos of pathResult.path) {
          if (!result.has(pos.roomName)) {
            result.set(pos.roomName, new Set());
          }
          result.get(pos.roomName)?.add(`${pos.x},${pos.y}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn(
        `Failed to calculate remote road to ${remoteRoomName}: ${errorMessage}`,
        { subsystem: "RoadNetwork" }
      );
    }
  }

  return result;
}

/**
 * Find a road path between two positions in the same room
 */
function findRoadPath(
  from: RoomPosition,
  to: RoomPosition,
  roomName: string,
  maxOps: number
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];

  const pathResult = PathFinder.search(
    from,
    { pos: to, range: 1 },
    {
      plainCost: 2,
      swampCost: 10,
      maxOps,
      roomCallback: (rn: string) => {
        // Only path within the specified room for local roads
        if (rn !== roomName) {
          return false;
        }
        return generateRoadCostMatrix(rn);
      }
    }
  );

  if (!pathResult.incomplete) {
    for (const pos of pathResult.path) {
      // Only include positions in the target room
      if (pos.roomName === roomName) {
        result.push({ x: pos.x, y: pos.y });
      }
    }
  }

  return result;
}

/**
 * Generate a cost matrix for road pathfinding
 */
function generateRoadCostMatrix(roomName: string): CostMatrix | false {
  const room = Game.rooms[roomName];
  const costs = new PathFinder.CostMatrix();

  // If we don't have vision of the room, use default costs
  if (!room) {
    return costs;
  }

  // Add structure costs
  const structures = room.find(FIND_STRUCTURES);
  for (const structure of structures) {
    if (structure.structureType === STRUCTURE_ROAD) {
      // Prefer existing roads
      costs.set(structure.pos.x, structure.pos.y, 1);
    } else if (
      structure.structureType !== STRUCTURE_CONTAINER &&
      !(structure.structureType === STRUCTURE_RAMPART && "my" in structure && structure.my)
    ) {
      // Block impassable structures
      costs.set(structure.pos.x, structure.pos.y, 255);
    }
  }

  // Add construction site costs
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  for (const site of sites) {
    if (site.structureType === STRUCTURE_ROAD) {
      // Prefer planned roads
      costs.set(site.pos.x, site.pos.y, 1);
    } else if (site.structureType !== STRUCTURE_CONTAINER) {
      costs.set(site.pos.x, site.pos.y, 255);
    }
  }

  return costs;
}

/**
 * Get all valid road positions for a room
 *
 * Combines:
 * - Blueprint roads
 * - Calculated infrastructure roads (to sources, controller, mineral)
 * - Remote mining roads (if applicable)
 *
 * @param room The room to get road positions for
 * @param anchor The blueprint anchor position (usually spawn)
 * @param blueprintRoads Road positions from the blueprint (relative to anchor)
 * @param remoteRooms Optional array of remote room names managed by this room
 */
export function getValidRoadPositions(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): Set<string> {
  const validPositions = new Set<string>();
  const terrain = room.getTerrain();

  // Add blueprint roads (converted from relative to absolute positions)
  for (const r of blueprintRoads) {
    const x = anchor.x + r.x;
    const y = anchor.y + r.y;
    if (x >= 1 && x <= 48 && y >= 1 && y <= 48 && terrain.get(x, y) !== TERRAIN_MASK_WALL) {
      validPositions.add(`${x},${y}`);
    }
  }

  // Add calculated road network (sources, controller, mineral)
  const roadNetwork = calculateRoadNetwork(room, anchor);
  for (const posKey of roadNetwork.positions) {
    validPositions.add(posKey);
  }

  // Add remote mining roads (roads in this room that lead to remote rooms)
  if (remoteRooms.length > 0) {
    const remoteRoads = calculateRemoteRoads(room, remoteRooms);
    const homeRoomRoads = remoteRoads.get(room.name);
    if (homeRoomRoads) {
      for (const posKey of homeRoomRoads) {
        validPositions.add(posKey);
      }
    }
  }

  return validPositions;
}

/**
 * Clear the road network cache for a room
 */
export function clearRoadNetworkCache(roomName: string): void {
  roadNetworkCache.delete(roomName);
}

/**
 * Clear all road network caches
 */
export function clearAllRoadNetworkCaches(): void {
  roadNetworkCache.clear();
}

/**
 * Check if a position should be protected as part of the road network
 *
 * @param room The room to check
 * @param x X coordinate
 * @param y Y coordinate
 * @param anchor Blueprint anchor position
 * @param blueprintRoads Blueprint road positions (relative)
 * @param remoteRooms Remote rooms managed by this room
 */
export function isValidRoadPosition(
  room: Room,
  x: number,
  y: number,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): boolean {
  const validPositions = getValidRoadPositions(room, anchor, blueprintRoads, remoteRooms);
  return validPositions.has(`${x},${y}`);
}

/**
 * Place road construction sites along the road network
 * 
 * This is called during construction to build roads to sources, controller, and mineral.
 * It's rate-limited to avoid exceeding construction site limits.
 * 
 * @param room The room to build roads in
 * @param anchor The blueprint anchor position (usually spawn)
 * @param maxSites Maximum number of construction sites to place
 * @returns Number of construction sites placed
 */
export function placeRoadConstructionSites(
  room: Room,
  anchor: RoomPosition,
  maxSites = 3
): number {
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (existingSites.length >= 10) return 0;

  const roadNetwork = calculateRoadNetwork(room, anchor);
  const terrain = room.getTerrain();
  const existingRoads = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });

  const existingRoadSet = new Set(
    existingRoads.map(r => `${r.pos.x},${r.pos.y}`)
  );
  const existingSiteSet = new Set(
    existingSites
      .filter(s => s.structureType === STRUCTURE_ROAD)
      .map(s => `${s.pos.x},${s.pos.y}`)
  );

  let placed = 0;

  for (const posKey of roadNetwork.positions) {
    if (placed >= maxSites) break;
    if (existingSites.length + placed >= 10) break;

    // Skip if road or site already exists
    if (existingRoadSet.has(posKey)) continue;
    if (existingSiteSet.has(posKey)) continue;

    // Parse position
    const [xStr, yStr] = posKey.split(",");
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    // Skip walls
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

    // Place construction site
    const result = room.createConstructionSite(x, y, STRUCTURE_ROAD);
    if (result === OK) {
      placed++;
    }
  }

  return placed;
}

/**
 * Get the cached road network for visualization or other purposes
 * 
 * @param roomName The room name to get the network for
 * @returns The road network or undefined if not cached
 */
export function getCachedRoadNetwork(roomName: string): RoomRoadNetwork | undefined {
  return roadNetworkCache.get(roomName);
}
