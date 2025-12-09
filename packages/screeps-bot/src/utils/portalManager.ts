/**
 * Portal Manager - Discovery and Routing
 *
 * Manages portal discovery, caching, and routing for inter-shard and inter-room navigation.
 * Implements the TODO from movement.ts for multi-room portal search using inter-shard memory.
 *
 * Design Principles (from ROADMAP.md):
 * - Use InterShardMemory (100 kB per shard) for shard-overgreifende Ziele, Status und Routen
 * - Aggressive caching + TTL to reduce expensive operations
 * - Low frequency updates (≥100 ticks) for portal mapping
 */

import { memoryManager } from "../memory/manager";

// =============================================================================
// Types & Interfaces
// =============================================================================

/**
 * Portal destination information
 */
export interface PortalDestination {
  /** Destination shard name (if inter-shard) */
  shard?: string;
  /** Destination room name */
  room: string;
}

/**
 * Portal information with location and destination
 */
export interface PortalInfo {
  /** Position of the portal */
  pos: RoomPosition;
  /** Destination information */
  destination: PortalDestination;
  /** Game tick when this portal was last seen */
  lastSeen: number;
}

/**
 * Portal route from one room to another via portals
 */
export interface PortalRoute {
  /** Array of room names in the route */
  rooms: string[];
  /** Array of portal positions to traverse */
  portals: RoomPosition[];
  /** Distance estimate (number of rooms) */
  distance: number;
  /** Game tick when this route was calculated */
  calculatedAt: number;
}

/**
 * Inter-shard portal data stored in InterShardMemory
 */
interface InterShardPortalData {
  /** Shard name */
  shard: string;
  /** Known portals on this shard, keyed by room name */
  portals: Record<string, PortalDestination[]>;
  /** Last update tick */
  lastUpdate: number;
}

// =============================================================================
// Constants
// =============================================================================

/** Cache TTL for portal discovery results (500 ticks = ~1.5 hours) */
const PORTAL_CACHE_TTL = 500;

/** Cache TTL for portal routes (1000 ticks = ~3 hours) */
const PORTAL_ROUTE_CACHE_TTL = 1000;

/** Max age for portal information before it's considered stale (10000 ticks) */
const PORTAL_MAX_AGE = 10000;

/** InterShardMemory key prefix for portal data */
const ISM_PORTAL_KEY = "portals:";

// =============================================================================
// Portal Discovery
// =============================================================================

/**
 * Discover portals in a room and cache the results.
 * Returns null if room is not visible.
 *
 * @param roomName - The room to search for portals
 * @returns Array of portal info, or null if room not visible
 */
export function discoverPortalsInRoom(roomName: string): PortalInfo[] | null {
  const cacheKey = `portals:room:${roomName}`;
  const cached = memoryManager.getHeapCache().get<PortalInfo[] | null>(cacheKey);
  
  if (cached !== undefined) {
    return cached;
  }

  const room = Game.rooms[roomName];
  if (!room) {
    // Cache null to avoid repeated lookups for invisible rooms
    memoryManager.getHeapCache().set(cacheKey, null, PORTAL_CACHE_TTL);
    return null;
  }

  // Find all portal structures
  const portalStructures = room.find(FIND_STRUCTURES, {
    filter: (s): s is StructurePortal => s.structureType === STRUCTURE_PORTAL
  });

  const portals: PortalInfo[] = [];

  for (const portal of portalStructures) {
    if (!portal.destination) continue;

    let destination: PortalDestination;

    // Check if destination is inter-shard or intra-shard
    if ("shard" in portal.destination && "room" in portal.destination) {
      // Inter-shard portal
      destination = {
        shard: portal.destination.shard,
        room: portal.destination.room
      };
    } else if ("x" in portal.destination && "y" in portal.destination && "roomName" in portal.destination) {
      // Intra-shard portal (RoomPosition destination)
      destination = {
        room: portal.destination.roomName
      };
    } else {
      continue; // Unknown destination type
    }

    portals.push({
      pos: portal.pos,
      destination,
      lastSeen: Game.time
    });
  }

  // Cache the results
  memoryManager.getHeapCache().set(cacheKey, portals, PORTAL_CACHE_TTL);

  return portals;
}

