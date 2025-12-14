/**
 * Configuration Module - Phase 17
 *
 * Central configuration for all bot parameters.
 * Single source of truth for tunable constants.
 * 
 * TODO(P1): ARCH - Implement configuration hot-reloading from Memory or segments
 * Allow runtime config changes without code deployment
 * TODO(P1): BUG - Add configuration validation on initialization
 * Catch invalid config values before they cause issues
 * TODO(P2): FEATURE - Implement configuration profiles (eco, war, balanced)
 * Pre-defined config sets for different playstyles
 * TODO(P2): FEATURE - Add per-room configuration overrides
 * Allow customizing behavior for specific rooms
 * TODO(P3): ARCH - Consider implementing configuration versioning
 * Track config changes over time for performance correlation
 * TODO(P3): FEATURE - Add configuration export/import for sharing between bots
 * Successful configs could be shared or backed up
 * TODO(P3): PERF - Implement adaptive configuration based on performance metrics
 * Automatically tune parameters based on observed outcomes
 */

/**
 * Pheromone configuration
 */
export interface PheromoneConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Decay factors per pheromone type (0.9-0.99) */
  decayFactors: {
    expand: number;
    harvest: number;
    build: number;
    upgrade: number;
    defense: number;
    war: number;
    siege: number;
    logistics: number;
    nukeTarget: number;
  };
  /** Diffusion rates (fraction leaked to neighbors) */
  diffusionRates: {
    expand: number;
    harvest: number;
    build: number;
    upgrade: number;
    defense: number;
    war: number;
    siege: number;
    logistics: number;
    nukeTarget: number;
  };
  /** Max pheromone value */
  maxValue: number;
  /** Min pheromone value */
  minValue: number;
}

/**
 * War and threat configuration
 */
export interface WarConfig {
  /** Danger level thresholds */
  dangerThresholds: {
    /** Hostile count for danger level 1 */
    level1HostileCount: number;
    /** Hostile count for danger level 2 */
    level2HostileCount: number;
    /** Damage threshold for level 2 */
    level2DamageThreshold: number;
    /** Damage threshold for level 3 */
    level3DamageThreshold: number;
  };
  /** Posture transition thresholds */
  postureThresholds: {
    /** Defense pheromone for defensive posture */
    defensivePosture: number;
    /** War pheromone for war posture */
    warPosture: number;
    /** Expand pheromone for expand posture */
    expandPosture: number;
  };
  /** Economy stability threshold (income/consumption ratio) */
  economyStabilityRatio: number;
  /** Ticks of sustained war before offensive squads */
  warSustainedTicks: number;
}

/**
 * Nuke configuration
 */
export interface NukeConfig {
  /** Minimum enemy RCL to consider nuking */
  minEnemyRCL: number;
  /** Minimum threat level to consider nuking */
  minThreatLevel: number;
  /** Minimum nuke score to launch */
  minNukeScore: number;
  /** Scoring weights */
  scoring: {
    enemyRCLWeight: number;
    hostileStructuresWeight: number;
    warPheromoneWeight: number;
    distancePenalty: number;
  };
  /** Evaluation interval (ticks) */
  evaluationInterval: number;
}

/**
 * Expansion configuration
 */
export interface ExpansionConfig {
  /** Minimum energy surplus to consider expansion */
  minEnergySurplus: number;
  /** Minimum CPU bucket to claim */
  minBucketForClaim: number;
  /** Maximum distance from core for remotes */
  maxRemoteDistance: number;
  /** Maximum distance for new claims */
  maxClaimDistance: number;
  /** Scoring weights */
  scoring: {
    sourcesWeight: number;
    mineralWeight: number;
    distancePenalty: number;
    hostilePenalty: number;
    terrainPenalty: number;
    highwayBonus: number;
  };
}

/**
 * CPU and scheduling configuration
 */
