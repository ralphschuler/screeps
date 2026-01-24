/**
 * Role Definitions Module
 * 
 * Contains all creep role body templates and configurations.
 * Each role defines:
 * - Body part compositions for different energy capacities
 * - Base spawn priority
 * - Maximum creeps per room
 * - Whether it's a remote role or home room role
 */

import type { CreepRole, RoleFamily } from "./botTypes";

/** Body template definition */
export interface BodyTemplate {
  parts: BodyPartConstant[];
  cost: number;
  minCapacity: number;
}

/** Role spawn definition */
export interface RoleSpawnDef {
  role: CreepRole;
  family: RoleFamily;
  bodies: BodyTemplate[];
  priority: number;
  maxPerRoom: number;
  remoteRole: boolean;
}

/**
 * Calculate the energy cost of a body part array
 */
function calculateBodyCost(parts: BodyPartConstant[]): number {
  const costs: Record<BodyPartConstant, number> = {
    [MOVE]: 50,
    [WORK]: 100,
    [CARRY]: 50,
    [ATTACK]: 80,
    [RANGED_ATTACK]: 150,
    [HEAL]: 250,
    [CLAIM]: 600,
    [TOUGH]: 10
  };

  return parts.reduce((sum, part) => sum + costs[part], 0);
}

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

