import { getActualHostileCreeps } from "@ralphschuler/screeps-core";
import type { EmpireMemory, ExpansionCandidate, RoomIntel } from "@ralphschuler/screeps-memory";
import * as ExpansionScoring from "./expansionScoring";

export interface ExpansionOpportunityConfig {
  maxExpansionDistance: number;
  minExpansionScore: number;
  maxCandidates: number;
}

export interface OwnedConstructionTargetSkip {
  roomName: string;
  reason: string;
}

export interface ExpansionClaimQueuePlan {
  claimQueue: ExpansionCandidate[];
  evaluatedCandidates: number;
  preservedActiveTargets: number;
  ownedConstructionTargets: number;
  ownedConstructionTargetRooms: string[];
  skippedOwnedConstructionTargets: OwnedConstructionTargetSkip[];
}

const OWNED_SPAWN_CONSTRUCTION_SITE_SCORE_BONUS = 100;
const UNSAFE_CONSTRUCTION_TARGET_THREAT_LEVEL = 2;
const DANGEROUS_EXPANSION_HOSTILE_PARTS = new Set<BodyPartConstant>([
  ATTACK,
  RANGED_ATTACK,
  HEAL,
  WORK,
  CLAIM
]);

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

function getOwnedSpawnConstructionSiteRoomNames(): string[] {
  const roomNames = new Set<string>();
  for (const site of Object.values(Game.constructionSites ?? {})) {
    if (site.structureType === STRUCTURE_SPAWN) {
      roomNames.add(site.pos.roomName);
    }
  }
  return [...roomNames].sort();
}

function getMyUsername(ownedRooms: Room[]): string | undefined {
  const ownedRoomController = ownedRooms.find(room => room.controller?.owner?.username)?.controller?.owner?.username;
  return ownedRoomController ?? Object.values(Game.spawns)[0]?.owner.username;
}

function hasDangerousExpansionHostile(room: Room): boolean {
  return getActualHostileCreeps(room).some(hostile =>
    hostile.body.some(part => part.hits > 0 && DANGEROUS_EXPANSION_HOSTILE_PARTS.has(part.type))
  );
}

function getVisibleOwnedSpawnConstructionSiteBlockReason(roomName: string, myUsername: string | undefined): string | null {
  const room = Game.rooms[roomName];
  if (!room) return null;

  const owner = room.controller?.owner?.username;
  if (room.controller?.my || owner === myUsername) return "already owned";
  if (owner) return `owned by ${owner}`;

  const reserver = room.controller?.reservation?.username;
  if (reserver && reserver !== myUsername) return `reserved by ${reserver}`;

  if (hasDangerousExpansionHostile(room)) return "visible dangerous hostiles";
  return null;
}

function getKnownOwnedSpawnConstructionSiteBlockReason(
  intel: RoomIntel | undefined,
  myUsername: string | undefined,
  visibleRoom: boolean
): string | null {
  if (!intel) return null;
  if (!visibleRoom) {
    if (intel.owner && intel.owner !== myUsername) return `owned by ${intel.owner}`;
    if (intel.reserver && intel.reserver !== myUsername) return `reserved by ${intel.reserver}`;
    if (intel.threatLevel >= UNSAFE_CONSTRUCTION_TARGET_THREAT_LEVEL) return `threat level ${intel.threatLevel}`;
  }
  if (intel.isHighway) return "highway room";
  if (intel.isSK) return "source keeper room";
  return null;
}

