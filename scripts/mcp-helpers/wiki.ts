/**
 * Wiki MCP Integration Helpers
 * 
 * Helper functions for interacting with the Screeps community wiki via MCP.
 */

import { WikiArticle } from './types.js';

/**
 * Search wiki for strategies and best practices
 * 
 * AI Agent Usage:
 * ```
 * await screeps_wiki_search({ 
 *   query: "CPU optimization techniques",
 *   limit: 10 
 * });
 * ```
 */
export async function searchWikiStrategies(topic: string): Promise<WikiArticle[]> {
  console.warn('searchWikiStrategies: AI agents should use screeps-wiki-mcp screeps_wiki_search tool directly.');
  
  return [];
}

/**
 * Get full wiki article content
 * 
 * AI Agent Usage:
 * ```
 * await screeps_wiki_get_article({ 
 *   title: "CPU Management",
 *   includeHtml: false 
 * });
 * ```
 */
export async function getWikiArticle(title: string): Promise<WikiArticle | null> {
  console.warn('getWikiArticle: AI agents should use screeps-wiki-mcp screeps_wiki_get_article tool directly.');
  
  return null;
}

/**
 * Get wiki categories
 * 
 * AI Agent Usage:
 * ```
 * await screeps_wiki_list_categories({ 
 *   limit: 50 
 * });
 * ```
 */
export async function getWikiCategories(parent?: string): Promise<string[]> {
  console.warn('getWikiCategories: AI agents should use screeps-wiki-mcp screeps_wiki_list_categories tool directly.');
  
  return [];
}
