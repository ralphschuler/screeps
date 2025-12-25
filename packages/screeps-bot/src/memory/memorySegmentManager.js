"use strict";
/**
 * Memory Segment Manager
 *
 * Manages data persistence in RawMemory segments for rarely-accessed data.
 * Each segment can store up to 100KB, and there are 100 segments available (0-99).
 *
 * ROADMAP Section 4: Memory.segments für rarely-accessed data
 *
 * Segment Allocation Strategy:
 * - 0-9:   Active room data (hot data that needs frequent access)
 * - 10-19: Historical intel (accessed every 100-1000 ticks)
 * - 20-29: Market history and price trends (accessed every 500+ ticks)
 * - 30-39: Standards data (SS2 protocol packets, player coordination)
 * - 40-49: Archived empire state (old expansion candidates, war history)
 * - 50-89: Reserved for future use
 * - 90-99: Stats and monitoring data (used by memorySegmentStats)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorySegmentManager = exports.MemorySegmentManager = exports.SEGMENT_ALLOCATION = void 0;
const logger_1 = require("../core/logger");
/**
 * Segment allocation map
 */
exports.SEGMENT_ALLOCATION = {
    /** Active room data segments */
    ACTIVE_ROOMS: { start: 0, end: 9 },
    /** Historical intel segments */
    HISTORICAL_INTEL: { start: 10, end: 19 },
    /** Market history segments */
    MARKET_HISTORY: { start: 20, end: 29 },
    /** Standards data segments */
    STANDARDS_DATA: { start: 30, end: 39 },
    /** Archived empire state */
    ARCHIVED_EMPIRE: { start: 40, end: 49 },
    /** Reserved for future use */
    RESERVED: { start: 50, end: 89 },
    /** Stats and monitoring */
    STATS: { start: 90, end: 99 }
};
/**
 * Memory Segment Manager class
 */
