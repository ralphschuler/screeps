import type {
  Blueprint,
  BlueprintExistingPlacement,
  BlueprintPlan,
  BlueprintPlanError,
  BlueprintPlanValidation,
  BlueprintPoint,
  BlueprintRoomFacts,
  PlannedStructure,
  StampDefinition,
  StampMember,
  UnplacedDemand
} from "./types";
import {
  chooseBestFallbackCandidate,
  enumerateFallbackCandidates,
  isBuildableRoomTile,
  isCriticalStructureType,
  positionKey,
  toPlannedStructure
} from "./fallback";
import {
  getControllerStructureLimits,
  getMandatoryStructureTargets,
  getStructureTarget,
  MANDATORY_BLUEPRINT_STRUCTURE_TYPES,
  normalizeRcl,
  STRUCTURE_TYPES
} from "./definitions/rcl-plan";
import {
  CONTROLLER_STAMP,
  DEFENSE_TOWER_PAIR,
  EXT10_DIAMOND,
  HUB_CORE,
  LAB3_TO_LAB10,
  LATE_GAME_HEAVY,
  MINERAL_STAMP,
  SOURCE_MINING
} from "./definitions/stamps";

const PLAN_VERSION = "stamp-v1";

export interface BlueprintPlannerOptions {
  anchor?: BlueprintPoint;
}

export interface MutablePlanState {
  facts: BlueprintRoomFacts;
  plan: BlueprintPlan;
  counts: Partial<Record<BuildableStructureConstant, number>>;
  limits: Partial<Record<BuildableStructureConstant, number>>;
  targets: Partial<Record<BuildableStructureConstant, number>>;
  occupied: Set<string>;
  roadKeys: Set<string>;
  rampartKeys: Set<string>;
}

export interface StampPlacementResult {
  status: "full" | "partial";
  missing: UnplacedDemand[];
}

function clampRoomCoordinate(value: number): number {
  return Math.max(5, Math.min(44, Math.round(value)));
}

function pointRange(a: BlueprintPoint, b: BlueprintPoint): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function createDefaultAnchor(facts: BlueprintRoomFacts): BlueprintPoint {
  if (facts.anchor) return { x: facts.anchor.x, y: facts.anchor.y };

  const existingStorage = facts.existingStructures?.find(structure => structure.structureType === STRUCTURE_TYPES.storage);
  if (existingStorage) return { x: existingStorage.x, y: existingStorage.y };

  const existingSpawn = facts.existingStructures?.find(structure => structure.structureType === STRUCTURE_TYPES.spawn);
  if (existingSpawn) return { x: existingSpawn.x + 2, y: existingSpawn.y };

  const points = [...(facts.sources ?? [])];
  if (facts.controller) points.push(facts.controller);
  if (facts.mineral) points.push(facts.mineral);

  if (points.length === 0) return { x: 25, y: 25 };

  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return { x: clampRoomCoordinate(total.x / points.length), y: clampRoomCoordinate(total.y / points.length) };
}

function countStructure(state: MutablePlanState, structureType: BuildableStructureConstant): number {
  return state.counts[structureType] ?? 0;
}

function incrementCount(state: MutablePlanState, structureType: BuildableStructureConstant): void {
  state.counts[structureType] = countStructure(state, structureType) + 1;
}

function canPlanStructure(state: MutablePlanState, structureType: BuildableStructureConstant, x: number, y: number): boolean {
  const limit = state.limits[structureType] ?? 0;
  if (limit <= 0 || countStructure(state, structureType) >= limit) return false;
  if (!isBuildableRoomTile(state.facts, x, y)) return false;
  return !state.occupied.has(`${x},${y}`);
}

function addRoad(state: MutablePlanState, x: number, y: number, source: string, priority: number, minRcl: number): void {
  if (minRcl > state.plan.rcl) return;
  if (!isBuildableRoomTile(state.facts, x, y)) return;
  if (state.occupied.has(`${x},${y}`)) return;

  const key = `${x},${y}`;
  if (state.roadKeys.has(key)) return;

  state.plan.roads.push({ x, y, source, priority, minRcl });
  state.roadKeys.add(key);
}

function addRampart(state: MutablePlanState, x: number, y: number, source: string, priority: number, minRcl: number): void {
  if (minRcl > state.plan.rcl) return;
  if (!isBuildableRoomTile(state.facts, x, y)) return;

  const key = `${x},${y}`;
  if (state.rampartKeys.has(key)) return;

  state.plan.ramparts.push({ x, y, source, priority, minRcl });
  state.rampartKeys.add(key);
}

