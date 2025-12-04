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
import { type WeightedEntry, weightedSelection } from "../utils/weightedSelection";
import { getDefenderPriorityBoost } from "../spawning/defenderManager";

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
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE], 400),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 600)
    ],
    priority: 100,
    maxPerRoom: 6,
    remoteRole: false
  },
  harvester: {
    role: "harvester",
    family: "economy",
    bodies: [
      createBody([WORK, WORK, MOVE], 250),
      createBody([WORK, WORK, WORK, WORK, MOVE, MOVE], 500),
      createBody([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], 700),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], 800)
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
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 600),
      createBody(
        [
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
          CARRY,
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
        1000
      )
    ],
    priority: 90,
    maxPerRoom: 4,
    remoteRole: true
  },
  upgrader: {
    role: "upgrader",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE], 200),
      createBody([WORK, WORK, WORK, CARRY, MOVE, MOVE], 450),
      createBody([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 750),
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 1150)
    ],
    priority: 60,
    maxPerRoom: 4,
    remoteRole: false
  },
  builder: {
    role: "builder",
    family: "economy",
    bodies: [
      createBody([WORK, CARRY, MOVE, MOVE], 250),
      createBody([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 500),
      createBody([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 750)
    ],
    priority: 70,
    maxPerRoom: 3,
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
      createBody([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 900)
    ],
    priority: 75,
    maxPerRoom: 10, // Higher max since these are distributed across remote rooms
    remoteRole: true
  },
  remoteHauler: {
    role: "remoteHauler",
    family: "economy",
    bodies: [
      createBody([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 400),
      createBody([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 800),
      createBody(
        [
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ],
        1000
      )
    ],
    priority: 70,
    maxPerRoom: 10, // Higher max since these are distributed across remote rooms
    remoteRole: true
  },

  // Military roles
  guard: {
    role: "guard",
    family: "military",
    bodies: [
      createBody([TOUGH, ATTACK, MOVE, MOVE], 190),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], 380),
      createBody([TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 680)
    ],
    priority: 80,
    maxPerRoom: 2,
    remoteRole: false
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
        [TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        850
      )
    ],
    priority: 70,
    maxPerRoom: 4,
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

  // Utility roles
  scout: {
    role: "scout",
    family: "utility",
    bodies: [createBody([MOVE], 50)],
    priority: 40,
    maxPerRoom: 1,
    remoteRole: true
  },
  claimer: {
    role: "claimer",
    family: "utility",
    bodies: [createBody([CLAIM, MOVE], 650), createBody([CLAIM, CLAIM, MOVE, MOVE], 1300)],
    priority: 50,
    maxPerRoom: 1,
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
        healer: 0.1,
        scout: 0.5,
        engineer: 0.8,
        remoteHarvester: 1.2,
        remoteHauler: 1.2
      };
    case "expand":
      return {
        harvester: 1.2,
        hauler: 1.0,
        upgrader: 0.8,
        builder: 1.0,
        queenCarrier: 0.8,
        guard: 0.3,
        scout: 1.5,
        claimer: 1.5,
        remoteWorker: 1.5,
        engineer: 0.5,
        remoteHarvester: 1.5,
        remoteHauler: 1.5
      };
    case "defensive":
      return {
        harvester: 1.0,
        hauler: 1.0,
        upgrader: 0.5,
        builder: 0.5,
        queenCarrier: 1.0,
        guard: 2.0,
        healer: 1.5,
        ranger: 1.0,
        engineer: 1.2,
        remoteHarvester: 0.5,
        remoteHauler: 0.5
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
        engineer: 0.5,
        remoteHarvester: 0.3,
        remoteHauler: 0.3
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
    healer: "defense",
    soldier: "war",
    siegeUnit: "siege",
    ranger: "war",
    scout: "expand",
    claimer: "expand",
    remoteWorker: "expand",
    engineer: "build",
    remoteHarvester: "harvest",
    remoteHauler: "logistics"
  };

  const pheromoneKey = map[role];
  if (!pheromoneKey) return 1.0;

  const value = pheromones[pheromoneKey] ?? 0;
  // Scale: 0-100 pheromone maps to 0.5-2.0 multiplier
  return 0.5 + (value / 100) * 1.5;
}

/**
 * Count creeps by role in a room
 */
export function countCreepsByRole(roomName: string): Map<string, number> {
  const counts = new Map<string, number>();

  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName) {
      const role = memory.role ?? "unknown";
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

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

  // Define max workers per remote room based on role
  const maxPerRemote = role === "remoteHarvester" ? 2 : 2; // 2 harvesters and 2 haulers per remote

  // Find a remote room that needs workers
  for (const remoteRoom of remoteAssignments) {
    const currentCount = countRemoteCreepsByTargetRoom(homeRoom, role, remoteRoom);
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

  const counts = countCreepsByRole(roomName);
  const current = counts.get(role) ?? 0;

  // Check max per room
  if (current >= def.maxPerRoom) return false;

  // Special conditions
  const room = Game.rooms[roomName];
  if (!room) return false;

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

  return true;
}

/**
 * Determine next role to spawn
 */
export function determineNextRole(room: Room, swarm: SwarmState): string | null {
  const postureWeights = getPostureSpawnWeights(swarm.posture);
  const counts = countCreepsByRole(room.name);

  // Emergency: if no harvesters, spawn larvaWorker
  if (getEnergyProducerCount(counts) === 0) {
    return "larvaWorker";
  }

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
 * Check if room is in emergency state (no energy-producing creeps)
 * This happens when all creeps die and extensions are empty
 */
export function isEmergencySpawnState(roomName: string): boolean {
  const counts = countCreepsByRole(roomName);
  return getEnergyProducerCount(counts) === 0;
}

/**
 * Spawn manager - run for a room
 */
export function runSpawnManager(room: Room, swarm: SwarmState): void {
  const spawns = room.find(FIND_MY_SPAWNS);
  const availableSpawn = spawns.find(s => !s.spawning);

  if (!availableSpawn) return;

  // Determine what to spawn
  const role = determineNextRole(room, swarm);
  if (!role) return;

  const def = ROLE_DEFINITIONS[role];
  if (!def) return;

  // Get best body for current energy
  const energyCapacity = room.energyCapacityAvailable;
  const energyAvailable = room.energyAvailable;

  // Emergency mode: when no energy-producing creeps exist and extensions are empty,
  // use energyAvailable to select body instead of energyCapacityAvailable.
  // This prevents deadlock where we wait for extensions to fill but have no creeps to fill them.
  const isEmergency = isEmergencySpawnState(room.name);
  const effectiveCapacity = isEmergency ? energyAvailable : energyCapacity;

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
  if (role === "remoteHarvester" || role === "remoteHauler") {
    const targetRoom = getRemoteRoomNeedingWorkers(room.name, role, swarm);
    if (targetRoom) {
      memory.targetRoom = targetRoom;
    }
  }

  availableSpawn.spawnCreep(body.parts, name, {
    memory: memory as unknown as CreepMemory
  });
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
