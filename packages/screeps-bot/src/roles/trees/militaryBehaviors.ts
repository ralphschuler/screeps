/**
 * Military Role Behaviors
 *
 * Behavior functions for all military creep roles.
 * Includes home defense and offensive combat roles.
 */

import type { SwarmAction, SwarmCreepContext } from "./context";
import type { SquadMemory, SwarmCreepMemory } from "../../memory/schemas";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Find hostile target with priority scoring
 * Priority: Healers > Ranged > Melee > Claimers > Workers
 */
function findPriorityTarget(ctx: SwarmCreepContext): Creep | null {
  if (ctx.hostiles.length === 0) return null;

  const scored = ctx.hostiles.map(hostile => {
    let score = 0;

    for (const part of hostile.body) {
      if (!part.hits) continue;

      switch (part.type) {
        case HEAL:
          score += 100;
          break;
        case RANGED_ATTACK:
          score += 50;
          break;
        case ATTACK:
          score += 40;
          break;
        case CLAIM:
          score += 60;
          break;
        case WORK:
          score += 30;
          break;
      }

      if (part.boost) {
        score += 20;
      }
    }

    return { hostile, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.hostile ?? null;
}

/**
 * Check if creep has specific body parts
 */
function hasBodyPart(creep: Creep, part: BodyPartConstant): boolean {
  return creep.getActiveBodyparts(part) > 0;
}

/**
 * Get squad memory
 */
function getSquadMemory(squadId: string): SquadMemory | undefined {
  const mem = Memory as unknown as Record<string, Record<string, SquadMemory>>;
  return mem.squads?.[squadId];
}

// =============================================================================
// GuardAnt - Home defense
// =============================================================================

export function evaluateGuard(ctx: SwarmCreepContext): SwarmAction {
  const target = findPriorityTarget(ctx);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
    const hasMelee = hasBodyPart(ctx.creep, ATTACK);

    // Attack if in range
    if (hasRanged && range <= 3) {
      return { type: "rangedAttack", target };
    }

    if (hasMelee && range <= 1) {
      return { type: "attack", target };
    }

    // Move towards target
    return { type: "moveTo", target };
  } else {
    // No hostiles, patrol near spawn
    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn && ctx.creep.pos.getRangeTo(spawn) > 5) {
      return { type: "moveTo", target: spawn };
    }
    return { type: "idle" };
  }
}

// =============================================================================
// HealerAnt
// =============================================================================

export function evaluateHealer(ctx: SwarmCreepContext): SwarmAction {
  // Priority 1: Heal self if critically damaged
  if (ctx.creep.hits < ctx.creep.hitsMax * 0.5) {
    return { type: "heal", target: ctx.creep };
  }

  // Priority 2: Heal nearby damaged allies
  const damagedNearby = ctx.creep.pos.findInRange(FIND_MY_CREEPS, 3, {
    filter: c => c.hits < c.hitsMax
  });

  if (damagedNearby.length > 0) {
    damagedNearby.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);
    const target = damagedNearby[0]!;
    const range = ctx.creep.pos.getRangeTo(target);

    if (range <= 1) {
      return { type: "heal", target };
    } else {
      return { type: "rangedHeal", target };
    }
  }

  // Priority 3: Follow military creeps
  const military = ctx.creep.pos.findClosestByRange(FIND_MY_CREEPS, {
    filter: c => {
      const m = c.memory as unknown as SwarmCreepMemory;
      return m.family === "military" && m.role !== "healer";
    }
  });

  if (military) {
    return { type: "moveTo", target: military };
  }

  return { type: "idle" };
}

// =============================================================================
// SoldierAnt - Offensive melee/range
// =============================================================================

export function evaluateSoldier(ctx: SwarmCreepContext): SwarmAction {
  // Check if in a squad
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) {
      return evaluateSquadBehavior(ctx, squad);
    }
  }

  // Solo behavior
  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Move to target room if not there
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // In target room - find and attack
  const target = findPriorityTarget(ctx);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
    const hasMelee = hasBodyPart(ctx.creep, ATTACK);

    if (hasRanged && range <= 3) {
      return { type: "rangedAttack", target };
    }

    if (hasMelee && range <= 1) {
      return { type: "attack", target };
    }

    return { type: "moveTo", target };
  }

  // Attack structures
  const hostileStructure = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_CONTROLLER
  });

  if (hostileStructure) {
    return { type: "attack", target: hostileStructure };
  }

  return { type: "idle" };
}

// =============================================================================
// SiegeUnit - Dismantler/tough
// =============================================================================

