/**
 * MediaWiki API client for the Screeps community wiki
 */

import fetch from "node-fetch";
import type { MediaWikiQueryResponse } from "../types.js";
import { WikiApiError } from "../types.js";

/**
 * Base URL for the Screeps community wiki
 */
export const WIKI_BASE_URL = "https://wiki.screepspl.us";
export const WIKI_API_URL = `${WIKI_BASE_URL}/api.php`;

/**
 * Default request options
 */
const DEFAULT_HEADERS = {
  "User-Agent": "ScreepsWikiMCP/0.1.0 (https://github.com/ralphschuler/.screeps-gpt)",
  Accept: "application/json"
};

/**
 * Make a request to the MediaWiki API
 */
export async function apiRequest(params: Record<string, string>): Promise<MediaWikiQueryResponse> {
  const searchParams = new URLSearchParams({
    ...params,
    format: "json",
    formatversion: "2"
  });

  const url = `${WIKI_API_URL}?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS
    });

    if (!response.ok) {
      throw new WikiApiError(`HTTP error: ${response.status} ${response.statusText}`, "http_error", response.status);
    }

    const data = (await response.json()) as MediaWikiQueryResponse;

    if (data.error) {
      throw new WikiApiError(data.error.info, data.error.code);
    }

    return data;
  } catch (error) {
    if (error instanceof WikiApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new WikiApiError(`Failed to fetch from wiki API: ${message}`);
  }
}

/**
 * Search for wiki articles by query
 */
export async function searchWiki(
  query: string,
  limit: number = 10
): Promise<Array<{ title: string; pageId: number; snippet: string }>> {
  const data = await apiRequest({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    srprop: "snippet|timestamp"
  });

  if (!data.query?.search) {
    return [];
  }

  return data.query.search.map(result => ({
    title: result.title,
    pageId: result.pageid,
    // Strip HTML tags iteratively to handle nested tags like <scr<script>ipt>
    snippet: stripHtmlTags(result.snippet)
  }));
}

/**
 * Strip HTML tags from a string, handling nested/malformed tags
 */
function stripHtmlTags(input: string): string {
  let result = input;
  let previous = "";
  // Loop until no more tags are found (handles nested cases)
  while (result !== previous) {
    previous = result;
    result = result.replace(/<[^>]*>/g, "");
  }
  return result;
}

/**
 * Get the content of a wiki article by title
 */
export async function getArticleContent(
  title: string
): Promise<{ title: string; pageId: number; content: string; categories: string[] } | null> {
  const data = await apiRequest({
    action: "parse",
    page: title,
    prop: "text|wikitext|categories|sections"
  });

  if (!data.parse) {
    return null;
  }

  const wikitext = data.parse.wikitext?.["*"] || "";
  const categories = data.parse.categories?.map(c => c["*"]) || [];

  return {
    title: data.parse.title,
    pageId: data.parse.pageid,
    content: wikitext,
    categories
  };
}

/**
 * Get the parsed HTML content of a wiki article
 */
export async function getArticleHtml(title: string): Promise<{
  title: string;
  pageId: number;
  html: string;
  sections: Array<{ heading: string; level: number; anchor: string }>;
  categories: string[];
} | null> {
  const data = await apiRequest({
    action: "parse",
    page: title,
    prop: "text|sections|categories"
  });

  if (!data.parse) {
    return null;
  }

  const html = data.parse.text?.["*"] || "";
  const sections =
    data.parse.sections?.map(s => ({
      heading: s.line,
      level: parseInt(s.level, 10),
      anchor: s.anchor
    })) || [];
  const categories = data.parse.categories?.map(c => c["*"]) || [];

  return {
    title: data.parse.title,
    pageId: data.parse.pageid,
    html,
    sections,
    categories
  };
}

/**
 * List all categories in the wiki
 */
export async function listCategories(limit: number = 50): Promise<Array<{ name: string; title: string }>> {
  const data = await apiRequest({
    action: "query",
    list: "allcategories",
    aclimit: String(limit),
    acprop: "size"
  });

  if (!data.query?.allcategories) {
    return [];
  }

  return data.query.allcategories.map(cat => ({
    name: cat["*"],
    title: `Category:${cat["*"]}`
  }));
}

/**
 * Get articles in a specific category
 */
export async function getCategoryMembers(
  categoryName: string,
  limit: number = 50
): Promise<Array<{ title: string; pageId: number }>> {
  // Ensure category name has proper prefix
  const fullCategoryName = categoryName.startsWith("Category:") ? categoryName : `Category:${categoryName}`;

  const data = await apiRequest({
    action: "query",
    list: "categorymembers",
    cmtitle: fullCategoryName,
    cmlimit: String(limit),
    cmtype: "page|subcat"
  });

  if (!data.query?.categorymembers) {
    return [];
  }

  return data.query.categorymembers.map(member => ({
    title: member.title,
    pageId: member.pageid
  }));
}

/**
 * Get a summary/extract of an article
 */
export async function getArticleSummary(title: string): Promise<{
  title: string;
  pageId: number;
  extract: string;
} | null> {
  const data = await apiRequest({
    action: "query",
    titles: title,
    prop: "extracts",
    exintro: "true",
    explaintext: "true",
    exsectionformat: "plain"
  });

  if (!data.query?.pages) {
    return null;
  }

  const pages = Object.values(data.query.pages);
  const page = pages[0];

  if (!page || page.pageid === undefined || page.pageid < 0) {
    return null;
  }

  return {
    title: page.title,
    pageId: page.pageid,
    extract: page.extract || ""
  };
}

/**
 * Check if an article exists
 */
export async function articleExists(title: string): Promise<boolean> {
  const data = await apiRequest({
    action: "query",
    titles: title
  });

  if (!data.query?.pages) {
    return false;
  }

  const pages = Object.values(data.query.pages);
  const page = pages[0];

  // A missing page has pageid = -1 or missing property
  return page !== undefined && page.pageid !== undefined && page.pageid > 0;
}

/**
 * Build full article URL
 */
export function getArticleUrl(title: string): string {
  return `${WIKI_BASE_URL}/index.php/${encodeURIComponent(title.replace(/ /g, "_"))}`;
}

/**
 * Build category URL
 */
export function getCategoryUrl(categoryName: string): string {
  const fullName = categoryName.startsWith("Category:") ? categoryName : `Category:${categoryName}`;
  return getArticleUrl(fullName);
}
