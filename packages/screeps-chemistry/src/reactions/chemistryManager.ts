/**
 * Chemistry Manager
 * 
 * Main coordination class for the chemistry system. Handles reaction planning,
 * compound production scheduling, and resource validation.
 * 
 * @example
 * ```typescript
 * import { ChemistryManager } from '@ralphschuler/screeps-chemistry';
 * 
 * const chemistry = new ChemistryManager({ logger: console });
 * 
 * const gameState = {
 *   currentTick: Game.time,
 *   danger: 2,
 *   posture: 'war',
 *   pheromones: { war: 0.8, siege: 0 }
 * };
 * 
 * // Plan reactions for a room
 * const reaction = chemistry.planReactions(Game.rooms['W1N1'], gameState);
 * if (reaction) {
 *   console.log(`Produce ${reaction.product} from ${reaction.input1} + ${reaction.input2}`);
 * }
 * ```
 */

import type { Reaction, ChemistryState, ChemistryLogger } from "../types";
import { noopLogger } from "../types";
import { calculateReactionChain, hasResourcesForReaction, REACTIONS } from "../reactions/reactionChains";
import { getTargetCompounds, getStockpileTarget } from "../compounds/targets";

/**
 * Options for configuring ChemistryManager
 */
export interface ChemistryManagerOptions {
  /** Optional logger instance for debugging and monitoring */
  logger?: ChemistryLogger;
}

/**
 * Chemistry Manager Class
 * 
 * Coordinates reaction planning, production scheduling, and resource management
 * for lab-based compound production. Supports just-in-time production based on
 * game state (eco/war mode) and automatic reaction chain calculation.
 * 
 * @example
 * ```typescript
 * const chemistry = new ChemistryManager({ logger: myLogger });
 * 
 * // Get reaction for a specific compound
 * const reaction = chemistry.getReaction(RESOURCE_HYDROXIDE);
 * console.log(`${reaction.product} = ${reaction.input1} + ${reaction.input2}`);
 * 
 * // Calculate multi-step reaction chain
 * const chain = chemistry.calculateReactionChain(
 *   RESOURCE_CATALYZED_UTRIUM_ACID,
 *   terminal.store
 * );
 * console.log(`Chain length: ${chain.length} steps`);
 * ```
 */
export class ChemistryManager {
  private logger: ChemistryLogger;

  /**
   * Create a new ChemistryManager instance
   * 
   * @param options - Configuration options
   * 
   * @example
   * ```typescript
   * // With default options (no logging)
   * const manager = new ChemistryManager();
   * 
   * // With custom logger
   * const manager = new ChemistryManager({
   *   logger: {
   *     info: (msg) => console.log(`[Chemistry] ${msg}`),
   *     warn: (msg) => console.warn(`[Chemistry] ${msg}`),
   *     error: (msg) => console.error(`[Chemistry] ${msg}`),
   *     debug: (msg) => console.log(`[Chemistry DEBUG] ${msg}`)
   *   }
   * });
   * ```
   */
  constructor(options: ChemistryManagerOptions = {}) {
    this.logger = options.logger ?? noopLogger;
  }

  /**
   * Get reaction definition for a compound
   * 
   * Looks up the reaction formula for producing a specific compound.
   * Returns undefined if the compound cannot be produced via reactions
   * (e.g., base minerals like hydrogen, oxygen).
   * 
   * @param compound - The compound to look up
   * @returns The reaction definition, or undefined if not producible
   * 
   * @example
   * ```typescript
   * const reaction = chemistry.getReaction(RESOURCE_HYDROXIDE);
   * if (reaction) {
   *   console.log(`${reaction.product} = ${reaction.input1} + ${reaction.input2}`);
   *   // Output: "OH = H + O"
   * }
   * 
   * const baseMineral = chemistry.getReaction(RESOURCE_HYDROGEN);
   * console.log(baseMineral); // undefined (base resource, not produced)
   * ```
   */
  public getReaction(compound: ResourceConstant): Reaction | undefined {
    return REACTIONS[compound];
  }

