/**
 * Military Behaviors
 *
 * Simple, human-readable behavior functions for military roles.
 * Includes defense, offense, and squad-based combat.
 */

import type { SquadMemory, SwarmCreepMemory } from "../memory/schemas";
import {
  calculateCombatPower,
  checkAndExecuteRetreat,
  getActualHostileCreeps,
  getActualHostileStructures,
  getVisibleDefenseAssistThreatProfile,
  isKnownAllyPlayer,
  isDefenseAssistThreatProfileHard,
  type CombatPower,
  type DefenseAssistThreatProfile
} from "@ralphschuler/screeps-defense";
import { findCachedClosest } from "../cache";
import { getNextPatrolWaypoint, getPatrolWaypoints } from "./military/patrolWaypoints";
import { registerMilitaryCacheClear } from "./context";
import type { CreepAction, CreepContext } from "./types";
import { createLogger } from "@ralphschuler/screeps-core";
import { getCollectionPoint } from "../utils/common";
import { taskBoard } from "../tasks";

const logger = createLogger("MilitaryBehaviors");

const DEFENSE_ASSIST_SQUAD_STAGE_TIMEOUT = 250;
const DEFENSE_ASSIST_HARD_THREAT_STAGE_TIMEOUT = 750;
const DEFENSE_ASSIST_HARD_THREAT_RELEASE_QUORUM = 5;
const DEFENSE_ASSIST_HARD_THREAT_TRICKLE_INTERVAL = 50;
const DEFENSE_ASSIST_TASK = "defenseAssist";

type DefenseAssistRole = "guard" | "ranger" | "healer";

interface DefenseAssistRequestMemory {
  roomName: string;
  guardsNeeded?: number;
  rangersNeeded?: number;
  healersNeeded?: number;
  urgency?: number;
  createdAt?: number;
}

interface MemoryWithDefenseRequests {
  defenseRequests?: DefenseAssistRequestMemory[] | Record<string, DefenseAssistRequestMemory>;
}

interface MemoryWithDefenseAssistTrickleReleases {
  defenseAssistTrickleReleases?: Record<string, number>;
}

function getDefenseAssistTargetRoom(mem: Partial<SwarmCreepMemory>): string | undefined {
  return mem.assistTarget ?? (mem.task === DEFENSE_ASSIST_TASK ? mem.targetRoom : undefined);
}

function clearDefenseAssistAssignment(mem: SwarmCreepMemory): void {
  delete mem.assistTarget;
  delete mem.defenseSquadId;
  delete mem.defenseSquadSize;
  delete mem.defenseSquadCreatedAt;
  delete mem.defenseAssistReleasedAt;
  if (mem.task === DEFENSE_ASSIST_TASK) {
    delete mem.task;
    delete mem.targetRoom;
  }
}

function isDefenseAssistSquadConfigured(mem: SwarmCreepMemory): boolean {
  return Boolean(getDefenseAssistTargetRoom(mem) && mem.defenseSquadId && mem.defenseSquadSize && mem.defenseSquadSize > 0);
}

function isDefenseAssistSquadStagingExpired(mem: SwarmCreepMemory, hardThreat: boolean): boolean {
  if (mem.defenseSquadCreatedAt === undefined) return true;
  const timeout = hardThreat ? DEFENSE_ASSIST_HARD_THREAT_STAGE_TIMEOUT : DEFENSE_ASSIST_SQUAD_STAGE_TIMEOUT;
  return Game.time - mem.defenseSquadCreatedAt >= timeout;
}

function markDefenseAssistReleased(mem: SwarmCreepMemory): void {
  mem.defenseAssistReleasedAt ??= Game.time;
}

function emptyCombatPower(): CombatPower {
  return { partCount: 0, attack: 0, ranged: 0, heal: 0, dismantle: 0, score: 0 };
}

function addCombatPower(a: CombatPower, b: CombatPower): CombatPower {
  return {
    partCount: a.partCount + b.partCount,
    attack: a.attack + b.attack,
    ranged: a.ranged + b.ranged,
    heal: a.heal + b.heal,
    dismantle: a.dismantle + b.dismantle,
    score: a.score + b.score
  };
}

function hasVisibleHardDefenseAssistThreat(targetRoom: string): boolean {
  return isDefenseAssistThreatProfileHard(getVisibleDefenseAssistThreatProfile(targetRoom));
}

function getDefenseAssistSquadReleaseQuorum(mem: SwarmCreepMemory, hardThreat: boolean): number {
  return hardThreat ? DEFENSE_ASSIST_HARD_THREAT_RELEASE_QUORUM : (mem.defenseSquadSize ?? 1);
}

function hasHomeRoomDefenseThreat(ctx: CreepContext): boolean {
  return ctx.creep.room.name === ctx.homeRoom && getActualHostileCreeps(ctx.room).length > 0;
}

function isDefenseAssistRole(role: string | undefined): role is DefenseAssistRole {
  return role === "guard" || role === "ranger" || role === "healer";
}

function isDefenseAssistRequest(value: unknown): value is DefenseAssistRequestMemory {
  return Boolean(value && typeof value === "object" && typeof (value as DefenseAssistRequestMemory).roomName === "string");
}

function getActiveDefenseAssistRequests(): DefenseAssistRequestMemory[] {
  const requests = (Memory as unknown as MemoryWithDefenseRequests).defenseRequests;
  const values = Array.isArray(requests) ? requests : Object.values(requests ?? {});
  return values
    .filter(isDefenseAssistRequest)
    .sort((a, b) => {
      const urgencyDelta = (b.urgency ?? 0) - (a.urgency ?? 0);
      if (urgencyDelta !== 0) return urgencyDelta;
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });
}

function getDefenseAssistRequestNeed(request: DefenseAssistRequestMemory, role: DefenseAssistRole): number {
  if (role === "guard") return Math.max(0, request.guardsNeeded ?? 0);
  if (role === "ranger") return Math.max(0, request.rangersNeeded ?? 0);
  return Math.max(0, request.healersNeeded ?? 0);
}

function getTotalDefenseAssistRequestNeed(request: DefenseAssistRequestMemory): number {
  return getDefenseAssistRequestNeed(request, "guard") +
    getDefenseAssistRequestNeed(request, "ranger") +
    getDefenseAssistRequestNeed(request, "healer");
}

function countDefenseAssistMembersForRole(targetRoom: string, role: DefenseAssistRole): number {
  return Object.values(Game.creeps).filter(creep => {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    return !creep.spawning && memory.role === role && getDefenseAssistTargetRoom(memory) === targetRoom;
  }).length;
}

