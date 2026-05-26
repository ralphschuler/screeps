/**
 * Defender requirement analysis for spawn planning.
 *
 * Hostile filtering is delegated to @ralphschuler/screeps-defense so permanent
 * allies are never counted as combat threats.
 */

import { logger } from "@ralphschuler/screeps-core";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { SwarmState } from "@ralphschuler/screeps-memory";

export interface DefenderRequirement {
  guards: number;
  rangers: number;
  healers: number;
  urgency: number;
  reasons: string[];
}

export interface DefenseRequest {
  roomName: string;
  guardsNeeded: number;
  rangersNeeded: number;
  healersNeeded: number;
  urgency: number;
  createdAt: number;
  threat: string;
}

export function analyzeDefenderNeeds(room: Room): DefenderRequirement {
  const result: DefenderRequirement = { guards: 0, rangers: 0, healers: 0, urgency: 1.0, reasons: [] };

  const rcl = room.controller?.level ?? 1;
  if (rcl >= 3) {
    result.guards = 1;
    result.rangers = 1;
    result.reasons.push(`Baseline defense force for RCL ${rcl}`);
  }

  const hostiles = getActualHostileCreeps(room);
  if (hostiles.length === 0) return result;

  let meleeCount = 0;
  let rangedCount = 0;
  let healerCount = 0;
  let dismantlerCount = 0;
  let boostedCount = 0;

  for (const hostile of hostiles) {
    if (hostile.body.some(part => part.boost !== undefined)) boostedCount++;
    for (const part of hostile.body) {
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
  if (hostiles.length >= 3) result.healers = Math.max(result.healers, 1);
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

export function getCurrentDefenders(room: Room): { guards: number; rangers: number; healers: number } {
  const creeps = room.find(FIND_MY_CREEPS);
  return {
    guards: creeps.filter(c => (c.memory as { role?: string }).role === "guard").length,
    rangers: creeps.filter(c => (c.memory as { role?: string }).role === "ranger").length,
    healers: creeps.filter(c => (c.memory as { role?: string }).role === "healer").length
  };
}

export function getDefenderPriorityBoost(room: Room, _swarm: SwarmState, role: string): number {
  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);
  if (needs.guards === 0 && needs.rangers === 0 && needs.healers === 0) return 0;
  if (role === "guard" && current.guards < needs.guards) return 100 * needs.urgency;
  if (role === "ranger" && current.rangers < needs.rangers) return 100 * needs.urgency;
  if (role === "healer" && current.healers < needs.healers) return 100 * needs.urgency;
  return 0;
}

export function needsEmergencyDefenders(room: Room, swarm: SwarmState): boolean {
  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);
  const needsGuards = needs.guards > 0 && current.guards === 0;
  const needsRangers = needs.rangers > 0 && current.rangers === 0;
  return (needsGuards || needsRangers) && (needs.urgency >= 2.0 || swarm.danger >= 3);
}

export function needsDefenseAssistance(room: Room, swarm: SwarmState): boolean {
  if (swarm.danger < 2) return false;

  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);
  const defenderDeficit =
    Math.max(0, needs.guards - current.guards) +
    Math.max(0, needs.rangers - current.rangers) +
    Math.max(0, needs.healers - current.healers);

  if (defenderDeficit <= 0) return false;

  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) return true;
  const availableSpawns = spawns.filter(s => !s.spawning);
  if (availableSpawns.length === 0 && defenderDeficit >= 1) return true;
  if (room.energyAvailable < 250 && defenderDeficit >= 1) return true;
  if (needs.urgency >= 2.0 && defenderDeficit >= 2) return true;
  if (swarm.danger >= 3 && defenderDeficit >= 1) return true;

  const rcl = room.controller?.level ?? 1;
  return swarm.danger >= 2 && (defenderDeficit >= 2 || rcl <= 3);
}

export function createDefenseRequest(room: Room, swarm: SwarmState): DefenseRequest | null {
  if (!needsDefenseAssistance(room, swarm)) return null;

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
