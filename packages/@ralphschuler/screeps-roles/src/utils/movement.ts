/**
 * Movement utilities stub for roles package
 */

import { moveTo as cartographerMoveTo } from "screeps-cartographer";

export function cachedMoveTo(
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  opts?: MoveToOpts
): ScreepsReturnCode {
  return cartographerMoveTo(creep, target, opts);
}
