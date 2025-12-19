/**
 * Reaction Chains and Definitions
 * 
 * Complete reaction chain definitions for all Screeps compounds
 */

import type { Reaction } from "../types";

/**
 * Reaction chains for all compounds
 * Maps product to its recipe
 */
export const REACTIONS: Record<string, Reaction> = {
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
 * Get reaction definition for a compound
 */
export function getReaction(compound: ResourceConstant): Reaction | undefined {
  return REACTIONS[compound];
}

/**
 * Calculate full reaction chain for a target compound
 * Returns array of reactions in order (dependencies first)
 */
export function calculateReactionChain(
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
export function hasResourcesForReaction(
  terminal: StructureTerminal,
  reaction: Reaction,
  minAmount = 100
): boolean {
  const input1Amount = terminal.store[reaction.input1] ?? 0;
  const input2Amount = terminal.store[reaction.input2] ?? 0;
  return input1Amount >= minAmount && input2Amount >= minAmount;
}