export interface CPUConfig {
  /** Bucket thresholds */
  bucketThresholds: {
    /** Below this, enter low-bucket mode */
    lowMode: number;
    /** Above this, enter high-bucket mode */
    highMode: number;
  };
  /** CPU budgets per subsystem (percentage of limit) */
  budgets: {
    rooms: number;
    creeps: number;
    strategic: number;
    market: number;
    visualization: number;
  };
  /** Task frequencies */
  taskFrequencies: {
    pheromoneUpdate: number;
    clusterLogic: number;
    strategicDecisions: number;
    marketScan: number;
    nukeEvaluation: number;
    memoryCleanup: number;
  };
}

/**
 * Market configuration
 */
export interface MarketConfig {
  /** Maximum credits to spend per tick */
  maxCreditsPerTick: number;
  /** Minimum credit reserve */
  minCreditReserve: number;
  /** Safety buffer for key resources */
  safetyBuffer: {
    energy: number;
    baseMinerals: number;
  };
  /** Price tolerance (percentage above/below market average) */
  priceTolerance: {
    buy: number;
    sell: number;
    emergency: number;
  };
  /** Scan interval (ticks) */
  scanInterval: number;
  /** Per-resource trade cooldown (ticks) */
  tradeCooldown: number;
}

/**
 * Spawn configuration
 */
export interface SpawnConfig {
  /** Body part costs */
  bodyCosts: Record<BodyPartConstant, number>;
  /** Minimum creep count per role */
  minCreepCounts: Record<string, number>;
  /** Role priorities (higher = more important) */
  rolePriorities: Record<string, number>;
}

/**
 * Boost configuration
 */
export interface BoostConfig {
  /** Per-role boost preferences */
  roleBoosts: Record<string, MineralBoostConstant[]>;
  /** Boost priority order */
  boostPriority: MineralBoostConstant[];
  /** Minimum compound amount to boost */
  minBoostAmount: number;
}

/**
 * Alliance configuration
 */
export interface AllianceConfig {
  /** List of allied player usernames */
  allies: string[];
  /** Segment ID for alliance communication (default: 90) */
  allySegmentID: number;
  /** Enable alliance system */
  enabled: boolean;
  /** Minimum resource amount to fulfill requests */
  minResourceToFulfill: number;
  /** Maximum distance to send military support */
  maxDefenseDistance: number;
}

/**
 * Complete bot configuration
 */
