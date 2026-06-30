/**
 * Bot compatibility adapter for room visualization.
 *
 * Framework-owned implementation lives in `@ralphschuler/screeps-visuals`.
 * Keep this file thin so `packages/screeps-bot` remains composition-only.
 */

import { memoryManager } from "@ralphschuler/screeps-memory";
import { RoomVisualizer as FrameworkRoomVisualizer } from "@ralphschuler/screeps-visuals";
import type { VisualizerConfig } from "@ralphschuler/screeps-visuals";

export type { VisualizerConfig } from "@ralphschuler/screeps-visuals";

export class RoomVisualizer extends FrameworkRoomVisualizer {
  public constructor(config: Partial<VisualizerConfig> = {}) {
    super(config, memoryManager);
  }
}

export const roomVisualizer = new RoomVisualizer();