function addStructure(state: MutablePlanState, placement: PlannedStructure, rampart = false): boolean {
  if (!canPlanStructure(state, placement.structureType, placement.x, placement.y)) return false;

  state.plan.structures.push(placement);
  state.occupied.add(positionKey(placement));
  incrementCount(state, placement.structureType);

  if (rampart || isCriticalStructureType(placement.structureType)) {
    addRampart(state, placement.x, placement.y, `${placement.source}:rampart`, placement.priority, placement.minRcl);
  }

  return true;
}

function addExistingPlacements(state: MutablePlanState, placements: BlueprintExistingPlacement[] | undefined, source: string): void {
  for (const placement of placements ?? []) {
    const limit = state.limits[placement.structureType] ?? 0;
    if (limit <= 0) continue;
    if (placement.structureType === STRUCTURE_TYPES.road || placement.structureType === STRUCTURE_TYPES.rampart) continue;
    if (!isBuildableRoomTile(state.facts, placement.x, placement.y)) continue;

    const key = `${placement.x},${placement.y}`;
    if (state.occupied.has(key)) continue;

    const planned: PlannedStructure = {
      x: placement.x,
      y: placement.y,
      structureType: placement.structureType,
      minRcl: 1,
      priority: 1000,
      source,
      placedBy: "fixed"
    };
    state.plan.structures.push(planned);
    state.occupied.add(key);
    incrementCount(state, placement.structureType);
  }
}

function makeDemand(member: StampMember, stampId: string, anchor: BlueprintPoint, reason: string): UnplacedDemand {
  return {
    structureType: member.structureType,
    priority: member.priority,
    sourceStamp: stampId,
    fallback: member.fallback,
    reason,
    localAnchor: { x: anchor.x + member.dx, y: anchor.y + member.dy },
    minRcl: member.minRcl
  };
}

function missingDemandStillNeeded(state: MutablePlanState, demand: UnplacedDemand): boolean {
  const limit = state.limits[demand.structureType] ?? 0;
  return limit > 0 && countStructure(state, demand.structureType) < limit;
}

function placeStampMember(state: MutablePlanState, stamp: StampDefinition, anchor: BlueprintPoint, member: StampMember): boolean {
  if (member.minRcl > state.plan.rcl) return true;
  if (!missingDemandStillNeeded(state, {
    structureType: member.structureType,
    priority: member.priority,
    fallback: member.fallback,
    reason: "count reached"
  })) {
    return true;
  }

  const x = anchor.x + member.dx;
  const y = anchor.y + member.dy;
  const placement: PlannedStructure = {
    x,
    y,
    structureType: member.structureType,
    minRcl: member.minRcl,
    priority: member.priority,
    source: `${stamp.id}:${member.id}`,
    placedBy: "stamp"
  };

  return addStructure(state, placement, member.rampart);
}

export function placeStampOrPartial(state: MutablePlanState, stamp: StampDefinition, anchor: BlueprintPoint): StampPlacementResult {
  const missing: UnplacedDemand[] = [];
  let allRequiredPlaced = true;

  state.plan.stamps.push(stamp.id);

  for (const road of stamp.roads) {
    addRoad(state, anchor.x + road.dx, anchor.y + road.dy, `${stamp.id}:${road.id}`, road.priority, road.minRcl);
  }

  const members = stamp.members
    .filter(member => member.minRcl <= state.plan.rcl)
    .sort((a, b) => b.priority - a.priority);

  for (const member of members) {
    const placed = placeStampMember(state, stamp, anchor, member);
    if (!placed) {
      if (member.required || missingDemandStillNeeded(state, makeDemand(member, stamp.id, anchor, "stamp member blocked"))) {
        missing.push(makeDemand(member, stamp.id, anchor, "preferred stamp tile blocked"));
      }
      if (member.required) allRequiredPlaced = false;
    }
  }

  return { status: allRequiredPlaced ? "full" : "partial", missing };
}

function addLineRoads(state: MutablePlanState, from: BlueprintPoint, to: BlueprintPoint, source: string, minRcl: number): void {
  let x = from.x;
  let y = from.y;
  let guard = 0;

  while ((x !== to.x || y !== to.y) && guard < 80) {
    if (x < to.x) x++;
    else if (x > to.x) x--;

    if (y < to.y) y++;
    else if (y > to.y) y--;

    if (x === to.x && y === to.y) break;
    addRoad(state, x, y, source, 40, minRcl);
    guard++;
  }
}

