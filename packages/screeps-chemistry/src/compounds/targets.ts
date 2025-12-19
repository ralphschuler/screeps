/**
 * Compound Definitions and Stockpile Targets
 * 
 * Manages compound stockpile targets based on game state
 */

import type { ChemistryState } from "../types";

/**
 * Base stockpile targets (can be adjusted based on state)
 */
export const BASE_STOCKPILE_TARGETS: Record<string, number> = {
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
 * Get stockpile target for a compound based on game state and demand prediction
 * Implements just-in-time production by adjusting targets based on war pheromone
 */
export function getStockpileTarget(compound: ResourceConstant, state: ChemistryState): number {
  const baseTarget = BASE_STOCKPILE_TARGETS[compound] ?? 1000;
  
  // Just-in-time production: increase targets when war pheromone is rising
  const warPheromone = state.pheromones.war ?? 0;
  const siegePheromone = state.pheromones.siege ?? 0;
  const militaryDemand = Math.max(warPheromone, siegePheromone);
  
  // Pre-produce boosts when military demand is detected (200 ticks before spawn)
  // War pheromone > 50 indicates upcoming military operations
  const jitMultiplier = militaryDemand > 50 ? 1 + (militaryDemand / 100) * 0.5 : 1;
  
  // Increase war compound targets when in war/siege mode or high demand
  if (state.posture === "war" || state.posture === "siege" || militaryDemand > 50) {
    if (compound === RESOURCE_CATALYZED_UTRIUM_ACID ||
        compound === RESOURCE_CATALYZED_KEANIUM_ALKALIDE ||
        compound === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE ||
        compound === RESOURCE_CATALYZED_GHODIUM_ACID) {
      // Cap total multiplier to prevent overproduction (max 1.5 * 1.5 = 2.25, capped at 1.75)
      const totalMultiplier = Math.min(1.5 * jitMultiplier, 1.75);
      return baseTarget * totalMultiplier;
    }
  }
  
  // Reduce eco compound targets when in war mode to prioritize combat boosts
  if (state.posture === "war" || state.posture === "siege") {
    if (compound === RESOURCE_CATALYZED_GHODIUM_ALKALIDE ||
        compound === RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE) {
      return baseTarget * 0.5; // 50% lower in war mode
    }
  }
  
  return baseTarget;
}

/**
 * Get target compounds based on game state
 */
export function getTargetCompounds(state: ChemistryState): ResourceConstant[] {
  const targets: ResourceConstant[] = [];

  // Always produce ghodium and hydroxide
  targets.push(RESOURCE_GHODIUM, RESOURCE_HYDROXIDE);

  // War mode: prioritize combat boosts
  if (state.posture === "war" || state.posture === "siege" || state.danger >= 2) {
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
