/**
 * Type definitions for @ralphschuler/screeps-clusters
 * 
 * These types are extracted from screeps-bot to make the clusters package independent.
 * They define the core structures needed for cluster management, squad coordination,
 * and inter-room cooperation.
 */

// ============================================================================
// Extended Screeps Global Interfaces
// ============================================================================

declare global {
  /**
   * Extend CreepMemory to include role property
   * Required by cluster management for role-based creep filtering
   */
  interface CreepMemory {
    role?: string;
  }

  /**
   * Extend Memory to include empire property
   * Used for cluster management data storage
   */
  interface Memory {
    empire?: EmpireMemory;
  }
}

// ============================================================================
// Squad and Military Definitions
// ============================================================================

/**
 * Squad definition for coordinated military operations
 */
export interface SquadDefinition {
  /** Squad ID */
  id: string;
  /** Squad type */
  type: "harass" | "raid" | "siege" | "defense";
  /** Member creep names */
  members: string[];
  /** Rally room/flag */
  rallyRoom: string;
  /** Target rooms */
  targetRooms: string[];
  /** Current state */
  state: "gathering" | "moving" | "attacking" | "retreating" | "dissolving";
  /** Creation tick */
  createdAt: number;
  /** Retreat threshold (HP percentage, 0-1) */
  retreatThreshold?: number;
}

/**
 * Defense assistance request for cluster coordination
 */
export interface DefenseAssistanceRequest {
  /** Room requesting assistance */
  roomName: string;
  /** Number of guards needed */
  guardsNeeded: number;
  /** Number of rangers needed */
  rangersNeeded: number;
  /** Number of healers needed */
  healersNeeded: number;
  /** Urgency level (1-3) */
  urgency: number;
  /** Game tick when request was created */
  createdAt: number;
  /** Brief description of the threat */
  threat: string;
  /** Creeps assigned to assist (creep names) */
  assignedCreeps: string[];
}

/**
 * Resource transfer request for inter-room resource sharing
 */
export interface ResourceTransferRequest {
  /** Room requesting resources */
  toRoom: string;
  /** Room providing resources */
  fromRoom: string;
  /** Resource type to transfer */
  resourceType: ResourceConstant;
  /** Amount needed */
  amount: number;
  /** Priority (1-5, higher = more urgent) */
  priority: number;
  /** Game tick when request was created */
  createdAt: number;
  /** Creeps assigned to fulfill this request */
  assignedCreeps: string[];
  /** Amount already delivered */
  delivered: number;
}

/**
 * Room intelligence data
 */
export interface RoomIntel {
  /** Room name */
  name: string;
  /** Last seen game time */
  lastSeen: number;
  /** Number of sources */
  sources: number;
  /** Controller level (0 if none) */
  controllerLevel: number;
  /** Controller owner username (undefined if unowned) */
  owner?: string;
  /** Controller reserver username */
  reserver?: string;
  /** Mineral type if present */
  mineralType?: MineralConstant;
  /** Threat indicators */
  threatLevel: 0 | 1 | 2 | 3;
  /** Whether room has been fully scouted */
  scouted: boolean;
  /** Terrain type classification */
  terrain: "plains" | "swamp" | "mixed";
  /** Highway room flag */
  isHighway: boolean;
  /** Source keeper room flag */
  isSK: boolean;
  /** Number of towers (for nuke targeting) */
  towerCount?: number;
  /** Number of spawns (for nuke targeting) */
  spawnCount?: number;
  /** Whether room contains portal structures */
  hasPortal?: boolean;
}

// ============================================================================
// Cluster Memory
// ============================================================================

/**
 * Cluster memory structure
 * Manages multi-room coordination and shared resources
 */
export interface ClusterMemory {
  /** Cluster ID */
  id: string;
  /** Core room (capital) */
  coreRoom: string;
  /** All member rooms */
  memberRooms: string[];
  /** Remote mining rooms */
  remoteRooms: string[];
  /** Forward base rooms */
  forwardBases: string[];
  /** Cluster role */
  role: "economic" | "war" | "mixed" | "frontier";
  /** Aggregated metrics */
  metrics: {
    /** Total energy income per tick (rolling average) */
    energyIncome: number;
    /** Total energy consumption per tick */
    energyConsumption: number;
    /** Energy surplus/deficit */
    energyBalance: number;
    /** War index (0-100) */
    warIndex: number;
    /** Economy health index (0-100) */
    economyIndex: number;
    /** Military readiness (0-100): availability of military creeps */
    militaryReadiness?: number;
  };
  /** Active squads */
  squads: SquadDefinition[];
  /** Rally points for defense/offense */
  rallyPoints: {
    roomName: string;
    x: number;
    y: number;
    purpose: "defense" | "offense" | "staging" | "retreat";
    createdAt?: number;
    lastUsed?: number;
  }[];
  /** Defense assistance requests from member rooms */
  defenseRequests: DefenseAssistanceRequest[];
  /** Resource transfer requests for inter-room resource sharing */
  resourceRequests: ResourceTransferRequest[];
  /** Room currently being prioritized for upgrading to RCL 8 */
  focusRoom?: string;
  /** Last update tick */
  lastUpdate: number;
}