function findBestAdjacentTile(state: MutablePlanState, target: BlueprintPoint, prefer: BlueprintPoint): BlueprintPoint | null {
  let best: { point: BlueprintPoint; score: number } | null = null;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const point = { x: target.x + dx, y: target.y + dy };
      if (!isBuildableRoomTile(state.facts, point.x, point.y)) continue;
      if (state.occupied.has(`${point.x},${point.y}`)) continue;
      const score = -pointRange(point, prefer);
      if (!best || score > best.score) best = { point, score };
    }
  }

  return best?.point ?? null;
}

function placeAnchoredOperationalStamps(state: MutablePlanState): UnplacedDemand[] {
  const missing: UnplacedDemand[] = [];

  for (const source of state.facts.sources ?? []) {
    const container = findBestAdjacentTile(state, source, state.plan.anchor);
    if (container) {
      placeStampOrPartial(state, SOURCE_MINING, container);
      addLineRoads(state, state.plan.anchor, container, "SOURCE_MINING:path", 1);
    }
  }

  if (state.facts.controller) {
    const controllerAnchor = findBestAdjacentTile(state, state.facts.controller, state.plan.anchor);
    if (controllerAnchor) {
      const result = placeStampOrPartial(state, CONTROLLER_STAMP, controllerAnchor);
      missing.push(...result.missing);
      addLineRoads(state, state.plan.anchor, controllerAnchor, "CONTROLLER_STAMP:path", 1);
    }
  }

  if (state.facts.mineral && state.plan.rcl >= 6) {
    const result = placeStampOrPartial(state, MINERAL_STAMP, state.facts.mineral);
    missing.push(...result.missing);
    addLineRoads(state, state.plan.anchor, state.facts.mineral, "MINERAL_STAMP:path", 6);
  }

  return missing;
}

function getExtensionPodAnchors(anchor: BlueprintPoint): BlueprintPoint[] {
  return [
    { x: anchor.x - 6, y: anchor.y },
    { x: anchor.x + 6, y: anchor.y },
    { x: anchor.x, y: anchor.y - 6 },
    { x: anchor.x, y: anchor.y + 6 },
    { x: anchor.x - 6, y: anchor.y - 6 },
    { x: anchor.x + 6, y: anchor.y + 6 }
  ];
}

function placeCoreStamps(state: MutablePlanState): UnplacedDemand[] {
  const missing: UnplacedDemand[] = [];
  missing.push(...placeStampOrPartial(state, HUB_CORE, state.plan.anchor).missing);

  for (const podAnchor of getExtensionPodAnchors(state.plan.anchor)) {
    const result = placeStampOrPartial(state, EXT10_DIAMOND, podAnchor);
    missing.push(...result.missing);
  }

  missing.push(...placeStampOrPartial(state, LAB3_TO_LAB10, { x: state.plan.anchor.x + 4, y: state.plan.anchor.y + 1 }).missing);
  missing.push(...placeStampOrPartial(state, DEFENSE_TOWER_PAIR, { x: state.plan.anchor.x + 4, y: state.plan.anchor.y - 3 }).missing);
  missing.push(...placeStampOrPartial(state, LATE_GAME_HEAVY, { x: state.plan.anchor.x, y: state.plan.anchor.y + 4 }).missing);

  return missing;
}

function hasAdjacentRoad(plan: Pick<BlueprintPlan, "roads">, point: BlueprintPoint): boolean {
  return plan.roads.some(road => pointRange(road, point) === 1);
}

function addRoadAccessIfNeeded(state: MutablePlanState, point: BlueprintPoint): void {
  if (hasAdjacentRoad(state.plan, point)) return;

  const candidates: BlueprintPoint[] = [
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 },
    { x: point.x - 1, y: point.y - 1 },
    { x: point.x + 1, y: point.y + 1 },
    { x: point.x - 1, y: point.y + 1 },
    { x: point.x + 1, y: point.y - 1 }
  ].sort((a, b) => pointRange(a, state.plan.anchor) - pointRange(b, state.plan.anchor));

  for (const candidate of candidates) {
    if (!isBuildableRoomTile(state.facts, candidate.x, candidate.y)) continue;
    if (state.occupied.has(`${candidate.x},${candidate.y}`)) continue;
    addRoad(state, candidate.x, candidate.y, "fallback:road-access", 30, 1);
    return;
  }
}

