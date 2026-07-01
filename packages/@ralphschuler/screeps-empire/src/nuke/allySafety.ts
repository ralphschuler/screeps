import { isKnownAllyPlayer } from "@ralphschuler/screeps-core";
import type { EmpireMemory } from "../types";

function getOwnerUsername(entity: unknown): string | undefined {
  return (entity as { owner?: { username?: string } }).owner?.username;
}

function hasKnownAllyOwnedEntity(entities: readonly unknown[], empire: EmpireMemory): boolean {
  const options = { empire };
  return entities.some(entity => isKnownAllyPlayer(getOwnerUsername(entity), options));
}

function hasVisibleKnownAllyNukeVictim(room: Room, empire: EmpireMemory): boolean {
  return (
    hasKnownAllyOwnedEntity(room.find(FIND_CREEPS), empire) ||
    hasKnownAllyOwnedEntity(room.find(FIND_POWER_CREEPS), empire) ||
    hasKnownAllyOwnedEntity(room.find(FIND_STRUCTURES), empire) ||
    hasKnownAllyOwnedEntity(room.find(FIND_CONSTRUCTION_SITES), empire)
  );
}

/**
 * Final nuke safety gate for permanent and runtime-configured allies.
 *
 * Nukes kill all creeps and construction sites in the target room, and damage
 * structures in the landing area. Treat any visible allied owned entity in the
 * target room as a hard block rather than risk friendly fire.
 *
 * Operators may seed runtime allies in `empire.diplomacy.allies`,
 * `Memory.empire.diplomacy.allies`, or `Memory.diplomacy.allies`.
 */
export function isKnownAllyNukeTarget(roomName: string | undefined, empire: EmpireMemory): boolean {
  if (!roomName) return false;

  const intel = empire.knownRooms?.[roomName];
  const room = Game.rooms[roomName];
  const controller = room?.controller;
  const options = { empire };

  return (
    isKnownAllyPlayer(roomName, options) ||
    isKnownAllyPlayer(intel?.owner, options) ||
    isKnownAllyPlayer(intel?.reserver, options) ||
    isKnownAllyPlayer(controller?.owner?.username, options) ||
    isKnownAllyPlayer(controller?.reservation?.username, options) ||
    (room ? hasVisibleKnownAllyNukeVictim(room, empire) : false)
  );
}
