/**
 * Role Definitions Module
 *
 * Public facade for creep role body templates and spawn metadata. The concrete
 * definitions live in family modules so economy, military, utility, and power
 * roles can be read independently while callers keep using the stable
 * `ROLE_DEFINITIONS` aggregate.
 */

import type { CreepRole, RoleFamily } from "@ralphschuler/screeps-memory";
import { ECONOMY_ROLE_DEFINITIONS } from "./role-definitions/economy";
import { MILITARY_ROLE_DEFINITIONS } from "./role-definitions/military";
import { POWER_ROLE_DEFINITIONS } from "./role-definitions/power";
import type { RoleSpawnDef } from "./role-definitions/template";
import { UTILITY_ROLE_DEFINITIONS } from "./role-definitions/utility";
export type { BodyTemplate, RoleSpawnDef } from "./role-definitions/template";

/** Role definitions for all creep types, grouped by swarm responsibility. */
export const ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  ...ECONOMY_ROLE_DEFINITIONS,
  ...MILITARY_ROLE_DEFINITIONS,
  ...UTILITY_ROLE_DEFINITIONS,
  ...POWER_ROLE_DEFINITIONS
};

/** Normalize bodies so getBestBody can assume ascending cost order. */
for (const def of Object.values(ROLE_DEFINITIONS)) {
  def.bodies.sort((a, b) => a.cost - b.cost);
}

/** Get a role definition by role name. */
export function getRoleDefinition(
  role: CreepRole | string,
  roleDefs: Record<string, RoleSpawnDef> = ROLE_DEFINITIONS
): RoleSpawnDef | undefined {
  return roleDefs[role];
}

/** Get all defined role names. */
export function getAllRoles(roleDefs: Record<string, RoleSpawnDef> = ROLE_DEFINITIONS): string[] {
  return Object.keys(roleDefs);
}

/** Get role names by family. */
export function getRolesByFamily(
  family: RoleFamily,
  roleDefs: Record<string, RoleSpawnDef> = ROLE_DEFINITIONS
): CreepRole[] {
  return Object.entries(roleDefs)
    .filter(([, def]) => def.family === family)
    .map(([role]) => role as CreepRole);
}
