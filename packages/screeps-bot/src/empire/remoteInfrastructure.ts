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
import { calculateRemoteRoads } from "@ralphschuler/screeps-layouts";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { getConfig } from "../config";
import { ProcessPriority } from "../core/kernel";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";
import {
  type RemoteInfrastructureIntent,
  type RemoteInfrastructurePositionSnapshot,
  type RemoteInfrastructureRoomSnapshot,
  type RemoteInfrastructureSnapshot,
  planRemoteInfrastructureIntent
} from "./remoteInfrastructureIntent";
import { checkRemoteRoomStatus } from "./remoteRoomManager";

/**
 * Construction site limit per room (Screeps game limit is 100, but we use lower limit for remote rooms)
 */
const MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM = 5;

/**
 * Maximum number of road construction sites to place per room per tick
 */
const MAX_ROAD_SITES_PER_TICK = 3;
const REMOTE_ROAD_CACHE_TTL = 1500;

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

const REMOTE_INFRASTRUCTURE_MIN_BUCKET = getConfig().cpu.bucketThresholds.highMode + 1800;

const DEFAULT_CONFIG: RemoteInfrastructureConfig = {
  updateInterval: 250,
  minBucket: REMOTE_INFRASTRUCTURE_MIN_BUCKET,
  maxSitesPerRemotePerTick: 2
};

function measureCpuDetail<T>(name: string, fn: () => T): T {
  const profiler = (globalThis as unknown as { cpuProfiler?: { measure?: <R>(label: string, work: () => R) => R } }).cpuProfiler;
  return profiler?.measure ? profiler.measure(name, fn) : fn();
}

/**
 * Remote Infrastructure Manager Class
 */
@ProcessClass()
export class RemoteInfrastructureManager {
  private config: RemoteInfrastructureConfig;
  private remoteRoadCache = new Map<string, { expires: number; roads: Map<string, Set<string>> }>();

  public constructor(config: Partial<RemoteInfrastructureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main infrastructure tick - runs periodically
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("remote:infrastructure", "Remote Infrastructure Manager", {
    priority: ProcessPriority.LOW,
    interval: 1000,
    minBucket: REMOTE_INFRASTRUCTURE_MIN_BUCKET,
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

      const intent = measureCpuDetail("remoteInfrastructure.intent", () => this.getRemoteInfrastructureIntent(room, remoteAssignments));
      measureCpuDetail("remoteInfrastructure.execute", () => this.executeRemoteInfrastructureIntent(intent));
    }
  }

  /**
   * Build observable construction intent for remote infrastructure before mutating rooms.
   */
  public getRemoteInfrastructureIntent(homeRoom: Room, remoteAssignments: string[]): RemoteInfrastructureIntent {
    const snapshot = this.getRemoteInfrastructureSnapshot(homeRoom, remoteAssignments);
    return planRemoteInfrastructureIntent(snapshot);
  }

  private getRemoteInfrastructureSnapshot(homeRoom: Room, remoteAssignments: string[]): RemoteInfrastructureSnapshot {
    const remoteRoadsByRoom = measureCpuDetail("remoteInfrastructure.remoteRoadCache", () => this.getCachedRemoteRoads(homeRoom, remoteAssignments));
    const visibleRooms: Record<string, RemoteInfrastructureRoomSnapshot> = {};

    const myUsername = this.getMyUsername();
    for (const roomName of [homeRoom.name, ...remoteAssignments]) {
      const room = Game.rooms[roomName];
      if (!room) continue;
      const isRemoteRoom = roomName !== homeRoom.name;
      visibleRooms[roomName] = measureCpuDetail("remoteInfrastructure.roomSnapshot", () =>
        this.getRoomSnapshot(room, remoteRoadsByRoom.get(roomName) ?? new Set<string>(), {
          includeSources: isRemoteRoom,
          myUsername
        })
      );
    }

    return {
      homeRoomName: homeRoom.name,
      myUsername: this.getMyUsername(),
      remoteAssignments,
      visibleRooms,
      maxSitesPerRemotePerTick: this.config.maxSitesPerRemotePerTick,
      maxConstructionSitesPerRoom: MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM,
      maxRoadSitesPerRoomPerTick: MAX_ROAD_SITES_PER_TICK
    };
  }

  private getCachedRemoteRoads(homeRoom: Room, remoteAssignments: string[]): Map<string, Set<string>> {
    const key = this.getRemoteRoadCacheKey(homeRoom, remoteAssignments);
    const cached = this.remoteRoadCache.get(key);
    if (cached && cached.expires > Game.time) {
      return cached.roads;
    }

    const roads = measureCpuDetail("remoteInfrastructure.calculateRemoteRoads", () => calculateRemoteRoads(homeRoom, remoteAssignments));
    this.remoteRoadCache.set(key, { expires: Game.time + REMOTE_ROAD_CACHE_TTL, roads });
    this.pruneRemoteRoadCache();
    return roads;
  }

  private getRemoteRoadCacheKey(homeRoom: Room, remoteAssignments: string[]): string {
    const hub = homeRoom.storage?.pos ?? homeRoom.find(FIND_MY_SPAWNS)[0]?.pos;
    const hubKey = hub ? `${hub.x},${hub.y}` : "no-hub";
    return `${homeRoom.name}:${hubKey}:${[...remoteAssignments].sort().join("|")}`;
  }

  private pruneRemoteRoadCache(): void {
    if (this.remoteRoadCache.size <= 50) return;
    for (const [key, value] of this.remoteRoadCache) {
      if (value.expires <= Game.time) {
        this.remoteRoadCache.delete(key);
      }
    }
  }

  private getRoomSnapshot(
    room: Room,
    roadPositions: Set<string>,
    options: { includeSources: boolean; myUsername: string }
  ): RemoteInfrastructureRoomSnapshot {
    const constructionSites = measureCpuDetail("remoteInfrastructure.findConstructionSites", () => room.find(FIND_CONSTRUCTION_SITES));
    const controller = {
      ownerUsername: room.controller?.owner?.username,
      reservationUsername: room.controller?.reservation?.username
    };
    const canBuildInRoom =
      (controller.ownerUsername === undefined || controller.ownerUsername === options.myUsername) &&
      (controller.reservationUsername === undefined || controller.reservationUsername === options.myUsername);
    const hasSiteCapacity = constructionSites.length < MAX_CONSTRUCTION_SITES_PER_REMOTE_ROOM;
    const shouldInspectRoads = roadPositions.size > 0 && hasSiteCapacity;
    const roadSites = shouldInspectRoads ? constructionSites.filter(site => site.structureType === STRUCTURE_ROAD) : [];
    const roads = shouldInspectRoads
      ? measureCpuDetail("remoteInfrastructure.findRoads", () => room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_ROAD }))
      : [];
    const terrain = shouldInspectRoads ? room.getTerrain() : undefined;
    const parsedRoadPositions = shouldInspectRoads
      ? [...roadPositions].map(posKey => {
          const [xStr, yStr] = posKey.split(",");
          return { x: parseInt(xStr, 10), y: parseInt(yStr, 10) };
        })
      : [];

