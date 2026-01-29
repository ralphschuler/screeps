/**
 * Creep-level memory schemas
 * Tracks creep roles, state, and behavior
 */

/**
 * Role family
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
 * Power creep roles (for PowerCreeps)
 */
export type PowerRole = "powerQueen" | "powerWarrior";

/**
 * Power bank harvester roles (for regular creeps)
 */
export type PowerBankRole = "powerHarvester" | "powerCarrier";

/**
 * All roles
 */
export type CreepRole = EconomyRole | MilitaryRole | UtilityRole | PowerRole | PowerBankRole;

/**
 * Creep state for state machine
 * Tracks the current committed action until completion
 */
export interface CreepState {
  /** The action type the creep is committed to */
  action: string;
  /** Target object ID for the action */
  targetId?: Id<_HasId>;
  /** Serialized target position for actions without a persistent object */
  targetPos?: { x: number; y: number; roomName: string };
  /** Room name target (for moveToRoom actions) */
  targetRoom?: string;
  /** Tick when this state was entered */
  startTick: number;
  /** Max ticks before state expires (timeout) */
  timeout: number;
  /** Custom data for this state */
  data?: Record<string, unknown>;
}

/**
 * Transfer request assignment for inter-room carriers
 */
export interface TransferRequestAssignment {
  fromRoom: string;
  toRoom: string;
  resourceType: ResourceConstant;
  amount: number;
}

/**
 * Swarm creep memory
 */
export interface SwarmCreepMemory {
  /** Role */
  role: CreepRole;
  /** Role family */
  family: RoleFamily;
  /** Home room */
  homeRoom: string;
  /** Target room (if different from home) */
  targetRoom?: string;
  /** Last explored room (for scouts to avoid cycling) */
  lastExploredRoom?: string;
  /** Current task */
  task?: string;
  /** Source ID (for harvesters) */
  sourceId?: Id<Source>;
  /** Target ID (for various tasks) */
  targetId?: Id<_HasId>;
  /** Working flag */
  working?: boolean;
  /** Squad ID (if in a squad) */
  squadId?: string;
  /** Boosted flag */
  boosted?: boolean;
  /** Boost requirements (for spawning with boost intentions) */
  boostRequirements?: {
    resourceType: ResourceConstant;
    bodyParts: BodyPartConstant[];
  }[];
  /** Patrol waypoint index (for defense units) */
  patrolIndex?: number;
  /** Assist target room (for defense units helping other rooms) */
  assistTarget?: string;
  /** Current state (for state machine) */
  state?: CreepState;
  /** Transfer request assignment (for interRoomCarrier role) */
  transferRequest?: TransferRequestAssignment;
  /** Workflow state for cross-shard carriers (simple string state vs. complex CreepState) */
  workflowState?: string;
  /** Version for memory migration */
  version: number;
  
  // Harvester optimizations - cache nearby structures
  /** Cached nearby container ID (for harvesters) */
  nearbyContainerId?: Id<StructureContainer>;
  /** Tick when container was cached (for harvesters) */
  nearbyContainerTick?: number;
  /** Cached nearby link ID (for harvesters) */
  nearbyLinkId?: Id<StructureLink>;
  /** Tick when link was cached (for harvesters) */
  nearbyLinkTick?: number;
  /** Cached remote container ID (for remote harvesters) */
  remoteContainerId?: Id<StructureContainer>;
  /** Tick when remote container was cached (for remote harvesters) */
  remoteContainerTick?: number;
  
  /** Role-specific efficiency metrics for performance analysis */
  _metrics?: {
    /** Total number of tasks completed (builds finished, upgrades done, etc.) */
    tasksCompleted: number;
    /** Total energy/resources transferred to structures or other creeps */
    energyTransferred: number;
    /** Total energy harvested from sources */
    energyHarvested: number;
    /** Total construction progress contributed */
    buildProgress: number;
    /** Total repair progress contributed */
    repairProgress: number;
    /** Total damage dealt (for combat roles) */
    damageDealt: number;
    /** Total healing done (for healer roles) */
    healingDone: number;
  };
}

/**
 * Create default creep memory
 */
export function createDefaultCreepMemory(role: CreepRole, family: RoleFamily, homeRoom: string): SwarmCreepMemory {
  return {
    role,
    family,
    homeRoom,
    version: 1
  };
}
