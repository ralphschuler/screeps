/**
 * Bot-Specific Type Definitions
 * 
 * These types are specific to the ralphschuler/screeps bot implementation.
 * They are defined here to avoid circular dependencies between packages.
 */

/**
 * Role family classification
 */
export type RoleFamily = "economy" | "military" | "utility" | "power";

/**
 * Economy roles
 */
export type EconomyRole =
  | "larvaWorker"
  | "harvester"
  | "hauler"
  | "builder"
  | "upgrader"
  | "queenCarrier"
  | "mineralHarvester"
  | "depositHarvester"
  | "labTech"
  | "factoryWorker"
  | "remoteHarvester"
  | "remoteHauler"
  | "interRoomCarrier"
  | "crossShardCarrier";

/**
 * Military roles
 */
export type MilitaryRole = "guard" | "remoteGuard" | "healer" | "soldier" | "siegeUnit" | "harasser" | "ranger";

/**
 * Utility roles
 */
export type UtilityRole = "scout" | "claimer" | "engineer" | "remoteWorker" | "linkManager" | "terminalManager";

/**
 * Power roles
 */
export type PowerRole = "powerQueen" | "powerWarrior";

/**
 * Power bank roles
 */
export type PowerBankRole = "powerHarvester" | "powerCarrier";

/**
 * All creep roles
 */
export type CreepRole = EconomyRole | MilitaryRole | UtilityRole | PowerRole | PowerBankRole;

/**
 * Pheromone values for spawn prioritization
 */
export interface Pheromones {
  expand: number;
  harvest: number;
  build: number;
  upgrade: number;
  defense: number;
  war: number;
  siege: number;
  logistics: number;
}

/**
 * Colony development levels
 */
export type ColonyLevel = "egg" | "larva" | "worker" | "queen" | "swarm";

/**
 * Room posture types (defensive stance)
 */
export type RoomPosture = "eco" | "defense" | "war" | "siege" | "recovery" | "bootstrap";

/**
 * Swarm state for a room
 */
export interface SwarmState {
  /** Current colony development level */
  colonyLevel: ColonyLevel;
  /** Current room posture/stance */
  posture: RoomPosture;
  /** Pheromone values */
  pheromones: Pheromones;
  /** Danger level (0-3) */
  danger: 0 | 1 | 2 | 3;
  /** Remote mining targets */
  remoteMiningTargets?: string[];
  /** Reserved rooms for expansion */
  reservedRooms?: string[];
  /** Remote mining assignments */
  remoteAssignments?: Record<string, { harvesters: number; haulers: number; guards: number }>;
  /** Cluster ID for multi-room coordination */
  clusterId?: string;
}

/**
 * Creep memory interface
 */
export interface SwarmCreepMemory extends CreepMemory {
  /** Creep role */
  role: CreepRole;
  /** Role family */
  family?: RoleFamily;
  /** Home room */
  home: string;
  /** Home room (alternative spelling for compatibility) */
  homeRoom?: string;
  /** Target room (for remote roles) */
  targetRoom?: string;
  /** Source ID (for harvesters) */
  sourceId?: Id<Source>;
  /** Mineral ID (for mineral harvesters) */
  mineralId?: Id<Mineral>;
  /** Target ID for various actions */
  targetId?: Id<_HasId>;
  /** Working status */
  working?: boolean;
  /** Recycling flag */
  recycle?: boolean;
  /** Boost requirements */
  boostRequirements?: {
    resourceType: ResourceConstant;
    bodyParts: BodyPartConstant[];
  }[];
  /** Task assignment */
  task?: string;
  /** Transfer request assignment */
  transferRequest?: {
    fromRoom: string;
    toRoom: string;
    resourceType: ResourceConstant;
    amount: number;
  };
}
