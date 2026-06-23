/**
 * InterShardMemory Schema - Phase 15
 *
 * Multi-shard meta layer schema and serialization.
 */

import { logger } from "@ralphschuler/screeps-kernel";
import { calculateChecksum } from "./schema/checksum";
import { fromCompactInterShardMemory, toCompactInterShardMemory } from "./schema/compactSerialization";
import type { SerializedInterShardPayload } from "./schema/compactTypes";

/**
 * Shard role in multi-shard empire
 */
export type ShardRole = "core" | "frontier" | "resource" | "backup" | "war";

/**
 * Shard health metrics
 */
export interface ShardHealthMetrics {
  /** CPU usage category (low/medium/high/critical) */
  cpuCategory: "low" | "medium" | "high" | "critical";
  /** Actual CPU usage (0-1) */
  cpuUsage: number;
  /** Average CPU bucket level */
  bucketLevel: number;
  /** Economy index (0-100) */
  economyIndex: number;
  /** War index (0-100) */
  warIndex: number;
  /** Commodity production index (0-100) */
  commodityIndex: number;
  /** Number of rooms */
  roomCount: number;
  /** Average RCL */
  avgRCL: number;
  /** Total creeps */
  creepCount: number;
  /** Last update tick */
  lastUpdate: number;
}

/**
 * Inter-shard task
 */
export interface InterShardTask {
  /** Task ID */
  id: string;
  /** Task type */
  type: "colonize" | "reinforce" | "transfer" | "evacuate";
  /** Source shard */
  sourceShard: string;
  /** Target shard */
  targetShard: string;
  /** Target room (if applicable) */
  targetRoom?: string;
  /** Resource type for transfer tasks */
  resourceType?: ResourceConstant;
  /** Resource amount for transfer tasks */
  resourceAmount?: number;
  /** Priority */
  priority: number;
  /** Status */
  status: "pending" | "active" | "complete" | "failed";
  /** Created tick */
  createdAt: number;
  /** Last updated tick */
  updatedAt?: number;
  /** Progress percentage (0-100) */
  progress?: number;
}

/**
 * Portal information
 */
export interface PortalInfo {
  /** Source room */
  sourceRoom: string;
  /** Source position */
  sourcePos: { x: number; y: number };
  /** Target shard */
  targetShard: string;
  /** Target room */
  targetRoom: string;
  /** Decay tick (for unstable portals) */
  decayTick?: number;
  /** Threat rating (0-3) */
  threatRating: number;
  /** Last scouted */
  lastScouted: number;
  /** Is portal stable/reliable */
  isStable: boolean;
  /** Number of successful traversals */
  traversalCount?: number;
}

/**
 * CPU allocation history entry
 */
export interface CpuAllocationHistory {
  /** Game tick */
  tick: number;
  /** CPU limit at this time */
  cpuLimit: number;
  /** CPU used at this time */
  cpuUsed: number;
  /** Bucket level at this time */
  bucketLevel: number;
}

/**
 * Shard state
 */
export interface ShardState {
  /** Shard name */
  name: string;
  /** Shard role */
  role: ShardRole;
  /** Health metrics */
  health: ShardHealthMetrics;
  /** Active tasks */
  activeTasks: string[];
  /** Known portals */
  portals: PortalInfo[];
  /** CPU allocation history (last 10 entries) */
  cpuHistory?: CpuAllocationHistory[];
  /** Current CPU limit */
  cpuLimit?: number;
}

/**
 * Enemy intelligence shared across shards
 */
export interface SharedEnemyIntel {
  /** Enemy username */
  username: string;
  /** Known rooms across all shards */
  rooms: string[];
  /** Threat level (0-3) */
  threatLevel: 0 | 1 | 2 | 3;
  /** Last seen tick */
  lastSeen: number;
  /** Is ally/whitelisted */
  isAlly: boolean;
}

/**
 * Global strategic targets
 */
export interface GlobalStrategicTargets {
  /** Target GPL across all shards */
  targetPowerLevel: number;
  /** Main war shard */
  mainWarShard?: string;
  /** Primary economy shard */
  primaryEcoShard?: string;
  /** Colonization priority shard */
  colonizationTarget?: string;
  /** Global enemy list */
  enemies?: SharedEnemyIntel[];
}

