/**
 * Boost Configurations
 * 
 * Defines which boosts are used for different creep roles
 */

import type { BoostConfig } from "../types";

/**
 * Default boost configurations for different roles
 */
export const BOOST_CONFIGS: BoostConfig[] = [
  {
    role: "soldier",
    boosts: [RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE],
    minDanger: 2
  },
  {
    role: "ranger",
    boosts: [RESOURCE_CATALYZED_KEANIUM_ALKALIDE, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE],
    minDanger: 2
  },
  {
    role: "healer",
    boosts: [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE],
    minDanger: 2
  },
  {
    role: "siegeUnit",
    boosts: [RESOURCE_CATALYZED_GHODIUM_ACID, RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE],
    minDanger: 1
  }
];

/**
 * Get boost configuration for a role
 */
export function getBoostConfig(role: string): BoostConfig | undefined {
  return BOOST_CONFIGS.find(c => c.role === role);
}

/**
 * Calculate boost cost for a creep
 * Returns total mineral and energy cost for all boosts
 */
export function calculateBoostCost(role: string, bodySize: number): { mineral: number; energy: number } {
  const config = getBoostConfig(role);
  if (!config) return { mineral: 0, energy: 0 };

  const mineralCost = bodySize * 30 * config.boosts.length; // 30 mineral per part
  const energyCost = bodySize * 20 * config.boosts.length; // 20 energy per part

  return { mineral: mineralCost, energy: energyCost };
}
