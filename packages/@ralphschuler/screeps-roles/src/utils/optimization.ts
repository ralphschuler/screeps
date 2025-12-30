/**
 * Optimization utilities stub for roles package
 */

export function safeFind<T extends FindConstant>(
  room: Room,
  type: T,
  filter?: FilterOptions<T>
): FindTypes[T][] {
  try {
    return room.find(type, filter);
  } catch (error) {
    console.log(`Error in safeFind: ${error}`);
    return [];
  }
}

export function safeFindClosestByRange<T extends _HasRoomPosition>(
  pos: RoomPosition,
  targets: T[]
): T | null {
  if (targets.length === 0) return null;
  return pos.findClosestByRange(targets);
}
