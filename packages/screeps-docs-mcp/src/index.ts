/**
 * Screeps Documentation MCP Server
 * Entry point for programmatic usage
 */

export { createMCPServer } from "./server.js";
export type { MCPServerConfig, DocEntry, APIDoc, MechanicsDoc, SearchResult, DocIndex } from "./types.js";
export { buildIndex, searchIndex, getEntryById, clearCache } from "./scraper/index-builder.js";
export { parseAPIObject, parseAllAPIObjects, getAPIObjectList } from "./scraper/api-scraper.js";
export { parseMechanicsTopic, parseAllMechanics, getMechanicsTopicList } from "./scraper/mechanics-scraper.js";
export { cloneDocsRepo, cleanupRepo } from "./scraper/repo-cloner.js";