function isReadyDefenseAssistTargetMember(creep: Creep, assistTarget: string, homeRoom: string): boolean {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  return (
    getDefenseAssistTargetRoom(memory) === assistTarget &&
    memory.homeRoom === homeRoom &&
    creep.room.name === homeRoom &&
    !creep.spawning
  );
}

function getReadyDefenseAssistTargetMembers(assistTarget: string, homeRoom: string): Creep[] {
  return Object.values(Game.creeps).filter(creep =>
    isReadyDefenseAssistTargetMember(creep, assistTarget, homeRoom)
  );
}

function countReadyDefenseAssistTargetMembers(assistTarget: string, homeRoom: string): number {
  return getReadyDefenseAssistTargetMembers(assistTarget, homeRoom).length;
}

function calculateReadyDefenseAssistTargetPower(assistTarget: string, homeRoom: string): CombatPower {
  return getReadyDefenseAssistTargetMembers(assistTarget, homeRoom)
    .reduce((total, creep) => {
      const activeBody = creep.body.filter(part => part.hits > 0);
      return addCombatPower(total, calculateCombatPower(activeBody));
    }, emptyCombatPower());
}

function hasReadyDefenseAssistParity(
  assistTarget: string,
  homeRoom: string,
  threatProfile: DefenseAssistThreatProfile
): boolean {
  const readyPower = calculateReadyDefenseAssistTargetPower(assistTarget, homeRoom);
  const hasDamage = readyPower.attack + readyPower.ranged + readyPower.dismantle > 0;
  return hasDamage && readyPower.score >= threatProfile.total.score && readyPower.partCount >= threatProfile.total.partCount;
}

function getActiveDefenseAssistSquadId(homeRoom: string, targetRoom: string): string {
  return `defenseAssist:${homeRoom}:${targetRoom}:active`;
}

function shouldAcquireDefenseAssistRequest(
  request: DefenseAssistRequestMemory,
  role: DefenseAssistRole,
  homeRoom: string
): boolean {
  const requestedRoleNeed = getDefenseAssistRequestNeed(request, role);
  if (requestedRoleNeed > countDefenseAssistMembersForRole(request.roomName, role)) return true;

  return (
    getTotalDefenseAssistRequestNeed(request) > 0 &&
    hasVisibleHardDefenseAssistThreat(request.roomName) &&
    countReadyDefenseAssistTargetMembers(request.roomName, homeRoom) < DEFENSE_ASSIST_HARD_THREAT_RELEASE_QUORUM
  );
}

function tryAcquireDefenseAssistAssignment(ctx: CreepContext, mem: SwarmCreepMemory): string | null {
  if (!isDefenseAssistRole(mem.role)) return null;
  if (ctx.creep.spawning || ctx.creep.room.name !== ctx.homeRoom) return null;
  if (mem.squadId || mem.targetRoom || mem.assistTarget || mem.assignedTaskId) return null;
  if (mem.task && mem.task !== DEFENSE_ASSIST_TASK) return null;
  if (hasHomeRoomDefenseThreat(ctx)) return null;

  for (const request of getActiveDefenseAssistRequests()) {
    const targetRoom = Game.rooms[request.roomName];
    if (!targetRoom || getActualHostileCreeps(targetRoom).length === 0) continue;
    if (!shouldAcquireDefenseAssistRequest(request, mem.role, ctx.homeRoom)) continue;

    mem.task = DEFENSE_ASSIST_TASK;
    mem.targetRoom = request.roomName;
    mem.assistTarget = request.roomName;
    mem.defenseSquadId = getActiveDefenseAssistSquadId(ctx.homeRoom, request.roomName);
    mem.defenseSquadSize = hasVisibleHardDefenseAssistThreat(request.roomName)
      ? Math.max(DEFENSE_ASSIST_HARD_THREAT_RELEASE_QUORUM, getTotalDefenseAssistRequestNeed(request))
      : Math.max(1, getTotalDefenseAssistRequestNeed(request));
    mem.defenseSquadCreatedAt = Game.time;

    return request.roomName;
  }

  return null;
}

function isReadyDefenseAssistSquadMember(
  creep: Creep,
  squadId: string,
  assistTarget: string,
  homeRoom: string
): boolean {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  return memory.defenseSquadId === squadId && isReadyDefenseAssistTargetMember(creep, assistTarget, homeRoom);
}

function countReadyDefenseAssistSquadMembers(mem: SwarmCreepMemory, homeRoom: string): number {
  const assistTarget = getDefenseAssistTargetRoom(mem);
  if (!mem.defenseSquadId || !assistTarget) return 0;
  return Object.values(Game.creeps).filter(creep =>
    isReadyDefenseAssistSquadMember(creep, mem.defenseSquadId!, assistTarget, homeRoom)
  ).length;
}

function getDefenseAssistTrickleKey(homeRoom: string, assistTarget: string): string {
  return `${homeRoom}:${assistTarget}`;
}

function getDefenseAssistTricklePriority(creep: Creep): number {
  const activeDamage = creep.body.some(part =>
    part.hits > 0 && (part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK)
  );
  if (activeDamage) return 0;

  const activeHeal = creep.body.some(part => part.hits > 0 && part.type === HEAL);
  return activeHeal ? 1 : 2;
}

function chooseDefenseAssistTrickleMember(readyMembers: Creep[]): Creep | null {
  return [...readyMembers].sort((a, b) => {
    const priorityDelta = getDefenseAssistTricklePriority(a) - getDefenseAssistTricklePriority(b);
    if (priorityDelta !== 0) return priorityDelta;
    return a.name.localeCompare(b.name);
  })[0] ?? null;
}

function canReleaseHardThreatTrickle(creep: Creep, homeRoom: string, assistTarget: string, readyMembers: Creep[]): boolean {
  if (chooseDefenseAssistTrickleMember(readyMembers)?.name !== creep.name) return false;

  const memory = Memory as unknown as MemoryWithDefenseAssistTrickleReleases;
  const releases = memory.defenseAssistTrickleReleases ??= {};
  const key = getDefenseAssistTrickleKey(homeRoom, assistTarget);
  const lastReleasedAt = releases[key];
  if (lastReleasedAt !== undefined && Game.time - lastReleasedAt < DEFENSE_ASSIST_HARD_THREAT_TRICKLE_INTERVAL) {
    return false;
  }

  releases[key] = Game.time;
  return true;
}

