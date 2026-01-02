/**
 * Movement utilities stub for roles package
 * 
 * NOTE: This is a STUB that wraps screeps-cartographer.
 * ExtendedMoveToOpts adds cacheTtl which is used by the main bot but not
 * supported by cartographer, so we strip it out before passing to cartographer.
 */

import { moveTo as cartographerMoveTo } from "screeps-cartographer";

export interface ExtendedMoveToOpts extends MoveToOpts {
  /** Cache TTL in ticks - stripped before passing to cartographer */
  cacheTtl?: number;
}

export function cachedMoveTo(
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  opts?: ExtendedMoveToOpts
): ScreepsReturnCode {
  // Strip out cacheTtl since cartographer doesn't support it
  const { cacheTtl, ...cartographerOpts } = opts || {};
  return cartographerMoveTo(creep, target, cartographerOpts);
}
