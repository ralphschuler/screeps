/**
 * Chemistry Manager
 * 
 * Main coordination class for chemistry system
 */

import type { Reaction, ChemistryState, ChemistryLogger } from "../types";
import { noopLogger } from "../types";
import { calculateReactionChain, hasResourcesForReaction, REACTIONS } from "../reactions/reactionChains";
import { getTargetCompounds, getStockpileTarget } from "../compounds/targets";

/**
 * Chemistry Manager Options
 */
export interface ChemistryManagerOptions {
  /** Logger instance (optional) */
  logger?: ChemistryLogger;
}

/**
 * Chemistry Manager Class
 * 
 * Coordinates reaction planning and execution
 */
export class ChemistryManager {
  private logger: ChemistryLogger;

  constructor(options: ChemistryManagerOptions = {}) {
    this.logger = options.logger ?? noopLogger;
  }

  /**
   * Get reaction for a compound (lookup in REACTIONS table)
   */
  public getReaction(compound: ResourceConstant): Reaction | undefined {
    return REACTIONS[compound];
  }

  /**
   * Calculate full reaction chain for a target compound
   * Returns array of reactions in order (dependencies first)
   */
  public calculateReactionChain(
    target: ResourceConstant,
    availableResources: Partial<Record<ResourceConstant, number>>
  ): Reaction[] {
    return calculateReactionChain(target, availableResources);
  }

  /**
   * Check if we have enough resources for a reaction
   */
  public hasResourcesForReaction(
    terminal: StructureTerminal,
    reaction: Reaction,
    minAmount = 100
  ): boolean {
    return hasResourcesForReaction(terminal, reaction, minAmount);
  }

  /**
   * Plan reactions for a room
   */
  public planReactions(room: Room, state: ChemistryState): Reaction | null {
    // Get available labs
    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];

    if (labs.length < 3) {
      return null; // Need at least 3 labs for reactions
    }

    // Get terminal resources
    const terminal = room.terminal;
    if (!terminal) {
      return null; // Need terminal for resource management
    }

    // Determine target compounds based on state
    const targets = getTargetCompounds(state);

    // Find reactions we need to run
    for (const target of targets) {
      const reaction = REACTIONS[target];
      if (!reaction) continue;

      // Check if we have enough of this compound
      const current = terminal.store[target] ?? 0;
      const targetAmount = getStockpileTarget(target, state);

      if (current < targetAmount) {
        // Calculate full reaction chain
        const availableResources: Partial<Record<ResourceConstant, number>> = {};
        for (const [resourceType, amount] of Object.entries(terminal.store)) {
          availableResources[resourceType as ResourceConstant] = amount;
        }

        const chain = this.calculateReactionChain(target, availableResources);
        
        // Find first reaction in chain that we can do
        for (const chainReaction of chain) {
          if (this.hasResourcesForReaction(terminal, chainReaction, 1000)) {
            return chainReaction;
          }
        }

        // If we can't produce the chain, log debug info
        if (chain.length > 0) {
          this.logger.debug(
            `Cannot produce ${target}: missing inputs in reaction chain`,
            { subsystem: "Chemistry", room: room.name }
          );
        }
      }
    }

    return null;
  }

  /**
   * Schedule compound production based on demand and priorities
   * Returns prioritized list of reactions needed across all rooms
   */
  public scheduleCompoundProduction(
    rooms: Room[],
    state: ChemistryState
  ): { room: Room; reaction: Reaction; priority: number }[] {
    const schedule: { room: Room; reaction: Reaction; priority: number }[] = [];

    for (const room of rooms) {
      const terminal = room.terminal;
      if (!terminal) continue;

      // Get target compounds based on state
      const targets = getTargetCompounds(state);

      // Evaluate each target
      for (const target of targets) {
        const reaction = REACTIONS[target];
        if (!reaction) continue;

        const current = terminal.store[target] ?? 0;
        const targetAmount = getStockpileTarget(target, state);
        const shortage = targetAmount - current;

        // Only schedule if we have a shortage
        if (shortage > 0) {
          // Calculate priority based on shortage percentage and base priority
          // Cap shortagePercent at 0.5 to keep priorities predictable
          const shortagePercent = shortage / targetAmount;
          const priority = reaction.priority * (1 + Math.min(shortagePercent, 0.5));

          // Check if we can produce this reaction
          const availableResources: Partial<Record<ResourceConstant, number>> = {};
          for (const [resourceType, amount] of Object.entries(terminal.store)) {
            availableResources[resourceType as ResourceConstant] = amount;
          }

          const chain = this.calculateReactionChain(target, availableResources);
          
          // Schedule the first producible reaction in the chain
          for (const chainReaction of chain) {
            if (this.hasResourcesForReaction(terminal, chainReaction, 1000)) {
              schedule.push({ room, reaction: chainReaction, priority });
              break; // Only schedule one reaction per target per room
            }
          }
        }
      }
    }

    // Sort by priority (highest first)
    schedule.sort((a, b) => b.priority - a.priority);

    return schedule;
  }

  /**
   * Execute reaction in labs
   */
  public executeReaction(room: Room, reaction: Reaction): void {
    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];

    if (labs.length < 3) return;

    // Use first 2 labs as input labs, rest as output labs
    const inputLab1 = labs[0];
    const inputLab2 = labs[1];
    if (!inputLab1 || !inputLab2) return;
    
    const outputLabs = labs.slice(2);

    // Ensure input labs have correct resources
    if (inputLab1.mineralType !== reaction.input1 || inputLab1.store[reaction.input1] < 500) {
      this.logger.debug(`Lab ${inputLab1.id} needs ${reaction.input1}`, { subsystem: "Chemistry" });
    }

    if (inputLab2.mineralType !== reaction.input2 || inputLab2.store[reaction.input2] < 500) {
      this.logger.debug(`Lab ${inputLab2.id} needs ${reaction.input2}`, { subsystem: "Chemistry" });
    }

    // Run reactions in output labs
    for (const outputLab of outputLabs) {
      if (outputLab.cooldown > 0) continue;

      // Check if lab is full
      const freeCapacity = outputLab.store.getFreeCapacity();
      if (freeCapacity !== null && freeCapacity < 100) {
        this.logger.debug(`Lab ${outputLab.id} is full, needs unloading`, { subsystem: "Chemistry" });
        continue;
      }

      const result = outputLab.runReaction(inputLab1, inputLab2);
      if (result === OK) {
        this.logger.debug(`Produced ${reaction.product} in lab ${outputLab.id}`, { subsystem: "Chemistry" });
      }
    }
  }
}
