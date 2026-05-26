import type { CacheEntry } from "../CacheEntry";

export interface MemoryCacheEntry<T = unknown> {
  value: T;
  cachedAt: number;
  ttl?: number;
  hits: number;
}

export function isCacheEntryExpired(cachedAt: number, ttl: number | undefined, now: number): boolean {
  if (ttl === undefined || ttl === -1) return false;
  const age = now - cachedAt;
  return ttl === 0 ? age > 0 : age >= ttl;
}

export function toMemoryCacheEntry<T>(entry: CacheEntry<T>): MemoryCacheEntry<T> {
  return {
    value: entry.value,
    cachedAt: entry.cachedAt,
    ttl: entry.ttl,
    hits: entry.hits
  };
}

export function fromMemoryCacheEntry<T>(entry: MemoryCacheEntry<T>, now: number): CacheEntry<T> {
  return {
    value: entry.value,
    cachedAt: entry.cachedAt,
    lastAccessed: now,
    ttl: entry.ttl,
    hits: entry.hits,
    dirty: false
  };
}
