/**
 * Boost Manager - Creep Boosting System (Adapter)
 *
 * Adapter layer that bridges bot-specific dependencies with the
 * @ralphschuler/screeps-chemistry package
 *
 * Addresses Issue: #23
 */

import type { SwarmCreepMemory, SwarmState } from "../memory/schemas";
import { logger } from "@ralphschuler/screeps-core";
import { calculateBoostCost, getBoostConfig } from "@ralphschuler/screeps-chemistry";

/**
 * Map error codes to readable strings
 */
function getBoostErrorMessage(code: ScreepsReturnCode): string {
  switch (code) {
    case ERR_NOT_OWNER:
      return "not owner of lab";
    case ERR_NOT_FOUND:
      return "no suitable body parts";
    case ERR_NOT_ENOUGH_RESOURCES:
      return "not enough compound";
    case ERR_INVALID_TARGET:
      return "invalid creep target";
    case ERR_NOT_IN_RANGE:
      return "creep not in range";
    case ERR_RCL_NOT_ENOUGH:
      return "RCL too low";
    default:
      return `error code ${code}`;
  }
}

/**
 * Boost Manager Class (Adapter)
 */
export class BoostManager {
  /**
   * Check if a creep should be boosted
   */
  public shouldBoost(creep: Creep, swarm: SwarmState): boolean {
    const memory = creep.memory as unknown as SwarmCreepMemory;

    // Check if already boosted
    if (memory.boosted) {
      return false;
    }

    // Get boost config for role
    const config = getBoostConfig(memory.role);
    if (!config) {
      return false; // No boost config for this role
    }

    // Check if room has boost defense priority (emergency response system)
    const mem = Memory as unknown as Record<string, unknown>;
    const boostPriority = (mem.boostDefensePriority as Record<string, boolean>) ?? {};
    const hasDefensePriority = boostPriority[creep.room.name] === true;

    // Lower threshold if defense priority is set
    const effectiveMinDanger = hasDefensePriority 
      ? Math.max(1, config.minDanger - 1) 
      : config.minDanger;

    // Check danger level
    if (swarm.danger < effectiveMinDanger) {
      return false; // Not dangerous enough to warrant boosting
    }

    // Check if room has labs
    if (swarm.missingStructures.labs) {
      return false; // No labs available
    }

    return true;
  }

