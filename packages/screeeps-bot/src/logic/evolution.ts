/**
 * Evolution & Posture System - Phase 3
 *
 * Manages room lifecycle:
 * - Evolution stages (colony levels)
 * - Posture states
 * - State transitions
 */

import type { EvolutionStage, RoomPosture, SwarmState } from "../memory/schemas";
import { logger } from "../core/logger";

/**
 * Evolution stage thresholds
 */
export interface EvolutionThresholds {
  /** RCL requirement */
  rcl: number;
  /** Minimum rooms requirement */
  minRooms?: number;
  /** Minimum GCL requirement */
  minGcl?: number;
  /** Storage required */
  requiresStorage?: boolean;
  /** Labs required */
  requiresLabs?: boolean;
  /** Nuker required */
  requiresNuker?: boolean;
}

/**
 * Evolution stage configurations
 */
export const EVOLUTION_STAGES: Record<EvolutionStage, EvolutionThresholds> = {
  seedColony: {
    rcl: 1
  },
  earlyExpansion: {
    rcl: 3,
    minRooms: 1
  },
  economicMaturity: {
    rcl: 5,
    requiresStorage: true
  },
  fortification: {
    rcl: 7,
    requiresLabs: true
  },
  endGame: {
    rcl: 8,
    requiresNuker: true,
    minGcl: 10
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
  /**
   * Determine evolution stage for a room
   */
  public determineEvolutionStage(room: Room, totalOwnedRooms: number): EvolutionStage {
    const rcl = room.controller?.level ?? 0;
    const gcl = Game.gcl.level;

    // Check from highest to lowest
    if (this.meetsThreshold("endGame", room, rcl, totalOwnedRooms, gcl)) {
      return "endGame";
    }
    if (this.meetsThreshold("fortification", room, rcl, totalOwnedRooms, gcl)) {
      return "fortification";
    }
    if (this.meetsThreshold("economicMaturity", room, rcl, totalOwnedRooms, gcl)) {
      return "economicMaturity";
    }
    if (this.meetsThreshold("earlyExpansion", room, rcl, totalOwnedRooms, gcl)) {
      return "earlyExpansion";
    }
    return "seedColony";
  }

  /**
   * Check if room meets threshold for evolution stage
   */
  private meetsThreshold(stage: EvolutionStage, room: Room, rcl: number, totalRooms: number, gcl: number): boolean {
    const threshold = EVOLUTION_STAGES[stage];

    if (rcl < threshold.rcl) return false;
    if (threshold.minRooms && totalRooms < threshold.minRooms) return false;
    if (threshold.minGcl && gcl < threshold.minGcl) return false;
    if (threshold.requiresStorage && !room.storage) return false;
    if (threshold.requiresLabs) {
      const labs = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } });
      if (labs.length < 3) return false;
    }
    if (threshold.requiresNuker) {
      const nukers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_NUKER } });
      if (nukers.length === 0) return false;
    }

    return true;
  }

  /**
   * Update evolution stage for a room
   */
  public updateEvolutionStage(swarm: SwarmState, room: Room, totalOwnedRooms: number): boolean {
    const newStage = this.determineEvolutionStage(room, totalOwnedRooms);

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
    swarm.missingStructures = {
      spawn: room.find(FIND_MY_SPAWNS).length === 0,
      storage: !room.storage,
      terminal: !room.terminal,
      labs: room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } }).length < 3,
      nuker: room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_NUKER } }).length === 0,
      factory: room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_FACTORY } }).length === 0,
      extractor: room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTRACTOR } }).length === 0,
      powerSpawn: room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_POWER_SPAWN } }).length === 0,
      observer: room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_OBSERVER } }).length === 0
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

    // Danger-based posture
    if (danger >= 3) {
      return "siege";
    }
    if (danger >= 2) {
      return "war";
    }

    // Pheromone-based posture
    if (pheromones.siege > 30) {
      return "siege";
    }
    if (pheromones.war > 25) {
      return "war";
    }
    if (pheromones.defense > 20) {
      return "defensive";
    }
    if (pheromones.nukeTarget > 40) {
      return "nukePrep";
    }
    if (pheromones.expand > 30 && danger === 0) {
      return "expand";
    }

    // Default based on danger level
    if (danger >= 1) {
      return "defensive";
    }

    return "eco";
  }

  /**
   * Update posture for a room
   */
  public updatePosture(swarm: SwarmState, strategicOverride?: RoomPosture): boolean {
    const newPosture = this.determinePosture(swarm, strategicOverride);

    if (newPosture !== swarm.posture) {
      logger.info(`Posture change: ${swarm.posture} -> ${newPosture}`, {
        room: swarm.role,
        subsystem: "Posture"
      });
      swarm.posture = newPosture;
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
 * Calculate danger level from threat metrics
 */
export function calculateDangerLevel(
  hostileCount: number,
  damagePerTick: number,
  enemyStructures: boolean
): 0 | 1 | 2 | 3 {
  // Critical threat
  if (hostileCount >= 10 || damagePerTick >= 2000) {
    return 3;
  }

  // High threat
  if (hostileCount >= 5 || damagePerTick >= 1000) {
    return 2;
  }

  // Medium threat
  if (hostileCount >= 2 || damagePerTick >= 300 || enemyStructures) {
    return 1;
  }

  return 0;
}

/**
 * Global evolution manager instance
 */
export const evolutionManager = new EvolutionManager();

/**
 * Global posture manager instance
 */
export const postureManager = new PostureManager();
