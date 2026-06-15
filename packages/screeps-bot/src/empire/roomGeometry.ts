/**
 * Room geometry helpers
 *
 * Shared utilities for parsing room names and classifying world-geometry
 * properties (highway / source keeper rooms).
 */

interface ParsedRoomCoordinate {
  x: number;
  y: number;
  xDir: "W" | "E";
  yDir: "N" | "S";
}

const ROOM_NAME_RE = /^([WE])(\d+)([NS])(\d+)$/;

/**
 * Parse a room name into signed map coordinates.
 *
 * W/N rooms become negative coordinates and are shifted by one to preserve
 * adjacency rules (e.g. W0 is -1, W1 is -2).
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
 * Parse a room name into raw map coordinates (without the W/N signed shift).
 */
interface ParsedRoomCoordinateRaw {
  x: number;
  y: number;
}

function parseRoomNameRaw(roomName: string): ParsedRoomCoordinateRaw | null {
  const match = ROOM_NAME_RE.exec(roomName);
  if (!match) return null;

  return {
    x: Number.parseInt(match[2], 10),
    y: Number.parseInt(match[4], 10)
  };
}

/**
 * Internal helper for source keeper bands based on signed coordinate modulo.
 */
function sourceKeeperBand(value: number): boolean {
  const offset = ((value % 10) + 10) % 10;
  return offset >= 4 && offset <= 6;
}

function isHighwayAxis(value: number): boolean {
  return value % 10 === 0;
}

/**
 * Check whether a room is a highway room.
 *
 * We classify by both signed and raw coordinate systems to stay consistent with
 * raw room-name conventions (e.g. W10 and E10 are both treated as highway
 * boundaries in historical map logic used by this bot).
 */
export function isHighwayRoom(roomName: string): boolean {
  const signed = parseRoomName(roomName);
  const raw = parseRoomNameRaw(roomName);
  if (!signed || !raw) return false;

  return isHighwayAxis(signed.x) || isHighwayAxis(signed.y) || isHighwayAxis(raw.x) || isHighwayAxis(raw.y);
}

/**
 * Check whether a room is a Source Keeper room.
 */
export function isSourceKeeperRoom(roomName: string): boolean {
  const parsed = parseRoomName(roomName);
  if (!parsed) return false;

  return sourceKeeperBand(parsed.x) && sourceKeeperBand(parsed.y);
}

/**
 * Classify a room name for intel-scoped geometry fields.
 */
export function classifyRoomName(roomName: string): { isHighway: boolean; isSK: boolean } {
  const parsed = parseRoomName(roomName);
  if (!parsed) {
    throw new Error(`Invalid room name: ${roomName}`);
  }

  return {
    isHighway: isHighwayRoom(roomName),
    isSK: sourceKeeperBand(parsed.x) && sourceKeeperBand(parsed.y)
  };
}

export type SignedRoomCoordinate = ParsedRoomCoordinate;
