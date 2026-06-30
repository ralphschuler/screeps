import type { CreepAction } from "../types";

/** Shared room-navigation helpers for utility creeps. */
export const ROOM_CENTER_X = 25;
export const ROOM_CENTER_Y = 25;

/**
 * Create a moveTo action targeting the center of a room.
 * Utility creeps use this to step off exits before picking their next task.
 */
export function moveToRoomCenter(roomName: string): CreepAction {
  return {
    type: "moveTo",
    target: new RoomPosition(ROOM_CENTER_X, ROOM_CENTER_Y, roomName)
  };
}
