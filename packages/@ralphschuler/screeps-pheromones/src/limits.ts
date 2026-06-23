import type { PheromoneConfig } from "./config";

/**
 * Keep every pheromone signal inside the configured numeric band.
 *
 * Pheromones are intentionally scalar signals in Room.memory. Centralizing the
 * bounds check keeps event spikes, periodic decay, and diffusion consistent.
 */
export function clampPheromoneValue(value: number, config: Pick<PheromoneConfig, "minValue" | "maxValue">): number {
  return Math.max(config.minValue, Math.min(config.maxValue, value));
}
