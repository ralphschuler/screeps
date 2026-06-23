/**
 * Portal Manager - Discovery and Routing
 *
 * Manages portal discovery, caching, and routing for inter-shard and inter-room
 * navigation. The public class stays as the orchestration layer; focused
 * modules handle destination normalization, InterShardMemory payloads, shared
 * constants, and data contracts.
 *
 * Design Principles (from ROADMAP.md):
 * - Use InterShardMemory (100 kB per shard) for shard-overgreifende Ziele,
 *   Status und Routen
 * - Aggressive caching + TTL to reduce expensive operations
 * - Low frequency updates (≥100 ticks) for portal mapping
 */

import type { ICache, ILogger } from "../types";
import {
  PORTAL_CACHE_TTL,
  PORTAL_MANAGER_SUBSYSTEM,
  PORTAL_MAX_AGE,
  PORTAL_ROUTE_CACHE_TTL
} from "./constants";
import { normalizePortalDestination } from "./destinations";
import { encodePortalDataPayload, parsePortalDataPayload } from "./interShardMemory";
import type { InterShardPortalData, PortalInfo, PortalRoute } from "./types";

export type { InterShardPortalData, PortalDestination, PortalInfo, PortalRoute } from "./types";

/** Portal manager handles portal discovery, caching, and routing. */
export class PortalManager {
  private cache: ICache;
  private logger: ILogger;

  constructor(cache: ICache, logger: ILogger) {
    this.cache = cache;
    this.logger = logger;
  }

  /**
   * Discover portals in a room and cache the results.
   * Returns null if room is not visible.
   *
   * @param roomName - The room to search for portals
   * @returns Array of portal info, or null if room not visible
   */
  discoverPortalsInRoom(roomName: string): PortalInfo[] | null {
    const cacheKey = `portals:room:${roomName}`;
    const cached = this.cache.get<PortalInfo[] | null>(cacheKey);

    if (cached !== undefined) {
      this.logger.debug(`Using cached portal data for room ${roomName}`, {
        subsystem: PORTAL_MANAGER_SUBSYSTEM,
        room: roomName,
        meta: { portalCount: cached?.length ?? 0 }
      });
      return cached;
    }

    const room = Game.rooms[roomName];
    if (!room) {
      // Cache null to avoid repeated lookups for invisible rooms.
      this.cache.set(cacheKey, null, PORTAL_CACHE_TTL);
      return null;
    }

    const portalStructures = room.find(FIND_STRUCTURES, {
      filter: (structure): structure is StructurePortal => structure.structureType === STRUCTURE_PORTAL
    });

    const portals: PortalInfo[] = [];

    for (const portal of portalStructures) {
      const destination = normalizePortalDestination(portal.destination);
      if (!destination) continue;

      portals.push({
        pos: portal.pos,
        destination,
        lastSeen: Game.time
      });
    }

    this.cache.set(cacheKey, portals, PORTAL_CACHE_TTL);

    if (portals.length > 0) {
      this.logger.info(`Discovered ${portals.length} portal(s) in room ${roomName}`, {
        subsystem: PORTAL_MANAGER_SUBSYSTEM,
        room: roomName,
        meta: {
          portalCount: portals.length,
          destinations: portals.map(portal =>
            portal.destination.shard
              ? `${portal.destination.shard}:${portal.destination.room}`
              : portal.destination.room
          )
        }
      });
    }

    return portals;
  }

