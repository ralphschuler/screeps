/**
 * Creep Behavior Framework Types
 *
 * Generic type definitions for the behavior framework.
 * These types are designed to be independent of specific memory schemas,
 * allowing the framework to be used with any bot implementation.
 */

/**
 * Generic creep memory interface
 * Extend this in your bot for custom memory fields
 */
export interface BaseCreepMemory {
  /** Role identifier */
  role: string;
  /** Home room */
  homeRoom?: string;
  /** Working flag (for state toggling) */
  working?: boolean;
  /** Source ID (for harvesters) */
  sourceId?: Id<Source>;
  /** Target ID (for various tasks) */
  targetId?: Id<_HasId>;
  /** Current state (for state machine) */
  state?: CreepState;
}

/**
 * Creep state for state machine behavior
 */
export interface CreepState {
  /** Current action being performed */
  action: string;
  /** Target ID for the action */
  targetId?: Id<_HasId>;
  /** Serialized target position for movement actions */
  targetPos?: { x: number; y: number; roomName: string };
  /** Exact movement range when the action supplied one */
  targetRange?: number;
  /** State-specific data */
  data?: unknown;
}

/**
 * A movement target with an explicit acceptable range.
 *
 * Portal traversal requires range 0 because a creep must step onto the
 * portal tile; the movement libraries otherwise default object/position
 * targets to range 1.
 */
export interface CreepMoveTarget {
  pos: RoomPosition;
  range: number;
}

/**
 * All possible actions a creep can perform.
 * Each action is a simple object describing what the creep should do.
 */
export type RemoteMoveRouteType = "harvester" | "hauler" | "reserver" | "guard";

export type CreepAction =
  // Resource gathering actions
  | { type: "harvest"; target: Source }
  | { type: "harvestMineral"; target: Mineral }
  | { type: "harvestDeposit"; target: Deposit }
  | { type: "pickup"; target: Resource }
  | { type: "withdraw"; target: AnyStoreStructure | Tombstone | Ruin; resourceType: ResourceConstant }

  // Resource delivery actions
  | { type: "transfer"; target: AnyStoreStructure; resourceType: ResourceConstant; amount?: number }
  | { type: "drop"; resourceType: ResourceConstant }

  // Construction and maintenance actions
  | { type: "build"; target: ConstructionSite }
  | { type: "repair"; target: Structure }
  | { type: "upgrade"; target: StructureController }
  | { type: "dismantle"; target: Structure }

  // Combat actions
  | { type: "attack"; target: Creep | Structure }
  | { type: "rangedAttack"; target: Creep | Structure }
  | { type: "heal"; target: Creep }
  | { type: "rangedHeal"; target: Creep }

  // Controller actions
  | { type: "claim"; target: StructureController }
  | { type: "reserve"; target: StructureController }
  | { type: "attackController"; target: StructureController }

  // Movement actions
  | { type: "moveTo"; target: RoomPosition | RoomObject | CreepMoveTarget }
  | { type: "moveToRoom"; roomName: string }
  | { type: "remoteMoveTo"; target: RoomPosition | RoomObject | CreepMoveTarget; routeType: RemoteMoveRouteType }
  | { type: "remoteMoveToRoom"; roomName: string; routeType: RemoteMoveRouteType }
  | { type: "flee"; from: RoomPosition[] }
  | { type: "wait"; position: RoomPosition }

  // Traffic/Yield action - request blocking creeps to move
  | { type: "requestMove"; target: RoomPosition }

  // No-op action
  | { type: "idle" };

/**
 * Minimal context containing all information a creep needs to make decisions.
 * Pre-computed values avoid redundant room.find() calls.
 * 
 * This is the minimal interface - implementations can extend this with
 * additional fields specific to their bot.
 */
export interface CreepContext<TMemory extends BaseCreepMemory = BaseCreepMemory> {
  // Core references
  creep: Creep;
  room: Room;
  memory: TMemory;

  // Location info
  homeRoom: string;
  isInHomeRoom: boolean;

  // Creep state
  isFull: boolean;
  isEmpty: boolean;
  isWorking: boolean;

  // Assigned targets
  assignedSource: Source | null;
  assignedMineral: Mineral | null;

  // Room analysis (pre-computed for efficiency)
  energyAvailable: boolean;
  nearbyEnemies: boolean;
  constructionSiteCount: number;
  damagedStructureCount: number;

  // Cached room objects
  droppedResources: Resource[];
  containers: StructureContainer[];
  /** Containers with free capacity for depositing energy */
  depositContainers: StructureContainer[];
  spawnStructures: (StructureSpawn | StructureExtension)[];
  towers: StructureTower[];
  storage: StructureStorage | undefined;
  terminal: StructureTerminal | undefined;
  hostiles: Creep[];
  damagedAllies: Creep[];
  prioritizedSites: ConstructionSite[];
  repairTargets: Structure[];
  labs: StructureLab[];
  factory: StructureFactory | undefined;
  /** Tombstones with resources available for pickup */
  tombstones: Tombstone[];
  /** Containers with non-energy minerals for hauler transport */
  mineralContainers: StructureContainer[];
}

/**
 * A behavior function takes a context and returns an action.
 * This is the core abstraction for all creep decision making.
 */
export type BehaviorFunction<TMemory extends BaseCreepMemory = BaseCreepMemory> = 
  (ctx: CreepContext<TMemory>) => CreepAction;

/**
 * Behavior result with metadata for resilience system
 */
export interface BehaviorResult {
  action: CreepAction;
  success: boolean;
  error?: string;
  context?: string;
}
