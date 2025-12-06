/**
 * MCP Tool handlers for Screeps wiki operations
 */

import { z } from "zod";
import {
  searchWiki,
  getArticleContent,
  getArticleHtml,
  listCategories,
  getCategoryMembers,
  getArticleUrl,
  getCategoryUrl,
  getArticleCache,
  getSearchCache
} from "../wiki/index.js";
import { parseWikitext, parseHtmlContent, toPlainText } from "../wiki/parser.js";

/**
 * Tool schemas for validation
 */
export const toolSchemas = {
  search: z.object({
    query: z.string().describe("Search query for wiki articles"),
    limit: z.number().min(1).max(50).optional().describe("Maximum number of results (default: 10)")
  }),

  getArticle: z.object({
    title: z.string().describe("Title of the wiki article"),
    includeHtml: z.boolean().optional().describe("Include parsed HTML content (default: false)")
  }),

  listCategories: z.object({
    parent: z.string().optional().describe("Parent category to list subcategories from"),
    limit: z.number().min(1).max(100).optional().describe("Maximum number of categories (default: 50)")
  }),

  getTable: z.object({
    article: z.string().describe("Article title containing the table"),
    tableIndex: z.number().min(0).optional().describe("Index of the table to extract (default: 0, first table)")
  })
};

/**
 * Tool definitions for MCP
 */
export function listTools() {
  return [
    {
      name: "screeps_wiki_search",
      description:
        "Search the Screeps community wiki (wiki.screepspl.us) for articles. Returns matching articles with titles, snippets, and URLs.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for wiki articles"
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default: 10, max: 50)",
            minimum: 1,
            maximum: 50
          }
        },
        required: ["query"]
      }
    },
    {
      name: "screeps_wiki_get_article",
      description:
        "Get the full content of a Screeps wiki article. Returns the article text parsed to markdown, sections, and categories.",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the wiki article (e.g., 'Overmind', 'Remote_Harvesting', 'Great_Filters')"
          },
          includeHtml: {
            type: "boolean",
            description: "Include parsed HTML content in addition to wikitext (default: false)"
          }
        },
        required: ["title"]
      }
    },
    {
      name: "screeps_wiki_list_categories",
      description:
        "List categories in the Screeps wiki. Can list all top-level categories or articles within a specific category.",
      inputSchema: {
        type: "object",
        properties: {
          parent: {
            type: "string",
            description: "Parent category name to list members of. If omitted, lists all categories."
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default: 50, max: 100)",
            minimum: 1,
            maximum: 100
          }
        }
      }
    },
    {
      name: "screeps_wiki_get_table",
      description:
        "Extract structured table data from a wiki article. Returns table headers and rows as JSON for data analysis.",
      inputSchema: {
        type: "object",
        properties: {
          article: {
            type: "string",
            description: "Title of the article containing the table"
          },
          tableIndex: {
            type: "number",
            description: "Index of the table to extract (0-based, default: 0 for first table)",
            minimum: 0
          }
        },
        required: ["article"]
      }
    }
  ];
}

/**
 * Handle search tool
 */
export async function handleSearch(args: z.infer<typeof toolSchemas.search>) {
  const limit = args.limit || 10;
  const cacheKey = `${args.query}:${limit}`;

  // Check cache
  const searchCache = getSearchCache();
  const cached = searchCache.get(cacheKey);

  if (cached) {
    const results = cached.map(r => ({
      title: r.title,
      pageId: r.pageId,
      url: getArticleUrl(r.title),
      snippet: r.snippet
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query: args.query,
              count: results.length,
              results,
              cached: true
            },
            null,
            2
          )
        }
      ],
      isError: false
    };
  }

  // Fetch from wiki
  const searchResults = await searchWiki(args.query, limit);

  // Cache results
  searchCache.set(cacheKey, searchResults);

  const results = searchResults.map(r => ({
    title: r.title,
    pageId: r.pageId,
    url: getArticleUrl(r.title),
    snippet: r.snippet
  }));

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            query: args.query,
            count: results.length,
            results,
            cached: false
          },
          null,
          2
        )
      }
    ],
    isError: false
  };
}

/**
 * Handle getArticle tool
 */
