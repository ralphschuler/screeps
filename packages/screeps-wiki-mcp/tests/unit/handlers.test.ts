/**
 * Unit tests for MCP handlers
 */

import { describe, it, expect, vi } from "vitest";
import { listResources, parseResourceURI } from "../../src/handlers/resources.js";
import { listTools } from "../../src/handlers/tools.js";

// Mock the wiki client module
vi.mock("../../src/wiki/client.js", () => ({
  WIKI_BASE_URL: "https://wiki.screepspl.us",
  WIKI_API_URL: "https://wiki.screepspl.us/api.php",
  searchWiki: vi.fn().mockResolvedValue([
    {
      title: "Overmind",
      pageId: 123,
      snippet: "Overmind is a popular open-source bot architecture"
    },
    {
      title: "Remote Harvesting",
      pageId: 456,
      snippet: "Remote harvesting is the practice of harvesting energy from rooms"
    }
  ]),
  getArticleContent: vi.fn().mockResolvedValue({
    title: "Overmind",
    pageId: 123,
    content: "== Overview ==\nOvermind is a popular open-source bot.\n\n== Features ==\nAutomatic creep management.",
    categories: ["Bots", "Architecture"]
  }),
  getArticleHtml: vi.fn().mockResolvedValue({
    title: "Overmind",
    pageId: 123,
    html: '<div><h2>Overview</h2><p>Overmind is a popular open-source bot.</p><table class="wikitable"><tr><th>Feature</th><th>Description</th></tr><tr><td>Auto</td><td>Automatic</td></tr></table></div>',
    sections: [{ heading: "Overview", level: 2, anchor: "Overview" }],
    categories: ["Bots"]
  }),
  listCategories: vi.fn().mockResolvedValue([
    { name: "Bots", title: "Category:Bots" },
    { name: "Strategies", title: "Category:Strategies" }
  ]),
  getCategoryMembers: vi.fn().mockResolvedValue([
    { title: "Overmind", pageId: 123 },
    { title: "Screeps-TypeScript-Starter", pageId: 456 }
  ]),
  getArticleUrl: vi.fn((title: string) => `https://wiki.screepspl.us/index.php/${title.replace(/ /g, "_")}`),
  getCategoryUrl: vi.fn((name: string) => `https://wiki.screepspl.us/index.php/Category:${name.replace(/ /g, "_")}`)
}));

// Mock the cache module
vi.mock("../../src/wiki/cache.js", () => ({
  WikiCache: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    has: vi.fn().mockReturnValue(false),
    clear: vi.fn()
  })),
  getArticleCache: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn()
  }),
  getSearchCache: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn()
  }),
  getCategoryCache: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn()
  }),
  clearAllCaches: vi.fn(),
  getCacheStats: vi.fn().mockReturnValue({
    articles: { size: 0, maxSize: 500, ttlSeconds: 3600 },
    search: { size: 0, maxSize: 100, ttlSeconds: 300 },
    categories: { size: 0, maxSize: 50, ttlSeconds: 3600 }
  })
}));

describe("Resource Handlers", () => {
  describe("listResources", () => {
    it("should return list of available resources", () => {
      const resources = listResources();

      expect(resources).toHaveLength(3);
      expect(resources[0]).toHaveProperty("uri");
      expect(resources[0]).toHaveProperty("name");
      expect(resources[0]).toHaveProperty("description");
    });

    it("should include categories list resource", () => {
      const resources = listResources();
      const categoriesResource = resources.find(r => r.uri === "screeps-wiki://categories/list");

      expect(categoriesResource).toBeDefined();
      expect(categoriesResource?.name).toBe("Wiki Categories");
    });
  });

  describe("parseResourceURI", () => {
    it("should parse categories list URI", () => {
      const result = parseResourceURI("screeps-wiki://categories/list");

      expect(result).toEqual({ type: "categories-list" });
    });

    it("should parse article URI", () => {
      const result = parseResourceURI("screeps-wiki://article/Overmind");

      expect(result).toEqual({ type: "article", param: "Overmind" });
    });

    it("should parse article URI with spaces", () => {
      const result = parseResourceURI("screeps-wiki://article/Remote%20Harvesting");

      expect(result).toEqual({ type: "article", param: "Remote Harvesting" });
    });

    it("should parse category URI", () => {
      const result = parseResourceURI("screeps-wiki://category/Bots");

      expect(result).toEqual({ type: "category", param: "Bots" });
    });

    it("should return null for invalid URI", () => {
      const result = parseResourceURI("invalid://uri");

      expect(result).toBeNull();
    });

    it("should return null for unknown path", () => {
      const result = parseResourceURI("screeps-wiki://unknown/path");

      expect(result).toBeNull();
    });
  });
});

describe("Tool Handlers", () => {
  describe("listTools", () => {
    it("should return list of available tools", () => {
      const tools = listTools();

      expect(tools).toHaveLength(4);
      expect(tools[0]).toHaveProperty("name");
      expect(tools[0]).toHaveProperty("description");
      expect(tools[0]).toHaveProperty("inputSchema");
    });

    it("should include search tool", () => {
      const tools = listTools();
      const searchTool = tools.find(t => t.name === "screeps_wiki_search");

      expect(searchTool).toBeDefined();
      expect(searchTool?.inputSchema.properties).toHaveProperty("query");
    });

    it("should include get article tool", () => {
      const tools = listTools();
      const articleTool = tools.find(t => t.name === "screeps_wiki_get_article");

      expect(articleTool).toBeDefined();
      expect(articleTool?.inputSchema.properties).toHaveProperty("title");
    });

    it("should include list categories tool", () => {
      const tools = listTools();
      const categoriesTool = tools.find(t => t.name === "screeps_wiki_list_categories");

      expect(categoriesTool).toBeDefined();
    });

    it("should include get table tool", () => {
      const tools = listTools();
      const tableTool = tools.find(t => t.name === "screeps_wiki_get_table");

      expect(tableTool).toBeDefined();
      expect(tableTool?.inputSchema.properties).toHaveProperty("article");
    });
  });
});
