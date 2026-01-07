/**
 * Dynamic Defender Spawning
 *
 * Automatically spawns defenders based on threat assessment:
 * - Analyzes hostile creeps in room
 * - Calculates required defender count
 * - Prioritizes defender spawning during attacks
 * - Scales defender strength based on enemy composition
 *
 * Addresses Issue: #22
 */

import type { SwarmState } from "../memory/schemas";
import { logger } from "@ralphschuler/screeps-core";

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

  // Baseline defense force - always maintain minimum guards for readiness
  // This ensures we're prepared when invaders arrive
  const rcl = room.controller?.level ?? 1;
  if (rcl >= 3) {
    // RCL 3+ rooms should maintain a standing defense force
    result.guards = 1;
    result.rangers = 1;
    result.reasons.push(`Baseline defense force for RCL ${rcl}`);
  }

  // Find all hostile creeps
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length === 0) {
    return result; // Return baseline requirements if no active threats
  }

  // Analyze hostile composition
  let meleeCount = 0;
  let rangedCount = 0;
  let healerCount = 0;
  let dismantlerCount = 0;
  let boostedCount = 0;

  for (const hostile of hostiles) {
    const body = hostile.body;
    
    // Check for boosted parts
    const isBoosted = body.some(part => part.boost !== undefined);
    if (isBoosted) boostedCount++;

    // Count part types
    for (const part of body) {
      if (part.type === ATTACK) meleeCount++;
      if (part.type === RANGED_ATTACK) rangedCount++;
      if (part.type === HEAL) healerCount++;
      if (part.type === WORK) dismantlerCount++;
    }
  }

  // Calculate defender requirements

  // Guards for melee attackers (1:1 ratio, min 1 if any melee)
  if (meleeCount > 0) {
    result.guards = Math.max(1, Math.ceil(meleeCount / 4));
    result.reasons.push(`${meleeCount} melee parts detected`);
  }

  // Rangers for ranged attackers (1:1.5 ratio)
  if (rangedCount > 0) {
    result.rangers = Math.max(1, Math.ceil(rangedCount / 6));
    result.reasons.push(`${rangedCount} ranged parts detected`);
  }

  // Healers if enemies have healers (1:2 ratio)
  if (healerCount > 0) {
    result.healers = Math.max(1, Math.ceil(healerCount / 8));
    result.reasons.push(`${healerCount} heal parts detected`);
  }

  // Extra defenders for dismantlers (they're dangerous)
  if (dismantlerCount > 0) {
    result.guards += Math.ceil(dismantlerCount / 5);
    result.reasons.push(`${dismantlerCount} work parts (dismantlers)`);
  }

  // Boosted enemies require more defenders
  if (boostedCount > 0) {
    result.guards = Math.ceil(result.guards * 1.5);
    result.rangers = Math.ceil(result.rangers * 1.5);
    result.healers = Math.ceil(result.healers * 1.5);
    result.urgency = 2.0;
    result.reasons.push(`${boostedCount} boosted enemies (high threat)`);
  }

  // Minimum composition for any attack
  if (hostiles.length > 0) {
    result.guards = Math.max(result.guards, 2); // Increased from 1 - maintain at least 2 guards during attacks
    result.rangers = Math.max(result.rangers, 2); // Increased from 1 - maintain at least 2 rangers during attacks
  }

  // Large attacks require healers
  if (hostiles.length >= 3) {
    result.healers = Math.max(result.healers, 1);
  }

  // Urgency based on hostile count
  if (hostiles.length >= 5) {
    result.urgency = Math.max(result.urgency, 1.5);
    result.reasons.push(`${hostiles.length} hostiles (large attack)`);
  }

  // Check for critical structures under attack
  const damagedCritical = room.find(FIND_MY_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_STORAGE ||
        s.structureType === STRUCTURE_TERMINAL) &&
      s.hits < s.hitsMax * 0.8
  });

  if (damagedCritical.length > 0) {
    result.urgency = 3.0;
    result.reasons.push(`Critical structures under attack!`);
  }

  logger.info(
    `Defender analysis for ${room.name}: ${result.guards} guards, ${result.rangers} rangers, ${result.healers} healers (urgency: ${result.urgency}x) - ${result.reasons.join(", ")}`,
    { subsystem: "Defense" }
  );

  return result;
}

