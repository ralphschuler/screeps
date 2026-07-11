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
  const incomingNukes = empire.incomingNukes ?? (empire.incomingNukes = []);

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    const swarm = getSwarmState(roomName);
    if (!swarm) continue;

    const nukes = room.find(FIND_NUKES);

    if (nukes.length > 0) {
      // Process each nuke. IDs are stable across ticks and keep same-tile salvos separate.
      nukes.forEach((nuke, index) => {
        const timeToLand = nuke.timeToLand || 0;
        const impactTick = Game.time + timeToLand;
        const nukeId = getNukeTrackingId(nuke, roomName, index, impactTick);
        const existingAlert = incomingNukes.find(alert => alert.nukeId === nukeId)
          // Migrate one legacy coordinate-keyed alert when an ID becomes available.
          ?? incomingNukes.find(alert =>
            !alert.nukeId &&
            alert.roomName === roomName &&
            alert.landingPos.x === nuke.pos.x &&
            alert.landingPos.y === nuke.pos.y &&
            alert.impactTick === impactTick
          );

        if (!existingAlert) {
          // New nuke detected - create alert
          const alert: IncomingNukeAlert = {
            nukeId,
            roomName,
            landingPos: { x: nuke.pos.x, y: nuke.pos.y },
            impactTick,
            timeToLand,
            detectedAt: Game.time,
            evacuationTriggered: false,
            sourceRoom: nuke.launchRoomName
          };

          // Identify threatened structures
          const threatenedStructures = identifyThreatenedStructures(room, nuke.pos);
          alert.threatenedStructures = threatenedStructures;

          incomingNukes.push(alert);

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
          // Update existing alert and attach an ID to legacy memory on first observation.
          existingAlert.nukeId = nukeId;
          existingAlert.impactTick = impactTick;
          existingAlert.timeToLand = timeToLand;
          existingAlert.sourceRoom = nuke.launchRoomName;
        }
      });
    } else if (swarm.nukeDetected) {
      // Nukes cleared (either impacted or something else)
      swarm.nukeDetected = false;
      logger.info(`Nuke threat cleared in ${roomName}`, { subsystem: "Nuke" });
    }
  }
}

/**
 * Return a stable per-object key for nuke alerts.
 *
 * Live Screeps nukes always expose `id`. The deterministic fallback keeps unit
 * and private-server doubles without an ID distinct within one room scan.
 */
function getNukeTrackingId(
  nuke: Pick<Nuke, "id" | "pos" | "timeToLand" | "launchRoomName">,
  roomName: string,
  index: number,
  impactTick: number
): string {
  if (nuke.id) return String(nuke.id);

  return [
    "fallback",
    roomName,
    nuke.pos.x,
    nuke.pos.y,
    impactTick,
    nuke.launchRoomName || "unknown",
    index
  ].join(":");
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
