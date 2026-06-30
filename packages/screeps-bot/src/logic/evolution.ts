/**
 * Evolution & Posture System managing room lifecycle stages and state transitions.
 */

import { globalCache } from "@ralphschuler/screeps-cache";
import { logger } from "@ralphschuler/screeps-core";
import type { EvolutionStage, RoomPosture, SwarmState } from "@ralphschuler/screeps-memory";
import { kernel } from "../core/kernel";

/** Evolution stage thresholds */
export interface EvolutionThresholds {
  rcl: number;
  minRooms?: number;
  minRemoteRooms?: number;
  minGcl?: number;
  requiresStorage?: boolean;
  requiresTerminal?: boolean;
  requiresLabs?: boolean;
  minLabCount?: number;
  requiresFactory?: boolean;
  requiresNuker?: boolean;
  requiresPowerSpawn?: boolean;
  requiresObserver?: boolean;
  minTowerCount?: number;
}

/** Evolution stage configurations */
export const EVOLUTION_STAGES: Record<EvolutionStage, EvolutionThresholds> = {
  seedNest: {
    rcl: 1
  },
  foragingExpansion: {
    rcl: 3,
    minRooms: 1,
    minRemoteRooms: 1,
    minTowerCount: 1
  },
  matureColony: {
    rcl: 4,
    requiresStorage: true,
    requiresTerminal: true,
    requiresLabs: true,
    minLabCount: 3,
    minTowerCount: 2
  },
  fortifiedHive: {
    rcl: 7,
    requiresTerminal: true,
    requiresLabs: true,
    minLabCount: 6,
    requiresFactory: true,
    requiresPowerSpawn: true,
    minTowerCount: 4
  },
  empireDominance: {
    rcl: 8,
    requiresNuker: true,
    requiresObserver: true,
    requiresTerminal: true,
    requiresLabs: true,
    minLabCount: 8,
    requiresFactory: true,
    requiresPowerSpawn: true,
    minGcl: 10,
    minRooms: 3,
    minRemoteRooms: 2,
    minTowerCount: 6
  }
};

/**
 * Posture spawn profiles (weights for role families)
 */
export interface SpawnProfile {
  economy: number;
  military: number;
  utility: number;
  power: number;
}

/**
 * Hostile posture recovery window (ticks).
 * Keeps defensive posture briefly after hostiles are gone so the bot doesn't
 * overreact to stale pheromone spikes from transient threats.
 */
const HOSTILE_RECOVERY_TICKS = 200;

/**
 * Posture configurations
 */
export const POSTURE_PROFILES: Record<RoomPosture, SpawnProfile> = {
  eco: { economy: 0.75, military: 0.05, utility: 0.15, power: 0.05 },
  expand: { economy: 0.55, military: 0.15, utility: 0.25, power: 0.05 },
  defensive: { economy: 0.45, military: 0.35, utility: 0.15, power: 0.05 },
  war: { economy: 0.3, military: 0.5, utility: 0.1, power: 0.1 },
  siege: { economy: 0.2, military: 0.6, utility: 0.1, power: 0.1 },
  evacuate: { economy: 0.1, military: 0.1, utility: 0.8, power: 0.0 },
  nukePrep: { economy: 0.4, military: 0.3, utility: 0.2, power: 0.1 }
};

/**
 * Posture resource allocation priorities
 */
export interface ResourcePriorities {
  /** Priority for controller upgrade (0-100) */
  upgrade: number;
  /** Priority for construction (0-100) */
  build: number;
  /** Priority for repair (0-100) */
  repair: number;
  /** Priority for spawn operations (0-100) */
  spawn: number;
  /** Priority for terminal/market ops (0-100) */
  terminal: number;
  /** Priority for labs/boosts (0-100) */
  labs: number;
}

/**
 * Resource priorities per posture
 */
export const POSTURE_RESOURCE_PRIORITIES: Record<RoomPosture, ResourcePriorities> = {
  eco: { upgrade: 80, build: 60, repair: 40, spawn: 70, terminal: 50, labs: 30 },
  expand: { upgrade: 60, build: 80, repair: 50, spawn: 75, terminal: 60, labs: 40 },
  defensive: { upgrade: 30, build: 50, repair: 80, spawn: 90, terminal: 40, labs: 60 },
  war: { upgrade: 10, build: 30, repair: 70, spawn: 95, terminal: 70, labs: 80 },
  siege: { upgrade: 5, build: 20, repair: 90, spawn: 100, terminal: 50, labs: 90 },
  evacuate: { upgrade: 0, build: 5, repair: 10, spawn: 50, terminal: 80, labs: 10 },
  nukePrep: { upgrade: 20, build: 40, repair: 95, spawn: 80, terminal: 30, labs: 70 }
};

