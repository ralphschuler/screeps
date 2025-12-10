/**
 * Spawn Logic - Phase 8
 *
 * Central spawn manager per room:
 * - Derives role weights from evolution stage, posture, pheromones
 * - Uses weighted selection for next role
 * - Defines body templates per role
 * - Task assignment heuristics
 */

import type { CreepRole, RoleFamily, SwarmCreepMemory, SwarmState } from "../memory/schemas";
import { kernel } from "../core/kernel";
import { memoryManager } from "../memory/manager";
import { getDefenderPriorityBoost } from "../spawning/defenderManager";
import { type WeightedEntry, weightedSelection } from "../utils/weightedSelection";
import { logger } from "../core/logger";
import { calculateRemoteHaulerRequirement } from "../empire/remoteHaulerDimensioning";

/**
 * Focus room upgrader scaling configuration
 * Defines how many upgraders a focus room should spawn based on RCL
 */
const FOCUS_ROOM_UPGRADER_LIMITS = {
  /** RCL 1-3: Early game, limited energy */
  EARLY: 2,
  /** RCL 4-6: Mid game, stable economy */
  MID: 4,
  /** RCL 7: Late game, push to RCL 8 */
  LATE: 6
} as const;

/** Priority boost for upgraders in focus rooms */
const FOCUS_ROOM_UPGRADER_PRIORITY_BOOST = 40;

/** Number of dangerous hostiles per remote guard needed */
const THREATS_PER_GUARD = 2;

/** Reservation threshold in ticks - trigger renewal below this */
const RESERVATION_THRESHOLD_TICKS = 3000;

/**
 * Body template definition
 */
export interface BodyTemplate {
  /** Body parts */
  parts: BodyPartConstant[];
  /** Cost of the body */
  cost: number;
  /** Minimum energy capacity required */
  minCapacity: number;
}

/**
 * Role spawn definition
 */
export interface RoleSpawnDef {
  /** Role name */
  role: CreepRole;
  /** Role family */
  family: RoleFamily;
  /** Body templates by energy tier */
  bodies: BodyTemplate[];
  /** Base priority */
  priority: number;
  /** Maximum creeps of this role per room */
  maxPerRoom: number;
  /** Whether this role is needed in remote rooms */
  remoteRole: boolean;
}

/**
 * Calculate body cost
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
 * Create body template
 */
function createBody(parts: BodyPartConstant[], minCapacity = 0): BodyTemplate {
  return {
    parts,
    cost: calculateBodyCost(parts),
    minCapacity: minCapacity || calculateBodyCost(parts)
  };
}

/**
 * Role definitions
 */
