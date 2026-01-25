/**
 * Pheromone Event Handlers
 *
 * Registers event handlers to keep pheromones updated based on game events.
 * This completes the event-driven pheromone system as specified in ROADMAP section 5.
 */

import { logger } from "@ralphschuler/screeps-core";
import type { Kernel } from "@ralphschuler/screeps-kernel";
import type { MemoryManager } from "@ralphschuler/screeps-memory";
import type { PheromoneManager } from "./manager";

/**
 * Initialize pheromone event handlers
 * Should be called once during bot initialization
 */
export function initializePheromoneEventHandlers(
  kernel: Kernel,
  memoryManager: MemoryManager,
  pheromoneManager: PheromoneManager
): void {
  // Handle structure destroyed events
  kernel.on("structure.destroyed", (event) => {
    const swarm = memoryManager.getSwarmState(event.roomName);
    if (swarm) {
      pheromoneManager.onStructureDestroyed(swarm, event.structureType);
      logger.debug(`Pheromone update: structure destroyed in ${event.roomName}`, {
        subsystem: "Pheromone",
        room: event.roomName
      });
    }
  });

  // Handle remote room lost events
  kernel.on("remote.lost", (event) => {
    const swarm = memoryManager.getSwarmState(event.homeRoom);
    if (swarm) {
      pheromoneManager.onRemoteSourceLost(swarm);
      logger.info(`Pheromone update: remote source lost for ${event.homeRoom}`, {
        subsystem: "Pheromone",
        room: event.homeRoom
      });
    }
  });

  logger.info("Pheromone event handlers initialized", {
    subsystem: "Pheromone"
  });
}
