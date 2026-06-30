import type { CreepRole, RoleFamily } from "@ralphschuler/screeps-memory";
import { calculateBodyCost } from "../bodyUtils";

/**
 * A concrete body option for a role.
 *
 * `cost` is derived from Screeps body part constants, while `minCapacity` keeps
 * strategic spawn thresholds explicit when a body should wait for more room
 * energy than its raw part cost.
 */
export interface BodyTemplate {
  parts: BodyPartConstant[];
  cost: number;
  minCapacity: number;
}

/** Spawn policy and body tiers for one creep role. */
export interface RoleSpawnDef {
  role: CreepRole;
  family: RoleFamily;
  bodies: BodyTemplate[];
  priority: number;
  maxPerRoom: number;
  remoteRole: boolean;
}

/**
 * Create a body template with the canonical Screeps part cost table.
 *
 * Most roles use raw body cost as the minimum capacity. Some strategic roles
 * intentionally set a higher `minCapacity` so they wait for stronger rooms even
 * when their body would technically be affordable earlier.
 */
export function createBody(parts: BodyPartConstant[], minCapacity = 0): BodyTemplate {
  const cost = calculateBodyCost(parts);

  return {
    parts,
    cost,
    minCapacity: minCapacity || cost
  };
}

/** Compact helper for large repeated combat/hauling templates. */
export function createRepeatedBodyParts(...counts: Array<readonly [BodyPartConstant, number]>): BodyPartConstant[] {
  return counts.flatMap(([part, count]) => Array<BodyPartConstant>(count).fill(part));
}
