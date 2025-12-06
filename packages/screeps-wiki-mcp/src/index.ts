/**
 * Screeps Wiki MCP Server
 * Entry point for programmatic usage
 */

// Server exports
export { createMCPServer } from "./server.js";

// Type exports
export type {
  MCPServerConfig,
  CacheConfig,
  WikiArticle,
  WikiSection,
  WikiCategory,
  WikiSearchResult,
  WikiTable,
  CachedData,
  MediaWikiQueryResponse
} from "./types.js";

export { WikiApiError } from "./types.js";

// Wiki client exports
export {
  WIKI_BASE_URL,
  WIKI_API_URL,
  apiRequest,
  searchWiki,
  getArticleContent,
  getArticleHtml,
  listCategories,
  getCategoryMembers,
  getArticleSummary,
  articleExists,
  getArticleUrl,
  getCategoryUrl
} from "./wiki/client.js";

// Wiki parser exports
export { parseWikitext, parseHtmlContent, cleanContent, extractCodeBlocks, toPlainText } from "./wiki/parser.js";

// Cache exports
export {
  WikiCache,
  getArticleCache,
  getSearchCache,
  getCategoryCache,
  clearAllCaches,
  getCacheStats
} from "./wiki/cache.js";

// Handler exports
export { listResources, parseResourceURI, handleResourceRead } from "./handlers/resources.js";

export {
  toolSchemas,
  listTools,
  handleSearch,
  handleGetArticle,
  handleListCategories,
  handleGetTable
} from "./handlers/tools.js";