export async function handleGetArticle(args: z.infer<typeof toolSchemas.getArticle>) {
  const articleCache = getArticleCache();

  // Check cache
  const cached = articleCache.get(args.title);

  if (cached) {
    const { content, sections } = parseWikitext(cached.content);

    const result = {
      title: cached.title,
      pageId: cached.pageId,
      url: getArticleUrl(cached.title),
      categories: cached.categories,
      content,
      sections: sections.map(s => ({
        heading: s.heading,
        level: s.level,
        anchor: s.anchor
      })),
      summary: toPlainText(content, 500),
      cached: true
    };

    // Optionally add HTML content
    if (args.includeHtml) {
      const htmlData = await getArticleHtml(args.title);
      if (htmlData) {
        const parsed = parseHtmlContent(htmlData.html);
        Object.assign(result, { htmlContent: parsed.content });
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ],
      isError: false
    };
  }

  // Fetch from wiki
  const articleData = await getArticleContent(args.title);

  if (!articleData) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Article not found: ${args.title}`,
              suggestion: "Try searching with screeps_wiki_search to find the correct article title"
            },
            null,
            2
          )
        }
      ]
    };
  }

  // Cache the result
  articleCache.set(args.title, articleData);

  const { content, sections } = parseWikitext(articleData.content);

  const result: Record<string, unknown> = {
    title: articleData.title,
    pageId: articleData.pageId,
    url: getArticleUrl(articleData.title),
    categories: articleData.categories,
    content,
    sections: sections.map(s => ({
      heading: s.heading,
      level: s.level,
      anchor: s.anchor
    })),
    summary: toPlainText(content, 500),
    cached: false
  };

  // Optionally add HTML content
  if (args.includeHtml) {
    const htmlData = await getArticleHtml(args.title);
    if (htmlData) {
      const parsed = parseHtmlContent(htmlData.html);
      result.htmlContent = parsed.content;
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: false
  };
}

/**
 * Handle listCategories tool
 */
export async function handleListCategories(args: z.infer<typeof toolSchemas.listCategories>) {
  const limit = args.limit || 50;

  if (args.parent) {
    // List articles in a specific category
    const members = await getCategoryMembers(args.parent, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              category: args.parent,
              url: getCategoryUrl(args.parent),
              count: members.length,
              articles: members.map(m => ({
                title: m.title,
                pageId: m.pageId,
                url: getArticleUrl(m.title)
              }))
            },
            null,
            2
          )
        }
      ],
      isError: false
    };
  }

  // List all categories
  const categories = await listCategories(limit);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            count: categories.length,
            categories: categories.map(c => ({
              name: c.name,
              title: c.title,
              url: getCategoryUrl(c.name)
            }))
          },
          null,
          2
        )
      }
    ],
    isError: false
  };
}

/**
 * Handle getTable tool
 */
export async function handleGetTable(args: z.infer<typeof toolSchemas.getTable>) {
  const tableIndex = args.tableIndex || 0;

  // Fetch article HTML
  const htmlData = await getArticleHtml(args.article);

  if (!htmlData) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Article not found: ${args.article}`,
              suggestion: "Try searching with screeps_wiki_search to find the correct article title"
            },
            null,
            2
          )
        }
      ]
    };
  }

  // Parse HTML and extract tables
  const { tables } = parseHtmlContent(htmlData.html);

  if (tables.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `No tables found in article: ${args.article}`,
              articleUrl: getArticleUrl(args.article)
            },
            null,
            2
          )
        }
      ]
    };
  }

  if (tableIndex >= tables.length) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Table index ${tableIndex} out of range. Article has ${tables.length} tables.`,
              availableTables: tables.map((t, i) => ({
                index: i,
                caption: t.caption,
                columns: t.headers.length,
                rows: t.rows.length
              }))
            },
            null,
            2
          )
        }
      ]
    };
  }

  const table = tables[tableIndex];

  // Create a new object with the source article to avoid mutating the original
  const tableWithSource = {
    ...table,
    sourceArticle: args.article
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            article: args.article,
            articleUrl: getArticleUrl(args.article),
            tableIndex,
            totalTables: tables.length,
            table: tableWithSource
          },
          null,
          2
        )
      }
    ],
    isError: false
  };
}
