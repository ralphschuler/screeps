import { INTERSHARD_MEMORY_LIMIT } from "./schema";

const CREEP_HANDOFF_NAMESPACE = "creepHandoffs:";
const CREEP_HANDOFF_VERSION = 1;
const DEFAULT_CREEP_LIFETIME = 1500;
const ACTIVE_TRANSFER_GRACE_TICKS = 50;
const ACTIVE_PRESENCE_GRACE_TICKS = 25;

interface SerializedCreepMemoryHandoff {
  sourceShard: string;
  targetShard: string;
  updatedAt: number;
  expiresAt: number;
  memory: Record<string, unknown>;
}

interface SerializedCreepPresence {
  role: string;
  targetShard: string;
  updatedAt: number;
}

interface SerializedCreepMemoryHandoffNamespace {
  version: number;
  outgoing: Record<string, SerializedCreepMemoryHandoff>;
  arrivals: Record<string, SerializedCreepPresence>;
}

export interface StageInterShardCreepMemoryResult {
  staged: number;
  pruned: number;
  written: boolean;
}

export interface ActiveInterShardCreepHandoffFilter {
  role: string;
  targetShard: string;
}

/**
 * Stage mission memory for creeps that are about to leave the current shard.
 *
 * The handoff uses an independent root namespace so normal compact schema and
 * portal writers preserve it. Records expire at the source creep's remaining
 * lifetime, bounding both stale restores and InterShardMemory growth.
 */
export function stageInterShardCreepMemory(
  creeps: readonly Creep[],
): StageInterShardCreepMemoryResult {
  const emptyResult = { staged: 0, pruned: 0, written: false };

  try {
    if (typeof InterShardMemory === "undefined") return emptyResult;
    const currentShard = Game.shard?.name;
    if (!currentShard) return emptyResult;

    const existingPayload = InterShardMemory.getLocal() || "";
    const root = parsePayloadObject(existingPayload);
    if (!root) return emptyResult;
    const namespace = parseHandoffNamespace(root[CREEP_HANDOFF_NAMESPACE]);
    if (!namespace) return emptyResult;

    let pruned = 0;
    for (const [name, handoff] of Object.entries(namespace.outgoing)) {
      if (handoff.expiresAt < Game.time) {
        delete namespace.outgoing[name];
        pruned++;
      }
    }

    let staged = 0;
    for (const creep of creeps) {
      const memory = asPlainObject(creep.memory);
      const targetShard = memory?.targetShard;
      if (
        !memory ||
        typeof targetShard !== "string" ||
        targetShard === currentShard
      ) {
        continue;
      }

      const clonedMemory = cloneMemory(memory);
      if (!clonedMemory) continue;
      const remainingLifetime =
        typeof creep.ticksToLive === "number" && creep.ticksToLive > 0
          ? creep.ticksToLive
          : DEFAULT_CREEP_LIFETIME;
      namespace.outgoing[creep.name] = {
        sourceShard: currentShard,
        targetShard,
        updatedAt: Game.time,
        expiresAt: Game.time + remainingLifetime,
        memory: clonedMemory,
      };
      staged++;
    }

    if (staged === 0 && pruned === 0) return emptyResult;
    root[CREEP_HANDOFF_NAMESPACE] = namespace;
    const serialized = JSON.stringify(root);
    if (serialized.length > INTERSHARD_MEMORY_LIMIT) {
      return { staged: 0, pruned: 0, written: false };
    }

    InterShardMemory.setLocal(serialized);
    return { staged, pruned, written: true };
  } catch {
    return emptyResult;
  }
}

/**
 * Restore memory for creeps that arrived from another shard.
 *
 * Destination mission changes win over old handoffs. Source-only movement
 * state is cleared so a restored creep immediately evaluates behavior in its
 * new shard instead of replaying a path to the source portal.
 */
