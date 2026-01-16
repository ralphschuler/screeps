/**
 * Cache Store Interface
 *
 * Abstraction for different storage backends (heap, memory, etc.)
 */

import { CacheEntry } from "./CacheEntry";

/**
 * Storage backend interface for cache entries
 */
export interface CacheStore {
  /**
   * Get an entry from the store
   */
  get<T>(_key: string): CacheEntry<T> | undefined;

  /**
   * Set an entry in the store
   */
  set<T>(_key: string, _entry: CacheEntry<T>): void;

  /**
   * Delete an entry from the store
   */
  delete(_key: string): boolean;

  /**
   * Check if a key exists in the store
   */
  has(_key: string): boolean;

  /**
   * Get all keys in the store
   */
  keys(): string[];

  /**
   * Get the number of entries in the store
   */
  size(): number;

  /**
   * Clear all entries from the store
   */
  clear(): void;

  /**
   * Cleanup expired entries (implementation specific)
   */
  cleanup?(): number;

  /**
   * Persist changes to permanent storage (for memory store)
   */
  persist?(): number;
}
