/**
 * Room-level memory schemas
 * Tracks room state, pheromones, and swarm behavior
 */

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
 * Room role
 */
export type RoomRole = "capital" | "secondaryCore" | "remoteMining" | "forwardBase" | "skOutpost";

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
  /** Index signature for compatibility with visualization packages */
  [key: string]: number;
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
  /** Index signature for compatibility with visualization packages */
  [key: string]: unknown;
}

/**
 * Visualization layer flags (bitfield)
 */
export enum VisualizationLayer {
  None = 0,
  Pheromones = 1 << 0,
  Paths = 1 << 1,
  Traffic = 1 << 2,
  Defense = 1 << 3,
  Economy = 1 << 4,
  Construction = 1 << 5,
  Performance = 1 << 6
}

/**
 * Visualization preset modes
 */
export type VisualizationMode = "debug" | "presentation" | "minimal" | "performance";

/**
 * Visualization configuration stored in Memory
 */
export interface VisualizationConfig {
  /** Enabled layers (bitfield) */
  enabledLayers: number;
  /** Current visualization mode */
  mode: VisualizationMode;
  /** Per-layer CPU costs (rolling average) */
  layerCosts: {
    pheromones: number;
    paths: number;
    traffic: number;
    defense: number;
    economy: number;
    construction: number;
  };
  /** Total visualization CPU cost */
  totalCost: number;
  /** Static element cache */
  cache: {
    /** Cached terrain data per room */
    terrain: Record<string, { data: string; ttl: number }>;
    /** Cached structure positions per room */
    structures: Record<string, { data: Array<{ x: number; y: number; type: StructureConstant }>; ttl: number }>;
  };
  /** Last cache clear tick */
  lastCacheClear: number;
}

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
