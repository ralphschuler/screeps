"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.heapCache = exports.HeapCacheManager = exports.INFINITE_TTL = void 0;
const logger_1 = require("../core/logger");
// =============================================================================
// Constants
// =============================================================================
/** Memory key for cache storage */
const CACHE_MEMORY_KEY = "_heapCache";
/** How often to persist dirty cache entries to Memory (ticks) */
const PERSISTENCE_INTERVAL = 10;
/** Default TTL for cache entries (ticks) */
const DEFAULT_TTL = 1000;
/** Infinite TTL constant */
exports.INFINITE_TTL = -1;
/** Current cache memory version */
const CACHE_VERSION = 1;
// =============================================================================
// Heap Cache Storage
// =============================================================================
/**
 * Get or initialize the heap cache store.
 * Cache persists across ticks within the same session.
 */
function getHeapStore() {
    const g = global;
    if (!g._heapCache || g._heapCache.tick !== Game.time) {
        // Update tick but preserve entries across ticks
        if (g._heapCache) {
            g._heapCache.tick = Game.time;
        }
        else {
            g._heapCache = {
                tick: Game.time,
                entries: new Map(),
                rehydrated: false
            };
        }
    }
    return g._heapCache;
}
/**
 * Get cache memory storage
 */
function getCacheMemory() {
    if (!Memory._heapCache) {
        Memory._heapCache = {
            version: CACHE_VERSION,
            lastSync: Game.time,
            data: {}
        };
    }
    return Memory._heapCache;
}
// =============================================================================
// Public API
// =============================================================================
/**
 * Heap Cache Manager class
 */
