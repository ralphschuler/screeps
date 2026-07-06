import {
  createDefaultInterShardMemory,
  deserializeInterShardMemory,
  serializeInterShardMemory,
  type InterShardFootprintOperation,
  type InterShardMemorySchema
} from "./schema";

export type InterShardMemoryWriteSection = "shards" | "globalTargets" | "tasks" | "footprintOperation" | "lastSync";

export interface InterShardMemoryWriteOptions {
  /** Schema sections intentionally updated by this writer. Omitted sections are preserved from current storage. */
  updatedSections?: readonly InterShardMemoryWriteSection[];
}

const ALL_SECTIONS: readonly InterShardMemoryWriteSection[] = [
  "shards",
  "globalTargets",
  "tasks",
  "footprintOperation",
  "lastSync"
];

/**
 * Serialize an InterShardMemory schema update without erasing unrelated root namespaces.
 *
 * Portal intel and other framework subsystems share the same Screeps string under
 * root-level namespaced keys. This helper updates the compact `{ d, c }` schema
 * payload while preserving those root keys and, when requested, preserving schema
 * sections owned by other writers.
 */
export function serializeInterShardMemoryForWrite(
  nextMemory: InterShardMemorySchema,
  existingPayload = "",
  options: InterShardMemoryWriteOptions = {}
): string {
  const existingRoot = parsePayloadObject(existingPayload);
  const existingMemory = deserializeInterShardMemoryFromPayload(existingPayload, existingRoot);
  const mergedMemory = mergeInterShardMemorySchemas(existingMemory, nextMemory, options.updatedSections ?? ALL_SECTIONS);
  const nextRoot = parsePayloadObject(serializeInterShardMemory(mergedMemory)) ?? {};

  return JSON.stringify({ ...(existingRoot ?? {}), ...nextRoot });
}

/** Load local InterShardMemory, returning a safe default when unavailable or invalid. */
export function loadLocalInterShardMemory(defaultMemory: InterShardMemorySchema = createDefaultInterShardMemory()): InterShardMemorySchema {
  try {
    if (typeof InterShardMemory === "undefined") return defaultMemory;
    const raw = InterShardMemory.getLocal();
    if (!raw) return defaultMemory;
    return deserializeInterShardMemoryFromPayload(raw, parsePayloadObject(raw)) ?? defaultMemory;
  } catch {
    return defaultMemory;
  }
}

/** Write local InterShardMemory through the namespace-preserving merge path. */
export function writeLocalInterShardMemory(memory: InterShardMemorySchema, options: InterShardMemoryWriteOptions = {}): boolean {
  try {
    if (typeof InterShardMemory === "undefined") return false;
    const existing = InterShardMemory.getLocal();
    InterShardMemory.setLocal(serializeInterShardMemoryForWrite(memory, existing, options));
    return true;
  } catch {
    return false;
  }
}

function mergeInterShardMemorySchemas(
  existingMemory: InterShardMemorySchema | null,
  nextMemory: InterShardMemorySchema,
  updatedSections: readonly InterShardMemoryWriteSection[]
): InterShardMemorySchema {
  if (!existingMemory) return nextMemory;

  const sections = new Set<InterShardMemoryWriteSection>(updatedSections);

  return {
    version: nextMemory.version,
    shards: sections.has("shards") ? { ...existingMemory.shards, ...nextMemory.shards } : existingMemory.shards,
    globalTargets: sections.has("globalTargets")
      ? { ...existingMemory.globalTargets, ...nextMemory.globalTargets }
      : existingMemory.globalTargets,
    tasks: sections.has("tasks") ? nextMemory.tasks : existingMemory.tasks,
    footprintOperation: sections.has("footprintOperation")
      ? selectLatestFootprintOperation(existingMemory.footprintOperation, nextMemory.footprintOperation)
      : existingMemory.footprintOperation,
    lastSync: sections.has("lastSync") ? nextMemory.lastSync : existingMemory.lastSync,
    checksum: nextMemory.checksum
  };
}

function selectLatestFootprintOperation(
  existingOperation: InterShardFootprintOperation | undefined,
  nextOperation: InterShardFootprintOperation | undefined
): InterShardFootprintOperation | undefined {
  if (!existingOperation) return nextOperation;
  if (!nextOperation) return existingOperation;
  return nextOperation.updatedAt >= existingOperation.updatedAt ? nextOperation : existingOperation;
}

function deserializeInterShardMemoryFromPayload(
  payload: string,
  parsed: Record<string, unknown> | null
): InterShardMemorySchema | null {
  return parsed && hasCompactSchemaPayload(parsed) ? deserializeInterShardMemory(payload) : null;
}

function parsePayloadObject(payload: string): Record<string, unknown> | null {
  if (!payload) return {};

  try {
    const parsed: unknown = JSON.parse(payload);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hasCompactSchemaPayload(payload: Record<string, unknown>): boolean {
  return isPlainObject(payload.d) && typeof payload.c === "number";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
