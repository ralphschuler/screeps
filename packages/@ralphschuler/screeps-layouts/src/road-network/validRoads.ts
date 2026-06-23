import {
  getCachedValidRoadPositions,
  getValidRoadPositionsCacheKey,
  setCachedValidRoadPositions
} from "./cache";
import { calculateExitRoads, findExistingExitRoads } from "./exitRoads";
import { calculateRoadNetwork } from "./infrastructure";
import { toRoadPositionKey } from "./positionKeys";
import { calculateRemoteRoads } from "./remoteRoads";

function addBlueprintRoads(
  validPositions: Set<string>,
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[]
): void {
  const terrain = room.getTerrain();

  for (const road of blueprintRoads) {
    const x = anchor.x + road.x;
    const y = anchor.y + road.y;
    if (x >= 1 && x <= 48 && y >= 1 && y <= 48 && terrain.get(x, y) !== TERRAIN_MASK_WALL) {
      validPositions.add(toRoadPositionKey({ x, y }));
    }
  }
}

function addInfrastructureRoads(validPositions: Set<string>, room: Room, anchor: RoomPosition): void {
  const roadNetwork = calculateRoadNetwork(room, anchor);
  for (const posKey of roadNetwork.positions) {
    validPositions.add(posKey);
  }
}

function addExitRoads(validPositions: Set<string>, room: Room): void {
  const storage = room.storage;
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  const hubPos = storage?.pos ?? spawn?.pos;

  if (!hubPos) return;

  const exitRoads = calculateExitRoads(room, hubPos);
  for (const posKey of exitRoads) {
    validPositions.add(posKey);
  }
}

function addRemoteRoads(validPositions: Set<string>, room: Room, remoteRooms: string[]): void {
  if (remoteRooms.length === 0) return;

  const remoteRoads = calculateRemoteRoads(room, remoteRooms);
  const homeRoomRoads = remoteRoads.get(room.name);
  if (!homeRoomRoads) return;

  for (const posKey of homeRoomRoads) {
    validPositions.add(posKey);
  }
}

/** Return cached planned roads, excluding live fallback protection. */
function getPlannedValidRoadPositions(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): Set<string> {
  const cacheKey = getValidRoadPositionsCacheKey(room.name, anchor, blueprintRoads, remoteRooms);
  const cached = getCachedValidRoadPositions(cacheKey);
  if (cached) {
    return cached;
  }

  const validPositions = new Set<string>();
  addBlueprintRoads(validPositions, room, anchor, blueprintRoads);
  addInfrastructureRoads(validPositions, room, anchor);
  addExitRoads(validPositions, room);
  addRemoteRoads(validPositions, room, remoteRooms);

  setCachedValidRoadPositions(cacheKey, {
    roomName: room.name,
    positions: validPositions,
    lastCalculated: Game.time
  });

  return validPositions;
}

/**
 * Get all valid road positions for a room.
 *
 * Combines blueprint roads, calculated infrastructure roads, permanent exit
 * roads, remote-mining roads, and live near-exit fallback protection.
 */
export function getValidRoadPositions(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): Set<string> {
  const validPositions = new Set(getPlannedValidRoadPositions(room, anchor, blueprintRoads, remoteRooms));

  const existingExitRoads = findExistingExitRoads(room);
  for (const posKey of existingExitRoads) {
    validPositions.add(posKey);
  }

  return validPositions;
}

/** Check if a position should be protected as part of the road network. */
export function isValidRoadPosition(
  room: Room,
  x: number,
  y: number,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): boolean {
  const validPositions = getValidRoadPositions(room, anchor, blueprintRoads, remoteRooms);
  return validPositions.has(`${x},${y}`);
}
