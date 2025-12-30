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
 * Priority:
 * 1. Move to target room if assigned and not there
 * 2. Attack hostile creeps (prioritize high-value targets like healers and ranged attackers)
 * 3. Attack hostile structures (excluding controllers)
 * 4. Idle when no targets available
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function attackBehavior(ctx: CreepContext): BehaviorResult {
  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Priority 1: Move to target room if assigned and not there
  if (ctx.room.name !== targetRoom) {
    return {
      action: { type: "moveToRoom", roomName: targetRoom },
      success: true,
      context: "attack:move-to-target"
    };
  }

  // Priority 2: Find and attack hostile creeps (prioritize high-value targets)
  const target = findPriorityTarget(ctx.hostiles);
  
  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = ctx.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
    const hasMelee = ctx.creep.getActiveBodyparts(ATTACK) > 0;

    // Use ranged attack if available and in range
    if (hasRanged && range <= 3) {
      return {
        action: { type: "rangedAttack", target },
        success: true,
        context: "attack:ranged-attack-creep"
      };
    }

    // Use melee attack if available and adjacent
    if (hasMelee && range <= 1) {
      return {
        action: { type: "attack", target },
        success: true,
        context: "attack:melee-attack-creep"
      };
    }

    // Move towards target if out of range
    return {
      action: { type: "moveTo", target },
      success: true,
      context: "attack:approach-hostile"
    };
  }

  // Priority 3: Attack hostile structures (excluding controllers)
  const hostileStructures = ctx.room.find(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_CONTROLLER
  });

  if (hostileStructures.length > 0) {
    // Find closest hostile structure
    const structure = ctx.creep.pos.findClosestByRange(hostileStructures);
    
    if (structure) {
      const range = ctx.creep.pos.getRangeTo(structure);
      const hasRanged = ctx.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
      const hasMelee = ctx.creep.getActiveBodyparts(ATTACK) > 0;

      // Use ranged attack if available and in range
      if (hasRanged && range <= 3) {
        return {
          action: { type: "rangedAttack", target: structure },
          success: true,
          context: "attack:ranged-attack-structure"
        };
      }

      // Use melee attack if available and adjacent
      if (hasMelee && range <= 1) {
        return {
          action: { type: "attack", target: structure },
          success: true,
          context: "attack:melee-attack-structure"
        };
      }

      // Move towards structure if out of range
      return {
        action: { type: "moveTo", target: structure },
        success: true,
        context: "attack:approach-structure"
      };
    }
  }

  // Priority 4: No targets - idle
  return {
    action: { type: "idle" },
    success: true,
    context: "attack:idle"
  };
}

/**
 * Defend behavior - Defensive combat actions.
 * 
 * A defender patrols the home room and engages hostile threats,
 * prioritizing high-value targets like healers and ranged attackers.
 * 
 * Priority:
 * 1. Engage hostile creeps in home room (prioritize high-value targets)
 * 2. Patrol the room when no hostiles present
 * 3. Return to home room if away
 * 4. Idle near spawn as fallback
 * 
 * @param ctx - The creep context
 * @returns Behavior result with action to execute
 */
export function defendBehavior(ctx: CreepContext): BehaviorResult {
  // Priority 1: Return to home room if not there
  if (!ctx.isInHomeRoom) {
    return {
      action: { type: "moveToRoom", roomName: ctx.homeRoom },
      success: true,
      context: "defend:return-home"
    };
  }

  // Priority 2: Engage hostile creeps in home room
  if (ctx.hostiles.length > 0) {
    // Find highest priority target (healers > ranged > melee)
    const target = findPriorityTarget(ctx.hostiles);
    
    if (target) {
      const range = ctx.creep.pos.getRangeTo(target);
      const hasRanged = ctx.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
      const hasMelee = ctx.creep.getActiveBodyparts(ATTACK) > 0;

      // Use ranged attack if available and in range
      if (hasRanged && range <= 3) {
        return {
          action: { type: "rangedAttack", target },
          success: true,
          context: "defend:ranged-attack"
        };
      }

      // Use melee attack if available and adjacent
      if (hasMelee && range <= 1) {
        return {
          action: { type: "attack", target },
          success: true,
          context: "defend:melee-attack"
        };
      }

      // Move towards target
      return {
        action: { type: "moveTo", target },
        success: true,
        context: "defend:approach-hostile"
      };
    }
  }

  // Priority 3: Patrol the room when no hostiles
  // Find spawn structures to patrol near
  const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
  
  if (spawns.length > 0) {
    const spawn = spawns[0];
    
    // Create basic patrol points around spawn area
    const patrolPoints = [
      { x: spawn.pos.x + 5, y: spawn.pos.y },
      { x: spawn.pos.x - 5, y: spawn.pos.y },
      { x: spawn.pos.x, y: spawn.pos.y + 5 },
      { x: spawn.pos.x, y: spawn.pos.y - 5 }
    ].map(pos => new RoomPosition(
      Math.max(2, Math.min(47, pos.x)),
      Math.max(2, Math.min(47, pos.y)),
      ctx.room.name
    ));

    // Find closest patrol point
    let closestPoint = patrolPoints[0];
    let minDist = ctx.creep.pos.getRangeTo(closestPoint!);
    
    for (const point of patrolPoints) {
      const dist = ctx.creep.pos.getRangeTo(point);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    }

    // If not near any patrol point, move to closest one
    if (minDist > 3 && closestPoint) {
      return {
        action: { type: "moveTo", target: closestPoint },
        success: true,
        context: "defend:patrol"
      };
    }
  }

  // Priority 4: Idle (already at patrol position or near spawn)
  return {
    action: { type: "idle" },
    success: true,
    context: "defend:idle"
  };
}

/**
 * Find the highest priority hostile target for defense.
 * Priority: Healers > Ranged > Melee > Claimers > Workers
 * 
 * @param hostiles - List of hostile creeps to prioritize
 * @returns The highest priority target, or null if none
 */
function findPriorityTarget(hostiles: Creep[]): Creep | null {
  if (hostiles.length === 0) return null;

  const scored = hostiles.map(hostile => {
    let score = 0;
    
    // Use getActiveBodyparts() for efficient body part counting
    const healParts = hostile.getActiveBodyparts(HEAL);
    const rangedParts = hostile.getActiveBodyparts(RANGED_ATTACK);
    const attackParts = hostile.getActiveBodyparts(ATTACK);
    const claimParts = hostile.getActiveBodyparts(CLAIM);
    const workParts = hostile.getActiveBodyparts(WORK);
    
    // Calculate score based on body composition (higher = higher priority)
    score += healParts * 100;      // Healers are top priority
    score += rangedParts * 50;     // Ranged attackers second
    score += attackParts * 40;     // Melee attackers third
    score += claimParts * 60;      // Claimers are high priority (can capture controller)
    score += workParts * 30;       // Workers lowest priority
    
    // Boost bonus - boosted creeps are more dangerous
    for (const part of hostile.body) {
      if (part.boost) {
        score += 20;
        break; // Only add bonus once
      }
    }
    
    return { hostile, score };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0]?.hostile ?? null;
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
