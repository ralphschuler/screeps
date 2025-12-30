/**
 * Common utilities stub for roles package
 */

export function getCollectionPoint(room: Room): RoomPosition | null {
  // Return storage position if available, otherwise controller
  if (room.storage) {
    return room.storage.pos;
  }
  if (room.controller) {
    return room.controller.pos;
  }
  return null;
}

export function findDistributedTarget<T extends _HasRoomPosition>(
  creep: Creep,
  targets: T[],
  opts?: { filter?: (target: T) => boolean }
): T | null {
  let filtered = targets;
  if (opts?.filter) {
    filtered = targets.filter(opts.filter);
  }
  if (filtered.length === 0) return null;
  return creep.pos.findClosestByPath(filtered) as T | null;
}