  /**
   * Get all known portals leading to a specific shard.
   *
   * @param targetShard - The destination shard name
   * @returns Array of portal info leading to the target shard
   */
  getPortalsToShard(targetShard: string): PortalInfo[] {
    const result: PortalInfo[] = [];

    for (const roomName in Game.rooms) {
      const portals = this.discoverPortalsInRoom(roomName);
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
  findClosestPortalToShard(fromPos: RoomPosition, targetShard: string): PortalInfo | null {
    const portals = this.getPortalsToShard(targetShard);
    if (portals.length === 0) return null;

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

  /**
   * Store portal data for current shard in InterShardMemory.
   * This allows other shards to discover routes to this shard.
   *
   * Note: InterShardMemory stores a single string per shard. We use a JSON object
   * to store multiple keys. The portal map lives under the stable `"portals:"`
   * key alongside other subsystem data.
   *
   * @returns true if successfully stored, false otherwise
   */
  publishPortalsToInterShardMemory(): boolean {
    try {
      const currentShard = Game.shard?.name;
      if (!currentShard) return false;

      const data: InterShardPortalData = {
        shard: currentShard,
        portals: this.collectFreshPortalsByRoom(),
        lastUpdate: Game.time
      };

      InterShardMemory.setLocal(encodePortalDataPayload(InterShardMemory.getLocal(), data));

      this.logger.debug("Published portal data to InterShardMemory", {
        subsystem: PORTAL_MANAGER_SUBSYSTEM,
        meta: { portalCount: Object.keys(data.portals).length }
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to publish to InterShardMemory: ${String(error)}`, {
        subsystem: PORTAL_MANAGER_SUBSYSTEM
      });
      return false;
    }
  }

  /**
   * Retrieve portal data from InterShardMemory for a specific shard.
   *
   * @param shardName - Name of the shard to query
   * @returns Portal data for the shard, or null if not available
   */
  getPortalDataFromInterShardMemory(shardName: string): InterShardPortalData | null {
    try {
      const data = InterShardMemory.getRemote(shardName);
      if (!data) return null;

      const result = parsePortalDataPayload(data);
      if (!result.ok) {
        this.logger.warn(
          result.reason === "invalid-json"
            ? `Invalid JSON from shard ${shardName}`
            : `Invalid portal data structure from shard ${shardName}`,
          {
            subsystem: PORTAL_MANAGER_SUBSYSTEM,
            meta: { shard: shardName }
          }
        );
        return null;
      }

      const portalData = result.data;
      this.logger.debug(`Retrieved portal data from shard ${shardName}`, {
        subsystem: PORTAL_MANAGER_SUBSYSTEM,
        meta: { shard: shardName, portalCount: Object.keys(portalData.portals).length }
      });

      return portalData;
    } catch (error) {
      this.logger.error(`Failed to read from InterShardMemory: ${String(error)}`, {
        subsystem: PORTAL_MANAGER_SUBSYSTEM,
        meta: { shard: shardName }
      });
      return null;
    }
  }

  /**
   * Find a multi-room route to reach a portal leading to a specific shard.
   * Uses Game.map.findRoute to calculate the room path through multiple rooms.
   *
   * @param fromRoom - Starting room name
   * @param targetShard - Destination shard name
   * @returns Portal route, or null if no route found
   */
  findRouteToPortal(fromRoom: string, targetShard: string): PortalRoute | null {
    const cacheKey = `portal:route:${fromRoom}:${targetShard}`;
    const cached = this.cache.get<PortalRoute | null>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const startPos = new RoomPosition(25, 25, fromRoom);
    const portalInfo = this.findClosestPortalToShard(startPos, targetShard);

    if (!portalInfo) {
      this.cache.set(cacheKey, null, PORTAL_ROUTE_CACHE_TTL);
      return null;
    }

    const route = Game.map.findRoute(fromRoom, portalInfo.pos.roomName);

    if (route === ERR_NO_PATH) {
      this.cache.set(cacheKey, null, PORTAL_ROUTE_CACHE_TTL);
      return null;
    }

    const rooms = this.routeStepsToRooms(fromRoom, route);
    const portalRoute: PortalRoute = {
      rooms,
      portals: [portalInfo.pos],
      distance: rooms.length,
      calculatedAt: Game.time
    };

    this.cache.set(cacheKey, portalRoute, PORTAL_ROUTE_CACHE_TTL);
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
  findInterShardRoute(
    fromRoom: string,
    fromShard: string,
    toRoom: string,
    toShard: string
  ): PortalRoute | null {
    if (fromShard === toShard) {
      const route = Game.map.findRoute(fromRoom, toRoom);
      if (route === ERR_NO_PATH) return null;

      const rooms = this.routeStepsToRooms(fromRoom, route);
      return {
        rooms,
        portals: [],
        distance: rooms.length,
        calculatedAt: Game.time
      };
    }

    return this.findRouteToPortal(fromRoom, toShard);
  }

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
  maintainPortalCache(): number {
    let operations = 0;

    if (this.publishPortalsToInterShardMemory()) {
      operations++;
    }

    // Heap cache implementations own TTL expiration; no manual cleanup required.
    return operations;
  }

  private collectFreshPortalsByRoom(): Record<string, InterShardPortalData["portals"][string]> {
    const portalsByRoom: Record<string, InterShardPortalData["portals"][string]> = {};

    for (const roomName in Game.rooms) {
      const portals = this.discoverPortalsInRoom(roomName);
      if (!portals || portals.length === 0) continue;

      const validPortals = portals.filter(portal => Game.time - portal.lastSeen < PORTAL_MAX_AGE);
      if (validPortals.length === 0) continue;

      portalsByRoom[roomName] = validPortals.map(portal => portal.destination);
    }

    return portalsByRoom;
  }

  private routeStepsToRooms(fromRoom: string, route: ReturnType<typeof Game.map.findRoute>): string[] {
    const rooms = [fromRoom];
    if (route === ERR_NO_PATH) return rooms;

    for (const step of route) {
      rooms.push(step.room);
    }

    return rooms;
  }
}
