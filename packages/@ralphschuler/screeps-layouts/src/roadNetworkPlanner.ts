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
 * Room center coordinates for pathfinding targets
 */
const ROOM_CENTER_X = 25;
const ROOM_CENTER_Y = 25;

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
 * Construction site limit per room (Screeps game limit)
 */
const MAX_CONSTRUCTION_SITES_PER_ROOM = 10;

/**
 * Default number of road construction sites to place per tick
 * Kept low to avoid overwhelming builders
 */
const DEFAULT_ROAD_SITES_PER_TICK = 3;

/**
 * Distance from room exits within which existing roads are protected
 * Expanded from 3 to 10 to prevent remote mining road destruction
 * This provides a fallback protection in addition to path-based protection
 */
const EXIT_ROAD_PROTECTION_DISTANCE = 10;

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
 * Get the exit direction from one room to another
 * 
 * @param fromRoom Source room name
 * @param toRoom Destination room name
 * @returns Exit direction or null if rooms are not adjacent
 */
function getExitDirection(fromRoom: string, toRoom: string): "top" | "bottom" | "left" | "right" | null {
  const parseRoom = (name: string) => {
    const match = name.match(/([WE])(\d+)([NS])(\d+)/);
    if (!match) return null;
    return {
      x: (match[1] === 'W' ? -1 : 1) * parseInt(match[2], 10),
      y: (match[3] === 'N' ? 1 : -1) * parseInt(match[4], 10)
    };
  };
  
  const from = parseRoom(fromRoom);
  const to = parseRoom(toRoom);
  
  if (!from || !to) return null;
  
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Determine which edge
  if (dx > 0) return 'right'; // Going east (x=49)
  if (dx < 0) return 'left';  // Going west (x=0)
  if (dy > 0) return 'top';   // Going north (y=0)
  if (dy < 0) return 'bottom'; // Going south (y=49)
  
  return null;
}

/**
 * Get exit positions in a room that lead to another room
 * 
 * @param roomName The room to find exits in
 * @param direction The exit direction
 * @returns Array of positions at the exit
 */
function getExitPositions(roomName: string, direction: "top" | "bottom" | "left" | "right"): RoomPosition[] {
  const positions: RoomPosition[] = [];
  const terrain = Game.map.getRoomTerrain(roomName);
  
  switch (direction) {
    case "top": // y=0
      for (let x = 0; x < 50; x++) {
        if (terrain.get(x, 0) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(x, 0, roomName));
        }
      }
      break;
    case "bottom": // y=49
      for (let x = 0; x < 50; x++) {
        if (terrain.get(x, 49) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(x, 49, roomName));
        }
      }
      break;
    case "left": // x=0
      for (let y = 0; y < 50; y++) {
        if (terrain.get(0, y) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(0, y, roomName));
        }
      }
      break;
    case "right": // x=49
      for (let y = 0; y < 50; y++) {
        if (terrain.get(49, y) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(49, y, roomName));
        }
      }
      break;
  }
  
  return positions;
}

/**
 * Find the closest exit position from a given position
 * 
 * @param from Starting position
 * @param exitPositions Array of exit positions to choose from
 * @returns Closest exit position
 */
function findClosestExit(from: RoomPosition, exitPositions: RoomPosition[]): RoomPosition | null {
  if (exitPositions.length === 0) return null;
  
  let closest = exitPositions[0];
  let minDist = from.getRangeTo(closest);
  
  for (const pos of exitPositions) {
    const dist = from.getRangeTo(pos);
    if (dist < minDist) {
      minDist = dist;
      closest = pos;
    }
  }
  
  return closest;
}

