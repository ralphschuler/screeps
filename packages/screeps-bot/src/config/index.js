"use strict";
/**
 * Central configuration for all bot parameters.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfigToMemory = exports.loadConfigFromMemory = exports.resetConfig = exports.updateConfig = exports.getConfig = exports.DEFAULT_CONFIG = void 0;
/**
 * Default configuration
 */
exports.DEFAULT_CONFIG = {
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
            harvester: ["UO"],
            upgrader: ["GH", "GH2O", "XGH2O"],
            guard: ["UH", "LO"],
            healer: ["LO", "LHO2", "XLHO2"],
            soldier: ["UH", "KO", "XZHO2"]
        },
        boostPriority: [
            "XLHO2",
            "XUH2O",
            "XZHO2",
            "XGH2O"
        ],
        minBoostAmount: 30
    },
    debug: false,
    profiling: true,
    visualizations: true,
    lazyLoadConsoleCommands: true
};
/**
 * Runtime configuration instance
 */
let currentConfig = { ...exports.DEFAULT_CONFIG };
/**
 * Get current configuration
 */
function getConfig() {
    return currentConfig;
}
exports.getConfig = getConfig;
/**
 * Update configuration
 */
function updateConfig(partial) {
    currentConfig = { ...currentConfig, ...partial };
}
exports.updateConfig = updateConfig;
/**
 * Reset to default configuration
 */
function resetConfig() {
    currentConfig = { ...exports.DEFAULT_CONFIG };
}
exports.resetConfig = resetConfig;
/**
 * Load configuration from Memory
 */
function loadConfigFromMemory() {
    const mem = Memory;
    if (mem.botConfig) {
        currentConfig = { ...exports.DEFAULT_CONFIG, ...mem.botConfig };
    }
}
exports.loadConfigFromMemory = loadConfigFromMemory;
/**
 * Save configuration to Memory
 */
function saveConfigToMemory() {
    const mem = Memory;
    mem.botConfig = currentConfig;
}
exports.saveConfigToMemory = saveConfigToMemory;