export const ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  // Economy roles
  larvaWorker: {
    role: "larvaWorker",
    family: "economy",
    bodies: [
      // Ultra-minimal emergency body for total workforce collapse
      // Can harvest and carry but moves slowly (1 tile per 2 ticks on plains)
      // This ensures recovery is possible even with < 200 energy
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
    priority: 75,
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
    priority: 70,
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
      createBody([TOUGH, ATTACK, MOVE, MOVE], 190),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE], 500),
      createBody([TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1070)
    ],
    priority: 80,
    maxPerRoom: 2,
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
    priority: 85, // Higher than regular guards - remote defense is critical
    maxPerRoom: 4, // Higher max since distributed across remote rooms
    remoteRole: true
  },
  healer: {
    role: "healer",
    family: "military",
    bodies: [
      createBody([HEAL, MOVE], 300),
      createBody([HEAL, HEAL, MOVE, MOVE], 600),
      createBody([HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE], 1200)
    ],
    priority: 75,
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
    priority: 70,
    maxPerRoom: 2,
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
    priority: 50,
    maxPerRoom: 2,
    remoteRole: false
  },
  ranger: {
    role: "ranger",
    family: "military",
    bodies: [
      createBody([RANGED_ATTACK, MOVE], 200),
      createBody([RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE], 400),
      createBody([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE], 800)
    ],
    priority: 65,
    maxPerRoom: 2,
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
    priority: 60,
    maxPerRoom: 3, // Allow multiple harassers for coordinated harassment
    remoteRole: false
  },

  // Utility roles
  scout: {
    role: "scout",
    family: "utility",
    bodies: [createBody([MOVE], 50)],
    priority: 65, // Increased from 40 - scouts are important for expansion and intel gathering
    maxPerRoom: 2, // Allow 2 scouts per room for better coverage
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
    maxPerRoom: 4,
    remoteRole: true
  },

  // Power bank harvesting roles (regular creeps for power banks)
  powerHarvester: {
    role: "powerHarvester",
    family: "power",
    bodies: [
      // Power banks have 2M hits. With 50% damage reflection, we need tough healers.
      // Mid-tier: 20 ATTACK parts = 600 damage/tick, but 300 reflected damage
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
      // High-tier: 25 ATTACK parts for faster destruction
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
      // Large carriers to collect dropped power efficiently
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
 * Get spawn profile weights based on posture
 */
export function getPostureSpawnWeights(posture: string): Record<string, number> {
  switch (posture) {
    case "eco":
      return {
        harvester: 1.5,
        hauler: 1.2,
        upgrader: 1.3,
        builder: 1.0,
        queenCarrier: 1.0,
        guard: 0.3,
        remoteGuard: 0.8,
        healer: 0.1,
        scout: 1.0,
        claimer: 0.8,
        engineer: 0.8,
        remoteHarvester: 1.2,
        remoteHauler: 1.2,
        interRoomCarrier: 1.0
      };
    case "expand":
      return {
        harvester: 1.2,
        hauler: 1.0,
        upgrader: 0.8,
        builder: 1.0,
        queenCarrier: 0.8,
        guard: 0.3,
        remoteGuard: 1.0,
        scout: 1.5,
        claimer: 1.5,
        remoteWorker: 1.5,
        engineer: 0.5,
        remoteHarvester: 1.5,
        remoteHauler: 1.5,
        interRoomCarrier: 1.2
      };
    case "defensive":
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 0.5,
        builder: 0.5,
        queenCarrier: 1.0,
        guard: 2.0,
        remoteGuard: 1.8,
        healer: 1.5,
        ranger: 1.0,
        scout: 0.8, // Added: scouts help monitor threats
        engineer: 1.2,
        remoteHarvester: 0.5,
        remoteHauler: 0.5,
        interRoomCarrier: 1.5
      };
    case "war":
      return {
        harvester: 0.8,
        hauler: 0.8,
        upgrader: 0.3,
        builder: 0.3,
        queenCarrier: 1.0,
        guard: 2.5,
        healer: 2.0,
        soldier: 2.0,
        ranger: 1.5,
        scout: 0.8, // Added: scouts help with reconnaissance
        engineer: 0.5,
        remoteHarvester: 0.3,
        remoteHauler: 0.3,
        interRoomCarrier: 0.5
      };
    case "siege":
      return {
        harvester: 0.5,
        hauler: 0.5,
        upgrader: 0.1,
        builder: 0.1,
        queenCarrier: 1.0,
        guard: 3.0,
        healer: 2.5,
        soldier: 2.5,
        siegeUnit: 2.0,
        ranger: 1.0,
        scout: 0.5, // Added: scouts help monitor siege targets
        engineer: 0.2,
        remoteHarvester: 0.1,
        remoteHauler: 0.1
      };
    case "evacuate":
      return {
        hauler: 2.0,
        queenCarrier: 1.5
      };
    case "nukePrep":
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 0.5,
        builder: 0.5,
        queenCarrier: 1.0,
        guard: 1.5,
        scout: 0.5, // Added: scouts can monitor incoming threats
        engineer: 2.0,
        remoteHarvester: 0.5,
        remoteHauler: 0.5
      };
    default:
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 1.0,
        builder: 1.0,
        queenCarrier: 1.0,
        scout: 1.0, // Added: scouts should spawn in any posture
        remoteHarvester: 1.0,
        remoteHauler: 1.0
      };
  }
}

/**
 * Get dynamic priority adjustments for roles
 */
export function getDynamicPriorityBoost(room: Room, swarm: SwarmState, role: string): number {
  let boost = 0;

  // Defender priority boost based on threats
  if (role === "guard" || role === "ranger" || role === "healer") {
    boost += getDefenderPriorityBoost(room, swarm, role);
  }

  // Upgrader priority boost for focus room
  if (role === "upgrader" && swarm.clusterId) {
    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (cluster?.focusRoom === room.name) {
      // Significant boost to prioritize upgrading in focus room
      boost += FOCUS_ROOM_UPGRADER_PRIORITY_BOOST;
    }
  }

  return boost;
}

/**
 * Get pheromone multipliers for roles
 */
export function getPheromoneMult(role: string, pheromones: Record<string, number>): number {
  const map: Record<string, string> = {
    harvester: "harvest",
    hauler: "logistics",
    upgrader: "upgrade",
    builder: "build",
    guard: "defense",
    remoteGuard: "defense",
    healer: "defense",
    soldier: "war",
    siegeUnit: "siege",
    ranger: "war",
    scout: "expand",
    claimer: "expand",
    remoteWorker: "expand",
    engineer: "build",
    remoteHarvester: "harvest",
    remoteHauler: "logistics",
    interRoomCarrier: "logistics"
  };

  const pheromoneKey = map[role];
  if (!pheromoneKey) return 1.0;

  const value = pheromones[pheromoneKey] ?? 0;
  // Scale: 0-100 pheromone maps to 0.5-2.0 multiplier
  return 0.5 + (value / 100) * 1.5;
}

