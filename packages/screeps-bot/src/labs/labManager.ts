/**
 * Lab Manager - Comprehensive Lab System Coordinator
 *
 * Manages complete lab operations:
 * - Reaction chain automation with dependency resolution
 * - Dynamic compound target management with just-in-time production
 * - Lab resource loading/unloading coordination
 * - Integration with terminal and carriers
 * - Boost application workflow
 * - Unboost recovery automation
 * - Boost cost analysis for operation viability
 *
 * Design aligned with ROADMAP.md Section 16:
 * - Input/output lab structure (2 input, 3-8 output)
 * - Reaction chain automation
 * - Boost policy based on danger level
 * - Resource recovery via unboost
 * - Just-in-time boost production based on war pheromone
 * - Automatic layout optimization in labConfig
 * - Factory integration via resource coordination
 * - Cluster compound network via terminal manager
 */

import type { SwarmState } from "../memory/schemas";
import { labConfigManager } from "./labConfig";
import { logger } from "../core/logger";

/**
 * Lab task types
 */
export type LabTaskType = "idle" | "reacting" | "boosting" | "loading" | "unloading";

/**
 * Lab resource need
 */
export interface LabResourceNeed {
  /** Lab ID */
  labId: Id<StructureLab>;
  /** Needed resource */
  resourceType: MineralConstant | MineralCompoundConstant;
  /** Amount needed */
  amount: number;
  /** Priority (higher = more urgent) */
  priority: number;
}

/**
 * Lab overflow (needs emptying)
 */
export interface LabOverflow {
  /** Lab ID */
  labId: Id<StructureLab>;
  /** Resource to remove */
  resourceType: MineralConstant | MineralCompoundConstant;
  /** Amount to remove */
  amount: number;
  /** Priority (higher = more urgent) */
  priority: number;
}

/**
 * Reaction chain step
 */
export interface ReactionStep {
  /** Product */
  product: MineralCompoundConstant;
  /** Input 1 */
  input1: MineralConstant | MineralCompoundConstant;
  /** Input 2 */
  input2: MineralConstant | MineralCompoundConstant;
  /** Amount needed to produce */
  amountNeeded: number;
  /** Priority (higher = more important) */
  priority: number;
}

/**
 * Lab Manager Class
 */
export class LabManager {
  /**
   * Get resource needs for all labs in a room
   */
  public getLabResourceNeeds(roomName: string): LabResourceNeed[] {
    const room = Game.rooms[roomName];
    if (!room) return [];

    const config = labConfigManager.getConfig(roomName);
    if (!config || !config.isValid) return [];

    const needs: LabResourceNeed[] = [];

    // Check input labs
    const { input1, input2 } = labConfigManager.getInputLabs(roomName);
    if (input1 && config.activeReaction) {
      const current = input1.store[config.activeReaction.input1] ?? 0;
      if (current < 1000) {
        needs.push({
          labId: input1.id,
          resourceType: config.activeReaction.input1,
          amount: 2000 - current,
          priority: 10
        });
      }
    }

    if (input2 && config.activeReaction) {
      const current = input2.store[config.activeReaction.input2] ?? 0;
      if (current < 1000) {
        needs.push({
          labId: input2.id,
          resourceType: config.activeReaction.input2,
          amount: 2000 - current,
          priority: 10
        });
      }
    }

    // Check boost labs - ensure they have needed compounds
    const boostLabs = labConfigManager.getBoostLabs(roomName);
    for (const lab of boostLabs) {
      const entry = config.labs.find(l => l.labId === lab.id);
      if (entry?.resourceType) {
        const current = lab.store[entry.resourceType] ?? 0;
        if (current < 1000) {
          needs.push({
            labId: lab.id,
            resourceType: entry.resourceType,
            amount: 1500 - current,
            priority: 8
          });
        }
      }
    }

    return needs;
  }

  /**
   * Get lab overflow (labs that need emptying)
   */
  public getLabOverflow(roomName: string): LabOverflow[] {
    const room = Game.rooms[roomName];
    if (!room) return [];

    const config = labConfigManager.getConfig(roomName);
    if (!config) return [];

    const overflow: LabOverflow[] = [];

    // Check output labs for overflow
    const outputLabs = labConfigManager.getOutputLabs(roomName);
    for (const lab of outputLabs) {
      const mineralType = lab.mineralType;
      if (!mineralType) continue;

      const amount = lab.store[mineralType] ?? 0;
      // Empty if more than 2000 or wrong mineral for active reaction
      const wrongMineral = config.activeReaction && mineralType !== config.activeReaction.output;
      if (amount > 2000 || (wrongMineral && amount > 0)) {
        overflow.push({
          labId: lab.id,
          resourceType: mineralType,
          amount,
          priority: wrongMineral ? 10 : 5
        });
      }
    }

    // Check input labs for wrong resources
    const { input1, input2 } = labConfigManager.getInputLabs(roomName);
    const inputLabs = [input1, input2].filter((l): l is StructureLab => l !== undefined);
    for (const lab of inputLabs) {
      const mineralType = lab.mineralType;
      if (!mineralType) continue;

      const entry = config.labs.find(l => l.labId === lab.id);
      const expectedResource = entry?.resourceType;
      
      // Wrong resource in input lab
      if (expectedResource && mineralType !== expectedResource) {
        const amount = lab.store[mineralType] ?? 0;
        if (amount > 0) {
          overflow.push({
            labId: lab.id,
            resourceType: mineralType,
            amount,
            priority: 9
          });
        }
      }
    }

    return overflow;
  }

