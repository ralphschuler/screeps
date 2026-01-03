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

export function safeFindClosestByRange<T extends FindConstant>(
  pos: RoomPosition,
  type: T,
  filter?: FilterOptions<T>
): FindTypes[T] | null {
  try {
    const room = Game.rooms[pos.roomName];
    if (!room) return null;
    const targets = room.find(type, filter);
    if (targets.length === 0) return null;
    return pos.findClosestByRange(targets);
  } catch (error) {
    console.log(`Error in safeFindClosestByRange: ${error}`);
    return null;
  }
}
