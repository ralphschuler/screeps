/**
 * Room Find Optimizer - Centralized optimization layer for expensive API operations
 *
 * Provides intelligent caching for room.find() and Game.getObjectById() with:
 * - Bucket-aware TTL tuning (aggressive caching when bucket is low)
 * - Event-based cache invalidation
 * - Automatic delegation to unified cache system
 * - Performance metrics integration
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - CPU-Bucket-gesteuertes Verhalten (CPU-Bucket-driven behavior)
 * - Event-driven invalidation
 *
 * Usage:
 * ```typescript
 * import { roomFindOptimizer } from './core/roomFindOptimizer';
 *
 * // Instead of: room.find(FIND_MY_STRUCTURES)
 * const structures = roomFindOptimizer.find(room, FIND_MY_STRUCTURES);
 *
 * // Instead of: Game.getObjectById(id)
 * const obj = objectIdOptimizer.getById(id);
 * ```
 */

import {
  cachedRoomFind,
  getCachedObjectById,
  invalidateFindType,
  invalidateRoomCache
, invalidateStructureCache } from "@ralphschuler/screeps-cache";

// =============================================================================
// Types
// =============================================================================

/**
 * Room events that trigger cache invalidation
 */
export type RoomEvent =
  | "structure_built"
  | "structure_destroyed"
  | "creep_spawned"
  | "creep_died"
  | "construction_site_created"
  | "construction_site_removed"
  | "hostile_entered"
  | "hostile_left";

/**
 * Bucket thresholds for TTL tuning
 */
export interface BucketThresholds {
  /** Bucket below this: aggressive caching (long TTL) */
  low: number;
  /** Bucket above this: fresh data (short TTL) */
  high: number;
}

/**
 * TTL configuration per find type
 */
export interface TTLConfig {
  /** TTL when bucket is low */
  lowBucket: number;
  /** TTL when bucket is normal */
  normal: number;
  /** TTL when bucket is high */
  highBucket: number;
}

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_BUCKET_THRESHOLDS: BucketThresholds = {
  low: 2000,
  high: 8000
};

/**
 * Default TTL configurations for each find type (in ticks)
 */
const DEFAULT_TTL_CONFIG: Record<FindConstant, TTLConfig> = {
  // Structures change rarely - can cache longer
  [FIND_STRUCTURES]: { lowBucket: 100, normal: 50, highBucket: 20 },
  [FIND_MY_STRUCTURES]: { lowBucket: 100, normal: 50, highBucket: 20 },
  [FIND_HOSTILE_STRUCTURES]: { lowBucket: 50, normal: 20, highBucket: 10 },

  // Sources and minerals never change - very long cache
  [FIND_SOURCES_ACTIVE]: { lowBucket: 10000, normal: 5000, highBucket: 1000 },
  [FIND_SOURCES]: { lowBucket: 10000, normal: 5000, highBucket: 1000 },
  [FIND_MINERALS]: { lowBucket: 10000, normal: 5000, highBucket: 1000 },
  [FIND_DEPOSITS]: { lowBucket: 200, normal: 100, highBucket: 50 },

  // Construction sites change moderately
  [FIND_MY_CONSTRUCTION_SITES]: { lowBucket: 50, normal: 20, highBucket: 10 },
  [FIND_CONSTRUCTION_SITES]: { lowBucket: 50, normal: 20, highBucket: 10 },

  // Creeps move/die frequently - short cache
  [FIND_CREEPS]: { lowBucket: 10, normal: 5, highBucket: 3 },
  [FIND_MY_CREEPS]: { lowBucket: 10, normal: 5, highBucket: 3 },
  [FIND_HOSTILE_CREEPS]: { lowBucket: 10, normal: 3, highBucket: 1 },

  // Resources and tombstones
  [FIND_DROPPED_RESOURCES]: { lowBucket: 20, normal: 5, highBucket: 3 },
  [FIND_TOMBSTONES]: { lowBucket: 30, normal: 10, highBucket: 5 },
  [FIND_RUINS]: { lowBucket: 30, normal: 10, highBucket: 5 },

  // Other objects
  [FIND_FLAGS]: { lowBucket: 100, normal: 50, highBucket: 20 },
  [FIND_MY_SPAWNS]: { lowBucket: 200, normal: 100, highBucket: 50 },
  [FIND_HOSTILE_SPAWNS]: { lowBucket: 100, normal: 50, highBucket: 20 },
  [FIND_HOSTILE_CONSTRUCTION_SITES]: { lowBucket: 50, normal: 20, highBucket: 10 },
  [FIND_NUKES]: { lowBucket: 50, normal: 20, highBucket: 10 },
  [FIND_POWER_CREEPS]: { lowBucket: 20, normal: 10, highBucket: 5 },
  [FIND_MY_POWER_CREEPS]: { lowBucket: 20, normal: 10, highBucket: 5 },
  [FIND_HOSTILE_POWER_CREEPS]: { lowBucket: 20, normal: 10, highBucket: 5 },

  // Exit-related (rarely used but included for completeness)
  [FIND_EXIT_TOP]: { lowBucket: 1000, normal: 500, highBucket: 100 },
  [FIND_EXIT_RIGHT]: { lowBucket: 1000, normal: 500, highBucket: 100 },
  [FIND_EXIT_BOTTOM]: { lowBucket: 1000, normal: 500, highBucket: 100 },
  [FIND_EXIT_LEFT]: { lowBucket: 1000, normal: 500, highBucket: 100 },
  [FIND_EXIT]: { lowBucket: 1000, normal: 500, highBucket: 100 }
};

// =============================================================================
// Room Find Optimizer
// =============================================================================

