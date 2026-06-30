import type { SwarmCreepMemory } from "@ralphschuler/screeps-memory";

type CreepCountCacheValue = Map<string, number> | number;

/**
 * Per-tick count cache for spawn demand analysis.
 *
 * Spawn planning asks several modules for the same home-room role counts in one
 * tick. Keeping the cache in this module lets the analyzer consume simple count
 * helpers while this file owns the Game.creeps iteration and invalidation rules.
 */
const creepCountCache = new Map<string, CreepCountCacheValue>();
let creepCountCacheTick = -1;
let creepCountCacheRef: Record<string, Creep> | null = null;

function ensureCurrentCreepCountCache(): void {
  if (creepCountCacheTick === Game.time && creepCountCacheRef === Game.creeps) return;

  creepCountCache.clear();
  creepCountCacheTick = Game.time;
  creepCountCacheRef = Game.creeps;
}

function getCreepRole(memory: Partial<SwarmCreepMemory>): string {
  return memory.role ?? "unknown";
}

/**
 * Count creeps by role for one home room.
 *
 * @param roomName Home room to count from `creep.memory.homeRoom`.
 * @param activeOnly When true, excludes creeps still spawning.
 */
export function countCreepsByRole(roomName: string, activeOnly = false): Map<string, number> {
  ensureCurrentCreepCountCache();

  const cacheKey = activeOnly ? `${roomName}_active` : roomName;
  const cached = creepCountCache.get(cacheKey);
  if (cached instanceof Map) return cached;

  const counts = new Map<string, number>();
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom !== roomName) continue;
    if (activeOnly && creep.spawning) continue;

    const role = getCreepRole(memory);
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }

  creepCountCache.set(cacheKey, counts);
  return counts;
}

/** Count creeps of one role from one home room with the same per-tick cache. */
export function countCreepsOfRole(roomName: string, role: string): number {
  ensureCurrentCreepCountCache();

  const cacheKey = `${roomName}:${role}`;
  const cached = creepCountCache.get(cacheKey);
  if (typeof cached === "number") return cached;

  let count = 0;
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName && memory.role === role) count++;
  }

  creepCountCache.set(cacheKey, count);
  return count;
}

/** Count remote creeps for one home room, role, and assigned target room. */
export function countRemoteCreepsByTargetRoom(homeRoom: string, role: string, targetRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === homeRoom && memory.role === role && memory.targetRoom === targetRoom) {
      count++;
    }
  }
  return count;
}