export function restoreInterShardCreepMemory(
  creeps: readonly Creep[],
  sourceShards: readonly string[],
): string[] {
  const currentShard = Game.shard?.name;
  if (!currentShard || typeof InterShardMemory === "undefined") return [];

  const memorylessCreeps = new Map(
    creeps
      .filter((creep) => !hasCompleteMissionMemory(creep.memory))
      .map((creep) => [creep.name, creep]),
  );
  if (memorylessCreeps.size === 0) return [];

  const restored: string[] = [];
  for (const sourceShard of sourceShards) {
    if (sourceShard === currentShard || memorylessCreeps.size === 0) continue;

    try {
      const raw = InterShardMemory.getRemote(sourceShard);
      if (!raw) continue;
      const root = parsePayloadObject(raw);
      if (!root) continue;
      const namespace = parseHandoffNamespace(root[CREEP_HANDOFF_NAMESPACE]);
      if (!namespace) continue;

      for (const [name, creep] of memorylessCreeps) {
        const handoff = namespace.outgoing[name];
        if (
          !handoff ||
          handoff.expiresAt < Game.time ||
          handoff.sourceShard !== sourceShard ||
          handoff.targetShard !== currentShard
        ) {
          continue;
        }

        const memory = cloneMemory(handoff.memory);
        if (!memory) continue;
        delete memory.state;
        delete memory._move;
        creep.memory = memory as unknown as CreepMemory;
        memorylessCreeps.delete(name);
        restored.push(name);
      }
    } catch {
      // A missing, malformed, or unavailable remote shard must not stop others.
    }
  }

  return restored;
}

/** Publish destination-side live operation creeps for exact remote duplicate suppression. */
export function publishInterShardCreepPresence(
  creeps: readonly Creep[],
): boolean {
  try {
    if (typeof InterShardMemory === "undefined") return false;
    const currentShard = Game.shard?.name;
    if (!currentShard) return false;

    const existingPayload = InterShardMemory.getLocal() || "";
    const root = parsePayloadObject(existingPayload);
    if (!root) return false;
    const namespace = parseHandoffNamespace(root[CREEP_HANDOFF_NAMESPACE]);
    if (!namespace) return false;

    const arrivals: Record<string, SerializedCreepPresence> = {};
    for (const creep of creeps) {
      const memory = asPlainObject(creep.memory);
      const role = memory?.role;
      if (
        typeof creep.name !== "string" ||
        typeof role !== "string" ||
        !role.startsWith("interShard") ||
        memory?.targetShard !== currentShard
      ) {
        continue;
      }
      arrivals[creep.name] = {
        role,
        targetShard: currentShard,
        updatedAt: Game.time,
      };
    }

    const previousArrivals = JSON.stringify(namespace.arrivals);
    namespace.arrivals = arrivals;
    let pruned = false;
    for (const [name, handoff] of Object.entries(namespace.outgoing)) {
      if (handoff.expiresAt < Game.time) {
        delete namespace.outgoing[name];
        pruned = true;
      }
    }
    if (!pruned && previousArrivals === JSON.stringify(arrivals)) return false;

    root[CREEP_HANDOFF_NAMESPACE] = namespace;
    const serialized = JSON.stringify(root);
    if (serialized.length > INTERSHARD_MEMORY_LIMIT) return false;
    InterShardMemory.setLocal(serialized);
    return true;
  } catch {
    return false;
  }
}

