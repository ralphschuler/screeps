/**
 * External dependency interfaces for stats package
 * 
 * These interfaces define the contracts with external systems.
 * The consuming bot must provide implementations.
 */

// ============================================================================
// Kernel Types
// ============================================================================

export type ProcessFrequency = "high" | "medium" | "low";

// ============================================================================
// Logger Interface
// ============================================================================

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export function createLogger(category: string): Logger {
  const stringifyArgs = (...args: any[]): any[] => {
    return args.map(arg => {
      // Keep primitives as-is
      if (typeof arg === 'string' || typeof arg === 'number' || typeof arg === 'boolean' || arg === null || arg === undefined) {
        return arg;
      }
      // Stringify objects/arrays, with error handling
      try {
        return JSON.stringify(arg);
      } catch (error) {
        return '[Unserializable Object]';
      }
    });
  };
  
  return {
    debug: (msg: string, ...args: any[]) => console.log(`[${category}]`, msg, ...stringifyArgs(...args)),
    info: (msg: string, ...args: any[]) => console.log(`[${category}]`, msg, ...stringifyArgs(...args)),
    warn: (msg: string, ...args: any[]) => console.log(`[${category}] WARN:`, msg, ...stringifyArgs(...args)),
    error: (msg: string, ...args: any[]) => console.log(`[${category}] ERROR:`, msg, ...stringifyArgs(...args))
  };
}

export const logger: Logger = createLogger('stats');

// ============================================================================
// Memory Manager Interface
// ============================================================================

export interface MemoryManager {
  getRoomMemory(roomName: string): any;
  getCreepMemory(creepName: string): any;
  getAllRoomMemories(): Map<string, any>;
  getSwarmState(roomName: string): any;
}

// Stub memory manager
export const memoryManager: MemoryManager = {
  getRoomMemory: (roomName: string) => Memory.rooms?.[roomName] || {},
  getCreepMemory: (creepName: string) => Memory.creeps?.[creepName] || {},
  getAllRoomMemories: () => {
    const map = new Map();
    if (Memory.rooms) {
      for (const [name, mem] of Object.entries(Memory.rooms)) {
        map.set(name, mem);
      }
    }
    return map;
  },
  getSwarmState: (roomName: string) => ({})
};

// ============================================================================
// Memory Schemas (stub types)
// ============================================================================

export type EvolutionStage =
  | "seedNest" // RCL 1-3
  | "foragingExpansion" // RCL 3-4
  | "matureColony" // RCL 4-6
  | "fortifiedHive" // RCL 7-8
  | "empireDominance"; // Multi-room/shard endgame

export type RoomPosture = "eco" | "expand" | "defensive" | "war" | "siege" | "evacuate" | "nukePrep";

export enum PheromoneState {
  ACTIVE = 'active',
  DECAY = 'decay',
  INACTIVE = 'inactive'
}

export enum VisualizationLayer {
  PHEROMONES = 'pheromones',
  PATHS = 'paths',
  TARGETS = 'targets',
  DEBUG = 'debug'
}

// ============================================================================
// Shard Manager Interface
// ============================================================================

export interface ShardManager {
  getCurrentShard(): string;
  getAllShards(): string[];
  getCurrentShardState(): any;
}

export const shardManager: ShardManager = {
  getCurrentShard: () => Game.shard?.name || 'shard0',
  getAllShards: () => [Game.shard?.name || 'shard0'],
  getCurrentShardState: () => ({})
};

// ============================================================================
// Cache Interfaces
// ============================================================================

export interface CacheStatsResult {
  rooms?: number;
  totalEntries?: number;
  hits: number;
  misses: number;
  invalidations?: number;
  size: number;
  maxSize?: number;
  evictions?: number;
  hitRate: number;
}

export function getRoomFindCacheStats(): { rooms: number; totalEntries: number; hits: number; misses: number; invalidations: number; size: number; hitRate: number } {
  return { rooms: 0, totalEntries: 0, hits: 0, misses: 0, invalidations: 0, size: 0, hitRate: 0 };
}

export function getBodyPartCacheStats(): { hits: number; misses: number; size: number; hitRate: number } {
  return { hits: 0, misses: 0, size: 0, hitRate: 0 };
}

export function getObjectCacheStats(): { hits: number; misses: number; size: number; hitRate: number } {
  return { hits: 0, misses: 0, size: 0, hitRate: 0 };
}

export function getPathCacheStats(): { size: number; maxSize: number; hits: number; misses: number; evictions: number; hitRate: number } {
  return { hits: 0, misses: 0, size: 0, maxSize: 0, evictions: 0, hitRate: 0 };
}

export function getRoleCacheStats(): { totalEntries: number } {
  return { totalEntries: 0 };
}

export interface GlobalCache {
  getCacheStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    evictions: number;
  };
}

export const globalCache: GlobalCache = {
  getCacheStats: () => ({ hits: 0, misses: 0, hitRate: 0, size: 0, evictions: 0 })
};
