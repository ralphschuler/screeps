import { isKnownAllyPlayer } from "@ralphschuler/screeps-core";
import type { EmpireMemory } from "../types";

/**
 * Final nuke safety gate for permanent and runtime-configured allies.
 *
 * Operators may seed runtime allies in `empire.diplomacy.allies`,
 * `Memory.empire.diplomacy.allies`, or `Memory.diplomacy.allies`.
 */
export function isKnownAllyNukeTarget(roomName: string | undefined, empire: EmpireMemory): boolean {
  if (!roomName) return false;

  const intel = empire.knownRooms?.[roomName];
  const controller = Game.rooms[roomName]?.controller;
  const options = { empire };

  return (
    isKnownAllyPlayer(roomName, options) ||
    isKnownAllyPlayer(intel?.owner, options) ||
    isKnownAllyPlayer(intel?.reserver, options) ||
    isKnownAllyPlayer(controller?.owner?.username, options) ||
    isKnownAllyPlayer(controller?.reservation?.username, options)
  );
}