export interface BotConfig {
  pheromone: PheromoneConfig;
  war: WarConfig;
  nuke: NukeConfig;
  expansion: ExpansionConfig;
  cpu: CPUConfig;
  market: MarketConfig;
  spawn: SpawnConfig;
  boost: BoostConfig;
  alliance: AllianceConfig;
  /** Enable debug logging */
  debug: boolean;
  /** Enable profiling */
  profiling: boolean;
  /** Enable visualizations */
  visualizations: boolean;
  /** Enable lazy loading of console commands (reduces initialization CPU) */
  lazyLoadConsoleCommands: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: BotConfig = {
  pheromone: {
    updateInterval: 5,
    decayFactors: {
      expand: 0.95,
      harvest: 0.9,
      build: 0.92,
      upgrade: 0.93,
      defense: 0.97,
      war: 0.98,
      siege: 0.99,
      logistics: 0.91,
      nukeTarget: 0.99
    },
    diffusionRates: {
      expand: 0.3,
      harvest: 0.1,
      build: 0.15,
      upgrade: 0.1,
      defense: 0.4,
      war: 0.5,
      siege: 0.6,
      logistics: 0.2,
      nukeTarget: 0.1
    },
    maxValue: 100,
    minValue: 0
  },
  war: {
    dangerThresholds: {
      level1HostileCount: 1,
      level2HostileCount: 3,
      level2DamageThreshold: 100,
      level3DamageThreshold: 500
    },
    postureThresholds: {
      defensivePosture: 30,
      warPosture: 50,
      expandPosture: 40
    },
    economyStabilityRatio: 1.2,
    warSustainedTicks: 100
  },
  nuke: {
    minEnemyRCL: 5,
    minThreatLevel: 2,
    minNukeScore: 35,
    scoring: {
      enemyRCLWeight: 2,
      hostileStructuresWeight: 3,
      warPheromoneWeight: 1.5,
      distancePenalty: 0.5
    },
    evaluationInterval: 200
  },
  expansion: {
    minEnergySurplus: 1000,
    minBucketForClaim: 8000,
    maxRemoteDistance: 2,
    maxClaimDistance: 5,
    scoring: {
      sourcesWeight: 20,
      mineralWeight: 10,
      distancePenalty: 5,
      hostilePenalty: 30,
      terrainPenalty: 2,
      highwayBonus: 15
    }
  },
  cpu: {
    bucketThresholds: {
      lowMode: 2000,
      highMode: 9000
    },
    budgets: {
      rooms: 0.4,
      creeps: 0.3,
      strategic: 0.1,
      market: 0.1,
      visualization: 0.1
    },
    taskFrequencies: {
      pheromoneUpdate: 5,
      clusterLogic: 10,
      strategicDecisions: 20,
      marketScan: 100,
      nukeEvaluation: 200,
      memoryCleanup: 50
    }
  },
  market: {
    maxCreditsPerTick: 100000,
    minCreditReserve: 50000,
    safetyBuffer: {
      energy: 50000,
      baseMinerals: 5000
    },
    priceTolerance: {
      buy: 0.1,
      sell: 0.1,
      emergency: 0.5
    },
    scanInterval: 100,
    tradeCooldown: 10
  },
  spawn: {
    bodyCosts: {
      [MOVE]: 50,
      [WORK]: 100,
      [CARRY]: 50,
      [ATTACK]: 80,
      [RANGED_ATTACK]: 150,
      [HEAL]: 250,
      [CLAIM]: 600,
      [TOUGH]: 10
    },
    minCreepCounts: {
      harvester: 2,
      hauler: 2,
      upgrader: 1,
      builder: 1
    },
    rolePriorities: {
      harvester: 100,
      hauler: 90,
      queenCarrier: 85,
      builder: 70,
      upgrader: 60,
      guard: 80,
      healer: 75,
      scout: 40,
      claimer: 50
    }
  },
  boost: {
    roleBoosts: {
      harvester: ["UO" as MineralBoostConstant],
      upgrader: ["GH" as MineralBoostConstant, "GH2O" as MineralBoostConstant, "XGH2O" as MineralBoostConstant],
      guard: ["UH" as MineralBoostConstant, "LO" as MineralBoostConstant],
      healer: ["LO" as MineralBoostConstant, "LHO2" as MineralBoostConstant, "XLHO2" as MineralBoostConstant],
      soldier: ["UH" as MineralBoostConstant, "KO" as MineralBoostConstant, "XZHO2" as MineralBoostConstant]
    },
    boostPriority: [
      "XLHO2" as MineralBoostConstant,
      "XUH2O" as MineralBoostConstant,
      "XZHO2" as MineralBoostConstant,
      "XGH2O" as MineralBoostConstant
    ],
    minBoostAmount: 30
  },
  alliance: {
    allies: [],
    allySegmentID: 90,
    enabled: false,
    minResourceToFulfill: 1000,
    maxDefenseDistance: 10
  },
  debug: false,
  profiling: true,
  visualizations: true,
  lazyLoadConsoleCommands: true
};

/**
 * Runtime configuration instance
 */
let currentConfig: BotConfig = { ...DEFAULT_CONFIG };

/**
 * Get current configuration
 */
export function getConfig(): BotConfig {
  return currentConfig;
}

/**
 * Update configuration
 */
export function updateConfig(partial: Partial<BotConfig>): void {
  currentConfig = { ...currentConfig, ...partial };
}

/**
 * Reset to default configuration
 */
export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}

/**
 * Load configuration from Memory
 */
export function loadConfigFromMemory(): void {
  const mem = Memory as unknown as Record<string, unknown>;
  if (mem.botConfig) {
    currentConfig = { ...DEFAULT_CONFIG, ...(mem.botConfig as Partial<BotConfig>) };
  }
}

/**
 * Save configuration to Memory
 */
export function saveConfigToMemory(): void {
  const mem = Memory as unknown as Record<string, unknown>;
  mem.botConfig = currentConfig;
}
