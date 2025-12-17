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

import { logger } from "../core/logger";

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

  // Calculate tower effectiveness
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  });
  
  // TODO: Improve tower DPS accuracy by calculating distance-based damage falloff
  // Details: Current implementation assumes flat 300 damage per tower, but actual damage
  //          varies from 150 (max range) to 600 (min range). Consider calculating average
  //          distance from towers to hostile creeps for more accurate threat assessment.
  // See: ROADMAP.md Section 12 - Threat-Level & Posture
  const towerDPS = towers.reduce((sum, tower) => {
    const structureTower = tower as StructureTower;
    // Tower at max range does 150 damage, at min range does 600
    // Assume average effectiveness of 300 damage per tower with energy
    return sum + (structureTower.store.getUsedCapacity(RESOURCE_ENERGY) >= 10 ? 300 : 0);
  }, 0);

  // Determine if assistance needed
  const assistanceRequired = totalDPS > towerDPS * 1.5;
  const assistancePriority = Math.min(100, Math.max(0, (totalDPS - towerDPS) / 10));

  // Calculate estimated defender cost
  const estimatedDefenderCost = estimateDefenderCost(totalDPS);

  // Determine danger level (0-3)
  const dangerLevel = calculateDangerLevel(threatScore);

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
 * Estimate energy cost to spawn defenders
 * 
 * This uses a simplified baseline defender model:
 * - We assume an unboosted "generic" defender (mixed melee/ranged) can sustain
 *   ~300 raw DPS (attack + ranged_attack) in typical engagement ranges.
 * - We assume such a defender costs roughly 1300 energy to spawn.
 * 
 * These values are intentionally conservative heuristics for high-level planning,
 * not exact combat simulation. Callers that know their actual defender templates
 * (e.g. heavy boosted melee, pure ranged, cheaper trash defenders) can override
 * the defaults for more accurate estimates.
 * 
 * @param totalDPS - Total hostile DPS we want to counter
 * @param defenderDpsPerCreep - Expected sustainable DPS per defending creep (default: 300)
 * @param energyPerDefender - Energy cost to spawn one baseline defender creep (default: 1300)
 * @returns Estimated total energy required to spawn enough defenders
 */
export function estimateDefenderCost(
  totalDPS: number,
  defenderDpsPerCreep: number = 300,
  energyPerDefender: number = 1300
): number {
  // Rough estimate: need enough defenders to at least match hostile DPS
  // Guard against invalid configuration to avoid division by zero
  const effectiveDefenderDps = Math.max(defenderDpsPerCreep, 1);
  const defendersNeeded = Math.ceil(totalDPS / effectiveDefenderDps);
  
  // TODO: Refine defender cost estimation based on actual room defender templates
  // Details: Use the military/role system to derive per-template DPS and energy
  //          costs (including boosts) instead of a single global heuristic.
  // See: ROADMAP.md Section 12 - Threat-Level & Posture for integration
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
