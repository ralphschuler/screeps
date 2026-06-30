import { positionKey } from "./candidates";
import type { PlannedLinkPlacement, PlannedLinkRole } from "./types";

/** Return the exact planned role for a position from an already-built plan. */
export function findPlannedLinkRole(
  placements: PlannedLinkPlacement[],
  pos: RoomPosition
): PlannedLinkRole | undefined {
  const key = positionKey(pos.x, pos.y);
  return placements.find(placement => positionKey(placement.x, placement.y) === key)?.role;
}

/** Built link structures in the room, narrowed from the generic structure find. */
export function findBuiltLinks(room: Room): StructureLink[] {
  return room.find(FIND_MY_STRUCTURES, {
    filter: structure => structure.structureType === STRUCTURE_LINK
  }) as StructureLink[];
}

/**
 * Classify a link by functional range when it is not on an exact planned tile.
 *
 * Receiver checks match LinkManager priority before falling back to source
 * senders, so cleanup protects useful legacy layouts without reclassifying a
 * planned source link that happens to sit near storage.
 */
export function classifyLinkByFunctionalRange(room: Room, link: StructureLink): PlannedLinkRole | undefined {
  if (room.controller && link.pos.getRangeTo(room.controller) <= 2) return "controller";
  if (room.storage && link.pos.getRangeTo(room.storage) <= 2) return "storage";
  if (room.find(FIND_MY_SPAWNS).some(spawn => link.pos.getRangeTo(spawn) <= 2)) return "spawn";
  if (room.find(FIND_SOURCES).some(source => link.pos.getRangeTo(source) <= 2)) return "source";
  return undefined;
}