/**
 * Get all known portals leading to a specific shard.
 *
 * @param targetShard - The destination shard name
 * @returns Array of portal info leading to the target shard
 */
export function getPortalsToShard(targetShard: string): PortalInfo[] {
  const result: PortalInfo[] = [];

  // Search through all visible rooms
  for (const roomName in Game.rooms) {
    const portals = discoverPortalsInRoom(roomName);
    if (!portals) continue;

    for (const portal of portals) {
      if (portal.destination.shard === targetShard) {
        result.push(portal);
      }
    }
  }

  return result;
}

/**
 * Find the closest portal to a position that leads to a specific shard.
 *
 * @param fromPos - Starting position
 * @param targetShard - Target shard name
 * @returns Portal info of the closest portal, or null if none found
 */
export function findClosestPortalToShard(
  fromPos: RoomPosition,
  targetShard: string
): PortalInfo | null {
  const portals = getPortalsToShard(targetShard);
  if (portals.length === 0) return null;

  // Find closest by linear distance (room coordinate distance)
  let closest: PortalInfo | null = null;
  let minDistance = Infinity;

  for (const portal of portals) {
    const distance = Game.map.getRoomLinearDistance(fromPos.roomName, portal.pos.roomName);
    if (distance < minDistance) {
      minDistance = distance;
      closest = portal;
    }
  }

  return closest;
}

// =============================================================================
// Inter-Shard Memory Integration
// =============================================================================

/**
 * Store portal data for current shard in InterShardMemory.
 * This allows other shards to discover routes to this shard.
 *
 * Note: InterShardMemory stores a single string per shard. We use a JSON object
 * to store multiple keys. The format is { portals: {...}, otherData: {...} }
 *
 * @returns true if successfully stored, false otherwise
 */
export function publishPortalsToInterShardMemory(): boolean {
  try {
    const currentShard = Game.shard?.name;
    if (!currentShard) return false;

    // Collect all known portals from visible rooms
    const portalsByRoom: Record<string, PortalDestination[]> = {};

    for (const roomName in Game.rooms) {
      const portals = discoverPortalsInRoom(roomName);
      if (!portals || portals.length === 0) continue;

      // Filter out stale portals
      const validPortals = portals.filter(p => Game.time - p.lastSeen < PORTAL_MAX_AGE);
      if (validPortals.length === 0) continue;

      portalsByRoom[roomName] = validPortals.map(p => p.destination);
    }

    const data: InterShardPortalData = {
      shard: currentShard,
      portals: portalsByRoom,
      lastUpdate: Game.time
    };

    // Read existing ISM data and merge
    let ismData: Record<string, unknown> = {};
    try {
      const existing = InterShardMemory.getLocal();
      if (existing) {
        ismData = JSON.parse(existing) as Record<string, unknown>;
      }
    } catch {
      // If parsing fails, start fresh
      ismData = {};
    }

    // Store under a namespaced key
    ismData[ISM_PORTAL_KEY] = data;

    InterShardMemory.setLocal(JSON.stringify(ismData));

    return true;
  } catch (error) {
    console.log(`[PortalManager] Failed to publish to InterShardMemory: ${String(error)}`);
    return false;
  }
}

/**
 * Validate portal data structure from InterShardMemory.
 * Protects against malicious or corrupted data from other shards.
 */