function getOwnedSpawnConstructionSiteCandidates(
  empire: EmpireMemory,
  ownedRooms: Room[],
  config: ExpansionOpportunityConfig
): { candidates: ExpansionCandidate[]; skipped: OwnedConstructionTargetSkip[] } {
  const ownedRoomNames = new Set(ownedRooms.map(room => room.name));
  const myUsername = getMyUsername(ownedRooms);
  const candidates: ExpansionCandidate[] = [];
  const skipped: OwnedConstructionTargetSkip[] = [];

  for (const roomName of getOwnedSpawnConstructionSiteRoomNames()) {
    if (ownedRoomNames.has(roomName)) continue;

    const visibleRoom = Boolean(Game.rooms[roomName]);
    const visibleBlockReason = getVisibleOwnedSpawnConstructionSiteBlockReason(roomName, myUsername);
    if (visibleBlockReason) {
      skipped.push({ roomName, reason: visibleBlockReason });
      continue;
    }

    const distance = getMinDistanceToOwned(roomName, ownedRooms);
    if (distance > config.maxExpansionDistance) {
      skipped.push({ roomName, reason: `outside expansion distance (${distance})` });
      continue;
    }

    const intel = empire.knownRooms[roomName];
    const knownBlockReason = getKnownOwnedSpawnConstructionSiteBlockReason(intel, myUsername, visibleRoom);
    if (knownBlockReason) {
      skipped.push({ roomName, reason: knownBlockReason });
      continue;
    }

    const score = intel?.scouted ? scoreExpansionOpportunity(intel, ownedRooms, config) : 0;
    candidates.push({
      roomName,
      score: Math.max(score, config.minExpansionScore + OWNED_SPAWN_CONSTRUCTION_SITE_SCORE_BONUS),
      distance,
      claimed: false,
      lastEvaluated: Game.time
    });
  }

  candidates.sort((a, b) => b.score - a.score || a.distance - b.distance || a.roomName.localeCompare(b.roomName));
  return { candidates, skipped };
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

    if (!canBecomeExpansionOpportunity(intel)) continue;

    const distance = getMinDistanceToOwned(intel.name, ownedRooms);
    if (distance > config.maxExpansionDistance) continue;

    const score = scoreExpansionOpportunity(intel, ownedRooms, config);
    if (score < config.minExpansionScore) continue;

    candidates.push({
      roomName: intel.name,
      score,
      distance,
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
  const constructionPlan = getOwnedSpawnConstructionSiteCandidates(empire, ownedRooms, config);
  const ownedConstructionTargetRoomNames = new Set(constructionPlan.candidates.map(candidate => candidate.roomName));
  const blockedConstructionTargetRoomNames = new Set(constructionPlan.skipped.map(target => target.roomName));
  const activeTargets = empire.claimQueue.filter(
    candidate =>
      candidate.claimed &&
      !ownedConstructionTargetRoomNames.has(candidate.roomName) &&
      !blockedConstructionTargetRoomNames.has(candidate.roomName)
  );
  const activeRoomNames = new Set(activeTargets.map(candidate => candidate.roomName));
  const ownedConstructionTargets = constructionPlan.candidates;
  const prioritizedRoomNames = new Set([
    ...activeRoomNames,
    ...ownedConstructionTargets.map(candidate => candidate.roomName),
    ...blockedConstructionTargetRoomNames
  ]);
  const candidates = evaluateExpansionOpportunities(empire, ownedRooms, config).filter(
    candidate => !prioritizedRoomNames.has(candidate.roomName)
  );
  const claimQueue = [...activeTargets, ...ownedConstructionTargets, ...candidates].slice(0, config.maxCandidates);
  const queuedConstructionRooms = claimQueue
    .filter(candidate => ownedConstructionTargets.some(target => target.roomName === candidate.roomName))
    .map(candidate => candidate.roomName);
  const queuedConstructionRoomNames = new Set(queuedConstructionRooms);
  const cappedConstructionTargets = ownedConstructionTargets
    .filter(candidate => !queuedConstructionRoomNames.has(candidate.roomName))
    .map(candidate => ({ roomName: candidate.roomName, reason: "claim queue cap" }));

  return {
    claimQueue,
    evaluatedCandidates: candidates.length,
    preservedActiveTargets: activeTargets.length,
    ownedConstructionTargets: queuedConstructionRooms.length,
    ownedConstructionTargetRooms: queuedConstructionRooms,
    skippedOwnedConstructionTargets: [...constructionPlan.skipped, ...cappedConstructionTargets]
  };
}