class MemorySegmentManager {
    constructor() {
        this.activeSegments = new Set();
        this.segmentCache = new Map();
    }
    /**
     * Request a segment to be loaded (available next tick)
     */
    requestSegment(segmentId) {
        if (segmentId < 0 || segmentId > 99) {
            throw new Error(`Invalid segment ID: ${segmentId}. Must be 0-99.`);
        }
        this.activeSegments.add(segmentId);
        // Enforce 10-segment limit
        const activeArray = Array.from(this.activeSegments);
        if (activeArray.length > 10) {
            logger_1.logger.error("Cannot have more than 10 active segments", {
                subsystem: "MemorySegmentManager",
                meta: {
                    requested: segmentId,
                    currentCount: activeArray.length,
                    activeSegments: activeArray
                }
            });
            // Remove the newly added segment since we exceeded the limit
            this.activeSegments.delete(segmentId);
            throw new Error(`Segment limit exceeded: Cannot load segment ${segmentId}. Already have ${activeArray.length - 1} active segments (limit: 10). Release a segment first.`);
        }
        // Update active segments for next tick
        RawMemory.setActiveSegments(activeArray);
    }
    /**
     * Release a segment (stop loading it)
     */
    releaseSegment(segmentId) {
        this.activeSegments.delete(segmentId);
        this.segmentCache.delete(segmentId);
        // Update active segments
        RawMemory.setActiveSegments(Array.from(this.activeSegments));
    }
    /**
     * Check if a segment is currently loaded
     */
    isSegmentLoaded(segmentId) {
        return RawMemory.segments[segmentId] !== undefined;
    }
    /**
     * Write data to a segment
     */
    writeSegment(segmentId, key, data, version = 1) {
        if (!this.isSegmentLoaded(segmentId)) {
            logger_1.logger.warn("Attempted to write to unloaded segment", {
                subsystem: "MemorySegmentManager",
                meta: { segmentId, key }
            });
            return false;
        }
        try {
            // Parse existing segment data
            const segmentContent = RawMemory.segments[segmentId];
            const parsed = segmentContent ? JSON.parse(segmentContent) : {};
            // Create segment data wrapper
            const wrapper = {
                data,
                lastUpdate: Game.time,
                version
            };
            // Store under key
            parsed[key] = wrapper;
            // Serialize and write back
            const serialized = JSON.stringify(parsed);
            // Check size limit (100KB)
            if (serialized.length > 100 * 1024) {
                logger_1.logger.error("Segment data exceeds 100KB limit", {
                    subsystem: "MemorySegmentManager",
                    meta: { segmentId, key, size: serialized.length }
                });
                return false;
            }
            RawMemory.segments[segmentId] = serialized;
            // Update cache
            this.segmentCache.set(segmentId, parsed);
            return true;
        }
        catch (error) {
            logger_1.logger.error("Failed to write segment data", {
                subsystem: "MemorySegmentManager",
                meta: { segmentId, key, error: String(error) }
            });
            return false;
        }
    }
    /**
     * Read data from a segment
     */
    readSegment(segmentId, key) {
        if (!this.isSegmentLoaded(segmentId)) {
            logger_1.logger.warn("Attempted to read from unloaded segment", {
                subsystem: "MemorySegmentManager",
                meta: { segmentId, key }
            });
            return null;
        }
        try {
            // Check cache first
            let parsed = this.segmentCache.get(segmentId);
            if (!parsed) {
                const segmentContent = RawMemory.segments[segmentId];
                if (!segmentContent)
                    return null;
                parsed = JSON.parse(segmentContent);
                if (parsed == null)
                    return null;
                this.segmentCache.set(segmentId, parsed);
            }
            const wrapper = parsed[key];
            return wrapper ? wrapper.data : null;
        }
        catch (error) {
            logger_1.logger.error("Failed to read segment data", {
                subsystem: "MemorySegmentManager",
                meta: { segmentId, key, error: String(error) }
            });
            return null;
        }
    }
    /**
     * Get metadata for a segment key
     */
    getSegmentMetadata(segmentId, key) {
        if (!this.isSegmentLoaded(segmentId))
            return null;
        try {
            const segmentContent = RawMemory.segments[segmentId];
            if (!segmentContent)
                return null;
            const parsed = JSON.parse(segmentContent);
            const wrapper = parsed[key];
            return wrapper ? { lastUpdate: wrapper.lastUpdate, version: wrapper.version } : null;
        }
        catch (_a) {
            return null;
        }
    }
    /**
     * Delete a key from a segment
     */
    deleteSegmentKey(segmentId, key) {
        if (!this.isSegmentLoaded(segmentId))
            return false;
        try {
            const segmentContent = RawMemory.segments[segmentId];
            if (!segmentContent)
                return false;
            const parsed = JSON.parse(segmentContent);
            delete parsed[key];
            RawMemory.segments[segmentId] = JSON.stringify(parsed);
            this.segmentCache.set(segmentId, parsed);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Clear an entire segment
     */
    clearSegment(segmentId) {
        if (!this.isSegmentLoaded(segmentId)) {
            logger_1.logger.warn("Attempted to clear unloaded segment", {
                subsystem: "MemorySegmentManager",
                meta: { segmentId }
            });
            return;
        }
        RawMemory.segments[segmentId] = "";
        this.segmentCache.delete(segmentId);
    }
    /**
     * Get all keys in a segment
     */
    getSegmentKeys(segmentId) {
        if (!this.isSegmentLoaded(segmentId))
            return [];
        try {
            const segmentContent = RawMemory.segments[segmentId];
            if (!segmentContent)
                return [];
            const parsed = JSON.parse(segmentContent);
            return Object.keys(parsed);
        }
        catch (_a) {
            return [];
        }
    }
    /**
     * Get segment size in bytes
     */
    getSegmentSize(segmentId) {
        if (!this.isSegmentLoaded(segmentId))
            return 0;
        const segmentContent = RawMemory.segments[segmentId];
        return segmentContent ? segmentContent.length : 0;
    }
    /**
     * Get all currently active segments
     */
    getActiveSegments() {
        return Array.from(this.activeSegments);
    }
    /**
     * Suggest segment for data type
     */
    suggestSegmentForType(type) {
        const range = exports.SEGMENT_ALLOCATION[type];
        // Find first available segment in range
        for (let i = range.start; i <= range.end; i++) {
            if (!this.isSegmentLoaded(i) || this.getSegmentSize(i) < 90 * 1024) {
                return i;
            }
        }
        // All segments full or unavailable, return first in range
        return range.start;
    }
    /**
     * Migrate data from Memory to segment
     */
    migrateToSegment(memoryPath, segmentId, key) {
        // Get data from Memory
        const parts = memoryPath.split(".");
        let data = Memory;
        for (const part of parts) {
            if (data && typeof data === "object" && part in data) {
                data = data[part];
            }
            else {
                logger_1.logger.warn("Memory path not found for migration", {
                    subsystem: "MemorySegmentManager",
                    meta: { memoryPath, segmentId, key }
                });
                return false;
            }
        }
        // Write to segment
        if (!this.isSegmentLoaded(segmentId)) {
            this.requestSegment(segmentId);
            logger_1.logger.info("Segment not loaded, will migrate next tick", {
                subsystem: "MemorySegmentManager",
                meta: { memoryPath, segmentId, key }
            });
            return false;
        }
        const success = this.writeSegment(segmentId, key, data);
        if (success) {
            logger_1.logger.info("Successfully migrated data to segment", {
                subsystem: "MemorySegmentManager",
                meta: { memoryPath, segmentId, key, dataSize: JSON.stringify(data).length }
            });
        }
        return success;
    }
}
exports.MemorySegmentManager = MemorySegmentManager;
/**
 * Global memory segment manager instance
 */
exports.memorySegmentManager = new MemorySegmentManager();
