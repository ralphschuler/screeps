/**
 * Safe Find Utilities
 *
 * Provides wrapper functions for Room.find() and RoomPosition.find*() methods
 * that gracefully handle engine errors caused by corrupted game objects.
 *
 * The Screeps engine can throw "TypeError: Cannot read property 'username' of undefined"
 * when constructing OwnedStructure objects with corrupted owner data (e.g., some
 * invader cores or structures on private servers with database issues).
 *
 * These utilities catch such errors and return empty results, allowing the bot
 * to continue operating even when encountering corrupted game data.
 */

/**
 * Safely execute Room.find() with error handling.
 * Returns empty array if the engine throws an error during find.
 */
export function safeFind<T extends FindConstant>(
  room: Room,
  type: T,
  opts?: FilterOptions<T>
): FindTypes[T][] {
  try {
    return room.find(type, opts);
  } catch (error) {
    // Log the error for debugging but don't crash
    console.log(
      `[SafeFind] Error in room.find(${String(type)}) for room ${room.name}: ${error instanceof Error ? error.message : String(error)}`
    );
    return [];
  }
}

/**
 * Safely execute RoomPosition.findClosestByRange() with error handling.
 * Returns null if the engine throws an error during find.
 */
export function safeFindClosestByRange<T extends FindConstant>(
  pos: RoomPosition,
  type: T,
  opts?: FilterOptions<T>
): FindTypes[T] | null {
  try {
    return pos.findClosestByRange(type, opts);
  } catch (error) {
    console.log(
      `[SafeFind] Error in pos.findClosestByRange(${String(type)}) at ${pos.roomName}:${String(pos.x)},${String(pos.y)}: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Safely execute RoomPosition.findInRange() with error handling.
 * Returns empty array if the engine throws an error during find.
 */
export function safeFindInRange<T extends FindConstant>(
  pos: RoomPosition,
  type: T,
  range: number,
  opts?: FilterOptions<T>
): FindTypes[T][] {
  try {
    return pos.findInRange(type, range, opts);
  } catch (error) {
    console.log(
      `[SafeFind] Error in pos.findInRange(${String(type)}, ${String(range)}) at ${pos.roomName}:${String(pos.x)},${String(pos.y)}: ${error instanceof Error ? error.message : String(error)}`
    );
    return [];
  }
}

/**
 * Safely execute RoomPosition.findClosestByPath() with error handling.
 * Returns null if the engine throws an error during find.
 */
export function safeFindClosestByPath<T extends FindConstant>(
  pos: RoomPosition,
  type: T,
  opts?: FindPathOpts & FilterOptions<T>
): FindTypes[T] | null {
  try {
    return pos.findClosestByPath(type, opts);
  } catch (error) {
    console.log(
      `[SafeFind] Error in pos.findClosestByPath(${String(type)}) at ${pos.roomName}:${String(pos.x)},${String(pos.y)}: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