/**
 * Cache for creep counts per room, cleared each tick.
 * OPTIMIZATION: Avoid iterating all creeps multiple times per tick when multiple spawns exist.
 */
const creepCountCache = new Map<string, Map<string, number>>();
let creepCountCacheTick = -1;
let creepCountCacheRef: Record<string, Creep> | null = null;

/**
 * Count creeps by role in a room.
 * OPTIMIZATION: Cache results per tick to avoid iterating all creeps multiple times.
 * With multiple spawns in a room, this function could be called multiple times per tick.
 * 
 * @param roomName - The room to count creeps in
 * @param activeOnly - If true, only count active (non-spawning) creeps. Default: false
 */
export function countCreepsByRole(roomName: string, activeOnly = false): Map<string, number> {
  // Clear cache if new tick or Game.creeps reference changed
  // Checking reference equality handles both production (new tick) and tests (creeps reassigned)
  if (creepCountCacheTick !== Game.time || creepCountCacheRef !== Game.creeps) {
    creepCountCache.clear();
    creepCountCacheTick = Game.time;
    creepCountCacheRef = Game.creeps;
  }

  // Use different cache key for active-only counts
  const cacheKey = activeOnly ? `${roomName}_active` : roomName;
  
  // Check cache
  const cached = creepCountCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Build counts
  const counts = new Map<string, number>();

  // OPTIMIZATION: Use for-in loop instead of Object.values() to avoid creating temporary array
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName) {
      // Skip spawning creeps if activeOnly is true
      if (activeOnly && creep.spawning) {
        continue;
      }
      
      const role = memory.role ?? "unknown";
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  // Cache for this tick
  creepCountCache.set(cacheKey, counts);
  return counts;
}

/**
 * Get best body for energy capacity
 */
export function getBestBody(def: RoleSpawnDef, energyCapacity: number): BodyTemplate | null {
  // Find best body that fits capacity
  let best: BodyTemplate | null = null;

  for (const body of def.bodies) {
    if (body.cost <= energyCapacity) {
      if (!best || body.cost > best.cost) {
        best = body;
      }
    }
  }

  return best;
}

/**
 * Count remote creeps assigned to a specific target room
 */
export function countRemoteCreepsByTargetRoom(homeRoom: string, role: string, targetRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === homeRoom && memory.role === role && memory.targetRoom === targetRoom) {
      count++;
    }
  }
  return count;
}

/**
 * Get the remote room that needs workers of a given role.
 * Returns the room name if workers are needed, null otherwise.
 */
export function getRemoteRoomNeedingWorkers(homeRoom: string, role: string, swarm: SwarmState): string | null {
  const remoteAssignments = swarm.remoteAssignments ?? [];
  if (remoteAssignments.length === 0) return null;

  // Find a remote room that needs workers
  for (const remoteRoom of remoteAssignments) {
    const currentCount = countRemoteCreepsByTargetRoom(homeRoom, role, remoteRoom);
    const room = Game.rooms[remoteRoom];
    
    let maxPerRemote: number;
    
    if (role === "remoteHarvester") {
      // 1 harvester per source
      if (room) {
        const sources = room.find(FIND_SOURCES);
        maxPerRemote = sources.length;
      } else {
        maxPerRemote = 2; // Assume 2 sources if no vision
      }
    } else if (role === "remoteHauler") {
      // Calculate based on distance and sources
      if (room) {
        const sources = room.find(FIND_SOURCES);
        const sourceCount = sources.length;
        
        // Calculate optimal hauler count using dimensioning module
        const energyCapacity = Game.rooms[homeRoom]?.energyCapacityAvailable ?? 800;
        const requirement = calculateRemoteHaulerRequirement(homeRoom, remoteRoom, sourceCount, energyCapacity);
        maxPerRemote = requirement.recommendedHaulers;
      } else {
        // No vision - use conservative estimate
        maxPerRemote = 2;
      }
    } else {
      maxPerRemote = 2;
    }
    
    if (currentCount < maxPerRemote) {
      return remoteRoom;
    }
  }

  return null;
}

/**
 * Check if room needs role
 */