/**
 * Get current defender count in room
 */
export function getCurrentDefenders(room: Room): { guards: number; rangers: number; healers: number } {
  const creeps = room.find(FIND_MY_CREEPS);

  return {
    guards: creeps.filter(c => (c.memory as { role?: string }).role === "guard").length,
    rangers: creeps.filter(c => (c.memory as { role?: string }).role === "ranger").length,
    healers: creeps.filter(c => (c.memory as { role?: string }).role === "healer").length
  };
}

/**
 * Calculate defender spawn priority boost
 */
export function getDefenderPriorityBoost(room: Room, swarm: SwarmState, role: string): number {
  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);

  // No boost if no threats
  if (needs.guards === 0 && needs.rangers === 0 && needs.healers === 0) {
    return 0;
  }

  let boost = 0;

  // Boost priority for needed defenders
  if (role === "guard" && current.guards < needs.guards) {
    boost = 100 * needs.urgency;
  } else if (role === "ranger" && current.rangers < needs.rangers) {
    boost = 100 * needs.urgency;
  } else if (role === "healer" && current.healers < needs.healers) {
    boost = 100 * needs.urgency;
  }

  return boost;
}

/**
 * Check if emergency defender spawning is needed
 */
export function needsEmergencyDefenders(room: Room, swarm: SwarmState): boolean {
  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);

  // Emergency if we need defenders but have none
  const needsGuards = needs.guards > 0 && current.guards === 0;
  const needsRangers = needs.rangers > 0 && current.rangers === 0;

  // Emergency if urgency is critical
  const criticalUrgency = needs.urgency >= 2.0;

  return (needsGuards || needsRangers) && criticalUrgency;
}

/**
 * Check if room needs external defense assistance
 * A room needs help when:
 * - It has threats (danger >= 1) AND cannot handle them alone
 * - It cannot produce enough defenders (low energy, no spawns, or spawn queue full)
 * - The threat is urgent or the room is overwhelmed
 */
export function needsDefenseAssistance(room: Room, swarm: SwarmState): boolean {
  // No assistance needed if no threats at all
  if (swarm.danger < 1) {
    return false;
  }

  const needs = analyzeDefenderNeeds(room);
  const current = getCurrentDefenders(room);

  // Check if room lacks the defenders it needs
  const defenderDeficit = (needs.guards - current.guards) + (needs.rangers - current.rangers);
  if (defenderDeficit <= 0) {
    return false; // Room has enough defenders
  }

  // Check if room can spawn defenders
  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) {
    return true; // No spawns = definitely needs help
  }

  // Check if any spawn is available
  const availableSpawns = spawns.filter(s => !s.spawning);
  if (availableSpawns.length === 0 && defenderDeficit >= 1) {
    return true; // All spawns busy and we need defenders = needs help
  }

  // Check energy availability for spawning defenders
  const energyAvailable = room.energyAvailable;
  const minDefenderCost = 250; // Minimum cost for a basic defender
  if (energyAvailable < minDefenderCost && defenderDeficit >= 1) {
    return true; // Not enough energy and we need defenders = needs help
  }

  // Check urgency - high urgency threats need immediate help even if room can eventually spawn
  if (needs.urgency >= 2.0 && defenderDeficit >= 2) {
    return true; // Critical threat with multiple defender deficit = needs help
  }

  // Critical danger (level 3) with any defender deficit should request help
  if (swarm.danger >= 3 && defenderDeficit >= 1) {
    return true; // Critical danger always needs help
  }

  // Danger level 2 (active attack) with significant deficit or low RCL needs help
  const rcl = room.controller?.level ?? 1;
  if (swarm.danger >= 2 && (defenderDeficit >= 2 || rcl <= 3)) {
    return true; // Active attack on low RCL room or significant deficit = needs help
  }

  return false;
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
