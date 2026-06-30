/**
 * Pioneer demand selection.
 *
 * Pioneers are cross-room bootstrap creeps for owned rooms that have no spawn.
 * This module assigns exactly one closest eligible parent room to each target,
 * then counts active and queued pioneers so bootstrap waves stay bounded.
 */
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmCreepMemory, SwarmState } from "@ralphschuler/screeps-memory";
import { spawnQueue } from "../spawnQueue";
import {
  getSafeRoomLinearDistance,
  getSpawnQueueRoomNames,
  hasDangerousHostile,
  roomHasOwnedSpawn
} from "./shared";

const MAX_PIONEERS_PER_SPAWN_SITE = 3;

export interface PioneerSpawnAssignment {
  targetRoom: string;
  task: "bootstrapSpawn";
}

function countAssignedPioneers(targetRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.role === "pioneer" && memory.targetRoom === targetRoom && memory.task === "bootstrapSpawn") {
      count++;
    }
  }

  for (const roomName of getSpawnQueueRoomNames()) {
    count += spawnQueue.getPendingRequests(roomName).filter(request =>
      request.role === "pioneer" &&
      request.targetRoom === targetRoom &&
      request.additionalMemory?.task === "bootstrapSpawn"
    ).length;
  }

  return count;
}

function getPioneerTargetCount(targetRoom: Room): number {
  const hasSpawnSite = targetRoom
    .find(FIND_MY_CONSTRUCTION_SITES)
    .some(site => site.structureType === STRUCTURE_SPAWN);

  return hasSpawnSite ? MAX_PIONEERS_PER_SPAWN_SITE : 1;
}

function isEligiblePioneerParent(room: Room, activeHomeRoom: string, activeSwarm: SwarmState): boolean {
  if (!room.controller?.my) return false;
  if (!roomHasOwnedSpawn(room)) return false;

  const swarm = room.name === activeHomeRoom ? activeSwarm : memoryManager.getSwarmState(room.name);
  if ((swarm?.danger ?? 0) >= 2) return false;
  if (swarm?.posture === "war" || swarm?.posture === "siege" || swarm?.posture === "evacuate") return false;

  return true;
}

function getPioneerParentForTarget(targetRoom: Room, activeHomeRoom: string, activeSwarm: SwarmState): string | null {
  const candidates = Object.values(Game.rooms)
    .filter(room => room.name !== targetRoom.name)
    .filter(room => isEligiblePioneerParent(room, activeHomeRoom, activeSwarm))
    .map(room => ({
      room,
      distance: getSafeRoomLinearDistance(room.name, targetRoom.name) ?? 999
    }))
    .sort((a, b) => a.distance - b.distance || a.room.name.localeCompare(b.room.name));

  return candidates[0]?.room.name ?? null;
}

/**
 * Assign a parent room to bootstrap a newly claimed owned room without spawns.
 * The closest eligible parent owns the target to avoid duplicate pioneer waves.
 */
export function getPioneerSpawnAssignment(homeRoom: string, swarm: SwarmState): PioneerSpawnAssignment | null {
  const home = Game.rooms[homeRoom];
  if (!home || !isEligiblePioneerParent(home, homeRoom, swarm)) return null;

  const spawnlessTargets = Object.values(Game.rooms)
    .filter(room => room.name !== homeRoom)
    .filter(room => room.controller?.my)
    .filter(room => !roomHasOwnedSpawn(room))
    .filter(room => !hasDangerousHostile(room))
    .filter(room => countAssignedPioneers(room.name) < getPioneerTargetCount(room))
    .map(room => ({
      room,
      distance: getSafeRoomLinearDistance(homeRoom, room.name) ?? 999
    }))
    .sort((a, b) => a.distance - b.distance || a.room.name.localeCompare(b.room.name));

  for (const target of spawnlessTargets) {
    if (getPioneerParentForTarget(target.room, homeRoom, swarm) === homeRoom) {
      return { targetRoom: target.room.name, task: "bootstrapSpawn" };
    }
  }

  return null;
}
