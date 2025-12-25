"use strict";
/**
 * TypeScript interfaces for all memory structures.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultCreepMemory = exports.VisualizationLayer = exports.createDefaultClusterMemory = exports.createDefaultOvermindMemory = exports.createDefaultEmpireMemory = exports.createDefaultMarketMemory = exports.createDefaultSwarmState = exports.createDefaultPheromones = void 0;
// ============================================================================
// Default Factories
// ============================================================================
/**
 * Create default pheromone state
 */
function createDefaultPheromones() {
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
exports.createDefaultPheromones = createDefaultPheromones;
/**
 * Create default swarm state
 */
function createDefaultSwarmState() {
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
exports.createDefaultSwarmState = createDefaultSwarmState;
/**
 * Create default market memory
 */
function createDefaultMarketMemory() {
    return {
        resources: {},
        lastScan: 0,
        pendingArbitrage: [],
        completedArbitrage: 0,
        arbitrageProfit: 0
    };
}
exports.createDefaultMarketMemory = createDefaultMarketMemory;
/**
 * Create default empire memory
 */
function createDefaultEmpireMemory() {
    return {
        knownRooms: {},
        clusters: [],
        warTargets: [],
        ownedRooms: {},
        claimQueue: [],
        nukeCandidates: [],
        powerBanks: [],
        market: createDefaultMarketMemory(),
        objectives: {
            targetPowerLevel: 0,
            targetRoomCount: 1,
            warMode: false,
            expansionPaused: false
        },
        lastUpdate: 0
    };
}
exports.createDefaultEmpireMemory = createDefaultEmpireMemory;
/**
 * Create default overmind memory
 * @deprecated Use createDefaultEmpireMemory instead. This is kept for backward compatibility.
 */
function createDefaultOvermindMemory() {
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
exports.createDefaultOvermindMemory = createDefaultOvermindMemory;
/**
 * Create default cluster memory
 */
function createDefaultClusterMemory(id, coreRoom) {
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
exports.createDefaultClusterMemory = createDefaultClusterMemory;
/**
 * Visualization layer flags (bitfield)
 */
var VisualizationLayer;
(function (VisualizationLayer) {
    VisualizationLayer[VisualizationLayer["None"] = 0] = "None";
    VisualizationLayer[VisualizationLayer["Pheromones"] = 1] = "Pheromones";
    VisualizationLayer[VisualizationLayer["Paths"] = 2] = "Paths";
    VisualizationLayer[VisualizationLayer["Traffic"] = 4] = "Traffic";
    VisualizationLayer[VisualizationLayer["Defense"] = 8] = "Defense";
    VisualizationLayer[VisualizationLayer["Economy"] = 16] = "Economy";
    VisualizationLayer[VisualizationLayer["Construction"] = 32] = "Construction";
    VisualizationLayer[VisualizationLayer["Performance"] = 64] = "Performance";
})(VisualizationLayer = exports.VisualizationLayer || (exports.VisualizationLayer = {}));
/**
 * Create default creep memory
 */
function createDefaultCreepMemory(role, family, homeRoom) {
    return {
        role,
        family,
        homeRoom,
        version: 1
    };
}
exports.createDefaultCreepMemory = createDefaultCreepMemory;
