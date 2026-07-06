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

import { createLogger } from "@ralphschuler/screeps-core";
import { eventBus as defaultEventBus } from "@ralphschuler/screeps-kernel";
import { cacheCoherence, CacheCoherenceManager, InvalidationScope } from "./CacheCoherence";

const logger = createLogger("CacheEvents");

const CacheEventPriority = {
  CRITICAL: 100,
  HIGH: 75,
  NORMAL: 50
} as const;

interface CacheRuntimeEventMap {
  "creep.died": {
    creepName: string;
  };
  "structure.destroyed": {
    roomName: string;
    structureType: StructureConstant;
    structureId: string;
  };
  "construction.complete": {
    roomName: string;
    structureType: StructureConstant;
  };
  "hostile.detected": {
    roomName: string;
  };
  "hostile.cleared": {
    roomName: string;
  };
  "remote.lost": {
    remoteRoom: string;
  };
  "spawn.completed": {
    roomName: string;
  };
  "rcl.upgrade": {
    roomName: string;
    newLevel: number;
  };
}

type CacheRuntimeEventName = keyof CacheRuntimeEventMap;
type CacheRuntimeEventHandler<T extends CacheRuntimeEventName> = (event: CacheRuntimeEventMap[T]) => void;

export interface CacheEventBusPort {
  on<T extends CacheRuntimeEventName>(
    eventName: T,
    handler: CacheRuntimeEventHandler<T>,
    options?: {
      priority?: number;
      minBucket?: number;
      once?: boolean;
    }
  ): unknown;
}

export interface CacheEventInitializationOptions {
  /** Runtime event bus to subscribe to. Defaults to the kernel event bus. */
  eventBus?: CacheEventBusPort;
  /** Cache coherence manager to invalidate. Defaults to the shared cache coherence manager. */
  coherenceManager?: CacheCoherenceManager;
}

const initializedCoherenceManagersByBus = new WeakMap<CacheEventBusPort, WeakSet<CacheCoherenceManager>>();

function isInitialized(eventBus: CacheEventBusPort, coherenceManager: CacheCoherenceManager): boolean {
  return initializedCoherenceManagersByBus.get(eventBus)?.has(coherenceManager) ?? false;
}

function markInitialized(eventBus: CacheEventBusPort, coherenceManager: CacheCoherenceManager): void {
  let initializedManagers = initializedCoherenceManagersByBus.get(eventBus);
  if (!initializedManagers) {
    initializedManagers = new WeakSet<CacheCoherenceManager>();
    initializedCoherenceManagersByBus.set(eventBus, initializedManagers);
  }

  initializedManagers.add(coherenceManager);
}

/**
 * Initialize event handlers for cache invalidation.
 * Call this once during bot initialization.
 */
export function initializeCacheEvents(options: CacheEventInitializationOptions = {}): void {
  const runtimeEventBus = options.eventBus ?? defaultEventBus;
  const coherenceManager = options.coherenceManager ?? cacheCoherence;

  if (isInitialized(runtimeEventBus, coherenceManager)) {
    logger.debug("Cache event handlers already initialized");
    return;
  }

  // Creep died - invalidate creep-related caches
  runtimeEventBus.on(
    "creep.died",
    (event) => {
      const scope: InvalidationScope = {
        type: "creep",
        creepName: event.creepName,
        namespaces: ["object", "role", "closest"]
      };
      
      const invalidated = coherenceManager.invalidate(scope);
      
      if (invalidated > 0) {
        logger.debug(
          `Invalidated ${invalidated} cache entries for died creep ${event.creepName}`
        );
      }
    },
    { priority: CacheEventPriority.HIGH }
  );

  // Structure destroyed - invalidate structure and path caches
  runtimeEventBus.on(
    "structure.destroyed",
    (event) => {
      const { roomName, structureType, structureId } = event;
      
      // Invalidate the specific structure
      const objectScope: InvalidationScope = {
        type: "object",
        objectId: structureId,
        namespaces: ["object"]
      };
      coherenceManager.invalidate(objectScope);
      
      // Invalidate paths in the room (structure may have blocked paths)
      const pathScope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["path"]
      };
      coherenceManager.invalidate(pathScope);
      
      // Invalidate find caches for this structure type
      const structureScope: InvalidationScope = {
        type: "structure",
        roomName,
        structureType,
        namespaces: ["roomFind"]
      };
      const invalidated = coherenceManager.invalidate(structureScope);
      
      logger.debug(
        `Invalidated caches for destroyed ${structureType} in ${roomName}`,
        { meta: { invalidated, structureType, roomName } }
      );
    },
    { priority: CacheEventPriority.HIGH }
  );

  // Construction complete - invalidate room and path caches
  runtimeEventBus.on(
    "construction.complete",
    (event) => {
      const { roomName, structureType } = event;
      
      // Invalidate paths (new structure may block or enable new paths)
      const pathScope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["path"]
      };
      coherenceManager.invalidate(pathScope);
      
      // Invalidate room find caches
      const findScope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["roomFind"]
      };
      const invalidated = coherenceManager.invalidate(findScope);
      
      logger.debug(
        `Invalidated caches for completed ${structureType} in ${roomName}`,
        { meta: { invalidated, structureType, roomName } }
      );
    },
    { priority: CacheEventPriority.NORMAL }
  );

  // Hostile detected - invalidate closest and room find caches
  runtimeEventBus.on(
    "hostile.detected",
    (event) => {
      const { roomName } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["closest", "roomFind"]
      };
      
      const invalidated = coherenceManager.invalidate(scope);
      
      logger.debug(
        `Invalidated ${invalidated} cache entries for hostile in ${roomName}`,
        { meta: { invalidated, roomName } }
      );
    },
    { priority: CacheEventPriority.CRITICAL }
  );

  // Hostile cleared - invalidate closest and room find caches
  runtimeEventBus.on(
    "hostile.cleared",
    (event) => {
      const { roomName } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["closest", "roomFind"]
      };
      
      coherenceManager.invalidate(scope);
    },
    { priority: CacheEventPriority.NORMAL }
  );

  // Remote room lost - invalidate all caches for that room
  runtimeEventBus.on(
    "remote.lost",
    (event) => {
      const { remoteRoom } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName: remoteRoom
      };
      
      const invalidated = coherenceManager.invalidate(scope);
      
      logger.info(
        `Invalidated ${invalidated} cache entries for lost remote ${remoteRoom}`,
        { meta: { invalidated, remoteRoom } }
      );
    },
    { priority: CacheEventPriority.NORMAL }  // Match default priority from events.ts
  );

  // Spawn completed - invalidate role caches
  runtimeEventBus.on(
    "spawn.completed",
    (event) => {
      const { roomName } = event;
      
      // Invalidate room-level role caches (new creep may change role assignments)
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["role"]
      };
      
      coherenceManager.invalidate(scope);
    },
    { priority: CacheEventPriority.NORMAL }
  );

  // RCL upgrade - invalidate room caches (new structures may be available)
  runtimeEventBus.on(
    "rcl.upgrade",
    (event) => {
      const { roomName } = event;
      
      const scope: InvalidationScope = {
        type: "room",
        roomName,
        namespaces: ["roomFind", "path"]
      };
      
      const invalidated = coherenceManager.invalidate(scope);
      
      logger.info(
        `Invalidated ${invalidated} cache entries for RCL upgrade in ${roomName}`,
        { meta: { invalidated, roomName, newLevel: event.newLevel } }
      );
    },
    { priority: CacheEventPriority.NORMAL }
  );

  markInitialized(runtimeEventBus, coherenceManager);
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
