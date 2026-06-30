/**
 * Bot compatibility adapter for map visualization.
 *
 * Framework-owned implementation lives in `@ralphschuler/screeps-visuals`.
 * Keep this file thin so `packages/screeps-bot` remains composition-only.
 */

import { memoryManager } from "@ralphschuler/screeps-memory";
import { MapVisualizer as FrameworkMapVisualizer } from "@ralphschuler/screeps-visuals";
import type { MapVisualizerConfig } from "@ralphschuler/screeps-visuals";

export type { MapVisualizerConfig } from "@ralphschuler/screeps-visuals";

export class MapVisualizer extends FrameworkMapVisualizer {
  public constructor(config: Partial<MapVisualizerConfig> = {}) {
    super(config, memoryManager);
  }
}

export const mapVisualizer = new MapVisualizer();
