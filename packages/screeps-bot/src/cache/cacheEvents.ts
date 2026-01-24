/**
 * Cache Event Integration
 *
 * Integrates the cache coherence manager with the event system to automatically
 * invalidate caches when game state changes, ensuring cache consistency.
 *
 * Event-based invalidation prevents stale cache data and improves correctness
 * while maintaining high cache hit rates.
 *
 * Implements 8 event handlers:
 * - creep.died, structure.destroyed, construction.complete
 * - hostile.detected, hostile.cleared, remote.lost
 * - spawn.completed, rcl.upgrade
 */

import { EventPriority, eventBus } from "../core/events";
import { createLogger } from "../core/logger";
import { InvalidationScope, cacheCoherence } from "./CacheCoherence";

const logger = createLogger("CacheEvents");

/**
 * Initialize event handlers for cache invalidation.
 * Call this once during bot initialization.
 */
export function initializeCacheEvents(): void {
  // Creep died - invalidate creep-related caches
  eventBus.on(
    "creep.died",
    (event) => {
      const scope: InvalidationScope = {
        type: "creep",
        creepName: event.creepName,
        namespaces: ["object", "role", "closest"]
      };
      
      const invalidated = cacheCoherence.invalidate(scope);
      
      if (invalidated > 0) {
        logger.debug(
          `Invalidated ${invalidated} cache entries for died creep ${event.creepName}`
        );
      }
    },
    { priority: EventPriority.HIGH }
  );

  // Structure destroyed - invalidate structure and path caches
  eventBus.on(
    "structure.destroyed",
    (event) => {
      const { roomName, structureType, structureId } = event;
      
      // Invalidate the specific structure
      const objectScope: InvalidationScope = {
        type: "object",
        objectId: structureId,
        namespaces: ["object"]
      };
      cacheCoherence.invalidate(objectScope);
      
      // Invalidate paths in the room (structure may have blocked paths)
      const pathScope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["path"]
      };
      cacheCoherence.invalidate(pathScope);
      
      // Invalidate find caches for this structure type
      const structureScope: InvalidationScope = {
        type: "structure",
        roomName,
        structureType,
        namespaces: ["roomFind"]
      };
      const invalidated = cacheCoherence.invalidate(structureScope);
      
      logger.debug(
        `Invalidated caches for destroyed ${structureType} in ${roomName}`,
        { meta: { invalidated, structureType, roomName } }
      );
    },
    { priority: EventPriority.HIGH }
  );

  // Construction complete - invalidate room and path caches
  eventBus.on(
    "construction.complete",
    (event) => {
      const { roomName, structureType } = event;
      
      // Invalidate paths (new structure may block or enable new paths)
      const pathScope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["path"]
      };
      cacheCoherence.invalidate(pathScope);
      
      // Invalidate room find caches
      const findScope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["roomFind"]
      };
      const invalidated = cacheCoherence.invalidate(findScope);
      
      logger.debug(
        `Invalidated caches for completed ${structureType} in ${roomName}`,
        { meta: { invalidated, structureType, roomName } }
      );
    },
    { priority: EventPriority.NORMAL }
  );

  // Hostile detected - invalidate closest and room find caches
  eventBus.on(
    "hostile.detected",
    (event) => {
      const { roomName } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["closest", "roomFind"]
      };
      
      const invalidated = cacheCoherence.invalidate(scope);
      
      logger.debug(
        `Invalidated ${invalidated} cache entries for hostile in ${roomName}`,
        { meta: { invalidated, roomName } }
      );
    },
    { priority: EventPriority.CRITICAL }
  );

  // Hostile cleared - invalidate closest and room find caches
  eventBus.on(
    "hostile.cleared",
    (event) => {
      const { roomName } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["closest", "roomFind"]
      };
      
      cacheCoherence.invalidate(scope);
    },
    { priority: EventPriority.NORMAL }
  );

  // Remote room lost - invalidate all caches for that room
  eventBus.on(
    "remote.lost",
    (event) => {
      const { remoteRoom } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName: remoteRoom
      };
      
      const invalidated = cacheCoherence.invalidate(scope);
      
      logger.info(
        `Invalidated ${invalidated} cache entries for lost remote ${remoteRoom}`,
        { meta: { invalidated, remoteRoom } }
      );
    },
    { priority: EventPriority.NORMAL }  // Match default priority from events.ts
  );

  // Spawn completed - invalidate role caches
  eventBus.on(
    "spawn.completed",
    (event) => {
      const { roomName } = event;
      
      // Invalidate room-level role caches (new creep may change role assignments)
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["role"]
      };
      
      cacheCoherence.invalidate(scope);
    },
    { priority: EventPriority.NORMAL }
  );

  // RCL upgrade - invalidate room caches (new structures may be available)
  eventBus.on(
    "rcl.upgrade",
    (event) => {
      const { roomName } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["roomFind", "path"]
      };
      
      const invalidated = cacheCoherence.invalidate(scope);
      
      logger.info(
        `Invalidated ${invalidated} cache entries for RCL upgrade in ${roomName}`,
        { meta: { invalidated, roomName, newLevel: event.newLevel } }
      );
    },
    { priority: EventPriority.NORMAL }
  );

  logger.info("Cache event handlers initialized");
}

/**
 * Invalidate caches for a room that became visible
 * Call this when room visibility changes
 */
export function invalidateRoomVisibility(roomName: string): void {
  const scope: InvalidationScope = {
    type: "room",
    roomName
  };
  
  const invalidated = cacheCoherence.invalidate(scope);
  
  logger.debug(
    `Invalidated ${invalidated} cache entries for room visibility change: ${roomName}`
  );
}

/**
 * Manually trigger cache cleanup
 * Useful for performance testing or explicit cleanup
 */
export function triggerCacheCleanup(): number {
  const cleaned = cacheCoherence.cleanup();
  
  if (cleaned > 0) {
    logger.debug(
      `Manual cache cleanup removed ${cleaned} entries`
    );
  }
  
  return cleaned;
}

/**
 * Get cache coherence statistics
 * Useful for monitoring and debugging
 */
export function getCacheCoherenceStats() {
  return cacheCoherence.getCacheStats();
}