function getDefenseAssistSquadStagingAction(ctx: CreepContext, mem: SwarmCreepMemory): CreepAction | null {
  if (!isDefenseAssistSquadConfigured(mem)) return null;
  if (ctx.creep.room.name !== ctx.homeRoom) return null;

  const assistTarget = getDefenseAssistTargetRoom(mem);
  if (!assistTarget) return null;
  if (mem.defenseAssistReleasedAt !== undefined) return null;

  const threatProfile = getVisibleDefenseAssistThreatProfile(assistTarget);
  const hardThreat = isDefenseAssistThreatProfileHard(threatProfile);
  const readyTargetMembers = hardThreat ? getReadyDefenseAssistTargetMembers(assistTarget, ctx.homeRoom) : [];
  const readyMembers = hardThreat ? readyTargetMembers.length : countReadyDefenseAssistSquadMembers(mem, ctx.homeRoom);

  const releaseQuorum = getDefenseAssistSquadReleaseQuorum(mem, hardThreat);
  const stagingExpired = isDefenseAssistSquadStagingExpired(mem, hardThreat);

  if (threatProfile) {
    if (hasReadyDefenseAssistParity(assistTarget, ctx.homeRoom, threatProfile)) {
      markDefenseAssistReleased(mem);
      return null;
    }
    if (readyMembers >= releaseQuorum) {
      markDefenseAssistReleased(mem);
      return null;
    }
    if (stagingExpired) {
      if (!hardThreat) {
        markDefenseAssistReleased(mem);
        return null;
      }
      if (canReleaseHardThreatTrickle(ctx.creep, ctx.homeRoom, assistTarget, readyTargetMembers)) {
        markDefenseAssistReleased(mem);
        return null;
      }
    }
  } else {
    if (readyMembers >= releaseQuorum) {
      markDefenseAssistReleased(mem);
      return null;
    }
    if (stagingExpired) {
      markDefenseAssistReleased(mem);
      return null;
    }
  }

  const collectionPoint = getCollectionPoint(ctx.room.name);
  return { type: "wait", position: collectionPoint ?? ctx.creep.pos };
}

function isAllyControlledRoom(room: Room): boolean {
  const controllerOwner = room.controller?.owner?.username;
  const controllerReserver = room.controller?.reservation?.username;
  return Boolean(
    (controllerOwner && isKnownAllyPlayer(controllerOwner)) ||
      (controllerReserver && isKnownAllyPlayer(controllerReserver))
  );
}

// =============================================================================
// Combat Helpers
// =============================================================================

/**
 * Find the highest priority hostile target.
 * Priority: Healers > Ranged > Melee > Claimers > Workers
 *
 * Note: We intentionally do NOT use caching here because:
 * 1. Priority scoring is complex and position-independent
 * 2. Cache would only store the closest target, not the highest priority
 * 3. Combat is dynamic - priorities change frequently as creeps take damage
 * 4. This function is only called when hostiles are present (not every tick)
 *
 * OPTIMIZATION: Use getActiveBodyparts() instead of iterating all body parts.
 * This is much faster as it's a native engine call and only counts active parts.
 */
