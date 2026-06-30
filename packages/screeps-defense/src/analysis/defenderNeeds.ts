/**
 * Defender requirement analysis.
 *
 * This package owns hostile filtering and defensive need calculation so callers
 * cannot accidentally classify permanent allies as combat threats.
 */

import { logger } from "@ralphschuler/screeps-core";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { getActualHostileCreeps } from "../alliance/nonAggressionPact";

const DEFENSE_ASSIST_THREAT_PARTS = new Set<BodyPartConstant>([ATTACK, RANGED_ATTACK, WORK, HEAL, CLAIM]);

function hasVisibleDefenseThreat(room: Room): boolean {
  return getActualHostileCreeps(room).some(hostile =>
    hostile.body.some(part => part.hits > 0 && DEFENSE_ASSIST_THREAT_PARTS.has(part.type))
  );
}

function hasBootstrapDefenseGap(room: Room): boolean {
  const rcl = room.controller?.level ?? 0;
  const spawns = room.find(FIND_MY_SPAWNS);
  const hostiles = getActualHostileCreeps(room);
  return rcl <= 3 && spawns.length === 0 && hostiles.length > 0;
}

/**
 * Defender requirement analysis
 */
export interface DefenderRequirement {
  /** Number of guards needed */
  guards: number;
  /** Number of rangers needed */
  rangers: number;
  /** Number of healers needed */
  healers: number;
  /** Priority multiplier for spawning */
  urgency: number;
  /** Reasons for the requirement */
  reasons: string[];
}

/**
 * Defense assistance request
 */
export interface DefenseRequest {
  /** Room requesting assistance */
  roomName: string;
  /** Number of guards needed */
  guardsNeeded: number;
  /** Number of rangers needed */
  rangersNeeded: number;
  /** Number of healers needed */
  healersNeeded: number;
  /** Urgency level (1-3) */
  urgency: number;
  /** Game tick when request was created */
  createdAt: number;
  /** Brief description of the threat */
  threat: string;
}

/**
 * Analyze room threats and determine defender requirements
 */
export function analyzeDefenderNeeds(room: Room): DefenderRequirement {
  const result: DefenderRequirement = {
    guards: 0,
    rangers: 0,
    healers: 0,
    urgency: 1.0,
    reasons: []
  };

  const rcl = room.controller?.level ?? 1;
  const hostiles = getActualHostileCreeps(room);
  if (hostiles.length === 0) {
    return result;
  }

  const bootstrapDefenseGap = hasBootstrapDefenseGap(room);

  if (bootstrapDefenseGap) {
    result.guards = Math.max(1, result.guards);
    result.urgency = Math.max(result.urgency, 1.5);
    result.reasons.push(`Hostile present in bootstrap defense gap (RCL ${rcl})`);
  }

  let meleeCount = 0;
  let rangedCount = 0;
  let healerCount = 0;
  let dismantlerCount = 0;
  let boostedCount = 0;

  for (const hostile of hostiles) {
    const activeBody = hostile.body.filter(part => part.hits > 0);
    const isBoosted = activeBody.some(part => part.boost !== undefined);
    if (isBoosted) boostedCount++;

    for (const part of activeBody) {
      if (part.type === ATTACK) meleeCount++;
      if (part.type === RANGED_ATTACK) rangedCount++;
      if (part.type === HEAL) healerCount++;
      if (part.type === WORK) dismantlerCount++;
    }
  }

  if (meleeCount > 0) {
    result.guards = Math.max(1, Math.ceil(meleeCount / 4));
    result.reasons.push(`${meleeCount} melee parts detected`);
  }

  if (rangedCount > 0) {
    result.rangers = Math.max(1, Math.ceil(rangedCount / 6));
    result.reasons.push(`${rangedCount} ranged parts detected`);
  }

  if (healerCount > 0) {
    result.healers = Math.max(1, Math.ceil(healerCount / 8));
    result.reasons.push(`${healerCount} heal parts detected`);
  }

  if (dismantlerCount > 0) {
    result.guards += Math.ceil(dismantlerCount / 5);
    result.reasons.push(`${dismantlerCount} work parts (dismantlers)`);
  }

  if (boostedCount > 0) {
    result.guards = Math.ceil(result.guards * 1.5);
    result.rangers = Math.ceil(result.rangers * 1.5);
    result.healers = Math.ceil(result.healers * 1.5);
    result.urgency = 2.0;
    result.reasons.push(`${boostedCount} boosted enemies (high threat)`);
  }

  const needsHeavyResponse = hostiles.length >= 2 || boostedCount > 0 || healerCount > 0 || dismantlerCount > 0;
  if (needsHeavyResponse) {
    result.guards = Math.max(result.guards, 2);
    result.rangers = Math.max(result.rangers, 2);
  }

  if (hostiles.length >= 3) {
    result.healers = Math.max(result.healers, 1);
  }

  if (hostiles.length >= 5) {
    result.urgency = Math.max(result.urgency, 1.5);
    result.reasons.push(`${hostiles.length} hostiles (large attack)`);
  }

  const damagedCritical = room.find(FIND_MY_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_STORAGE ||
        s.structureType === STRUCTURE_TERMINAL) &&
      s.hits < s.hitsMax * 0.8
  });

  if (damagedCritical.length > 0) {
    result.urgency = 3.0;
    result.reasons.push("Critical structures under attack!");
  }

  logger.info(
    `Defender analysis for ${room.name}: ${result.guards} guards, ${result.rangers} rangers, ${result.healers} healers (urgency: ${result.urgency}x) - ${result.reasons.join(", ")}`,
    { subsystem: "Defense" }
  );

  return result;
}

