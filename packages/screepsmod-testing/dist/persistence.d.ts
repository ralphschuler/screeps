/**
 * Test result persistence for surviving server restarts
 */
import { TestSummary, TestPersistence } from './types';
/**
 * Persistence manager for test results
 */
export declare class PersistenceManager {
    private filePath;
    private maxHistorySize;
    constructor(filePath?: string, maxHistorySize?: number);
    /**
     * Load persisted test data
     */
    load(): TestPersistence | null;
    /**
     * Save test results
     */
    save(summary: TestSummary): void;
    /**
     * Get test history
     */
    getHistory(): TestSummary[];
    /**
     * Clear persisted data
     */
    clear(): void;
    /**
     * Get statistics from history
     */
    getStatistics(): {
        totalRuns: number;
        averagePassRate: number;
        averageDuration: number;
        mostRecentStatus: 'passed' | 'failed' | 'partial';
    } | null;
}
//# sourceMappingURL=persistence.d.ts.map