// ============================================================================
// Empire and Swarm State Types
// ============================================================================

/**
 * Empire memory (global coordination across all clusters)
 */
export interface EmpireMemory {
  /** All clusters keyed by cluster ID */
  clusters: Record<string, ClusterMemory>;
  /** Known rooms for attack target selection */
  knownRooms?: Record<string, RoomIntel>;
  /** Other empire-level data */
  [key: string]: unknown;
}

/**
 * Evolution stage (colony level)
 */
export type EvolutionStage =
  | "seedNest" // RCL 1-3
  | "foragingExpansion" // RCL 3-4
  | "matureColony" // RCL 4-6
  | "fortifiedHive" // RCL 7-8
  | "empireDominance"; // Multi-room/shard endgame

/**
 * Room posture (intent)
 */
export type RoomPosture = "eco" | "expand" | "defensive" | "war" | "siege" | "evacuate" | "nukePrep";

/**
 * Swarm state stored in RoomMemory
 */
export interface SwarmState {
  /** Evolution stage / colony level */
  colonyLevel: EvolutionStage;
  /** Current posture */
  posture: RoomPosture;
  /** Danger level (0-3) */
  danger: 0 | 1 | 2 | 3;
  /** Cluster ID */
  clusterId?: string;
  /** Room metrics */
  metrics?: {
    energyHarvested?: number;
    energySpawning?: number;
    energyConstruction?: number;
    energyRepair?: number;
    energyTower?: number;
    controllerProgress?: number;
    hostileCount?: number;
    damageReceived?: number;
    constructionSites?: number;
    energyAvailable?: number;
    energyCapacity?: number;
    energyNeed?: 0 | 1 | 2 | 3;
  };
  /** Other swarm state data */
  [key: string]: unknown;
}

// ============================================================================
// Offensive Doctrine Types
// ============================================================================

/**
 * Offensive doctrine types
 */
export type OffensiveDoctrine = 
  | "harass" 
  | "raid" 
  | "siege" 
  | "nuke" 
  | "drain";

/**
 * Offensive operation structure
 */
export interface OffensiveOperation {
  /** Operation ID */
  id: string;
  /** Target room */
  targetRoom: string;
  /** Operation type/doctrine */
  doctrine: OffensiveDoctrine;
  /** Operation state */
  state: "planning" | "staging" | "active" | "completed" | "aborted";
  /** Associated squad IDs */
  squadIds: string[];
  /** Creation tick */
  createdAt: number;
  /** Completion tick */
  completedAt?: number;
}

// ============================================================================
// Spawn Queue Types
// ============================================================================

/**
 * Spawn priority levels
 */
export enum SpawnPriority {
  /** Critical emergency spawns (workforce collapse, no energy producers) */
  EMERGENCY = 1000,
  /** High priority (defenders during attack, critical roles) */
  HIGH = 500,
  /** Normal priority (standard economy roles) */
  NORMAL = 100,
  /** Low priority (utility, expansion, optimization) */
  LOW = 50
}

/**
 * Body template for spawn requests
 */
export interface BodyTemplate {
  pattern: BodyPartConstant[];
  sizeLimit: number;
}

/**
 * Spawn request structure
 */
export interface SpawnRequest {
  /** Unique ID for this request */
  id: string;
  /** Room where spawn should occur */
  roomName: string;
  /** Role to spawn */
  role: string;
  /** Priority level */
  priority: number;
  /** Body template or parts */
  body: BodyPartConstant[] | BodyTemplate;
  /** Game tick when request was created */
  createdAt: number;
  /** Optional target room for remote roles */
  targetRoom?: string;
  /** Additional memory fields */
  additionalMemory?: Partial<CreepMemory>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create default cluster memory
 */
export function createDefaultClusterMemory(id: string, coreRoom: string): ClusterMemory {
  return {
    id,
    coreRoom,
    memberRooms: [coreRoom],
    remoteRooms: [],
    forwardBases: [],
    role: "economic",
    metrics: {
      energyIncome: 0,
      energyConsumption: 0,
      energyBalance: 0,
      warIndex: 0,
      economyIndex: 100
    },
    squads: [],
    rallyPoints: [],
    defenseRequests: [],
    resourceRequests: [],
    lastUpdate: Game.time
  };
}
