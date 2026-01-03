/**
 * Common utilities stub for roles package
 */

import type { SwarmState } from "../memory/schemas";

export function getCollectionPoint(room: Room, swarmState?: SwarmState): RoomPosition | null {
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
  cacheKey?: string,
  opts?: { filter?: (target: T) => boolean }
): T | null {
  let filtered = targets;
  if (opts?.filter) {
    filtered = targets.filter(opts.filter);
  }
  if (filtered.length === 0) return null;
  return creep.pos.findClosestByPath(filtered) as T | null;
}
