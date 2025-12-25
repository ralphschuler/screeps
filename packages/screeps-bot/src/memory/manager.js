"use strict";
/**
 * Memory Manager
 *
 * Handles initialization, validation, and access to all memory structures.
 * Integrates memory compression, segmentation, monitoring, and automatic pruning.
 *
 * Memory Management Strategy (ROADMAP Section 4):
 * - Layer 1: Memory monitoring with alerts (memoryMonitor.ts)
 * - Layer 2: Automatic data pruning (memoryPruner.ts)
 * - Layer 3: Memory segmentation for rarely-accessed data (memorySegmentManager.ts)
 * - Layer 4: Data compression using LZ-String (memoryCompressor.ts)
 * - Layer 5: Schema migration system (migrations.ts)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryManager = exports.MemoryManager = void 0;
const schemas_1 = require("./schemas");
const heapCache_1 = require("./heapCache");
const memoryMonitor_1 = require("./memoryMonitor");
const memoryPruner_1 = require("./memoryPruner");
const migrations_1 = require("./migrations");
const EMPIRE_KEY = "empire";
const CLUSTERS_KEY = "clusters";
/** Screeps memory limit in bytes */
const MEMORY_LIMIT_BYTES = 2097152; // 2MB
/**
 * Interval for dead creep memory cleanup.
 * Running every tick is wasteful since creeps don't die that often.
 */
const DEAD_CREEP_CLEANUP_INTERVAL = 10;
/**
 * Interval for automatic memory pruning.
 * Runs comprehensive cleanup every N ticks.
 */
const MEMORY_PRUNING_INTERVAL = 100;
/**
 * Interval for memory monitoring.
 * Checks memory usage and alerts when approaching limits.
 */
const MEMORY_MONITORING_INTERVAL = 50;
/**
 * Memory Manager class
 */
