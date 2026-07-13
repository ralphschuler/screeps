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

import { getOwnedRooms, prefetchRoomObjects } from "@ralphschuler/screeps-cache";
import { emergencyResponseManager, safeModeManager } from "@ralphschuler/screeps-defense";
import { memoryManager, type ConstructionScheduleMemory } from "@ralphschuler/screeps-memory";
import { pheromoneManager } from "@ralphschuler/screeps-pheromones";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import { evolutionManager, postureManager } from "../logic/evolution";
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

export interface RoomConstructionScheduleOwner {
  constructionSchedule?: ConstructionScheduleMemory;
}

function normalizeConstructionInterval(interval: number): number {
  return Number.isFinite(interval) && interval >= 1 ? Math.floor(interval) : 1;
}

function getConstructionSchedule(swarm: RoomConstructionScheduleOwner): ConstructionScheduleMemory {
  if (!swarm.constructionSchedule || typeof swarm.constructionSchedule !== "object") {
    swarm.constructionSchedule = {};
  }
  return swarm.constructionSchedule;
}

/**
 * Construction cadence must be state-based, not exact-modulo based.
 * Room processes can be skipped under scheduler pressure; if the remembered due tick
 * was 1000 and the room next runs at 1003, construction should still execute once.
 */
export function isRoomConstructionDue(swarm: RoomConstructionScheduleOwner, time: number, interval: number): boolean {
  const normalizedInterval = normalizeConstructionInterval(interval);
  const schedule = getConstructionSchedule(swarm);
  if (typeof schedule.nextRunTick !== "number" || !Number.isFinite(schedule.nextRunTick)) {
    schedule.nextRunTick = time;
    schedule.interval = normalizedInterval;
  }

  return time >= schedule.nextRunTick;
}

export function recordRoomConstructionRun(swarm: RoomConstructionScheduleOwner, time: number, interval: number): void {
  const normalizedInterval = normalizeConstructionInterval(interval);
  const schedule = getConstructionSchedule(swarm);
  schedule.lastRunTick = time;
  schedule.nextRunTick = time + normalizedInterval;
  schedule.interval = normalizedInterval;
}

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

    try {
      const room = Game.rooms[this.roomName];
      if (!room || !room.controller?.my) {
        return;
      }

      const lowBucket = Game.cpu.bucket < 6000;

      // OPTIMIZATION: Prefetch commonly accessed room objects to warm the object cache.
      // Skip under bucket pressure; direct reads are cheaper than warming broad caches for small active rooms.
      if (!lowBucket) {
        prefetchRoomObjects(room);
      }

      // Get or initialize swarm state
      const swarm = memoryManager.getOrInitSwarmState(this.roomName);

      // Get cached room structures to avoid repeated room.find() calls
      const cache = getStructureCache(room);

      // Update metrics (only every 5 ticks to match pheromone update interval)
      // This avoids expensive room.find() calls every tick; defer signal-only metrics while bucket recovers.
      if (this.config.enablePheromones && !lowBucket && Game.time % 5 === 0) {
        pheromoneManager.updateMetrics(room, swarm);
      }

      // Update threat assessment and share the bounded nuke observation with the
      // emergency coordinator; both consumers must use the same room/tick snapshot.
      const observedNukes = roomDefenseManager.updateThreatAssessment(room, swarm, {
        spawns: cache.spawns,
        towers: cache.towers
      });

      // Assess emergency situation and coordinate response
      emergencyResponseManager.assess(room, swarm, observedNukes);

      // Check safe mode trigger
      safeModeManager.checkSafeMode(room, swarm);

      // Update evolution stage. Missing-structure scans are planning work; skip during recovery.
      if (this.config.enableEvolution) {
        evolutionManager.updateEvolutionStage(swarm, room, totalOwnedRooms);
        if (!lowBucket) {
          evolutionManager.updateMissingStructures(swarm, room);
        }
      }

      // Update posture
      postureManager.updatePosture(swarm);

      // Update pheromones. These are strategic signals, not survival work, under bucket pressure.
      if (this.config.enablePheromones && !lowBucket) {
        pheromoneManager.updatePheromones(swarm, room);
      }

      // Run tower control
      if (this.config.enableTowers) {
        roomDefenseManager.runTowerControl(room, swarm, cache.towers);
      }

      // Run construction
      // Perimeter defense runs more frequently in early game (RCL 2-3) for faster fortification
      // Regular construction runs at standard interval to balance CPU usage. During bucket
      // recovery, only spawnless bootstrap or active-danger construction may run, and both
      // paths are forced through the manager's capped critical-only branch.
      const allowLowBucketCriticalRecovery = cache.spawns.length === 0 || swarm.danger >= 2;
      if (this.config.enableConstruction && (!lowBucket || allowLowBucketCriticalRecovery)) {
        const rcl = room.controller?.level ?? 1;
        const constructionInterval = roomConstructionManager.getConstructionInterval(rcl);
        const allowFullConstruction = postureManager.allowsBuilding(swarm.posture);
        const allowCriticalDefenseConstruction = !allowFullConstruction && swarm.danger >= 2;
        const criticalOnly = allowCriticalDefenseConstruction || (lowBucket && allowLowBucketCriticalRecovery);

        if ((allowFullConstruction || criticalOnly) && isRoomConstructionDue(swarm, Game.time, constructionInterval)) {
          roomConstructionManager.runConstruction(room, swarm, cache.constructionSites, cache.spawns, {
            criticalOnly
          });
          recordRoomConstructionRun(swarm, Game.time, constructionInterval);
        }
      }

      // Run resource processing (every 5 ticks)
      if (this.config.enableProcessing && !lowBucket && Game.time % 5 === 0) {
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
    } finally {
      // Always close the room measurement, including failed collaborator runs.
      unifiedStats.endRoom(this.roomName, cpuStart);
    }
  }
}

/**
 * Room manager - orchestrates all room nodes
 */
export class RoomManager {
  private nodes: Map<string, RoomNode> = new Map();

  /**
   * Run all owned rooms.
   */
  public run(): void {
    const ownedRooms = getOwnedRooms();
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

    const totalOwned = getOwnedRooms().length;

    // Run the node
    const node = this.nodes.get(room.name)!;
    // Kernel-owned room processes must observe failures so their health counters,
    // backoff, and circuit breaker can react. The bulk RoomManager.run() path
    // retains the fault-isolating catch above for non-kernel callers.
    node.run(totalOwned);
  }
}

/**
 * Global room manager instance
 */
export const roomManager = new RoomManager();
