/**
 * Type definitions for Screeps TypeScript MCP Server
 */

/**
 * Configuration for the MCP server
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  cacheConfig: CacheConfig;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in seconds
}

/**
 * Represents a TypeScript type definition entry
 */
export interface TypeDefinition {
  id: string;
  name: string;
  kind: TypeKind;
  content: string;
  description?: string;
  file: string;
  lineNumber?: number;
  examples?: string[];
  relatedTypes?: string[];
}

/**
 * Kind of TypeScript definition
 */
export type TypeKind = 
  | "interface"
  | "type"
  | "class"
  | "enum"
  | "constant"
  | "function"
  | "namespace";

/**
 * Search result for type definitions
 */
export interface SearchResult {
  query: string;
  results: TypeDefinition[];
  total: number;
}

/**
 * Index of all type definitions
 */
export interface TypeIndex {
  version: string;
  types: Map<string, TypeDefinition>;
  files: Map<string, string[]>; // filename -> type IDs
  searchIndex: Map<string, Set<string>>; // keyword -> type IDs
  lastUpdated: Date;
}

/**
 * Type relationship information
 */
export interface TypeRelationship {
  typeName: string;
  extends?: string[];
  implements?: string[];
  usedBy?: string[];
  uses?: string[];
}

/**
 * Category of Screeps types
 */
export type TypeCategory =
  | "game"
  | "room"
  | "creep"
  | "structure"
  | "resource"
  | "pathfinding"
  | "memory"
  | "market"
  | "power"
  | "constants"
  | "visual"
  | "other";

/**
 * Extended type definition with categorization
 */
export interface CategorizedType extends TypeDefinition {
  category: TypeCategory;
}
