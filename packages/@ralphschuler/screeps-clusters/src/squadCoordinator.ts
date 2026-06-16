/**
 * Squad Coordinator - Enhanced Squad Formation & Lifecycle
 *
 * Manages squad formation, composition, and lifecycle:
 * - Automatic squad composition based on threat assessment
 * - Squad spawning coordination across cluster rooms
 * - Squad state validation and timeout handling
 * - Member redistribution on dissolution
 *
 * Addresses Issue: #36 - Squad formation and coordination
 */

import { logger } from "@ralphschuler/screeps-core";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { ClusterMemory, DefenseAssistanceRequest, SquadDefinition } from "./types";

/**
 * Squad composition recommendation
 */
export interface SquadComposition {
  guards: number;
  rangers: number;
  healers: number;
  siegeUnits: number;
}

/**
 * Recommended squad size based on threat level
 */
const THREAT_SQUAD_SIZE: Record<number, SquadComposition> = {
  1: { guards: 1, rangers: 1, healers: 0, siegeUnits: 0 }, // Low threat
  2: { guards: 2, rangers: 2, healers: 1, siegeUnits: 0 }, // Medium threat
  3: { guards: 3, rangers: 3, healers: 2, siegeUnits: 1 }  // High threat
};

/**
 * Squad formation timeout in ticks (5 minutes)
 */
const SQUAD_FORMATION_TIMEOUT = 300;
const SQUAD_PARTIAL_QUORUM_RATIO = 0.6;

function compositionToRoleMap(composition: SquadComposition): Record<string, number> {
  const roles: Record<string, number> = {};
  if (composition.guards > 0) roles.guard = composition.guards;
  if (composition.rangers > 0) roles.ranger = composition.rangers;
  if (composition.healers > 0) roles.healer = composition.healers;
  if (composition.siegeUnits > 0) roles.siegeUnit = composition.siegeUnits;
  return roles;
}

function syncSquadMembers(squad: SquadDefinition): void {
  const known = new Set(squad.members.filter(name => Boolean(Game.creeps[name])));
  for (const creep of Object.values(Game.creeps)) {
    if ((creep.memory as { squadId?: string }).squadId === squad.id) {
      known.add(creep.name);
    }
  }
  squad.members = [...known];
}

function countMembersByRole(squad: SquadDefinition): Record<string, number> {
  syncSquadMembers(squad);
  const counts: Record<string, number> = {};
  for (const name of squad.members) {
    const creep = Game.creeps[name];
    if (!creep || creep.spawning) continue;
    const role = (creep.memory as { role?: string }).role;
    if (!role) continue;
    counts[role] = (counts[role] ?? 0) + 1;
  }
  return counts;
}

export function getSquadTargetSize(squad: SquadDefinition): number {
  const composition = squad.targetComposition ?? {};
  const total = (Object.values(composition) as number[]).reduce((sum, count) => sum + (count ?? 0), 0);
  return total > 0 ? total : squad.members.length;
}

export function isSquadFullyFormed(squad: SquadDefinition): boolean {
  syncSquadMembers(squad);
  const composition = squad.targetComposition ?? {};
  const roleCounts = countMembersByRole(squad);
  return Object.entries(composition).every(([role, needed]) => (roleCounts[role] ?? 0) >= (needed ?? 0));
}

export function hasSafePartialQuorum(squad: SquadDefinition): boolean {
  syncSquadMembers(squad);
  const targetSize = getSquadTargetSize(squad);
  const liveMembers = squad.members.filter(name => {
    const creep = Game.creeps[name];
    return creep && !creep.spawning;
  });
  if (targetSize <= 0 || liveMembers.length < Math.max(2, Math.ceil(targetSize * SQUAD_PARTIAL_QUORUM_RATIO))) return false;

  const roleCounts = countMembersByRole(squad);
  const combatCount = (roleCounts.guard ?? 0) + (roleCounts.soldier ?? 0) + (roleCounts.ranger ?? 0) + (roleCounts.harasser ?? 0) + (roleCounts.siegeUnit ?? 0);
  if (combatCount === 0) return false;

  const expectedHealers = squad.targetComposition?.healer ?? 0;
  if (expectedHealers > 0 && (roleCounts.healer ?? 0) === 0) return false;

  if (squad.type === "siege" && (roleCounts.siegeUnit ?? 0) === 0) return false;

  return true;
}

export function canSquadDepart(squad: SquadDefinition): boolean {
  if (isSquadFullyFormed(squad)) return true;
  return Boolean(squad.stagingTimeoutAt && Game.time >= squad.stagingTimeoutAt && hasSafePartialQuorum(squad));
}

/**
 * Calculate optimal squad composition for a defense request
 */
