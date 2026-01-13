/**
 * Nuke Defense Module
 * 
 * Handles defensive responses to incoming nukes and counter-nuke strategies
 */

import { logger } from "@ralphschuler/screeps-core";
import type { IncomingNukeAlert, EmpireMemory, SwarmState, RoomIntel } from "../types";
import type { NukeConfig } from "./types";
import { NUKE_COST } from "./types";

/**
 * Trigger evacuation procedures for a room under nuke threat
 */
export function triggerEvacuation(
  room: Room,
  alert: IncomingNukeAlert,
  swarm: SwarmState
): void {
  // Update posture to evacuate if impact is imminent
  if (alert.timeToLand < 5000) {
    swarm.posture = "evacuate";
    logger.warn(
      `EVACUATION TRIGGERED for ${room.name}: Critical structures threatened by nuke!`,
      { subsystem: "Nuke" }
    );
  } else {
    // Set defensive posture and prepare
    if (swarm.posture !== "war" && swarm.posture !== "evacuate") {
      swarm.posture = "defensive";
    }
    logger.warn(
      `NUKE DEFENSE PREPARATION in ${room.name}: Critical structures in blast radius`,
      { subsystem: "Nuke" }
    );
  }

  // Increase defense pheromone
  swarm.pheromones.defense = 100;
}

/**
 * Process counter-nuke strategies
 * Identify nuke sources and consider retaliatory strikes
 */
export function processCounterNukeStrategies(
  empire: EmpireMemory,
  config: NukeConfig,
  getSwarmState: (roomName: string) => SwarmState | undefined,
  canAffordNuke: () => boolean
): void {
  if (!empire.incomingNukes || empire.incomingNukes.length === 0) return;

  for (const alert of empire.incomingNukes) {
    // Only process if source room is identified
    if (!alert.sourceRoom) continue;

    // Check if already a war target
    if (empire.warTargets.includes(alert.sourceRoom)) continue;

    // Verify conditions for counter-nuke
    const sourceRoomIntel = empire.knownRooms[alert.sourceRoom];
    if (!sourceRoomIntel) continue;

    // Enemy must have RCL8 (nuker capability)
    if (sourceRoomIntel.controllerLevel < 8) continue;

    // Check war pheromone in our room
    const swarm = getSwarmState(alert.roomName);
    if (!swarm || swarm.pheromones.war < config.counterNukeWarThreshold) continue;

    // Check if we have resources for counter-strike
    const hasResources = canAffordNuke();
    if (!hasResources) {
      logger.warn(
        `Counter-nuke desired against ${alert.sourceRoom} but insufficient resources`,
        { subsystem: "Nuke" }
      );
      continue;
    }

    // Add to war targets for retaliation
    if (!empire.warTargets.includes(alert.sourceRoom)) {
      empire.warTargets.push(alert.sourceRoom);
      logger.warn(
        `COUNTER-NUKE AUTHORIZED: ${alert.sourceRoom} added to war targets for nuke retaliation`,
        { subsystem: "Nuke" }
      );

      // Increase war pheromone across empire
      for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (room.controller?.my) {
          const roomSwarm = getSwarmState(roomName);
          if (roomSwarm) {
            roomSwarm.pheromones.war = Math.min(100, roomSwarm.pheromones.war + 30);
          }
        }
      }
    }
  }
}

/**
 * Check if we have resources to afford a nuke launch
 */
export function canAffordNuke(): boolean {
  let totalEnergy = 0;
  let totalGhodium = 0;

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    if (room.storage) {
      totalEnergy += room.storage.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
    }
    if (room.terminal) {
      totalEnergy += room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
      totalGhodium += room.terminal.store.getUsedCapacity(RESOURCE_GHODIUM) || 0;
    }
  }

  return totalEnergy >= NUKE_COST.ENERGY * 2 && totalGhodium >= NUKE_COST.GHODIUM * 2;
}