class HeapCacheManager {
    constructor() {
        this.lastPersistenceTick = 0;
    }
    /**
     * Initialize the heap cache system.
     * Should be called once on startup.
     */
    initialize() {
        const heap = getHeapStore();
        // Rehydrate from Memory if this is a new session (after global reset)
        if (!heap.rehydrated) {
            this.rehydrateFromMemory();
            heap.rehydrated = true;
        }
    }
    /**
     * Rehydrate heap cache from Memory after a reset.
     * This restores all cached data from the persistence layer.
     */
    rehydrateFromMemory() {
        const heap = getHeapStore();
        const memory = getCacheMemory();
        let rehydratedCount = 0;
        let expiredCount = 0;
        // Restore all entries from Memory to heap
        for (const [key, memEntry] of Object.entries(memory.data)) {
            // Check if entry has expired based on TTL (-1 means infinite)
            if (memEntry.ttl !== undefined && memEntry.ttl !== exports.INFINITE_TTL) {
                const age = Game.time - memEntry.lastModified;
                if (age > memEntry.ttl) {
                    expiredCount++;
                    continue; // Skip expired entries
                }
            }
            heap.entries.set(key, {
                value: memEntry.value,
                lastModified: memEntry.lastModified,
                dirty: false,
                ttl: memEntry.ttl
            });
            rehydratedCount++;
        }
        if (rehydratedCount > 0 && Game.time % 100 === 0) {
            // Only log periodically to reduce console spam
            logger_1.logger.info(`Rehydrated ${rehydratedCount} entries from Memory`, {
                subsystem: "HeapCache",
                meta: { rehydratedCount, expiredCount }
            });
        }
    }
    /**
     * Get a value from the cache.
     * Checks heap first, falls back to Memory if not found.
     *
     * @param key - Cache key
     * @returns Cached value or undefined
     */
    get(key) {
        const heap = getHeapStore();
        // Try heap first (fast path)
        const entry = heap.entries.get(key);
        if (entry) {
            // Check TTL (-1 means infinite, never expires)
            if (entry.ttl !== undefined && entry.ttl !== exports.INFINITE_TTL) {
                const age = Game.time - entry.lastModified;
                if (age > entry.ttl) {
                    // Expired, remove from cache
                    heap.entries.delete(key);
                    return undefined;
                }
            }
            return entry.value;
        }
        // Fall back to Memory (slow path, only happens if entry wasn't rehydrated)
        const memory = getCacheMemory();
        const memEntry = memory.data[key];
        if (memEntry) {
            // Check TTL (-1 means infinite, never expires)
            if (memEntry.ttl !== undefined && memEntry.ttl !== exports.INFINITE_TTL) {
                const age = Game.time - memEntry.lastModified;
                if (age > memEntry.ttl) {
                    // Expired, clean up
                    delete memory.data[key];
                    return undefined;
                }
            }
            // Load into heap for future fast access
            heap.entries.set(key, {
                value: memEntry.value,
                lastModified: memEntry.lastModified,
                dirty: false,
                ttl: memEntry.ttl
            });
            return memEntry.value;
        }
        return undefined;
    }
    /**
     * Set a value in the cache.
     * Writes to heap immediately, marks for persistence.
     *
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Optional time-to-live in ticks (-1 for infinite)
     */
    set(key, value, ttl) {
        const heap = getHeapStore();
        heap.entries.set(key, {
            value,
            lastModified: Game.time,
            dirty: true,
            ttl: ttl !== null && ttl !== void 0 ? ttl : DEFAULT_TTL
        });
    }
    /**
     * Delete a value from the cache.
     * Removes from both heap and Memory.
     *
     * @param key - Cache key
     */
    delete(key) {
        const heap = getHeapStore();
        heap.entries.delete(key);
        // Also remove from Memory
        const memory = getCacheMemory();
        delete memory.data[key];
    }
    /**
     * Check if a key exists in the cache.
     *
     * @param key - Cache key
     * @returns True if key exists and is not expired
     */
    has(key) {
        return this.get(key) !== undefined;
    }
    /**
     * Clear all cached data from both heap and Memory.
     */
    clear() {
        const heap = getHeapStore();
        heap.entries.clear();
        const memory = getCacheMemory();
        memory.data = {};
    }
    /**
     * Persist dirty cache entries to Memory.
     * Should be called periodically to sync changes.
     *
     * @param force - Force persistence even if interval hasn't elapsed
     * @returns Number of entries persisted
     */
    persist(force = false) {
        // Check if persistence interval has elapsed
        if (!force && Game.time - this.lastPersistenceTick < PERSISTENCE_INTERVAL) {
            return 0;
        }
        const heap = getHeapStore();
        const memory = getCacheMemory();
        let persistedCount = 0;
        // Persist only dirty entries
        for (const [key, entry] of heap.entries) {
            if (entry.dirty) {
                memory.data[key] = {
                    value: entry.value,
                    lastModified: entry.lastModified,
                    ttl: entry.ttl
                };
                entry.dirty = false;
                persistedCount++;
            }
        }
        memory.lastSync = Game.time;
        this.lastPersistenceTick = Game.time;
        return persistedCount;
    }
    /**
     * Get cache statistics.
     *
     * @returns Cache stats
     */
    getStats() {
        const heap = getHeapStore();
        const memory = getCacheMemory();
        let dirtyCount = 0;
        for (const entry of heap.entries.values()) {
            if (entry.dirty)
                dirtyCount++;
        }
        return {
            heapSize: heap.entries.size,
            memorySize: Object.keys(memory.data).length,
            dirtyEntries: dirtyCount,
            lastSync: memory.lastSync
        };
    }
    /**
     * Get all keys in the cache.
     *
     * @returns Array of cache keys
     */
    keys() {
        const heap = getHeapStore();
        return Array.from(heap.entries.keys());
    }
    /**
     * Get all values in the cache.
     *
     * @returns Array of cache values
     */
    values() {
        const heap = getHeapStore();
        return Array.from(heap.entries.values()).map(entry => entry.value);
    }
    /**
     * Clean up expired entries from the cache.
     *
     * @returns Number of entries cleaned
     */
    cleanExpired() {
        const heap = getHeapStore();
        const memory = getCacheMemory();
        let cleanedCount = 0;
        // Clean heap (skip entries with infinite TTL)
        for (const [key, entry] of heap.entries) {
            if (entry.ttl !== undefined && entry.ttl !== exports.INFINITE_TTL) {
                const age = Game.time - entry.lastModified;
                if (age > entry.ttl) {
                    heap.entries.delete(key);
                    cleanedCount++;
                }
            }
        }
        // Clean Memory (skip entries with infinite TTL)
        for (const [key, memEntry] of Object.entries(memory.data)) {
            if (memEntry.ttl !== undefined && memEntry.ttl !== exports.INFINITE_TTL) {
                const age = Game.time - memEntry.lastModified;
                if (age > memEntry.ttl) {
                    delete memory.data[key];
                    cleanedCount++;
                }
            }
        }
        return cleanedCount;
    }
}
exports.HeapCacheManager = HeapCacheManager;
/**
 * Global heap cache manager instance
 */
exports.heapCache = new HeapCacheManager();
