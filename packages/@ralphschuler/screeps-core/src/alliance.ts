/**
 * Permanent non-aggression alliance helpers.
 *
 * ROADMAP/AGENTS policy: TooAngel and TedRoastBeef are permanent allies.
 * Runtime code must never attack, target, or count their entities as hostile.
 */

export const NON_AGGRESSION_PACT_PLAYERS = ["TooAngel", "TedRoastBeef"] as const;

export type AlliedPlayer = (typeof NON_AGGRESSION_PACT_PLAYERS)[number];

interface OwnedByUsername {
  owner?: {
    username?: string;
  };
}

function getOwnerUsername(entity: OwnedByUsername | Structure): string | undefined {
  return (entity as OwnedByUsername).owner?.username;
}

export function isAllyPlayer(username?: string | null): username is AlliedPlayer {
  return typeof username === "string" && (NON_AGGRESSION_PACT_PLAYERS as readonly string[]).includes(username);
}

export function isAllyOwned(entity: OwnedByUsername | Structure): boolean {
  return isAllyPlayer(getOwnerUsername(entity));
}

export function isAllyCreep(creep: Creep): boolean {
  return isAllyOwned(creep);
}

export function isAllyPowerCreep(powerCreep: PowerCreep): boolean {
  return isAllyOwned(powerCreep);
}

export function isAllyStructure(structure: Structure): boolean {
  return isAllyOwned(structure);
}

function filterAllies<T>(entities: T[], isAlly: (entity: T) => boolean): T[] {
  const firstAllyIndex = entities.findIndex(isAlly);
  if (firstAllyIndex === -1) return entities;

  return entities.filter(entity => !isAlly(entity));
}

export function filterAllyCreeps<T extends Creep>(hostiles: T[]): T[] {
  return filterAllies(hostiles, isAllyCreep);
}

export function filterAllyPowerCreeps<T extends PowerCreep>(hostiles: T[]): T[] {
  return filterAllies(hostiles, isAllyPowerCreep);
}

export function filterAllyStructures<T extends Structure>(structures: T[]): T[] {
  return filterAllies(structures, isAllyStructure);
}

export function getActualHostileCreeps(room: Room): Creep[] {
  return filterAllyCreeps(room.find(FIND_HOSTILE_CREEPS));
}

export function getActualHostilePowerCreeps(room: Room): PowerCreep[] {
  return filterAllyPowerCreeps(room.find(FIND_HOSTILE_POWER_CREEPS));
}

export function getActualHostileStructures(room: Room): Structure[] {
  return filterAllyStructures(room.find(FIND_HOSTILE_STRUCTURES));
}

export function hasActualHostiles(room: Room): boolean {
  return (
    getActualHostileCreeps(room).length > 0 ||
    getActualHostilePowerCreeps(room).length > 0 ||
    getActualHostileStructures(room).length > 0
  );
}
