/**
 * Type definitions for Screeps Wiki MCP Server
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
 * Wiki article from the Screeps community wiki
 */
export interface WikiArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  contentHtml?: string;
  categories: string[];
  sections?: WikiSection[];
  lastModified?: string;
  summary?: string;
}

/**
 * Wiki article section
 */
export interface WikiSection {
  heading: string;
  level: number;
  content: string;
  anchor?: string;
}

/**
 * Wiki category
 */
export interface WikiCategory {
  name: string;
  title: string;
  url: string;
  description?: string;
  articleCount?: number;
  subcategories?: WikiCategory[];
}

/**
 * Wiki search result
 */
export interface WikiSearchResult {
  title: string;
  pageId: number;
  url: string;
  snippet: string;
  score?: number;
}

/**
 * Wiki table data extracted from articles
 */
export interface WikiTable {
  caption?: string;
  headers: string[];
  rows: string[][];
  sourceArticle: string;
}

/**
 * MediaWiki API response types
 */
export interface MediaWikiQueryResponse {
  query?: {
    pages?: Record<
      string,
      {
        pageid: number;
        ns: number;
        title: string;
        revisions?: Array<{
          "*": string;
          contentformat?: string;
          contentmodel?: string;
        }>;
        categories?: Array<{
          ns: number;
          title: string;
        }>;
        extract?: string;
      }
    >;
    search?: Array<{
      ns: number;
      title: string;
      pageid: number;
      snippet: string;
      timestamp: string;
    }>;
    categorymembers?: Array<{
      pageid: number;
      ns: number;
      title: string;
    }>;
    allcategories?: Array<{
      "*": string;
    }>;
  };
  parse?: {
    title: string;
    pageid: number;
    text?: {
      "*": string;
    };
    wikitext?: {
      "*": string;
    };
    sections?: Array<{
      toclevel: number;
      level: string;
      line: string;
      number: string;
      index: string;
      anchor: string;
    }>;
    categories?: Array<{
      "*": string;
      sortkey?: string;
    }>;
    revid?: number;
  };
  error?: {
    code: string;
    info: string;
  };
}

/**
 * Cached wiki data
 */
export interface CachedData<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Wiki API error
 */
export class WikiApiError extends Error {
  public constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "WikiApiError";
  }
}