export function needsRole(roomName: string, role: string, swarm: SwarmState): boolean {
  const def = ROLE_DEFINITIONS[role];
  if (!def) return false;

  // Special handling for remote roles
  if (role === "remoteHarvester" || role === "remoteHauler") {
    // Check if there's a remote room that needs workers
    return getRemoteRoomNeedingWorkers(roomName, role, swarm) !== null;
  }
  
  // Remote guard: spawn if remote rooms have threats
  if (role === "remoteGuard") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length === 0) return false;
    
    // Check if any remote room has threats and needs guards
    for (const remoteName of remoteAssignments) {
      const remoteRoom = Game.rooms[remoteName];
      if (!remoteRoom) continue; // Can't check rooms without vision
      
      // Check for hostile creeps with combat parts
      const hostiles = remoteRoom.find(FIND_HOSTILE_CREEPS);
      const dangerousHostiles = hostiles.filter(h =>
        h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
      );
      
      if (dangerousHostiles.length > 0) {
        // Check how many guards are already assigned to this remote
        const currentGuards = countRemoteCreepsByTargetRoom(roomName, role, remoteName);
        // Need guards scaled to threat level, up to max per room
        const neededGuards = Math.min(def.maxPerRoom, Math.ceil(dangerousHostiles.length / THREATS_PER_GUARD));
        if (currentGuards < neededGuards) {
          return true;
        }
      }
    }
    
    return false;
  }

  const counts = countCreepsByRole(roomName);
  const current = counts.get(role) ?? 0;

  // Check max per room (with special handling for upgraders in focus room)
  let maxForRoom = def.maxPerRoom;
  if (role === "upgrader" && swarm.clusterId) {
    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (cluster?.focusRoom === roomName) {
      // Allow more upgraders in focus room to accelerate upgrading
      const room = Game.rooms[roomName];
      if (room?.controller) {
        // Scale upgraders based on RCL
        if (room.controller.level <= 3) {
          maxForRoom = FOCUS_ROOM_UPGRADER_LIMITS.EARLY;
        } else if (room.controller.level <= 6) {
          maxForRoom = FOCUS_ROOM_UPGRADER_LIMITS.MID;
        } else {
          maxForRoom = FOCUS_ROOM_UPGRADER_LIMITS.LATE;
        }
      }
    }
  }

  if (current >= maxForRoom) return false;

  // Special conditions
  const room = Game.rooms[roomName];
  if (!room) return false;

  // Scout: Spawn if we have remote rooms without full intel
  // or if we're in expand posture and need more room data
  if (role === "scout") {
    // Always allow scouts if we don't have one (up to max per room)
    if (current === 0) return true;
    
    // In expand posture, allow more scouts
    if (swarm.posture === "expand" && current < def.maxPerRoom) return true;
    
    return false;
  }

  // Claimer: Only spawn if we have expansion targets or remote rooms that need reserving
  if (role === "claimer") {
    const overmind = memoryManager.getOvermind();
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    // Check if we have unclaimed expansion targets and can expand
    const canExpand = ownedRooms.length < Game.gcl.level;
    const hasExpansionTarget = overmind.claimQueue.some(c => !c.claimed);
    
    // Check if we have remote rooms that need reserving (no reserver assigned)
    const hasUnreservedRemote = needsReserver(roomName, swarm);
    
    // Only spawn claimer if there's work to do
    if (canExpand && hasExpansionTarget) return true;
    if (hasUnreservedRemote) return true;
    
    return false;
  }

  // Mineral harvester needs extractor
  if (role === "mineralHarvester") {
    const mineral = room.find(FIND_MINERALS)[0];
    if (!mineral) return false;
    const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_EXTRACTOR);
    if (!extractor) return false;
    if (mineral.mineralAmount === 0) return false;
  }

  // Lab tech needs labs
  if (role === "labTech") {
    const labs = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LAB });
    if (labs.length < 3) return false;
  }

  // Factory worker needs factory
  if (role === "factoryWorker") {
    const factory = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_FACTORY });
    if (factory.length === 0) return false;
  }

  // Queen carrier needs storage
  if (role === "queenCarrier") {
    if (!room.storage) return false;
  }

  // Builder needs construction sites
  if (role === "builder") {
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (sites.length === 0 && current > 0) return false;
  }

  // Inter-room carrier needs active resource requests
  if (role === "interRoomCarrier") {
    // Check if room's cluster has any active resource transfer requests
    if (!swarm.clusterId) return false;
    
    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (!cluster || !cluster.resourceRequests || cluster.resourceRequests.length === 0) {
      return false;
    }
    
    // Check if there are requests that need more carriers
    const needsCarriers = cluster.resourceRequests.some(req => {
      // Only spawn for requests from this room
      if (req.fromRoom !== room.name) return false;
      
      // Check if request needs more carriers
      const assignedCount = req.assignedCreeps.filter(name => Game.creeps[name]).length;
      const remaining = req.amount - req.delivered;
      
      // Need carriers if we have significant remaining amount and not enough assigned
      return remaining > 500 && assignedCount < 2;
    });
    
    if (!needsCarriers) return false;
  }

  return true;
}

/**
 * Check if room needs a reserver for any of its remote rooms
 */
