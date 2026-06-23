import type { RoadCoordinate } from "./types";

/** Compact position key used by blueprint validation and cache sets. */
export function toRoadPositionKey(pos: RoadCoordinate): string {
  return `${pos.x},${pos.y}`;
}

/** Convert a cached key back to room coordinates. */
export function parseRoadPositionKey(posKey: string): RoadCoordinate {
  const [xStr, yStr] = posKey.split(",");
  return {
    x: parseInt(xStr, 10),
    y: parseInt(yStr, 10)
  };
}

/** Add a same-room path to a coordinate-key set. */
export function addPathToSet(positions: Set<string>, path: RoomPosition[], roomName: string): void {
  for (const pos of path) {
    if (pos.roomName === roomName) {
      positions.add(toRoadPositionKey(pos));
    }
  }
}

/** Add path positions to a map keyed by each position's room name. */
export function addPathToRoomMap(result: Map<string, Set<string>>, path: RoomPosition[]): void {
  for (const pos of path) {
    if (!result.has(pos.roomName)) {
      result.set(pos.roomName, new Set());
    }
    result.get(pos.roomName)?.add(toRoadPositionKey(pos));
  }
}
