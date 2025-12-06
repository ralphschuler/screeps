/**
 * Type definitions for Screeps Documentation MCP Server
 */

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  cacheConfig?: CacheConfig;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size in entries
}

/**
 * Documentation entry from scraper
 */
export interface DocEntry {
  id: string;
  title: string;
  url: string;
  content: string;
  type: "api" | "mechanics";
  category?: string;
  keywords?: string[];
}

/**
 * API reference documentation
 */
export interface APIDoc extends DocEntry {
  type: "api";
  objectName: string;
  properties?: PropertyDoc[];
  methods?: MethodDoc[];
  constants?: ConstantDoc[];
}

/**
 * Property documentation
 */
export interface PropertyDoc {
  name: string;
  type: string;
  description: string;
}

/**
 * Method documentation
 */
export interface MethodDoc {
  name: string;
  signature: string;
  description: string;
  parameters?: ParameterDoc[];
  returns?: string;
}

/**
 * Parameter documentation
 */
export interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
}

/**
 * Constant documentation
 */
export interface ConstantDoc {
  name: string;
  value: string;
  description: string;
}

/**
 * Game mechanics documentation
 */
export interface MechanicsDoc extends DocEntry {
  type: "mechanics";
  topic: string;
  sections?: SectionDoc[];
}

/**
 * Documentation section
 */
export interface SectionDoc {
  heading: string;
  content: string;
  code?: string[];
}

/**
 * Search result
 */
export interface SearchResult {
  entry: DocEntry;
  score: number;
  matches: string[];
}

/**
 * Documentation index
 */
export interface DocIndex {
  entries: DocEntry[];
  lastUpdated: Date;
  version: string;
}
