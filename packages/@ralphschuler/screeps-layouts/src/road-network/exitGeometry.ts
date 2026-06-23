import type { ExitDirection } from "./types";

interface ParsedRoomName {
  x: number;
  y: number;
}

/**
 * Parse Screeps room names into signed coordinates without collapsing zero axes.
 *
 * Screeps has no W/E or N/S room named -1, so `W0` is immediately west of
 * `E0` and `S0` is immediately south of `N0`:
 * - horizontal: W1, W0, E0, E1 -> -2, -1, 0, 1
 * - vertical:   S1, S0, N0, N1 -> -2, -1, 0, 1
 */
function parseRoom(name: string): ParsedRoomName | null {
  const match = name.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return null;

  const horizontal = parseInt(match[2], 10);
  const vertical = parseInt(match[4], 10);

  return {
    x: match[1] === "E" ? horizontal : -horizontal - 1,
    y: match[3] === "N" ? vertical : -vertical - 1
  };
}

/**
 * Get the exit direction from one room to another.
 *
 * Returns null when room names are invalid or when the target is not adjacent
 * according to the planner's existing room-coordinate model.
 */
export function getExitDirection(fromRoom: string, toRoom: string): ExitDirection | null {
  const from = parseRoom(fromRoom);
  const to = parseRoom(toRoom);

  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    return null;
  }

  if (dx === 1) return "right";
  if (dx === -1) return "left";
  if (dy === 1) return "top";
  if (dy === -1) return "bottom";

  return null;
}

/** Return all walkable exit positions on one edge of a room. */
export function getExitPositions(roomName: string, direction: ExitDirection): RoomPosition[] {
  const positions: RoomPosition[] = [];
  const terrain = Game.map.getRoomTerrain(roomName);

  switch (direction) {
    case "top":
      for (let x = 0; x < 50; x++) {
        if (terrain.get(x, 0) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(x, 0, roomName));
        }
      }
      break;
    case "bottom":
      for (let x = 0; x < 50; x++) {
        if (terrain.get(x, 49) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(x, 49, roomName));
        }
      }
      break;
    case "left":
      for (let y = 0; y < 50; y++) {
        if (terrain.get(0, y) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(0, y, roomName));
        }
      }
      break;
    case "right":
      for (let y = 0; y < 50; y++) {
        if (terrain.get(49, y) !== TERRAIN_MASK_WALL) {
          positions.push(new RoomPosition(49, y, roomName));
        }
      }
      break;
  }

  return positions;
}

/** Pick the exit tile nearest to a starting position by Screeps room range. */
export function findClosestExit(from: RoomPosition, exitPositions: RoomPosition[]): RoomPosition | null {
  if (exitPositions.length === 0) return null;

  let closest = exitPositions[0];
  let minDist = from.getRangeTo(closest);

  for (const pos of exitPositions) {
    const dist = from.getRangeTo(pos);
    if (dist < minDist) {
      minDist = dist;
      closest = pos;
    }
  }

  return closest;
}

/** Check if a position is within a threshold of any room exit. */
export function isNearExit(pos: RoomPosition, distance: number): boolean {
  return (
    pos.x <= distance ||
    pos.x >= 49 - distance ||
    pos.y <= distance ||
    pos.y >= 49 - distance
  );
}
