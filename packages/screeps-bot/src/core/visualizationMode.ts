import type { MapVisualizerConfig } from "../visuals/mapVisualizer";
import type { VisualizerConfig } from "../visuals/roomVisualizer";
import type { BucketMode } from "./kernel";

/**
 * Visualization workload mode selected each tick.
 *
 * - off: skip visualizations entirely
 * - minimal: room-level health/queue only, sparse coverage, no map draw
 * - standard: room-level combat + economy/status, limited map context
 * - detailed: full presentation-level visualization stack where budget allows
 */
type VisualizationWorkload = "off" | "minimal" | "standard" | "detailed";

/**
 * Runtime inputs used to select the best visualization workload.
 */
export interface VisualizationWorkloadInput {
  hasCpuBudget: boolean;
  bucketMode: BucketMode;
  /** Exact bucket value from Game.cpu.bucket for finer workload control. */
  bucket: number;
  /** Number of visible owned rooms for this tick */
  ownedRoomCount: number;
}

/**
 * Precomputed visualization profile used by the renderer.
 */
export interface VisualizationProfile {
  workload: VisualizationWorkload;
  roomVisualizerConfig: Partial<VisualizerConfig>;
  mapVisualizerConfig: Partial<MapVisualizerConfig>;
  roomRenderStride: number;
  renderMap: boolean;
}

/**
 * Threshold for when normal bucket should drop into minimal mode.
 */
const NORMAL_MINIMAL_ROOM_THRESHOLD = 3;
/**
 * Minimum bucket to allow any visualization work.
 */
const MIN_BUCKET_FOR_VISUALS = 4000;
/**
 * Minimum bucket to allow expensive detailed visualization stack.
 */
const DETAILED_VISUAL_BUCKET = 8000;

/**
 * Return the correct visualization workload and config overrides.
 */
export function resolveVisualizationProfile(input: VisualizationWorkloadInput): VisualizationProfile {
  if (
    !input.hasCpuBudget ||
    input.bucketMode === "critical" ||
    input.bucketMode === "low" ||
    input.bucket < MIN_BUCKET_FOR_VISUALS
  ) {
    return {
      workload: "off",
      roomVisualizerConfig: {},
      mapVisualizerConfig: {},
      roomRenderStride: 1,
      renderMap: false
    };
  }

  if (input.bucketMode === "high" && input.bucket >= DETAILED_VISUAL_BUCKET) {
    return {
      workload: "detailed",
      roomVisualizerConfig: {
        showPheromones: false,
        showPaths: false,
        showCombat: true,
        showResourceFlow: true,
        showSpawnQueue: true,
        showRoomStats: true,
        showStructures: true,
        opacity: 0.6
      },
      mapVisualizerConfig: {
        showRoomStatus: true,
        showConnections: true,
        showThreats: true,
        showExpansion: false,
        showResourceFlow: false,
        showHighways: false,
        opacity: 0.6
      },
      roomRenderStride: 1,
      renderMap: true
    };
  }

  if (input.ownedRoomCount >= NORMAL_MINIMAL_ROOM_THRESHOLD) {
    return {
      workload: "minimal",
      roomVisualizerConfig: {
        showPheromones: false,
        showPaths: false,
        showCombat: false,
        showResourceFlow: false,
        showSpawnQueue: true,
        showRoomStats: true,
        showStructures: false,
        opacity: 0.4
      },
      mapVisualizerConfig: {
        showRoomStatus: false,
        showConnections: false,
        showThreats: false,
        showExpansion: false,
        showResourceFlow: false,
        showHighways: false,
        opacity: 0
      },
      roomRenderStride: 3,
      renderMap: false
    };
  }

  return {
    workload: "standard",
    roomVisualizerConfig: {
      showPheromones: false,
      showPaths: false,
      showCombat: true,
      showResourceFlow: false,
      showSpawnQueue: true,
      showRoomStats: true,
      showStructures: false,
      opacity: 0.5
    },
    mapVisualizerConfig: {
      showRoomStatus: true,
      showConnections: false,
      showThreats: true,
      showExpansion: false,
      showResourceFlow: false,
      showHighways: false,
      opacity: 0.5
    },
    roomRenderStride: 1,
    renderMap: true
  };
}

/**
 * Reduce room visualization work by spreading room renders across ticks when needed.
 */
export function selectRoomsForVisualization<T extends { name: string }>(rooms: T[], profile: VisualizationProfile): T[] {
  if (profile.roomRenderStride <= 1) {
    return rooms;
  }

  return rooms.filter((_, index) => index % profile.roomRenderStride === 0);
}

export type { VisualizationWorkload };
