/**
 * Shared construction-site priority policy for economy roles.
 *
 * Higher values are built first. Recovery rooms need defensive/economy anchors
 * before spending builder throughput on extension backlogs or perimeter polish.
 */
const DEFAULT_CONSTRUCTION_PRIORITY = 50;

export const CONSTRUCTION_PRIORITY: Partial<Record<BuildableStructureConstant, number>> = {
  [STRUCTURE_SPAWN]: 100,
  [STRUCTURE_TOWER]: 95,
  [STRUCTURE_STORAGE]: 90,
  [STRUCTURE_EXTENSION]: 80,
  [STRUCTURE_TERMINAL]: 75,
  [STRUCTURE_LINK]: 70,
  [STRUCTURE_CONTAINER]: 65,
  [STRUCTURE_RAMPART]: 55,
  [STRUCTURE_WALL]: 50,
  [STRUCTURE_ROAD]: 30
};

export function getConstructionPriority(site: Pick<ConstructionSite, "structureType">): number {
  return CONSTRUCTION_PRIORITY[site.structureType] ?? DEFAULT_CONSTRUCTION_PRIORITY;
}

export function compareConstructionSitePriority(a: ConstructionSite, b: ConstructionSite): number {
  return getConstructionPriority(b) - getConstructionPriority(a);
}