function findPriorityTarget(ctx: CreepContext): Creep | null {
  if (ctx.hostiles.length === 0) return null;

  const scored = ctx.hostiles.map(hostile => {
    let score = 0;
    
    // Use getActiveBodyparts() for faster body part counting
    // OPTIMIZATION: This is O(1) per body part type vs O(n) for iterating all parts
    const healParts = hostile.getActiveBodyparts(HEAL);
    const rangedParts = hostile.getActiveBodyparts(RANGED_ATTACK);
    const attackParts = hostile.getActiveBodyparts(ATTACK);
    const claimParts = hostile.getActiveBodyparts(CLAIM);
    const workParts = hostile.getActiveBodyparts(WORK);
    
    // Calculate score based on body composition
    score += healParts * 100;
    score += rangedParts * 50;
    score += attackParts * 40;
    score += claimParts * 60;
    score += workParts * 30;
    
    // Check for any boosted parts (rare, so only check if score is high)
    if (score > 0) {
      for (const part of hostile.body) {
        if (part.boost) {
          score += 20;
          break; // Only add boost bonus once
        }
      }
    }
    
    return { hostile, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.hostile ?? null;
}

function findAssistHostileStructure(ctx: CreepContext): Structure | null {
  const structures = getActualHostileStructures(ctx.room).filter(s => s.structureType !== STRUCTURE_CONTROLLER);
  if (structures.length === 0) return null;
  return ctx.creep.pos.findClosestByRange(structures) ?? structures[0] ?? null;
}

/**
 * Check if creep has a specific body part.
 */
function hasBodyPart(creep: Creep, part: BodyPartConstant): boolean {
  return creep.getActiveBodyparts(part) > 0;
}

/**
 * Move to collection point if available and not already there.
 * Collection points are designated positions away from spawns where idle military units wait.
 * Returns true if the creep should move to collection point, false otherwise.
 * 
 * @param ctx - Creep context
 * @param debugLabel - Label for debug logging (e.g., "siegeUnit", "harasser")
 * @returns CreepAction to move to collection point, or null if at collection point or unavailable
 */
function moveToCollectionPoint(ctx: CreepContext, debugLabel: string): CreepAction | null {
  if (!ctx.swarmState) return null;
  
  const collectionPoint = getCollectionPoint(ctx.room.name);
  if (!collectionPoint) return null;
  
  // Only move if not already near collection point
  if (ctx.creep.pos.getRangeTo(collectionPoint) > 2) {
    logger.debug(`${ctx.creep.name} ${debugLabel} moving to collection point at ${collectionPoint.x},${collectionPoint.y}`);
    return { type: "moveTo", target: collectionPoint };
  }
  
  return null;
}

function isHealerCombatSupportTarget(creep: Creep, assistTarget?: string): boolean {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  if (memory.role === "healer") return false;
  if (memory.family !== "military") return false;
  if (!assistTarget) return true;
  return getDefenseAssistTargetRoom(memory) === assistTarget;
}

function findWoundedCombatAlly(ctx: CreepContext, assistTarget?: string): Creep | null {
  const wounded = ctx.room.find(FIND_MY_CREEPS, {
    filter: creep => creep.hits < creep.hitsMax && isHealerCombatSupportTarget(creep, assistTarget)
  });
  if (wounded.length === 0) return null;
  return wounded.sort((a, b) => {
    const ratioA = a.hitsMax > 0 ? a.hits / a.hitsMax : 1;
    const ratioB = b.hitsMax > 0 ? b.hits / b.hitsMax : 1;
    if (ratioA !== ratioB) return ratioA - ratioB;
    return ctx.creep.pos.getRangeTo(a) - ctx.creep.pos.getRangeTo(b);
  })[0] ?? null;
}

/**
 * Get squad memory by ID.
 */
function getSquadMemory(squadId: string): SquadMemory | undefined {
  const memory = Memory as unknown as { clusters?: Record<string, { squads?: SquadMemory[] }> };
  for (const cluster of Object.values(memory.clusters ?? {})) {
    const squad = cluster.squads?.find(candidate => candidate.id === squadId);
    if (!squad) continue;
    squad.members = squad.members.filter(name => Boolean(Game.creeps[name]));
    return squad;
  }
  return undefined;
}

function getSquadMembers(squad: SquadMemory): Creep[] {
  return squad.members.map(name => Game.creeps[name]).filter((creep): creep is Creep => Boolean(creep));
}

function getSquadTargetSize(squad: SquadMemory): number {
  const composition = squad.targetComposition ?? {};
  const total = (Object.values(composition) as number[]).reduce((sum, value) => sum + (value ?? 0), 0);
  return total > 0 ? total : squad.members.length;
}

function isSquadFullAtRally(squad: SquadMemory): boolean {
  const composition = squad.targetComposition ?? {};
  const roleCounts: Record<string, number> = {};
  for (const creep of getSquadMembers(squad)) {
    if (creep.room.name !== squad.rallyRoom || creep.spawning) continue;
    const role = (creep.memory as unknown as SwarmCreepMemory).role;
    roleCounts[role] = (roleCounts[role] ?? 0) + 1;
  }
  return Object.entries(composition).every(([role, needed]) => (roleCounts[role] ?? 0) >= (needed ?? 0));
}

function hasSafePartialRallyQuorum(squad: SquadMemory): boolean {
  const rallyMembers = getSquadMembers(squad).filter(creep => creep.room.name === squad.rallyRoom && !creep.spawning);
  const targetSize = getSquadTargetSize(squad);
  if (rallyMembers.length < Math.max(2, Math.ceil(targetSize * 0.6))) return false;

  const roles = new Set<string>(rallyMembers.map(creep => (creep.memory as unknown as SwarmCreepMemory).role));
  const hasCombat = ["guard", "soldier", "ranger", "harasser", "siegeUnit"].some(role => roles.has(role));
  if (!hasCombat) return false;
  if ((squad.targetComposition?.healer ?? 0) > 0 && !roles.has("healer")) return false;
  if (squad.type === "siege" && !roles.has("siegeUnit")) return false;
  return true;
}

function canLocalSquadDepart(squad: SquadMemory): boolean {
  if (isSquadFullAtRally(squad)) return true;
  return Boolean(squad.stagingTimeoutAt && Game.time >= squad.stagingTimeoutAt && hasSafePartialRallyQuorum(squad));
}

function getSquadRallyPosition(squad: SquadMemory): RoomPosition {
  const flag = squad.rallyFlag ? Game.flags?.[squad.rallyFlag] : undefined;
  return flag?.pos ?? new RoomPosition(25, 25, squad.rallyRoom);
}

function getPrimarySquadAttacker(squad: SquadMemory): Creep | null {
  return getSquadMembers(squad).find(creep => (creep.memory as unknown as SwarmCreepMemory).role !== "healer") ?? null;
}

function shouldWaitForCohesion(ctx: CreepContext, squad: SquadMemory): boolean {
  const members = getSquadMembers(squad).filter(creep => creep.room.name === ctx.room.name && !creep.spawning);
  if (members.length <= 1) return false;
  const closest = members.reduce((best, creep) => Math.min(best, ctx.creep.pos.getRangeTo(creep)), Infinity);
  return closest > 6;
}

function getSiegeFormationPosition(ctx: CreepContext, squad: SquadMemory): RoomPosition | null {
  if (squad.type !== "siege") return null;
  const members = getSquadMembers(squad).sort((a, b) => a.name.localeCompare(b.name));
  const index = members.findIndex(creep => creep.name === ctx.creep.name);
  if (index < 0 || index > 3) return null;
  const anchor = members[0]?.pos;
  if (!anchor || anchor.roomName !== ctx.room.name) return null;
  const offsets = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ];
  const offset = offsets[index]!;
  const x = Math.max(1, Math.min(48, anchor.x + offset.x));
  const y = Math.max(1, Math.min(48, anchor.y + offset.y));
  const terrain = ctx.room.getTerrain?.().get(x, y);
  if (terrain === TERRAIN_MASK_WALL) return null;
  return new RoomPosition(x, y, ctx.room.name);
}

// =============================================================================
// Role Behaviors
// =============================================================================

/**
 * Guard - Home defense creep.
 * Attacks nearby hostiles, patrols the room when idle.
 * Can assist neighboring rooms when requested by defense coordinator.
 */
export function guard(ctx: CreepContext): CreepAction {
  const mem = ctx.creep.memory as unknown as SwarmCreepMemory;

  // Check if should retreat based on threat assessment
  if (checkAndExecuteRetreat(ctx.creep)) {
    return { type: "idle" }; // Retreat logic handles movement
  }

  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // Check if assigned to assist another room
  const guardAssistTarget = tryAcquireDefenseAssistAssignment(ctx, mem) ?? getDefenseAssistTargetRoom(mem);
  if (guardAssistTarget && !hasHomeRoomDefenseThreat(ctx)) {
    const stagingAction = getDefenseAssistSquadStagingAction(ctx, mem);
    if (stagingAction) return stagingAction;

    // Move to assist room if not there yet
    if (ctx.creep.room.name !== guardAssistTarget) {
      return { type: "moveToRoom", roomName: guardAssistTarget };
    }

    const hostileStructure = findAssistHostileStructure(ctx);

    // In assist room - check if threat is resolved using pre-computed hostiles from context
    if (ctx.hostiles.length === 0 && !hostileStructure) {
      // Threat resolved, clear assignment and return home
      clearDefenseAssistAssignment(mem);
      if (ctx.creep.room.name !== ctx.homeRoom) {
        return { type: "moveToRoom", roomName: ctx.homeRoom };
      }
    } else {
      // Engage hostiles using same logic as home defense
      const assistTarget = findPriorityTarget(ctx);
      if (assistTarget) {
        const range = ctx.creep.pos.getRangeTo(assistTarget);
        const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
        const hasMelee = hasBodyPart(ctx.creep, ATTACK);

        if (hasRanged && range <= 3) return { type: "rangedAttack", target: assistTarget };
        if (hasMelee && range <= 1) return { type: "attack", target: assistTarget };
        return { type: "moveTo", target: assistTarget };
      }

      if (hostileStructure) {
        const range = ctx.creep.pos.getRangeTo(hostileStructure);
        const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
        const hasMelee = hasBodyPart(ctx.creep, ATTACK);

        if (hasRanged && range <= 3) return { type: "rangedAttack", target: hostileStructure };
        if (hasMelee && range <= 1) return { type: "attack", target: hostileStructure };
        return { type: "moveTo", target: hostileStructure };
      }
    }
  }

  // Return to home room if not there (and not on assist mission)
  if (ctx.creep.room.name !== ctx.homeRoom) {
    return { type: "moveToRoom", roomName: ctx.homeRoom };
  }

  // Normal home defense behavior - engage hostiles in home room
  const target = findPriorityTarget(ctx);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
    const hasMelee = hasBodyPart(ctx.creep, ATTACK);

    if (hasRanged && range <= 3) return { type: "rangedAttack", target };
    if (hasMelee && range <= 1) return { type: "attack", target };
    return { type: "moveTo", target };
  }

  // No hostiles - patrol the room
  const waypoints = getPatrolWaypoints(ctx.room);
  const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);

  if (nextWaypoint) {
    return { type: "moveTo", target: nextWaypoint };
  }

  // Fallback: move near spawn if no waypoints available
  const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
  if (spawn && ctx.creep.pos.getRangeTo(spawn) > 5) {
    return { type: "moveTo", target: spawn };
  }

  return { type: "idle" };
}

