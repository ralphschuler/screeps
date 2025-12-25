"use strict";
/**
 * Memory Migrations
 *
 * Versioned schema migration system for safe memory structure updates.
 * Allows backward-compatible changes without manual memory wipes.
 *
 * ROADMAP Section 4: Memory migration system for schema changes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationRunner = exports.MigrationRunner = exports.migrations = void 0;
const logger_1 = require("../core/logger");
const memorySegmentManager_1 = require("./memorySegmentManager");
const memoryCompressor_1 = require("./memoryCompressor");
/**
 * Migration registry
 * Add new migrations here with incremental version numbers
 */
exports.migrations = [
    {
        version: 4,
        description: "Move historical intel to memory segments",
        migrate: (memory) => {
            var _a, _b;
            const mem = memory;
            const empire = mem.empire;
            if (!(empire === null || empire === void 0 ? void 0 : empire.knownRooms))
                return;
            // Separate active and historical intel
            const activeIntel = {};
            const historicalIntel = {};
            const cutoffTime = Game.time - 5000; // Keep last 5000 ticks in main memory
            for (const roomName in empire.knownRooms) {
                const intel = empire.knownRooms[roomName];
                // Keep recent intel, owned rooms, and special rooms in main memory
                if (intel.lastSeen >= cutoffTime ||
                    ((_b = (_a = Game.rooms[roomName]) === null || _a === void 0 ? void 0 : _a.controller) === null || _b === void 0 ? void 0 : _b.my) ||
                    intel.isHighway ||
                    intel.hasPortal) {
                    activeIntel[roomName] = intel;
                }
                else {
                    historicalIntel[roomName] = intel;
                }
            }
            // Move historical intel to segment
            if (Object.keys(historicalIntel).length > 0) {
                const segmentId = memorySegmentManager_1.memorySegmentManager.suggestSegmentForType("HISTORICAL_INTEL");
                // Request segment if not loaded - it will be available next tick
                if (!memorySegmentManager_1.memorySegmentManager.isSegmentLoaded(segmentId)) {
                    memorySegmentManager_1.memorySegmentManager.requestSegment(segmentId);
                    logger_1.logger.info("Segment not loaded, migration will continue next tick", {
                        subsystem: "MemoryMigrations",
                        meta: { segmentId }
                    });
                    // Don't modify memory yet - migration will retry next tick
                    return;
                }
                // Segment is loaded, write data
                const writeSuccess = memorySegmentManager_1.memorySegmentManager.writeSegment(segmentId, "historicalIntel", historicalIntel);
                if (!writeSuccess) {
                    logger_1.logger.error("Failed to write historical intel to segment", {
                        subsystem: "MemoryMigrations",
                        meta: { segmentId }
                    });
                    // Don't delete from main memory if write failed
                    return;
                }
                // Only update main memory after successful write
                empire.knownRooms = activeIntel;
                logger_1.logger.info("Migrated historical intel to segments", {
                    subsystem: "MemoryMigrations",
                    meta: {
                        historicalCount: Object.keys(historicalIntel).length,
                        activeCount: Object.keys(activeIntel).length,
                        segmentId
                    }
                });
            }
        }
    },
    {
        version: 5,
        description: "Compress portal map data",
        migrate: (memory) => {
            const mem = memory;
            const empire = mem.empire;
            if (!empire)
                return;
            // Check if portals exist and are not already compressed
            const empireRecord = empire;
            const portals = empireRecord.portals;
            if (portals && !memoryCompressor_1.memoryCompressor.isCompressed(portals)) {
                const compressed = memoryCompressor_1.memoryCompressor.compressPortalMap(portals);
                empireRecord.compressedPortals = compressed;
                delete empireRecord.portals;
                logger_1.logger.info("Compressed portal map data", {
                    subsystem: "MemoryMigrations",
                    meta: {
                        originalSize: compressed.originalSize,
                        compressedSize: compressed.compressedSize,
                        ratio: (compressed.compressedSize / compressed.originalSize * 100).toFixed(1) + "%"
                    }
                });
            }
        }
    },
    {
        version: 6,
        description: "Move market history to segments with compression",
        migrate: (memory) => {
            const mem = memory;
            const empire = mem.empire;
            if (!(empire === null || empire === void 0 ? void 0 : empire.market))
                return;
            // Check if priceHistory exists (it may not be in the type but could be in memory)
            const marketRecord = empire.market;
            const priceHistory = marketRecord.priceHistory;
            if (!priceHistory)
                return;
            // Compress market history
            const compressed = memoryCompressor_1.memoryCompressor.compressMarketHistory(priceHistory);
            // Move to segment
            const segmentId = memorySegmentManager_1.memorySegmentManager.suggestSegmentForType("MARKET_HISTORY");
            // Request segment if not loaded - it will be available next tick
            if (!memorySegmentManager_1.memorySegmentManager.isSegmentLoaded(segmentId)) {
                memorySegmentManager_1.memorySegmentManager.requestSegment(segmentId);
                logger_1.logger.info("Segment not loaded, migration will continue next tick", {
                    subsystem: "MemoryMigrations",
                    meta: { segmentId }
                });
                // Don't modify memory yet - migration will retry next tick
                return;
            }
            // Segment is loaded, write data
            const writeSuccess = memorySegmentManager_1.memorySegmentManager.writeSegment(segmentId, "priceHistory", compressed);
            if (!writeSuccess) {
                logger_1.logger.error("Failed to write market history to segment", {
                    subsystem: "MemoryMigrations",
                    meta: { segmentId }
                });
                // Don't delete from main memory if write failed
                return;
            }
            // Only remove from main memory after successful write
            delete marketRecord.priceHistory;
            logger_1.logger.info("Migrated market history to segments", {
                subsystem: "MemoryMigrations",
                meta: {
                    originalSize: compressed.originalSize,
                    compressedSize: compressed.compressedSize,
                    segmentId
                }
            });
        }
    },
    {
        version: 7,
        description: "Ensure all clusters have required array properties",
        migrate: (memory) => {
            const mem = memory;
            const clusters = mem.clusters;
            if (!clusters)
                return;
            let migratedCount = 0;
            // Iterate through all clusters and ensure they have required arrays
            for (const clusterId in clusters) {
                const cluster = clusters[clusterId];
                // Ensure squads array exists
                if (!cluster.squads) {
                    cluster.squads = [];
                    migratedCount++;
                }
                // Ensure defenseRequests array exists
                if (!cluster.defenseRequests) {
                    cluster.defenseRequests = [];
                    migratedCount++;
                }
                // Ensure resourceRequests array exists
                if (!cluster.resourceRequests) {
                    cluster.resourceRequests = [];
                    migratedCount++;
                }
                // Ensure rallyPoints array exists
                if (!cluster.rallyPoints) {
                    cluster.rallyPoints = [];
                    migratedCount++;
                }
            }
            if (migratedCount > 0) {
                logger_1.logger.info(`Migrated ${migratedCount} cluster array properties`, {
                    subsystem: "MemoryMigrations",
                    meta: { clustersProcessed: Object.keys(clusters).length }
                });
            }
        }
    }
];
/**
 * Migration runner
 */