export function calculateSquadComposition(request: DefenseAssistanceRequest): SquadComposition {
  // Use urgency as threat level indicator (1-3)
  const threatLevel = Math.min(3, Math.max(1, request.urgency));
  const baseComposition = THREAT_SQUAD_SIZE[threatLevel] ?? THREAT_SQUAD_SIZE[2];

  // Adjust based on specific request needs
  return {
    guards: Math.max(baseComposition.guards, request.guardsNeeded),
    rangers: Math.max(baseComposition.rangers, request.rangersNeeded),
    healers: Math.max(baseComposition.healers, request.healersNeeded),
    siegeUnits: baseComposition.siegeUnits
  };
}

/**
 * Calculate optimal squad composition for an offensive operation
 */
export function calculateOffensiveSquadComposition(
  targetRoom: string,
  intel?: { towerCount?: number; spawnCount?: number }
): SquadComposition {
  // Base composition for offense
  const composition: SquadComposition = {
    guards: 2,
    rangers: 3,
    healers: 2,
    siegeUnits: 1
  };

  // Scale up based on target defenses
  if (intel) {
    const towers = intel.towerCount ?? 0;
    const spawns = intel.spawnCount ?? 0;

    // More healers for heavy tower rooms
    if (towers >= 3) {
      composition.healers += 1;
    }

    // More siege units for fortified rooms
    if (towers >= 2 && spawns >= 2) {
      composition.siegeUnits += 1;
    }

    // More guards for larger bases
    if (spawns >= 2) {
      composition.guards += 1;
    }
  }

  return composition;
}

/**
 * Find the best rally room for a squad targeting a specific room
 */
export function selectRallyRoom(
  cluster: ClusterMemory,
  targetRoom: string
): string {
  let bestRoom = cluster.coreRoom;
  let minDistance = Infinity;

  // Find the closest member room to the target
  for (const roomName of cluster.memberRooms) {
    const distance = Game.map.getRoomLinearDistance(roomName, targetRoom);
    if (distance < minDistance) {
      minDistance = distance;
      bestRoom = roomName;
    }
  }

  return bestRoom;
}

/**
 * Create a new squad for a defense request
 */
export function createDefenseSquad(
  cluster: ClusterMemory,
  request: DefenseAssistanceRequest
): SquadDefinition {
  const composition = calculateSquadComposition(request);
  const squadId = `defense_${request.roomName}_${Game.time}`;
  const rallyRoom = selectRallyRoom(cluster, request.roomName);

  const squad: SquadDefinition = {
    id: squadId,
    type: "defense",
    members: [],
    targetComposition: compositionToRoleMap(composition),
    rallyRoom,
    targetRooms: [request.roomName],
    state: "gathering",
    createdAt: Game.time,
    stagingTimeoutAt: Game.time + SQUAD_FORMATION_TIMEOUT
  };

  logger.info(
    `Created defense squad ${squadId} for ${request.roomName}: ` +
    `${composition.guards}G/${composition.rangers}R/${composition.healers}H rally at ${rallyRoom}`,
    { subsystem: "Squad" }
  );

  return squad;
}

/**
 * Create a new squad for an offensive operation
 */
export function createOffensiveSquad(
  cluster: ClusterMemory,
  targetRoom: string,
  type: "harass" | "raid" | "siege",
  intel?: { towerCount?: number; spawnCount?: number }
): SquadDefinition {
  const composition = calculateOffensiveSquadComposition(targetRoom, intel);
  const squadId = `${type}_${targetRoom}_${Game.time}`;
  const rallyRoom = selectRallyRoom(cluster, targetRoom);

  // Set retreat threshold based on squad type
  let retreatThreshold = 0.3; // Default
  if (type === "harass") {
    retreatThreshold = 0.5; // Harassers retreat earlier
  } else if (type === "raid") {
    retreatThreshold = 0.4;
  } else if (type === "siege") {
    retreatThreshold = 0.3; // Siege units more resilient
  }

  const squad: SquadDefinition = {
    id: squadId,
    type,
    members: [],
    targetComposition: compositionToRoleMap(composition),
    rallyRoom,
    targetRooms: [targetRoom],
    state: "gathering",
    createdAt: Game.time,
    stagingTimeoutAt: Game.time + SQUAD_FORMATION_TIMEOUT,
    retreatThreshold
  };

  logger.info(
    `Created ${type} squad ${squadId} for ${targetRoom}: ` +
    `${composition.guards}G/${composition.rangers}R/${composition.healers}H/${composition.siegeUnits}S rally at ${rallyRoom}`,
    { subsystem: "Squad" }
  );

  return squad;
}

/**
 * Check if a squad should be dissolved due to timeout or completion
 */