/**
 * Remote Guard - Defends remote mining operations.
 * Patrols assigned remote room and engages hostile threats.
 * Returns to home room when remote is secure.
 */
export function remoteGuard(ctx: CreepContext): CreepAction {
  const mem = ctx.creep.memory as unknown as SwarmCreepMemory & { targetRoom?: string };

  // Must have target room assigned
  if (!mem.targetRoom) {
    // No target room - return to home
    if (ctx.creep.room.name !== ctx.homeRoom) {
      return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "guard" };
    }
    // In home room with no assignment - patrol for home defense
    const waypoints = getPatrolWaypoints(ctx.room);
    const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);
    if (nextWaypoint) {
      return { type: "moveTo", target: nextWaypoint };
    }
    return { type: "idle" };
  }

  // Move to target room if not there
  if (ctx.creep.room.name !== mem.targetRoom) {
    return { type: "remoteMoveToRoom", roomName: mem.targetRoom, routeType: "guard" };
  }

  // In target room - check for hostiles
  const hostiles = getActualHostileCreeps(ctx.room);
  
  // Filter to dangerous hostiles (with combat parts)
  const dangerousHostiles = hostiles.filter(h =>
    h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
  );

  if (dangerousHostiles.length === 0) {
    // Remote is secure - return to home room
    if (ctx.creep.room.name !== ctx.homeRoom) {
      return { type: "remoteMoveToRoom", roomName: ctx.homeRoom, routeType: "guard" };
    }
    // In home room - patrol for home defense
    const waypoints = getPatrolWaypoints(ctx.room);
    const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);
    if (nextWaypoint) {
      return { type: "moveTo", target: nextWaypoint };
    }
    return { type: "idle" };
  }

  // Find priority target among dangerous hostiles
  const target = findPriorityTargetFromList(ctx, dangerousHostiles);

  if (target) {
    const range = ctx.creep.pos.getRangeTo(target);
    const hasRanged = hasBodyPart(ctx.creep, RANGED_ATTACK);
    const hasMelee = hasBodyPart(ctx.creep, ATTACK);

    if (hasRanged && range <= 3) return { type: "rangedAttack", target };
    if (hasMelee && range <= 1) return { type: "attack", target };
    return { type: "moveTo", target };
  }

  // Patrol remote room if no immediate threats
  const sources = ctx.room.find(FIND_SOURCES);
  if (sources.length > 0) {
    // Move between sources
    const closestSource = ctx.creep.pos.findClosestByRange(sources);
    if (closestSource && ctx.creep.pos.getRangeTo(closestSource) > 3) {
      return { type: "moveTo", target: closestSource };
    }
  }

  return { type: "idle" };
}

/**
 * Find priority target from a specific list of hostiles
 */
function findPriorityTargetFromList(ctx: CreepContext, hostiles: Creep[]): Creep | null {
  if (hostiles.length === 0) return null;

  // Priority: Boosted > Healers > Ranged > Melee > Others
  const priorities = [
    hostiles.filter(h => h.body.some(p => p.boost)),
    hostiles.filter(h => hasBodyPart(h, HEAL)),
    hostiles.filter(h => hasBodyPart(h, RANGED_ATTACK)),
    hostiles.filter(h => hasBodyPart(h, ATTACK)),
    hostiles
  ];

  for (const group of priorities) {
    if (group.length > 0) {
      // Return closest from this priority group
      return ctx.creep.pos.findClosestByRange(group);
    }
  }

  return null;
}

/**
 * Healer - Support creep that heals allies.
 * Priority: self-heal if critical → heal nearby allies → follow military creeps
 * Can assist neighboring rooms when requested.
 */
