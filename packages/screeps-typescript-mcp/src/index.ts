/**
 * Screeps TypeScript MCP Server
 * Entry point for programmatic usage
 */

export { createMCPServer } from "./server.js";
export type {
  MCPServerConfig,
  TypeDefinition,
  TypeKind,
  TypeCategory,
  SearchResult,
  TypeIndex,
  TypeRelationship,
  CategorizedType,
} from "./types.js";
export {
  buildIndex,
  searchIndex,
  getTypeByName,
  getAllTypeNames,
  getTypesByFile,
  clearCache,
} from "./scraper/index-builder.js";
export {
  parseTypeScriptFile,
  parseAllTypes,
  categorizeType,
  extractRelatedTypes,
  getTypeList,
} from "./scraper/type-parser.js";
export { cloneTypesRepo, cleanupRepo, getSourcePath } from "./scraper/repo-cloner.js";
