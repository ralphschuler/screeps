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
 * Log a safe find error with consistent formatting.
 */
function logSafeFindError(method: string, findType: number, location: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`[SafeFind] WARN: SafeFind error in ${method}(${String(findType)}) at ${location}: ${message}`);
}

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
    logSafeFindError("room.find", type, room.name, error);
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
    logSafeFindError("pos.findClosestByRange", type, `${pos.roomName}:${String(pos.x)},${String(pos.y)}`, error);
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
    logSafeFindError("pos.findInRange", type, `${pos.roomName}:${String(pos.x)},${String(pos.y)}`, error);
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
    logSafeFindError("pos.findClosestByPath", type, `${pos.roomName}:${String(pos.x)},${String(pos.y)}`, error);
    return null;
  }
}