export function healer(ctx: CreepContext): CreepAction {
  const mem = ctx.creep.memory as unknown as SwarmCreepMemory;

  // Always heal self if critically damaged
  if (ctx.creep.hits < ctx.creep.hitsMax * 0.5) {
    return { type: "heal", target: ctx.creep };
  }

  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // Check if assigned to assist another room
  const healerAssistTarget = tryAcquireDefenseAssistAssignment(ctx, mem) ?? getDefenseAssistTargetRoom(mem);
  if (healerAssistTarget && !hasHomeRoomDefenseThreat(ctx)) {
    const stagingAction = getDefenseAssistSquadStagingAction(ctx, mem);
    if (stagingAction) return stagingAction;

    const assistRoom = Game.rooms[healerAssistTarget];
    if (assistRoom) {
      const hostiles = getActualHostileCreeps(assistRoom);
      if (hostiles.length === 0) {
        // Threat resolved, clear assignment
        clearDefenseAssistAssignment(mem);
        return { type: "idle" };
      }

      // Move to assist room if not there yet
      if (ctx.creep.room.name !== healerAssistTarget) {
        return { type: "moveToRoom", roomName: healerAssistTarget };
      }
    } else {
      // Can't see assist room - move towards it
      return { type: "moveToRoom", roomName: healerAssistTarget };
    }
  }

  // Check if assigned to power bank operation
  if (mem.targetRoom && mem.task !== DEFENSE_ASSIST_TASK && !mem.assistTarget) {
    // Move to target room (power bank location)
    if (ctx.room.name !== mem.targetRoom) {
      return { type: "moveToRoom", roomName: mem.targetRoom };
    }

    // In target room - heal power harvesters
    const powerHarvesters = ctx.room.find(FIND_MY_CREEPS, {
      filter: c => {
        const m = c.memory as unknown as SwarmCreepMemory;
        return m.role === "powerHarvester" && m.targetRoom === mem.targetRoom;
      }
    });

    // Find most damaged power harvester
    if (powerHarvesters.length > 0) {
      powerHarvesters.sort((a, b) => {
        const ratioA = a.hitsMax > 0 ? a.hits / a.hitsMax : 1;
        const ratioB = b.hitsMax > 0 ? b.hits / b.hitsMax : 1;
        return ratioA - ratioB;
      });
      const target = powerHarvesters[0]!;
      const range = ctx.creep.pos.getRangeTo(target);

      // Follow and heal the most damaged harvester
      if (range > 3) {
        return { type: "moveTo", target };
      } else if (range <= 1) {
        return { type: "heal", target };
      } else {
        return { type: "rangedHeal", target };
      }
    }

    // Check if power bank is destroyed
    const powerBank = ctx.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_POWER_BANK
    })[0];

    if (!powerBank && powerHarvesters.length === 0) {
      // Power bank destroyed and no harvesters - return home
      delete mem.targetRoom;
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }

    // Stay near power bank if it exists
    if (powerBank) {
      if (ctx.creep.pos.getRangeTo(powerBank) > 3) {
        return { type: "moveTo", target: powerBank };
      }
    }
  }

  // Heal nearby damaged allies
  const damagedNearby = ctx.creep.pos.findInRange(FIND_MY_CREEPS, 3, {
    filter: c => c.hits < c.hitsMax
  });

  if (damagedNearby.length > 0) {
    damagedNearby.sort((a, b) => {
      const ratioA = a.hitsMax > 0 ? a.hits / a.hitsMax : 1;
      const ratioB = b.hitsMax > 0 ? b.hits / b.hitsMax : 1;
      return ratioA - ratioB;
    });
    const target = damagedNearby[0]!;
    const range = ctx.creep.pos.getRangeTo(target);

    if (range <= 1) return { type: "heal", target };
    return { type: "rangedHeal", target };
  }

  const woundedCombatAlly = findWoundedCombatAlly(ctx, healerAssistTarget);
  if (woundedCombatAlly) return { type: "moveTo", target: woundedCombatAlly };

  // Follow military creeps (cache for 5 ticks)
  const militaryCreeps = ctx.room.find(FIND_MY_CREEPS, {
    filter: c => {
      const m = c.memory as unknown as SwarmCreepMemory;
      return m.family === "military" && m.role !== "healer";
    }
  });

  if (militaryCreeps.length > 0) {
    const military = findCachedClosest(ctx.creep, militaryCreeps, "healer_follow", 5);
    if (military) return { type: "moveTo", target: military };
  }

  // No military to follow - patrol the room
  const waypoints = getPatrolWaypoints(ctx.room);
  const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);

  if (nextWaypoint) {
    return { type: "moveTo", target: nextWaypoint };
  }

  return { type: "idle" };
}

/**
 * Soldier - Offensive combat creep.
 * Attacks hostiles and hostile structures.
 * 
 * ENHANCEMENT: Added threat assessment and retreat logic.
 * Soldiers will retreat if critically damaged to preserve expensive units.
 */
export function soldier(ctx: CreepContext): CreepAction {
  // Check for squad assignment
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // TACTICAL RETREAT: If critically damaged (below 30% HP), retreat to home room
  // This is especially important for boosted creeps which are expensive to replace
  const hpPercent = ctx.creep.hits / ctx.creep.hitsMax;
  if (hpPercent < 0.3) {
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }
    // In home room, move near spawn for healing
    const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
    if (spawns.length > 0 && ctx.creep.pos.getRangeTo(spawns[0]) > 3) {
      return { type: "moveTo", target: spawns[0] };
    }
    return { type: "idle" };
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

  const hostileStructure = ctx.creep.pos.findClosestByRange(
    getActualHostileStructures(ctx.room).filter(s => s.structureType !== STRUCTURE_CONTROLLER)
  );
  if (hostileStructure) return { type: "attack", target: hostileStructure };

  // No targets - patrol the room
  const waypoints = getPatrolWaypoints(ctx.room);
  const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);

  if (nextWaypoint) {
    return { type: "moveTo", target: nextWaypoint };
  }

  // Fallback: move near spawn if no waypoints available (cache 20 ticks - spawns don't move)
  const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
  if (spawns.length > 0) {
    const spawn = findCachedClosest(ctx.creep, spawns, "soldier_spawn", 20);
    if (spawn && ctx.creep.pos.getRangeTo(spawn) > 5) {
      return { type: "moveTo", target: spawn };
    }
  }

  return { type: "idle" };
}

/**
 * Siege - Dismantler creep for breaking defenses.
 * Priority: spawns → towers → walls/ramparts → other structures
 * 
 * ENHANCEMENT: Added threat assessment and retreat logic.
 * Siege units will retreat if critically damaged to preserve expensive boosted units.
 */
