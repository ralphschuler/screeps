/**
 * Permanent and runtime-configured alliance helpers.
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

interface DiplomacyConfigMemory {
  allies?: unknown;
}

export interface AllyPolicyMemorySource {
  diplomacy?: DiplomacyConfigMemory;
}

export interface AllyPolicyOptions {
  /** Static/manual whitelist supplied by a caller or singleton config. */
  configuredAllies?: readonly string[];
  /** Runtime empire memory source, when already available to the caller. */
  empire?: unknown;
}

interface RuntimeMemorySource extends AllyPolicyMemorySource {
  empire?: AllyPolicyMemorySource;
}

function getRuntimeMemory(): RuntimeMemorySource | undefined {
  return (globalThis as { Memory?: RuntimeMemorySource }).Memory;
}

function getOwnerUsername(entity: OwnedByUsername | Structure): string | undefined {
  return (entity as OwnedByUsername).owner?.username;
}

function normalizeAllyList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((ally): ally is string => typeof ally === "string" && ally.length > 0);
}

function asAllyPolicyMemorySource(source: unknown): AllyPolicyMemorySource | undefined {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  return source as AllyPolicyMemorySource;
}

/**
 * Returns configured (non-permanent) allies from explicit config and runtime Memory.
 *
 * Memory lookups are intentionally defensive and optional so existing Memory does
 * not need migration. Operators may seed either `Memory.empire.diplomacy.allies`
 * or `Memory.diplomacy.allies` from the console for live whitelisting.
 */
export function getConfiguredAllyPlayers(options: AllyPolicyOptions = {}): string[] {
  const memory = getRuntimeMemory();
  const empire = asAllyPolicyMemorySource(options.empire);
  const configured = [
    ...(options.configuredAllies ?? []),
    ...normalizeAllyList(empire?.diplomacy?.allies),
    ...normalizeAllyList(memory?.diplomacy?.allies),
    ...normalizeAllyList(memory?.empire?.diplomacy?.allies)
  ];

  return [...new Set(configured)];
}

export function getKnownAllyPlayers(options: AllyPolicyOptions = {}): string[] {
  return [...new Set([...NON_AGGRESSION_PACT_PLAYERS, ...getConfiguredAllyPlayers(options)])];
}

export function isAllyPlayer(username?: string | null): username is AlliedPlayer {
  return typeof username === "string" && (NON_AGGRESSION_PACT_PLAYERS as readonly string[]).includes(username);
}

export function isConfiguredAllyPlayer(username?: string | null, options: AllyPolicyOptions = {}): boolean {
  return typeof username === "string" && getConfiguredAllyPlayers(options).includes(username);
}

export function isKnownAllyPlayer(username?: string | null, options: AllyPolicyOptions = {}): boolean {
  return typeof username === "string" && getKnownAllyPlayers(options).includes(username);
}

export function isAllyOwned(entity: OwnedByUsername | Structure): boolean {
  return isAllyPlayer(getOwnerUsername(entity));
}

export function isConfiguredAllyOwned(entity: OwnedByUsername | Structure, options: AllyPolicyOptions = {}): boolean {
  return isConfiguredAllyPlayer(getOwnerUsername(entity), options);
}

export function isKnownAllyOwned(entity: OwnedByUsername | Structure, options: AllyPolicyOptions = {}): boolean {
  return isKnownAllyPlayer(getOwnerUsername(entity), options);
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

export function isKnownAllyCreep(creep: Creep, options: AllyPolicyOptions = {}): boolean {
  return isKnownAllyOwned(creep, options);
}

export function isKnownAllyPowerCreep(powerCreep: PowerCreep, options: AllyPolicyOptions = {}): boolean {
  return isKnownAllyOwned(powerCreep, options);
}

export function isKnownAllyStructure(structure: Structure, options: AllyPolicyOptions = {}): boolean {
  return isKnownAllyOwned(structure, options);
}

function filterAllies<T>(entities: T[], isAlly: (entity: T) => boolean): T[] {
  const firstAllyIndex = entities.findIndex(isAlly);
  if (firstAllyIndex === -1) return entities;

  return entities.filter(entity => !isAlly(entity));
}

function filterKnownAllies<T extends OwnedByUsername | Structure>(
  entities: T[],
  options: AllyPolicyOptions = {}
): T[] {
  const allyNames = getKnownAllyPlayers(options);
  const allies = new Set(allyNames);
  const isKnownAlly = (entity: T) => {
    const username = getOwnerUsername(entity);
    return typeof username === "string" && allies.has(username);
  };

  const firstAllyIndex = entities.findIndex(isKnownAlly);
  if (firstAllyIndex === -1) return entities;

  return entities.filter(entity => !isKnownAlly(entity));
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

export function filterKnownAllyCreeps<T extends Creep>(hostiles: T[], options: AllyPolicyOptions = {}): T[] {
  return filterKnownAllies(hostiles, options);
}

export function filterKnownAllyPowerCreeps<T extends PowerCreep>(
  hostiles: T[],
  options: AllyPolicyOptions = {}
): T[] {
  return filterKnownAllies(hostiles, options);
}

export function filterKnownAllyStructures<T extends Structure>(
  structures: T[],
  options: AllyPolicyOptions = {}
): T[] {
  return filterKnownAllies(structures, options);
}

export function getActualHostileCreeps(room: Room): Creep[] {
  return getKnownHostileCreeps(room);
}

export function getActualHostilePowerCreeps(room: Room): PowerCreep[] {
  return getKnownHostilePowerCreeps(room);
}

export function getActualHostileStructures(room: Room): Structure[] {
  return getKnownHostileStructures(room);
}

export function getKnownHostileCreeps(room: Room, options: AllyPolicyOptions = {}): Creep[] {
  return filterKnownAllyCreeps(room.find(FIND_HOSTILE_CREEPS), options);
}

export function getKnownHostilePowerCreeps(room: Room, options: AllyPolicyOptions = {}): PowerCreep[] {
  return filterKnownAllyPowerCreeps(room.find(FIND_HOSTILE_POWER_CREEPS), options);
}

export function getKnownHostileStructures(room: Room, options: AllyPolicyOptions = {}): Structure[] {
  return filterKnownAllyStructures(room.find(FIND_HOSTILE_STRUCTURES), options);
}

export function hasActualHostiles(room: Room): boolean {
  return hasKnownHostiles(room);
}

export function hasKnownHostiles(room: Room, options: AllyPolicyOptions = {}): boolean {
  return (
    getKnownHostileCreeps(room, options).length > 0 ||
    getKnownHostilePowerCreeps(room, options).length > 0 ||
    getKnownHostileStructures(room, options).length > 0
  );
}
