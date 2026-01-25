/**
 * @ralphschuler/screeps-pheromones
 * 
 * Pheromone-based coordination system for Screeps swarm architecture.
 * Implements stigmergistic communication using virtual pheromones.
 */

export { PheromoneManager } from "./manager";
export { RollingAverage, createMetricsTracker, type RoomMetricsTracker } from "./rollingAverage";
export { DEFAULT_PHEROMONE_CONFIG, type PheromoneConfig } from "./config";
export { initializePheromoneEventHandlers } from "./eventHandlers";

// Global pheromone manager instance
import { PheromoneManager } from "./manager";
export const pheromoneManager = new PheromoneManager();
