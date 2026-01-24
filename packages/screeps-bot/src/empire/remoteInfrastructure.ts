/**
 * Remote Infrastructure Manager
 *
 * Manages infrastructure in remote mining rooms:
 * - Places containers at sources in remote rooms
 * - Plans roads from home room to remote sources
 * - Coordinates with roadNetworkPlanner for multi-room paths
 *
 * Addresses Issue: Ensure that we remote harvest where possible
 */

import { logger } from "@ralphschuler/screeps-core";
import { ProcessPriority } from "../core/kernel";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { calculateRemoteRoads } from "../layouts/roadNetworkPlanner";
import { memoryManager } from "../memory/manager";
import { checkRemoteRoomStatus } from "./remoteRoomManager";

/**
 * Construction site limit per room (Screeps game limit is 100, but we use lower limit for remote rooms)
 */
const MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM = 5;

/**
 * Maximum number of road construction sites to place per room per tick
 */
const MAX_ROAD_SITES_PER_TICK = 3;

/**
 * Remote Infrastructure Manager Configuration
 */
export interface RemoteInfrastructureConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run infrastructure logic */
  minBucket: number;
  /** Max construction sites to place per remote room per tick */
  maxSitesPerRemotePerTick: number;
}

const DEFAULT_CONFIG: RemoteInfrastructureConfig = {
  updateInterval: 50,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  maxSitesPerRemotePerTick: 2
};

/**
 * Remote Infrastructure Manager Class
 */
@ProcessClass()
export class RemoteInfrastructureManager {
  private config: RemoteInfrastructureConfig;

  public constructor(config: Partial<RemoteInfrastructureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main infrastructure tick - runs periodically
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("remote:infrastructure", "Remote Infrastructure Manager", {
    priority: ProcessPriority.LOW,
    interval: 50,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.05
  })
  public run(): void {
    // Process all owned rooms with remote assignments
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    for (const room of ownedRooms) {
      const swarm = memoryManager.getSwarmState(room.name);
      if (!swarm) continue;

      // Check remote room status and remove lost remotes
      checkRemoteRoomStatus(room.name);

      const remoteAssignments = swarm.remoteAssignments ?? [];
      if (remoteAssignments.length === 0) continue;

      // Plan infrastructure for each remote room
      for (const remoteName of remoteAssignments) {
        this.planRemoteInfrastructure(room, remoteName);
      }

      // Place roads to remote rooms (in home room and along the path)
      this.placeRemoteRoads(room, remoteAssignments);
    }
  }

  /**
   * Plan and build infrastructure in a remote room
   */
  private planRemoteInfrastructure(homeRoom: Room, remoteName: string): void {
    const remoteRoom = Game.rooms[remoteName];
    if (!remoteRoom) {
      // Can't see the remote room yet - scouts need to explore it
      return;
    }

    // Check if we have controller reservation to avoid conflicts
    const controller = remoteRoom.controller;
    const myUsername = this.getMyUsername();
    
    // Only build in neutral rooms or rooms reserved by us
    if (controller) {
      if (controller.owner && controller.owner.username !== myUsername) {
        // Room is owned by someone else
        return;
      }
      if (controller.reservation && controller.reservation.username !== myUsername) {
        // Room is reserved by someone else
        return;
      }
    }

    // Find sources and place containers
    const sources = remoteRoom.find(FIND_SOURCES);
    let sitesPlaced = 0;

    for (const source of sources) {
      if (sitesPlaced >= this.config.maxSitesPerRemotePerTick) break;

      const placed = this.placeSourceContainer(remoteRoom, source);
      if (placed) sitesPlaced++;
    }
  }

  /**
   * Place a container at a source if it doesn't exist
   */
  private placeSourceContainer(room: Room, source: Source): boolean {
    // Check if container already exists
    const existingStructures = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    });

    if (existingStructures.length > 0) {
      // Container already exists
      return false;
    }

