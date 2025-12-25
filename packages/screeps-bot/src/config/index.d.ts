/**
 * Central configuration for all bot parameters.
 */
/// <reference types="screeps" />
/** Pheromone configuration */
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
export declare const DEFAULT_CONFIG: BotConfig;
/**
 * Get current configuration
 */
export declare function getConfig(): BotConfig;
/**
 * Update configuration
 */
export declare function updateConfig(partial: Partial<BotConfig>): void;
/**
 * Reset to default configuration
 */
export declare function resetConfig(): void;
/**
 * Load configuration from Memory
 */
export declare function loadConfigFromMemory(): void;
/**
 * Save configuration to Memory
 */
export declare function saveConfigToMemory(): void;
//# sourceMappingURL=index.d.ts.map