  /**
   * Calculate full reaction chain for a target compound
   * 
   * Recursively calculates all reactions needed to produce the target compound,
   * taking into account available resources. Returns reactions in dependency order
   * (prerequisites first, target last).
   * 
   * @param target - The target compound to produce
   * @param availableResources - Currently available resources to use as inputs
   * @returns Array of reactions in execution order (dependencies first)
   * 
   * @example
   * ```typescript
   * const terminal = room.terminal;
   * const chain = chemistry.calculateReactionChain(
   *   RESOURCE_CATALYZED_UTRIUM_ACID,
   *   terminal.store
   * );
   * 
   * // Chain might be:
   * // 1. OH = H + O
   * // 2. UH = U + H
   * // 3. UA = UH + OH
   * // 4. XUA = UA + X (catalyzed version)
   * 
   * for (const reaction of chain) {
   *   console.log(`Step: ${reaction.product} = ${reaction.input1} + ${reaction.input2}`);
   * }
   * ```
   */
  public calculateReactionChain(
    target: ResourceConstant,
    availableResources: Partial<Record<ResourceConstant, number>>
  ): Reaction[] {
    return calculateReactionChain(target, availableResources);
  }

  /**
   * Check if terminal has enough resources for a reaction
   * 
   * Validates that the terminal contains sufficient quantities of both input
   * resources needed for a reaction. Useful for planning reaction execution.
   * 
   * @param terminal - The terminal structure to check
   * @param reaction - The reaction to validate resources for
   * @param minAmount - Minimum amount of each resource required (default: 100)
   * @returns True if terminal has enough of both inputs
   * 
   * @example
   * ```typescript
   * const reaction = chemistry.getReaction(RESOURCE_HYDROXIDE);
   * if (reaction && chemistry.hasResourcesForReaction(room.terminal, reaction, 500)) {
   *   console.log('Can produce at least 500 OH');
   *   labConfig.setActiveReaction(roomName, reaction.input1, reaction.input2, reaction.product);
   * } else {
   *   console.log('Insufficient resources for OH production');
   * }
   * 
   * // Check with custom minimum
   * if (chemistry.hasResourcesForReaction(room.terminal, reaction, 2000)) {
   *   console.log('Can produce large batch of 2000+');
   * }
   * ```
   */
  public hasResourcesForReaction(
    terminal: StructureTerminal,
    reaction: Reaction,
    minAmount = 100
  ): boolean {
    return hasResourcesForReaction(terminal, reaction, minAmount);
  }

  /**
   * Plan reactions for a room based on current state
   * 
   * Analyzes room resources, game state, and stockpile targets to determine
   * the best reaction to run. Returns null if no reactions are needed or possible.
   * 
   * Requires:
   * - At least 3 labs in the room
   * - A terminal for resource management
   * - Sufficient resources for the chosen reaction
   * 
   * Priority order:
   * 1. Compounds below stockpile targets
   * 2. State-appropriate compounds (war boosts in war mode, etc.)
   * 3. Compounds with available inputs
   * 
   * @param room - The room to plan reactions for
   * @param state - Current game state (posture, danger level, pheromones)
   * @returns The reaction to execute, or null if none appropriate
   * 
   * @example
   * ```typescript
   * const gameState: ChemistryState = {
   *   currentTick: Game.time,
   *   danger: 3,
   *   posture: 'war',
   *   pheromones: { war: 0.9, siege: 0.2 }
   * };
   * 
   * const reaction = chemistry.planReactions(room, gameState);
   * if (reaction) {
   *   console.log(`Planning to produce ${reaction.product}`);
   *   // War mode prioritizes combat boosts
   *   // High danger level increases targets for defensive compounds
   * } else {
   *   console.log('No reactions needed or possible');
   * }
   * ```
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
