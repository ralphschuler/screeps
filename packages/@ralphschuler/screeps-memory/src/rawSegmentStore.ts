/**
 * Atomic RawMemory segment store for large serialized data sources.
 *
 * The store keeps only a compact manifest in normal Memory and stores each
 * source's raw serialized payload in one or more RawMemory segments. Writes are
 * copy-on-write: a source manifest is flipped only after every target segment is
 * active and written in the same tick, so a partial write cannot make readers
 * observe incomplete data.
 */

export const RAW_SEGMENT_STORE_VERSION = 1;
export const RAW_SEGMENT_COUNT = 100;
export const RAW_SEGMENT_ACTIVE_LIMIT = 10;
export const RAW_SEGMENT_SIZE_LIMIT = 100 * 1024;

export interface RawSegmentMemoryPort {
  segments: { [segmentId: number]: string };
  setActiveSegments(ids: number[]): void | undefined;
}

export interface RawSegmentRange {
  start: number;
  end: number;
}

export interface RawSegmentSourceManifest {
  segments: number[];
  length: number;
  checksum: string;
  revision: number;
  updatedAt: number;
}

export interface RawSegmentStoreManifest {
  version: typeof RAW_SEGMENT_STORE_VERSION;
  sources: Record<string, RawSegmentSourceManifest>;
}

export type RawSegmentEnqueueResult =
  | {
      ok: true;
      sourceId: string;
      requiredSegments: number;
    }
  | {
      ok: false;
      sourceId: string;
      reason: "invalid_source_id" | "source_too_large";
      requiredSegments: number;
      maxSegments: number;
    };

export interface RawSegmentBlockedWrite {
  sourceId: string;
  reason: "no_free_segments" | "active_segment_limit";
  requiredSegments: number;
}

export interface RawSegmentStoreRunResult {
  loadedSegments: number[];
  requestedSegments: number[];
  writesCommitted: string[];
  blockedWrites: RawSegmentBlockedWrite[];
  pendingWrites: number;
}

export interface RawSegmentBootstrapResult {
  ready: boolean;
  loadedSegments: number[];
  missingSegments: number[];
  requestedSegments: number[];
}

interface PendingRawSegmentWrite {
  sourceId: string;
  data: string;
  requiredSegments: number;
  targetSegments?: number[];
}

export interface RawSegmentStoreOptions {
  manifest: RawSegmentStoreManifest;
  rawMemory?: RawSegmentMemoryPort;
  segmentRange?: RawSegmentRange;
  segmentSizeLimit?: number;
  maxActiveSegments?: number;
  maxWritesPerTick?: number;
  getTime?: () => number;
}

function defaultRawMemory(): RawSegmentMemoryPort {
  const rawMemory = (globalThis as { RawMemory?: RawSegmentMemoryPort }).RawMemory;
  if (!rawMemory) {
    throw new Error("RawMemory is unavailable; pass a rawMemory port in tests or non-Screeps runtimes.");
  }
  return rawMemory;
}

function defaultTime(): number {
  const game = (globalThis as { Game?: { time?: number } }).Game;
  return typeof game?.time === "number" ? game.time : 0;
}

function validateRange(range: RawSegmentRange): RawSegmentRange {
  if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) {
    throw new Error("Raw segment range boundaries must be integers.");
  }
  if (range.start < 0 || range.end >= RAW_SEGMENT_COUNT || range.start > range.end) {
    throw new Error(`Invalid raw segment range ${range.start}-${range.end}; expected 0-99 with start <= end.`);
  }
  return range;
}

function countRequiredSegments(dataLength: number, segmentSizeLimit: number): number {
  return Math.max(1, Math.ceil(dataLength / segmentSizeLimit));
}

function splitIntoChunks(data: string, segmentSizeLimit: number): string[] {
  if (data.length === 0) return [""];

  const chunks: string[] = [];
  for (let offset = 0; offset < data.length; offset += segmentSizeLimit) {
    chunks.push(data.slice(offset, offset + segmentSizeLimit));
  }
  return chunks;
}

function uniqueSorted(values: Iterable<number>): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function isSegmentActive(rawMemory: RawSegmentMemoryPort, segmentId: number): boolean {
  return rawMemory.segments[segmentId] !== undefined;
}

function addRequestedSegments(requested: Set<number>, targetSegments: number[], limit: number): boolean {
  const next = new Set(requested);
  for (const segmentId of targetSegments) next.add(segmentId);
  if (next.size > limit) return false;

  requested.clear();
  for (const segmentId of next) requested.add(segmentId);
  return true;
}

