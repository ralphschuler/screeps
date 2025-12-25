/**
 * Memory Pruner
 *
 * Automatically prunes stale and unnecessary data from memory.
 * Reduces memory footprint by removing old event logs, expired intel, and completed tasks.
 *
 * ROADMAP Section 4: Automatic memory pruning for old/stale data
 */
/**
 * Pruning statistics
 */
export interface PruningStats {
    /** Dead creeps removed */
    deadCreeps: number;
    /** Event log entries removed */
    eventLogs: number;
    /** Stale intel entries removed */
    staleIntel: number;
    /** Market history entries removed */
    marketHistory: number;
    /** Total bytes freed */
    bytesSaved: number;
}
/**
 * Memory Pruner class
 */
export declare class MemoryPruner {
    /**
     * Run all pruning operations
     */
    pruneAll(): PruningStats;
    /**
     * Prune dead creep memory
     */
    pruneDeadCreeps(): number;
    /**
     * Prune event logs to keep only recent entries
     */
    pruneEventLogs(maxEntries: number): number;
    /**
     * Prune stale intel data
     */
    pruneStaleIntel(maxAge: number): number;
    /**
     * Prune old market history
     */
    pruneMarketHistory(maxAge: number): number;
    /**
     * Prune completed construction sites from memory
     */
    pruneCompletedConstruction(): number;
    /**
     * Prune old powerbank entries
     */
    prunePowerBanks(): number;
    /**
     * Prune old nuke tracking data
     */
    pruneOldNukes(): number;
    /**
     * Get pruning recommendations
     */
    getRecommendations(): string[];
}
/**
 * Global memory pruner instance
 */
export declare const memoryPruner: MemoryPruner;
//# sourceMappingURL=memoryPruner.d.ts.map