/**
 * Pioneer demand selection.
 *
 * Pioneers are cross-room bootstrap creeps for owned rooms that have no spawn.
 * This module assigns exactly one viable parent room to each target, then counts
 * active and queued pioneers so bootstrap waves stay bounded.
 */
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmCreepMemory, SwarmState } from "@ralphschuler/screeps-memory";
import { getEffectiveRoomEnergyAvailable } from "../roomEnergy";
import { spawnQueue, SpawnPriority } from "../spawnQueue";
import {
  getSafeRoomLinearDistance,
  getSpawnQueueRoomNames,
  hasDangerousHostile,
  hasUnsafeRemoteIntel,
  isControlledByOtherPlayer,
  roomHasOwnedSpawn
} from "./shared";

const MAX_PIONEERS_PER_SPAWN_SITE = 3;
const MIN_PIONEER_BODY_COST = 200;
const DEFAULT_ROUTE_DISTANCE = 999;

interface PioneerParentScore {
  room: Room;
  routeDistance: number;
  linearDistance: number;
  queuePressure: number;
  energyCapacity: number;
  hasAvailableSpawn: boolean;
  hasReadyEnergy: boolean;
}

const pioneerRouteDistanceCache = new Map<string, number | null>();
let pioneerRouteDistanceCacheGame: Game | undefined;
let pioneerRouteDistanceCacheMap: GameMap | undefined;
let pioneerRouteDistanceCacheTick: number | undefined;

export interface PioneerSpawnAssignment {
  targetRoom: string;
  task: "bootstrapSpawn";
  priority: SpawnPriority;
}

function resetPioneerRouteDistanceCacheForCurrentTick(): void {
  if (
    pioneerRouteDistanceCacheGame === Game &&
    pioneerRouteDistanceCacheMap === Game.map &&
    pioneerRouteDistanceCacheTick === Game.time
  ) {
    return;
  }
  pioneerRouteDistanceCache.clear();
  pioneerRouteDistanceCacheGame = Game;
  pioneerRouteDistanceCacheMap = Game.map;
  pioneerRouteDistanceCacheTick = Game.time;
}

function getFallbackRouteDistance(fromRoom: string, toRoom: string): number {
  return getSafeRoomLinearDistance(fromRoom, toRoom) ?? DEFAULT_ROUTE_DISTANCE;
}

function getPioneerRouteRoomCost(roomName: string, targetRoomName: string): number {
  if (roomName === targetRoomName) return 1;

  const visibleRoom = Game.rooms[roomName];
  if (visibleRoom?.controller?.my) return 1;
  if (visibleRoom?.controller && isControlledByOtherPlayer(visibleRoom.controller)) return Infinity;
  if (hasUnsafeRemoteIntel(roomName)) return Infinity;
  if (visibleRoom && hasDangerousHostile(visibleRoom)) return Infinity;

  return 1;
}

function getSafePioneerRouteDistance(fromRoom: string, toRoom: string): number | null {
  resetPioneerRouteDistanceCacheForCurrentTick();

  const key = `${fromRoom}->${toRoom}`;
  if (pioneerRouteDistanceCache.has(key)) return pioneerRouteDistanceCache.get(key) ?? null;

  let distance: number | null = getFallbackRouteDistance(fromRoom, toRoom);
  try {
    if (typeof Game.map?.findRoute === "function") {
      const route = Game.map.findRoute(fromRoom, toRoom, {
        routeCallback: roomName => getPioneerRouteRoomCost(roomName, toRoom)
      });
      distance = route === ERR_NO_PATH ? null : route.length;
    }
  } catch {
    distance = getFallbackRouteDistance(fromRoom, toRoom);
  }

  pioneerRouteDistanceCache.set(key, distance);
  return distance;
}

function getAvailableSpawnCount(room: Room): number {
  try {
    return room.find(FIND_MY_SPAWNS).filter(spawn => !spawn.spawning).length;
  } catch {
    return 0;
  }
}

function getParentQueuePressure(roomName: string, targetRoomName: string): number {
  return spawnQueue.getPendingRequests(roomName).reduce((total, request) => {
    const sameTargetPioneer =
      request.role === "pioneer" &&
      request.targetRoom === targetRoomName &&
      request.additionalMemory?.task === "bootstrapSpawn";
    if (sameTargetPioneer) return total;
    return total + 1 + Math.max(0, request.priority) / SpawnPriority.EMERGENCY;
  }, 0);
}

function getPioneerParentScore(room: Room, targetRoom: Room): PioneerParentScore | null {
  const energyCapacity = room.energyCapacityAvailable ?? 0;
  if (energyCapacity < MIN_PIONEER_BODY_COST) return null;

  const routeDistance = getSafePioneerRouteDistance(room.name, targetRoom.name);
  if (routeDistance === null) return null;

  return {
    room,
    routeDistance,
    linearDistance: getFallbackRouteDistance(room.name, targetRoom.name),
    queuePressure: getParentQueuePressure(room.name, targetRoom.name),
    energyCapacity,
    hasAvailableSpawn: getAvailableSpawnCount(room) > 0,
    hasReadyEnergy: getEffectiveRoomEnergyAvailable(room) >= MIN_PIONEER_BODY_COST
  };
}

function comparePioneerParentScores(a: PioneerParentScore, b: PioneerParentScore): number {
  return (
    Number(b.hasReadyEnergy) - Number(a.hasReadyEnergy) ||
    Number(b.hasAvailableSpawn) - Number(a.hasAvailableSpawn) ||
    a.queuePressure - b.queuePressure ||
    b.energyCapacity - a.energyCapacity ||
    a.routeDistance - b.routeDistance ||
    a.linearDistance - b.linearDistance ||
    a.room.name.localeCompare(b.room.name)
  );
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

function hasSpawnConstructionSite(targetRoom: Room): boolean {
  return targetRoom
    .find(FIND_MY_CONSTRUCTION_SITES)
    .some(site => site.structureType === STRUCTURE_SPAWN);
}

function getPioneerTargetCount(targetRoom: Room): number {
  return hasSpawnConstructionSite(targetRoom) ? MAX_PIONEERS_PER_SPAWN_SITE : 1;
}

function getPioneerPriority(targetRoom: Room): SpawnPriority {
  return hasSpawnConstructionSite(targetRoom) ? SpawnPriority.EMERGENCY : SpawnPriority.HIGH;
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
    .map(room => getPioneerParentScore(room, targetRoom))
    .filter((score): score is PioneerParentScore => score !== null)
    .sort(comparePioneerParentScores);

  return candidates[0]?.room.name ?? null;
}

/**
 * Assign a parent room to bootstrap a newly claimed owned room without spawns.
 * The best viable parent owns the target to avoid duplicate pioneer waves.
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
      homeScore: getPioneerParentScore(home, room)
    }))
    .filter((target): target is { room: Room; homeScore: PioneerParentScore } => target.homeScore !== null)
    .sort((a, b) =>
      a.homeScore.routeDistance - b.homeScore.routeDistance ||
      a.homeScore.linearDistance - b.homeScore.linearDistance ||
      a.room.name.localeCompare(b.room.name)
    );

  for (const target of spawnlessTargets) {
    if (getPioneerParentForTarget(target.room, homeRoom, swarm) === homeRoom) {
      return { targetRoom: target.room.name, task: "bootstrapSpawn", priority: getPioneerPriority(target.room) };
    }
  }

  return null;
}
