import { getStructureLimits } from "../constants";

export const MIN_RCL = 1;
export const MAX_RCL = 8;

export const STRUCTURE_TYPES = {
  spawn: "spawn" as BuildableStructureConstant,
  extension: "extension" as BuildableStructureConstant,
  road: "road" as BuildableStructureConstant,
  rampart: "rampart" as BuildableStructureConstant,
  constructedWall: "constructedWall" as BuildableStructureConstant,
  container: "container" as BuildableStructureConstant,
  tower: "tower" as BuildableStructureConstant,
  storage: "storage" as BuildableStructureConstant,
  link: "link" as BuildableStructureConstant,
  terminal: "terminal" as BuildableStructureConstant,
  extractor: "extractor" as BuildableStructureConstant,
  lab: "lab" as BuildableStructureConstant,
  factory: "factory" as BuildableStructureConstant,
  nuker: "nuker" as BuildableStructureConstant,
  observer: "observer" as BuildableStructureConstant,
  powerSpawn: "powerSpawn" as BuildableStructureConstant
};

export const MANDATORY_BLUEPRINT_STRUCTURE_TYPES: BuildableStructureConstant[] = [
  STRUCTURE_TYPES.spawn,
  STRUCTURE_TYPES.extension,
  STRUCTURE_TYPES.tower,
  STRUCTURE_TYPES.storage,
  STRUCTURE_TYPES.link,
  STRUCTURE_TYPES.terminal,
  STRUCTURE_TYPES.extractor,
  STRUCTURE_TYPES.lab,
  STRUCTURE_TYPES.factory,
  STRUCTURE_TYPES.nuker,
  STRUCTURE_TYPES.observer,
  STRUCTURE_TYPES.powerSpawn
];

export const OPTIONAL_BLUEPRINT_STRUCTURE_TYPES: BuildableStructureConstant[] = [STRUCTURE_TYPES.container];

export function normalizeRcl(rcl: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  const normalized = Math.min(MAX_RCL, Math.max(MIN_RCL, Math.floor(Number.isFinite(rcl) ? rcl : MIN_RCL)));
  return normalized as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export function getControllerStructureLimits(rcl: number): Partial<Record<BuildableStructureConstant, number>> {
  const level = normalizeRcl(rcl);

  if (typeof CONTROLLER_STRUCTURES !== "undefined") {
    const limits: Partial<Record<BuildableStructureConstant, number>> = {};
    for (const structureType of Object.keys(CONTROLLER_STRUCTURES) as BuildableStructureConstant[]) {
      limits[structureType] = CONTROLLER_STRUCTURES[structureType]?.[level] ?? 0;
    }
    return limits;
  }

  return getStructureLimits(level);
}

export function getMandatoryStructureTargets(rcl: number): Partial<Record<BuildableStructureConstant, number>> {
  const limits = getControllerStructureLimits(rcl);
  const targets: Partial<Record<BuildableStructureConstant, number>> = {};

  for (const structureType of MANDATORY_BLUEPRINT_STRUCTURE_TYPES) {
    const limit = limits[structureType] ?? 0;
    if (limit > 0) targets[structureType] = limit;
  }

  return targets;
}

export function getStructureTarget(
  structureType: BuildableStructureConstant,
  rcl: number,
  includeOptional = true
): number {
  const limits = getControllerStructureLimits(rcl);
  const target = limits[structureType] ?? 0;
  if (includeOptional || MANDATORY_BLUEPRINT_STRUCTURE_TYPES.includes(structureType)) return target;
  return 0;
}