  /**
   * Boost a creep
   */
  public boostCreep(creep: Creep, room: Room): boolean {
    const memory = creep.memory as unknown as SwarmCreepMemory;

    // Get boost config
    const config = getBoostConfig(memory.role);
    if (!config) return false;

    // Find labs with required boosts
    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: (s): s is StructureLab => s.structureType === STRUCTURE_LAB
    });

    // Track which boosts still needed
    const neededBoosts: ResourceConstant[] = [];

    for (const boost of config.boosts) {
      // Check if creep already has this boost on any body part
      const hasBoost = creep.body.some(p => p.boost === boost);
      if (hasBoost) {
        continue; // Already has this boost
      }

      neededBoosts.push(boost);

      // Find lab with this boost
      const lab = labs.find(l => l.mineralType === boost && l.store[boost] >= 30);

      if (lab) {
        // Move to lab and boost
        if (creep.pos.isNearTo(lab)) {
          const result = lab.boostCreep(creep);
          if (result === OK) {
            logger.info(`Boosted ${creep.name} with ${boost}`, { subsystem: "Boost" });
            // Don't return yet, try to get next boost in same tick if possible
          } else if (result !== ERR_NOT_FOUND) {
            // ERR_NOT_FOUND means no suitable body parts for this boost, which is OK
            logger.error(`Failed to boost ${creep.name}: ${getBoostErrorMessage(result)}`, { subsystem: "Boost" });
            return false; // Error, stop boosting
          }
        } else {
          creep.moveTo(lab, { visualizePathStyle: { stroke: "#ffaa00" } });
          return false; // Still moving to lab
        }
      } else {
        // Lab not ready with this boost
        logger.debug(`Lab not ready with ${boost} for ${creep.name}`, { subsystem: "Boost" });
        return false; // Can't continue without this boost
      }
    }

    // All boosts applied or no boosts needed
    if (neededBoosts.length === 0) {
      memory.boosted = true;
      logger.info(`${creep.name} fully boosted (all ${config.boosts.length} boosts applied)`, { subsystem: "Boost" });
      return true;
    }

    return false; // Still need more boosts
  }

  /**
   * Check if boost labs are ready for a specific role
   */
  public areBoostLabsReady(room: Room, role: string): boolean {
    const config = getBoostConfig(role);
    if (!config) return true; // No boost config = ready

    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: (s): s is StructureLab => s.structureType === STRUCTURE_LAB
    });

    // Check each required boost
    for (const boost of config.boosts) {
      const lab = labs.find(l => l.mineralType === boost && l.store[boost] >= 30);
      if (!lab) return false; // Missing a required boost
    }

    return true; // All boosts ready
  }

  /**
   * Get missing boosts for a role
   */
  public getMissingBoosts(room: Room, role: string): ResourceConstant[] {
    const config = getBoostConfig(role);
    if (!config) return [];

    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: (s): s is StructureLab => s.structureType === STRUCTURE_LAB
    });

    const missing: ResourceConstant[] = [];

    for (const boost of config.boosts) {
      const lab = labs.find(l => l.mineralType === boost && l.store[boost] >= 30);
      if (!lab) {
        missing.push(boost);
      }
    }

    return missing;
  }

  /**
   * Prepare labs for boosting
   */
  public prepareLabs(room: Room, swarm: SwarmState): void {
    // Only prepare if danger is high
    if (swarm.danger < 2) {
      return;
    }

    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: (s): s is StructureLab => s.structureType === STRUCTURE_LAB
    });

    if (labs.length < 3) {
      return; // Need at least 3 labs
    }

    // Use first 2 labs for reactions, rest for boosting
    const boostLabs = labs.slice(2);

    // Load boost compounds into labs
    const requiredBoosts = new Set<ResourceConstant>();
    const allConfigs = [
      getBoostConfig("soldier"),
      getBoostConfig("ranger"),
      getBoostConfig("healer"),
      getBoostConfig("siegeUnit")
    ].filter((c): c is NonNullable<typeof c> => c !== undefined && swarm.danger >= c.minDanger);

    for (const config of allConfigs) {
      for (const boost of config.boosts) {
        requiredBoosts.add(boost);
      }
    }

    // Assign boosts to labs
    let labIndex = 0;
    for (const boost of requiredBoosts) {
      if (labIndex >= boostLabs.length) break;

      const lab = boostLabs[labIndex];
      if (lab.mineralType !== boost || lab.store[boost] < 1000) {
        // Lab needs this boost
        // Terminal should transfer it (handled by terminal manager)
        logger.debug(`Lab ${lab.id} needs ${boost} for boosting`, { subsystem: "Boost" });
      }

      labIndex++;
    }
  }

  /**
   * Calculate boost cost for a creep
   * Returns total mineral and energy cost for all boosts
   */
  public calculateBoostCost(role: string, bodySize: number): { mineral: number; energy: number } {
    return calculateBoostCost(role, bodySize);
  }

  /**
   * Analyze boost ROI (Return on Investment)
   * Compares resource cost against expected performance gains
   * @returns true if boosting is worthwhile
   */
  public analyzeBoostROI(
    role: string,
    bodySize: number,
    expectedLifetime: number,
    dangerLevel: number
  ): { worthwhile: boolean; roi: number; reasoning: string } {
    const config = getBoostConfig(role);
    if (!config) {
      return { worthwhile: false, roi: 0, reasoning: "No boost config for role" };
    }

    const cost = this.calculateBoostCost(role, bodySize);
    // Energy-to-mineral ratio: configurable, conservative estimate
    // 1 mineral ≈ 10 energy in value for boost compounds
    const totalCost = cost.mineral + cost.energy * 0.1;

    // Calculate expected gains based on actual Screeps mechanics
    let expectedGain = 0;

    // Different roles have different boost effectiveness
    switch (role) {
      case "soldier": {
        const attackParts = Math.floor(bodySize / 3);
        const baseDamage = 30;
        const boostMultiplier = 4; // XUH2O
        expectedGain = attackParts * baseDamage * boostMultiplier * expectedLifetime;
        break;
      }
      case "ranger": {
        const rangedParts = Math.floor(bodySize / 3);
        const baseDamage = 10;
        const boostMultiplier = 4; // XKHO2
        expectedGain = rangedParts * baseDamage * boostMultiplier * expectedLifetime;
        break;
      }
      case "healer": {
        const healParts = Math.floor(bodySize / 3);
        const baseHeal = 12;
        const boostMultiplier = 4; // XLHO2
        expectedGain = healParts * baseHeal * boostMultiplier * expectedLifetime;
        break;
      }
      case "siegeUnit": {
        const workParts = Math.floor(bodySize / 3);
        const baseDismantle = 50;
        const boostMultiplier = 4; // XGH2O
        expectedGain = workParts * baseDismantle * boostMultiplier * expectedLifetime;
        break;
      }
      default: {
        expectedGain = bodySize * 10 * expectedLifetime;
      }
    }

    // Adjust for danger level - higher danger = more valuable
    expectedGain *= 1 + dangerLevel * 0.5;

    const roi = expectedGain / totalCost;
    const worthwhile = roi > 1.5; // Need at least 1.5x return

    const reasoning = worthwhile
      ? `High ROI: ${roi.toFixed(2)}x (gain: ${expectedGain.toFixed(0)}, cost: ${totalCost.toFixed(0)})`
      : `Low ROI: ${roi.toFixed(2)}x (gain: ${expectedGain.toFixed(0)}, cost: ${totalCost.toFixed(0)})`;

    return { worthwhile, roi, reasoning };
  }
}

/**
 * Global boost manager instance
 */
export const boostManager = new BoostManager();
