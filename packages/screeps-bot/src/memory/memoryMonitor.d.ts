/**
 * Memory Monitor
 *
 * Monitors memory usage and provides alerts when approaching limits.
 * Tracks memory consumption by category to identify optimization targets.
 *
 * ROADMAP Section 4: Memory-Limit ca. 2 MB monitoring and alerting
 */
/**
 * Memory status levels
 */
export type MemoryStatus = "normal" | "warning" | "critical";
/**
 * Memory usage breakdown by category
 */
export interface MemoryBreakdown {
    /** Empire memory size in bytes */
    empire: number;
    /** All rooms memory size in bytes */
    rooms: number;
    /** All creeps memory size in bytes */
    creeps: number;
    /** Clusters memory size in bytes */
    clusters: number;
    /** SS2 packet queue size in bytes */
    ss2PacketQueue: number;
    /** Other/unknown memory size in bytes */
    other: number;
    /** Total memory size in bytes */
    total: number;
}
/**
 * Memory usage statistics
 */
export interface MemoryStats {
    /** Current memory usage in bytes */
    used: number;
    /** Memory limit in bytes */
    limit: number;
    /** Usage percentage (0-1) */
    percentage: number;
    /** Current status */
    status: MemoryStatus;
    /** Memory breakdown by category */
    breakdown: MemoryBreakdown;
}
/**
 * Memory Monitor class
 */
export declare class MemoryMonitor {
    private lastCheckTick;
    private lastStatus;
    /**
     * Check memory usage and return status
     */
    checkMemoryUsage(): MemoryStats;
    /**
     * Get detailed memory breakdown by category
     */
    getMemoryBreakdown(): MemoryBreakdown;
    /**
     * Get size of an object in bytes
     */
    private getObjectSize;
    /**
     * Format bytes to human-readable string
     */
    formatBytes(bytes: number): string;
    /**
     * Log memory breakdown to console
     */
    logBreakdown(): void;
    /**
     * Get largest memory consumers (top N rooms/clusters)
     */
    getLargestConsumers(topN?: number): {
        type: string;
        name: string;
        size: number;
    }[];
}
/**
 * Global memory monitor instance
 */
export declare const memoryMonitor: MemoryMonitor;
//# sourceMappingURL=memoryMonitor.d.ts.map