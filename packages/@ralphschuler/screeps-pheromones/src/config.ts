/**
 * Pheromone system configuration
 */

import type { PheromoneState } from "@ralphschuler/screeps-memory";

/** Pheromone system configuration */
export interface PheromoneConfig {
  updateInterval: number;
  decayFactors: Record<keyof PheromoneState, number>;
  diffusionRates: Record<keyof PheromoneState, number>;
  maxValue: number;
  minValue: number;
}

/** Default pheromone configuration */
export const DEFAULT_PHEROMONE_CONFIG: PheromoneConfig = {
  updateInterval: 5,
  decayFactors: {
    expand: 0.95,
    harvest: 0.9,
    build: 0.92,
    upgrade: 0.93,
    defense: 0.97,
    war: 0.98,
    siege: 0.99,
    logistics: 0.91,
    nukeTarget: 0.99
  },
  diffusionRates: {
    expand: 0.3,
    harvest: 0.1,
    build: 0.15,
    upgrade: 0.1,
    defense: 0.4,
    war: 0.5,
    siege: 0.6,
    logistics: 0.2,
    nukeTarget: 0.1
  },
  maxValue: 100,
  minValue: 0
};