export type InterShardFootprintStatus =
  | "unreached"
  | "reached"
  | "claimTargetSelected"
  | "claimerEnRoute"
  | "claimed"
  | "bootstrapping"
  | "established"
  | "blocked";

export interface InterShardFootprintTarget {
  shard: string;
  status: InterShardFootprintStatus;
  portalRoom?: string;
  portalPos?: { x: number; y: number };
  destinationRoom?: string;
  claimTargetRoom?: string;
  arrivedAt?: number;
  claimedAt?: number;
  attempts: number;
  blockedReason?: string;
  lastUpdate: number;
}

export interface InterShardFootprintOperation {
  id: string;
  enabled: boolean;
  targetShards: string[];
  targets: Record<string, InterShardFootprintTarget>;
  startedAt: number;
  updatedAt: number;
}

/**
 * Complete InterShardMemory structure
 */
export interface InterShardMemorySchema {
  /** Version for migration */
  version: number;
  /** Shard states */
  shards: Record<string, ShardState>;
  /** Global strategic targets */
  globalTargets: GlobalStrategicTargets;
  /** Active inter-shard tasks */
  tasks: InterShardTask[];
  /** Active peaceful all-shard footprint/colonization operation */
  footprintOperation?: InterShardFootprintOperation;
  /** Last sync tick */
  lastSync: number;
  /** Checksum for validation */
  checksum: number;
}

/**
 * Create default InterShardMemory
 */
export function createDefaultInterShardMemory(): InterShardMemorySchema {
  return {
    version: 1,
    shards: {},
    globalTargets: {
      targetPowerLevel: 0
    },
    tasks: [],
    footprintOperation: undefined,
    lastSync: 0,
    checksum: 0
  };
}

/**
 * Create default shard state
 */
export function createDefaultShardState(name: string): ShardState {
  return {
    name,
    role: "core",
    health: {
      cpuCategory: "low",
      cpuUsage: 0,
      bucketLevel: 10000,
      economyIndex: 50,
      warIndex: 0,
      commodityIndex: 0,
      roomCount: 0,
      avgRCL: 0,
      creepCount: 0,
      lastUpdate: 0
    },
    activeTasks: [],
    portals: [],
    cpuHistory: [],
    cpuLimit: 0
  };
}

/**
 * Serialize InterShardMemory to compact string.
 *
 * The public schema stays readable while the internal compact codec keeps the
 * InterShardMemory payload small enough for Screeps' 100KB shard limit.
 */
export function serializeInterShardMemory(memory: InterShardMemorySchema): string {
  const compact = toCompactInterShardMemory(memory);
  const serialized = JSON.stringify(compact);
  const checksum = calculateChecksum(serialized);

  return JSON.stringify({ d: compact, c: checksum });
}

/**
 * Deserialize InterShardMemory from string.
 *
 * Invalid JSON, checksum mismatches, or compact payloads that cannot be
 * expanded fail closed with null so callers can keep or recreate safe local
 * shard state.
 */
export function deserializeInterShardMemory(data: string): InterShardMemorySchema | null {
  try {
    const parsed = JSON.parse(data) as SerializedInterShardPayload;

    const dataStr = JSON.stringify(parsed.d);
    const expectedChecksum = calculateChecksum(dataStr);
    if (parsed.c !== expectedChecksum) {
      logger.warn("InterShardMemory checksum mismatch", {
        subsystem: "InterShard",
        meta: { expected: expectedChecksum, actual: parsed.c }
      });
      return null;
    }

    return fromCompactInterShardMemory(parsed.d, parsed.c);
  } catch (error) {
    logger.error(`Failed to deserialize InterShardMemory: ${String(error)}`, {
      subsystem: "InterShard"
    });
    return null;
  }
}

/**
 * Get size of serialized InterShardMemory
 */
export function getInterShardMemorySize(memory: InterShardMemorySchema): number {
  return serializeInterShardMemory(memory).length;
}

/**
 * InterShardMemory size limit (100KB)
 */
export const INTERSHARD_MEMORY_LIMIT = 102400;
