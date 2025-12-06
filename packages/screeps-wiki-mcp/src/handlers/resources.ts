/**
 * MCP Resource handlers for Screeps wiki
 */

import {
  getArticleContent,
  listCategories,
  getCategoryMembers,
  getArticleUrl,
  getCategoryUrl,
  getArticleCache
} from "../wiki/index.js";
import { parseWikitext, toPlainText } from "../wiki/parser.js";
import type { WikiArticle, WikiCategory } from "../types.js";

/**
 * Available resource templates
 */
export function listResources(): Array<{
  uri: string;
  name: string;
  description: string;
}> {
  return [
    {
      uri: "screeps-wiki://categories/list",
      name: "Wiki Categories",
      description: "List all categories in the Screeps community wiki"
    },
    {
      uri: "screeps-wiki://article/{title}",
      name: "Wiki Article",
      description: "Get a specific wiki article by title"
    },
    {
      uri: "screeps-wiki://category/{name}",
      name: "Category Articles",
      description: "List articles in a specific category"
    }
  ];
}

/**
 * Parse a resource URI
 */
export function parseResourceURI(
  uri: string
): { type: "categories-list" } | { type: "article"; param: string } | { type: "category"; param: string } | null {
  const match = uri.match(/^screeps-wiki:\/\/(.+)$/);
  if (!match || !match[1]) {
    return null;
  }

  const path = match[1];

  if (path === "categories/list") {
    return { type: "categories-list" };
  }

  const articleMatch = path.match(/^article\/(.+)$/);
  if (articleMatch && articleMatch[1]) {
    return { type: "article", param: decodeURIComponent(articleMatch[1]) };
  }

  const categoryMatch = path.match(/^category\/(.+)$/);
  if (categoryMatch && categoryMatch[1]) {
    return { type: "category", param: decodeURIComponent(categoryMatch[1]) };
  }

  return null;
}

/**
 * Handle resource read requests
 */
export async function handleResourceRead(uri: string): Promise<string> {
  const parsed = parseResourceURI(uri);

  if (!parsed) {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  if (parsed.type === "categories-list") {
    const categories = await listCategories(100);
    const result: WikiCategory[] = categories.map(cat => ({
      name: cat.name,
      title: cat.title,
      url: getCategoryUrl(cat.name)
    }));
    return JSON.stringify(result, null, 2);
  }

  if (parsed.type === "article") {
    // Check cache first
    const cache = getArticleCache();
    const cached = cache.get(parsed.param);

    if (cached) {
      const { content, sections } = parseWikitext(cached.content);
      const article: WikiArticle = {
        id: String(cached.pageId),
        title: cached.title,
        url: getArticleUrl(cached.title),
        content,
        categories: cached.categories,
        sections,
        summary: toPlainText(content, 300)
      };
      return JSON.stringify(article, null, 2);
    }

    // Fetch from wiki
    const articleData = await getArticleContent(parsed.param);

    if (!articleData) {
      throw new Error(`Article not found: ${parsed.param}`);
    }

    // Cache the result
    cache.set(parsed.param, articleData);

    const { content, sections } = parseWikitext(articleData.content);
    const article: WikiArticle = {
      id: String(articleData.pageId),
      title: articleData.title,
      url: getArticleUrl(articleData.title),
      content,
      categories: articleData.categories,
      sections,
      summary: toPlainText(content, 300)
    };

    return JSON.stringify(article, null, 2);
  }

  if (parsed.type === "category") {
    const members = await getCategoryMembers(parsed.param, 100);
    const result = {
      category: parsed.param,
      url: getCategoryUrl(parsed.param),
      articles: members.map(m => ({
        title: m.title,
        pageId: m.pageId,
        url: getArticleUrl(m.title)
      }))
    };
    return JSON.stringify(result, null, 2);
  }

  // This should never be reached due to TypeScript's exhaustive checking
  const _exhaustiveCheck: never = parsed;
  throw new Error(`Unhandled resource type: ${String(_exhaustiveCheck)}`);
}