function isValidPortalData(data: unknown): data is InterShardPortalData {
  if (typeof data !== "object" || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  // Check required fields
  if (typeof obj.shard !== "string") return false;
  if (typeof obj.lastUpdate !== "number") return false;
  if (typeof obj.portals !== "object" || obj.portals === null) return false;
  
  // Validate portals structure
  const portals = obj.portals as Record<string, unknown>;
  for (const roomName in portals) {
    const roomPortals = portals[roomName];
    if (!Array.isArray(roomPortals)) return false;
    
    // Validate each portal destination
    for (const portal of roomPortals) {
      if (typeof portal !== "object" || portal === null) return false;
      const dest = portal as Record<string, unknown>;
      if (typeof dest.room !== "string") return false;
      // shard is optional but must be string if present
      if (dest.shard !== undefined && typeof dest.shard !== "string") return false;
    }
  }
  
  return true;
}

/**
 * Retrieve portal data from InterShardMemory for a specific shard.
 *
 * @param shardName - Name of the shard to query
 * @returns Portal data for the shard, or null if not available
 */
export function getPortalDataFromInterShardMemory(shardName: string): InterShardPortalData | null {
  try {
    // Get data from the target shard
    const data = InterShardMemory.getRemote(shardName);
    
    if (!data) return null;

    // Parse and validate the ISM data
    let ismData: Record<string, unknown>;
    try {
      ismData = JSON.parse(data) as Record<string, unknown>;
    } catch {
      console.log(`[PortalManager] Invalid JSON from shard ${shardName}`);
      return null;
    }

    const portalData = ismData[ISM_PORTAL_KEY];
    
    // Validate structure before returning
    if (!isValidPortalData(portalData)) {
      console.log(`[PortalManager] Invalid portal data structure from shard ${shardName}`);
      return null;
    }

    return portalData;
  } catch (error) {
    console.log(`[PortalManager] Failed to read from InterShardMemory: ${String(error)}`);
    return null;
  }
}

// =============================================================================
// Portal Routing
// =============================================================================

/**
 * Find a multi-room route to reach a portal leading to a specific shard.
 * Uses Game.map.findRoute to calculate the room path through multiple rooms.
 *
 * @param fromRoom - Starting room name
 * @param targetShard - Destination shard name
 * @returns Portal route, or null if no route found
 */
export function findRouteToPortal(fromRoom: string, targetShard: string): PortalRoute | null {
  const cacheKey = `portal:route:${fromRoom}:${targetShard}`;
  const cached = memoryManager.getHeapCache().get<PortalRoute | null>(cacheKey);
  
  if (cached !== undefined) {
    return cached;
  }

  // Find the closest portal
  const startPos = new RoomPosition(25, 25, fromRoom);
  const portalInfo = findClosestPortalToShard(startPos, targetShard);
  
  if (!portalInfo) {
    memoryManager.getHeapCache().set(cacheKey, null, PORTAL_ROUTE_CACHE_TTL);
    return null;
  }

  // Calculate route using Game.map.findRoute
  const route = Game.map.findRoute(fromRoom, portalInfo.pos.roomName);
  
  if (route === ERR_NO_PATH) {
    memoryManager.getHeapCache().set(cacheKey, null, PORTAL_ROUTE_CACHE_TTL);
    return null;
  }

  const rooms: string[] = [fromRoom];
  for (const step of route) {
    rooms.push(step.room);
  }

  const portalRoute: PortalRoute = {
    rooms,
    portals: [portalInfo.pos],
    distance: rooms.length,
    calculatedAt: Game.time
  };

  memoryManager.getHeapCache().set(cacheKey, portalRoute, PORTAL_ROUTE_CACHE_TTL);
  return portalRoute;
}

/**
 * Find a complete route from one room to another room on a different shard.
 * This function chains multiple portal jumps if necessary.
 *
 * @param fromRoom - Starting room name
 * @param fromShard - Starting shard name
 * @param toRoom - Destination room name
 * @param toShard - Destination shard name
 * @returns Complete portal route, or null if no route found
 */
export function findInterShardRoute(
  fromRoom: string,
  fromShard: string,
  toRoom: string,
  toShard: string
): PortalRoute | null {
  // If already on target shard, just find normal route
  if (fromShard === toShard) {
    const route = Game.map.findRoute(fromRoom, toRoom);
    if (route === ERR_NO_PATH) return null;

    const rooms: string[] = [fromRoom];
    for (const step of route) {
      rooms.push(step.room);
    }

    return {
      rooms,
      portals: [],
      distance: rooms.length,
      calculatedAt: Game.time
    };
  }

  // Find route to a portal leading to target shard
  return findRouteToPortal(fromRoom, toShard);
}

// =============================================================================
// Maintenance
// =============================================================================

/**
 * Periodic maintenance task for portal management.
 * Should be called every 100-500 ticks as a low-frequency operation.
 *
 * Tasks:
 * - Publish portal data to InterShardMemory
 * - Clean up stale portal cache entries
 *
 * @returns Number of maintenance operations performed
 */
export function maintainPortalCache(): number {
  let operations = 0;

  // Publish to InterShardMemory
  if (publishPortalsToInterShardMemory()) {
    operations++;
  }

  // Note: Heap cache has built-in TTL management, so we don't need to manually clean it

  return operations;
}
