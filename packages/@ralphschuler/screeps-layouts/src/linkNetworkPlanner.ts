/**
 * Dynamic link-network planner.
 *
 * Links are room-specific: controller, sources, storage, and spawn core vary by
 * room terrain. Static blueprints cannot safely express them, so this facade
 * plans functional link positions from live room objects and delegates geometry,
 * occupancy, and classification details to the `link-network/` modules.
 */

import { getStructureLimits } from "./blueprints/constants";
import {
  CORE_LINK_PRIORITIES,
  LINK_MIN_RCL,
  classifyLinkByFunctionalRange,
  collectBlockedPositions,
  collectOccupiedLinkPositions,
  findBuiltLinks,
  findPlannedLinkRole,
  getRange,
  positionKey,
  selectCandidate,
  type LinkNetworkPlan,
  type PlannedLinkPlacement,
  type PlannedLinkRole,
  type RoomObjectWithPos
} from "./link-network";

export type { LinkNetworkPlan, PlannedLinkPlacement, PlannedLinkRole } from "./link-network";

/** Plan dynamic link positions for an owned room. */
export function planLinkNetwork(room: Room): LinkNetworkPlan {
  const rcl = room.controller?.level ?? 0;
  const linkLimit = getStructureLimits(rcl)[STRUCTURE_LINK] ?? 0;
  const placements: PlannedLinkPlacement[] = [];

  if (!room.controller?.my || rcl < LINK_MIN_RCL || linkLimit <= 0) {
    return { roomName: room.name, rcl, linkLimit, placements };
  }

  const blocked = collectBlockedPositions(room);
  const used = new Set<string>();
  const storage = room.storage;
  const controller = room.controller;
  const spawns = room.find(FIND_MY_SPAWNS);
  const primarySpawn = spawns[0];

  const addPlacement = createPlacementAdder(room, placements, linkLimit, blocked, used);

  // A useful link network needs at least one receiver and one source-fed sender.
  // RCL5 has only two links, so prefer controller + farthest source over a
  // receiver-only storage/controller pair that cannot move source energy.
  addPlacement("controller", controller, 2, 2, CORE_LINK_PRIORITIES.controller, storage ?? primarySpawn);

  const reference = storage ?? controller;
  const rankedSources = rankSourcesByDistanceFromReference(room, reference);
  const storageReserve = storage && rcl >= 6 ? 1 : 0;
  const spawnReserve = primarySpawn && rcl >= 8 ? 1 : 0;
  const sourceCapacity = Math.max(0, linkLimit - placements.length - storageReserve - spawnReserve);

  for (const source of rankedSources.slice(0, sourceCapacity)) {
    addPlacement("source", source, 1, 1, CORE_LINK_PRIORITIES.source + getRange(source.pos, reference.pos), storage ?? controller);
  }

  // Add receiver/distribution links only after the network has a source sender,
  // or when no source position is visible yet and a storage/controller pair is
  // still the best partial network the room can build.
  if (placements.length < linkLimit && (rcl >= 6 || rankedSources.length === 0)) {
    addPlacement("storage", storage, 1, 1, CORE_LINK_PRIORITIES.storage, controller);
  }

  if (placements.length < linkLimit && rcl >= 8) {
    addPlacement("spawn", primarySpawn, 1, 2, CORE_LINK_PRIORITIES.spawn, storage);
  }

  return { roomName: room.name, rcl, linkLimit, placements };
}

/** Return exact planned link role for a link position, if it is part of the dynamic plan. */
export function getPlannedLinkRole(room: Room, pos: RoomPosition): PlannedLinkRole | undefined {
  return findPlannedLinkRole(planLinkNetwork(room).placements, pos);
}

/** Position keys for planned links. Useful for cleanup protection. */
export function getPlannedLinkPositionKeys(room: Room): Set<string> {
  return new Set(planLinkNetwork(room).placements.map(placement => positionKey(placement.x, placement.y)));
}

/** Classify a link by exact plan first, then by functional range. */
export function classifyFunctionalLink(room: Room, link: StructureLink): PlannedLinkRole | undefined {
  return getPlannedLinkRole(room, link.pos) ?? classifyLinkByFunctionalRange(room, link);
}

/** Planned positions plus any existing functional links that should survive cleanup. */
export function getProtectedLinkPositionKeys(room: Room): Set<string> {
  const protectedPositions = getPlannedLinkPositionKeys(room);

  for (const link of findBuiltLinks(room)) {
    if (classifyFunctionalLink(room, link)) {
      protectedPositions.add(positionKey(link.pos.x, link.pos.y));
    }
  }

  return protectedPositions;
}

/** Place missing dynamic link construction sites, respecting link limits and site caps. */
export function placeLinkConstructionSites(room: Room, maxSites = 1): number {
  const plan = planLinkNetwork(room);
  if (plan.placements.length === 0 || maxSites <= 0) return 0;

  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const existingLinks = findBuiltLinks(room);
  const linkSites = existingSites.filter(site => site.structureType === STRUCTURE_LINK) as Array<ConstructionSite<STRUCTURE_LINK>>;
  let linkCount = existingLinks.length + linkSites.length;
  let placed = 0;

  const occupiedLinkKeys = collectOccupiedLinkPositions(existingLinks, linkSites);

  for (const placement of plan.placements) {
    if (placed >= maxSites || linkCount >= plan.linkLimit) break;
    const key = positionKey(placement.x, placement.y);
    if (occupiedLinkKeys.has(key)) continue;

    const result = room.createConstructionSite(placement.x, placement.y, STRUCTURE_LINK);
    if (result === OK) {
      placed += 1;
      linkCount += 1;
      occupiedLinkKeys.add(key);
    }
  }

  return placed;
}

function createPlacementAdder(
  room: Room,
  placements: PlannedLinkPlacement[],
  linkLimit: number,
  blocked: Set<string>,
  used: Set<string>
) {
  return (
    role: PlannedLinkRole,
    target: RoomObjectWithPos | undefined,
    minRange: number,
    maxRange: number,
    priority: number,
    scoreTarget?: RoomObjectWithPos
  ): void => {
    if (!target || placements.length >= linkLimit) return;

    const candidate = selectCandidate(room, target.pos, minRange, maxRange, blocked, used, scoreTarget?.pos);
    if (!candidate) return;

    placements.push({
      x: candidate.x,
      y: candidate.y,
      roomName: room.name,
      role,
      targetId: target.id,
      priority
    });
    used.add(positionKey(candidate.x, candidate.y));
  };
}

function rankSourcesByDistanceFromReference(room: Room, reference: RoomObjectWithPos): Source[] {
  return room.find(FIND_SOURCES)
    .slice()
    .sort((a, b) => getRange(b.pos, reference.pos) - getRange(a.pos, reference.pos));
}
