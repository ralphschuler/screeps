/**
 * Cache Entry - Core data structure for cached values
 *
 * Represents a single cached value with metadata for TTL, eviction, and statistics.
 */

/**
 * Cache entry with TTL and metadata support
 */
export interface CacheEntry<T = any> {
  /** The cached value */
  value: T;
  /** Tick when this entry was created/updated */
  cachedAt: number;
  /** Last tick this entry was accessed (for LRU) */
  lastAccessed: number;
  /** Time-to-live in ticks (undefined = permanent until manually invalidated) */
  ttl?: number;
  /** Number of times this entry has been accessed */
  hits: number;
  /** Whether this entry has been modified since last persistence (for MemoryStore) */
  dirty?: boolean;
}

/**
 * Options for caching a value
 */
export interface CacheOptions<T = any> {
  /** Time-to-live in ticks (undefined = permanent until manually invalidated) */
  ttl?: number;
  /** Eviction strategy: 'ttl' (time-based), 'lru' (least recently used), 'tick' (per-tick), 'event' (manual) */
  strategy?: 'ttl' | 'lru' | 'tick' | 'event';
  /** Storage backend: 'heap' (global object, fast), 'memory' (persistent, slower) */
  store?: 'heap' | 'memory';
  /** Maximum cache size before eviction */
  maxSize?: number;
  /** Callback when entry is evicted */
  onEvict?: (_key: string, _value: T) => void;
  /** Compute function to generate value if cache miss */
  compute?: () => T;
}

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Hit rate (hits / total requests) */
  hitRate: number;
  /** Current number of entries */
  size: number;
  /** Number of evictions */
  evictions: number;
  /** Estimated CPU saved (optional) */
  cpuSaved?: number;
}