    return {
      name: room.name,
      constructionSiteCount: constructionSites.length,
      controller,
      sources: options.includeSources && canBuildInRoom && hasSiteCapacity
        ? measureCpuDetail("remoteInfrastructure.sourceSnapshots", () => this.getSourceSnapshots(room))
        : undefined,
      roadPositions: parsedRoadPositions,
      roadKeys: roads.map(road => `${road.pos.x},${road.pos.y}`),
      roadSiteKeys: roadSites.map(site => `${site.pos.x},${site.pos.y}`),
      wallKeys: terrain
        ? parsedRoadPositions
          .filter(pos => terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL)
          .map(pos => `${pos.x},${pos.y}`)
        : []
    };
  }

  private getSourceSnapshots(room: Room): RemoteInfrastructureRoomSnapshot["sources"] {
    return measureCpuDetail("remoteInfrastructure.findSources", () => room.find(FIND_SOURCES)).map(source => ({
      id: source.id,
      positions: this.getSourcePositionSnapshots(source)
    }));
  }

  private getSourcePositionSnapshots(source: Source): RemoteInfrastructurePositionSnapshot[] {
    const room = source.room;
    const terrain = room.getTerrain();
    const positions: RemoteInfrastructurePositionSnapshot[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const x = source.pos.x + dx;
        const y = source.pos.y + dy;
        if (x < 1 || x > 48 || y < 1 || y > 48) continue;
        if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

        const pos = new RoomPosition(x, y, room.name);
        const structures = pos.lookFor(LOOK_STRUCTURES);
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

        positions.push({
          x,
          y,
          walkableNeighbors: this.countWalkableNeighbors(room, x, y),
          hasStructure: structures.length > 0,
          hasContainer: structures.some(structure => structure.structureType === STRUCTURE_CONTAINER),
          hasContainerSite: sites.some(site => site.structureType === STRUCTURE_CONTAINER)
        });
      }
    }

    return positions;
  }

  private countWalkableNeighbors(room: Room, x: number, y: number): number {
    const terrain = room.getTerrain();
    let walkableNeighbors = 0;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 1 && nx <= 48 && ny >= 1 && ny <= 48 && terrain.get(nx, ny) !== TERRAIN_MASK_WALL) {
          walkableNeighbors++;
        }
      }
    }

    return walkableNeighbors;
  }

  private executeRemoteInfrastructureIntent(intent: RemoteInfrastructureIntent): void {
    for (const site of intent.containerSites) {
      const room = Game.rooms[site.roomName];
      if (!room) continue;
      const result = room.createConstructionSite(site.x, site.y, site.structureType);
      if (result === OK) {
        logger.info(`Placed container construction site at source ${site.sourceId} in ${site.roomName}`, {
          subsystem: "RemoteInfra"
        });
      } else {
        logger.debug(`Failed to place container at source ${site.sourceId} in ${site.roomName}: ${result}`, {
          subsystem: "RemoteInfra"
        });
      }
    }

    const roadCounts = new Map<string, number>();
    for (const site of intent.roadSites) {
      const room = Game.rooms[site.roomName];
      if (!room) continue;
      const result = room.createConstructionSite(site.x, site.y, site.structureType);
      if (result === OK) {
        roadCounts.set(site.roomName, (roadCounts.get(site.roomName) ?? 0) + 1);
      }
    }

    for (const [roomName, placed] of roadCounts) {
      logger.debug(`Placed ${placed} remote road construction sites in ${roomName}`, {
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
