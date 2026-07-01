/**
 * Room geometry helpers.
 *
 * Shared utilities for parsing room names and classifying world-geometry
 * properties such as highway and Source Keeper rooms.
 */

interface ParsedRoomCoordinate {
  x: number;
  y: number;
  xDir: "W" | "E";
  yDir: "N" | "S";
}

interface RawRoomCoordinate {
  x: number;
  y: number;
}

const ROOM_NAME_RE = /^([WE])(\d+)([NS])(\d+)$/;

/**
 * Parse a room name into signed map coordinates.
 *
 * W/N rooms become negative coordinates and are shifted by one to preserve
 * adjacency rules (W0 is -1, W1 is -2, etc.).
 */
export function parseRoomName(roomName: string): ParsedRoomCoordinate | null {
  const match = ROOM_NAME_RE.exec(roomName);
  if (!match) return null;

  const xIndex = Number.parseInt(match[2], 10);
  const yIndex = Number.parseInt(match[4], 10);

  return {
    x: match[1] === "W" ? -(xIndex + 1) : xIndex,
    y: match[3] === "N" ? -(yIndex + 1) : yIndex,
    xDir: match[1] as "W" | "E",
    yDir: match[3] as "N" | "S"
  };
}

/**
 * Parse a room name into raw Screeps room-name indices without signed shift.
 */
function parseRawRoomName(roomName: string): RawRoomCoordinate | null {
  const match = ROOM_NAME_RE.exec(roomName);
  if (!match) return null;

  return {
    x: Number.parseInt(match[2], 10),
    y: Number.parseInt(match[4], 10)
  };
}

function positiveModulo(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}

function isSourceKeeperBand(value: number): boolean {
  const offset = positiveModulo(value, 10);
  return offset >= 4 && offset <= 6;
}

function isHighwayAxis(value: number): boolean {
  return value % 10 === 0;
}

/**
 * Check whether a room is a highway room.
 *
 * Screeps highway classification uses the raw room-name indices: any room with
 * an X or Y index divisible by 10 is a highway corridor.
 */
export function isHighwayRoom(roomName: string): boolean {
  const raw = parseRawRoomName(roomName);
  if (!raw) return false;

  return isHighwayAxis(raw.x) || isHighwayAxis(raw.y);
}

/**
 * Check whether a room is in the Source Keeper band.
 */
export function isSourceKeeperRoom(roomName: string): boolean {
  const raw = parseRawRoomName(roomName);
  if (!raw) return false;

  return isSourceKeeperBand(raw.x) && isSourceKeeperBand(raw.y);
}

/**
 * Classify a room name for compact intel snapshots.
 */
export function classifyRoomName(roomName: string): { isHighway: boolean; isSK: boolean } {
  const raw = parseRawRoomName(roomName);
  if (!raw) {
    throw new Error(`Invalid room name: ${roomName}`);
  }

  return {
    isHighway: isHighwayAxis(raw.x) || isHighwayAxis(raw.y),
    isSK: isSourceKeeperBand(raw.x) && isSourceKeeperBand(raw.y)
  };
}

export type SignedRoomCoordinate = ParsedRoomCoordinate;
