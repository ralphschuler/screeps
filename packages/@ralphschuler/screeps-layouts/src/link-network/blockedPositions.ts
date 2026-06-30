import { positionKey } from "./candidates";

/**
 * Tiles unavailable for new dynamic link placement.
 *
 * Existing links are intentionally not blocked: the planner must still be able
 * to recognize and protect already-built functional links at exact planned
 * positions during blueprint cleanup.
 */
export function collectBlockedPositions(room: Room): Set<string> {
  const blocked = new Set<string>();
  const structures = room.find(FIND_STRUCTURES);

  for (const structure of structures) {
    if (structure.structureType === STRUCTURE_LINK) continue;
    blocked.add(positionKey(structure.pos.x, structure.pos.y));
  }

  for (const site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
    blocked.add(positionKey(site.pos.x, site.pos.y));
  }

  return blocked;
}

/** Existing built/planned link tiles that should not receive duplicate sites. */
export function collectOccupiedLinkPositions(
  links: StructureLink[],
  linkSites: Array<ConstructionSite<STRUCTURE_LINK>>
): Set<string> {
  return new Set<string>([
    ...links.map(link => positionKey(link.pos.x, link.pos.y)),
    ...linkSites.map(site => positionKey(site.pos.x, site.pos.y))
  ]);
}
