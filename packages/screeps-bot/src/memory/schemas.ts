/**
 * Memory Schemas - Phase 1
 *
 * TypeScript interfaces for all memory structures:
 * - Global/Empire memory
 * - Cluster/Colony state
 * - Room/Swarm state
 * - Creep/Squad state
 */

// ============================================================================
// 1.1 Global / Empire Memory
// ============================================================================

/**
 * Room intel entry for known rooms
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
}

/**
 * Expansion candidate with scoring
 */
export interface ExpansionCandidate {
  /** Room name */
  roomName: string;
  /** Expansion score (higher = better) */
  score: number;
  /** Distance from nearest owned room */
  distance: number;
  /** Whether room has been claimed/reserved */
  claimed: boolean;
  /** Last evaluated tick */
  lastEvaluated: number;
}

/**
 * Power bank location tracking
 */
export interface PowerBankEntry {
  /** Room name */
  roomName: string;
  /** Position */
  pos: { x: number; y: number };
  /** Remaining power amount */
  power: number;
  /** Decay tick */
  decayTick: number;
  /** Whether we're actively harvesting */
  active: boolean;
}

/**
 * Historical price data point for a resource
 */
export interface PriceDataPoint {
  /** Game tick when price was recorded */
  tick: number;
  /** Average price at this time */
  avgPrice: number;
  /** Lowest price at this time */
  lowPrice: number;
  /** Highest price at this time */
  highPrice: number;
}

/**
 * Market intelligence for a specific resource
 */
export interface ResourceMarketData {
  /** Resource type */
  resource: ResourceConstant;
  /** Historical prices (max 30 entries, oldest entries removed) */
  priceHistory: PriceDataPoint[];
  /** Rolling average price (last 10 data points) */
  avgPrice: number;
  /** Current trend: -1 (falling), 0 (stable), 1 (rising) */
  trend: -1 | 0 | 1;
  /** Last update tick */
  lastUpdate: number;
  /** Price volatility (standard deviation / average) */
  volatility?: number;
  /** Predicted next price (simple moving average) */
  predictedPrice?: number;
}

/**
 * Order statistics for tracking
 */
export interface OrderStats {
  /** Order ID */
  orderId: string;
  /** Resource type */
  resource: ResourceConstant;
  /** Order type */
  type: "buy" | "sell";
  /** Created tick */
  created: number;
  /** Last extended tick */
  lastExtended?: number;
  /** Total amount traded */
  totalTraded: number;
  /** Total profit/cost */
  totalValue: number;
}

/**
 * Market memory containing all market intelligence
 */
export interface MarketMemory {
  /** Market data per resource */
  resources: Record<string, ResourceMarketData>;
  /** Last full market scan tick */
  lastScan: number;
  /** Order tracking */
  orders?: Record<string, OrderStats>;
  /** Total profit from trading */
  totalProfit?: number;
  /** Last balance tick */
  lastBalance?: number;
}

/**
 * Global overmind memory
 */
export interface OvermindMemory {
  /** Rooms seen with last seen time */
  roomsSeen: Record<string, number>;
  /** Room intel database */
  roomIntel: Record<string, RoomIntel>;
  /** Claim queue sorted by expansion score */
  claimQueue: ExpansionCandidate[];
  /** Active war targets (player usernames or room names) */
  warTargets: string[];
  /** Nuke candidates with scores */
  nukeCandidates: { roomName: string; score: number; launched: boolean; launchTick: number }[];
  /** Power bank locations */
  powerBanks: PowerBankEntry[];
  /** Market intelligence data */
  market?: MarketMemory;
  /** Global strategic objectives */
  objectives: {
    targetPowerLevel: number;
    targetRoomCount: number;
    warMode: boolean;
    expansionPaused: boolean;
  };
  /** Last run tick */
  lastRun: number;
}

/**
 * Owned room entry with role
 */
export interface OwnedRoomEntry {
  /** Room name */
  name: string;
  /** Room role */
  role: "capital" | "core" | "remoteHub" | "forwardBase" | "mineral" | "buffer";
  /** Cluster ID this room belongs to */
  clusterId: string;
  /** RCL */
  rcl: number;
}

// ============================================================================
// 1.2 Cluster / Colony State
// ============================================================================

/**
 * Squad definition
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
 * Cluster memory
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
// 1.3 RoomMemory / Swarm State
// ============================================================================

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
 * Pheromone values for a room
 */
export interface PheromoneState {
  expand: number;
  harvest: number;
  build: number;
  upgrade: number;
  defense: number;
  war: number;
  siege: number;
  logistics: number;
  nukeTarget: number;
}

/**
 * Event log entry
 */
export interface EventLogEntry {
  type: string;
  time: number;
  details?: string;
}

/**
 * Room role
 */