/**
 * Calculate roads for remote mining routes
 *
 * This function calculates roads from the home room to remote rooms by:
 * 1. Finding the exit direction from home room to remote room
 * 2. Calculating paths to the exit points (not just room center)
 * 3. This ensures roads leading to exits are included and protected from blueprint destruction
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
    try {
      // Find the exit direction from home room to remote room
      const exitDirection = getExitDirection(homeRoom.name, remoteRoomName);
      
      if (!exitDirection) {
        logger.warn(
          `Cannot determine exit direction from ${homeRoom.name} to ${remoteRoomName}`,
          { subsystem: "RoadNetwork" }
        );
        continue;
      }
      
      // Get all exit positions in the home room that lead to the remote room
      const exitPositions = getExitPositions(homeRoom.name, exitDirection);
      
      if (exitPositions.length === 0) {
        logger.warn(
          `No valid exit positions found in ${homeRoom.name} towards ${remoteRoomName}`,
          { subsystem: "RoadNetwork" }
        );
        continue;
      }
      
      // Find the closest exit to our hub position
      const targetExit = findClosestExit(hubPos, exitPositions);
      
      if (!targetExit) {
        continue;
      }
      
      // Calculate path from hub to the exit
      const pathResult = PathFinder.search(
        hubPos,
        { pos: targetExit, range: 0 }, // Range 0 to reach the actual exit tile
        {
          plainCost: 2,
          swampCost: 10,
          maxOps: cfg.maxPathOps,
          roomCallback: (roomName: string) => {
            // Only allow pathfinding in the home room for exit approach roads
            // Returning false prevents PathFinder from searching through other rooms
            if (roomName !== homeRoom.name) {
              return false;
            }
            return generateRoadCostMatrix(roomName);
          }
        }
      );

      if (!pathResult.incomplete) {
        // Group positions by room (should all be in home room for exit approach)
        for (const pos of pathResult.path) {
          if (!result.has(pos.roomName)) {
            result.set(pos.roomName, new Set());
          }
          result.get(pos.roomName)?.add(`${pos.x},${pos.y}`);
        }
      }
      
      // Also calculate the full path to remote room center for roads in the remote room itself
      const remoteTarget = new RoomPosition(ROOM_CENTER_X, ROOM_CENTER_Y, remoteRoomName);
      const fullPathResult = PathFinder.search(
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

      if (!fullPathResult.incomplete) {
        // Add positions from the full path (includes transit rooms and remote room)
        for (const pos of fullPathResult.path) {
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
 * Find existing roads near room exits as fallback protection
 * 
 * This provides distance-based protection for roads near exits, which serves
 * as a fallback in case path-based protection fails (e.g., incomplete paths,
 * missing hub position, or pathfinding errors).
 * 
 * @param room The room to find exit roads in
 * @param distance Distance from exits to protect (default: EXIT_ROAD_PROTECTION_DISTANCE)
 * @returns Set of position keys for roads near exits
 */
function findExistingExitRoads(
  room: Room,
  distance: number = EXIT_ROAD_PROTECTION_DISTANCE
): Set<string> {
  const exitRoads = new Set<string>();
  
  // Find all roads in the room
  const roads = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });
  
  // Also check for road construction sites
  const roadSites = room.find(FIND_CONSTRUCTION_SITES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });
  
  // Check each road to see if it's near an exit
  for (const road of roads) {
    if (isNearExit(road.pos, distance)) {
      exitRoads.add(`${road.pos.x},${road.pos.y}`);
    }
  }
  
  // Also protect construction sites near exits
  for (const site of roadSites) {
    if (isNearExit(site.pos, distance)) {
      exitRoads.add(`${site.pos.x},${site.pos.y}`);
    }
  }
  
  return exitRoads;
}

/**
 * Check if a position is near a room exit
 * 
 * @param pos Position to check
 * @param distance Distance threshold from exits
 * @returns True if position is within distance of any exit
 */
function isNearExit(pos: RoomPosition, distance: number): boolean {
  return (
    pos.x <= distance ||           // Near left exit (x=0)
    pos.x >= (49 - distance) ||    // Near right exit (x=49)
    pos.y <= distance ||           // Near top exit (y=0)
    pos.y >= (49 - distance)       // Near bottom exit (y=49)
  );
}

/**
 * Calculate roads to all room exits as permanent infrastructure
 * 
 * This ensures roads leading to exits are always protected, regardless of
 * current remote room assignments. This prevents wasteful destruction and
 * rebuilding when remote assignments change.
 * 
 * @param room The room to calculate exit roads for
 * @param hubPos The hub position (storage or spawn)
 * @param config Configuration for pathfinding
 * @returns Set of position keys for roads to exits
 */