export function siege(ctx: CreepContext): CreepAction {
  // Check for squad assignment
  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // TACTICAL RETREAT: If critically damaged (below 30% HP), retreat to home room
  // Siege units are expensive, especially when boosted with WORK boosts
  const hpPercent = ctx.creep.hits / ctx.creep.hitsMax;
  if (hpPercent < 0.3) {
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }
    // In home room, move near spawn for healing
    const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
    if (spawns.length > 0 && ctx.creep.pos.getRangeTo(spawns[0]) > 3) {
      return { type: "moveTo", target: spawns[0] };
    }
    return { type: "idle" };
  }

  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  const hostileStructures = getActualHostileStructures(ctx.room);
  const spawn = ctx.creep.pos.findClosestByRange(
    hostileStructures.filter((s): s is StructureSpawn => s.structureType === STRUCTURE_SPAWN)
  );
  if (spawn) return { type: "dismantle", target: spawn };

  const tower = ctx.creep.pos.findClosestByRange(
    hostileStructures.filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER)
  );
  if (tower) return { type: "dismantle", target: tower };

  // OPTIMIZATION: Use room.find() once and filter, then cache the result
  // Walls/ramparts don't change often, cache for 10 ticks
  // IMPORTANT: Only target enemy walls/ramparts, not our own
  // Walls are neutral structures, ramparts have ownership
  const walls = [
    ...ctx.room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_WALL &&
        s.hits < 100000 &&
        !ctx.room.controller?.my &&
        !isAllyControlledRoom(ctx.room)
    }),
    ...hostileStructures.filter(
      (s): s is StructureRampart =>
        s.structureType === STRUCTURE_RAMPART &&
        s.hits < 100000
    )
  ];
  if (walls.length > 0) {
    const wall = findCachedClosest(ctx.creep, walls, "siege_wall", 10);
    if (wall) return { type: "dismantle", target: wall };
  }

  const structure = ctx.creep.pos.findClosestByRange(
    hostileStructures.filter(s => s.structureType !== STRUCTURE_CONTROLLER)
  );
  if (structure) return { type: "dismantle", target: structure };

  // No targets - move to collection point to avoid blocking spawns
  const collectionAction = moveToCollectionPoint(ctx, "siegeUnit");
  if (collectionAction) return collectionAction;

  // Fallback: patrol the room if at collection point or no collection point available
  const waypoints = getPatrolWaypoints(ctx.room);
  const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);

  if (nextWaypoint) {
    return { type: "moveTo", target: nextWaypoint };
  }

  return { type: "idle" };
}

/**
 * Harasser - Hit-and-run attacker targeting workers.
 * Flees from dangerous combat creeps.
 * 
 * ENHANCEMENT: Improved threat assessment with HP-based retreat logic.
 * Harassers are fast, cheap units designed for hit-and-run tactics.
 */
export function harasser(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom;

  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // TACTICAL RETREAT: If critically damaged (below 40% HP), return home
  // Harassers should retreat earlier than heavy units since they're meant for hit-and-run
  const hpPercent = ctx.creep.hits / ctx.creep.hitsMax;
  if (hpPercent < 0.4) {
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }
    // In home room, move near spawn
    const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
    if (spawns.length > 0 && ctx.creep.pos.getRangeTo(spawns[0]) > 3) {
      return { type: "moveTo", target: spawns[0] };
    }
    return { type: "idle" };
  }

  if (!targetRoom) {
    // No target room assigned - move to collection point to avoid blocking spawns
    const collectionAction = moveToCollectionPoint(ctx, "harasser (no target)");
    if (collectionAction) return collectionAction;
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Check for dangerous hostiles nearby - flee if present
  const dangerous = ctx.hostiles.filter(h =>
    ctx.creep.pos.getRangeTo(h) < 5 &&
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

  // No targets found in assigned target room
  // Return to home room to avoid wasting CPU searching an empty room
  // Harasser will wait at collection point until new target is assigned
  if (ctx.room.name !== ctx.homeRoom) {
    return { type: "moveToRoom", roomName: ctx.homeRoom };
  }

  // In home room with no work - move to collection point or patrol
  const collectionAction = moveToCollectionPoint(ctx, "harasser (no targets)");
  if (collectionAction) return collectionAction;

  // If at collection point or no collection point available, patrol the room
  const waypoints = getPatrolWaypoints(ctx.room);
  const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);

  if (nextWaypoint) {
    return { type: "moveTo", target: nextWaypoint };
  }

  return { type: "idle" };
}

/**
 * Ranger - Ranged kiting creep.
 * Maintains distance of 3 tiles while attacking.
 * 
 * ENHANCEMENT: Added threat assessment and retreat logic.
 * Rangers will retreat if critically damaged to preserve expensive units.
 */
export function ranger(ctx: CreepContext): CreepAction {
  const mem = ctx.creep.memory as unknown as SwarmCreepMemory;

  // Check if should retreat based on threat assessment
  if (checkAndExecuteRetreat(ctx.creep)) {
    return { type: "idle" }; // Retreat logic handles movement
  }

  if (ctx.memory.squadId) {
    const squad = getSquadMemory(ctx.memory.squadId);
    if (squad) return squadBehavior(ctx, squad);
  }

  // TACTICAL RETREAT: If critically damaged (below 30% HP), retreat to home room
  // Rangers are valuable ranged attackers, often boosted for maximum effectiveness
  const hpPercent = ctx.creep.hits / ctx.creep.hitsMax;
  if (hpPercent < 0.3) {
    // Clear assist target when retreating
    if (getDefenseAssistTargetRoom(mem)) {
      clearDefenseAssistAssignment(mem);
    }
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }
    // In home room, move near spawn for healing
    const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
    if (spawns.length > 0 && ctx.creep.pos.getRangeTo(spawns[0]) > 3) {
      return { type: "moveTo", target: spawns[0] };
    }
    return { type: "idle" };
  }

  // Check if assigned to assist another room
  const rangerAssistTarget = tryAcquireDefenseAssistAssignment(ctx, mem) ?? getDefenseAssistTargetRoom(mem);
  if (rangerAssistTarget && !hasHomeRoomDefenseThreat(ctx)) {
    const stagingAction = getDefenseAssistSquadStagingAction(ctx, mem);
    if (stagingAction) return stagingAction;

    const assistRoom = Game.rooms[rangerAssistTarget];
    if (assistRoom) {
      const hostiles = getActualHostileCreeps(assistRoom);
      const hostileStructures = getActualHostileStructures(assistRoom).filter(s => s.structureType !== STRUCTURE_CONTROLLER);
      if (hostiles.length === 0 && hostileStructures.length === 0) {
        // Threat resolved, clear assignment
        clearDefenseAssistAssignment(mem);
        return { type: "idle" };
      }

      // Move to assist room if not there yet
      if (ctx.creep.room.name !== rangerAssistTarget) {
        return { type: "moveToRoom", roomName: rangerAssistTarget };
      }

      // In assist room - engage hostiles
      const assistTarget = findPriorityTarget(ctx);
      if (assistTarget) {
        const range = ctx.creep.pos.getRangeTo(assistTarget);
        if (range < 3) return { type: "flee", from: [assistTarget.pos] };
        if (range <= 3) return { type: "rangedAttack", target: assistTarget };
        return { type: "moveTo", target: assistTarget };
      }

      const hostileStructure = ctx.creep.pos.findClosestByRange(hostileStructures) ?? hostileStructures[0];
      if (hostileStructure) {
        const range = ctx.creep.pos.getRangeTo(hostileStructure);
        if (range <= 3) return { type: "rangedAttack", target: hostileStructure };
        return { type: "moveTo", target: hostileStructure };
      }
    } else {
      // Can't see assist room - move towards it
      return { type: "moveToRoom", roomName: rangerAssistTarget };
    }
  }

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

  // No targets - patrol the room
  const waypoints = getPatrolWaypoints(ctx.room);
  const nextWaypoint = getNextPatrolWaypoint(ctx.creep, waypoints);

  if (nextWaypoint) {
    return { type: "moveTo", target: nextWaypoint };
  }

  // Fallback: return home if no waypoints available (cache 20 ticks - spawns don't move)
  const spawns = ctx.spawnStructures.filter(s => s.structureType === STRUCTURE_SPAWN);
  if (spawns.length > 0) {
    const spawn = findCachedClosest(ctx.creep, spawns, "harasser_home_spawn", 20);
    if (spawn && ctx.creep.pos.getRangeTo(spawn) > 10) {
      return { type: "moveTo", target: spawn };
    }
  }

  return { type: "idle" };
}

