/**
 * Heap Cache Manager
 *
 * Implements a write-ahead cache system where:
 * - Heap (global object) serves as a fast cache layer
 * - Memory serves as persistence layer for surviving resets
 * - On init after a reset, we rehydrate the heap with Memory data
 * - Write operations go to heap first (fast), then persist to Memory periodically
 *
 * This is similar to a DB cache system:
 * 1. Check heap cache first (fast O(1) lookup)
 * 2. If not in heap, check Memory (slower, requires serialization)
 * 3. Write to heap immediately, persist to Memory on schedule
 *
 * Design Principles (from ROADMAP.md Section 2):
 * - Aggressive Caching + TTL
 * - Event-driven logic with periodic sync
 * - CPU-efficient: minimize Memory serialization overhead
 *
 * Performance Benefits:
 * - Fast reads: heap access is ~10x faster than Memory access
 * - Reduced serialization: only persist changed data periodically
 * - Survives resets: data restored from Memory after global reset
 */
declare global {
    interface Memory {
        _heapCache?: {
            version: number;
            lastSync: number;
            data: Record<string, {
                value: any;
                lastModified: number;
                ttl?: number;
            }>;
        };
    }
}
/** Infinite TTL constant */
export declare const INFINITE_TTL = -1;
/**
 * Heap Cache Manager class
 */
export declare class HeapCacheManager {
    private lastPersistenceTick;
    /**
     * Initialize the heap cache system.
     * Should be called once on startup.
     */
    initialize(): void;
    /**
     * Rehydrate heap cache from Memory after a reset.
     * This restores all cached data from the persistence layer.
     */
    private rehydrateFromMemory;
    /**
     * Get a value from the cache.
     * Checks heap first, falls back to Memory if not found.
     *
     * @param key - Cache key
     * @returns Cached value or undefined
     */
    get<T = any>(key: string): T | undefined;
    /**
     * Set a value in the cache.
     * Writes to heap immediately, marks for persistence.
     *
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Optional time-to-live in ticks (-1 for infinite)
     */
    set(key: string, value: any, ttl?: number): void;
    /**
     * Delete a value from the cache.
     * Removes from both heap and Memory.
     *
     * @param key - Cache key
     */
    delete(key: string): void;
    /**
     * Check if a key exists in the cache.
     *
     * @param key - Cache key
     * @returns True if key exists and is not expired
     */
    has(key: string): boolean;
    /**
     * Clear all cached data from both heap and Memory.
     */
    clear(): void;
    /**
     * Persist dirty cache entries to Memory.
     * Should be called periodically to sync changes.
     *
     * @param force - Force persistence even if interval hasn't elapsed
     * @returns Number of entries persisted
     */
    persist(force?: boolean): number;
    /**
     * Get cache statistics.
     *
     * @returns Cache stats
     */
    getStats(): {
        heapSize: number;
        memorySize: number;
        dirtyEntries: number;
        lastSync: number;
    };
    /**
     * Get all keys in the cache.
     *
     * @returns Array of cache keys
     */
    keys(): string[];
    /**
     * Get all values in the cache.
     *
     * @returns Array of cache values
     */
    values<T = any>(): T[];
    /**
     * Clean up expired entries from the cache.
     *
     * @returns Number of entries cleaned
     */
    cleanExpired(): number;
}
/**
 * Global heap cache manager instance
 */
export declare const heapCache: HeapCacheManager;
//# sourceMappingURL=heapCache.d.ts.map