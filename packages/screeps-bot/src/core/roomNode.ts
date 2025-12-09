/**
 * Room Node - Per-room main loop
 *
 * Handles all per-room operations:
 * - Initialize/read RoomMemory.swarm
 * - Update metrics and pheromones
 * - Determine evolution stage and posture
 * - Run spawn logic
 * - Run creep role logic
 * - Run towers & structure control
 * - Run base construction
 */

import type { SwarmState } from "../memory/schemas";
import { memoryManager } from "../memory/manager";
import { pheromoneManager } from "../logic/pheromone";
import { calculateDangerLevel, evolutionManager, postureManager } from "../logic/evolution";
import { unifiedStats } from "./unifiedStats";
import { destroyMisplacedStructures, getBlueprint, placeConstructionSites } from "../layouts/blueprints";
import { placeRoadConstructionSites } from "../layouts/roadNetworkPlanner";
import { safeFind } from "../utils/safeFind";
import { safeModeManager } from "../defense/safeModeManager";
import { placePerimeterDefense } from "../defense/perimeterDefense";
import { calculateWallRepairTarget } from "../defense/wallRepairTargets";
import { chemistryPlanner } from "../labs/chemistryPlanner";
import { boostManager } from "../labs/boostManager";
import { kernel } from "./kernel";
import { prefetchRoomObjects } from "../utils/objectCache";

/**
 * Perimeter defense configuration constants
 * These values control how aggressively rooms build defensive walls
 */
const EARLY_GAME_RCL_MIN = 2;
const EARLY_GAME_RCL_MAX = 3;
const MAX_EARLY_PERIMETER_SITES = 5; // RCL 2-3: Aggressive defense buildup
const MAX_REGULAR_PERIMETER_SITES = 3; // RCL 4+: Maintenance rate
const EARLY_GAME_CONSTRUCTION_INTERVAL = 5; // Ticks between construction checks
const REGULAR_CONSTRUCTION_INTERVAL = 10; // Ticks between construction checks

/**
 * Check if a room is in early game and needs aggressive defense
 */
