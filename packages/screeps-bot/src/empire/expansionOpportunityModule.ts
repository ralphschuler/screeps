import type { EmpireMemory, ExpansionCandidate, RoomIntel } from "@ralphschuler/screeps-memory";
import * as ExpansionScoring from "./expansionScoring";

export interface ExpansionOpportunityConfig {
  maxExpansionDistance: number;
  minExpansionScore: number;
  maxCandidates: number;
}

export interface ExpansionClaimQueuePlan {
  claimQueue: ExpansionCandidate[];
  evaluatedCandidates: number;
  preservedActiveTargets: number;
}

function getMinDistanceToOwned(roomName: string, ownedRooms: Room[]): number {
  if (ownedRooms.length === 0) return Infinity;

  let minDistance = Infinity;
  for (const room of ownedRooms) {
    const distance = Game.map.getRoomLinearDistance(roomName, room.name);
    if (distance < minDistance) minDistance = distance;
  }
  return minDistance;
}

function canBecomeExpansionOpportunity(intel: RoomIntel): boolean {
  if (intel.owner || intel.reserver) return false;
  if (!intel.scouted) return false;
  if (intel.isHighway) return false;
  return true;
}

export function scoreExpansionOpportunity(
  intel: RoomIntel,
  ownedRooms: Room[],
  config: Pick<ExpansionOpportunityConfig, "maxExpansionDistance">
): number {
  if (!canBecomeExpansionOpportunity(intel)) return 0;

  const distance = getMinDistanceToOwned(intel.name, ownedRooms);
  if (distance > config.maxExpansionDistance) return 0;

  let score = 0;
  if (intel.sources === 2) {
    score += 40;
  } else if (intel.sources === 1) {
    score += 20;
  }

  score += ExpansionScoring.getMineralBonus(intel.mineralType);
  score -= distance * 5;
  score -= ExpansionScoring.calculateHostilePenalty(intel.name);
  score -= intel.threatLevel * 15;
  score += ExpansionScoring.getTerrainBonus(intel.terrain);

  if (ExpansionScoring.isNearHighway(intel.name)) {
    score += 10;
  }

  score += ExpansionScoring.getPortalProximityBonus(intel.name);

  if (intel.controllerLevel > 0 && !intel.owner) {
    score += intel.controllerLevel * 2;
  }

  score += ExpansionScoring.getClusterProximityBonus(intel.name, ownedRooms, distance);

  if (intel.isSK) {
    score -= 50;
  }

  return Math.max(0, score);
}

export function evaluateExpansionOpportunities(
  empire: EmpireMemory,
  ownedRooms: Room[],
  config: ExpansionOpportunityConfig
): ExpansionCandidate[] {
  const candidates: ExpansionCandidate[] = [];

  for (const roomName in empire.knownRooms) {
    const intel = empire.knownRooms[roomName];
    if (!intel) continue;

    const score = scoreExpansionOpportunity(intel, ownedRooms, config);
    if (score < config.minExpansionScore) continue;

    candidates.push({
      roomName: intel.name,
      score,
      distance: getMinDistanceToOwned(intel.name, ownedRooms),
      claimed: false,
      lastEvaluated: Game.time
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, config.maxCandidates);
}

export function planExpansionClaimQueue(
  empire: EmpireMemory,
  ownedRooms: Room[],
  config: ExpansionOpportunityConfig
): ExpansionClaimQueuePlan {
  const activeTargets = empire.claimQueue.filter(candidate => candidate.claimed);
  const activeRoomNames = new Set(activeTargets.map(candidate => candidate.roomName));
  const candidates = evaluateExpansionOpportunities(empire, ownedRooms, config).filter(
    candidate => !activeRoomNames.has(candidate.roomName)
  );

  return {
    claimQueue: [...activeTargets, ...candidates].slice(0, config.maxCandidates),
    evaluatedCandidates: candidates.length,
    preservedActiveTargets: activeTargets.length
  };
}
