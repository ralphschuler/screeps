/**
 * Role Definitions Module
 * 
 * Contains all creep role body templates and configurations.
 * Extracted from screeps-bot for reusability.
 */

import { BodyTemplate, RoleSpawnDef, RoleFamily } from "./types";
import { calculateBodyCost } from "./bodyUtils";

/**
 * Create a body template with calculated cost
 */
function createBody(parts: BodyPartConstant[], minCapacity = 0): BodyTemplate {
  return {
    parts,
    cost: calculateBodyCost(parts),
    minCapacity: minCapacity || calculateBodyCost(parts)
  };
}

/**
 * Role definitions for all creep types
 * 
 * This is a comprehensive set of role definitions that can be customized
 * or extended by the consuming bot.
 */
export const DEFAULT_ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  // Economy roles
  larvaWorker: {
    role: "larvaWorker",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([WORK, CARRY], 150),
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 600),
      createBody([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 800)
    ],
    priority: 100,
    maxPerRoom: 3,
    remoteRole: false
  },
  
  harvester: {
    role: "harvester",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([WORK, WORK, MOVE], 250),
      createBody([WORK, WORK, WORK, WORK, MOVE, MOVE], 500),
      createBody([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], 700),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], 800),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE], 1000)
    ],
    priority: 95,
    maxPerRoom: 2,
    remoteRole: false
  },
  
  hauler: {
    role: "hauler",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([CARRY, CARRY, MOVE, MOVE], 200),
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 800),
      createBody(
        [...Array(16).fill(CARRY), ...Array(16).fill(MOVE)],
        1600
      )
    ],
    priority: 90,
    maxPerRoom: 2,
    remoteRole: true
  },
  
  upgrader: {
    role: "upgrader",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, WORK, CARRY, MOVE, MOVE], 450),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 1000),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1700)
    ],
    priority: 60,
    maxPerRoom: 2,
    remoteRole: false
  },
  
  builder: {
    role: "builder",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([WORK, CARRY, MOVE, MOVE], 250),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 650),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1400)
    ],
    priority: 70,
    maxPerRoom: 2,
    remoteRole: false
  },
  
  queenCarrier: {
    role: "queenCarrier",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 300),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 450),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 600)
    ],
    priority: 85,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  mineralHarvester: {
    role: "mineralHarvester",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], 550),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 850)
    ],
    priority: 40,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  labTech: {
    role: "labTech",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600)
    ],
    priority: 35,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  factoryWorker: {
    role: "factoryWorker",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600)
    ],
    priority: 35,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  remoteHarvester: {
    role: "remoteHarvester",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([WORK, WORK, CARRY, MOVE, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 750),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1050),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1600)
    ],
    priority: 85,
    maxPerRoom: 6,
    remoteRole: true
  },
  
  remoteHauler: {
    role: "remoteHauler",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 800),
      createBody(
        [...Array(16).fill(CARRY), ...Array(16).fill(MOVE)],
        1600
      )
    ],
    priority: 80,
    maxPerRoom: 6,
    remoteRole: true
  },
  
  interRoomCarrier: {
    role: "interRoomCarrier",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 800)
    ],
    priority: 90,
    maxPerRoom: 4,
    remoteRole: false
  },
  
  crossShardCarrier: {
    role: "crossShardCarrier",
    family: "economy" as RoleFamily,
    bodies: [
      createBody([...Array(4).fill(CARRY), ...Array(4).fill(MOVE)], 400),
      createBody([...Array(8).fill(CARRY), ...Array(8).fill(MOVE)], 800),
      createBody([...Array(12).fill(CARRY), ...Array(12).fill(MOVE)], 1200),
      createBody([...Array(16).fill(CARRY), ...Array(16).fill(MOVE)], 1600)
    ],
    priority: 85,
    maxPerRoom: 6,
    remoteRole: true
  },
  
  // Military roles
  guard: {
    role: "guard",
    family: "military" as RoleFamily,
    bodies: [
      createBody([TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], 310),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 620),
      createBody([TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1070),
      createBody([
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
        RANGED_ATTACK, RANGED_ATTACK,
        HEAL,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ], 1740)
    ],
    priority: 65,
    maxPerRoom: 4,
    remoteRole: false
  },
  
  remoteGuard: {
    role: "remoteGuard",
    family: "military" as RoleFamily,
    bodies: [
      createBody([TOUGH, ATTACK, MOVE, MOVE], 190),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], 500),
      createBody([TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 880)
    ],
    priority: 65,
    maxPerRoom: 2,
    remoteRole: true
  },
  
  healer: {
    role: "healer",
    family: "military" as RoleFamily,
    bodies: [
      createBody([HEAL, MOVE, MOVE], 350),
      createBody([TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE], 620),
      createBody([TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1240),
      createBody([
        TOUGH, TOUGH, TOUGH, TOUGH,
        HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ], 2640)
    ],
    priority: 55,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  // Utility roles
  scout: {
    role: "scout",
    family: "utility" as RoleFamily,
    bodies: [
      createBody([MOVE], 50),
      createBody([MOVE, MOVE], 100)
    ],
    priority: 30,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  claimer: {
    role: "claimer",
    family: "utility" as RoleFamily,
    bodies: [
      createBody([CLAIM, MOVE], 650),
      createBody([CLAIM, CLAIM, MOVE, MOVE], 1300)
    ],
    priority: 95,
    maxPerRoom: 1,
    remoteRole: false
  },
  
  reserver: {
    role: "reserver",
    family: "utility" as RoleFamily,
    bodies: [
      createBody([CLAIM, MOVE], 650),
      createBody([CLAIM, CLAIM, MOVE, MOVE], 1300),
      createBody([CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE], 2600)
    ],
    priority: 75,
    maxPerRoom: 3,
    remoteRole: true
  }
};

/**
 * Get role definition by name
 */
export function getRoleDefinition(role: string, customDefs?: Record<string, RoleSpawnDef>): RoleSpawnDef | null {
  const defs = customDefs || DEFAULT_ROLE_DEFINITIONS;
  return defs[role] || null;
}

/**
 * Get all role names
 */
export function getAllRoles(customDefs?: Record<string, RoleSpawnDef>): string[] {
  const defs = customDefs || DEFAULT_ROLE_DEFINITIONS;
  return Object.keys(defs);
}

/**
 * Get roles by family
 */
export function getRolesByFamily(family: RoleFamily, customDefs?: Record<string, RoleSpawnDef>): string[] {
  const defs = customDefs || DEFAULT_ROLE_DEFINITIONS;
  return Object.entries(defs)
    .filter(([_, def]) => def.family === family)
    .map(([role, _]) => role);
}
