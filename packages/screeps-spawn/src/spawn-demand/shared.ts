import { getActualHostileCreeps, hasActiveDefenseThreat } from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";

/**
 * Best-effort room distance lookup.
 *
 * Screeps private-server map grid data can be temporarily unavailable during CI
 * bootstrap. If Game.map throws there, scouting should degrade gracefully instead
 * of crashing the spawn pipeline.
 */
export function getSafeRoomLinearDistance(fromRoom: string, toRoom: string): number | null {
  try {
    const distance = Game.map?.getRoomLinearDistance?.(fromRoom, toRoom);
    return Number.isFinite(distance) ? distance : null;
  } catch {
    return null;
  }
}

/** Identify the bot owner from any owned spawn visible in the current shard. */
export function getMyUsername(): string {
  const spawns = Object.values(Game.spawns ?? {});
  if (spawns.length > 0) {
    return spawns[0].owner.username;
  }
  return "";
}

export function getControllerOwnerName(controller: StructureController): string | undefined {
  return controller.owner?.username;
}

export function getControllerReserverName(controller: StructureController): string | undefined {
  return controller.reservation?.username;
}

/** True when a visible controller is unavailable to this bot. */
export function isControlledByOtherPlayer(controller: StructureController): boolean {
  const myUsername = getMyUsername();
  const owner = getControllerOwnerName(controller);
  if (owner && owner !== myUsername) return true;

  const reserver = getControllerReserverName(controller);
  return Boolean(reserver && reserver !== myUsername);
}

/** True when cached intel says an unobserved remote is unsafe for economy use. */
export function hasUnsafeRemoteIntel(roomName: string): boolean {
  const intel = memoryManager.getEmpire().knownRooms[roomName];
  if (!intel) return false;

  const myUsername = getMyUsername();
  if (intel.owner && intel.owner !== myUsername) return true;
  if (intel.reserver && intel.reserver !== myUsername) return true;
  if (intel.threatLevel > 0) return true;
  if (intel.isSK) return true;

  return false;
}

/** Combat-capable hostile creeps that require local/remote response. */
export function hasDangerousHostile(room: Room, hostiles = getActualHostileCreeps(room)): boolean {
  return hostiles.some(hasActiveDefenseThreat);
}

export function roomHasOwnedSpawn(room: Room): boolean {
  return room.find(FIND_MY_SPAWNS).length > 0;
}

/**
 * Rooms whose queues can contain assignments for global utility creeps.
 * Includes visible owned rooms plus spawn rooms; tests and private-server setup
 * can expose a spawn room before the matching Room object is fully hydrated.
 */
export function getSpawnQueueRoomNames(): string[] {
  const queueRoomNames = new Set<string>();
  for (const roomName in Game.rooms) {
    if (Game.rooms[roomName]?.controller?.my) {
      queueRoomNames.add(roomName);
    }
  }
  for (const spawnName in Game.spawns ?? {}) {
    const spawnRoom = Game.spawns[spawnName]?.room?.name;
    if (spawnRoom) queueRoomNames.add(spawnRoom);
  }
  return [...queueRoomNames];
}
