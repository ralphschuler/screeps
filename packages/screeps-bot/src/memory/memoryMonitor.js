"use strict";
/**
 * Memory Monitor
 *
 * Monitors memory usage and provides alerts when approaching limits.
 * Tracks memory consumption by category to identify optimization targets.
 *
 * ROADMAP Section 4: Memory-Limit ca. 2 MB monitoring and alerting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryMonitor = exports.MemoryMonitor = void 0;
const logger_1 = require("../core/logger");
/** Memory limit in bytes (2MB) */
const MEMORY_LIMIT_BYTES = 2 * 1024 * 1024;
/** Warning threshold (80% of limit) */
const WARNING_THRESHOLD = 0.8;
/** Critical threshold (90% of limit) */
const CRITICAL_THRESHOLD = 0.9;
/**
 * Memory Monitor class
 */
class MemoryMonitor {
    constructor() {
        this.lastCheckTick = 0;
        this.lastStatus = "normal";
    }
    /**
     * Check memory usage and return status
     */
    checkMemoryUsage() {
        const used = RawMemory.get().length;
        const percentage = used / MEMORY_LIMIT_BYTES;
        let status = "normal";
        if (percentage >= CRITICAL_THRESHOLD) {
            status = "critical";
        }
        else if (percentage >= WARNING_THRESHOLD) {
            status = "warning";
        }
        // Log status changes
        if (status !== this.lastStatus) {
            if (status === "critical") {
                Game.notify(`CRITICAL: Memory at ${(percentage * 100).toFixed(1)}% (${this.formatBytes(used)}/${this.formatBytes(MEMORY_LIMIT_BYTES)})`);
                logger_1.logger.error("Memory usage critical", {
                    subsystem: "MemoryMonitor",
                    meta: { used, limit: MEMORY_LIMIT_BYTES, percentage }
                });
            }
            else if (status === "warning") {
                logger_1.logger.warn("Memory usage warning", {
                    subsystem: "MemoryMonitor",
                    meta: { used, limit: MEMORY_LIMIT_BYTES, percentage }
                });
            }
            else {
                logger_1.logger.info("Memory usage normal", {
                    subsystem: "MemoryMonitor",
                    meta: { used, limit: MEMORY_LIMIT_BYTES, percentage }
                });
            }
            this.lastStatus = status;
        }
        const breakdown = this.getMemoryBreakdown();
        return {
            used,
            limit: MEMORY_LIMIT_BYTES,
            percentage,
            status,
            breakdown
        };
    }
    /**
     * Get detailed memory breakdown by category
     */
    getMemoryBreakdown() {
        const mem = Memory;
        const empireSize = this.getObjectSize(mem.empire);
        const roomsSize = this.getObjectSize(Memory.rooms);
        const creepsSize = this.getObjectSize(Memory.creeps);
        const clustersSize = this.getObjectSize(mem.clusters);
        const ss2Size = this.getObjectSize(mem.ss2PacketQueue);
        const total = RawMemory.get().length;
        const accounted = empireSize + roomsSize + creepsSize + clustersSize + ss2Size;
        const other = Math.max(0, total - accounted);
        return {
            empire: empireSize,
            rooms: roomsSize,
            creeps: creepsSize,
            clusters: clustersSize,
            ss2PacketQueue: ss2Size,
            other,
            total
        };
    }
    /**
     * Get size of an object in bytes
     */
    getObjectSize(obj) {
        if (obj === undefined || obj === null)
            return 0;
        return JSON.stringify(obj).length;
    }
    /**
     * Format bytes to human-readable string
     */
    formatBytes(bytes) {
        if (bytes < 1024)
            return `${bytes}B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
    }
    /**
     * Log memory breakdown to console
     */
    logBreakdown() {
        const breakdown = this.getMemoryBreakdown();
        const stats = this.checkMemoryUsage();
        console.log(`Memory Usage: ${this.formatBytes(stats.used)} / ${this.formatBytes(stats.limit)} (${(stats.percentage * 100).toFixed(1)}%)`);
        console.log(`Status: ${stats.status.toUpperCase()}`);
        console.log("Breakdown:");
        console.log(`  Empire:        ${this.formatBytes(breakdown.empire)} (${((breakdown.empire / breakdown.total) * 100).toFixed(1)}%)`);
        console.log(`  Rooms:         ${this.formatBytes(breakdown.rooms)} (${((breakdown.rooms / breakdown.total) * 100).toFixed(1)}%)`);
        console.log(`  Creeps:        ${this.formatBytes(breakdown.creeps)} (${((breakdown.creeps / breakdown.total) * 100).toFixed(1)}%)`);
        console.log(`  Clusters:      ${this.formatBytes(breakdown.clusters)} (${((breakdown.clusters / breakdown.total) * 100).toFixed(1)}%)`);
        console.log(`  SS2 Queue:     ${this.formatBytes(breakdown.ss2PacketQueue)} (${((breakdown.ss2PacketQueue / breakdown.total) * 100).toFixed(1)}%)`);
        console.log(`  Other:         ${this.formatBytes(breakdown.other)} (${((breakdown.other / breakdown.total) * 100).toFixed(1)}%)`);
    }
    /**
     * Get largest memory consumers (top N rooms/clusters)
     */
    getLargestConsumers(topN = 10) {
        const consumers = [];
        // Check rooms
        if (Memory.rooms) {
            for (const roomName in Memory.rooms) {
                consumers.push({
                    type: "room",
                    name: roomName,
                    size: this.getObjectSize(Memory.rooms[roomName])
                });
            }
        }
        // Check clusters
        const mem = Memory;
        const clusters = mem.clusters;
        if (clusters) {
            for (const clusterId in clusters) {
                consumers.push({
                    type: "cluster",
                    name: clusterId,
                    size: this.getObjectSize(clusters[clusterId])
                });
            }
        }
        // Sort by size descending and return top N
        return consumers.sort((a, b) => b.size - a.size).slice(0, topN);
    }
}
exports.MemoryMonitor = MemoryMonitor;
/**
 * Global memory monitor instance
 */
exports.memoryMonitor = new MemoryMonitor();
