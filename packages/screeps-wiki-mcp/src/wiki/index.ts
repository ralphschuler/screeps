/**
 * Wiki module exports
 */

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
} from "./client.js";

export { parseWikitext, parseHtmlContent, cleanContent, extractCodeBlocks, toPlainText } from "./parser.js";

export {
  WikiCache,
  getArticleCache,
  getSearchCache,
  getCategoryCache,
  clearAllCaches,
  getCacheStats
} from "./cache.js";