/**
 * Centralized optimization layer for room.find() operations
 */
export class RoomFindOptimizer {
  private bucketThresholds: BucketThresholds;
  private ttlConfig: Record<FindConstant, TTLConfig>;

  constructor(
    bucketThresholds: BucketThresholds = DEFAULT_BUCKET_THRESHOLDS,
    ttlConfig: Record<FindConstant, TTLConfig> = DEFAULT_TTL_CONFIG
  ) {
    this.bucketThresholds = bucketThresholds;
    this.ttlConfig = ttlConfig;
  }

  /**
   * Optimized room.find() with bucket-aware caching
   *
   * @param room - Room to search in
   * @param type - Find constant
   * @param opts - Optional filter options
   * @returns Array of found objects
   */
  find<T>(
    room: Room,
    type: FindConstant,
    opts?: {
      filter?: ((obj: T) => boolean) | Partial<T>;
      filterKey?: string;
    }
  ): T[] {
    const ttl = this.getTTL(type);

    return cachedRoomFind<T>(room, type, {
      ...opts,
      ttl
    });
  }

  /**
   * Get bucket-aware TTL for a find type
   *
   * @param type - Find constant
   * @returns TTL in ticks
   */
  getTTL(type: FindConstant): number {
    const bucket = Game.cpu.bucket;
    const config = this.ttlConfig[type];

    if (!config) {
      // Fallback for unknown types
      if (bucket < this.bucketThresholds.low) {
        return 50;
      } else if (bucket > this.bucketThresholds.high) {
        return 5;
      } else {
        return 20;
      }
    }

    if (bucket < this.bucketThresholds.low) {
      return config.lowBucket;
    } else if (bucket > this.bucketThresholds.high) {
      return config.highBucket;
    } else {
      return config.normal;
    }
  }

  /**
   * Invalidate cache based on room events
   *
   * @param roomName - Room where event occurred
   * @param event - Type of event
   */
  invalidate(roomName: string, event: RoomEvent): void {
    switch (event) {
      case "structure_built":
      case "structure_destroyed":
        invalidateStructureCache(roomName);
        break;

      case "construction_site_created":
      case "construction_site_removed":
        invalidateFindType(roomName, FIND_MY_CONSTRUCTION_SITES);
        invalidateFindType(roomName, FIND_CONSTRUCTION_SITES);
        break;

      case "creep_spawned":
      case "creep_died":
        invalidateFindType(roomName, FIND_CREEPS);
        invalidateFindType(roomName, FIND_MY_CREEPS);
        break;

      case "hostile_entered":
      case "hostile_left":
        invalidateFindType(roomName, FIND_HOSTILE_CREEPS);
        invalidateFindType(roomName, FIND_HOSTILE_STRUCTURES);
        break;

      default:
        // Unknown event - invalidate everything for safety
        invalidateRoomCache(roomName);
    }
  }

  /**
   * Update bucket thresholds
   *
   * @param thresholds - New bucket thresholds
   */
  setBucketThresholds(thresholds: Partial<BucketThresholds>): void {
    this.bucketThresholds = {
      ...this.bucketThresholds,
      ...thresholds
    };
  }

  /**
   * Update TTL config for a specific find type
   *
   * @param type - Find constant
   * @param config - New TTL config (partial update)
   */
  setTTLConfig(type: FindConstant, config: Partial<TTLConfig>): void {
    // Get existing config or create default if doesn't exist
    const existing = this.ttlConfig[type] || {
      lowBucket: 50,
      normal: 20,
      highBucket: 5
    };
    
    this.ttlConfig[type] = {
      ...existing,
      ...config
    } as TTLConfig;
  }
}

// =============================================================================
// Object ID Optimizer
// =============================================================================

/**
 * Centralized optimization layer for Game.getObjectById() operations
 */
export class ObjectIdOptimizer {
  /**
   * Optimized Game.getObjectById() with automatic caching
   *
   * @param id - Object ID
   * @param ttl - Optional TTL override
   * @returns Object or null
   */
  getById<T extends _HasId>(id: Id<T> | null | undefined, ttl?: number): T | null {
    return getCachedObjectById(id, ttl);
  }

  /**
   * Batch get objects by IDs with caching
   * 
   * Note: This is a convenience wrapper that processes each ID individually.
   * It provides a cleaner API but is not a performance optimization over
   * calling getById multiple times.
   *
   * @param ids - Array of object IDs
   * @param ttl - Optional TTL override
   * @returns Array of objects (nulls filtered out)
   */
  getBatch<T extends _HasId>(ids: (Id<T> | null | undefined)[], ttl?: number): T[] {
    return ids.map(id => this.getById(id, ttl)).filter((obj): obj is T => obj !== null);
  }
}

// =============================================================================
// Global Singletons
// =============================================================================

/**
 * Global room find optimizer instance
 */
export const roomFindOptimizer = new RoomFindOptimizer();

/**
 * Global object ID optimizer instance
 */
export const objectIdOptimizer = new ObjectIdOptimizer();

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Optimized room.find() with bucket-aware caching (convenience function)
 */
export function optimizedFind<T>(
  room: Room,
  type: FindConstant,
  opts?: { filter?: ((obj: T) => boolean) | Partial<T>; filterKey?: string }
): T[] {
  return roomFindOptimizer.find<T>(room, type, opts);
}

/**
 * Optimized Game.getObjectById() with caching (convenience function)
 */
export function optimizedGetById<T extends _HasId>(
  id: Id<T> | null | undefined,
  ttl?: number
): T | null {
  return objectIdOptimizer.getById(id, ttl);
}