function resolveFallbackPlacement(state: MutablePlanState, demand: UnplacedDemand): boolean {
  if (!missingDemandStillNeeded(state, demand)) return true;

  const local = chooseBestFallbackCandidate(enumerateFallbackCandidates(state.facts, state.plan, demand, "local"));
  const global = local ?? chooseBestFallbackCandidate(enumerateFallbackCandidates(state.facts, state.plan, demand, "global"));
  if (!global) return false;

  const planned = toPlannedStructure(global, demand, demand.sourceStamp ? `${demand.sourceStamp}:fallback` : "fallback");
  const added = addStructure(state, planned, isCriticalStructureType(demand.structureType));
  if (!added) return false;

  addRoadAccessIfNeeded(state, planned);
  return true;
}

function fallbackPolicyForType(structureType: BuildableStructureConstant): UnplacedDemand["fallback"] {
  switch (structureType) {
    case STRUCTURE_TYPES.extension:
      return "nearRoad";
    case STRUCTURE_TYPES.tower:
      return "defenseCoverage";
    case STRUCTURE_TYPES.storage:
    case STRUCTURE_TYPES.terminal:
    case STRUCTURE_TYPES.factory:
    case STRUCTURE_TYPES.powerSpawn:
      return "nearStorage";
    case STRUCTURE_TYPES.lab:
      return "labCluster";
    case STRUCTURE_TYPES.extractor:
      return "nearMineral";
    default:
      return "protectedFlexible";
  }
}

function ensureMandatoryCounts(state: MutablePlanState, seedMissing: UnplacedDemand[]): void {
  const pending = [...seedMissing].sort((a, b) => b.priority - a.priority);

  for (const demand of pending) {
    if (missingDemandStillNeeded(state, demand)) {
      resolveFallbackPlacement(state, demand);
    }
  }

  for (const structureType of MANDATORY_BLUEPRINT_STRUCTURE_TYPES) {
    const target = state.targets[structureType] ?? 0;
    while (countStructure(state, structureType) < target) {
      const demand: UnplacedDemand = {
        structureType,
        priority: 100,
        fallback: fallbackPolicyForType(structureType),
        reason: "target count not met by preferred stamps",
        localAnchor: structureType === STRUCTURE_TYPES.extractor ? state.facts.mineral : state.plan.anchor,
        minRcl: state.plan.rcl
      };

      if (!resolveFallbackPlacement(state, demand)) {
        state.plan.unplaced.push(demand);
        state.plan.errors.push({
          type: "UNPLACEABLE_STRUCTURE",
          structureType,
          reason: demand.reason,
          rcl: state.plan.rcl
        });
        break;
      }
    }
  }
}

function createInitialState(facts: BlueprintRoomFacts, targetRcl?: number, options: BlueprintPlannerOptions = {}): MutablePlanState {
  const rcl = normalizeRcl(targetRcl ?? facts.rcl);
  const anchor = createDefaultAnchor({ ...facts, rcl, anchor: options.anchor ?? facts.anchor });
  const plan: BlueprintPlan = {
    roomName: facts.roomName,
    rcl,
    anchor,
    structures: [],
    roads: [],
    ramparts: [],
    unplaced: [],
    errors: [],
    stamps: [],
    version: PLAN_VERSION
  };

  return {
    facts: { ...facts, rcl },
    plan,
    counts: {},
    limits: getControllerStructureLimits(rcl),
    targets: getMandatoryStructureTargets(rcl),
    occupied: new Set<string>(),
    roadKeys: new Set<string>(),
    rampartKeys: new Set<string>()
  };
}

export function planRoomBlueprint(facts: BlueprintRoomFacts, targetRcl?: number, options: BlueprintPlannerOptions = {}): BlueprintPlan {
  const state = createInitialState(facts, targetRcl, options);

  addExistingPlacements(state, state.facts.existingStructures, "existing-structure");
  addExistingPlacements(state, state.facts.existingConstructionSites, "existing-site");

  const missing: UnplacedDemand[] = [];
  missing.push(...placeAnchoredOperationalStamps(state));
  missing.push(...placeCoreStamps(state));
  ensureMandatoryCounts(state, missing);

  const validation = validatePlanAgainstRclLimits(state.facts, state.plan);
  state.plan.errors.push(...validation.errors);

  state.plan.structures.sort((a, b) => b.priority - a.priority || a.structureType.localeCompare(b.structureType));
  state.plan.roads.sort((a, b) => b.priority - a.priority);
  state.plan.ramparts.sort((a, b) => b.priority - a.priority);

  return state.plan;
}