export function evaluateSiege(ctx: SwarmCreepContext): SwarmAction {
  // Check if in a squad
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) {
      return evaluateSquadBehavior(ctx, squad);
    }
  }

  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Move to target room if not there
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Priority 1: Dismantle spawns
  const spawn = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
  if (spawn) {
    return { type: "dismantle", target: spawn };
  }

  // Priority 2: Dismantle towers
  const tower = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  });
  if (tower) {
    return { type: "dismantle", target: tower };
  }

  // Priority 3: Dismantle walls/ramparts
  const wall = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits < 100000
  });
  if (wall) {
    return { type: "dismantle", target: wall };
  }

  // Priority 4: Any hostile structure
  const structure = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_CONTROLLER
  });
  if (structure) {
    return { type: "dismantle", target: structure };
  }

  return { type: "idle" };
}

// =============================================================================
// Harasser - Hit and run
// =============================================================================

export function evaluateHarasser(ctx: SwarmCreepContext): SwarmAction {
  const targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    // Wait near spawn
    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn) {
      return { type: "moveTo", target: spawn };
    }
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Check for dangerous hostiles nearby
  const dangerous = ctx.hostiles.filter(h => {
    const hasAttack = h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK);
    return hasAttack && ctx.creep.pos.getRangeTo(h) < 5;
  });

  if (dangerous.length > 0) {
    // Flee
    return {
      type: "flee",
      from: dangerous.map(d => d.pos)
    };
  }

  // Target workers
  const workers = ctx.hostiles.filter(h => {
    return h.body.some(p => p.type === WORK || p.type === CARRY);
  });

  if (workers.length > 0) {
    const target = workers.reduce((a, b) => (ctx.creep.pos.getRangeTo(a) < ctx.creep.pos.getRangeTo(b) ? a : b));
    const range = ctx.creep.pos.getRangeTo(target);

    if (range <= 1) {
      return { type: "attack", target };
    }

    if (range <= 3) {
      return { type: "rangedAttack", target };
    }
    return { type: "moveTo", target };
  }

  return { type: "idle" };
}

// =============================================================================
// Ranger - Ranged kiting
// =============================================================================

export function evaluateRanger(ctx: SwarmCreepContext): SwarmAction {
  // Check if in a squad
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) {
      return evaluateSquadBehavior(ctx, squad);
    }
  }

  const target = findPriorityTarget(ctx);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);

    // Kiting behavior - maintain distance of 3
    if (range < 3) {
      // Move away
      return { type: "flee", from: [target.pos] };
    }

    if (range <= 3) {
      return { type: "rangedAttack", target };
    }

    // Move closer
    return { type: "moveTo", target };
  }

  // No targets, return home
  const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
  if (spawn && ctx.creep.pos.getRangeTo(spawn) > 10) {
    return { type: "moveTo", target: spawn };
  }

  return { type: "idle" };
}

// =============================================================================
// Squad Behavior
// =============================================================================

function evaluateSquadBehavior(ctx: SwarmCreepContext, squad: SquadMemory): SwarmAction {
  switch (squad.state) {
    case "gathering": {
      // Move to rally point
      if (ctx.room.name !== squad.rallyRoom) {
        return { type: "moveToRoom", roomName: squad.rallyRoom };
      }

      // In rally room, move to center
      return { type: "moveTo", target: new RoomPosition(25, 25, squad.rallyRoom) };
    }

    case "moving": {
      const targetRoom = squad.targetRooms[0];
      if (targetRoom && ctx.room.name !== targetRoom) {
        return { type: "moveToRoom", roomName: targetRoom };
      }
      return { type: "idle" };
    }

    case "attacking": {
      // Execute role-specific attack
      switch (ctx.memory.role) {
        case "soldier":
        case "guard":
          return evaluateSoldier(ctx);
        case "healer":
          return evaluateHealer(ctx);
        case "siegeUnit":
          return evaluateSiege(ctx);
        case "ranger":
          return evaluateRanger(ctx);
        default:
          return evaluateSoldier(ctx);
      }
    }

    case "retreating": {
      // Return to rally room
      if (ctx.room.name !== squad.rallyRoom) {
        return { type: "moveToRoom", roomName: squad.rallyRoom };
      }
      return { type: "moveTo", target: new RoomPosition(25, 25, squad.rallyRoom) };
    }

    case "dissolving": {
      // Return home
      if (ctx.room.name !== ctx.homeRoom) {
        return { type: "moveToRoom", roomName: ctx.homeRoom };
      }
      delete ctx.memory.squadId;
      return { type: "idle" };
    }

    default:
      return { type: "idle" };
  }
}

// =============================================================================
// Dispatcher
// =============================================================================

const militaryEvaluators: Record<string, (ctx: SwarmCreepContext) => SwarmAction> = {
  guard: evaluateGuard,
  healer: evaluateHealer,
  soldier: evaluateSoldier,
  siegeUnit: evaluateSiege,
  harasser: evaluateHarasser,
  ranger: evaluateRanger
};

export function evaluateMilitaryRole(ctx: SwarmCreepContext): SwarmAction {
  const evaluator = militaryEvaluators[ctx.memory.role] ?? evaluateGuard;
  return evaluator(ctx);
}
