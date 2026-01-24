/**
 * Room Node - Per-room main loop (Orchestration layer)
 *
 * Coordinates room operations using focused manager modules:
 * - RoomDefenseManager: Tower control, threat assessment, hostile detection
 * - RoomConstructionManager: Blueprints, perimeter defense, roads, ramparts
 * - RoomEconomyManager: Labs, factory, power spawn, links
 * 
 * This file provides orchestration only, delegating specific responsibilities
 * to dedicated manager modules for better separation of concerns.
 */

import { prefetchRoomObjects } from "@ralphschuler/screeps-cache";
import { emergencyResponseManager, safeModeManager } from "@ralphschuler/screeps-defense";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import { evolutionManager, postureManager } from "../logic/evolution";
import { pheromoneManager } from "../logic/pheromone";
import { memoryManager } from "../memory/manager";
import type { SwarmState } from "../memory/schemas";
import { logger } from "./logger";
import { roomConstructionManager, roomDefenseManager, roomEconomyManager } from "./managers";

/**
 * Room node configuration
 */
export interface RoomNodeConfig {
  /** Enable pheromone updates */
  enablePheromones: boolean;
  /** Enable evolution updates */
  enableEvolution: boolean;
  /** Enable spawn logic */
  enableSpawning: boolean;
  /** Enable construction */
  enableConstruction: boolean;
  /** Enable tower control */
  enableTowers: boolean;
  /** Enable resource processing */
  enableProcessing: boolean;
}

const DEFAULT_CONFIG: RoomNodeConfig = {
  enablePheromones: true,
  enableEvolution: true,
  enableSpawning: true,
  enableConstruction: true,
  enableTowers: true,
  enableProcessing: true
};

/**
 * Per-tick cache for room structures to avoid repeated find() calls
 */
interface RoomStructureCache {
  tick: number;
  towers: StructureTower[];
  spawns: StructureSpawn[];
  links: StructureLink[];
  factory: StructureFactory | undefined;
  powerSpawn: StructurePowerSpawn | undefined;
  sources: Source[];
  constructionSites: ConstructionSite[];
}

const structureCache = new Map<string, RoomStructureCache>();



/**
 * Get or create structure cache for a room
 */
function getStructureCache(room: Room): RoomStructureCache {
  const existing = structureCache.get(room.name);
  if (existing && existing.tick === Game.time) {
    return existing;
  }

  const myStructures = room.find(FIND_MY_STRUCTURES);
  const cache: RoomStructureCache = {
    tick: Game.time,
    towers: myStructures.filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER),
    spawns: myStructures.filter((s): s is StructureSpawn => s.structureType === STRUCTURE_SPAWN),
    links: myStructures.filter((s): s is StructureLink => s.structureType === STRUCTURE_LINK),
    factory: myStructures.find((s): s is StructureFactory => s.structureType === STRUCTURE_FACTORY),
    powerSpawn: myStructures.find((s): s is StructurePowerSpawn => s.structureType === STRUCTURE_POWER_SPAWN),
    sources: room.find(FIND_SOURCES),
    constructionSites: room.find(FIND_MY_CONSTRUCTION_SITES)
  };

  structureCache.set(room.name, cache);
  return cache;
}

/**
 * Room Node class - manages a single room
 */
export class RoomNode {
  public readonly roomName: string;
  private config: RoomNodeConfig;

