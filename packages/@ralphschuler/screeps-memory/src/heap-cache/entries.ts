/**
 * @internal
 * Entry-shape helpers for HeapCacheManager. Public consumers should use heap-cache.ts.
 */
export const INFINITE_TTL = -1;

export interface CacheEntryMetadata {
  lastModified: number;
  ttl?: number;
}

export interface PersistedCacheEntry<T = unknown> extends CacheEntryMetadata {
  value: T;
}

export interface RuntimeCacheEntry<T = unknown> extends PersistedCacheEntry<T> {
  dirty: boolean;
}

/** Undefined is the delete sentinel for heap-cache writes and persisted entries. */
export function hasCacheValue(entry: { value?: unknown }): boolean {
  return entry.value !== undefined;
}

/** TTLs expire only after their full lifetime; `INFINITE_TTL` never expires. */
export function isCacheEntryExpired(entry: CacheEntryMetadata, currentTick: number): boolean {
  return entry.ttl !== undefined && entry.ttl !== INFINITE_TTL && currentTick - entry.lastModified > entry.ttl;
}

export function toRuntimeEntry<T>(entry: PersistedCacheEntry<T>, dirty = false): RuntimeCacheEntry<T> {
  return {
    value: entry.value,
    lastModified: entry.lastModified,
    dirty,
    ttl: entry.ttl
  };
}

export function toPersistedEntry(entry: RuntimeCacheEntry): PersistedCacheEntry {
  return {
    value: entry.value,
    lastModified: entry.lastModified,
    ttl: entry.ttl
  };
}