export function shouldDissolveSquad(squad: SquadDefinition): boolean {
  const age = Game.time - squad.createdAt;

  // Dissolve if in gathering state too long
  if (squad.state === "gathering" && age > SQUAD_FORMATION_TIMEOUT) {
    logger.warn(`Squad ${squad.id} timed out during formation (${age} ticks)`, {
      subsystem: "Squad"
    });
    return true;
  }

  // Dissolve if idle too long (no members or all dead)
  if (squad.members.length === 0 && age > 50) {
    logger.info(`Squad ${squad.id} has no members, dissolving`, { subsystem: "Squad" });
    return true;
  }

  // Dissolve attacking squads that have been idle in target room too long
  if (squad.state === "attacking") {
    const targetRoom = squad.targetRooms[0];
    if (targetRoom) {
      const room = Game.rooms[targetRoom];
      if (room) {
        const hostiles = getActualHostileCreeps(room);
        // If no hostiles and been attacking for a while, mission complete
        if (hostiles.length === 0 && age > 100) {
          logger.info(`Squad ${squad.id} mission complete, no more hostiles`, {
            subsystem: "Squad"
          });
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Add a creep to a squad
 */
export function addCreepToSquad(creepName: string, squadId: string): void {
  const creep = Game.creeps[creepName];
  if (!creep) return;

  const mem = creep.memory as { squadId?: string };
  mem.squadId = squadId;

  for (const cluster of Object.values((Memory as unknown as { clusters?: Record<string, ClusterMemory> }).clusters ?? {})) {
    const squad = cluster.squads.find(candidate => candidate.id === squadId);
    if (squad && !squad.members.includes(creepName)) {
      squad.members.push(creepName);
      break;
    }
  }

  logger.debug(`Added ${creepName} to squad ${squadId}`, { subsystem: "Squad" });
}

/**
 * Remove a creep from a squad
 */
export function removeCreepFromSquad(creepName: string): void {
  const creep = Game.creeps[creepName];
  if (!creep) return;

  const mem = creep.memory as { squadId?: string };
  const squadId = mem.squadId;
  delete mem.squadId;

  if (squadId) {
    logger.debug(`Removed ${creepName} from squad ${squadId}`, { subsystem: "Squad" });
  }
}

/**
 * Validate squad state and update if needed
 */
export function validateSquadState(squad: SquadDefinition): void {
  // Remove dead members and recover live members after global reset.
  const aliveMembersBefore = squad.members.length;
  syncSquadMembers(squad);
  
  if (squad.members.length < aliveMembersBefore) {
    logger.debug(
      `Squad ${squad.id} lost ${aliveMembersBefore - squad.members.length} members`,
      { subsystem: "Squad" }
    );
  }

  // Get alive member creeps
  const members = squad.members.map(name => Game.creeps[name]).filter((c): c is Creep => !!c);
  
  if (members.length === 0) return;

  // Update state based on member positions
  const targetRoom = squad.targetRooms[0];
  if (!targetRoom) return;

  switch (squad.state) {
    case "gathering": {
      const inRally = members.every(c => c.room.name === squad.rallyRoom);
      if (inRally && canSquadDepart(squad)) {
        squad.state = "moving";
        logger.info(`Squad ${squad.id} gathered, moving to ${targetRoom}`, {
          subsystem: "Squad"
        });
      }
      break;
    }

    case "moving": {
      const inTarget = members.filter(c => c.room.name === targetRoom).length;
      if (inTarget >= Math.max(1, Math.ceil(members.length * 0.5))) {
        squad.state = "attacking";
        logger.info(`Squad ${squad.id} reached ${targetRoom}, engaging`, {
          subsystem: "Squad"
        });
      }
      break;
    }

    case "attacking": {
      // Check for heavy casualties (>50% lost)
      const age = Game.time - squad.createdAt;
      if (age > 50 && members.length < 3) {
        squad.state = "retreating";
        logger.warn(`Squad ${squad.id} retreating - heavy casualties`, {
          subsystem: "Squad"
        });
      }
      break;
    }

    case "retreating": {
      // Check if back at rally room
      const inRally = members.every(c => c.room.name === squad.rallyRoom);
      if (inRally) {
        squad.state = "dissolving";
        logger.info(`Squad ${squad.id} retreated to ${squad.rallyRoom}, dissolving`, {
          subsystem: "Squad"
        });
      }
      break;
    }
  }
}

/**
 * Get squad readiness status
 */
export function getSquadReadiness(squad: SquadDefinition): {
  ready: boolean;
  memberCount: number;
  missingRoles: string[];
} {
  const members = squad.members.map(name => Game.creeps[name]).filter((c): c is Creep => !!c);
  
  // Count roles
  const roleCount: Record<string, number> = {
    guard: 0,
    ranger: 0,
    healer: 0,
    siegeUnit: 0
  };

  for (const creep of members) {
    const role = (creep.memory as { role?: string }).role;
    if (role && role in roleCount) {
      roleCount[role as keyof typeof roleCount]++;
    }
  }

  // Determine if squad is ready (at least 50% of expected composition)
  const minRequired = squad.type === "defense" ? 2 : 3;
  const ready = members.length >= minRequired;

  // Identify missing roles
  const missingRoles: string[] = [];
  if (roleCount.ranger === 0) missingRoles.push("ranger");
  if (roleCount.healer === 0 && members.length >= 3) missingRoles.push("healer");

  return {
    ready,
    memberCount: members.length,
    missingRoles
  };
}