export function createRawSegmentStoreManifest(): RawSegmentStoreManifest {
  return {
    version: RAW_SEGMENT_STORE_VERSION,
    sources: {}
  };
}

export function checksumRawSegmentData(data: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i += 1) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export class RawSegmentStore {
  private readonly manifest: RawSegmentStoreManifest;
  private readonly rawMemory: RawSegmentMemoryPort;
  private readonly segmentRange: RawSegmentRange;
  private readonly segmentSizeLimit: number;
  private readonly maxActiveSegments: number;
  private readonly maxWritesPerTick: number;
  private readonly getTime: () => number;
  private readonly loadedSegments = new Map<number, string>();
  private readonly pendingWrites = new Map<string, PendingRawSegmentWrite>();

  public constructor(options: RawSegmentStoreOptions) {
    this.manifest = options.manifest;
    this.rawMemory = options.rawMemory ?? defaultRawMemory();
    this.segmentRange = validateRange(options.segmentRange ?? { start: 0, end: RAW_SEGMENT_COUNT - 1 });
    this.segmentSizeLimit = options.segmentSizeLimit ?? RAW_SEGMENT_SIZE_LIMIT;
    this.maxActiveSegments = options.maxActiveSegments ?? RAW_SEGMENT_ACTIVE_LIMIT;
    this.maxWritesPerTick = options.maxWritesPerTick ?? 1;
    this.getTime = options.getTime ?? defaultTime;

    if (!Number.isInteger(this.segmentSizeLimit) || this.segmentSizeLimit <= 0) {
      throw new Error("segmentSizeLimit must be a positive integer.");
    }
    if (!Number.isInteger(this.maxActiveSegments) || this.maxActiveSegments <= 0 || this.maxActiveSegments > RAW_SEGMENT_ACTIVE_LIMIT) {
      throw new Error(`maxActiveSegments must be an integer from 1 to ${RAW_SEGMENT_ACTIVE_LIMIT}.`);
    }
    if (!Number.isInteger(this.maxWritesPerTick) || this.maxWritesPerTick <= 0) {
      throw new Error("maxWritesPerTick must be a positive integer.");
    }
  }

  public enqueueWrite(sourceId: string, data: string): RawSegmentEnqueueResult {
    const requiredSegments = countRequiredSegments(data.length, this.segmentSizeLimit);
    if (sourceId.trim().length === 0) {
      return {
        ok: false,
        sourceId,
        reason: "invalid_source_id",
        requiredSegments,
        maxSegments: this.maxActiveSegments
      };
    }

    if (requiredSegments > this.maxActiveSegments) {
      return {
        ok: false,
        sourceId,
        reason: "source_too_large",
        requiredSegments,
        maxSegments: this.maxActiveSegments
      };
    }

    this.pendingWrites.set(sourceId, {
      sourceId,
      data,
      requiredSegments
    });

    return {
      ok: true,
      sourceId,
      requiredSegments
    };
  }

  public run(): RawSegmentStoreRunResult {
    const loadedSegments = this.collectActiveSegments();
    const requestedSegments = new Set<number>();
    const writesCommitted: string[] = [];
    const blockedWrites: RawSegmentBlockedWrite[] = [];
    let attemptedWrites = 0;

    for (const pendingWrite of this.pendingWrites.values()) {
      if (attemptedWrites >= this.maxWritesPerTick) break;
      attemptedWrites += 1;

      if (!pendingWrite.targetSegments) {
        const targetSegments = this.allocateSegments(pendingWrite.requiredSegments);
        if (!targetSegments) {
          blockedWrites.push({
            sourceId: pendingWrite.sourceId,
            reason: "no_free_segments",
            requiredSegments: pendingWrite.requiredSegments
          });
          continue;
        }
        pendingWrite.targetSegments = targetSegments;
      }

      if (pendingWrite.targetSegments.every((segmentId) => isSegmentActive(this.rawMemory, segmentId))) {
        this.commitWrite(pendingWrite);
        writesCommitted.push(pendingWrite.sourceId);
        this.pendingWrites.delete(pendingWrite.sourceId);
        continue;
      }

      if (!addRequestedSegments(requestedSegments, pendingWrite.targetSegments, this.maxActiveSegments)) {
        blockedWrites.push({
          sourceId: pendingWrite.sourceId,
          reason: "active_segment_limit",
          requiredSegments: pendingWrite.requiredSegments
        });
      }
    }

    const requested = uniqueSorted(requestedSegments);
    if (requested.length > 0) {
      this.rawMemory.setActiveSegments(requested);
    }

    return {
      loadedSegments,
      requestedSegments: requested,
      writesCommitted,
      blockedWrites,
      pendingWrites: this.pendingWrites.size
    };
  }

  public requestMissingSegments(): RawSegmentBootstrapResult {
    const loadedSegments = this.collectActiveSegments();
    const missingSegments = this.getMissingSegmentIds();
    const requestedSegments = missingSegments.slice(0, this.maxActiveSegments);

    if (requestedSegments.length > 0) {
      this.rawMemory.setActiveSegments(requestedSegments);
    }

    return {
      ready: missingSegments.length === 0,
      loadedSegments,
      missingSegments,
      requestedSegments
    };
  }

  public read(sourceId: string): string | null {
    const source = this.manifest.sources[sourceId];
    if (!source) return null;

    const chunks: string[] = [];
    for (const segmentId of source.segments) {
      const activeSegment = this.rawMemory.segments[segmentId];
      const chunk = activeSegment ?? this.loadedSegments.get(segmentId);
      if (chunk === undefined) return null;
      chunks.push(chunk);
    }

    const data = chunks.join("");
    if (data.length !== source.length) return null;
    if (checksumRawSegmentData(data) !== source.checksum) return null;

    return data;
  }

  public has(sourceId: string): boolean {
    return this.manifest.sources[sourceId] !== undefined;
  }

  public releaseSource(sourceId: string): boolean {
    if (!this.manifest.sources[sourceId]) return false;
    delete this.manifest.sources[sourceId];
    this.pendingWrites.delete(sourceId);
    return true;
  }

  public getMissingSegmentIds(): number[] {
    const missing: number[] = [];
    for (const segmentId of this.getManifestSegmentIds()) {
      if (!this.loadedSegments.has(segmentId) && !isSegmentActive(this.rawMemory, segmentId)) {
        missing.push(segmentId);
      }
    }
    return missing;
  }

  public getLoadedSegmentIds(): number[] {
    this.collectActiveSegments();
    return uniqueSorted(this.loadedSegments.keys());
  }

  public isReady(): boolean {
    return this.getMissingSegmentIds().length === 0;
  }

  public getPendingWriteCount(): number {
    return this.pendingWrites.size;
  }

  private collectActiveSegments(): number[] {
    const loadedThisTick: number[] = [];
    for (const key of Object.keys(this.rawMemory.segments)) {
      const segmentId = Number(key);
      if (!Number.isInteger(segmentId)) continue;
      const value = this.rawMemory.segments[segmentId];
      if (value === undefined) continue;
      this.loadedSegments.set(segmentId, value);
      loadedThisTick.push(segmentId);
    }
    return uniqueSorted(loadedThisTick);
  }

  private getManifestSegmentIds(): number[] {
    const segmentIds: number[] = [];
    for (const source of Object.values(this.manifest.sources)) {
      segmentIds.push(...source.segments);
    }
    return uniqueSorted(segmentIds);
  }

  private allocateSegments(requiredSegments: number): number[] | null {
    const occupiedSegments = new Set<number>();
    for (const source of Object.values(this.manifest.sources)) {
      for (const segmentId of source.segments) occupiedSegments.add(segmentId);
    }
    for (const pendingWrite of this.pendingWrites.values()) {
      for (const segmentId of pendingWrite.targetSegments ?? []) occupiedSegments.add(segmentId);
    }

    const allocated: number[] = [];
    for (let segmentId = this.segmentRange.start; segmentId <= this.segmentRange.end; segmentId += 1) {
      if (occupiedSegments.has(segmentId)) continue;
      allocated.push(segmentId);
      if (allocated.length === requiredSegments) return allocated;
    }

    return null;
  }

  private commitWrite(pendingWrite: PendingRawSegmentWrite): void {
    if (!pendingWrite.targetSegments) return;

    const chunks = splitIntoChunks(pendingWrite.data, this.segmentSizeLimit);
    for (let i = 0; i < chunks.length; i += 1) {
      const segmentId = pendingWrite.targetSegments[i];
      this.rawMemory.segments[segmentId] = chunks[i];
      this.loadedSegments.set(segmentId, chunks[i]);
    }

    const previousRevision = this.manifest.sources[pendingWrite.sourceId]?.revision ?? 0;
    this.manifest.sources[pendingWrite.sourceId] = {
      segments: [...pendingWrite.targetSegments],
      length: pendingWrite.data.length,
      checksum: checksumRawSegmentData(pendingWrite.data),
      revision: previousRevision + 1,
      updatedAt: this.getTime()
    };
  }
}
