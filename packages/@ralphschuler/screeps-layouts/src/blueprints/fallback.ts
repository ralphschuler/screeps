import type {
  BlueprintPoint,
  BlueprintRoomFacts,
  UnplacedDemand,
  BlueprintPlan,
  PlannedStructure
} from "./types";
import { STRUCTURE_TYPES } from "./definitions/rcl-plan";

export interface FallbackCandidate {
  x: number;
  y: number;
  score: number;
  reason: string;
}

export function positionKey(point: BlueprintPoint): string {
  return `${point.x},${point.y}`;
}

export function terrainAt(facts: BlueprintRoomFacts, x: number, y: number): number {
  if (facts.terrain instanceof Map) return facts.terrain.get(`${x},${y}`) ?? 0;
  return facts.terrain.get(x, y);
}

export function isWallTerrain(facts: BlueprintRoomFacts, x: number, y: number): boolean {
  const wallMask = typeof TERRAIN_MASK_WALL === "undefined" ? 1 : TERRAIN_MASK_WALL;
  return (terrainAt(facts, x, y) & wallMask) !== 0;
}

export function isBuildableRoomTile(facts: BlueprintRoomFacts, x: number, y: number): boolean {
  return x >= 1 && x <= 48 && y >= 1 && y <= 48 && !isWallTerrain(facts, x, y);
}

export function isCriticalStructureType(structureType: BuildableStructureConstant): boolean {
  return (
    structureType === STRUCTURE_TYPES.spawn ||
    structureType === STRUCTURE_TYPES.tower ||
    structureType === STRUCTURE_TYPES.storage ||
    structureType === STRUCTURE_TYPES.terminal ||
    structureType === STRUCTURE_TYPES.factory ||
    structureType === STRUCTURE_TYPES.link ||
    structureType === STRUCTURE_TYPES.lab ||
    structureType === STRUCTURE_TYPES.powerSpawn ||
    structureType === STRUCTURE_TYPES.nuker ||
    structureType === STRUCTURE_TYPES.observer
  );
}

export function getFallbackSearchOrigin(
  facts: BlueprintRoomFacts,
  plan: Pick<BlueprintPlan, "anchor">,
  demand: Pick<UnplacedDemand, "fallback" | "localAnchor">
): BlueprintPoint {
  if (demand.localAnchor) return demand.localAnchor;

  switch (demand.fallback) {
    case "nearController":
      return facts.controller ?? plan.anchor;
    case "nearMineral":
      return facts.mineral ?? plan.anchor;
    case "nearSource":
      return facts.sources?.[0] ?? plan.anchor;
    case "nearStorage":
    case "nearHub":
    case "labCluster":
    case "defenseCoverage":
    case "protectedFlexible":
    case "nearRoad":
    case "none":
    default:
      return plan.anchor;
  }
}

function countAdjacentRoads(plan: Pick<BlueprintPlan, "roads">, x: number, y: number): number {
  let count = 0;
  for (const road of plan.roads) {
    if (Math.max(Math.abs(road.x - x), Math.abs(road.y - y)) === 1) count++;
  }
  return count;
}

function distanceToNearest(points: BlueprintPoint[] | undefined, x: number, y: number): number {
  if (!points || points.length === 0) return 0;
  let best = Infinity;
  for (const point of points) {
    best = Math.min(best, Math.max(Math.abs(point.x - x), Math.abs(point.y - y)));
  }
  return Number.isFinite(best) ? best : 0;
}

export function buildOccupiedPositionSet(plan: Pick<BlueprintPlan, "structures">): Set<string> {
  return new Set(plan.structures.map(positionKey));
}

export function canPlaceFallbackStructure(
  facts: BlueprintRoomFacts,
  plan: Pick<BlueprintPlan, "structures">,
  x: number,
  y: number
): boolean {
  if (!isBuildableRoomTile(facts, x, y)) return false;
  return !buildOccupiedPositionSet(plan).has(`${x},${y}`);
}

export function scoreFallbackCandidate(
  facts: BlueprintRoomFacts,
  plan: Pick<BlueprintPlan, "anchor" | "roads">,
  demand: Pick<UnplacedDemand, "structureType" | "fallback" | "localAnchor">,
  x: number,
  y: number
): FallbackCandidate {
  const origin = getFallbackSearchOrigin(facts, plan, demand);
  const originDistance = Math.max(Math.abs(origin.x - x), Math.abs(origin.y - y));
  const hubDistance = Math.max(Math.abs(plan.anchor.x - x), Math.abs(plan.anchor.y - y));
  const controllerDistance = facts.controller ? Math.max(Math.abs(facts.controller.x - x), Math.abs(facts.controller.y - y)) : 0;
  const sourceDistance = distanceToNearest(facts.sources, x, y);
  const roadBonus = countAdjacentRoads(plan, x, y) * 12;
  const edgeDistance = Math.min(x, y, 49 - x, 49 - y);

  let score = 1000 - originDistance * 18 - hubDistance * 2 + roadBonus + Math.min(edgeDistance, 10) * 2;

  if (demand.structureType === STRUCTURE_TYPES.tower) score += Math.max(0, 14 - Math.min(hubDistance, controllerDistance)) * 4;
  if (demand.structureType === STRUCTURE_TYPES.extension) score += roadBonus + Math.max(0, 16 - hubDistance) * 2;
  if (demand.structureType === STRUCTURE_TYPES.link) score += Math.max(0, 10 - Math.min(sourceDistance, controllerDistance, hubDistance)) * 4;
  if (demand.structureType === STRUCTURE_TYPES.lab) score += Math.max(0, 8 - hubDistance) * 8;
  if (demand.structureType === STRUCTURE_TYPES.extractor && facts.mineral) {
    score += facts.mineral.x === x && facts.mineral.y === y ? 10000 : -10000;
  }

  return { x, y, score, reason: `fallback ${demand.fallback} score ${Math.round(score)}` };
}

export function enumerateFallbackCandidates(
  facts: BlueprintRoomFacts,
  plan: Pick<BlueprintPlan, "anchor" | "roads" | "structures">,
  demand: Pick<UnplacedDemand, "structureType" | "fallback" | "localAnchor">,
  scope: "local" | "global" = "global"
): FallbackCandidate[] {
  if (demand.structureType === STRUCTURE_TYPES.extractor && facts.mineral) {
    if (canPlaceFallbackStructure(facts, plan, facts.mineral.x, facts.mineral.y)) {
      return [scoreFallbackCandidate(facts, plan, demand, facts.mineral.x, facts.mineral.y)];
    }
    return [];
  }

  const origin = getFallbackSearchOrigin(facts, plan, demand);
  const maxRadius = scope === "local" ? 6 : 22;
  const candidates: FallbackCandidate[] = [];

  for (let radius = 0; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (radius > 0 && Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const x = origin.x + dx;
        const y = origin.y + dy;
        if (!canPlaceFallbackStructure(facts, plan, x, y)) continue;
        candidates.push(scoreFallbackCandidate(facts, plan, demand, x, y));
      }
    }

    if (scope === "local" && candidates.length > 0) break;
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export function chooseBestFallbackCandidate(candidates: FallbackCandidate[]): FallbackCandidate | null {
  return candidates.length > 0 ? candidates[0] : null;
}

export function toPlannedStructure(
  candidate: FallbackCandidate,
  demand: UnplacedDemand,
  source = "fallback"
): PlannedStructure {
  return {
    x: candidate.x,
    y: candidate.y,
    structureType: demand.structureType,
    minRcl: demand.minRcl ?? 1,
    priority: demand.priority,
    source,
    placedBy: "fallback"
  };
}
