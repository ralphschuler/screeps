/**
 * Cached Movement Wrapper
 * 
 * Provides high-level movement functions with automatic path caching.
 * Reduces CPU usage by ~90% for repetitive movement patterns.
 * 
 * Performance Impact (from audit):
 * - Uncached moveTo: ~0.5-1.0 CPU per call
 * - Cached path reuse: ~0.05 CPU per call
 * - Expected savings: 80-90% with good cache hit rate
 */

import { getCachedPath, cachePath, convertRoomPositionsToPathSteps } from "../../cache";
import { pathfindingMetrics, trackPathfindingCall } from "@ralphschuler/screeps-stats";
import type { MoveToOpts } from "screeps-cartographer";

/**
 * Cached moveTo with automatic path caching and reuse.
 * 
 * This function provides intelligent path caching for repetitive movement:
 * 1. Checks cache for existing path
 * 2. If found and valid, uses moveByPath (very low CPU)
 * 3. If not found, calculates new path and caches it
 * 4. Automatically tracks metrics for monitoring
 * 
 * @param creep - The creep to move
 * @param target - Target position or object with pos
 * @param options - Movement options (range, reusePath, etc.)
 * @returns Movement result code
 * 
 * @example
 * ```typescript
 * // Simple movement with caching
 * cachedMoveTo(creep, source);
 * 
 * // With range specification
 * cachedMoveTo(creep, controller, { range: 3 });
 * 
 * // With custom TTL
 * cachedMoveTo(creep, target, { cacheTtl: 100 });
 * ```
 */
export function cachedMoveTo(
  creep: Creep,
  target: RoomPosition | { pos: RoomPosition },
  options: MoveToOpts & { cacheTtl?: number } = {}
): ScreepsReturnCode {
  const targetPos = target instanceof RoomPosition ? target : target.pos;
  const { cacheTtl, ...moveOptions } = options;
  
  // Try to get cached path
  const cachedPathSteps = getCachedPath(creep.pos, targetPos);
  
  if (cachedPathSteps && cachedPathSteps.length > 0) {
    // Validate path is still reasonable (creep is near first step or on path)
    const firstStep = cachedPathSteps[0];
    const isNearPath = creep.pos.getRangeTo(firstStep.x, firstStep.y) <= 1;
    
    if (isNearPath) {
      // Use cached path
      return trackPathfindingCall('moveByPath', true, () => {
        return creep.moveByPath(cachedPathSteps);
      });
    }
  }
  
  // Cache miss - calculate new path
  return trackPathfindingCall('moveTo', false, () => {
    const result = creep.moveTo(targetPos, {
      ...moveOptions,
      reusePath: moveOptions.reusePath ?? 50 // Default to longer reuse
    });
    
    // If movement succeeded, try to cache the path
    if (result === OK || result === ERR_TIRED) {
      // Extract path from creep memory (set by moveTo with reusePath)
      const moveData = creep.memory._move as { path?: string } | undefined;
      if (moveData?.path) {
        try {
          const pathSteps = Room.deserializePath(moveData.path);
          if (pathSteps.length > 0) {
            cachePath(creep.pos, targetPos, pathSteps, { ttl: cacheTtl });
          }
        } catch (err) {
          // Path deserialization failed, ignore
        }
      }
    }
    
    return result;
  });
}

/**
 * High-performance PathFinder.search with automatic caching.
 * 
 * Use this for custom pathfinding that needs more control than moveTo,
 * while still benefiting from path caching.
 * 
 * @param from - Start position
 * @param goal - Goal position and range
 * @param options - PathFinder options
 * @param cacheOptions - Cache TTL options
 * @returns PathFinder result with path
 * 
 * @example
 * ```typescript
 * const result = cachedPathFinderSearch(
 *   spawn.pos,
 *   { pos: source.pos, range: 1 },
 *   { plainCost: 2, swampCost: 10 },
 *   { ttl: 100 }
 * );
 * ```
 */
export function cachedPathFinderSearch(
  from: RoomPosition,
  goal: { pos: RoomPosition; range: number },
  options: PathFinderOpts = {},
  cacheOptions: { ttl?: number } = {}
): PathFinderPath {
  // Try cache first
  const cachedPathSteps = getCachedPath(from, goal.pos);
  
  if (cachedPathSteps && cachedPathSteps.length > 0) {
    // Return cached result in PathFinder format
    return trackPathfindingCall('pathFinderSearch', true, () => {
      // Convert PathSteps back to RoomPositions for PathFinder result
      const path: RoomPosition[] = cachedPathSteps.map(step => 
        new RoomPosition(step.x, step.y, goal.pos.roomName)
      );
      
      return {
        path,
        ops: 0, // Cached, no ops used
        cost: cachedPathSteps.length,
        incomplete: false
      };
    });
  }
  
  // Cache miss - calculate path
  return trackPathfindingCall('pathFinderSearch', false, () => {
    const result = PathFinder.search(from, goal, options);
    
    // Cache successful paths
    if (!result.incomplete && result.path.length > 0) {
      const pathSteps = convertRoomPositionsToPathSteps(result.path);
      cachePath(from, goal.pos, pathSteps, cacheOptions);
    }
    
    return result;
  });
}