export function validatePlanAgainstRclLimits(facts: BlueprintRoomFacts, plan: BlueprintPlan): BlueprintPlanValidation {
  const limits = getControllerStructureLimits(plan.rcl);
  const targets = getMandatoryStructureTargets(plan.rcl);
  const counts: Partial<Record<BuildableStructureConstant, number>> = {};
  const errors: BlueprintPlanError[] = [];
  const occupied = new Set<string>();

  for (const structure of plan.structures) {
    counts[structure.structureType] = (counts[structure.structureType] ?? 0) + 1;

    if (!isBuildableRoomTile(facts, structure.x, structure.y)) {
      errors.push({
        type: "TERRAIN_WALL",
        structureType: structure.structureType,
        x: structure.x,
        y: structure.y,
        reason: `${structure.structureType} planned on unbuildable terrain`,
        rcl: plan.rcl
      });
    }

    const key = `${structure.x},${structure.y}`;
    if (occupied.has(key)) {
      errors.push({
        type: "DUPLICATE_STRUCTURE",
        structureType: structure.structureType,
        x: structure.x,
        y: structure.y,
        reason: `multiple structures planned at ${key}`,
        rcl: plan.rcl
      });
    }
    occupied.add(key);
  }

  for (const structureType of Object.keys(counts) as BuildableStructureConstant[]) {
    const count = counts[structureType] ?? 0;
    const limit = limits[structureType] ?? 0;
    if (count > limit) {
      errors.push({
        type: "RCL_LIMIT_EXCEEDED",
        structureType,
        reason: `${structureType} count ${count} exceeds RCL${plan.rcl} limit ${limit}`,
        rcl: plan.rcl
      });
    }
  }

  for (const structureType of Object.keys(targets) as BuildableStructureConstant[]) {
    const target = targets[structureType] ?? 0;
    const count = counts[structureType] ?? 0;
    if (count < target) {
      errors.push({
        type: "UNPLACEABLE_STRUCTURE",
        structureType,
        reason: `${structureType} count ${count} below RCL${plan.rcl} target ${target}`,
        rcl: plan.rcl
      });
    }
  }

  return { ok: errors.length === 0, errors, counts };
}

function isBuildablePlanStructure(structureType: StructureConstant): structureType is BuildableStructureConstant {
  return (getStructureTarget(structureType as BuildableStructureConstant, 8, true) ?? 0) > 0;
}

export function createBlueprintFactsFromRoom(room: Room, rcl = room.controller?.level ?? 1, options: BlueprintPlannerOptions = {}): BlueprintRoomFacts {
  const terrain = room.getTerrain();
  const existingStructures: BlueprintExistingPlacement[] = [];
  const existingConstructionSites: BlueprintExistingPlacement[] = [];

  for (const structure of room.find(FIND_STRUCTURES)) {
    if (!isBuildablePlanStructure(structure.structureType)) continue;
    existingStructures.push({ x: structure.pos.x, y: structure.pos.y, structureType: structure.structureType });
  }

  for (const site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
    existingConstructionSites.push({ x: site.pos.x, y: site.pos.y, structureType: site.structureType });
  }

  const mineral = room.find(FIND_MINERALS)[0];

  return {
    roomName: room.name,
    rcl,
    terrain,
    controller: room.controller ? { x: room.controller.pos.x, y: room.controller.pos.y } : undefined,
    sources: room.find(FIND_SOURCES).map(source => ({ x: source.pos.x, y: source.pos.y })),
    mineral: mineral ? { x: mineral.pos.x, y: mineral.pos.y } : undefined,
    anchor: options.anchor,
    existingStructures,
    existingConstructionSites
  };
}

export function planRoomBlueprintFromRoom(
  room: Room,
  targetRcl = room.controller?.level ?? 1,
  options: BlueprintPlannerOptions = {}
): BlueprintPlan {
  return planRoomBlueprint(createBlueprintFactsFromRoom(room, targetRcl, options), targetRcl, options);
}

export function blueprintFromPlan(plan: BlueprintPlan): Blueprint {
  return {
    name: `${PLAN_VERSION}-rcl-${plan.rcl}`,
    rcl: plan.rcl,
    anchor: { x: plan.anchor.x, y: plan.anchor.y },
    structures: plan.structures.map(structure => ({
      x: structure.x - plan.anchor.x,
      y: structure.y - plan.anchor.y,
      structureType: structure.structureType
    })),
    roads: plan.roads.map(road => ({ x: road.x - plan.anchor.x, y: road.y - plan.anchor.y })),
    ramparts: plan.ramparts.map(rampart => ({ x: rampart.x - plan.anchor.x, y: rampart.y - plan.anchor.y })),
    type: "dynamic",
    minSpaceRadius: 3
  };
}