/**
 * Evolution Manager
 */
export class EvolutionManager {
  /** Cache namespace for structure counts */
  private readonly STRUCTURE_CACHE_NAMESPACE = "evolution:structures";

  /** TTL for cached structure counts (in ticks) */
  private readonly structureCacheTtl: number = 20;

  /**
   * Determine evolution stage for a room
   */
  public determineEvolutionStage(_swarm: SwarmState, room: Room, totalOwnedRooms: number): EvolutionStage {
    const rcl = room.controller?.level ?? 0;
    const gcl = Game.gcl.level;

    // `colonyLevel` is the lifecycle/RCL band. Readiness for terminal, labs,
    // remotes, and advanced structures is tracked separately via missingStructures.
    if (rcl >= 8 && gcl >= (EVOLUTION_STAGES.empireDominance.minGcl ?? 0) && totalOwnedRooms >= (EVOLUTION_STAGES.empireDominance.minRooms ?? 0)) {
      return "empireDominance";
    }
    if (rcl >= EVOLUTION_STAGES.fortifiedHive.rcl) {
      return "fortifiedHive";
    }
    if (rcl >= EVOLUTION_STAGES.matureColony.rcl) {
      return "matureColony";
    }
    if (rcl >= EVOLUTION_STAGES.foragingExpansion.rcl) {
      return "foragingExpansion";
    }
    return "seedNest";
  }

  /**
   * Get structure counts for a room with caching
   */
  private getStructureCounts(room: Room): Partial<Record<BuildableStructureConstant, number>> {
    const cached = globalCache.get<Partial<Record<BuildableStructureConstant, number>>>(room.name, {
      namespace: this.STRUCTURE_CACHE_NAMESPACE,
      ttl: this.structureCacheTtl
    });

    if (cached) {
      return cached;
    }

    const counts: Partial<Record<BuildableStructureConstant, number>> = {};
    const structures = room.find(FIND_MY_STRUCTURES);

    for (const structure of structures) {
      const type = structure.structureType as BuildableStructureConstant;
      counts[type] = (counts[type] ?? 0) + 1;
    }

    globalCache.set(room.name, counts, {
      namespace: this.STRUCTURE_CACHE_NAMESPACE,
      ttl: this.structureCacheTtl
    });

    return counts;
  }

  /**
   * Update evolution stage for a room
   */
  public updateEvolutionStage(swarm: SwarmState, room: Room, totalOwnedRooms: number): boolean {
    const newStage = this.determineEvolutionStage(swarm, room, totalOwnedRooms);

    if (newStage !== swarm.colonyLevel) {
      logger.info(`Room evolution: ${swarm.colonyLevel} -> ${newStage}`, {
        room: room.name,
        subsystem: "Evolution"
      });
      swarm.colonyLevel = newStage;
      return true;
    }

    return false;
  }

  /**
   * Update missing structures flags
   */
  public updateMissingStructures(swarm: SwarmState, room: Room): void {
    const structureCounts = this.getStructureCounts(room);
    const rcl = room.controller?.level ?? 0;
    const thresholds = EVOLUTION_STAGES[swarm.colonyLevel];

    const requiresLabs = thresholds.requiresLabs && rcl >= 6;
    const minLabCount = requiresLabs ? (thresholds.minLabCount ?? 3) : 0;

    const requiresFactory = thresholds.requiresFactory && rcl >= 7;
    const requiresTerminal = thresholds.requiresTerminal && rcl >= 6;
    const requiresStorage = thresholds.requiresStorage && rcl >= 4;
    const requiresPowerSpawn = thresholds.requiresPowerSpawn && rcl >= 7;
    const requiresObserver = thresholds.requiresObserver && rcl >= 8;
    const requiresNuker = thresholds.requiresNuker && rcl >= 8;

    swarm.missingStructures = {
      spawn: (structureCounts[STRUCTURE_SPAWN] ?? 0) === 0,
      storage: requiresStorage ? (structureCounts[STRUCTURE_STORAGE] ?? 0) === 0 : false,
      terminal: requiresTerminal ? (structureCounts[STRUCTURE_TERMINAL] ?? 0) === 0 : false,
      labs: requiresLabs ? (structureCounts[STRUCTURE_LAB] ?? 0) < minLabCount : false,
      nuker: requiresNuker ? (structureCounts[STRUCTURE_NUKER] ?? 0) === 0 : false,
      factory: requiresFactory ? (structureCounts[STRUCTURE_FACTORY] ?? 0) === 0 : false,
      extractor: rcl >= 6 ? (structureCounts[STRUCTURE_EXTRACTOR] ?? 0) === 0 : false,
      powerSpawn: requiresPowerSpawn ? (structureCounts[STRUCTURE_POWER_SPAWN] ?? 0) === 0 : false,
      observer: requiresObserver ? (structureCounts[STRUCTURE_OBSERVER] ?? 0) === 0 : false
    };
  }
}

