/**
 * Nuke Logistics Module
 * 
 * Handles resource accumulation, nuker loading, and terminal transfers for nuke operations
 */

import { logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory } from "../types";
import type { NukeConfig } from "./types";

/**
 * Load nukers with energy and ghodium
 */
export function loadNukers(): void {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    const nuker = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_NUKER
    })[0] as StructureNuker | undefined;

    if (!nuker) continue;

    // Check if nuker needs resources
    const energyNeeded = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
    const ghodiumNeeded = nuker.store.getFreeCapacity(RESOURCE_GHODIUM);

    if (energyNeeded > 0 || ghodiumNeeded > 0) {
      logger.debug(`Nuker in ${roomName} needs ${energyNeeded} energy, ${ghodiumNeeded} ghodium`, {
        subsystem: "Nuke"
      });
      // Terminal manager should handle transfers
    }
  }
}

/**
 * Manage resource accumulation for nukers
 * Coordinates with terminal manager to prepare nuke resources
 */
export function manageNukeResources(
  empire: EmpireMemory,
  config: NukeConfig,
  nukerReadyLogged: Set<string>,
  requestResourceTransfer: (roomName: string, resourceType: ResourceConstant, amount: number) => void
): void {
  // Only manage resources if in war mode
  if (!empire.objectives.warMode) return;

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    const nuker = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_NUKER
    })[0] as StructureNuker | undefined;

    if (!nuker) continue;

    const terminal = room.terminal;
    if (!terminal || !terminal.my) continue;

    // Check what resources nuker needs
    const energyNeeded = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
    const ghodiumNeeded = nuker.store.getFreeCapacity(RESOURCE_GHODIUM);

    // Request ghodium if needed and terminal doesn't have enough
    if (ghodiumNeeded > 0) {
      const terminalGhodium = terminal.store.getUsedCapacity(RESOURCE_GHODIUM) ?? 0;
      if (terminalGhodium < ghodiumNeeded) {
        // Create terminal transfer request (implementation depends on terminal manager)
        requestResourceTransfer(roomName, RESOURCE_GHODIUM, ghodiumNeeded - terminalGhodium);
      }
    }

    // Log nuker readiness status (track in Set to avoid spam)
    const nukerId = `${roomName}-nuker`;
    if (energyNeeded === 0 && ghodiumNeeded === 0) {
      if (!nukerReadyLogged.has(nukerId)) {
        logger.info(`Nuker in ${roomName} is fully loaded and ready to launch`, {
          subsystem: "Nuke"
        });
        nukerReadyLogged.add(nukerId);
      }
    } else {
      nukerReadyLogged.delete(nukerId);
    }
  }
}

/**
 * Request resource transfer via terminal manager
 */
export function createResourceTransferRequest(
  roomName: string,
  resourceType: ResourceConstant,
  amount: number,
  config: NukeConfig,
  terminalManager: { requestTransfer: (from: string, to: string, type: ResourceConstant, amt: number, priority: number) => boolean }
): void {
  // Find a donor room with this resource
  const donorRoom = findDonorRoom(roomName, resourceType, amount, config);
  if (!donorRoom) {
    logger.debug(
      `No donor room found for ${amount} ${resourceType} to ${roomName}`,
      { subsystem: "Nuke" }
    );
    return;
  }

  const success = terminalManager.requestTransfer(
    donorRoom,
    roomName,
    resourceType,
    amount,
    config.terminalPriority
  );

  if (success) {
    logger.info(
      `Requested ${amount} ${resourceType} transfer from ${donorRoom} to ${roomName} for nuker`,
      { subsystem: "Nuke" }
    );
  }
}

/**
 * Find a room that can donate the requested resource
 */
export function findDonorRoom(
  targetRoom: string,
  resourceType: ResourceConstant,
  amount: number,
  config: NukeConfig
): string | null {
  const candidates: { room: string; amount: number; distance: number }[] = [];

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my || roomName === targetRoom) continue;

    const terminal = room.terminal;
    if (!terminal || !terminal.my) continue;

    const available = terminal.store.getUsedCapacity(resourceType) ?? 0;
    
    // Must have at least the requested amount + buffer
    if (available < amount + config.donorRoomBuffer) continue;

    const distance = Game.map.getRoomLinearDistance(roomName, targetRoom);
    candidates.push({ room: roomName, amount: available, distance });
  }

  if (candidates.length === 0) return null;

  // Sort by distance (prefer closer rooms)
  candidates.sort((a, b) => a.distance - b.distance);

  return candidates[0]?.room ?? null;
}
