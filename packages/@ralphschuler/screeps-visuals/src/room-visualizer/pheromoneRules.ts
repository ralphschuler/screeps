/**
 * Pheromone visual classification rules.
 *
 * These helpers mirror the swarm pheromone model from ROADMAP.md: room-local
 * numeric signals are presented as compact bars and a single dominant overlay.
 */

import type { PheromoneState } from "../types";

/** Color scheme for pheromone bars and the dominant-room overlay. */
export const PHEROMONE_COLORS: Record<string, string> = {
  expand: "#00ff00",
  harvest: "#ffff00",
  build: "#ff8800",
  upgrade: "#0088ff",
  defense: "#ff0000",
  war: "#ff00ff",
  siege: "#880000",
  logistics: "#00ffff",
  nukeTarget: "#ff0088"
};

/** Minimum pheromone value before the room-wide heatmap appears. */
export const HEATMAP_MIN_THRESHOLD = 10;

/** Normalization value used by bars and heatmap opacity. */
const PHEROMONE_DISPLAY_MAX = 100;

/** Compact summary of the signal that should get the heatmap overlay. */
export interface DominantPheromone {
  name: keyof PheromoneState;
  value: number;
  color: string;
  opacity: number;
}

/** Get a display color, falling back for custom/unknown pheromone keys. */
export function getPheromoneColor(name: keyof PheromoneState): string {
  return PHEROMONE_COLORS[name] ?? "#888888";
}

/** Convert a pheromone value to a bounded bar width. */
export function getPheromoneBarFillWidth(value: number, barWidth: number, maxValue = PHEROMONE_DISPLAY_MAX): number {
  return Math.min(1, value / maxValue) * barWidth;
}

/**
 * Find the single room signal worth showing as a heatmap overlay.
 *
 * The threshold remains strict (`> 10`) to preserve the previous visual noise
 * filter: a value of exactly 10 is not displayed.
 */
export function getDominantPheromone(
  pheromones: PheromoneState,
  threshold = HEATMAP_MIN_THRESHOLD
): DominantPheromone | null {
  let name: keyof PheromoneState | null = null;
  let value = threshold;

  for (const [key, candidate] of Object.entries(pheromones) as [keyof PheromoneState, number][]) {
    if (candidate > value) {
      name = key;
      value = candidate;
    }
  }

  if (!name) return null;

  return {
    name,
    value,
    color: getPheromoneColor(name),
    opacity: Math.min(1, value / PHEROMONE_DISPLAY_MAX) * 0.15
  };
}
