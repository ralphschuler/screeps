/**
 * Nuke Detection Module
 * 
 * Handles incoming nuke detection, alert creation, and structure threat identification
 */

import { logger } from "@ralphschuler/screeps-core";
import { NUKE_DAMAGE } from "./types";
import type { IncomingNukeAlert, EmpireMemory, SwarmState } from "../types";

/**
 * Detect incoming nukes in owned rooms and create alerts
 */
export function detectIncomingNukes(
  empire: EmpireMemory,
  getSwarmState: (roomName: string) => SwarmState | undefined
): void {
  if (!empire.incomingNukes) {
    empire.incomingNukes = [];
  }

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    const swarm = getSwarmState(roomName);
    if (!swarm) continue;

    const nukes = room.find(FIND_NUKES);

    if (nukes.length > 0) {
      // Process each nuke
      for (const nuke of nukes) {
        // Check if already tracked
        const existingAlert = empire.incomingNukes.find(
          a => a.roomName === roomName && 
               a.landingPos.x === nuke.pos.x && 
               a.landingPos.y === nuke.pos.y
        );

        if (!existingAlert) {
          // New nuke detected - create alert
          const alert: IncomingNukeAlert = {
            roomName,
            landingPos: { x: nuke.pos.x, y: nuke.pos.y },
            impactTick: Game.time + (nuke.timeToLand || 0),
            timeToLand: nuke.timeToLand || 0,
            detectedAt: Game.time,
            evacuationTriggered: false,
            sourceRoom: nuke.launchRoomName
          };

          // Identify threatened structures
          const threatenedStructures = identifyThreatenedStructures(room, nuke.pos);
          alert.threatenedStructures = threatenedStructures;

          empire.incomingNukes.push(alert);

          // Update swarm state
          if (!swarm.nukeDetected) {
            swarm.nukeDetected = true;
            swarm.pheromones.defense = Math.min(100, swarm.pheromones.defense + 50);
            swarm.pheromones.siege = Math.min(100, swarm.pheromones.siege + 30);
            swarm.danger = 3 as 0 | 1 | 2 | 3;

            logger.warn(
              `INCOMING NUKE DETECTED in ${roomName}! ` +
              `Landing at (${nuke.pos.x}, ${nuke.pos.y}), impact in ${nuke.timeToLand} ticks. ` +
              `Source: ${nuke.launchRoomName || "unknown"}. ` +
              `Threatened structures: ${threatenedStructures.length}`,
              { subsystem: "Nuke" }
            );

            // Add to event log
            swarm.eventLog.push({
              type: "nuke_incoming",
              time: Game.time,
              details: `Impact in ${nuke.timeToLand} ticks at (${nuke.pos.x},${nuke.pos.y})`
            });

            // Trim event log
            if (swarm.eventLog.length > 20) {
              swarm.eventLog.shift();
            }
          }
        } else {
          // Update existing alert
          existingAlert.timeToLand = nuke.timeToLand || 0;
        }
      }
    } else if (swarm.nukeDetected) {
      // Nukes cleared (either impacted or something else)
      swarm.nukeDetected = false;
      logger.info(`Nuke threat cleared in ${roomName}`, { subsystem: "Nuke" });
    }
  }
}

/**
 * Identify structures threatened by a nuke
 */
export function identifyThreatenedStructures(room: Room, landingPos: RoomPosition): string[] {
  const threatened: string[] = [];
  
  const structures = room.lookForAtArea(
    LOOK_STRUCTURES,
    Math.max(0, landingPos.y - NUKE_DAMAGE.RANGE),
    Math.max(0, landingPos.x - NUKE_DAMAGE.RANGE),
    Math.min(49, landingPos.y + NUKE_DAMAGE.RANGE),
    Math.min(49, landingPos.x + NUKE_DAMAGE.RANGE),
    true
  );

  for (const item of structures) {
    const structure = item.structure;
    const dx = Math.abs(structure.pos.x - landingPos.x);
    const dy = Math.abs(structure.pos.y - landingPos.y);
    const distance = Math.max(dx, dy);

    if (distance <= NUKE_DAMAGE.RANGE) {
      const damage = distance === 0 ? NUKE_DAMAGE.CENTER : NUKE_DAMAGE.RADIUS;
      if (structure.hits <= damage) {
        threatened.push(`${structure.structureType}-${structure.pos.x},${structure.pos.y}`);
      }
    }
  }

  return threatened;
}

/**
 * Check if an alert contains critical structures
 */
export function hasCriticalStructuresThreatened(alert: IncomingNukeAlert): boolean {
  if (!alert.threatenedStructures) return false;
  
  return alert.threatenedStructures.some(s => 
    s.includes(STRUCTURE_SPAWN) || 
    s.includes(STRUCTURE_STORAGE) || 
    s.includes(STRUCTURE_TERMINAL)
  );
}