class MigrationRunner {
    /**
     * Run all pending migrations
     */
    runMigrations() {
        var _a;
        const mem = Memory;
        const currentVersion = (_a = mem.memoryVersion) !== null && _a !== void 0 ? _a : 0;
        // Find pending migrations
        const pendingMigrations = exports.migrations.filter(m => m.version > currentVersion);
        if (pendingMigrations.length === 0) {
            return; // No migrations needed
        }
        logger_1.logger.info(`Running ${pendingMigrations.length} memory migration(s)`, {
            subsystem: "MigrationRunner",
            meta: {
                fromVersion: currentVersion,
                toVersion: pendingMigrations[pendingMigrations.length - 1].version
            }
        });
        // Run migrations in order
        for (const migration of pendingMigrations) {
            try {
                logger_1.logger.info(`Running migration v${migration.version}: ${migration.description}`, {
                    subsystem: "MigrationRunner"
                });
                migration.migrate(Memory);
                // Update version after successful migration
                mem.memoryVersion = migration.version;
                logger_1.logger.info(`Migration v${migration.version} complete`, {
                    subsystem: "MigrationRunner"
                });
            }
            catch (error) {
                logger_1.logger.error(`Migration v${migration.version} failed`, {
                    subsystem: "MigrationRunner",
                    meta: { error: String(error) }
                });
                // Stop running migrations on failure to prevent data corruption
                Game.notify(`Migration v${migration.version} failed: ${String(error)}`);
                break;
            }
        }
    }
    /**
     * Get current memory version
     */
    getCurrentVersion() {
        var _a;
        const mem = Memory;
        return (_a = mem.memoryVersion) !== null && _a !== void 0 ? _a : 0;
    }
    /**
     * Get latest migration version
     */
    getLatestVersion() {
        if (exports.migrations.length === 0)
            return 0;
        return Math.max(...exports.migrations.map(m => m.version));
    }
    /**
     * Check if migrations are pending
     */
    hasPendingMigrations() {
        return this.getCurrentVersion() < this.getLatestVersion();
    }
    /**
     * Get pending migrations
     */
    getPendingMigrations() {
        const currentVersion = this.getCurrentVersion();
        return exports.migrations.filter(m => m.version > currentVersion);
    }
    /**
     * Rollback to a specific version (dangerous!)
     */
    rollbackToVersion(version) {
        const mem = Memory;
        logger_1.logger.warn(`Rolling back memory version to ${version}`, {
            subsystem: "MigrationRunner",
            meta: { fromVersion: this.getCurrentVersion(), toVersion: version }
        });
        mem.memoryVersion = version;
        Game.notify(`Memory version rolled back to ${version}. Data may be inconsistent!`);
    }
}
exports.MigrationRunner = MigrationRunner;
/**
 * Global migration runner instance
 */
exports.migrationRunner = new MigrationRunner();
