import type {
  CpuAllocationHistory,
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
import { CPU_TO_COMPACT, ROLE_TO_COMPACT, TASK_STATUS_TO_COMPACT, TASK_TYPE_TO_COMPACT } from "./codecMaps";
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
import { roundTo } from "./numberFormatting";
import { encodePosition } from "./positionCodec";

/** Convert public memory into the compact InterShardMemory wire shape. */
export function toCompactInterShardMemory(memory: InterShardMemorySchema): CompactInterShardMemory {
  return {
    v: memory.version,
    s: Object.entries(memory.shards).map(([name, state]) => toCompactShardState(name, state)),
    g: toCompactGlobalTargets(memory.globalTargets),
    o: memory.footprintOperation ? toCompactFootprintOperation(memory.footprintOperation) : undefined,
    k: memory.tasks.map(toCompactTask),
    ls: memory.lastSync
  };
}

function toCompactShardState(name: string, state: ShardState): CompactShardState {
  return {
    n: name,
    r: ROLE_TO_COMPACT[state.role] ?? state.role[0],
    h: toCompactHealth(state.health),
    t: state.activeTasks,
    p: state.portals.map(toCompactPortal),
    cl: state.cpuLimit,
    ch: (state.cpuHistory ?? []).slice(-5).map(toCompactCpuHistory)
  };
}

function toCompactHealth(health: ShardHealthMetrics): CompactShardHealth {
  return {
    c: CPU_TO_COMPACT[health.cpuCategory] ?? health.cpuCategory[0],
    cu: roundTo(health.cpuUsage, 2),
    b: health.bucketLevel,
    e: Math.round(health.economyIndex),
    w: Math.round(health.warIndex),
    m: Math.round(health.commodityIndex),
    rc: health.roomCount,
    rl: roundTo(health.avgRCL, 1),
    cc: health.creepCount,
    u: health.lastUpdate
  };
}

function toCompactPortal(portal: PortalInfo): CompactPortal {
  return {
    sr: portal.sourceRoom,
    sp: encodePosition(portal.sourcePos),
    ts: portal.targetShard,
    tr: portal.targetRoom,
    th: portal.threatRating,
    s: portal.isStable ? 1 : 0,
    tc: portal.traversalCount ?? 0,
    ls: portal.lastScouted,
    dt: portal.decayTick
  };
}

function toCompactCpuHistory(history: CpuAllocationHistory): CompactCpuHistory {
  return {
    t: history.tick,
    l: history.cpuLimit,
    u: roundTo(history.cpuUsed, 2),
    b: history.bucketLevel
  };
}

function toCompactGlobalTargets(targets: GlobalStrategicTargets): CompactGlobalTargets {
  return {
    pl: targets.targetPowerLevel,
    ws: targets.mainWarShard,
    es: targets.primaryEcoShard,
    ct: targets.colonizationTarget,
    en: (targets.enemies ?? []).map(toCompactEnemyIntel)
  };
}

function toCompactEnemyIntel(enemy: SharedEnemyIntel): CompactEnemyIntel {
  return {
    u: enemy.username,
    r: enemy.rooms,
    t: enemy.threatLevel,
    s: enemy.lastSeen,
    a: enemy.isAlly ? 1 : 0
  };
}

function toCompactFootprintOperation(operation: InterShardFootprintOperation): CompactFootprintOperation {
  return {
    i: operation.id,
    e: operation.enabled ? 1 : 0,
    s: operation.targetShards,
    a: operation.startedAt,
    u: operation.updatedAt,
    t: Object.entries(operation.targets).map(([name, target]) => toCompactFootprintTarget(name, target))
  };
}

function toCompactFootprintTarget(name: string, target: InterShardFootprintTarget): CompactFootprintTarget {
  return {
    n: name,
    st: target.status,
    pr: target.portalRoom,
    pp: target.portalPos ? encodePosition(target.portalPos) : undefined,
    dr: target.destinationRoom,
    cr: target.claimTargetRoom,
    ar: target.arrivedAt,
    ca: target.claimedAt,
    at: target.attempts,
    b: target.blockedReason,
    u: target.lastUpdate
  };
}

function toCompactTask(task: InterShardTask): CompactTask {
  return {
    i: task.id,
    y: TASK_TYPE_TO_COMPACT[task.type] ?? task.type[0],
    ss: task.sourceShard,
    ts: task.targetShard,
    tr: task.targetRoom,
    rt: task.resourceType,
    ra: task.resourceAmount,
    p: task.priority,
    st: TASK_STATUS_TO_COMPACT[task.status] ?? task.status[0],
    pr: task.progress
  };
}
