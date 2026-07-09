import type { BucketMode } from "./kernel";

/**
 * Bucket mode thresholds for competitive tick scheduling.
 *
 * Matches `docs/COMPETITIVE_STRATEGY_AND_AGENT_PROMPT` behavior model.
 */
const BUCKET_FULL_THRESHOLD = 8000;
const BUCKET_NORMAL_THRESHOLD = 6000;
const BUCKET_DEGRADED_THRESHOLD = 1500;
const BUCKET_SURVIVAL_THRESHOLD = 500;

/**
 * Bucket work modes used for optional-tick planning and optional workloads.
 */
export type BucketWorkMode = "panic" | "survival" | "degraded" | "normal" | "full";

export interface BucketWorkModeInput {
  /** Current bucket value. */
  bucket: number;
}

export interface OptionalTickWorkInput {
  /** Whether kernel has remaining CPU budget this tick. */
  hasCpuBudget: boolean;
  /** Legacy mode from kernel for continuity and diagnostics. */
  bucketMode: BucketMode;
  /** Exact bucket value from Game.cpu.bucket for finer control. */
  bucket: number;
}

export interface PeriodicRoomWorkInput {
  tick: number;
  rooms: Room[];
  interval: number;
}

export function getBucketWorkMode(input: BucketWorkModeInput): BucketWorkMode {
  const bucket = Number.isFinite(input.bucket) ? input.bucket : 0;

  if (bucket >= BUCKET_FULL_THRESHOLD) {
    return "full";
  }

  if (bucket >= BUCKET_NORMAL_THRESHOLD) {
    return "normal";
  }

  if (bucket >= BUCKET_DEGRADED_THRESHOLD) {
    return "degraded";
  }

  if (bucket >= BUCKET_SURVIVAL_THRESHOLD) {
    return "survival";
  }

  return "panic";
}

export function shouldRunOptionalTickWork(input: OptionalTickWorkInput): boolean {
  // Defer optional work under degraded/survival/panic bucket conditions.
  // This avoids non-essential drift when CPU recovery is needed.
  const bucketMode = getBucketWorkMode({ bucket: input.bucket });

  return input.hasCpuBudget && (bucketMode === "normal" || bucketMode === "full");
}

export function selectRoomsForPeriodicWork(input: PeriodicRoomWorkInput): Room[] {
  const interval = Math.max(1, Math.floor(input.interval));

  if (interval === 1 || input.rooms.length <= 1) {
    return input.rooms;
  }

  return input.rooms.filter((_, index) => (input.tick + index) % interval === 0);
}
