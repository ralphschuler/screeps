/**
 * Dynamic link-network planner.
 *
 * Links are room-specific: controller, sources, storage, and spawn core vary by
 * room terrain. Static blueprints cannot safely express them, so this module
 * plans functional link positions from live room objects.
 */

import { getStructureLimits } from "./blueprints/constants";

export type PlannedLinkRole = "storage" | "controller" | "spawn" | "source";

export interface PlannedLinkPlacement {
  x: number;
  y: number;
  roomName: string;
  role: PlannedLinkRole;
  /** Source/controller/storage/spawn id when available. */
  targetId?: string;
  /** Higher means this placement should consume link capacity earlier. */
  priority: number;
}

export interface LinkNetworkPlan {
  roomName: string;
  rcl: number;
  linkLimit: number;
  placements: PlannedLinkPlacement[];
}

interface LinkCandidate {
  x: number;
  y: number;
  score: number;
}

interface RoomObjectWithPos {
  id?: string;
  pos: RoomPosition;
}

const LINK_MIN_RCL = 5;
const CORE_LINK_PRIORITIES: Record<PlannedLinkRole, number> = {
  controller: 400,
  source: 300,
  storage: 200,
  spawn: 100
};

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

  const addPlacement = (
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
    const placement: PlannedLinkPlacement = {
      x: candidate.x,
      y: candidate.y,
      roomName: room.name,
      role,
      targetId: target.id,
      priority
    };
    placements.push(placement);
    used.add(positionKey(candidate.x, candidate.y));
  };

  const storage = room.storage;
  const controller = room.controller;
  const spawns = room.find(FIND_MY_SPAWNS);
  const primarySpawn = spawns[0];

  // A useful link network needs at least one receiver and one source-fed sender.
  // RCL5 has only two links, so prefer controller + farthest source over a
  // receiver-only storage/controller pair that cannot move source energy.
  addPlacement("controller", controller, 2, 2, CORE_LINK_PRIORITIES.controller, storage ?? primarySpawn);

  const reference = storage ?? controller;
  const rankedSources = room.find(FIND_SOURCES)
    .slice()
    .sort((a, b) => getRange(b.pos, reference.pos) - getRange(a.pos, reference.pos));
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
  const key = positionKey(pos.x, pos.y);
  return planLinkNetwork(room).placements.find(placement => positionKey(placement.x, placement.y) === key)?.role;
}

/** Position keys for planned links. Useful for cleanup protection. */
export function getPlannedLinkPositionKeys(room: Room): Set<string> {
  return new Set(planLinkNetwork(room).placements.map(placement => positionKey(placement.x, placement.y)));
}

/** Classify a link by functional range if it is not at an exact planned position. */
export function classifyFunctionalLink(room: Room, link: StructureLink): PlannedLinkRole | undefined {
  const plannedRole = getPlannedLinkRole(room, link.pos);
  if (plannedRole) return plannedRole;

  // Match LinkManager receiver priority while keeping source links as senders.
  if (room.controller && link.pos.getRangeTo(room.controller) <= 2) return "controller";
  if (room.storage && link.pos.getRangeTo(room.storage) <= 2) return "storage";
  if (room.find(FIND_MY_SPAWNS).some(spawn => link.pos.getRangeTo(spawn) <= 2)) return "spawn";
  if (room.find(FIND_SOURCES).some(source => link.pos.getRangeTo(source) <= 2)) return "source";
  return undefined;
}

/** Planned positions plus any existing functional links that should survive cleanup. */
export function getProtectedLinkPositionKeys(room: Room): Set<string> {
  const protectedPositions = getPlannedLinkPositionKeys(room);
  const links = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_LINK
  }) as StructureLink[];

  for (const link of links) {
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

  const existingLinks = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_LINK
  }) as StructureLink[];
  const linkSites = existingSites.filter(site => site.structureType === STRUCTURE_LINK);
  let linkCount = existingLinks.length + linkSites.length;
  let placed = 0;

  const occupiedLinkKeys = new Set<string>([
    ...existingLinks.map(link => positionKey(link.pos.x, link.pos.y)),
    ...linkSites.map(site => positionKey(site.pos.x, site.pos.y))
  ]);

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

function collectBlockedPositions(room: Room): Set<string> {
  const blocked = new Set<string>();
  const structures = room.find(FIND_STRUCTURES);
  for (const structure of structures) {
    // Existing links are allowed because the planner should be able to recognize
    // and preserve exact planned positions that are already built.
    if (structure.structureType === STRUCTURE_LINK) continue;
    blocked.add(positionKey(structure.pos.x, structure.pos.y));
  }

  for (const site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
    blocked.add(positionKey(site.pos.x, site.pos.y));
  }

  return blocked;
}

function selectCandidate(
  room: Room,
  target: RoomPosition,
  minRange: number,
  maxRange: number,
  blocked: Set<string>,
  used: Set<string>,
  scoreTarget?: RoomPosition
): LinkCandidate | undefined {
  const candidates: LinkCandidate[] = [];
  const terrain = room.getTerrain();

  for (let x = target.x - maxRange; x <= target.x + maxRange; x += 1) {
    for (let y = target.y - maxRange; y <= target.y + maxRange; y += 1) {
      const range = Math.max(Math.abs(target.x - x), Math.abs(target.y - y));
      if (range < minRange || range > maxRange) continue;
      if (x < 1 || x > 48 || y < 1 || y > 48) continue;
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

      const key = positionKey(x, y);
      if (blocked.has(key) || used.has(key)) continue;

      const score = scoreTarget ? getRange({ x, y }, scoreTarget) : 0;
      candidates.push({ x, y, score });
    }
  }

  candidates.sort((a, b) => {
    const scoreCompare = a.score - b.score;
    if (scoreCompare !== 0) return scoreCompare;
    const xCompare = a.x - b.x;
    if (xCompare !== 0) return xCompare;
    return a.y - b.y;
  });

  return candidates[0];
}

function getRange(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function positionKey(x: number, y: number): string {
  return `${x},${y}`;
}
