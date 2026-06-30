import type { PortalDestination } from "./types";

/**
 * Convert Screeps' two portal destination shapes into the package's compact
 * room/shard shape.
 *
 * API fact checked against `node_modules/@types/screeps/index.d.ts`:
 * `StructurePortal.destination` is either a `RoomPosition` for same-shard
 * portals or `{ shard: string; room: string }` for inter-shard portals.
 */
export function normalizePortalDestination(destination: unknown): PortalDestination | null {
  if (isInterShardDestination(destination)) {
    return {
      shard: destination.shard,
      room: destination.room
    };
  }

  if (isRoomPositionDestination(destination)) {
    return { room: destination.roomName };
  }

  return null;
}

function isInterShardDestination(value: unknown): value is { shard: string; room: string } {
  if (!isObject(value)) return false;

  return typeof value.shard === "string" && typeof value.room === "string";
}

function isRoomPositionDestination(value: unknown): value is RoomPosition {
  if (!isObject(value)) return false;

  return (
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.roomName === "string"
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