function needsReserver(_homeRoom: string, swarm: SwarmState): boolean {
  const remotes = swarm.remoteAssignments ?? [];
  if (remotes.length === 0) return false;
  
  const myUsername = getMyUsername();
  
  // Check each remote room
  for (const remoteName of remotes) {
    const remoteRoom = Game.rooms[remoteName];
    
    // If we have vision, check reservation status
    if (remoteRoom?.controller) {
      const controller = remoteRoom.controller;
      
      // Skip if owned by anyone (can't reserve owned rooms)
      if (controller.owner) continue;
      
      // Check if reserved by us
      const reservedByUs = controller.reservation?.username === myUsername;
      const reservationTicks = controller.reservation?.ticksToEnd ?? 0;
      
      // Need reserver if not reserved or reservation is running low
      if (!reservedByUs || reservationTicks < RESERVATION_THRESHOLD_TICKS) {
        // Check if we already have a reserver going there
        const hasReserver = Object.values(Game.creeps).some(creep => {
          const memory = creep.memory as unknown as SwarmCreepMemory;
          return memory.role === "claimer" && memory.targetRoom === remoteName;
        });
        
        if (!hasReserver) {
          return true; // Found a remote that needs a reserver
        }
      }
    } else {
      // No vision - check if we have a reserver assigned
      const hasReserver = Object.values(Game.creeps).some(creep => {
        const memory = creep.memory as unknown as SwarmCreepMemory;
        return memory.role === "claimer" && memory.targetRoom === remoteName;
      });
      
      if (!hasReserver) {
        return true; // No reserver for this remote
      }
    }
  }
  
  return false;
}

/**
 * Get my username (cached)
 */
function getMyUsername(): string {
  const spawns = Object.values(Game.spawns);
  if (spawns.length > 0) {
    return spawns[0].owner.username;
  }
  return "";
}

/**
 * Determine next role to spawn
 */
