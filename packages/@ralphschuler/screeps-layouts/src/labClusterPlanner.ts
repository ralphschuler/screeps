/**
 * Terrain-adaptive lab cluster planner.
 *
 * Static blueprints can skip lab positions when terrain walls block part of the
 * cluster. Labs require a valid reaction cluster (two inputs with every output
 * within range 2), so this planner supplements blueprints by finding nearby
 * buildable positions that preserve existing labs and fill the current RCL cap.
 */

import { getStructureLimits } from "./blueprints/constants";

export interface PlannedLabPosition {
  x: number;
  y: number;
  roomName: string;
  existingLab: boolean;
  existingSite: boolean;
}

export interface LabClusterPlan {
  desiredCount: number;
  positions: PlannedLabPosition[];
  existingCount: number;
  siteCount: number;
  missingCount: number;
}

interface CandidatePosition extends PlannedLabPosition {
  key: string;
  distanceToHub: number;
}

const LAB_CLUSTER_SEARCH_RADIUS = 6;
const MAX_LAB_SITES_PER_PASS = 3;
const MAX_LAB_CLUSTER_CANDIDATES = 80;
const MAX_LAB_INPUT_CANDIDATES = 40;

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function range(a: Pick<PlannedLabPosition, "x" | "y">, b: Pick<PlannedLabPosition, "x" | "y">): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function isBlockingStructure(structure: Structure, existingLabKeys: Set<string>): boolean {
  const posKey = key(structure.pos.x, structure.pos.y);
  if (existingLabKeys.has(posKey)) return false;
  return structure.structureType !== STRUCTURE_RAMPART;
}

function isBlockingSite(site: ConstructionSite, existingLabSiteKeys: Set<string>): boolean {
  const posKey = key(site.pos.x, site.pos.y);
  if (existingLabSiteKeys.has(posKey)) return false;
  return site.structureType !== STRUCTURE_RAMPART;
}

function getHub(room: Room): { x: number; y: number } {
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  const hub = room.terminal ?? room.storage ?? spawn;
  return hub ? { x: hub.pos.x, y: hub.pos.y } : { x: 25, y: 25 };
}

function addCandidate(
  candidates: Map<string, CandidatePosition>,
  room: Room,
  x: number,
  y: number,
  hub: { x: number; y: number },
  existingLabKeys: Set<string>,
  existingSiteKeys: Set<string>,
  blockingKeys: Set<string>
): void {
  if (x < 1 || x > 48 || y < 1 || y > 48) return;
  const posKey = key(x, y);
  const existingLab = existingLabKeys.has(posKey);
  const existingSite = existingSiteKeys.has(posKey);

  if (!existingLab && !existingSite) {
    if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL) return;
    if (blockingKeys.has(posKey)) return;
  }

  candidates.set(posKey, {
    x,
    y,
    roomName: room.name,
    key: posKey,
    existingLab,
    existingSite,
    distanceToHub: Math.max(Math.abs(x - hub.x), Math.abs(y - hub.y))
  });
}

function getRclLabLimit(room: Room): number {
  const rcl = room.controller?.level ?? 0;
  const limits = getStructureLimits(rcl);
  return limits[STRUCTURE_LAB] ?? 0;
}

function scoreCluster(positions: CandidatePosition[], inputA: CandidatePosition, inputB: CandidatePosition): number {
  const existingScore = positions.filter(pos => pos.existingLab).length * 1000;
  const siteScore = positions.filter(pos => pos.existingSite).length * 300;
  const hubPenalty = positions.reduce((sum, pos) => sum + pos.distanceToHub, 0);
  const inputSpreadPenalty = range(inputA, inputB) * 5;
  return existingScore + siteScore - hubPenalty - inputSpreadPenalty;
}

function minRangeToRequired(candidate: CandidatePosition, required: CandidatePosition[]): number {
  if (required.length === 0) return 0;
  return Math.min(...required.map(position => range(candidate, position)));
}

function selectCandidatePool(
  candidates: Map<string, CandidatePosition>,
  requiredKeys: Set<string>
): CandidatePosition[] {
  const required = [...requiredKeys]
    .map(requiredKey => candidates.get(requiredKey))
    .filter((candidate): candidate is CandidatePosition => candidate !== undefined);

  const optional = [...candidates.values()]
    .filter(candidate => !requiredKeys.has(candidate.key))
    .sort((a, b) => {
      const requiredDistanceDelta = minRangeToRequired(a, required) - minRangeToRequired(b, required);
      if (requiredDistanceDelta !== 0) return requiredDistanceDelta;
      if (a.existingLab !== b.existingLab) return a.existingLab ? -1 : 1;
      if (a.existingSite !== b.existingSite) return a.existingSite ? -1 : 1;
      return a.distanceToHub - b.distanceToHub;
    });

  return [...required, ...optional].slice(0, MAX_LAB_CLUSTER_CANDIDATES);
}

/**
 * Plan a complete lab cluster for the room's current RCL.
 */
