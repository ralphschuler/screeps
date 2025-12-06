/**
 * In-memory cache for wiki data with TTL support
 */

import type { CachedData } from "../types.js";

/**
 * Generic cache class with TTL support
 */
export class WikiCache<T> {
  private cache: Map<string, CachedData<T>> = new Map();
  private ttlMs: number;
  private maxSize: number;

  public constructor(ttlSeconds: number = 3600, maxSize: number = 1000) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxSize = maxSize;
  }

  /**
   * Get a cached value
   */
  public get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a cached value
   */
  public set(key: string, data: T): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlMs);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  /**
   * Check if a key exists and is valid
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a cached value
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached values
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getStats(): { size: number; maxSize: number; ttlSeconds: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlSeconds: this.ttlMs / 1000
    };
  }

  /**
   * Evict the oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime: Date | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldestTime || entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Remove all expired entries
   */
  public prune(): number {
    const now = new Date();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

/**
 * Global cache instances for different data types
 */
let articleCache = new WikiCache<{
  title: string;
  pageId: number;
  content: string;
  categories: string[];
}>(3600, 500);

let searchCache = new WikiCache<Array<{ title: string; pageId: number; snippet: string }>>(300, 100);

let categoryCache = new WikiCache<Array<{ name: string; title: string }>>(3600, 50);

/**
 * Reconfigure all caches with new TTL/max size.
 * A single TTL applies to every cache; sizes keep per-cache defaults unless overridden.
 */
export function configureCaches(options?: { ttl?: number; maxSize?: number }) {
  const ttl = options?.ttl ?? 3600;
  const maxSize = options?.maxSize;

  articleCache = new WikiCache(ttl, maxSize ?? 500);
  searchCache = new WikiCache(Math.min(ttl, 300), maxSize ?? 100); // keep search lighter by default
  categoryCache = new WikiCache(ttl, maxSize ?? 50);
}

/**
 * Get the article cache
 */
export function getArticleCache(): WikiCache<{
  title: string;
  pageId: number;
  content: string;
  categories: string[];
}> {
  return articleCache;
}

/**
 * Get the search cache
 */
export function getSearchCache(): WikiCache<Array<{ title: string; pageId: number; snippet: string }>> {
  return searchCache;
}

/**
 * Get the category cache
 */
export function getCategoryCache(): WikiCache<Array<{ name: string; title: string }>> {
  return categoryCache;
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  articleCache.clear();
  searchCache.clear();
  categoryCache.clear();
}

/**
 * Get combined cache statistics
 */
export function getCacheStats(): {
  articles: { size: number; maxSize: number; ttlSeconds: number };
  search: { size: number; maxSize: number; ttlSeconds: number };
  categories: { size: number; maxSize: number; ttlSeconds: number };
} {
  return {
    articles: articleCache.getStats(),
    search: searchCache.getStats(),
    categories: categoryCache.getStats()
  };
}
