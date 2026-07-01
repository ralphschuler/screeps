import { ROLE_DEFINITIONS, type RoleSpawnDef } from "./roleDefinitions";

/** Maximum local military creeps kept in peaceful rooms as idle deterrence. */
export const IDLE_MILITARY_RESERVE = 1;

export function countLocalMilitaryCreeps(counts: Map<string, number>): number {
  return Array.from(counts.entries())
    .filter(([role]) => ROLE_DEFINITIONS[role]?.family === "military" && !ROLE_DEFINITIONS[role]?.remoteRole)
    .reduce((sum, [, count]) => sum + count, 0);
}

export function shouldLimitIdleLocalMilitary(def: Pick<RoleSpawnDef, "family" | "remoteRole">, visibleHostiles: number): boolean {
  return def.family === "military" && visibleHostiles === 0 && !def.remoteRole;
}

export function canSpawnIdleLocalMilitary(
  role: string,
  counts: Map<string, number>,
  reserveLimit = IDLE_MILITARY_RESERVE
): boolean {
  if (reserveLimit <= 0) return false;
  if (countLocalMilitaryCreeps(counts) >= reserveLimit) return false;
  return role === "guard";
}
