/**
 * Threat Assessment System
 * 
 * Analyzes hostile presence in rooms to provide actionable defense intelligence.
 * Calculates composite threat scores based on:
 * - Body part composition (DPS, healing, dismantling)
 * - Boost detection
 * - Role classification (healers, ranged, melee, dismantlers)
 * - Tower effectiveness
 * 
 * ROADMAP Reference: Section 12 - Threat-Level & Posture
 */

import { logger } from "@bot/core/logger";
import { ROLE_DEFINITIONS } from "@bot/spawning/roleDefinitions";

/**
 * Comprehensive threat analysis for a room
 */
export interface ThreatAnalysis {
  /** Room being analyzed */
  roomName: string;
  /** Danger level (0-3) per ROADMAP Section 12 */
  dangerLevel: 0 | 1 | 2 | 3;
  /** Composite threat score (0-1000+) */
  threatScore: number;
  /** Number of hostile creeps */
  hostileCount: number;
  /** Total hostile hit points */
  totalHostileHitPoints: number;
  /** Total hostile damage per second */
  totalHostileDPS: number;
  /** Number of hostiles with heal parts */
  healerCount: number;
  /** Number of hostiles with ranged attack parts */
  rangedCount: number;
  /** Number of hostiles with attack parts */
  meleeCount: number;
  /** Number of boosted hostiles */
  boostedCount: number;
  /** Number of dismantlers (5+ work parts) */
  dismantlerCount: number;
  /** Estimated energy cost to spawn defenders */
  estimatedDefenderCost: number;
  /** Whether cluster assistance is required */
  assistanceRequired: boolean;
  /** Assistance priority (0-100) */
  assistancePriority: number;
  /** Recommended response strategy */
  recommendedResponse: "monitor" | "defend" | "assist" | "retreat" | "safemode";
}

/**
 * Assess threat level in a room
 * 
 * @param room - Room to analyze
 * @returns Comprehensive threat analysis
 */
export function assessThreat(room: Room): ThreatAnalysis {
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  
  // Early exit for no threats
  if (hostiles.length === 0) {
    return {
      roomName: room.name,
      dangerLevel: 0,
      threatScore: 0,
      hostileCount: 0,
      totalHostileHitPoints: 0,
      totalHostileDPS: 0,
      healerCount: 0,
      rangedCount: 0,
      meleeCount: 0,
      boostedCount: 0,
      dismantlerCount: 0,
      estimatedDefenderCost: 0,
      assistanceRequired: false,
      assistancePriority: 0,
      recommendedResponse: "monitor"
    };
  }

  // Analyze hostile composition
  let threatScore = 0;
  let totalDPS = 0;
  let totalHP = 0;
  let boostedCount = 0;
  let healerCount = 0;
  let rangedCount = 0;
  let meleeCount = 0;
  let dismantlerCount = 0;

  for (const hostile of hostiles) {
    let attackParts = 0;
    let rangedParts = 0;
    let healParts = 0;
    let workParts = 0;
    
    // Analyze body composition
    for (const part of hostile.body) {
      if (part.hits === 0) continue; // Skip destroyed parts
      
      switch (part.type) {
        case ATTACK:
          attackParts++;
          break;
        case RANGED_ATTACK:
          rangedParts++;
          break;
        case HEAL:
          healParts++;
          break;
        case WORK:
          workParts++;
          break;
      }
    }

    // Calculate DPS contribution
    totalDPS += attackParts * 30 + rangedParts * 10;
    totalHP += hostile.hits;

    // Check for boosts
    const isBoosted = hostile.body.some(p => p.boost);
    if (isBoosted) {
      boostedCount++;
      threatScore += 200; // Boosted creeps are serious threats
    }

    // Role classification
    if (healParts > 0) {
      healerCount++;
      threatScore += 100; // Healers make attacks much harder
    }
    if (rangedParts > 0) {
      rangedCount++;
    }
    if (attackParts > 0) {
      meleeCount++;
    }
    if (workParts >= 5) {
      dismantlerCount++;
      threatScore += 150; // Dismantlers threaten structures
    }

    // Base score by offensive capability
    threatScore += (attackParts + rangedParts) * 10;
  }

  // Calculate tower effectiveness with distance-based damage falloff
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  });
  
  // Calculate actual tower DPS based on distance to hostile creeps
  // See ROADMAP.md Section 12 - Threat-Level & Posture: "Range-Falloff beachten"
  const towerDPS = towers.reduce((sum, tower) => {
    const structureTower = tower as StructureTower;
    
    // Skip towers without enough energy to shoot (10 energy per shot)
    if (structureTower.store.getUsedCapacity(RESOURCE_ENERGY) < 10) {
      return sum;
    }
    
    // Calculate average distance from this tower to all hostiles
    const totalDistance = hostiles.reduce((dist, hostile) => {
      return dist + tower.pos.getRangeTo(hostile.pos);
    }, 0);
    const avgDistance = totalDistance / hostiles.length;
    
    // Get actual damage based on average distance
    const damage = calculateTowerDamage(avgDistance);
    
    return sum + damage;
  }, 0);

  // Determine if assistance needed
  const assistanceRequired = totalDPS > towerDPS * 1.5;
  const assistancePriority = Math.min(100, Math.max(0, (totalDPS - towerDPS) / 10));

  // Calculate estimated defender cost
  const estimatedDefenderCost = estimateDefenderCost(totalDPS);

  // Determine danger level (0-3)
  let dangerLevel = calculateDangerLevel(threatScore);

  // Recommend response strategy
  let recommendedResponse: ThreatAnalysis["recommendedResponse"];
  if (threatScore < 100) {
    recommendedResponse = "monitor";
  } else if (threatScore < 500 && !assistanceRequired) {
    recommendedResponse = "defend";
  } else if (assistanceRequired && threatScore < 1000) {
    recommendedResponse = "assist";
  } else if (threatScore > 1000 || boostedCount > 3) {
    recommendedResponse = "safemode";
  } else {
    recommendedResponse = "defend";
  }

  // Check for nuke (overrides everything)
  const nukes = room.find(FIND_NUKES);
  if (nukes.length > 0) {
    threatScore += 500;
    recommendedResponse = "safemode";
    // Recalculate danger level with nuke threat included
    dangerLevel = 3; // Nukes always set danger to max level
  }

  return {
    roomName: room.name,
    dangerLevel,
    threatScore,
    hostileCount: hostiles.length,
    totalHostileHitPoints: totalHP,
    totalHostileDPS: totalDPS,
    healerCount,
    rangedCount,
    meleeCount,
    boostedCount,
    dismantlerCount,
    estimatedDefenderCost,
    assistanceRequired,
    assistancePriority,
    recommendedResponse
  };
}

