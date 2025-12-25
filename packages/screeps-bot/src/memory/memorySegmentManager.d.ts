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
/**
 * Segment allocation map
 */
export declare const SEGMENT_ALLOCATION: {
    /** Active room data segments */
    readonly ACTIVE_ROOMS: {
        readonly start: 0;
        readonly end: 9;
    };
    /** Historical intel segments */
    readonly HISTORICAL_INTEL: {
        readonly start: 10;
        readonly end: 19;
    };
    /** Market history segments */
    readonly MARKET_HISTORY: {
        readonly start: 20;
        readonly end: 29;
    };
    /** Standards data segments */
    readonly STANDARDS_DATA: {
        readonly start: 30;
        readonly end: 39;
    };
    /** Archived empire state */
    readonly ARCHIVED_EMPIRE: {
        readonly start: 40;
        readonly end: 49;
    };
    /** Reserved for future use */
    readonly RESERVED: {
        readonly start: 50;
        readonly end: 89;
    };
    /** Stats and monitoring */
    readonly STATS: {
        readonly start: 90;
        readonly end: 99;
    };
};
/**
 * Memory Segment Manager class
 */
export declare class MemorySegmentManager {
    private activeSegments;
    private segmentCache;
    /**
     * Request a segment to be loaded (available next tick)
     */
    requestSegment(segmentId: number): void;
    /**
     * Release a segment (stop loading it)
     */
    releaseSegment(segmentId: number): void;
    /**
     * Check if a segment is currently loaded
     */
    isSegmentLoaded(segmentId: number): boolean;
    /**
     * Write data to a segment
     */
    writeSegment<T>(segmentId: number, key: string, data: T, version?: number): boolean;
    /**
     * Read data from a segment
     */
    readSegment<T>(segmentId: number, key: string): T | null;
    /**
     * Get metadata for a segment key
     */
    getSegmentMetadata(segmentId: number, key: string): {
        lastUpdate: number;
        version: number;
    } | null;
    /**
     * Delete a key from a segment
     */
    deleteSegmentKey(segmentId: number, key: string): boolean;
    /**
     * Clear an entire segment
     */
    clearSegment(segmentId: number): void;
    /**
     * Get all keys in a segment
     */
    getSegmentKeys(segmentId: number): string[];
    /**
     * Get segment size in bytes
     */
    getSegmentSize(segmentId: number): number;
    /**
     * Get all currently active segments
     */
    getActiveSegments(): number[];
    /**
     * Suggest segment for data type
     */
    suggestSegmentForType(type: keyof typeof SEGMENT_ALLOCATION): number;
    /**
     * Migrate data from Memory to segment
     */
    migrateToSegment<T>(memoryPath: string, segmentId: number, key: string): boolean;
}
/**
 * Global memory segment manager instance
 */
export declare const memorySegmentManager: MemorySegmentManager;
//# sourceMappingURL=memorySegmentManager.d.ts.map