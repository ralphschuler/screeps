/**
 * Chemistry Planner - Reaction Chain Planning
 *
 * Plans and executes lab reactions:
 * - Target compound configuration
 * - Reaction chain calculation
 * - Intermediate product tracking
 * - Boost stockpile management
 *
 * Addresses Issue: #28
 */

import type { SwarmState } from "../memory/schemas";
import { logger } from "../core/logger";

/**
 * Reaction definition
 */
interface Reaction {
  /** Product */
  product: ResourceConstant;
  /** Input 1 */
  input1: ResourceConstant;
  /** Input 2 */
  input2: ResourceConstant;
  /** Priority (higher = more important) */
  priority: number;
}

/**
 * Reaction chains for all compounds
 */
const REACTIONS: Record<string, Reaction> = {
  // Tier 1 compounds
  [RESOURCE_HYDROXIDE]: {
    product: RESOURCE_HYDROXIDE,
    input1: RESOURCE_HYDROGEN,
    input2: RESOURCE_OXYGEN,
    priority: 10
  },
  [RESOURCE_ZYNTHIUM_KEANITE]: {
    product: RESOURCE_ZYNTHIUM_KEANITE,
    input1: RESOURCE_ZYNTHIUM,
    input2: RESOURCE_KEANIUM,
    priority: 10
  },
  [RESOURCE_UTRIUM_LEMERGITE]: {
    product: RESOURCE_UTRIUM_LEMERGITE,
    input1: RESOURCE_UTRIUM,
    input2: RESOURCE_LEMERGIUM,
    priority: 10
  },
  [RESOURCE_GHODIUM]: {
    product: RESOURCE_GHODIUM,
    input1: RESOURCE_ZYNTHIUM_KEANITE,
    input2: RESOURCE_UTRIUM_LEMERGITE,
    priority: 15
  },

  // Tier 2 compounds (boosts)
  [RESOURCE_UTRIUM_HYDRIDE]: {
    product: RESOURCE_UTRIUM_HYDRIDE,
    input1: RESOURCE_UTRIUM,
    input2: RESOURCE_HYDROGEN,
    priority: 20
  },
  [RESOURCE_UTRIUM_OXIDE]: {
    product: RESOURCE_UTRIUM_OXIDE,
    input1: RESOURCE_UTRIUM,
    input2: RESOURCE_OXYGEN,
    priority: 20
  },
  [RESOURCE_KEANIUM_HYDRIDE]: {
    product: RESOURCE_KEANIUM_HYDRIDE,
    input1: RESOURCE_KEANIUM,
    input2: RESOURCE_HYDROGEN,
    priority: 20
  },
  [RESOURCE_KEANIUM_OXIDE]: {
    product: RESOURCE_KEANIUM_OXIDE,
    input1: RESOURCE_KEANIUM,
    input2: RESOURCE_OXYGEN,
    priority: 20
  },
  [RESOURCE_LEMERGIUM_HYDRIDE]: {
    product: RESOURCE_LEMERGIUM_HYDRIDE,
    input1: RESOURCE_LEMERGIUM,
    input2: RESOURCE_HYDROGEN,
    priority: 20
  },
  [RESOURCE_LEMERGIUM_OXIDE]: {
    product: RESOURCE_LEMERGIUM_OXIDE,
    input1: RESOURCE_LEMERGIUM,
    input2: RESOURCE_OXYGEN,
    priority: 20
  },
  [RESOURCE_ZYNTHIUM_HYDRIDE]: {
    product: RESOURCE_ZYNTHIUM_HYDRIDE,
    input1: RESOURCE_ZYNTHIUM,
    input2: RESOURCE_HYDROGEN,
    priority: 20
  },
  [RESOURCE_ZYNTHIUM_OXIDE]: {
    product: RESOURCE_ZYNTHIUM_OXIDE,
    input1: RESOURCE_ZYNTHIUM,
    input2: RESOURCE_OXYGEN,
    priority: 20
  },
  [RESOURCE_GHODIUM_HYDRIDE]: {
    product: RESOURCE_GHODIUM_HYDRIDE,
    input1: RESOURCE_GHODIUM,
    input2: RESOURCE_HYDROGEN,
    priority: 20
  },
  [RESOURCE_GHODIUM_OXIDE]: {
    product: RESOURCE_GHODIUM_OXIDE,
    input1: RESOURCE_GHODIUM,
    input2: RESOURCE_OXYGEN,
    priority: 20
  },

  // Tier 3 compounds (advanced boosts)
  [RESOURCE_UTRIUM_ACID]: {
    product: RESOURCE_UTRIUM_ACID,
    input1: RESOURCE_UTRIUM_HYDRIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_UTRIUM_ALKALIDE]: {
    product: RESOURCE_UTRIUM_ALKALIDE,
    input1: RESOURCE_UTRIUM_OXIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_KEANIUM_ACID]: {
    product: RESOURCE_KEANIUM_ACID,
    input1: RESOURCE_KEANIUM_HYDRIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_KEANIUM_ALKALIDE]: {
    product: RESOURCE_KEANIUM_ALKALIDE,
    input1: RESOURCE_KEANIUM_OXIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_LEMERGIUM_ACID]: {
    product: RESOURCE_LEMERGIUM_ACID,
    input1: RESOURCE_LEMERGIUM_HYDRIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_LEMERGIUM_ALKALIDE]: {
    product: RESOURCE_LEMERGIUM_ALKALIDE,
    input1: RESOURCE_LEMERGIUM_OXIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_ZYNTHIUM_ACID]: {
    product: RESOURCE_ZYNTHIUM_ACID,
    input1: RESOURCE_ZYNTHIUM_HYDRIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_ZYNTHIUM_ALKALIDE]: {
    product: RESOURCE_ZYNTHIUM_ALKALIDE,
    input1: RESOURCE_ZYNTHIUM_OXIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_GHODIUM_ACID]: {
    product: RESOURCE_GHODIUM_ACID,
    input1: RESOURCE_GHODIUM_HYDRIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },
  [RESOURCE_GHODIUM_ALKALIDE]: {
    product: RESOURCE_GHODIUM_ALKALIDE,
    input1: RESOURCE_GHODIUM_OXIDE,
    input2: RESOURCE_HYDROXIDE,
    priority: 30
  },

  // Tier 4 compounds (catalyzed boosts)
  [RESOURCE_CATALYZED_UTRIUM_ACID]: {
    product: RESOURCE_CATALYZED_UTRIUM_ACID,
    input1: RESOURCE_UTRIUM_ACID,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: {
    product: RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
    input1: RESOURCE_UTRIUM_ALKALIDE,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_KEANIUM_ACID]: {
    product: RESOURCE_CATALYZED_KEANIUM_ACID,
    input1: RESOURCE_KEANIUM_ACID,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: {
    product: RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
    input1: RESOURCE_KEANIUM_ALKALIDE,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_LEMERGIUM_ACID]: {
    product: RESOURCE_CATALYZED_LEMERGIUM_ACID,
    input1: RESOURCE_LEMERGIUM_ACID,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: {
    product: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
    input1: RESOURCE_LEMERGIUM_ALKALIDE,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: {
    product: RESOURCE_CATALYZED_ZYNTHIUM_ACID,
    input1: RESOURCE_ZYNTHIUM_ACID,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: {
    product: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,
    input1: RESOURCE_ZYNTHIUM_ALKALIDE,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_GHODIUM_ACID]: {
    product: RESOURCE_CATALYZED_GHODIUM_ACID,
    input1: RESOURCE_GHODIUM_ACID,
    input2: RESOURCE_CATALYST,
    priority: 40
  },
  [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: {
    product: RESOURCE_CATALYZED_GHODIUM_ALKALIDE,
    input1: RESOURCE_GHODIUM_ALKALIDE,
    input2: RESOURCE_CATALYST,
    priority: 40
  }
};

/**
 * Base stockpile targets (can be adjusted based on posture)
 */
const BASE_STOCKPILE_TARGETS: Record<string, number> = {
  // War mode boosts
  [RESOURCE_CATALYZED_UTRIUM_ACID]: 3000,
  [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: 3000,
  [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: 3000,
  [RESOURCE_CATALYZED_GHODIUM_ACID]: 3000,

  // Eco mode boosts
  [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: 2000,
  [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: 2000,

  // Intermediates
  [RESOURCE_GHODIUM]: 5000,
  [RESOURCE_HYDROXIDE]: 5000
};

/**
 * Get stockpile target for a compound based on room state
 */
function getStockpileTarget(compound: ResourceConstant, swarm: SwarmState): number {
  const baseTarget = BASE_STOCKPILE_TARGETS[compound] ?? 1000;
  
  // Increase war compound targets when in war/siege mode
  if (swarm.posture === "war" || swarm.posture === "siege") {
    if (compound === RESOURCE_CATALYZED_UTRIUM_ACID ||
        compound === RESOURCE_CATALYZED_KEANIUM_ALKALIDE ||
        compound === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE ||
        compound === RESOURCE_CATALYZED_GHODIUM_ACID) {
      return baseTarget * 1.5; // 50% higher in war mode
    }
  }
  
  // Reduce eco compound targets when in war mode
  if (swarm.posture === "war" || swarm.posture === "siege") {
    if (compound === RESOURCE_CATALYZED_GHODIUM_ALKALIDE ||
        compound === RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE) {
      return baseTarget * 0.5; // 50% lower in war mode
    }
  }
  
  return baseTarget;
}

/**
 * Chemistry Planner Class
 */
export class ChemistryPlanner {
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
    const chain: Reaction[] = [];
    const visited = new Set<ResourceConstant>();

    const buildChain = (compound: ResourceConstant): boolean => {
      if (visited.has(compound)) return true;
      visited.add(compound);

      const reaction = REACTIONS[compound];
      if (!reaction) {
        // Base mineral or not in reactions table
        return (availableResources[compound] ?? 0) > 0;
      }

      // Check if we need to produce input1
      if ((availableResources[reaction.input1] ?? 0) < 100) {
        if (!buildChain(reaction.input1)) return false;
      }

      // Check if we need to produce input2
      if ((availableResources[reaction.input2] ?? 0) < 100) {
        if (!buildChain(reaction.input2)) return false;
      }

      // Add this reaction to chain
      chain.push(reaction);
      return true;
    };

    buildChain(target);
    return chain;
  }

  /**
   * Check if we have enough resources for a reaction
   */
  public hasResourcesForReaction(
    terminal: StructureTerminal,
    reaction: Reaction,
    minAmount = 100
  ): boolean {
    const input1Amount = terminal.store[reaction.input1] ?? 0;
    const input2Amount = terminal.store[reaction.input2] ?? 0;
    return input1Amount >= minAmount && input2Amount >= minAmount;
  }

  /**
   * Plan reactions for a room
   */
  public planReactions(room: Room, swarm: SwarmState): Reaction | null {
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

    // Determine target compounds based on posture
    const targets = this.getTargetCompounds(swarm);

    // Find reactions we need to run
    for (const target of targets) {
      const reaction = REACTIONS[target];
      if (!reaction) continue;

      // Check if we have enough of this compound
      const current = terminal.store[target] ?? 0;
      const targetAmount = getStockpileTarget(target, swarm);

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

        // If we can't produce the chain, check if we should buy inputs
        if (chain.length > 0) {
          logger.debug(
            `Cannot produce ${target}: missing inputs in reaction chain`,
            { subsystem: "Chemistry", room: room.name }
          );
        }
      }
    }

    return null;
  }

  /**
   * Get target compounds based on swarm state
   */
  private getTargetCompounds(swarm: SwarmState): ResourceConstant[] {
    const targets: ResourceConstant[] = [];

    // Always produce ghodium and hydroxide
    targets.push(RESOURCE_GHODIUM, RESOURCE_HYDROXIDE);

    // War mode: prioritize combat boosts
    if (swarm.posture === "war" || swarm.posture === "siege" || swarm.danger >= 2) {
      targets.push(
        RESOURCE_CATALYZED_UTRIUM_ACID, // Attack
        RESOURCE_CATALYZED_KEANIUM_ALKALIDE, // Ranged attack
        RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, // Heal
        RESOURCE_CATALYZED_GHODIUM_ACID // Dismantle
      );
    } else {
      // Eco mode: prioritize economy boosts
      targets.push(
        RESOURCE_CATALYZED_GHODIUM_ALKALIDE, // Upgrade controller
        RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, // Move
        RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE // Heal (always useful)
      );
    }

    return targets;
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
    if (!inputLab1 || !inputLab2) return; // Safety check
    
    const outputLabs = labs.slice(2);

    // Ensure input labs have correct resources
    if (inputLab1.mineralType !== reaction.input1 || inputLab1.store[reaction.input1] < 500) {
      // Need to load input1
      logger.debug(`Lab ${inputLab1.id} needs ${reaction.input1}`, { subsystem: "Chemistry" });
    }

    if (inputLab2.mineralType !== reaction.input2 || inputLab2.store[reaction.input2] < 500) {
      // Need to load input2
      logger.debug(`Lab ${inputLab2.id} needs ${reaction.input2}`, { subsystem: "Chemistry" });
    }

    // Run reactions in output labs
    for (const outputLab of outputLabs) {
      if (outputLab.cooldown > 0) continue;

      // Check if lab is full
      const freeCapacity = outputLab.store.getFreeCapacity();
      if (freeCapacity !== null && freeCapacity < 100) {
        logger.debug(`Lab ${outputLab.id} is full, needs unloading`, { subsystem: "Chemistry" });
        continue;
      }

      const result = outputLab.runReaction(inputLab1, inputLab2);
      if (result === OK) {
        logger.debug(`Produced ${reaction.product} in lab ${outputLab.id}`, { subsystem: "Chemistry" });
      }
    }
  }
}

/**
 * Global chemistry planner instance
 */
export const chemistryPlanner = new ChemistryPlanner();
