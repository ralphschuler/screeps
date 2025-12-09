/**
 * Pheromone Event Handlers
 *
 * Registers event handlers to keep pheromones updated based on game events.
 * This completes the event-driven pheromone system as specified in ROADMAP section 5.
 */

import { kernel } from "../core/kernel";
import { pheromoneManager } from "./pheromone";
import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";

/**
 * Initialize pheromone event handlers
 * Should be called once during bot initialization
 */
export function initializePheromoneEventHandlers(): void {
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
