/**
 * Memory Migrations
 *
 * Versioned schema migration system for safe memory structure updates.
 * Allows backward-compatible changes without manual memory wipes.
 *
 * ROADMAP Section 4: Memory migration system for schema changes
 */
/**
 * Migration definition
 */
export interface Migration {
    /** Migration version number (incremental) */
    version: number;
    /** Human-readable description */
    description: string;
    /** Migration function */
    migrate: (memory: Memory) => void;
}
/**
 * Migration registry
 * Add new migrations here with incremental version numbers
 */
export declare const migrations: Migration[];
/**
 * Migration runner
 */
export declare class MigrationRunner {
    /**
     * Run all pending migrations
     */
    runMigrations(): void;
    /**
     * Get current memory version
     */
    getCurrentVersion(): number;
    /**
     * Get latest migration version
     */
    getLatestVersion(): number;
    /**
     * Check if migrations are pending
     */
    hasPendingMigrations(): boolean;
    /**
     * Get pending migrations
     */
    getPendingMigrations(): Migration[];
    /**
     * Rollback to a specific version (dangerous!)
     */
    rollbackToVersion(version: number): void;
}
/**
 * Global migration runner instance
 */
export declare const migrationRunner: MigrationRunner;
//# sourceMappingURL=migrations.d.ts.map