class MemoryManager {
    constructor() {
        this.lastInitializeTick = null;
        this.lastCleanupTick = 0;
        this.lastPruningTick = 0;
        this.lastMonitoringTick = 0;
    }
    /**
     * Initialize all memory structures
     */
    initialize() {
        if (this.lastInitializeTick === Game.time)
            return;
        this.lastInitializeTick = Game.time;
        // Initialize heap cache first (rehydrates from Memory if needed)
        heapCache_1.heapCache.initialize();
        // Run memory migrations (must run before ensuring memory structures)
        migrations_1.migrationRunner.runMigrations();
        this.ensureEmpireMemory();
        this.ensureClustersMemory();
        // Only clean dead creeps periodically to save CPU
        if (Game.time - this.lastCleanupTick >= DEAD_CREEP_CLEANUP_INTERVAL) {
            this.cleanDeadCreeps();
            this.lastCleanupTick = Game.time;
        }
        // Run comprehensive memory pruning periodically
        if (Game.time - this.lastPruningTick >= MEMORY_PRUNING_INTERVAL) {
            memoryPruner_1.memoryPruner.pruneAll();
            this.lastPruningTick = Game.time;
        }
        // Monitor memory usage periodically
        if (Game.time - this.lastMonitoringTick >= MEMORY_MONITORING_INTERVAL) {
            memoryMonitor_1.memoryMonitor.checkMemoryUsage();
            this.lastMonitoringTick = Game.time;
        }
    }
    /**
     * Ensure empire memory exists
     */
    ensureEmpireMemory() {
        const mem = Memory;
        if (!mem[EMPIRE_KEY]) {
            mem[EMPIRE_KEY] = (0, schemas_1.createDefaultEmpireMemory)();
        }
    }
    /**
     * Ensure clusters memory exists
     */
    ensureClustersMemory() {
        const mem = Memory;
        if (!mem[CLUSTERS_KEY]) {
            mem[CLUSTERS_KEY] = {};
        }
    }
    /**
     * Get empire memory (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    getEmpire() {
        const cacheKey = `memory:${EMPIRE_KEY}`;
        let empire = heapCache_1.heapCache.get(cacheKey);
        if (!empire) {
            this.ensureEmpireMemory();
            const mem = Memory;
            // Cache a reference to the Memory object for fast access
            // Changes to this object will need to be re-cached to persist
            heapCache_1.heapCache.set(cacheKey, mem[EMPIRE_KEY], heapCache_1.INFINITE_TTL);
            empire = mem[EMPIRE_KEY];
        }
        return empire;
    }
    /**
     * Get all clusters (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    getClusters() {
        const cacheKey = `memory:${CLUSTERS_KEY}`;
        let clusters = heapCache_1.heapCache.get(cacheKey);
        if (!clusters) {
            this.ensureClustersMemory();
            const mem = Memory;
            // Cache a reference to the Memory object for fast access
            heapCache_1.heapCache.set(cacheKey, mem[CLUSTERS_KEY], heapCache_1.INFINITE_TTL);
            clusters = mem[CLUSTERS_KEY];
        }
        return clusters;
    }
    /**
     * Get or create cluster
     */
    getCluster(clusterId, coreRoom) {
        const clusters = this.getClusters();
        if (!clusters[clusterId] && coreRoom) {
            clusters[clusterId] = (0, schemas_1.createDefaultClusterMemory)(clusterId, coreRoom);
        }
        return clusters[clusterId];
    }
    /**
     * Get swarm state for a room (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    getSwarmState(roomName) {
        var _a;
        const cacheKey = `memory:room:${roomName}:swarm`;
        let swarmState = heapCache_1.heapCache.get(cacheKey);
        if (!swarmState) {
            const roomMemory = (_a = Memory.rooms) === null || _a === void 0 ? void 0 : _a[roomName];
            if (!roomMemory)
                return undefined;
            const roomSwarm = roomMemory.swarm;
            if (roomSwarm) {
                // Cache a reference to the Memory object for fast access
                heapCache_1.heapCache.set(cacheKey, roomSwarm, heapCache_1.INFINITE_TTL);
                swarmState = roomSwarm;
            }
        }
        return swarmState;
    }
    /**
     * Initialize swarm state for a room (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    initSwarmState(roomName) {
        const cacheKey = `memory:room:${roomName}:swarm`;
        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        if (!Memory.rooms[roomName]) {
            Memory.rooms[roomName] = {};
        }
        const roomMem = Memory.rooms[roomName];
        if (!roomMem.swarm) {
            roomMem.swarm = (0, schemas_1.createDefaultSwarmState)();
        }
        // Cache a reference to the Memory object for fast access
        heapCache_1.heapCache.set(cacheKey, roomMem.swarm, heapCache_1.INFINITE_TTL);
        return roomMem.swarm;
    }
    /**
     * Get or init swarm state
     */
    getOrInitSwarmState(roomName) {
        var _a;
        return (_a = this.getSwarmState(roomName)) !== null && _a !== void 0 ? _a : this.initSwarmState(roomName);
    }
    /**
     * Get creep memory with type safety
     */
    getCreepMemory(creepName) {
        const creep = Game.creeps[creepName];
        if (!creep)
            return undefined;
        return creep.memory;
    }
    /**
     * Clean up dead creep memory
     * OPTIMIZATION: Use for-in loop instead of Object.keys() to avoid creating temporary array.
     * With 100+ creeps, this saves ~0.1 CPU per cleanup cycle.
     * TODO(P3): PERF - Add batch cleanup with configurable limit to spread cost across ticks
     * For 1000+ creeps, cleaning all at once might be expensive
     * TODO(P3): FEATURE - Consider tracking high-value creep data before cleanup for post-mortem analysis
     * Log or cache stats for expensive boosted creeps to analyze their effectiveness
     */
    cleanDeadCreeps() {
        let cleaned = 0;
        // Use for-in loop instead of Object.keys() - more memory efficient
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
                cleaned++;
            }
        }
        return cleaned;
    }
    /**
     * Record room as seen
     * Updates the lastSeen timestamp for a room in empire memory
     * Note: Modifies the cached object in-place. Changes persist via Memory reference.
     */
    recordRoomSeen(roomName) {
        const empire = this.getEmpire();
        if (!empire.knownRooms[roomName]) {
            empire.knownRooms[roomName] = {
                name: roomName,
                lastSeen: Game.time,
                sources: 0,
                controllerLevel: 0,
                threatLevel: 0,
                scouted: false,
                terrain: "mixed",
                isHighway: false,
                isSK: false
            };
        }
        else {
            empire.knownRooms[roomName].lastSeen = Game.time;
        }
        // No need to re-cache: empire is a reference to Memory object
    }
    /**
     * Add event to room log
     */
    addRoomEvent(roomName, type, details) {
        const swarm = this.getSwarmState(roomName);
        if (!swarm)
            return;
        const entry = {
            type,
            time: Game.time
        };
        if (details !== undefined) {
            entry.details = details;
        }
        swarm.eventLog.push(entry);
        // Keep only last 20 events
        while (swarm.eventLog.length > 20) {
            swarm.eventLog.shift();
        }
    }
    /**
     * Get memory size estimate
     */
    getMemorySize() {
        return JSON.stringify(Memory).length;
    }
    /**
     * Check if memory is near limit
     */
    isMemoryNearLimit() {
        const size = this.getMemorySize();
        return size > MEMORY_LIMIT_BYTES * 0.9;
    }
    /**
     * Persist heap cache to Memory.
     * Should be called periodically to save cache state.
     */
    persistHeapCache() {
        heapCache_1.heapCache.persist();
    }
    /**
     * Get heap cache manager instance.
     * Provides access to the cache for external use.
     */
    getHeapCache() {
        return heapCache_1.heapCache;
    }
    /**
     * Check if a room is marked as hostile (cached for 100 ticks)
     */
    isRoomHostile(roomName) {
        var _a, _b, _c;
        const cacheKey = `memory:room:${roomName}:hostile`;
        const cached = heapCache_1.heapCache.get(cacheKey);
        // Check if value is cached (null means "not hostile" was cached)
        if (cached !== undefined) {
            return cached === true;
        }
        // Not cached, fetch from Memory
        const hostile = (_c = (_b = (_a = Memory.rooms) === null || _a === void 0 ? void 0 : _a[roomName]) === null || _b === void 0 ? void 0 : _b.hostile) !== null && _c !== void 0 ? _c : false;
        heapCache_1.heapCache.set(cacheKey, hostile ? true : null, 100); // Cache for 100 ticks
        return hostile;
    }
    /**
     * Mark a room as hostile (cached for 100 ticks)
     */
    setRoomHostile(roomName, hostile) {
        if (!Memory.rooms)
            Memory.rooms = {};
        if (!Memory.rooms[roomName])
            Memory.rooms[roomName] = {};
        Memory.rooms[roomName].hostile = hostile;
        const cacheKey = `memory:room:${roomName}:hostile`;
        heapCache_1.heapCache.set(cacheKey, hostile ? true : null, 100); // Cache for 100 ticks
    }
}
exports.MemoryManager = MemoryManager;
/**
 * Global memory manager instance
 */
exports.memoryManager = new MemoryManager();