export type RoomRole = "capital" | "secondaryCore" | "remoteMining" | "forwardBase" | "skOutpost";

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
  /** Whether nukes have been detected (to prevent spam) */
  nukeDetected?: boolean;
  /** Pheromone values */
  pheromones: PheromoneState;
  /** Next update tick (to avoid per-tick recompute) */
  nextUpdateTick: number;
  /** Event log (FIFO max 20) */
  eventLog: EventLogEntry[];
  /** Structural flags - what's missing */
  missingStructures: {
    spawn: boolean;
    storage: boolean;
    terminal: boolean;
    labs: boolean;
    nuker: boolean;
    factory: boolean;
    extractor: boolean;
    powerSpawn: boolean;
    observer: boolean;
  };
  /** Room role */
  role: RoomRole;
  /** Remote rooms this room manages */
  remoteAssignments: string[];
  /** Cluster ID */
  clusterId?: string;
  /** Collection point for idle creeps (away from spawn) */
  collectionPoint?: { x: number; y: number };
  /** Metrics */
  metrics: {
    energyHarvested: number;
    energySpawning: number;
    energyConstruction: number;
    energyRepair: number;
    energyTower: number;
    controllerProgress: number;
    hostileCount: number;
    damageReceived: number;
    constructionSites: number;
    /** Available energy for sharing (storage + containers - reserved) */
    energyAvailable: number;
    /** Energy capacity (storage + containers total) */
    energyCapacity: number;
    /** Energy need level (0-3): 0=no need, 1=low, 2=medium, 3=critical */
    energyNeed: 0 | 1 | 2 | 3;
  };
  /** Last full update tick */
  lastUpdate: number;
}

// ============================================================================
// 1.4 Creep / Squad State
// ============================================================================

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
  /** Current state (for state machine) */
  state?: CreepState;
  /** Transfer request assignment (for interRoomCarrier role) */
  transferRequest?: TransferRequestAssignment;
  /** Version for memory migration */
  version: number;
}

/**
 * Squad memory
 */
export interface SquadMemory {
  /** Squad ID */
  id: string;
  /** Squad type */
  type: "harass" | "raid" | "siege" | "defense";
  /** Member creep names */
  members: string[];
  /** Rally room */
  rallyRoom: string;
  /** Rally flag name (optional) */
  rallyFlag?: string;
  /** Target rooms */
  targetRooms: string[];
  /** Current state */
  state: "gathering" | "moving" | "attacking" | "retreating" | "dissolving";
  /** Time budget (ticks until timeout) */
  timeBudget: number;
  /** Created tick */
  createdAt: number;
  /** Retreat condition: min HP percentage */
  retreatThreshold: number;
}

// ============================================================================
// Default Factories
// ============================================================================

/**
 * Create default pheromone state
 */
export function createDefaultPheromones(): PheromoneState {
  return {
    expand: 0,
    harvest: 10,
    build: 5,
    upgrade: 5,
    defense: 0,
    war: 0,
    siege: 0,
    logistics: 5,
    nukeTarget: 0
  };
}

/**
 * Create default swarm state
 */
export function createDefaultSwarmState(): SwarmState {
  return {
    colonyLevel: "seedNest",
    posture: "eco",
    danger: 0,
    pheromones: createDefaultPheromones(),
    nextUpdateTick: 0,
    eventLog: [],
    missingStructures: {
      spawn: true,
      storage: true,
      terminal: true,
      labs: true,
      nuker: true,
      factory: true,
      extractor: true,
      powerSpawn: true,
      observer: true
    },
    role: "secondaryCore",
    remoteAssignments: [],
    metrics: {
      energyHarvested: 0,
      energySpawning: 0,
      energyConstruction: 0,
      energyRepair: 0,
      energyTower: 0,
      controllerProgress: 0,
      hostileCount: 0,
      damageReceived: 0,
      constructionSites: 0,
      energyAvailable: 0,
      energyCapacity: 0,
      energyNeed: 0
    },
    lastUpdate: 0
  };
}

/**
 * Create default market memory
 */
export function createDefaultMarketMemory(): MarketMemory {
  return {
    resources: {},
    lastScan: 0
  };
}

/**
 * Create default overmind memory
 */
export function createDefaultOvermindMemory(): OvermindMemory {
  return {
    roomsSeen: {},
    roomIntel: {},
    claimQueue: [],
    warTargets: [],
    nukeCandidates: [],
    powerBanks: [],
    market: createDefaultMarketMemory(),
    objectives: {
      targetPowerLevel: 0,
      targetRoomCount: 1,
      warMode: false,
      expansionPaused: false
    },
    lastRun: 0
  };
}

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
      economyIndex: 50
    },
    squads: [],
    rallyPoints: [],
    defenseRequests: [],
    resourceRequests: [],
    lastUpdate: 0
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