  public constructor(roomName: string, config: Partial<RoomNodeConfig> = {}) {
    this.roomName = roomName;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main room tick
   */
  public run(totalOwnedRooms: number): void {
    const cpuStart = unifiedStats.startRoom(this.roomName);

    const room = Game.rooms[this.roomName];
    if (!room || !room.controller?.my) {
      unifiedStats.endRoom(this.roomName, cpuStart);
      return;
    }

    // OPTIMIZATION: Prefetch commonly accessed room objects to warm the object cache.
    // This saves CPU when multiple creeps access the same objects (storage, sources, etc.)
    // With 50+ creeps per room, this can save 1-2 CPU per tick.
    prefetchRoomObjects(room);

    // Get or initialize swarm state
    const swarm = memoryManager.getOrInitSwarmState(this.roomName);

    // Update metrics (only every 5 ticks to match pheromone update interval)
    // This avoids expensive room.find() calls every tick
    if (this.config.enablePheromones && Game.time % 5 === 0) {
      pheromoneManager.updateMetrics(room, swarm);
    }

    // Update threat assessment
    roomDefenseManager.updateThreatAssessment(room, swarm, { spawns: cache.spawns, towers: cache.towers });

    // Assess emergency situation and coordinate response
    emergencyResponseManager.assess(room, swarm);

    // Check safe mode trigger
    safeModeManager.checkSafeMode(room, swarm);

    // Update evolution stage
    if (this.config.enableEvolution) {
      evolutionManager.updateEvolutionStage(swarm, room, totalOwnedRooms);
      evolutionManager.updateMissingStructures(swarm, room);
    }

    // Update posture
    postureManager.updatePosture(swarm);

    // Update pheromones
    if (this.config.enablePheromones) {
      pheromoneManager.updatePheromones(swarm, room);
    }

    // Run tower control
    if (this.config.enableTowers) {
      roomDefenseManager.runTowerControl(room, swarm, cache.towers);
    }

    // Run construction
    // Perimeter defense runs more frequently in early game (RCL 2-3) for faster fortification
    // Regular construction runs at standard interval to balance CPU usage
    if (this.config.enableConstruction && postureManager.allowsBuilding(swarm.posture)) {
      const rcl = room.controller?.level ?? 1;
      const constructionInterval = roomConstructionManager.getConstructionInterval(rcl);

      if (Game.time % constructionInterval === 0) {
        roomConstructionManager.runConstruction(room, swarm, cache.constructionSites, cache.spawns);
      }
    }

    // Run resource processing (every 5 ticks)
    if (this.config.enableProcessing && Game.time % 5 === 0) {
      roomEconomyManager.runResourceProcessing(room, swarm, {
        factory: cache.factory,
        powerSpawn: cache.powerSpawn,
        links: cache.links,
        sources: cache.sources
      });
    }

    // Record room stats with unified stats system
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    unifiedStats.recordRoom(room, cpuUsed);
    unifiedStats.endRoom(this.roomName, cpuStart);
  }
}

/**
 * Room manager - orchestrates all room nodes
 */
export class RoomManager {
  private nodes: Map<string, RoomNode> = new Map();

  /**
   * Run all owned rooms
   * OPTIMIZATION: Use cached owned rooms list from global to avoid repeated filter
   */
  public run(): void {
    // Use cached owned rooms from global (set in main loop)
    const cacheKey = "_ownedRooms";
    const cacheTickKey = "_ownedRoomsTick";
    const globalCache = global as unknown as Record<string, Room[] | number | undefined>;
    const cachedRooms = globalCache[cacheKey] as Room[] | undefined;
    const cachedTick = globalCache[cacheTickKey] as number | undefined;

    let ownedRooms: Room[];
    if (cachedRooms && cachedTick === Game.time) {
      ownedRooms = cachedRooms;
    } else {
      // Fallback if cache not set (shouldn't happen, but safe)
      ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    }
    const totalOwned = ownedRooms.length;

    // Ensure nodes exist for all owned rooms
    for (const room of ownedRooms) {
      if (!this.nodes.has(room.name)) {
        this.nodes.set(room.name, new RoomNode(room.name));
      }
    }

    // Clean up nodes for rooms we no longer own
    for (const [name] of this.nodes) {
      const room = Game.rooms[name];
      if (!room || !room.controller?.my) {
        this.nodes.delete(name);
      }
    }

    // Run each node with error recovery
    for (const node of this.nodes.values()) {
      try {
        node.run(totalOwned);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error && err.stack ? err.stack : undefined;
        logger.error(`Error in room ${node.roomName}: ${errorMessage}`, {
          subsystem: "RoomManager",
          room: node.roomName,
          meta: { stack }
        });
        // Continue processing other rooms
      }
    }
  }

  /**
   * Get node for a room
   */
  public getNode(roomName: string): RoomNode | undefined {
    return this.nodes.get(roomName);
  }

  /**
   * Get all nodes
   */
  public getAllNodes(): RoomNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Run a specific room (for kernel process integration)
   * Creates or gets the node for the room and runs it
   */
  public runRoom(room: Room): void {
    if (!room.controller?.my) {
      return;
    }

    // Ensure node exists for this room
    if (!this.nodes.has(room.name)) {
      this.nodes.set(room.name, new RoomNode(room.name));
    }

    // Get total owned rooms count (cached in global)
    const cacheKey = "_ownedRooms";
    const cacheTickKey = "_ownedRoomsTick";
    const globalCache = global as unknown as Record<string, Room[] | number | undefined>;
    const cachedRooms = globalCache[cacheKey] as Room[] | undefined;
    const cachedTick = globalCache[cacheTickKey] as number | undefined;

    let totalOwned: number;
    if (cachedRooms && cachedTick === Game.time) {
      totalOwned = cachedRooms.length;
    } else {
      // Fallback: count owned rooms
      totalOwned = Object.values(Game.rooms).filter(r => r.controller?.my).length;
    }

    // Run the node
    const node = this.nodes.get(room.name)!;
    try {
      node.run(totalOwned);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error && err.stack ? err.stack : undefined;
      logger.error(`Error in room ${room.name}: ${errorMessage}`, {
        subsystem: "RoomManager",
        room: room.name,
        meta: { stack }
      });
    }
  }
}

/**
 * Global room manager instance
 */
export const roomManager = new RoomManager();
