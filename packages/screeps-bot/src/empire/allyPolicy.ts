import { isAllyPlayer } from "@ralphschuler/screeps-defense";

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
export function getConfiguredAllies(options: AllyPolicyOptions = {}): string[] {
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

export function isConfiguredAllyUsername(username: string | undefined, options: AllyPolicyOptions = {}): boolean {
  return typeof username === "string" && getConfiguredAllies(options).includes(username);
}

export function isKnownAllyUsername(username: string | undefined, options: AllyPolicyOptions = {}): boolean {
  return isAllyPlayer(username) || isConfiguredAllyUsername(username, options);
}

export function isConfiguredAllyOwned(
  entity: { owner?: { username?: string } },
  options: AllyPolicyOptions = {}
): boolean {
  return isConfiguredAllyUsername(entity.owner?.username, options);
}