export function determineNextRole(room: Room, swarm: SwarmState): string | null {
  const counts = countCreepsByRole(room.name);

  // Bootstrap mode: use deterministic priority spawning for critical roles
  // This ensures proper recovery from bad states (all creeps dead, missing critical roles)
  if (isBootstrapMode(room.name, room)) {
    const bootstrapRole = getBootstrapRole(room.name, room, swarm);
    if (bootstrapRole) {
      return bootstrapRole;
    }
    // If no bootstrap role needed, fall through to weighted selection
  }

  // Normal mode: weighted selection based on posture, pheromones, and priorities
  const postureWeights = getPostureSpawnWeights(swarm.posture);

  // Build weighted entries
  const entries: WeightedEntry<string>[] = [];

  for (const [role, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (!needsRole(room.name, role, swarm)) continue;

    const baseWeight = def.priority;
    const postureWeight = postureWeights[role] ?? 0.5;
    const pheromoneMult = getPheromoneMult(role, swarm.pheromones as unknown as Record<string, number>);
    const priorityBoost = getDynamicPriorityBoost(room, swarm, role);

    // Reduce weight based on current count
    const current = counts.get(role) ?? 0;
    const countFactor = Math.max(0.1, 1 - current / def.maxPerRoom);

    const weight = (baseWeight + priorityBoost) * postureWeight * pheromoneMult * countFactor;

    entries.push({ key: role, weight });
  }

  if (entries.length === 0) return null;

  return weightedSelection(entries) ?? null;
}

/**
 * Generate creep name
 */
export function generateCreepName(role: string): string {
  return `${role}_${Game.time}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Get count of energy-producing creeps (harvesters + larvaWorkers)
 */
export function getEnergyProducerCount(counts: Map<string, number>): number {
  return (counts.get("harvester") ?? 0) + (counts.get("larvaWorker") ?? 0);
}

/**
 * Get count of transport creeps (haulers + larvaWorkers)
 */
export function getTransportCount(counts: Map<string, number>): number {
  return (counts.get("hauler") ?? 0) + (counts.get("larvaWorker") ?? 0);
}

/**
 * Check if room is in emergency state (no ACTIVE energy-producing creeps)
 * This happens when all creeps die and extensions are empty.
 * 
 * IMPORTANT: Only counts ACTIVE (non-spawning) creeps. This ensures we continue
 * spawning bootstrap creeps even while one is already spawning, allowing
 * faster recovery from total workforce collapse.
 */
export function isEmergencySpawnState(roomName: string): boolean {
  const counts = countCreepsByRole(roomName, true); // activeOnly = true
  return getEnergyProducerCount(counts) === 0;
}

/**
 * Bootstrap spawn order - deterministic priority-based spawning.
 * This defines the order in which critical roles should be spawned during
 * recovery from a bad state, ensuring the economy can bootstrap properly.
 */
const BOOTSTRAP_SPAWN_ORDER: { role: string; minCount: number; condition?: (room: Room) => boolean }[] = [
  // 1. Energy production first - can't do anything without energy
  { role: "larvaWorker", minCount: 1 },
  // 2. Static harvesters for efficient mining (1 per source is enough with bigger bodies)
  { role: "harvester", minCount: 1 },
  // 3. Transport to distribute energy (1 is enough with bigger bodies)
  { role: "hauler", minCount: 1 },
  // 4. Second harvester for second source
  { role: "harvester", minCount: 2 },
  // 5. Queen carrier when storage exists (manages spawns/extensions)
  { role: "queenCarrier", minCount: 1, condition: (room) => Boolean(room.storage) },
  // 6. Upgrader for controller progress
  { role: "upgrader", minCount: 1 }
];

/**
 * Determine if the room is in "bootstrap" mode where critical roles are missing.
 * In bootstrap mode, we use deterministic priority spawning instead of weighted selection.
 *
 * Bootstrap mode is active when:
 * - Zero ACTIVE energy producers exist, OR
 * - We have energy producers but no transport (energy can't be distributed), OR
 * - We have fewer than minimum critical roles
 * 
 * IMPORTANT: Uses activeOnly counts for emergency detection but total counts for
 * role minimums. This ensures we aggressively spawn multiple small creeps during
 * workforce collapse while still allowing spawning creeps to count towards role limits.
 */
export function isBootstrapMode(roomName: string, room: Room): boolean {
  // Check ACTIVE creeps for emergency detection
  const activeCounts = countCreepsByRole(roomName, true);
  
  // Critical: no ACTIVE energy production at all
  // This ensures we keep spawning even while a larvaWorker is spawning
  if (getEnergyProducerCount(activeCounts) === 0) {
    return true;
  }

  // Critical: we have harvesters but no way to transport energy
  // (larvaWorkers can self-transport so they count as transport)
  if (getTransportCount(activeCounts) === 0 && (activeCounts.get("harvester") ?? 0) > 0) {
    return true;
  }

  // For minimum role checks, use total counts (including spawning)
  // This prevents spawning duplicates when one is already spawning
  const totalCounts = countCreepsByRole(roomName, false);
  
  // Check minimum counts against bootstrap order
  // This includes queenCarrier (when storage exists) as part of the order
  for (const req of BOOTSTRAP_SPAWN_ORDER) {
    // Skip conditional roles if condition not met
    if (req.condition && !req.condition(room)) {
      continue;
    }

    const current = totalCounts.get(req.role) ?? 0;
    if (current < req.minCount) {
      return true;
    }
  }

  return false;
}

/**
 * Get the next role to spawn in bootstrap mode.
 * Uses deterministic priority order instead of weighted random selection.
 * 
 * IMPORTANT: Checks active counts for emergency, but total counts for role minimums.
 * This allows spawning additional larvaWorkers if none are active, even if one is spawning.
 */
export function getBootstrapRole(roomName: string, room: Room, swarm: SwarmState): string | null {
  // Check ACTIVE energy producers for emergency
  const activeCounts = countCreepsByRole(roomName, true);
  
  // First check emergency: zero ACTIVE energy producers
  // This ensures we can spawn multiple larvaWorkers if needed for faster recovery
  if (getEnergyProducerCount(activeCounts) === 0) {
    return "larvaWorker";
  }

  // For role minimums, use total counts (including spawning)
  const totalCounts = countCreepsByRole(roomName, false);
  
  // Follow bootstrap order
  for (const req of BOOTSTRAP_SPAWN_ORDER) {
    // Skip conditional roles if condition not met
    if (req.condition && !req.condition(room)) {
      continue;
    }

    const current = totalCounts.get(req.role) ?? 0;
    if (current < req.minCount) {
      // Verify we can spawn this role (check needsRole for special conditions)
      if (needsRole(roomName, req.role, swarm)) {
        return req.role;
      }
    }
  }

  return null;
}

/**
 * Get all roles that need spawning, sorted by priority
 */
export function getAllSpawnableRoles(room: Room, swarm: SwarmState): string[] {
  const counts = countCreepsByRole(room.name);
  const postureWeights = getPostureSpawnWeights(swarm.posture);

  // Collect all roles that need spawning with their calculated priorities
  const roleScores: { role: string; score: number }[] = [];

  for (const [role, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (!needsRole(room.name, role, swarm)) continue;

    const baseWeight = def.priority;
    const postureWeight = postureWeights[role] ?? 0.5;
    const pheromoneMult = getPheromoneMult(role, swarm.pheromones as unknown as Record<string, number>);
    const priorityBoost = getDynamicPriorityBoost(room, swarm, role);

    // Reduce weight based on current count
    const current = counts.get(role) ?? 0;
    const countFactor = Math.max(0.1, 1 - current / def.maxPerRoom);

    const score = (baseWeight + priorityBoost) * postureWeight * pheromoneMult * countFactor;

    roleScores.push({ role, score });
  }

  // Sort by score descending (highest priority first)
  roleScores.sort((a, b) => b.score - a.score);

  return roleScores.map(rs => rs.role);
}

/**
 * Spawn manager - run for a room
 */
export function runSpawnManager(room: Room, swarm: SwarmState): void {
  const spawns = room.find(FIND_MY_SPAWNS);
  const availableSpawn = spawns.find(s => !s.spawning);

  if (!availableSpawn) return;

  const energyCapacity = room.energyCapacityAvailable;
  const energyAvailable = room.energyAvailable;

  // Emergency mode: when no energy-producing creeps exist and extensions are empty,
  // use energyAvailable to select body instead of energyCapacityAvailable.
  // This prevents deadlock where we wait for extensions to fill but have no creeps to fill them.
  const isEmergency = isEmergencySpawnState(room.name);
  const effectiveCapacity = isEmergency ? energyAvailable : energyCapacity;

  // Workforce collapse warning: If we're in emergency with very low energy
  // Log a warning to help identify critical situations
  if (isEmergency && energyAvailable < 150) {
    logger.warn(
      `WORKFORCE COLLAPSE: ${energyAvailable} energy available, need 150 to spawn minimal larvaWorker. ` +
      `Room will recover once energy reaches 150.`,
      {
        subsystem: "spawn",
        room: room.name
      }
    );
    
    kernel.emit("spawn.emergency", {
      roomName: room.name,
      energyAvailable,
      message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
      source: "SpawnManager"
    });
  }
  
  // Log bootstrap mode for visibility
  const inBootstrapMode = isBootstrapMode(room.name, room);
  if (inBootstrapMode && Game.time % 10 === 0) {
    const activeCounts = countCreepsByRole(room.name, true);
    const totalCounts = countCreepsByRole(room.name, false);
    const activeLarva = activeCounts.get("larvaWorker") ?? 0;
    const totalLarva = totalCounts.get("larvaWorker") ?? 0;
    const activeHarvest = activeCounts.get("harvester") ?? 0;
    const totalHarvest = totalCounts.get("harvester") ?? 0;
    
    logger.info(
      `BOOTSTRAP MODE: ${getEnergyProducerCount(activeCounts)} active energy producers ` +
      `(${activeLarva} larva, ${activeHarvest} harvest), ${getEnergyProducerCount(totalCounts)} total. ` +
      `Energy: ${energyAvailable}/${energyCapacity}`,
      {
        subsystem: "spawn",
        room: room.name
      }
    );
  }

  // SPAWN FIX: Try roles in priority order until we find one we can afford
  // This prevents the spawn system from stalling when high-priority roles
  // are too expensive for current energy levels.
  
  // In bootstrap mode, use deterministic bootstrap order
  if (isBootstrapMode(room.name, room)) {
    const role = getBootstrapRole(room.name, room, swarm);
    if (!role) return;

    const def = ROLE_DEFINITIONS[role];
    if (!def) return;

    const body = getBestBody(def, effectiveCapacity);
    if (!body) return;

    // Check if we have enough energy
    if (energyAvailable < body.cost) return;

    // Spawn creep
    const name = generateCreepName(role);
    const memory: SwarmCreepMemory = {
      role: def.role,
      family: def.family,
      homeRoom: room.name,
      version: 1
    };

    // For remote roles, set the targetRoom to the remote room that needs workers
    // Skip spawning if no valid target room is available (prevents spawn blocking)
    // NOTE: This check is defensive - remote roles are not in BOOTSTRAP_SPAWN_ORDER
    // and needsRole should already filter them. However, this provides extra safety
    // in case bootstrap order is modified in the future.
    if (role === "remoteHarvester" || role === "remoteHauler") {
      const targetRoom = getRemoteRoomNeedingWorkers(room.name, role, swarm);
      if (targetRoom) {
        memory.targetRoom = targetRoom;
      } else {
        // No valid target room - don't spawn this remote role
        return;
      }
    }

    const result = availableSpawn.spawnCreep(body.parts, name, {
      memory: memory as unknown as CreepMemory
    });

    if (result === OK) {
      logger.info(
        `BOOTSTRAP SPAWN: ${role} (${name}) with ${body.parts.length} parts, cost ${body.cost}. Recovery in progress.`,
        {
          subsystem: "spawn",
          room: room.name
        }
      );
      
      kernel.emit("spawn.completed", {
        roomName: room.name,
        creepName: name,
        role,
        cost: body.cost,
        source: "SpawnManager"
      });
    }
    return;
  }

  // Normal mode: Get all spawnable roles sorted by priority
  // Try each one until we find an affordable option
  const spawnableRoles = getAllSpawnableRoles(room, swarm);

  for (const role of spawnableRoles) {
    const def = ROLE_DEFINITIONS[role];
    if (!def) continue;

    // SPAWN FIX: Try optimal body first (based on capacity), then fallback to smaller body
    // 1. Try to spawn optimal body for capacity
    let body = getBestBody(def, effectiveCapacity);
    if (body && energyAvailable >= body.cost) {
      // Can afford optimal body, use it
    } else {
      // Can't afford optimal body, try smaller body based on available energy
      body = getBestBody(def, energyAvailable);
      if (!body || energyAvailable < body.cost) {
        // Can't afford any body for this role, try next role
        continue;
      }
    }

    // We found an affordable role, spawn it
    const name = generateCreepName(role);
    const memory: SwarmCreepMemory = {
      role: def.role,
      family: def.family,
      homeRoom: room.name,
      version: 1
    };

    // For remote roles, set the targetRoom to the remote room that needs workers
    // Skip spawning if no valid target room is available (prevents spawn blocking)
    if (role === "remoteHarvester" || role === "remoteHauler") {
      const targetRoom = getRemoteRoomNeedingWorkers(room.name, role, swarm);
      if (targetRoom) {
        memory.targetRoom = targetRoom;
      } else {
        // No valid target room - skip this role and try next
        continue;
      }
    }

    // For inter-room carrier, assign a transfer request
    if (role === "interRoomCarrier" && swarm.clusterId) {
      const cluster = memoryManager.getCluster(swarm.clusterId);
      if (cluster) {
        // Find request from this room that needs carriers
        const request = cluster.resourceRequests.find(req => {
          if (req.fromRoom !== room.name) return false;
          const assignedCount = req.assignedCreeps.filter(n => Game.creeps[n]).length;
          const remaining = req.amount - req.delivered;
          return remaining > 500 && assignedCount < 2;
        });

        if (request) {
          memory.transferRequest = {
            fromRoom: request.fromRoom,
            toRoom: request.toRoom,
            resourceType: request.resourceType,
            amount: request.amount
          };
          request.assignedCreeps.push(name);
        }
      }
    }

    const result = availableSpawn.spawnCreep(body.parts, name, {
      memory: memory as unknown as CreepMemory
    });

    // Emit spawn completed event on successful spawn
    if (result === OK) {
      kernel.emit("spawn.completed", {
        roomName: room.name,
        creepName: name,
        role,
        cost: body.cost,
        source: "SpawnManager"
      });
      return; // Successfully spawned, exit
    }

    // If spawn failed for a reason other than insufficient energy, give up
    if (result !== ERR_NOT_ENOUGH_ENERGY) {
      return;
    }
  }
}

/**
 * Task assignment - assign source to harvester
 */
export function assignHarvesterSource(creep: Creep): Id<Source> | null {
  const room = creep.room;
  const sources = room.find(FIND_SOURCES);

  // Count harvesters per source
  const sourceCounts = new Map<string, number>();
  for (const source of sources) {
    sourceCounts.set(source.id, 0);
  }

  for (const c of Object.values(Game.creeps)) {
    const m = c.memory as unknown as SwarmCreepMemory;
    if (m.role === "harvester" && m.sourceId) {
      sourceCounts.set(m.sourceId, (sourceCounts.get(m.sourceId) ?? 0) + 1);
    }
  }

  // Find source with fewest harvesters
  let minCount = Infinity;
  let bestSource: Source | null = null;

  for (const source of sources) {
    const count = sourceCounts.get(source.id) ?? 0;
    if (count < minCount) {
      minCount = count;
      bestSource = source;
    }
  }

  return bestSource?.id ?? null;
}

/**
 * Task assignment - find best construction site
 */
export function findBestConstructionSite(room: Room): ConstructionSite | null {
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (sites.length === 0) return null;

  // Priority: spawn > extension > tower > storage > other
  const priorities: Record<string, number> = {
    [STRUCTURE_SPAWN]: 100,
    [STRUCTURE_EXTENSION]: 90,
    [STRUCTURE_TOWER]: 80,
    [STRUCTURE_STORAGE]: 70,
    [STRUCTURE_TERMINAL]: 65,
    [STRUCTURE_CONTAINER]: 60,
    [STRUCTURE_ROAD]: 30
  };

  return (
    sites.sort((a, b) => {
      const pa = priorities[a.structureType] ?? 50;
      const pb = priorities[b.structureType] ?? 50;
      return pb - pa;
    })[0] ?? null
  );
}

/**
 * Task assignment - find best repair target
 */
export function findBestRepairTarget(room: Room): Structure | null {
  const structures = room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
  });

  if (structures.length === 0) return null;

  // Sort by damage percentage
  return structures.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax)[0] ?? null;
}
