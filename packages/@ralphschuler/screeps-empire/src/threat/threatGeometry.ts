import { parseRoomName } from "@ralphschuler/screeps-core";

export interface TrackedHostileMovement {
  lastPos: { roomName: string };
  vector?: { dx: number; dy: number };
}

/**
 * Return a valid Screeps room name for signed map coordinates.
 *
 * Screeps crosses from W0/E0 and N0/S0 at zero, so string arithmetic on the
 * room-name indices is incorrect at those boundaries.
 */
function formatRoomName(x: number, y: number): string {
  const xName = x < 0 ? `W${Math.abs(x) - 1}` : `E${x}`;
  const yName = y < 0 ? `N${Math.abs(y) - 1}` : `S${y}`;
  return `${xName}${yName}`;
}

/** Get the four rooms adjacent to a valid room name. */
export function getAdjacentRooms(roomName: string): string[] {
  const coordinates = parseRoomName(roomName);
  if (!coordinates) return [];

  return [
    formatRoomName(coordinates.x, coordinates.y - 1),
    formatRoomName(coordinates.x, coordinates.y + 1),
    formatRoomName(coordinates.x + 1, coordinates.y),
    formatRoomName(coordinates.x - 1, coordinates.y)
  ];
}

/**
 * Check whether a tracked hostile is moving toward a target room.
 *
 * A hostile already inside the target room is an active threat regardless of
 * its local movement. For an adjacent room, direction is unknown without an
 * intra-room movement vector and must not be escalated speculatively.
 */
export function isHostileApproachingRoom(track: TrackedHostileMovement, targetRoom: string): boolean {
  if (track.lastPos.roomName === targetRoom) return true;

  const source = parseRoomName(track.lastPos.roomName);
  const target = parseRoomName(targetRoom);
  if (!source || !target || !track.vector) return false;

  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  if (Math.abs(deltaX) + Math.abs(deltaY) !== 1) return false;

  if (deltaX !== 0) return Math.sign(track.vector.dx) === Math.sign(deltaX);
  return Math.sign(track.vector.dy) === Math.sign(deltaY);
}
