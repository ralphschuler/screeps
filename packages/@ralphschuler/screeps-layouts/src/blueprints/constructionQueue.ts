import type { BlueprintPlan, BlueprintPoint } from "./types";
import { STRUCTURE_TYPES } from "./definitions/rcl-plan";

export type ConstructionPriority = "P0" | "P1" | "P2" | "P3" | "P4";

export interface BlueprintConstructionItem extends BlueprintPoint {
  structureType: BuildableStructureConstant;
  minRcl: number;
  priority: ConstructionPriority;
  score: number;
  source: string;
}

export interface ConstructionQueueOptions {
  existingStructureKeys?: Set<string>;
  existingSiteKeys?: Set<string>;
  currentRcl?: number;
  maxItems?: number;
}

function itemKey(item: Pick<BlueprintConstructionItem, "x" | "y" | "structureType">): string {
  return `${item.structureType}:${item.x},${item.y}`;
}

function priorityForStructure(structureType: BuildableStructureConstant): ConstructionPriority {
  switch (structureType) {
    case STRUCTURE_TYPES.spawn:
    case STRUCTURE_TYPES.container:
      return "P0";
    case STRUCTURE_TYPES.storage:
    case STRUCTURE_TYPES.extension:
    case STRUCTURE_TYPES.link:
      return "P1";
    case STRUCTURE_TYPES.tower:
    case STRUCTURE_TYPES.rampart:
      return "P2";
    case STRUCTURE_TYPES.terminal:
    case STRUCTURE_TYPES.lab:
    case STRUCTURE_TYPES.extractor:
    case STRUCTURE_TYPES.factory:
      return "P3";
    default:
      return "P4";
  }
}

function priorityScore(priority: ConstructionPriority): number {
  switch (priority) {
    case "P0": return 500;
    case "P1": return 400;
    case "P2": return 300;
    case "P3": return 200;
    case "P4": return 100;
  }
}

export function buildConstructionQueue(plan: BlueprintPlan, options: ConstructionQueueOptions = {}): BlueprintConstructionItem[] {
  const currentRcl = options.currentRcl ?? plan.rcl;
  const existingStructureKeys = options.existingStructureKeys ?? new Set<string>();
  const existingSiteKeys = options.existingSiteKeys ?? new Set<string>();
  const queue: BlueprintConstructionItem[] = [];

  for (const structure of plan.structures) {
    if (structure.minRcl > currentRcl) continue;
    const item: BlueprintConstructionItem = {
      x: structure.x,
      y: structure.y,
      structureType: structure.structureType,
      minRcl: structure.minRcl,
      priority: priorityForStructure(structure.structureType),
      score: priorityScore(priorityForStructure(structure.structureType)) + structure.priority,
      source: structure.source
    };
    if (existingStructureKeys.has(itemKey(item)) || existingSiteKeys.has(itemKey(item))) continue;
    queue.push(item);
  }

  for (const road of plan.roads) {
    if (road.minRcl > currentRcl) continue;
    const item: BlueprintConstructionItem = {
      x: road.x,
      y: road.y,
      structureType: STRUCTURE_TYPES.road,
      minRcl: road.minRcl,
      priority: "P1",
      score: 360 + road.priority,
      source: road.source
    };
    if (existingStructureKeys.has(itemKey(item)) || existingSiteKeys.has(itemKey(item))) continue;
    queue.push(item);
  }

  for (const rampart of plan.ramparts) {
    if (rampart.minRcl > currentRcl) continue;
    const item: BlueprintConstructionItem = {
      x: rampart.x,
      y: rampart.y,
      structureType: STRUCTURE_TYPES.rampart,
      minRcl: rampart.minRcl,
      priority: "P2",
      score: 300 + rampart.priority,
      source: rampart.source
    };
    if (existingStructureKeys.has(itemKey(item)) || existingSiteKeys.has(itemKey(item))) continue;
    queue.push(item);
  }

  queue.sort((a, b) => b.score - a.score || a.structureType.localeCompare(b.structureType));
  return typeof options.maxItems === "number" ? queue.slice(0, options.maxItems) : queue;
}

function roomExistingKeys(room: Room): { structures: Set<string>; sites: Set<string> } {
  const structures = new Set<string>();
  const sites = new Set<string>();

  for (const structure of room.find(FIND_STRUCTURES)) {
    structures.add(`${structure.structureType}:${structure.pos.x},${structure.pos.y}`);
  }
  for (const site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
    sites.add(`${site.structureType}:${site.pos.x},${site.pos.y}`);
  }

  return { structures, sites };
}

export function issueConstructionSites(room: Room, plan: BlueprintPlan, maxSitesPerTick = 3): number {
  const globalSiteCap = typeof MAX_CONSTRUCTION_SITES === "undefined" ? 100 : MAX_CONSTRUCTION_SITES;
  const globalExistingSites = typeof Game === "undefined" ? 0 : Object.keys(Game.constructionSites).length;
  if (globalExistingSites >= globalSiteCap) return 0;

  const existing = roomExistingKeys(room);
  // Build the full queue: the highest-scoring planned tiles can be rejected by
  // live Screeps validation, so slicing to maxSitesPerTick candidates can starve
  // lower-scored mandatory structures such as extension fallback sites.
  const queue = buildConstructionQueue(plan, {
    existingStructureKeys: existing.structures,
    existingSiteKeys: existing.sites,
    currentRcl: room.controller?.level ?? plan.rcl
  });

  let created = 0;
  for (const item of queue) {
    if (created >= maxSitesPerTick || globalExistingSites + created >= globalSiteCap) break;
    if ((room.controller?.level ?? plan.rcl) < item.minRcl) continue;

    const result = room.createConstructionSite(item.x, item.y, item.structureType);
    if (result === OK) created++;
    if (result === ERR_RCL_NOT_ENOUGH || result === ERR_INVALID_TARGET || result === ERR_INVALID_ARGS) continue;
  }

  return created;
}
