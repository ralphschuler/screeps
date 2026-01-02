/**
 * Movement utilities stub for roles package
 */

import { moveTo as cartographerMoveTo } from "screeps-cartographer";

export interface ExtendedMoveToOpts extends MoveToOpts {
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
