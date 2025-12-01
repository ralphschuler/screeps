/**
 * Military Behaviors
 *
 * Simple, human-readable behavior functions for military roles.
 * Includes defense, offense, and squad-based combat.
 */

import type { CreepAction, CreepContext } from "./types";
import type { SquadMemory, SwarmCreepMemory } from "../../memory/schemas";

// =============================================================================
// Combat Helpers
// =============================================================================

/**
 * Find the highest priority hostile target.
 * Priority: Healers > Ranged > Melee > Claimers > Workers
 */
function findPriorityTarget(ctx: CreepContext): Creep | null {
  if (ctx.hostiles.length === 0) return null;

  const scored = ctx.hostiles.map(hostile => {
    let score = 0;
    for (const part of hostile.body) {
      if (!part.hits) continue;
      switch (part.type) {
        case HEAL: score += 100; break;
        case RANGED_ATTACK: score += 50; break;
        case ATTACK: score += 40; break;
        case CLAIM: score += 60; break;
        case WORK: score += 30; break;
      }
      if (part.boost) score += 20;
    }
    return { hostile, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.hostile ?? null;
}

/**
 * Check if creep has a specific body part.
 */
function hasBodyPart(creep: Creep, part: BodyPartConstant): boolean {
  return creep.getActiveBodyparts(part) > 0;
}

/**
 * Get squad memory by ID.
 */
function getSquadMemory(squadId: string): SquadMemory | undefined {
  const mem = Memory as unknown as Record<string, Record<string, SquadMemory>>;
  return mem.squads?.[squadId];
}

// =============================================================================
// Role Behaviors
// =============================================================================

/**
 * Guard - Home defense creep.
 * Attacks nearby hostiles, patrols near spawn when idle.
 */
export function guard(ctx: CreepContext): CreepAction {
  const target = findPriorityTarget(ctx);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
    const hasMelee = hasBodyPart(ctx.creep, ATTACK);

    if (hasRanged && range <= 3) return { type: "rangedAttack", target };
    if (hasMelee && range <= 1) return { type: "attack", target };
    return { type: "moveTo", target };
  }

  // No hostiles - patrol near spawn
  const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
  if (spawn && ctx.creep.pos.getRangeTo(spawn) > 5) {
    return { type: "moveTo", target: spawn };
  }

  return { type: "idle" };
}

/**
 * Healer - Support creep that heals allies.
 * Priority: self-heal if critical → heal nearby allies → follow military creeps
 */
export function healer(ctx: CreepContext): CreepAction {
  // Heal self if critically damaged
  if (ctx.creep.hits < ctx.creep.hitsMax * 0.5) {
    return { type: "heal", target: ctx.creep };
  }

  // Heal nearby damaged allies
  const damagedNearby = ctx.creep.pos.findInRange(FIND_MY_CREEPS, 3, {
    filter: c => c.hits < c.hitsMax
  });

  if (damagedNearby.length > 0) {
    damagedNearby.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);
    const target = damagedNearby[0]!;
    const range = ctx.creep.pos.getRangeTo(target);

    if (range <= 1) return { type: "heal", target };
    return { type: "rangedHeal", target };
  }

  // Follow military creeps
  const military = ctx.creep.pos.findClosestByRange(FIND_MY_CREEPS, {
    filter: c => {
      const m = c.memory as unknown as SwarmCreepMemory;
      return m.family === "military" && m.role !== "healer";
    }
  });

  if (military) return { type: "moveTo", target: military };

  return { type: "idle" };
}

/**
 * Soldier - Offensive combat creep.
 * Attacks hostiles and hostile structures.
 */
export function soldier(ctx: CreepContext): CreepAction {
  // Check for squad assignment
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // Solo behavior
  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Find and attack hostile creeps
  const target = findPriorityTarget(ctx);
  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
    const hasMelee = hasBodyPart(ctx.creep, ATTACK);

    if (hasRanged && range <= 3) return { type: "rangedAttack", target };
    if (hasMelee && range <= 1) return { type: "attack", target };
    return { type: "moveTo", target };
  }

  // Attack hostile structures
  const hostileStructure = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_CONTROLLER
  });
  if (hostileStructure) return { type: "attack", target: hostileStructure };

  return { type: "idle" };
}

/**
 * Siege - Dismantler creep for breaking defenses.
 * Priority: spawns → towers → walls/ramparts → other structures
 */