export function planLabCluster(room: Room): LabClusterPlan | null {
  const desiredCount = getRclLabLimit(room);
  if (desiredCount < 3) return null;

  const existingLabs = room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_LAB
  }) as StructureLab[];
  const allSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  const labSites = allSites.filter(site => site.structureType === STRUCTURE_LAB);

  const existingLabKeys = new Set(existingLabs.map(lab => key(lab.pos.x, lab.pos.y)));
  const existingSiteKeys = new Set(labSites.map(site => key(site.pos.x, site.pos.y)));
  const requiredKeys = new Set([...existingLabKeys, ...existingSiteKeys]);
  if (requiredKeys.size > desiredCount) return null;

  const allStructures = room.find(FIND_STRUCTURES);
  const blockingKeys = new Set<string>();
  for (const structure of allStructures) {
    if (isBlockingStructure(structure, existingLabKeys)) {
      blockingKeys.add(key(structure.pos.x, structure.pos.y));
    }
  }
  for (const site of allSites) {
    if (isBlockingSite(site, existingSiteKeys)) {
      blockingKeys.add(key(site.pos.x, site.pos.y));
    }
  }

  const hub = getHub(room);
  const candidates = new Map<string, CandidatePosition>();
  const seeds = [
    ...existingLabs.map(lab => ({ x: lab.pos.x, y: lab.pos.y })),
    ...labSites.map(site => ({ x: site.pos.x, y: site.pos.y })),
    room.terminal ? { x: room.terminal.pos.x, y: room.terminal.pos.y } : undefined,
    room.storage ? { x: room.storage.pos.x, y: room.storage.pos.y } : undefined,
    room.find(FIND_MY_SPAWNS)[0] ? { x: room.find(FIND_MY_SPAWNS)[0]!.pos.x, y: room.find(FIND_MY_SPAWNS)[0]!.pos.y } : undefined,
    hub
  ].filter((pos): pos is { x: number; y: number } => pos !== undefined);

  for (const seed of seeds) {
    for (let dx = -LAB_CLUSTER_SEARCH_RADIUS; dx <= LAB_CLUSTER_SEARCH_RADIUS; dx++) {
      for (let dy = -LAB_CLUSTER_SEARCH_RADIUS; dy <= LAB_CLUSTER_SEARCH_RADIUS; dy++) {
        addCandidate(candidates, room, seed.x + dx, seed.y + dy, hub, existingLabKeys, existingSiteKeys, blockingKeys);
      }
    }
  }

  for (const requiredKey of requiredKeys) {
    if (!candidates.has(requiredKey)) return null;
  }

  const candidateList = selectCandidatePool(candidates, requiredKeys);
  if (candidateList.length < desiredCount) return null;

  const inputCandidates = candidateList.slice(0, MAX_LAB_INPUT_CANDIDATES);
  let best: { positions: CandidatePosition[]; score: number } | null = null;

  for (const inputA of inputCandidates) {
    for (const inputB of inputCandidates) {
      if (inputA.key === inputB.key) continue;

      const compatible = candidateList.filter(candidate =>
        candidate.key === inputA.key ||
        candidate.key === inputB.key ||
        (range(candidate, inputA) <= 2 && range(candidate, inputB) <= 2)
      );

      if (compatible.length < desiredCount) continue;
      if ([...requiredKeys].some(requiredKey => !compatible.some(candidate => candidate.key === requiredKey))) continue;

      const selected = new Map<string, CandidatePosition>();
      selected.set(inputA.key, inputA);
      selected.set(inputB.key, inputB);
      for (const requiredKey of requiredKeys) {
        const required = candidates.get(requiredKey);
        if (required) selected.set(required.key, required);
      }

      const extras = compatible
        .filter(candidate => !selected.has(candidate.key))
        .sort((a, b) => {
          if (a.existingLab !== b.existingLab) return a.existingLab ? -1 : 1;
          if (a.existingSite !== b.existingSite) return a.existingSite ? -1 : 1;
          return a.distanceToHub - b.distanceToHub;
        });

      for (const extra of extras) {
        if (selected.size >= desiredCount) break;
        selected.set(extra.key, extra);
      }

      if (selected.size < desiredCount) continue;

      const positions = [...selected.values()];
      const score = scoreCluster(positions, inputA, inputB);
      if (!best || score > best.score) {
        best = { positions, score };
      }
    }
  }

  if (!best) return null;

  const existingCount = best.positions.filter(pos => pos.existingLab).length;
  const siteCount = best.positions.filter(pos => pos.existingSite).length;

  return {
    desiredCount,
    positions: best.positions.map(({ x, y, roomName, existingLab, existingSite }) => ({
      x,
      y,
      roomName,
      existingLab,
      existingSite
    })),
    existingCount,
    siteCount,
    missingCount: Math.max(0, desiredCount - existingCount - siteCount)
  };
}

/**
 * Place missing lab construction sites from the terrain-adaptive cluster plan.
 */
export function placeLabClusterConstructionSites(room: Room, maxSites = MAX_LAB_SITES_PER_PASS): number {
  const allSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (allSites.length >= 10) return 0;

  const plan = planLabCluster(room);
  if (!plan || plan.missingCount <= 0) return 0;

  let placed = 0;
  for (const position of plan.positions) {
    if (position.existingLab || position.existingSite) continue;
    if (allSites.length + placed >= 10 || placed >= maxSites) break;

    const result = room.createConstructionSite(position.x, position.y, STRUCTURE_LAB);
    if (result === OK) {
      placed++;
    }
  }

  return placed;
}
