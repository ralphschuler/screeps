/**
 * InterShardMemory Schema - Phase 15
 *
 * Multi-shard meta layer schema and serialization.
 */

import { logger } from "@ralphschuler/screeps-core";

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
 * Calculate checksum for validation
 */
function calculateChecksum(data: string): number {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
     
    hash = (hash << 5) - hash + char;
     
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Serialize InterShardMemory to compact string
 */
export function serializeInterShardMemory(memory: InterShardMemorySchema): string {
  // Create compact representation
  const compact: Record<string, unknown> = {
    v: memory.version,
    s: Object.entries(memory.shards).map(([name, state]) => ({
      n: name,
      r: state.role[0], // First letter of role
      h: {
        c: state.health.cpuCategory[0],
        cu: Math.round(state.health.cpuUsage * 100) / 100,
        b: state.health.bucketLevel,
        e: Math.round(state.health.economyIndex),
        w: Math.round(state.health.warIndex),
        m: Math.round(state.health.commodityIndex),
        rc: state.health.roomCount,
        rl: Math.round(state.health.avgRCL * 10) / 10,
        cc: state.health.creepCount,
        u: state.health.lastUpdate
      },
      t: state.activeTasks,
      p: state.portals.map(p => ({
        sr: p.sourceRoom,
        sp: `${p.sourcePos.x},${p.sourcePos.y}`,
        ts: p.targetShard,
        tr: p.targetRoom,
        th: p.threatRating,
        s: p.isStable ? 1 : 0,
        tc: p.traversalCount ?? 0
      })),
      cl: state.cpuLimit,
      ch: (state.cpuHistory ?? []).slice(-5).map(h => ({
        t: h.tick,
        l: h.cpuLimit,
        u: Math.round(h.cpuUsed * 100) / 100,
        b: h.bucketLevel
      }))
    })),
    g: {
      pl: memory.globalTargets.targetPowerLevel,
      ws: memory.globalTargets.mainWarShard,
      es: memory.globalTargets.primaryEcoShard,
      ct: memory.globalTargets.colonizationTarget,
      en: (memory.globalTargets.enemies ?? []).map(e => ({
        u: e.username,
        r: e.rooms,
        t: e.threatLevel,
        s: e.lastSeen,
        a: e.isAlly ? 1 : 0
      }))
    },
    k: memory.tasks.map(t => ({
      i: t.id,
      y: t.type[0],
      ss: t.sourceShard,
      ts: t.targetShard,
      tr: t.targetRoom,
      rt: t.resourceType,
      ra: t.resourceAmount,
      p: t.priority,
      st: t.status[0],
      pr: t.progress
    })),
    ls: memory.lastSync
  };

  const serialized = JSON.stringify(compact);
  const checksum = calculateChecksum(serialized);

  return JSON.stringify({ d: compact, c: checksum });
}

/**
 * Deserialize InterShardMemory from string
 */
export function deserializeInterShardMemory(data: string): InterShardMemorySchema | null {
  try {
    const parsed = JSON.parse(data) as { d: Record<string, unknown>; c: number };

    // Validate checksum
    const dataStr = JSON.stringify(parsed.d);
    const expectedChecksum = calculateChecksum(dataStr);
    if (parsed.c !== expectedChecksum) {
      logger.warn("InterShardMemory checksum mismatch", {
        subsystem: "InterShard",
        meta: { expected: expectedChecksum, actual: parsed.c }
      });
      return null;
    }

    const compact = parsed.d;

    // Role map
    const roleMap: Record<string, ShardRole> = {
      c: "core",
      f: "frontier",
      r: "resource",
      b: "backup",
      w: "war"
    };

    // CPU category map
    const cpuMap: Record<string, "low" | "medium" | "high" | "critical"> = {
      l: "low",
      m: "medium",
      h: "high",
      c: "critical"
    };

    // Task type map
    const taskTypeMap: Record<string, InterShardTask["type"]> = {
      c: "colonize",
      r: "reinforce",
      t: "transfer",
      e: "evacuate"
    };

    // Task status map
    const statusMap: Record<string, InterShardTask["status"]> = {
      p: "pending",
      a: "active",
      c: "complete",
      f: "failed"
    };

    // Reconstruct memory
    const shards: Record<string, ShardState> = {};
    const shardsData = compact.s as {
      n: string;
      r: string;
      h: { c: string; cu: number; b: number; e: number; w: number; m: number; rc: number; rl: number; cc: number; u: number };
      t: string[];
      p: { sr: string; sp: string; ts: string; tr: string; th: number; s: number; tc: number }[];
      cl?: number;
      ch?: { t: number; l: number; u: number; b: number }[];
    }[];

    for (const s of shardsData) {
      shards[s.n] = {
        name: s.n,
        role: roleMap[s.r] ?? "core",
        health: {
          cpuCategory: cpuMap[s.h.c] ?? "low",
          cpuUsage: s.h.cu ?? 0,
          bucketLevel: s.h.b ?? 10000,
          economyIndex: s.h.e,
          warIndex: s.h.w,
          commodityIndex: s.h.m,
          roomCount: s.h.rc,
          avgRCL: s.h.rl,
          creepCount: s.h.cc,
          lastUpdate: s.h.u
        },
        activeTasks: s.t,
        portals: s.p.map(p => {
          const [x, y] = p.sp.split(",");
          return {
            sourceRoom: p.sr,
            sourcePos: { x: parseInt(x ?? "0", 10), y: parseInt(y ?? "0", 10) },
            targetShard: p.ts,
            targetRoom: p.tr,
            threatRating: p.th,
            lastScouted: 0,
            isStable: p.s === 1,
            traversalCount: p.tc ?? 0
          };
        }),
        cpuLimit: s.cl,
        cpuHistory: (s.ch ?? []).map(h => ({
          tick: h.t,
          cpuLimit: h.l,
          cpuUsed: h.u,
          bucketLevel: h.b
        }))
      };
    }

    const globalData = compact.g as {
      pl: number;
      ws?: string;
      es?: string;
      ct?: string;
      al?: string[];
      en?: { u: string; r: string[]; t: 0 | 1 | 2 | 3; s: number; a: number }[];
    };
    const tasksData = compact.k as {
      i: string;
      y: string;
      ss: string;
      ts: string;
      tr?: string;
      rt?: ResourceConstant;
      ra?: number;
      p: number;
      st: string;
      pr?: number;
    }[];

    const globalTargets: GlobalStrategicTargets = {
      targetPowerLevel: globalData.pl
    };

    if (globalData.ws) {
      globalTargets.mainWarShard = globalData.ws;
    }
    if (globalData.es) {
      globalTargets.primaryEcoShard = globalData.es;
    }
    if (globalData.ct) {
      globalTargets.colonizationTarget = globalData.ct;
    }
    if (globalData.en) {
      globalTargets.enemies = globalData.en.map(e => ({
        username: e.u,
        rooms: e.r,
        threatLevel: e.t,
        lastSeen: e.s,
        isAlly: e.a === 1
      }));
    }

    return {
      version: compact.v as number,
      shards,
      globalTargets,
      tasks: tasksData.map(t => {
        const task: InterShardTask = {
          id: t.i,
          type: taskTypeMap[t.y] ?? "colonize",
          sourceShard: t.ss,
          targetShard: t.ts,
          priority: t.p,
          status: statusMap[t.st] ?? "pending",
          createdAt: 0
        };
        if (t.tr) {
          task.targetRoom = t.tr;
        }
        if (t.rt) {
          task.resourceType = t.rt;
        }
        if (t.ra !== undefined) {
          task.resourceAmount = t.ra;
        }
        if (t.pr !== undefined) {
          task.progress = t.pr;
        }
        return task;
      }),
      lastSync: compact.ls as number,
      checksum: parsed.c
    };
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
