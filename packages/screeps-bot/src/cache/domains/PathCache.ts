/**
 * Path Cache - Domain wrapper for unified cache
 *
 * Caches pathfinding results to reduce CPU cost.
 */

import { globalCache } from "../CacheManager";

const NAMESPACE = "path";
const MAX_CACHE_SIZE = 1000;

/**
 * Generate cache key for a route
 */
function getCacheKey(from: RoomPosition, to: RoomPosition): string {
  return `${from.roomName}:${from.x},${from.y}:${to.roomName}:${to.x},${to.y}`;
}

/**
 * Get a cached path
 */
export function getCachedPath(from: RoomPosition, to: RoomPosition): PathStep[] | null {
  const key = getCacheKey(from, to);
  const serialized = globalCache.get<string>(key, { namespace: NAMESPACE });
  
  if (!serialized) return null;
  
  try {
    return Room.deserializePath(serialized);
  } catch {
    globalCache.invalidate(key, NAMESPACE);
    return null;
  }
}

/**
 * Convert RoomPosition[] to PathStep[]
 */
export function convertRoomPositionsToPathSteps(positions: RoomPosition[]): PathStep[] {
  const steps: PathStep[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const prevPos = i > 0 ? positions[i - 1] : null;
    
    let direction: DirectionConstant = TOP;
    let dx = 0;
    let dy = 0;
    
    if (prevPos && prevPos.roomName === pos.roomName) {
      dx = pos.x - prevPos.x;
      dy = pos.y - prevPos.y;
      
      if (dy === -1 && dx === 0) direction = TOP;
      else if (dy === -1 && dx === 1) direction = TOP_RIGHT;
      else if (dy === 0 && dx === 1) direction = RIGHT;
      else if (dy === 1 && dx === 1) direction = BOTTOM_RIGHT;
      else if (dy === 1 && dx === 0) direction = BOTTOM;
      else if (dy === 1 && dx === -1) direction = BOTTOM_LEFT;
      else if (dy === 0 && dx === -1) direction = LEFT;
      else if (dy === -1 && dx === -1) direction = TOP_LEFT;
    }
    
    steps.push({ x: pos.x, y: pos.y, dx, dy, direction });
  }
  
  return steps;
}

/**
 * Cache a path
 */
export function cachePath(
  from: RoomPosition,
  to: RoomPosition,
  path: PathStep[],
  options: { ttl?: number } = {}
): void {
  const key = getCacheKey(from, to);
  const serialized = Room.serializePath(path);
  
  globalCache.set(key, serialized, {
    namespace: NAMESPACE,
    ttl: options.ttl,
    maxSize: MAX_CACHE_SIZE
  });
}

/**
 * Invalidate a path
 */
export function invalidatePath(from: RoomPosition, to: RoomPosition): void {
  const key = getCacheKey(from, to);
  globalCache.invalidate(key, NAMESPACE);
}

/**
 * Invalidate all paths in a room
 */
export function invalidateRoom(roomName: string): void {
  const pattern = new RegExp(`^${roomName}:|:${roomName}:`);
  globalCache.invalidatePattern(pattern, NAMESPACE);
}

/**
 * Clear all paths
 */
export function clearPathCache(): void {
  globalCache.clear(NAMESPACE);
}

/**
 * Get cache statistics
 */
export function getPathCacheStats() {
  const stats = globalCache.getCacheStats(NAMESPACE);
  return {
    size: stats.size,
    maxSize: MAX_CACHE_SIZE,
    hits: stats.hits,
    misses: stats.misses,
    evictions: stats.evictions,
    hitRate: stats.hitRate
  };
}

/**
 * Cleanup expired paths
 */
export function cleanupExpiredPaths(): void {
  globalCache.cleanup();
}

/**
 * Cache common routes for a room
 */
export function cacheCommonRoutes(room: Room): void {
  if (!room.controller?.my) return;

  const storage = room.storage;
  if (!storage) return;

  const sources = room.find(FIND_SOURCES);
  for (const source of sources) {
    const pathToSource = room.findPath(storage.pos, source.pos, {
      ignoreCreeps: true,
      serialize: false
    });
    if (pathToSource.length > 0) {
      cachePath(storage.pos, source.pos, pathToSource);
      cachePath(source.pos, storage.pos, pathToSource);
    }
  }

  if (room.controller) {
    const pathToController = room.findPath(storage.pos, room.controller.pos, {
      ignoreCreeps: true,
      range: 3,
      serialize: false
    });
    if (pathToController.length > 0) {
      cachePath(storage.pos, room.controller.pos, pathToController);
    }
  }
}

// Re-export interface for compatibility
export interface CachePathOptions {
  ttl?: number;
}