/** Role definitions for all creep types */
export const ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  // Economy roles
  larvaWorker: {
    role: "larvaWorker",
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
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
    family: "economy",
    bodies: [
      createBody([WORK, WORK, CARRY, MOVE, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 750),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1050),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1600)
    ],
    priority: 85, // Increased from 75 to prioritize remote income generation after core economy roles
    maxPerRoom: 6, // Higher max since these are distributed across remote rooms
    remoteRole: true
  },
  remoteHauler: {
    role: "remoteHauler",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 800),
      createBody(
        [...Array(16).fill(CARRY), ...Array(16).fill(MOVE)],
        1600
      )
    ],
    priority: 80, // Increased from 70 to prioritize remote logistics over other economic roles
    maxPerRoom: 6, // Higher max since these are distributed across remote rooms
    remoteRole: true
  },

  interRoomCarrier: {
    role: "interRoomCarrier",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 800)
    ],
    priority: 90, // High priority to help struggling rooms
    maxPerRoom: 4, // Multiple carriers can be spawned per cluster
    remoteRole: false
  },

  crossShardCarrier: {
    role: "crossShardCarrier",
    family: "economy",
    bodies: [
      createBody([...Array(4).fill(CARRY), ...Array(4).fill(MOVE)], 400),
      createBody([...Array(8).fill(CARRY), ...Array(8).fill(MOVE)], 800),
      createBody([...Array(12).fill(CARRY), ...Array(12).fill(MOVE)], 1200),
      createBody([...Array(16).fill(CARRY), ...Array(16).fill(MOVE)], 1600)
    ],
    priority: 85, // High priority for cross-shard logistics
    maxPerRoom: 6, // Can have multiple carriers for large transfers
    remoteRole: true
  },

  // Military roles
  guard: {
    role: "guard",
    family: "military",
    bodies: [
      // Minimal: For emergency spawning with low energy
      createBody([TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE], 310),
      // Small: Basic defense capability
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 620),
      // Medium: Balanced defense with ranged support
      createBody([TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1070),
      // Large: Strong defender with healing capability
      createBody([
        TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
        RANGED_ATTACK, RANGED_ATTACK,
        HEAL,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ], 1740)
    ],
    priority: 65, // Increased from 60 - higher priority for better defense readiness
    maxPerRoom: 4, // Increased from 2 - keep more guards on hand to defend against invaders
    remoteRole: false
  },
  remoteGuard: {
    role: "remoteGuard",
    family: "military",
    bodies: [
      createBody([TOUGH, ATTACK, MOVE, MOVE], 190),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], 500),
      createBody([TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 880)
    ],
    priority: 65, // Reduced from 85 - only spawn when remote rooms actually need defense
    maxPerRoom: 2, // Reduced from 4 - fewer guards per remote room
    remoteRole: true
  },
  healer: {
    role: "healer",
    family: "military",
    bodies: [
      // Minimal: Emergency healer
      createBody([HEAL, MOVE, MOVE], 350),
      // Small: Basic healing support
      createBody([TOUGH, HEAL, HEAL, MOVE, MOVE, MOVE], 620),
      // Medium: Strong healing support
      createBody([TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1240),
      // Large: Powerful healer with durability
      createBody([
        TOUGH, TOUGH, TOUGH, TOUGH,
        HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ], 2640)
    ],
    priority: 55, // Reduced from 75 - only spawn when actively needed for combat
    maxPerRoom: 1,
    remoteRole: false
  },
  soldier: {
    role: "soldier",
    family: "military",
    bodies: [
      createBody([ATTACK, ATTACK, MOVE, MOVE], 260),
      createBody([ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], 520),
      createBody(
        [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        1340
      )
    ],
    priority: 50, // Reduced from 70 - offensive units should be spawned on-demand
    maxPerRoom: 1, // Reduced from 2 - one soldier per room
    remoteRole: false
  },
  siegeUnit: {
    role: "siegeUnit",
    family: "military",
    bodies: [
      createBody([WORK, WORK, MOVE, MOVE], 300),
      createBody([TOUGH, TOUGH, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 620),
      createBody(
        [
          TOUGH,
          TOUGH,
          TOUGH,
          TOUGH,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          WORK,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE,
          MOVE
        ],
        1040
      )
    ],
    priority: 30, // Reduced from 50 - siege units only for planned operations
    maxPerRoom: 1, // Reduced from 2 - siege units are specialized, spawn on-demand
    remoteRole: false
  },
  ranger: {
    role: "ranger",
    family: "military",
    bodies: [
      // Minimal: Emergency ranged defender
      createBody([TOUGH, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE], 360),
      // Small: Basic ranged defense
      createBody([TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], 570),
      // Medium: Strong ranged attacker
      createBody([TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1040),
      // Large: Powerful ranged unit with mobility
      createBody([
        TOUGH, TOUGH, TOUGH, TOUGH,
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
      ], 1480)
    ],
    priority: 60, // Increased from 55 - higher priority for better defense readiness
    maxPerRoom: 4, // Increased from 2 - keep more rangers on hand for defense
    remoteRole: false
  },
  harasser: {
    role: "harasser",
    family: "military",
    bodies: [
      // Small: Fast, cheap hit-and-run with survivability (1:1 move ratio for speed)
      createBody([TOUGH, ATTACK, RANGED_ATTACK, MOVE, MOVE], 320),
      // Medium: Balanced damage with mobility and durability
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE], 640),
      // Large: Maximum harassment potential with healing support
      createBody([TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1200)
    ],
    priority: 40, // Reduced from 60 - harassers for offensive operations only
    maxPerRoom: 1, // Reduced from 3 - one harasser per room, spawn more on-demand
    remoteRole: false
  },

  // Utility roles
  scout: {
    role: "scout",
    family: "utility",
    bodies: [createBody([MOVE], 50)],
    priority: 30, // REDUCED from 65 - scouts are expensive CPU-wise, spawn only when truly needed
    maxPerRoom: 1, // REDUCED from 2 - one scout per room is sufficient for intel gathering
    remoteRole: true
  },
  claimer: {
    role: "claimer",
    family: "utility",
    bodies: [createBody([CLAIM, MOVE], 650), createBody([CLAIM, CLAIM, MOVE, MOVE], 1300)],
    priority: 50,
    maxPerRoom: 3, // Increased to handle multiple remote rooms and expansion
    remoteRole: true
  },
  engineer: {
    role: "engineer",
    family: "utility",
    bodies: [
      createBody([WORK, CARRY, MOVE, MOVE], 250),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 500)
    ],
    priority: 55,
    maxPerRoom: 2,
    remoteRole: false
  },
  remoteWorker: {
    role: "remoteWorker",
    family: "utility",
    bodies: [
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 500),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 750)
    ],
    priority: 45,
    maxPerRoom: 4, // Restored to original value - allows multiple remote workers
    remoteRole: true
  },

  powerHarvester: {
    role: "powerHarvester",
    family: "power",
    bodies: [
      createBody(
        [
          TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        2300
      ),
      createBody(
        [
          TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
          TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        3000
      )
    ],
    priority: 30,
    maxPerRoom: 2, // Per operation, coordinated by power bank manager
    remoteRole: true
  },
  powerCarrier: {
    role: "powerCarrier",
    family: "power",
    bodies: [
      createBody(
        [...Array(20).fill(CARRY), ...Array(20).fill(MOVE)],
        2000
      ),
      createBody(
        [...Array(25).fill(CARRY), ...Array(25).fill(MOVE)],
        2500
      )
    ],
    priority: 25,
    maxPerRoom: 2, // Per operation
    remoteRole: true
  }
};

/**
 * Get role definition by role name
 */
export function getRoleDefinition(role: string, defs?: Record<string, RoleSpawnDef>): RoleSpawnDef | undefined {
  const definitions = defs || ROLE_DEFINITIONS;
  return definitions[role];
}

/**
 * Get all role names
 */
export function getAllRoles(): string[] {
  return Object.keys(ROLE_DEFINITIONS);
}

/**
 * Get roles by family
 */
export function getRolesByFamily(family: string): string[] {
  return Object.entries(ROLE_DEFINITIONS)
    .filter(([_, def]) => def.family === family)
    .map(([role]) => role);
}
