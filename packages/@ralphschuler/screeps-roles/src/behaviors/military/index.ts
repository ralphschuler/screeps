/**
 * Military Behaviors
 *
 * Composable behavior functions for military roles.
 * These are placeholder implementations that delegate to the full bot logic.
 * 
 * Future implementations will extract and simplify these behaviors to be
 * truly reusable and framework-independent.
 */

import type { CreepContext, BehaviorResult } from "../../framework/types";

/**
 * Attack behavior - Offensive combat actions.
 * 
 * An attacker seeks out and engages hostile creeps and structures,
 * using melee or ranged attacks based on body composition.
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function attackBehavior(ctx: CreepContext): BehaviorResult {
  // TODO: Implement standalone attack behavior
  // Issue URL: https://github.com/ralphschuler/screeps/issues/974
  // For now, this is a placeholder that returns idle
  // Full implementation requires extracting logic from screeps-bot
  return {
    action: { type: "idle" },
    success: false,
    error: "attackBehavior not yet implemented",
    context: "attack"
  };
}

/**
 * Defend behavior - Defensive combat actions.
 * 
 * A defender patrols the home room and engages hostile threats,
 * prioritizing high-value targets like healers and ranged attackers.
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function defendBehavior(ctx: CreepContext): BehaviorResult {
  // TODO: Implement standalone defend behavior
  // Issue URL: https://github.com/ralphschuler/screeps/issues/973
  // For now, this is a placeholder that returns idle
  // Full implementation requires extracting logic from screeps-bot
  return {
    action: { type: "idle" },
    success: false,
    error: "defendBehavior not yet implemented",
    context: "defend"
  };
}

/**
 * Heal behavior - Support and healing actions.
 * 
 * A healer follows military units and heals damaged allies,
 * prioritizing self-healing when critically damaged.
 * 
 * Priority:
 * 1. Self-heal if critically damaged (< 50% health)
 * 2. Heal nearby damaged allies (range 3, prioritize most damaged)
 * 3. Follow and stay near other military creeps
 * 4. Idle
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function healBehavior(ctx: CreepContext): BehaviorResult {
  // Priority 1: Always heal self if critically damaged (< 50% health)
  if (ctx.creep.hits < ctx.creep.hitsMax * 0.5) {
    return {
      action: { type: "heal", target: ctx.creep },
      success: true,
      context: "heal:self-critical"
    };
  }

  // Priority 2: Heal nearby damaged allies (within range 3)
  const damagedNearby = ctx.creep.pos.findInRange(FIND_MY_CREEPS, 3, {
    filter: c => c.hits < c.hitsMax
  });

  if (damagedNearby.length > 0) {
    // Sort by health percentage to prioritize most damaged
    damagedNearby.sort((a, b) => {
      const ratioA = a.hitsMax > 0 ? a.hits / a.hitsMax : 1;
      const ratioB = b.hitsMax > 0 ? b.hits / b.hitsMax : 1;
      return ratioA - ratioB;
    });
    
    const target = damagedNearby[0]!;
    const range = ctx.creep.pos.getRangeTo(target);

    // Use melee heal if adjacent, ranged heal otherwise
    if (range <= 1) {
      return {
        action: { type: "heal", target },
        success: true,
        context: "heal:ally-melee"
      };
    } else {
      return {
        action: { type: "rangedHeal", target },
        success: true,
        context: "heal:ally-ranged"
      };
    }
  }

  // Priority 3: Follow military creeps to stay near combat units
  // Look for hostile presence to identify if room has combat activity
  if (ctx.hostiles.length > 0) {
    // Find friendly military creeps in the room
    const militaryCreeps = ctx.room.find(FIND_MY_CREEPS, {
      filter: c => {
        // Look for creeps with attack or ranged attack parts
        return c.getActiveBodyparts(ATTACK) > 0 || 
               c.getActiveBodyparts(RANGED_ATTACK) > 0;
      }
    });

    if (militaryCreeps.length > 0) {
      // Find closest military creep
      const closestMilitary = ctx.creep.pos.findClosestByRange(militaryCreeps);
      if (closestMilitary) {
        // Stay within range 3 of military units
        const range = ctx.creep.pos.getRangeTo(closestMilitary);
        if (range > 3) {
          return {
            action: { type: "moveTo", target: closestMilitary },
            success: true,
            context: "heal:follow-military"
          };
        }
      }
    }
  }

  // Priority 4: No immediate healing targets - idle
  return {
    action: { type: "idle" },
    success: true,
    context: "heal:idle"
  };
}