/**
 * Calculate tower attack damage based on distance to target.
 * 
 * Verified via screeps-docs-mcp:
 * - Tower attack effectiveness: 600 damage at range ≤5 to 150 damage at range ≥20
 * - Linear falloff between min and max range
 * 
 * Formula: damage = 600 - (distance - 5) * 30 for 5 < distance < 20
 * 
 * @param distance - Distance from tower to target
 * @returns Damage dealt by tower at the given distance
 */
export function calculateTowerDamage(distance: number): number {
  const TOWER_DAMAGE_MAX = 600;
  const TOWER_DAMAGE_MIN = 150;
  const TOWER_RANGE_MIN = 5;
  const TOWER_RANGE_MAX = 20;
  
  if (distance <= TOWER_RANGE_MIN) {
    return TOWER_DAMAGE_MAX; // Max damage at close range (≤5)
  } else if (distance >= TOWER_RANGE_MAX) {
    return TOWER_DAMAGE_MIN; // Min damage at far range (≥20)
  } else {
    // Linear interpolation between min and max
    const rangeSpan = TOWER_RANGE_MAX - TOWER_RANGE_MIN; // 15 tiles
    const damageSpan = TOWER_DAMAGE_MAX - TOWER_DAMAGE_MIN; // 450 damage
    const damagePerTile = damageSpan / rangeSpan; // 30 damage per tile
    return TOWER_DAMAGE_MAX - (distance - TOWER_RANGE_MIN) * damagePerTile;
  }
}

/**
 * Calculate danger level from threat score
 * 
 * @param threatScore - Composite threat score
 * @returns Danger level (0-3) per ROADMAP Section 12
 */
export function calculateDangerLevel(threatScore: number): 0 | 1 | 2 | 3 {
  if (threatScore === 0) {
    return 0; // ruhig (calm)
  } else if (threatScore < 300) {
    return 1; // Hostile gesichtet (hostile sighted)
  } else if (threatScore < 800) {
    return 2; // aktiver Angriff (active attack)
  } else {
    return 3; // Belagerung/Nuke (siege/nuke)
  }
}

/**
 * Calculate DPS from body parts composition
 * 
 * Damage values verified via screeps-docs-mcp:
 * - ATTACK: 30 hits per tick (short-ranged attack)
 * - RANGED_ATTACK: 10 hits per tick (long-range attack, single target)
 * 
 * @param parts - Array of body part constants
 * @returns Total damage per second (attack parts * 30 + ranged parts * 10)
 */
function calculateBodyDPS(parts: BodyPartConstant[]): number {
  let dps = 0;
  for (const part of parts) {
    if (part === ATTACK) {
      dps += 30; // Attack parts deal 30 damage per tick
    } else if (part === RANGED_ATTACK) {
      dps += 10; // Ranged attack parts deal 10 damage per tick
    }
  }
  return dps;
}

/**
 * Defender template statistics
 */
interface DefenderTemplate {
  /** Body parts composition */
  parts: BodyPartConstant[];
  /** Energy cost to spawn */
  cost: number;
  /** Damage per second */
  dps: number;
}

/**
 * Get defender templates from role definitions for a specific role.
 * Returns all available body templates with their DPS and cost calculated.
 * 
 * @param role - Defender role ('guard' or 'ranger')
 * @returns Array of defender templates sorted by cost (ascending)
 */
