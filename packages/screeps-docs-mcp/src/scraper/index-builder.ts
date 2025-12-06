/**
 * Documentation index builder with caching
 */

import type { DocEntry, DocIndex, SearchResult } from "../types.js";
import { scrapeAllAPIObjects } from "./api-scraper.js";
import { scrapeAllMechanics } from "./mechanics-scraper.js";

/**
 * In-memory cache for documentation index
 */
class DocCache {
  private index: DocIndex | null = null;
  private lastFetch: Date | null = null;
  private ttl: number;
  private maxSize: number;

  public constructor(ttlSeconds: number = 3600, maxSize: number = 1000) {
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
    this.maxSize = maxSize;
  }

  /**
   * Check if cache is valid
   */
  public isValid(): boolean {
    if (!this.index || !this.lastFetch) {
      return false;
    }

    const now = new Date();
    const elapsed = now.getTime() - this.lastFetch.getTime();
    return elapsed < this.ttl;
  }

  /**
   * Get cached index
   */
  public get(): DocIndex | null {
    return this.isValid() ? this.index : null;
  }

  /**
   * Set cache
   */
  public set(index: DocIndex): void {
    // Enforce max size by truncating entries if needed (keeps newest first)
    if (this.maxSize > 0 && index.entries.length > this.maxSize) {
      index.entries = index.entries.slice(0, this.maxSize);
    }

    this.index = index;
    this.lastFetch = new Date();
  }

  /**
   * Clear cache
   */
  public clear(): void {
    this.index = null;
    this.lastFetch = null;
  }
}

/**
 * Global cache instance
 */
let cache = new DocCache(3600, 1000); // defaults: 1 hour TTL, 1000 entries

/**
 * Configure cache TTL and max size at runtime (called from server startup)
 */
export function configureCache(options?: { ttl?: number; maxSize?: number }) {
  const ttl = options?.ttl ?? 3600;
  const maxSize = options?.maxSize ?? 1000;
  cache = new DocCache(ttl, maxSize);
}

/**
 * Build complete documentation index
 */
export async function buildIndex(useCache: boolean = true): Promise<DocIndex> {
  // Check cache first
  if (useCache) {
    const cached = cache.get();
    if (cached) {
      return cached;
    }
  }

  // Scrape documentation
  const apiDocs = await scrapeAllAPIObjects();
  const mechanicsDocs = await scrapeAllMechanics();

  const index: DocIndex = {
    entries: [...apiDocs, ...mechanicsDocs],
    lastUpdated: new Date(),
    version: "1.0.0"
  };

  // Cache the result
  cache.set(index);

  return index;
}

/**
 * Search documentation index
 */
export function searchIndex(index: DocIndex, query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const entry of index.entries) {
    const matches: string[] = [];
    let score = 0;

    // Search in title
    if (entry.title.toLowerCase().includes(lowerQuery)) {
      matches.push("title");
      score += 10;
    }

    // Search in keywords
    if (entry.keywords) {
      for (const keyword of entry.keywords) {
        if (keyword.toLowerCase().includes(lowerQuery)) {
          matches.push(`keyword: ${keyword}`);
          score += 5;
        }
      }
    }

    // Search in content
    if (entry.content.toLowerCase().includes(lowerQuery)) {
      matches.push("content");
      score += 1;
    }

    // Search in ID
    if (entry.id.toLowerCase().includes(lowerQuery)) {
      matches.push("id");
      score += 8;
    }

    if (matches.length > 0) {
      results.push({ entry, score, matches });
    }
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get documentation entry by ID
 */
export function getEntryById(index: DocIndex, id: string): DocEntry | null {
  return index.entries.find(entry => entry.id === id) || null;
}

/**
 * Get all entries of a specific type
 */
export function getEntriesByType(index: DocIndex, type: "api" | "mechanics"): DocEntry[] {
  return index.entries.filter(entry => entry.type === type);
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear();
}