/**
 * Posture Manager
 */
export class PostureManager {
  /**
   * Determine posture for a room based on pheromones and danger
   */
  public determinePosture(swarm: SwarmState, strategicOverride?: RoomPosture): RoomPosture {
    // Strategic override takes precedence
    if (strategicOverride) {
      return strategicOverride;
    }

    const { pheromones, danger } = swarm;
    const lastHostileTick = typeof swarm.lastHostileTick === "number" ? swarm.lastHostileTick : 0;
    const hasRecentHostileSignal = lastHostileTick > 0 && Game.time - lastHostileTick <= HOSTILE_RECOVERY_TICKS;

    // Danger-based posture
    if (danger >= 3) {
      return "siege";
    }
    if (danger >= 2) {
      return "war";
    }

    // Pheromone-based posture. We gate war/defense/siege persistence on
    // recent hostile presence to avoid sticky defensive posture after threats
    // pass and pheromones decay slowly.
    if (pheromones.siege > 30 && hasRecentHostileSignal) {
      return "siege";
    }
    if (pheromones.war > 25 && hasRecentHostileSignal) {
      return "war";
    }
    // Defense threshold raised from 20 to 35 to prevent defensive posture from
    // persisting after minor threats clear. Also require recent hostile signal.
    // Pheromones decay slowly (0.9-0.99 factor), so this avoids long-term
    // over-allocation of spawn capacity.
    if (pheromones.defense > 35 && hasRecentHostileSignal) {
      return "defensive";
    }
    if (pheromones.nukeTarget > 40) {
      return "nukePrep";
    }
    if (pheromones.expand > 30 && danger === 0) {
      return "expand";
    }

    // Default: danger >= 2 required for defensive posture.
    // danger === 1 is typically a scout or passing NPC — not worth
    // diverting 35%+ spawn capacity to military. Only escalate to
    // defensive when there are multiple hostiles or confirmed attacks.
    // This aligns with POSTURE_PROFILES: defensive allocates 35% military
    // vs eco's 5%, so the threshold must be meaningful.
    if (danger >= 2) {
      return "defensive";
    }

    return "eco";
  }

  /**
   * Update posture for a room
   * Emits posture.change event through the kernel when posture changes.
   * @param swarm - The swarm state to update
   * @param strategicOverride - Optional strategic override for posture
   * @param roomName - Room name for event emission (falls back to swarm.role if not provided)
   */
  public updatePosture(swarm: SwarmState, strategicOverride?: RoomPosture, roomName?: string): boolean {
    const newPosture = this.determinePosture(swarm, strategicOverride);

    if (newPosture !== swarm.posture) {
      const oldPosture = swarm.posture;
      const eventRoomName = roomName ?? swarm.role;

      logger.info(`Posture change: ${oldPosture} -> ${newPosture}`, {
        room: eventRoomName,
        subsystem: "Posture"
      });
      swarm.posture = newPosture;

      // Emit posture change event through the kernel event system
      kernel.emit("posture.change", {
        roomName: eventRoomName,
        oldPosture,
        newPosture,
        source: "PostureManager"
      });

      return true;
    }

    return false;
  }

  /**
   * Get spawn profile for current posture
   */
  public getSpawnProfile(posture: RoomPosture): SpawnProfile {
    return POSTURE_PROFILES[posture];
  }

  /**
   * Get resource priorities for current posture
   */
  public getResourcePriorities(posture: RoomPosture): ResourcePriorities {
    return POSTURE_RESOURCE_PRIORITIES[posture];
  }

  /**
   * Check if posture allows building
   */
  public allowsBuilding(posture: RoomPosture): boolean {
    return posture !== "evacuate" && posture !== "siege";
  }

  /**
   * Check if posture allows upgrading
   */
  public allowsUpgrading(posture: RoomPosture): boolean {
    return posture !== "evacuate" && posture !== "siege" && posture !== "war";
  }

  /**
   * Check if posture is combat-oriented
   */
  public isCombatPosture(posture: RoomPosture): boolean {
    return posture === "defensive" || posture === "war" || posture === "siege";
  }

  /**
   * Check if posture allows expansion
   */
  public allowsExpansion(posture: RoomPosture): boolean {
    return posture === "eco" || posture === "expand";
  }
}

/**
 * Global evolution manager instance
 */
export const evolutionManager = new EvolutionManager();

/**
 * Global posture manager instance
 */
export const postureManager = new PostureManager();
