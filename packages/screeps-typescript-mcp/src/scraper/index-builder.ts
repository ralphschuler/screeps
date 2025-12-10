/**
 * Build and maintain a searchable index of TypeScript type definitions
 */

import type { TypeIndex, TypeDefinition, CacheConfig } from "../types.js";
import { cloneTypesRepo, cleanupRepo, getSourcePath } from "./repo-cloner.js";
import { parseAllTypes, extractRelatedTypes } from "./type-parser.js";

// Global cache
let cachedIndex: TypeIndex | null = null;
let cacheExpiry: Date | null = null;
let cacheConfig: CacheConfig = { ttl: 3600 }; // Default 1 hour

/**
 * Configure cache settings
 * @param config Cache configuration
 */
export function configureCache(config: CacheConfig): void {
  cacheConfig = config;
}

/**
 * Check if the cache is valid
 * @returns True if cache is valid
 */
function isCacheValid(): boolean {
  if (!cachedIndex || !cacheExpiry) {
    return false;
  }
  return new Date() < cacheExpiry;
}

/**
 * Build the type definition index
 * @param forceRefresh Force refresh even if cache is valid
 * @returns Type index
 */
export async function buildIndex(forceRefresh = false): Promise<TypeIndex> {
  // Return cached index if valid
  if (!forceRefresh && isCacheValid() && cachedIndex) {
    console.log("Returning cached type index");
    return cachedIndex;
  }

  console.log("Building type index...");
  let repoPath: string | null = null;

  try {
    // Clone repository
    repoPath = await cloneTypesRepo();
    const srcPath = getSourcePath(repoPath);

    // Parse all types
    const definitions = await parseAllTypes(srcPath);

    // Build index
    const types = new Map<string, TypeDefinition>();
    const files = new Map<string, string[]>();
    const searchIndex = new Map<string, Set<string>>();

    for (const def of definitions) {
      // Add to types map
      types.set(def.name, def);

      // Add to files map
      if (!files.has(def.file)) {
        files.set(def.file, []);
      }
      files.get(def.file)!.push(def.id);

      // Add related types
      def.relatedTypes = extractRelatedTypes(def);

      // Build search index
      const keywords = [
        def.name.toLowerCase(),
        def.file.toLowerCase().replace(".ts", ""),
        ...(def.description || "").toLowerCase().split(/\s+/),
        ...def.relatedTypes.map(t => t.toLowerCase()),
      ];

      for (const keyword of keywords) {
        if (!keyword) continue;
        if (!searchIndex.has(keyword)) {
          searchIndex.set(keyword, new Set());
        }
        searchIndex.get(keyword)!.add(def.name);
      }
    }

    const index: TypeIndex = {
      version: "1.0.0",
      types,
      files,
      searchIndex,
      lastUpdated: new Date(),
    };

    // Cache the index
    cachedIndex = index;
    cacheExpiry = new Date(Date.now() + cacheConfig.ttl * 1000);

    console.log(`Built index with ${types.size} type definitions`);
    return index;
  } finally {
    // Always cleanup
    if (repoPath) {
      try {
        await cleanupRepo(repoPath);
      } catch (error) {
        console.error("Error cleaning up repository:", error);
      }
    }
  }
}

/**
 * Search the type index
 * @param index Type index
 * @param query Search query
 * @param limit Maximum number of results
 * @returns Array of matching type definitions
 */
export function searchIndex(
  index: TypeIndex,
  query: string,
  limit = 20
): TypeDefinition[] {
  const queryLower = query.toLowerCase();
  const matchingTypes = new Set<string>();

  // Search for exact matches first
  if (index.types.has(query)) {
    matchingTypes.add(query);
  }

  // Search in the search index
  for (const [keyword, typeNames] of index.searchIndex.entries()) {
    if (keyword.includes(queryLower) || queryLower.includes(keyword)) {
      typeNames.forEach(name => matchingTypes.add(name));
    }
  }

  // Convert to array and return
  const results = Array.from(matchingTypes)
    .map(name => index.types.get(name))
    .filter((def): def is TypeDefinition => def !== undefined)
    .slice(0, limit);

  return results;
}

/**
 * Get a type definition by name
 * @param index Type index
 * @param name Type name
 * @returns Type definition or undefined
 */
export function getTypeByName(
  index: TypeIndex,
  name: string
): TypeDefinition | undefined {
  return index.types.get(name);
}

/**
 * Get all types from a specific file
 * @param index Type index
 * @param fileName File name
 * @returns Array of type definitions
 */
export function getTypesByFile(
  index: TypeIndex,
  fileName: string
): TypeDefinition[] {
  const typeIds = index.files.get(fileName) || [];
  return typeIds
    .map(id => {
      const name = id.split(":")[1];
      return index.types.get(name);
    })
    .filter((def): def is TypeDefinition => def !== undefined);
}

/**
 * Get all type names
 * @param index Type index
 * @returns Array of type names
 */
export function getAllTypeNames(index: TypeIndex): string[] {
  return Array.from(index.types.keys()).sort();
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  cachedIndex = null;
  cacheExpiry = null;
  console.log("Cache cleared");
}