function getDefenderTemplates(role: "guard" | "ranger"): DefenderTemplate[] {
  const roleDef = ROLE_DEFINITIONS[role];
  if (!roleDef) {
    return [];
  }

  return roleDef.bodies.map(template => ({
    parts: template.parts,
    cost: template.cost,
    dps: calculateBodyDPS(template.parts)
  })).sort((a, b) => a.cost - b.cost);
}

/**
 * Calculate average defender stats across templates.
 * Uses all templates to compute a weighted average that represents
 * the typical defender capability across different energy levels.
 * 
 * @param templates - Array of defender templates
 * @returns Object with average DPS per energy spent
 */
function calculateAverageDefenderStats(templates: DefenderTemplate[]): { dpsPerEnergy: number; avgCost: number; avgDps: number } {
  if (templates.length === 0) {
    // Fallback to conservative defaults if no templates available
    return { dpsPerEnergy: 300 / 1300, avgCost: 1300, avgDps: 300 };
  }

  // Calculate average cost and DPS across all templates
  const totalCost = templates.reduce((sum, t) => sum + t.cost, 0);
  const totalDps = templates.reduce((sum, t) => sum + t.dps, 0);
  const avgCost = totalCost / templates.length;
  const avgDps = totalDps / templates.length;
  
  // Calculate DPS per energy unit for efficiency metric
  const dpsPerEnergy = avgDps / avgCost;

  return { dpsPerEnergy, avgCost, avgDps };
}

/**
 * Estimate energy cost to spawn defenders based on actual room defender templates.
 * 
 * This function analyzes the actual body templates defined in the role system
 * for guards and rangers, calculates their real DPS and energy costs, and uses
 * these values to estimate the defender spawning cost required to counter a
 * given hostile DPS threat.
 * 
 * The estimation combines both guard (melee/mixed) and ranger (ranged) templates
 * to provide a balanced defense composition estimate.
 * 
 * @param totalDPS - Total hostile DPS we want to counter
 * @param defenderDpsPerCreep - Optional override for DPS per defender (uses actual templates if not provided)
 * @param energyPerDefender - Optional override for energy per defender (uses actual templates if not provided)
 * @returns Estimated total energy required to spawn enough defenders
 */
export function estimateDefenderCost(
  totalDPS: number,
  defenderDpsPerCreep?: number,
  energyPerDefender?: number
): number {
  // If no overrides provided, calculate from actual defender templates
  if (defenderDpsPerCreep === undefined || energyPerDefender === undefined) {
    // Get templates for both guard and ranger roles
    const guardTemplates = getDefenderTemplates("guard");
    const rangerTemplates = getDefenderTemplates("ranger");
    
    // Calculate stats for both roles
    const guardStats = calculateAverageDefenderStats(guardTemplates);
    const rangerStats = calculateAverageDefenderStats(rangerTemplates);
    
    // Use a simple 50/50 mix of guard and ranger stats as the default baseline.
    // Rationale:
    // - Our standard defense posture (see ROADMAP Section 12) aims for a roughly
    //   balanced melee (guard) and ranged (ranger) composition when no room-specific
    //   data is available.
    // - This heuristic provides a stable, order-of-magnitude estimate of defender
    //   spawning cost for threat scoring without tightly coupling to any specific
    //   spawn strategy.
    // - Callers that track actual defender composition for a room should supply
    //   defenderDpsPerCreep and energyPerDefender explicitly to override this
    //   baseline and reflect their real mix.
    const avgDps = (guardStats.avgDps + rangerStats.avgDps) / 2;
    const avgCost = (guardStats.avgCost + rangerStats.avgCost) / 2;
    
    // Use calculated values if no overrides
    defenderDpsPerCreep = defenderDpsPerCreep ?? avgDps;
    energyPerDefender = energyPerDefender ?? avgCost;
  }
  
  // Validate defender DPS to prevent division by zero or nonsensical results
  // If invalid (≤0), fall back to the conservative default values
  if (defenderDpsPerCreep <= 0) {
    defenderDpsPerCreep = 300; // Conservative fallback from original implementation
    energyPerDefender = 1300;
  }
  
  const defendersNeeded = Math.ceil(totalDPS / defenderDpsPerCreep);
  
  return defendersNeeded * energyPerDefender;
}

/**
 * Log threat analysis for debugging
 * 
 * @param threat - Threat analysis to log
 */
export function logThreatAnalysis(threat: ThreatAnalysis): void {
  logger.info(
    `Threat Assessment for ${threat.roomName}: ` +
    `Danger=${threat.dangerLevel}, Score=${threat.threatScore}, ` +
    `Hostiles=${threat.hostileCount}, DPS=${threat.totalHostileDPS}, ` +
    `Response=${threat.recommendedResponse}`,
    {
      subsystem: "Defense",
      room: threat.roomName,
      meta: {
        threat: {
          dangerLevel: threat.dangerLevel,
          threatScore: threat.threatScore,
          hostileCount: threat.hostileCount,
          boostedCount: threat.boostedCount,
          healerCount: threat.healerCount,
          dismantlerCount: threat.dismantlerCount,
          recommendedResponse: threat.recommendedResponse
        }
      }
    }
  );
}
