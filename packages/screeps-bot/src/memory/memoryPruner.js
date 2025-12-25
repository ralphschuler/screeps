"use strict";
/**
 * Memory Pruner
 *
 * Automatically prunes stale and unnecessary data from memory.
 * Reduces memory footprint by removing old event logs, expired intel, and completed tasks.
 *
 * ROADMAP Section 4: Automatic memory pruning for old/stale data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryPruner = exports.MemoryPruner = void 0;
const logger_1 = require("../core/logger");
/** Maximum event log entries per room */
const MAX_EVENT_LOG_ENTRIES = 20;
/** Maximum age for intel data (ticks) */
const MAX_INTEL_AGE = 10000;
/** Maximum age for market history (ticks) */
const MAX_MARKET_HISTORY_AGE = 5000;
/**
 * Memory Pruner class
 */
class MemoryPruner {
    /**
     * Run all pruning operations
     */
    pruneAll() {
        const sizeBefore = RawMemory.get().length;
        const stats = {
            deadCreeps: 0,
            eventLogs: 0,
            staleIntel: 0,
            marketHistory: 0,
            bytesSaved: 0
        };
        // Run individual pruning operations
        stats.deadCreeps = this.pruneDeadCreeps();
        stats.eventLogs = this.pruneEventLogs(MAX_EVENT_LOG_ENTRIES);
        stats.staleIntel = this.pruneStaleIntel(MAX_INTEL_AGE);
        stats.marketHistory = this.pruneMarketHistory(MAX_MARKET_HISTORY_AGE);
        const sizeAfter = RawMemory.get().length;
        stats.bytesSaved = Math.max(0, sizeBefore - sizeAfter);
        if (stats.bytesSaved > 0) {
            logger_1.logger.info("Memory pruning complete", {
                subsystem: "MemoryPruner",
                meta: stats
            });
        }
        return stats;
    }
    /**
     * Prune dead creep memory
     */
    pruneDeadCreeps() {
        let pruned = 0;
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
                pruned++;
            }
        }
        return pruned;
    }
    /**
     * Prune event logs to keep only recent entries
     */
    pruneEventLogs(maxEntries) {
        let totalPruned = 0;
        if (!Memory.rooms)
            return 0;
        for (const roomName in Memory.rooms) {
            const roomMem = Memory.rooms[roomName];
            const swarm = roomMem === null || roomMem === void 0 ? void 0 : roomMem.swarm;
            if ((swarm === null || swarm === void 0 ? void 0 : swarm.eventLog) && swarm.eventLog.length > maxEntries) {
                const pruned = swarm.eventLog.length - maxEntries;
                swarm.eventLog.splice(0, pruned);
                totalPruned += pruned;
            }
        }
        return totalPruned;
    }
    /**
     * Prune stale intel data
     */
    pruneStaleIntel(maxAge) {
        var _a;
        const mem = Memory;
        const empire = mem.empire;
        if (!(empire === null || empire === void 0 ? void 0 : empire.knownRooms))
            return 0;
        let pruned = 0;
        const cutoffTime = Game.time - maxAge;
        for (const roomName in empire.knownRooms) {
            const intel = empire.knownRooms[roomName];
            // Don't prune intel for rooms we currently own or are actively scouting
            const room = Game.rooms[roomName];
            if ((_a = room === null || room === void 0 ? void 0 : room.controller) === null || _a === void 0 ? void 0 : _a.my)
                continue;
            // Remove intel that's too old and not for highway/portal rooms
            if (intel.lastSeen < cutoffTime && !intel.isHighway && !intel.hasPortal) {
                delete empire.knownRooms[roomName];
                pruned++;
            }
        }
        return pruned;
    }
    /**
     * Prune old market history
     */
    pruneMarketHistory(maxAge) {
        const mem = Memory;
        const empire = mem.empire;
        if (!(empire === null || empire === void 0 ? void 0 : empire.market))
            return 0;
        // Check if priceHistory exists (it may not be in the type but could be in memory)
        const marketRecord = empire.market;
        const priceHistory = marketRecord.priceHistory;
        if (!priceHistory)
            return 0;
        let pruned = 0;
        const cutoffTime = Game.time - maxAge;
        for (const resourceType in priceHistory) {
            const history = priceHistory[resourceType];
            if (!history)
                continue;
            const initialLength = history.length;
            // Keep only recent price data
            priceHistory[resourceType] = history.filter(entry => entry.time >= cutoffTime);
            pruned += initialLength - priceHistory[resourceType].length;
        }
        return pruned;
    }
    /**
     * Prune completed construction sites from memory
     */
    pruneCompletedConstruction() {
        var _a;
        let pruned = 0;
        if (!Memory.rooms)
            return 0;
        for (const roomName in Memory.rooms) {
            const room = Game.rooms[roomName];
            if (!room)
                continue;
            const roomMem = Memory.rooms[roomName];
            // Remove construction site IDs that no longer exist
            if ((_a = roomMem.construction) === null || _a === void 0 ? void 0 : _a.sites) {
                const beforeCount = roomMem.construction.sites.length;
                roomMem.construction.sites = roomMem.construction.sites.filter(siteId => {
                    return Game.getObjectById(siteId) !== null;
                });
                pruned += beforeCount - roomMem.construction.sites.length;
            }
        }
        return pruned;
    }
    /**
     * Prune old powerbank entries
     */
    prunePowerBanks() {
        const mem = Memory;
        const empire = mem.empire;
        if (!(empire === null || empire === void 0 ? void 0 : empire.powerBanks))
            return 0;
        const initialCount = empire.powerBanks.length;
        // Remove powerbanks that have already decayed
        empire.powerBanks = empire.powerBanks.filter(pb => pb.decayTick > Game.time);
        return initialCount - empire.powerBanks.length;
    }
    /**
     * Prune old nuke tracking data
     */
    pruneOldNukes() {
        const mem = Memory;
        const empire = mem.empire;
        if (!empire)
            return 0;
        let pruned = 0;
        // Remove landed nukes from tracking
        if (empire.nukesInFlight) {
            for (const nukeId in empire.nukesInFlight) {
                const nuke = empire.nukesInFlight[nukeId];
                if (nuke.impactTick < Game.time) {
                    delete empire.nukesInFlight[nukeId];
                    pruned++;
                }
            }
        }
        // Remove old incoming nuke alerts
        if (empire.incomingNukes) {
            const initialCount = empire.incomingNukes.length;
            empire.incomingNukes = empire.incomingNukes.filter(alert => alert.impactTick >= Game.time);
            pruned += initialCount - empire.incomingNukes.length;
        }
        return pruned;
    }
    /**
     * Get pruning recommendations
     */
    getRecommendations() {
        const recommendations = [];
        const mem = Memory;
        const empire = mem.empire;
        // Check event logs
        if (Memory.rooms) {
            for (const roomName in Memory.rooms) {
                const roomMem = Memory.rooms[roomName];
                const swarm = roomMem === null || roomMem === void 0 ? void 0 : roomMem.swarm;
                if (swarm === null || swarm === void 0 ? void 0 : swarm.eventLog) {
                    if (swarm.eventLog.length > MAX_EVENT_LOG_ENTRIES * 2) {
                        recommendations.push(`Room ${roomName} has ${swarm.eventLog.length} event log entries (recommended max: ${MAX_EVENT_LOG_ENTRIES})`);
                    }
                }
            }
        }
        // Check intel age
        if (empire === null || empire === void 0 ? void 0 : empire.knownRooms) {
            let staleCount = 0;
            const cutoffTime = Game.time - MAX_INTEL_AGE;
            for (const roomName in empire.knownRooms) {
                const intel = empire.knownRooms[roomName];
                if (intel.lastSeen < cutoffTime && !intel.isHighway && !intel.hasPortal) {
                    staleCount++;
                }
            }
            if (staleCount > 50) {
                recommendations.push(`${staleCount} stale intel entries (older than ${MAX_INTEL_AGE} ticks)`);
            }
        }
        // Check dead creeps
        let deadCreeps = 0;
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                deadCreeps++;
            }
        }
        if (deadCreeps > 10) {
            recommendations.push(`${deadCreeps} dead creeps in memory`);
        }
        return recommendations;
    }
}
exports.MemoryPruner = MemoryPruner;
/**
 * Global memory pruner instance
 */
exports.memoryPruner = new MemoryPruner();