    // Check if construction site already exists
    const existingSites = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
    });

    if (existingSites.length > 0) {
      // Construction site already exists
      return false;
    }

    // Find best position for container (adjacent to source)
    const containerPos = this.findBestContainerPosition(source);
    if (!containerPos) {
      logger.warn(`Could not find valid position for container at source ${source.id} in ${room.name}`, {
        subsystem: "RemoteInfra"
      });
      return false;
    }

    // Check construction site limit
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length >= MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM) {
      // Too many construction sites in this room already
      return false;
    }

    // Place construction site
    const result = room.createConstructionSite(containerPos.x, containerPos.y, STRUCTURE_CONTAINER);
    if (result === OK) {
      logger.info(`Placed container construction site at source ${source.id} in ${room.name}`, {
        subsystem: "RemoteInfra"
      });
      return true;
    } else {
      logger.debug(`Failed to place container at source ${source.id} in ${room.name}: ${result}`, {
        subsystem: "RemoteInfra"
      });
      return false;
    }
  }

  /**
   * Find the best position for a container adjacent to a source
   */
  private findBestContainerPosition(source: Source): { x: number; y: number } | null {
    const room = source.room;
    const terrain = room.getTerrain();

    // Check all positions adjacent to source
    const candidates: { x: number; y: number; score: number }[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip source itself

        const x = source.pos.x + dx;
        const y = source.pos.y + dy;

        // Check bounds
        if (x < 1 || x > 48 || y < 1 || y > 48) continue;

        // Check terrain
        if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

        // Check for existing structures
        const pos = new RoomPosition(x, y, room.name);
        const structures = pos.lookFor(LOOK_STRUCTURES);
        if (structures.length > 0) continue;

        // Count walkable neighbors (better positions have more access)
        let walkableNeighbors = 0;
        for (let dx2 = -1; dx2 <= 1; dx2++) {
          for (let dy2 = -1; dy2 <= 1; dy2++) {
            if (dx2 === 0 && dy2 === 0) continue;
            const nx = x + dx2;
            const ny = y + dy2;
            if (nx >= 1 && nx <= 48 && ny >= 1 && ny <= 48) {
              if (terrain.get(nx, ny) !== TERRAIN_MASK_WALL) {
                walkableNeighbors++;
              }
            }
          }
        }

        candidates.push({ x, y, score: walkableNeighbors });
      }
    }

    if (candidates.length === 0) return null;

    // Sort by score (most walkable neighbors first)
    candidates.sort((a, b) => b.score - a.score);

    return candidates[0];
  }

  /**
   * Place roads to remote rooms using the road network planner
   */
  private placeRemoteRoads(homeRoom: Room, remoteRooms: string[]): void {
    // Calculate remote roads (this returns roads grouped by room)
    const remoteRoadsByRoom = calculateRemoteRoads(homeRoom, remoteRooms);

    // Place roads in home room
    const homeRoads = remoteRoadsByRoom.get(homeRoom.name);
    if (homeRoads) {
      this.placeRoadsInRoom(homeRoom, homeRoads);
    }

    // Place roads in remote rooms (if we have vision)
    for (const remoteName of remoteRooms) {
      const remoteRoom = Game.rooms[remoteName];
      if (!remoteRoom) continue;

      const remoteRoads = remoteRoadsByRoom.get(remoteName);
      if (remoteRoads) {
        this.placeRoadsInRoom(remoteRoom, remoteRoads);
      }
    }
  }

  /**
   * Place road construction sites in a room from a set of positions
   */
  private placeRoadsInRoom(room: Room, roadPositions: Set<string>): void {
    const existingSites = room.find(FIND_CONSTRUCTION_SITES);
    const existingRoads = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_ROAD
    });

    // Check construction site limit
    if (existingSites.length >= MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM) return;

    const existingRoadSet = new Set(existingRoads.map(r => `${r.pos.x},${r.pos.y}`));
    const existingSiteSet = new Set(
      existingSites.filter(s => s.structureType === STRUCTURE_ROAD).map(s => `${s.pos.x},${s.pos.y}`)
    );

    const terrain = room.getTerrain();
    let placed = 0;

    for (const posKey of roadPositions) {
      if (placed >= MAX_ROAD_SITES_PER_TICK) break;
      if (existingSites.length + placed >= MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM) break;

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

    if (placed > 0) {
      logger.debug(`Placed ${placed} remote road construction sites in ${room.name}`, {
        subsystem: "RemoteInfra"
      });
    }
  }

  /**
   * Get my username (cached)
   */
  private getMyUsername(): string {
    const spawns = Object.values(Game.spawns);
    if (spawns.length > 0) {
      return spawns[0].owner.username;
    }
    return "";
  }
}

/**
 * Global remote infrastructure manager instance
 */
export const remoteInfrastructureManager = new RemoteInfrastructureManager();