function isEarlyGameDefense(rcl: number): boolean {
  return rcl >= EARLY_GAME_RCL_MIN && rcl <= EARLY_GAME_RCL_MAX;
}

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
    this.updateThreatAssessment(room, swarm);

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
      this.runTowerControl(room, swarm);
    }

    // Run construction
    // Perimeter defense runs more frequently in early game (RCL 2-3) for faster fortification
    // Regular construction runs at standard interval to balance CPU usage
    if (this.config.enableConstruction && postureManager.allowsBuilding(swarm.posture)) {
      const rcl = room.controller?.level ?? 1;
      const isEarlyDefense = isEarlyGameDefense(rcl);
      const constructionInterval = isEarlyDefense 
        ? EARLY_GAME_CONSTRUCTION_INTERVAL
        : REGULAR_CONSTRUCTION_INTERVAL;
      
      if (Game.time % constructionInterval === 0) {
        this.runConstruction(room, swarm);
      }
    }

    // Run resource processing (every 5 ticks)
    if (this.config.enableProcessing && Game.time % 5 === 0) {
      this.runResourceProcessing(room, swarm);
    }

    // Record room stats with unified stats system
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    unifiedStats.recordRoom(room, cpuUsed);
    unifiedStats.endRoom(this.roomName, cpuStart);
  }

  /**
   * Update threat assessment.
   * Uses optimized iteration for better CPU efficiency.
   * Emits events through the kernel event system for centralized handling.
   * OPTIMIZATION: Only check enemy structures if hostiles are present or danger > 0
   */
  private updateThreatAssessment(room: Room, swarm: SwarmState): void {
    // Track structure count changes to detect destroyed structures
    // Only check every 5 ticks to reduce CPU usage
    if (Game.time % 5 === 0) {
      const cache = getStructureCache(room);
      const currentStructureCount = cache.spawns.length + cache.towers.length;
      const lastCount = (swarm as unknown as Record<string, number>)._lastStructureCount ?? currentStructureCount;
      
      if (currentStructureCount < lastCount) {
        // Structure(s) destroyed - emit event for each critical structure type
        if (cache.spawns.length < ((swarm as unknown as Record<string, StructureSpawn[]>)._lastSpawns?.length ?? 0)) {
          kernel.emit("structure.destroyed", {
            roomName: this.roomName,
            structureType: STRUCTURE_SPAWN,
            structureId: "unknown",
            source: this.roomName
          });
        }
        if (cache.towers.length < ((swarm as unknown as Record<string, StructureTower[]>)._lastTowers?.length ?? 0)) {
          kernel.emit("structure.destroyed", {
            roomName: this.roomName,
            structureType: STRUCTURE_TOWER,
            structureId: "unknown",
            source: this.roomName
          });
        }
      }
      
      // Store counts for next tick
      (swarm as unknown as Record<string, number>)._lastStructureCount = currentStructureCount;
      (swarm as unknown as Record<string, StructureSpawn[]>)._lastSpawns = cache.spawns;
      (swarm as unknown as Record<string, StructureTower[]>)._lastTowers = cache.towers;
    }

    // Use safeFind to handle engine errors with corrupted owner data
    const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);

    // Only check enemy structures if we have hostiles or existing danger
    // This avoids expensive find() calls when room is peaceful
    const enemyStructures = (hostiles.length > 0 || swarm.danger > 0)
      ? safeFind(room, FIND_HOSTILE_STRUCTURES, {
          filter: s => s.structureType !== STRUCTURE_CONTROLLER
        })
      : [];

    // Calculate potential damage with efficient single-loop iteration
    let potentialDamage = 0;
    for (const hostile of hostiles) {
      for (const part of hostile.body) {
        if (part.hits > 0) {
          if (part.type === ATTACK) {
            potentialDamage += 30;
          } else if (part.type === RANGED_ATTACK) {
            potentialDamage += 10;
          }
        }
      }
    }

    const newDanger = calculateDangerLevel(hostiles.length, potentialDamage, enemyStructures.length > 0);

    // Update danger and emit events if increased
    if (newDanger > swarm.danger) {
      pheromoneManager.onHostileDetected(swarm, hostiles.length, newDanger);
      memoryManager.addRoomEvent(this.roomName, "hostileDetected", `${hostiles.length} hostiles, danger=${newDanger}`);

      // Emit hostile detected events for each hostile through the kernel event system
      for (const hostile of hostiles) {
        kernel.emit("hostile.detected", {
          roomName: this.roomName,
          hostileId: hostile.id,
          hostileOwner: hostile.owner.username,
          bodyParts: hostile.body.length,
          threatLevel: newDanger,
          source: this.roomName
        });
      }
    } else if (hostiles.length === 0 && swarm.danger > 0) {
      // Emit hostile cleared event when danger level drops to 0
      kernel.emit("hostile.cleared", {
        roomName: this.roomName,
        source: this.roomName
      });
    }

    swarm.danger = newDanger;

    // Check for nukes (only every 10 ticks to reduce CPU cost)
    // Nukes have a long flight time (~50k ticks), so checking every 10 ticks is sufficient
    if (Game.time % 10 === 0) {
      const nukes = room.find(FIND_NUKES);
      if (nukes.length > 0) {
        if (!swarm.nukeDetected) {
          pheromoneManager.onNukeDetected(swarm);
          const launchSource = nukes[0]?.launchRoomName ?? 'unidentified source';
          memoryManager.addRoomEvent(this.roomName, "nukeDetected", `${nukes.length} nuke(s) incoming from ${launchSource}`);
          swarm.nukeDetected = true;

          // Emit nuke detected events through kernel event system
          for (const nuke of nukes) {
            kernel.emit("nuke.detected", {
              roomName: this.roomName,
              nukeId: nuke.id,
              landingTick: Game.time + nuke.timeToLand,
              launchRoomName: nuke.launchRoomName,
              source: this.roomName
            });
          }
        }
      } else {
        // Reset flag when nukes are gone
        swarm.nukeDetected = false;
      }
    }
  }

  /**
   * Run tower control
   * OPTIMIZATION: Use cached structures to avoid repeated room.find() calls
   */
  private runTowerControl(room: Room, swarm: SwarmState): void {
    const cache = getStructureCache(room);
    const towers = cache.towers;

    if (towers.length === 0) return;

    // Find targets - use safeFind to handle engine errors with corrupted owner data
    const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);

    for (const tower of towers) {
      if (tower.store.getUsedCapacity(RESOURCE_ENERGY) < 10) continue;

      // Priority 1: Attack hostiles
      if (hostiles.length > 0) {
        // Target priority: healers > ranged > melee > others
        const target = this.selectTowerTarget(hostiles);
        if (target) {
          tower.attack(target);
          continue;
        }
      }

      // Priority 2: Heal damaged creeps (only in non-siege)
      if (swarm.posture !== "siege") {
        const damaged = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
          filter: c => c.hits < c.hitsMax
        });
        if (damaged) {
          tower.heal(damaged);
          continue;
        }
      }

      // Priority 3: Repair structures (only in non-war postures)
      if (!postureManager.isCombatPosture(swarm.posture)) {
        const damaged = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: s =>
            s.hits < s.hitsMax * 0.8 && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
        });
        if (damaged) {
          tower.repair(damaged);
          continue;
        }
      }

      // Priority 4: Repair walls and ramparts based on RCL and danger level
      // Only repair in peaceful conditions (no hostiles, non-combat posture)
      if (!postureManager.isCombatPosture(swarm.posture) && hostiles.length === 0) {
        const rcl = room.controller?.level ?? 1;
        const repairTarget = calculateWallRepairTarget(rcl, swarm.danger);
        const wallOrRampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: s =>
            (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) &&
            s.hits < repairTarget
        });
        if (wallOrRampart) {
          tower.repair(wallOrRampart);
        }
      }
    }
  }

  /**
   * Select tower attack target
   */
  private selectTowerTarget(hostiles: Creep[]): Creep | null {
    // Sort by priority: healers > boosted > ranged > melee > others
    const sorted = hostiles.sort((a, b) => {
      const scoreA = this.getHostilePriority(a);
      const scoreB = this.getHostilePriority(b);
      return scoreB - scoreA;
    });

    return sorted[0] ?? null;
  }

  /**
   * Get priority score for hostile targeting
   */
  private getHostilePriority(hostile: Creep): number {
    let score = 0;

    for (const part of hostile.body) {
      if (!part.hits) continue;

      switch (part.type) {
        case HEAL:
          score += 100;
          break;
        case RANGED_ATTACK:
          score += 50;
          break;
        case ATTACK:
          score += 40;
          break;
        case CLAIM:
          score += 60;
          break;
        case WORK:
          score += 30;
          break;
      }

      // Boosted parts are higher priority
      if (part.boost) {
        score += 20;
      }
    }

    return score;
  }

  /**
   * Run construction logic using blueprints
   */
  private runConstruction(room: Room, swarm: SwarmState): void {
    // Check global construction site limit (use cached structures)
    const cache = getStructureCache(room);
    const existingSites = cache.constructionSites;
    if (existingSites.length >= 10) return;

    // Get blueprint for current RCL
    const rcl = room.controller?.level ?? 1;
    const blueprint = getBlueprint(rcl);
    if (!blueprint) return;

    // Find spawn to use as anchor (use cached structures)
    const spawn = cache.spawns[0];
    if (!spawn) {
      // No spawn, place one if we're a new colony
      if (rcl === 1 && existingSites.length === 0) {
        // Find a suitable position for first spawn (use cached sources)
        const controller = room.controller;
        if (controller) {
          const sources = cache.sources;
          // Find position between controller and sources
          const avgX = Math.round(
            (controller.pos.x + sources.reduce((sum, s) => sum + s.pos.x, 0)) / (sources.length + 1)
          );
          const avgY = Math.round(
            (controller.pos.y + sources.reduce((sum, s) => sum + s.pos.y, 0)) / (sources.length + 1)
          );

          // Check if position is buildable
          const terrain = room.getTerrain();
          if (terrain.get(avgX, avgY) !== TERRAIN_MASK_WALL) {
            room.createConstructionSite(avgX, avgY, STRUCTURE_SPAWN);
          }
        }
      }
      return;
    }

    // Destroy misplaced structures that don't match the blueprint
    // Runs every construction tick (10 ticks) in non-combat postures for faster cleanup
    // Pass remote room assignments to preserve roads leading to remote mining rooms
    if (!postureManager.isCombatPosture(swarm.posture)) {
      const destroyed = destroyMisplacedStructures(room, spawn.pos, blueprint, 1, swarm.remoteAssignments);
      if (destroyed > 0) {
        const structureWord = destroyed === 1 ? "structure" : "structures";
        memoryManager.addRoomEvent(this.roomName, "structureDestroyed", `${destroyed} misplaced ${structureWord} destroyed for blueprint compliance`);
      }
    }

    // Priority 1: Place perimeter defense (RCL 2+)
    // Early defense is critical for room security
    let perimeterPlaced = 0;
    if (rcl >= EARLY_GAME_RCL_MIN && existingSites.length < 8) {
      // Place more sites in early game for faster fortification
      const maxPerimeterSites = isEarlyGameDefense(rcl)
        ? MAX_EARLY_PERIMETER_SITES
        : MAX_REGULAR_PERIMETER_SITES;
      // Prioritize choke points at RCL 2, full perimeter at RCL 3+
      perimeterPlaced = placePerimeterDefense(room, rcl, maxPerimeterSites, true);
    }

    // Priority 2: Place construction sites using blueprint
    const placed = placeConstructionSites(room, spawn.pos, blueprint);

    // Priority 3: Place road construction sites for infrastructure routes (sources, controller, mineral)
    // Only place 1-2 road sites per tick to avoid overwhelming builders
    const roadSitesPlaced = placeRoadConstructionSites(room, spawn.pos, 2);

    // Update metrics
    swarm.metrics.constructionSites = existingSites.length + placed + roadSitesPlaced + perimeterPlaced;
  }

  /**
   * Run resource processing (labs, factory, power spawn)
   */
  private runResourceProcessing(room: Room, _swarm: SwarmState): void {
    const rcl = room.controller?.level ?? 0;

    // Run labs (RCL 6+)
    if (rcl >= 6) {
      this.runLabs(room);
    }

    // Run factory (RCL 7+)
    if (rcl >= 7) {
      this.runFactory(room);
    }

    // Run power spawn (RCL 8)
    if (rcl >= 8) {
      this.runPowerSpawn(room);
    }

    // Run links
    this.runLinks(room);
  }

  /**
   * Run lab reactions
   */
  private runLabs(room: Room): void {
    const swarm = memoryManager.getSwarmState(room.name);
    if (!swarm) return;

    // Prepare labs for boosting when danger is high
    boostManager.prepareLabs(room, swarm);

    // Plan reactions using chemistry planner
    const reaction = chemistryPlanner.planReactions(room, swarm);
    if (reaction) {
      chemistryPlanner.executeReaction(room, reaction);
    }
  }

  /**
   * Run factory production
   * OPTIMIZATION: Use cached structures
   */
  private runFactory(room: Room): void {
    const cache = getStructureCache(room);
    const factory = cache.factory;

    if (!factory || factory.cooldown > 0) return;

    // Simple commodity production - compress minerals
    const minerals: MineralConstant[] = [
      RESOURCE_UTRIUM,
      RESOURCE_LEMERGIUM,
      RESOURCE_KEANIUM,
      RESOURCE_ZYNTHIUM,
      RESOURCE_HYDROGEN,
      RESOURCE_OXYGEN
    ];

    for (const mineral of minerals) {
      if (factory.store.getUsedCapacity(mineral) >= 500 && factory.store.getUsedCapacity(RESOURCE_ENERGY) >= 200) {
        // Try to produce compressed bar
        const result = factory.produce(RESOURCE_UTRIUM_BAR); // Note: This is simplified
        if (result === OK) break;
      }
    }
  }

  /**
   * Run power spawn
   * OPTIMIZATION: Use cached structures
   */
  private runPowerSpawn(room: Room): void {
    const cache = getStructureCache(room);
    const powerSpawn = cache.powerSpawn;

    if (!powerSpawn) return;

    // Process power if we have resources
    if (
      powerSpawn.store.getUsedCapacity(RESOURCE_POWER) >= 1 &&
      powerSpawn.store.getUsedCapacity(RESOURCE_ENERGY) >= 50
    ) {
      powerSpawn.processPower();
    }
  }

  /**
   * Run link transfers
   * OPTIMIZATION: Use cached structures
   */
  private runLinks(room: Room): void {
    const cache = getStructureCache(room);
    const links = cache.links;

    if (links.length < 2) return;

    const storage = room.storage;
    if (!storage) return;

    // Find storage link (within 2 of storage)
    const storageLink = links.find(l => l.pos.getRangeTo(storage) <= 2);
    if (!storageLink) return;

    // Find source links (links near sources) - use cached sources
    const sources = cache.sources;
    const sourceLinks = links.filter(l => sources.some(s => l.pos.getRangeTo(s) <= 2));

    // Transfer from source links to storage link
    for (const sourceLink of sourceLinks) {
      if (sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) >= 400 && sourceLink.cooldown === 0) {
        if (storageLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 400) {
          sourceLink.transferEnergy(storageLink);
          break;
        }
      }
    }
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
        console.log(`[RoomManager] ERROR in room ${node.roomName}: ${errorMessage}`);
        if (err instanceof Error && err.stack) {
          console.log(err.stack);
        }
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
      console.log(`[RoomManager] ERROR in room ${room.name}: ${errorMessage}`);
      if (err instanceof Error && err.stack) {
        console.log(err.stack);
      }
    }
  }
}

/**
 * Global room manager instance
 */
export const roomManager = new RoomManager();