  /**
   * Check if labs are ready for a reaction
   */
  public areLabsReady(roomName: string, reaction: ReactionStep): boolean {
    const config = labConfigManager.getConfig(roomName);
    if (!config || !config.isValid) return false;

    const { input1, input2 } = labConfigManager.getInputLabs(roomName);
    if (!input1 || !input2) return false;

    // Check input1 has enough
    const input1Amount = input1.store[reaction.input1] ?? 0;
    if (input1Amount < 500) return false;

    // Check input2 has enough
    const input2Amount = input2.store[reaction.input2] ?? 0;
    if (input2Amount < 500) return false;

    // Check output labs have space
    const outputLabs = labConfigManager.getOutputLabs(roomName);
    if (outputLabs.length === 0) return false;

    for (const lab of outputLabs) {
      const freeCapacity = lab.store.getFreeCapacity();
      if (freeCapacity === null || freeCapacity < 100) {
        return false; // Lab is full
      }
    }

    return true;
  }

  /**
   * Clear all lab reactions (prepare for new reaction)
   */
  public clearReactions(roomName: string): void {
    labConfigManager.clearActiveReaction(roomName);
    logger.info(`Cleared active reactions in ${roomName}`, { subsystem: "Labs" });
  }

  /**
   * Set active reaction with validation
   */
  public setActiveReaction(
    roomName: string,
    input1: MineralConstant | MineralCompoundConstant,
    input2: MineralConstant | MineralCompoundConstant,
    output: MineralCompoundConstant
  ): boolean {
    const result = labConfigManager.setActiveReaction(roomName, input1, input2, output);
    if (result) {
      logger.info(`Set active reaction: ${input1} + ${input2} -> ${output}`, {
        subsystem: "Labs",
        room: roomName
      });
    }
    return result;
  }

  /**
   * Run lab reactions for a room
   */
  public runReactions(roomName: string): number {
    return labConfigManager.runReactions(roomName);
  }

  /**
   * Check if a room has available boost labs
   */
  public hasAvailableBoostLabs(roomName: string): boolean {
    const boostLabs = labConfigManager.getBoostLabs(roomName);
    return boostLabs.length > 0;
  }

  /**
   * Prepare boost lab with compound
   */
  public prepareBoostLab(
    roomName: string,
    compound: MineralCompoundConstant
  ): Id<StructureLab> | null {
    const config = labConfigManager.getConfig(roomName);
    if (!config) return null;

    const boostLabs = labConfigManager.getBoostLabs(roomName);
    
    // Find lab already with this compound
    for (const lab of boostLabs) {
      if (lab.mineralType === compound && (lab.store[compound] ?? 0) >= 30) {
        return lab.id;
      }
    }

    // Find empty lab
    for (const lab of boostLabs) {
      if (!lab.mineralType) {
        // Mark this lab for the compound
        const entry = config.labs.find(l => l.labId === lab.id);
        if (entry) {
          entry.resourceType = compound;
          config.lastUpdate = Game.time;
        }
        return lab.id;
      }
    }

    return null;
  }

  /**
   * Schedule unboost for all boosted creeps in a room that are near end of life
   * Automatically finds and routes boosted creeps to labs for mineral recovery
   */
  public scheduleBoostedCreepUnboost(roomName: string): number {
    const room = Game.rooms[roomName];
    if (!room) return 0;

    // Align TTL threshold with handleUnboost (TTL <= 50)
    const boostedCreeps = room.find(FIND_MY_CREEPS, {
      filter: c => c.body.some(part => part.boost) && c.ticksToLive && c.ticksToLive <= 50
    });

    let unboosted = 0;
    for (const creep of boostedCreeps) {
      if (this.handleUnboost(creep, room)) {
        unboosted++;
      }
    }

    return unboosted;
  }

  /**
   * Handle unboost for dying boosted creeps
   */
  public handleUnboost(creep: Creep, room: Room): boolean {
    // Check if creep is boosted
    const isBoosted = creep.body.some(part => part.boost);
    if (!isBoosted) return false;

    // Check if creep is dying soon
    if (!creep.ticksToLive || creep.ticksToLive > 50) return false;

    // Find available lab for unboosting
    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];

    if (labs.length === 0) return false;

    // Find lab with space
    for (const lab of labs) {
      const freeCapacity = lab.store.getFreeCapacity();
      if (freeCapacity !== null && freeCapacity >= 50) {
        // Move to lab and unboost
        if (creep.pos.isNearTo(lab)) {
          const result = lab.unboostCreep(creep);
          if (result === OK) {
            logger.info(`Unboosted ${creep.name}, recovered resources`, {
              subsystem: "Labs",
              room: room.name
            });
            return true;
          }
        } else {
          creep.moveTo(lab);
          return false; // Still moving
        }
      }
    }

    return false;
  }

  /**
   * Get lab task status for a room
   */
  public getLabTaskStatus(roomName: string): LabTaskType {
    const config = labConfigManager.getConfig(roomName);
    if (!config || !config.isValid) return "idle";

    // Check if reacting
    if (config.activeReaction) {
      return "reacting";
    }

    // Check if labs need loading
    const needs = this.getLabResourceNeeds(roomName);
    if (needs.length > 0) {
      return "loading";
    }

    // Check if labs need unloading
    const overflow = this.getLabOverflow(roomName);
    if (overflow.length > 0) {
      return "unloading";
    }

    return "idle";
  }

  /**
   * Initialize lab manager for a room
   */
  public initialize(roomName: string): void {
    labConfigManager.initialize(roomName);
    labConfigManager.loadFromMemory(roomName);
  }

  /**
   * Save lab state to memory
   */
  public save(roomName: string): void {
    labConfigManager.saveToMemory(roomName);
  }
}

/**
 * Global lab manager instance
 */
export const labManager = new LabManager();