function hasActivePart(creep: Creep, parts: BodyPartConstant[]): boolean {
  return (creep.body ?? []).some(part => part.hits > 0 && parts.includes(part.type));
}

/**
 * Get current active defender count in room.
 *
 * Spawning creeps and creeps with destroyed combat/heal parts cannot defend the
 * room yet, so they must not mask emergency deficits.
 */
export function getCurrentDefenders(room: Room): { guards: number; rangers: number; healers: number } {
  const creeps = room.find(FIND_MY_CREEPS);

  return {
    guards: creeps.filter(c =>
      !(c as { spawning?: boolean }).spawning &&
      (c.memory as { role?: string }).role === "guard" &&
      hasActivePart(c, [ATTACK, RANGED_ATTACK])
    ).length,
    rangers: creeps.filter(c =>
      !(c as { spawning?: boolean }).spawning &&
      (c.memory as { role?: string }).role === "ranger" &&
      hasActivePart(c, [RANGED_ATTACK])
    ).length,
    healers: creeps.filter(c =>
      !(c as { spawning?: boolean }).spawning &&
      (c.memory as { role?: string }).role === "healer" &&
      hasActivePart(c, [HEAL])
    ).length
  };
}

/**
 * Calculate defender spawn priority boost
 */
export function getDefenderPriorityBoost(room: Room, _swarm: SwarmState, role: string): number {
  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);

  if (needs.guards === 0 && needs.rangers === 0 && needs.healers === 0) {
    return 0;
  }

  if (role === "guard" && current.guards < needs.guards) {
    return 100 * needs.urgency;
  }

  if (role === "ranger" && current.rangers < needs.rangers) {
    return 100 * needs.urgency;
  }

  if (role === "healer" && current.healers < needs.healers) {
    return 100 * needs.urgency;
  }

  return 0;
}

/**
 * Check if emergency defender spawning is needed
 */
export function needsEmergencyDefenders(room: Room, swarm: SwarmState): boolean {
  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);

  const needsGuards = needs.guards > 0 && current.guards === 0;
  const needsRangers = needs.rangers > 0 && current.rangers === 0;
  const criticalUrgency = needs.urgency >= 2.0;

  return (needsGuards || needsRangers) && (criticalUrgency || swarm.danger >= 3);
}

/**
 * Check if room needs external defense assistance
 */
export function needsDefenseAssistance(room: Room, swarm: SwarmState): boolean {
  const visibleDefenseThreat = hasVisibleDefenseThreat(room);
  const hasBootstrapDefenseNeed = hasBootstrapDefenseGap(room);
  if (swarm.danger < 2 && !visibleDefenseThreat && !hasBootstrapDefenseNeed) {
    return false;
  }

  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);
  const defenderDeficit =
    Math.max(0, needs.guards - current.guards) +
    Math.max(0, needs.rangers - current.rangers) +
    Math.max(0, needs.healers - current.healers);

  if (defenderDeficit <= 0) {
    return false;
  }

  if (visibleDefenseThreat) {
    return true;
  }

  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) {
    return true;
  }

  const availableSpawns = spawns.filter(s => !s.spawning);
  if (availableSpawns.length === 0 && defenderDeficit >= 1) {
    return true;
  }

  if (room.energyAvailable < 250 && defenderDeficit >= 1) {
    return true;
  }

  if (needs.urgency >= 2.0 && defenderDeficit >= 2) {
    return true;
  }

  if (swarm.danger >= 3 && defenderDeficit >= 1) {
    return true;
  }

  const rcl = room.controller?.level ?? 1;
  return swarm.danger >= 2 && (defenderDeficit >= 2 || rcl <= 3);
}

/**
 * Create a defense request for a room that needs assistance
 */
export function createDefenseRequest(room: Room, swarm: SwarmState): DefenseRequest | null {
  if (!needsDefenseAssistance(room, swarm)) {
    return null;
  }

  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);

  const request: DefenseRequest = {
    roomName: room.name,
    guardsNeeded: Math.max(0, needs.guards - current.guards),
    rangersNeeded: Math.max(0, needs.rangers - current.rangers),
    healersNeeded: Math.max(0, needs.healers - current.healers),
    urgency: needs.urgency,
    createdAt: Game.time,
    threat: needs.reasons.join("; ")
  };

  logger.warn(
    `Defense assistance requested for ${room.name}: ${request.guardsNeeded} guards, ${request.rangersNeeded} rangers, ${request.healersNeeded} healers - ${request.threat}`,
    { subsystem: "Defense" }
  );

  return request;
}