export function siege(ctx: CreepContext): CreepAction {
  // Check for squad assignment
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Priority targets for dismantling
  const spawn = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
  if (spawn) return { type: "dismantle", target: spawn };

  const tower = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  });
  if (tower) return { type: "dismantle", target: tower };

  const wall = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) &&
      s.hits < 100000
  });
  if (wall) return { type: "dismantle", target: wall };

  const structure = ctx.creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
    filter: s => s.structureType !== STRUCTURE_CONTROLLER
  });
  if (structure) return { type: "dismantle", target: structure };

  return { type: "idle" };
}

/**
 * Harasser - Hit-and-run attacker targeting workers.
 * Flees from dangerous combat creeps.
 */
export function harasser(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn) return { type: "moveTo", target: spawn };
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Check for dangerous hostiles nearby - flee if present
  // First filter by range (cheap), then check body parts (more expensive)
  const nearbyHostiles = ctx.hostiles.filter(h => ctx.creep.pos.getRangeTo(h) < 5);
  const dangerous = nearbyHostiles.filter(h =>
    h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK)
  );

  if (dangerous.length > 0) {
    return { type: "flee", from: dangerous.map(d => d.pos) };
  }

  // Target workers
  const workers = ctx.hostiles.filter(h =>
    h.body.some(p => p.type === WORK || p.type === CARRY)
  );

  if (workers.length > 0) {
    const target = workers.reduce((a, b) =>
      ctx.creep.pos.getRangeTo(a) < ctx.creep.pos.getRangeTo(b) ? a : b
    );
    const range = ctx.creep.pos.getRangeTo(target);

    if (range <= 1) return { type: "attack", target };
    if (range <= 3) return { type: "rangedAttack", target };
    return { type: "moveTo", target };
  }

  return { type: "idle" };
}

/**
 * Ranger - Ranged kiting creep.
 * Maintains distance of 3 tiles while attacking.
 */
export function ranger(ctx: CreepContext): CreepAction {
  // Check for squad assignment
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  const target = findPriorityTarget(ctx);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);

    // Kite at range 3
    if (range < 3) return { type: "flee", from: [target.pos] };
    if (range <= 3) return { type: "rangedAttack", target };
    return { type: "moveTo", target };
  }

  // No targets - return home
  const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
  if (spawn && ctx.creep.pos.getRangeTo(spawn) > 10) {
    return { type: "moveTo", target: spawn };
  }

  return { type: "idle" };
}

// =============================================================================
// Squad Behavior
// =============================================================================

/**
 * Execute squad-coordinated behavior.
 */
function squadBehavior(ctx: CreepContext, squad: SquadMemory): CreepAction {
  switch (squad.state) {
    case "gathering":
      // Move to rally point
      if (ctx.room.name !== squad.rallyRoom) {
        return { type: "moveToRoom", roomName: squad.rallyRoom };
      }
      return { type: "moveTo", target: new RoomPosition(25, 25, squad.rallyRoom) };

    case "moving": {
      const targetRoom = squad.targetRooms[0];
      if (targetRoom && ctx.room.name !== targetRoom) {
        return { type: "moveToRoom", roomName: targetRoom };
      }
      return { type: "idle" };
    }

    case "attacking":
      // Execute role-specific attack behavior
      switch (ctx.memory.role) {
        case "soldier":
        case "guard":
          return soldier(ctx);
        case "healer":
          return healer(ctx);
        case "siegeUnit":
          return siege(ctx);
        case "ranger":
          return ranger(ctx);
        default:
          return soldier(ctx);
      }

    case "retreating":
      if (ctx.room.name !== squad.rallyRoom) {
        return { type: "moveToRoom", roomName: squad.rallyRoom };
      }
      return { type: "moveTo", target: new RoomPosition(25, 25, squad.rallyRoom) };

    case "dissolving":
      if (ctx.room.name !== ctx.homeRoom) {
        return { type: "moveToRoom", roomName: ctx.homeRoom };
      }
      delete ctx.memory.squadId;
      return { type: "idle" };

    default:
      return { type: "idle" };
  }
}

// =============================================================================
// Role Dispatcher
// =============================================================================

const militaryBehaviors: Record<string, (ctx: CreepContext) => CreepAction> = {
  guard,
  healer,
  soldier,
  siegeUnit: siege,
  harasser,
  ranger
};

/**
 * Evaluate and return an action for a military role creep.
 */
export function evaluateMilitaryBehavior(ctx: CreepContext): CreepAction {
  const behavior = militaryBehaviors[ctx.memory.role] ?? guard;
  return behavior(ctx);
}
