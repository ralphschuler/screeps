import type {
  GlobalStrategicTargets,
  InterShardFootprintOperation,
  InterShardFootprintTarget,
  InterShardMemorySchema,
  InterShardTask,
  PortalInfo,
  ShardHealthMetrics,
  ShardState,
  SharedEnemyIntel
} from "../schema";
import { COMPACT_TO_CPU, COMPACT_TO_ROLE, COMPACT_TO_TASK_STATUS, COMPACT_TO_TASK_TYPE } from "./codecMaps";
import type {
  CompactCpuHistory,
  CompactEnemyIntel,
  CompactFootprintOperation,
  CompactFootprintTarget,
  CompactGlobalTargets,
  CompactInterShardMemory,
  CompactPortal,
  CompactShardHealth,
  CompactShardState,
  CompactTask
} from "./compactTypes";
import { decodeOptionalPosition, decodePortalPosition } from "./positionCodec";

/** Expand the compact wire shape back into the public schema. */
export function fromCompactInterShardMemory(
  compact: CompactInterShardMemory,
  checksum: number
): InterShardMemorySchema {
  return {
    version: compact.v,
    shards: expandShardStates(compact.s),
    globalTargets: expandGlobalTargets(compact.g),
    footprintOperation: compact.o ? expandFootprintOperation(compact.o) : undefined,
    tasks: compact.k.map(expandTask),
    lastSync: compact.ls,
    checksum
  };
}

function expandShardStates(compactShards: CompactShardState[]): Record<string, ShardState> {
  const shards: Record<string, ShardState> = {};
  for (const compactShard of compactShards) {
    shards[compactShard.n] = expandShardState(compactShard);
  }
  return shards;
}

function expandShardState(compactShard: CompactShardState): ShardState {
  return {
    name: compactShard.n,
    role: COMPACT_TO_ROLE[compactShard.r] ?? "core",
    health: expandHealth(compactShard.h),
    activeTasks: compactShard.t,
    portals: compactShard.p.map(expandPortal),
    cpuLimit: compactShard.cl,
    cpuHistory: (compactShard.ch ?? []).map(expandCpuHistory)
  };
}

function expandHealth(health: CompactShardHealth): ShardHealthMetrics {
  return {
    cpuCategory: COMPACT_TO_CPU[health.c] ?? "low",
    cpuUsage: health.cu ?? 0,
    bucketLevel: health.b ?? 10000,
    economyIndex: health.e,
    warIndex: health.w,
    commodityIndex: health.m,
    roomCount: health.rc,
    avgRCL: health.rl,
    creepCount: health.cc,
    lastUpdate: health.u
  };
}

function expandPortal(portal: CompactPortal): PortalInfo {
  return {
    sourceRoom: portal.sr,
    sourcePos: decodePortalPosition(portal.sp),
    targetShard: portal.ts,
    targetRoom: portal.tr,
    threatRating: portal.th,
    lastScouted: portal.ls ?? 0,
    decayTick: portal.dt,
    isStable: portal.s === 1,
    traversalCount: portal.tc ?? 0
  };
}

function expandCpuHistory(history: CompactCpuHistory): { tick: number; cpuLimit: number; cpuUsed: number; bucketLevel: number } {
  return {
    tick: history.t,
    cpuLimit: history.l,
    cpuUsed: history.u,
    bucketLevel: history.b
  };
}

function expandGlobalTargets(globalData: CompactGlobalTargets): GlobalStrategicTargets {
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
    globalTargets.enemies = globalData.en.map(expandEnemyIntel);
  }

  return globalTargets;
}

function expandEnemyIntel(enemy: CompactEnemyIntel): SharedEnemyIntel {
  return {
    username: enemy.u,
    rooms: enemy.r,
    threatLevel: enemy.t,
    lastSeen: enemy.s,
    isAlly: enemy.a === 1
  };
}

function expandFootprintOperation(operation: CompactFootprintOperation): InterShardFootprintOperation {
  const targets: Record<string, InterShardFootprintTarget> = {};
  for (const target of operation.t ?? []) {
    targets[target.n] = expandFootprintTarget(target);
  }

  return {
    id: operation.i,
    enabled: operation.e === 1,
    targetShards: operation.s ?? [],
    targets,
    startedAt: operation.a,
    updatedAt: operation.u
  };
}

function expandFootprintTarget(target: CompactFootprintTarget): InterShardFootprintTarget {
  return {
    shard: target.n,
    status: target.st,
    portalRoom: target.pr,
    portalPos: decodeOptionalPosition(target.pp),
    destinationRoom: target.dr,
    claimTargetRoom: target.cr,
    arrivedAt: target.ar,
    claimedAt: target.ca,
    attempts: target.at ?? 0,
    blockedReason: target.b,
    lastUpdate: target.u
  };
}

function expandTask(taskData: CompactTask): InterShardTask {
  const task: InterShardTask = {
    id: taskData.i,
    type: COMPACT_TO_TASK_TYPE[taskData.y] ?? "colonize",
    sourceShard: taskData.ss,
    targetShard: taskData.ts,
    priority: taskData.p,
    status: COMPACT_TO_TASK_STATUS[taskData.st] ?? "pending",
    createdAt: 0
  };

  if (taskData.tr) {
    task.targetRoom = taskData.tr;
  }
  if (taskData.rt) {
    task.resourceType = taskData.rt;
  }
  if (taskData.ra !== undefined) {
    task.resourceAmount = taskData.ra;
  }
  if (taskData.pr !== undefined) {
    task.progress = taskData.pr;
  }

  return task;
}