// =============================================================================
// Squad Behavior
// =============================================================================

/**
 * Execute squad-coordinated behavior.
 * 
 * ENHANCEMENT: Improved squad coordination with formation awareness.
 * Squad members stay together and coordinate movements.
 */
function squadBehavior(ctx: CreepContext, squad: SquadMemory): CreepAction {
  if (!squad.members.includes(ctx.creep.name)) {
    squad.members.push(ctx.creep.name);
  }

  switch (squad.state) {
    case "gathering": {
      if (ctx.room.name !== squad.rallyRoom) return { type: "moveToRoom", roomName: squad.rallyRoom };
      const rallyPos = getSquadRallyPosition(squad);
      if (ctx.creep.pos.getRangeTo(rallyPos) > 3) return { type: "moveTo", target: rallyPos };
      if (!canLocalSquadDepart(squad)) return { type: "wait", position: rallyPos };
      return { type: "idle" };
    }

    case "moving": {
      const targetRoom = squad.targetRooms[0];
      if (!targetRoom) return { type: "idle" };
      if (ctx.room.name !== targetRoom) {
        if (shouldWaitForCohesion(ctx, squad)) return { type: "wait", position: ctx.creep.pos };
        return { type: "moveToRoom", roomName: targetRoom };
      }
      const formationPos = getSiegeFormationPosition(ctx, squad);
      if (formationPos && ctx.creep.pos.getRangeTo(formationPos) > 0) return { type: "moveTo", target: formationPos };
      return { type: "idle" };
    }

    case "attacking": {
      const hpPercent = ctx.creep.hits / ctx.creep.hitsMax;
      const retreatThreshold = squad.retreatThreshold ?? 0.3;
      if (hpPercent < retreatThreshold && ctx.room.name !== squad.rallyRoom) return { type: "moveToRoom", roomName: squad.rallyRoom };

      const role = ctx.memory.role;
      if (role === "healer") {
        const wounded = getSquadMembers(squad)
          .filter(creep => creep.hits < creep.hitsMax)
          .sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax)[0];
        if (wounded) {
          const range = ctx.creep.pos.getRangeTo(wounded);
          if (range <= 1) return { type: "heal", target: wounded };
          if (range <= 3) return { type: "rangedHeal", target: wounded };
          return { type: "moveTo", target: wounded };
        }
        const attacker = getPrimarySquadAttacker(squad);
        if (attacker && ctx.creep.pos.getRangeTo(attacker) > 2) return { type: "moveTo", target: attacker };
        return { type: "idle" };
      }

      const target = findPriorityTarget(ctx);
      if (target) {
        const range = ctx.creep.pos.getRangeTo(target);
        if (role === "ranger") {
          if (range < 3) return { type: "flee", from: [target.pos] };
          if (range <= 3) return { type: "rangedAttack", target };
          return { type: "moveTo", target };
        }
        if (hasBodyPart(ctx.creep, RANGED_ATTACK) && range <= 3) return { type: "rangedAttack", target };
        if (hasBodyPart(ctx.creep, ATTACK) && range <= 1) return { type: "attack", target };
        return { type: "moveTo", target };
      }

      const hostileStructures = getActualHostileStructures(ctx.room).filter(s => s.structureType !== STRUCTURE_CONTROLLER);
      const priorityStructure = ctx.creep.pos.findClosestByRange(
        hostileStructures.filter(s => s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_SPAWN)
      ) ?? ctx.creep.pos.findClosestByRange(hostileStructures);
      if (priorityStructure) {
        const range = ctx.creep.pos.getRangeTo(priorityStructure);
        if (role === "siegeUnit" && range <= 1) return { type: "dismantle", target: priorityStructure };
        if (hasBodyPart(ctx.creep, RANGED_ATTACK) && range <= 3) return { type: "rangedAttack", target: priorityStructure };
        if (hasBodyPart(ctx.creep, ATTACK) && range <= 1) return { type: "attack", target: priorityStructure };
        return { type: "moveTo", target: priorityStructure };
      }

      return { type: "idle" };
    }

    case "retreating":
      if (ctx.room.name !== squad.rallyRoom) return { type: "moveToRoom", roomName: squad.rallyRoom };
      return { type: "moveTo", target: getSquadRallyPosition(squad) };

    case "dissolving":
      if (ctx.room.name !== ctx.homeRoom) return { type: "moveToRoom", roomName: ctx.homeRoom };
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
  remoteGuard,
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
  const assignedAction = taskBoard.getAssignedAction(ctx);
  if (assignedAction) return assignedAction;

  const behavior = militaryBehaviors[ctx.memory.role] ?? guard;
  return behavior(ctx);
}

// =============================================================================
// Cache Management
// =============================================================================

/**
 * Clear military behavior caches.
 * Called by context.ts at the start of each tick.
 * 
 * OPTIMIZATION: We no longer clear patrol waypoint cache every tick.
 * It's cached long-term and invalidated based on spawn count changes.
 * 
 * Note: This function is kept as a no-op placeholder for future military
 * caches that may need per-tick clearing. The registration is maintained
 * for consistency with the context system architecture.
 */
function clearMilitaryCaches(): void {
  // Patrol waypoint cache is now persistent across ticks
  // Future per-tick caches can be cleared here if needed
}

// Register with context system for architectural consistency
registerMilitaryCacheClear(clearMilitaryCaches);