function calculateExitRoads(
  room: Room,
  hubPos: RoomPosition,
  config: Partial<RoadNetworkConfig> = {}
): Set<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const exitRoads = new Set<string>();
  
  // Calculate paths to all 4 exits
  const directions: ("top" | "bottom" | "left" | "right")[] = ["top", "bottom", "left", "right"];
  
  for (const direction of directions) {
    try {
      // Get all exit positions in this direction
      const exitPositions = getExitPositions(room.name, direction);
      
      if (exitPositions.length === 0) continue;
      
      // Find the closest exit to our hub position
      const targetExit = findClosestExit(hubPos, exitPositions);
      
      if (!targetExit) continue;
      
      // Calculate path from hub to the exit
      const pathResult = PathFinder.search(
        hubPos,
        { pos: targetExit, range: 0 }, // Range 0 to reach the actual exit tile
        {
          plainCost: 2,
          swampCost: 10,
          maxOps: cfg.maxPathOps,
          roomCallback: (roomName: string) => {
            // Only allow pathfinding in the home room for exit approach roads
            if (roomName !== room.name) {
              return false;
            }
            return generateRoadCostMatrix(roomName);
          }
        }
      );

      if (!pathResult.incomplete) {
        // Add all positions in the path to exit roads
        for (const pos of pathResult.path) {
          if (pos.roomName === room.name) {
            exitRoads.add(`${pos.x},${pos.y}`);
          }
        }
      } else {
        logger.warn(
          `Incomplete path when calculating exit road for ${direction} in ${room.name} (target exit: ${targetExit.x},${targetExit.y}). Path length: ${pathResult.path.length}`,
          { subsystem: "RoadNetwork" }
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn(
        `Failed to calculate exit road for ${direction} in ${room.name}: ${errorMessage}`,
        { subsystem: "RoadNetwork" }
      );
    }
  }
  
  return exitRoads;
}

/**
 * Get all valid road positions for a room
 *
 * Combines:
 * - Blueprint roads
 * - Calculated infrastructure roads (to sources, controller, mineral)
 * - Roads to all room exits (permanent infrastructure)
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

  // CRITICAL FIX: Always calculate and protect roads to ALL room exits
  // This ensures roads to exits are permanent infrastructure, regardless of
  // current remote room assignments. Prevents wasteful destruction/rebuilding.
  const storage = room.storage;
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  const hubPos = storage?.pos ?? spawn?.pos;
  
  if (hubPos) {
    const exitRoads = calculateExitRoads(room, hubPos);
    for (const posKey of exitRoads) {
      validPositions.add(posKey);
    }
  }

  // Add remote mining roads (roads in this room that lead to remote rooms)
  // This is in addition to exit roads for paths that extend into remote rooms
  if (remoteRooms.length > 0) {
    const remoteRoads = calculateRemoteRoads(room, remoteRooms);
    const homeRoomRoads = remoteRoads.get(room.name);
    if (homeRoomRoads) {
      for (const posKey of homeRoomRoads) {
        validPositions.add(posKey);
      }
    }
  }

  // FALLBACK PROTECTION: Distance-based exit road protection
  // This provides additional protection for existing roads near exits within
  // EXIT_ROAD_PROTECTION_DISTANCE (10 tiles) from room edges.
  // This serves as a defense-in-depth measure in case path-based protection
  // fails due to pathfinding issues, missing hub position, or other edge cases.
  const existingExitRoads = findExistingExitRoads(room);
  for (const posKey of existingExitRoads) {
    validPositions.add(posKey);
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
 * @param maxSites Maximum number of construction sites to place per tick
 * @returns Number of construction sites placed
 */
export function placeRoadConstructionSites(
  room: Room,
  anchor: RoomPosition,
  maxSites = DEFAULT_ROAD_SITES_PER_TICK
): number {
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (existingSites.length >= MAX_CONSTRUCTION_SITES_PER_ROOM) return 0;

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
    if (existingSites.length + placed >= MAX_CONSTRUCTION_SITES_PER_ROOM) break;

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
