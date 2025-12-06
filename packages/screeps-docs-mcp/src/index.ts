/**
 * Screeps Documentation MCP Server
 * Entry point for programmatic usage
 */

export { createMCPServer } from "./server.js";
export type { MCPServerConfig, DocEntry, APIDoc, MechanicsDoc, SearchResult, DocIndex } from "./types.js";
export { buildIndex, searchIndex, getEntryById, clearCache } from "./scraper/index-builder.js";
export { scrapeAPIObject, scrapeAllAPIObjects, getAPIObjectList } from "./scraper/api-scraper.js";
export { scrapeMechanicsTopic, scrapeAllMechanics, getMechanicsTopicList } from "./scraper/mechanics-scraper.js";