/** Return staged or remotely present creep names for source-side duplicate suppression. */
export function getActiveInterShardCreepHandoffNames(
  filter: ActiveInterShardCreepHandoffFilter,
): string[] {
  try {
    if (typeof InterShardMemory === "undefined") return [];
    const names = new Set<string>();
    const root = parsePayloadObject(InterShardMemory.getLocal() || "");
    const namespace = root
      ? parseHandoffNamespace(root[CREEP_HANDOFF_NAMESPACE])
      : null;
    if (namespace) {
      for (const [name, handoff] of Object.entries(namespace.outgoing)) {
        if (
          handoff.expiresAt >= Game.time &&
          Game.time - handoff.updatedAt <= ACTIVE_TRANSFER_GRACE_TICKS &&
          handoff.targetShard === filter.targetShard &&
          handoff.memory.role === filter.role
        ) {
          names.add(name);
        }
      }
    }

    try {
      const remotePayload = InterShardMemory.getRemote(filter.targetShard);
      const remoteRoot = remotePayload
        ? parsePayloadObject(remotePayload)
        : null;
      const remoteNamespace = remoteRoot
        ? parseHandoffNamespace(remoteRoot[CREEP_HANDOFF_NAMESPACE])
        : null;
      if (remoteNamespace) {
        for (const [name, presence] of Object.entries(
          remoteNamespace.arrivals,
        )) {
          if (
            Game.time - presence.updatedAt <= ACTIVE_PRESENCE_GRACE_TICKS &&
            presence.targetShard === filter.targetShard &&
            presence.role === filter.role
          ) {
            names.add(name);
          }
        }
      }
    } catch {
      // Unknown or unavailable remote shards do not invalidate local handoffs.
    }

    return [...names].sort();
  } catch {
    return [];
  }
}

function hasCompleteMissionMemory(memory: CreepMemory): boolean {
  const record = asPlainObject(memory);
  return (
    typeof record?.role === "string" && typeof record.targetShard === "string"
  );
}

function parsePayloadObject(payload: string): Record<string, unknown> | null {
  if (!payload) return {};

  try {
    const parsed: unknown = JSON.parse(payload);
    return asPlainObject(parsed);
  } catch {
    return null;
  }
}

function parseHandoffNamespace(
  value: unknown,
): SerializedCreepMemoryHandoffNamespace | null {
  if (value === undefined) {
    return { version: CREEP_HANDOFF_VERSION, outgoing: {}, arrivals: {} };
  }

  const namespace = asPlainObject(value);
  const outgoing = asPlainObject(namespace?.outgoing);
  const arrivals = asPlainObject(namespace?.arrivals) ?? {};
  if (namespace?.version !== CREEP_HANDOFF_VERSION || !outgoing) return null;

  const validOutgoing: Record<string, SerializedCreepMemoryHandoff> = {};
  for (const [name, candidate] of Object.entries(outgoing)) {
    const handoff = parseHandoff(candidate);
    if (handoff) validOutgoing[name] = handoff;
  }
  const validArrivals: Record<string, SerializedCreepPresence> = {};
  for (const [name, candidate] of Object.entries(arrivals)) {
    const presence = parsePresence(candidate);
    if (presence) validArrivals[name] = presence;
  }
  return {
    version: CREEP_HANDOFF_VERSION,
    outgoing: validOutgoing,
    arrivals: validArrivals,
  };
}

function parsePresence(value: unknown): SerializedCreepPresence | null {
  const presence = asPlainObject(value);
  if (
    !presence ||
    typeof presence.role !== "string" ||
    typeof presence.targetShard !== "string" ||
    typeof presence.updatedAt !== "number"
  ) {
    return null;
  }
  return {
    role: presence.role,
    targetShard: presence.targetShard,
    updatedAt: presence.updatedAt,
  };
}

function parseHandoff(value: unknown): SerializedCreepMemoryHandoff | null {
  const handoff = asPlainObject(value);
  const memory = asPlainObject(handoff?.memory);
  if (
    !handoff ||
    !memory ||
    typeof handoff.sourceShard !== "string" ||
    typeof handoff.targetShard !== "string" ||
    typeof handoff.updatedAt !== "number" ||
    typeof handoff.expiresAt !== "number"
  ) {
    return null;
  }

  return {
    sourceShard: handoff.sourceShard,
    targetShard: handoff.targetShard,
    updatedAt: handoff.updatedAt,
    expiresAt: handoff.expiresAt,
    memory,
  };
}

function cloneMemory(
  memory: Record<string, unknown>,
): Record<string, unknown> | null {
  try {
    const cloned: unknown = JSON.parse(JSON.stringify(memory));
    return asPlainObject(cloned);
  } catch {
    return null;
  }
}

function asPlainObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
