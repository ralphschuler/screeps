/**
 * Unit tests for wiki tool handlers
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleSearch,
  handleGetArticle,
  handleListCategories,
  handleGetTable,
  listTools
} from "../../src/handlers/tools.js";

// Mock the wiki client module
vi.mock("../../src/wiki/client.js", () => ({
  searchWiki: vi.fn(),
  getArticleContent: vi.fn(),
  getArticleHtml: vi.fn(),
  listCategories: vi.fn(),
  getCategoryMembers: vi.fn(),
  getArticleUrl: vi.fn((title: string) => `https://wiki.screepspl.us/index.php/${title.replace(/ /g, "_")}`),
  getCategoryUrl: vi.fn((name: string) => `https://wiki.screepspl.us/index.php/Category:${name.replace(/ /g, "_")}`)
}));

// Mock the cache module
vi.mock("../../src/wiki/cache.js", () => ({
  getArticleCache: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn()
  }),
  getSearchCache: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn()
  })
}));

// Mock the parser module
vi.mock("../../src/wiki/parser.js", () => ({
  parseWikitext: vi.fn((text: string) => `Parsed: ${text}`),
  parseHtmlContent: vi.fn((html: string) => ({ text: `Parsed HTML: ${html}`, tables: [] })),
  toPlainText: vi.fn((markdown: string) => markdown.replace(/[#*]/g, ""))
}));

import { searchWiki, getArticleContent, getArticleHtml, listCategories, getCategoryMembers } from "../../src/wiki/client.js";

describe("Tool Handlers - Wiki", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTools", () => {
    it("should return all available tools", () => {
      const tools = listTools();

      expect(tools).toHaveLength(4);
      expect(tools.map(t => t.name)).toEqual([
        "screeps_wiki_search",
        "screeps_wiki_get_article",
        "screeps_wiki_list_categories",
        "screeps_wiki_get_table"
      ]);
    });

    it("should include proper schemas for all tools", () => {
      const tools = listTools();

      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
        expect(tool.inputSchema.properties).toBeDefined();
      });
    });
  });

  describe("handleSearch", () => {
    it("should search wiki and return formatted results", async () => {
      const mockResults = [
        {
          title: "Overmind",
          pageId: 123,
          snippet: "A popular bot architecture"
        },
        {
          title: "Remote Harvesting",
          pageId: 456,
          snippet: "Harvesting from remote rooms"
        }
      ];

      (searchWiki as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const result = await handleSearch({ query: "bot architecture" });

      expect(searchWiki).toHaveBeenCalledWith("bot architecture", 10);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Overmind");
      expect(result.content[0]?.text).toContain("Remote Harvesting");
    });

    it("should respect limit parameter", async () => {
      const mockResults = [{ title: "Test", pageId: 1, snippet: "Test article" }];
      (searchWiki as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      await handleSearch({ query: "test", limit: 5 });

      expect(searchWiki).toHaveBeenCalledWith("test", 5);
    });

    it("should handle empty search results", async () => {
      (searchWiki as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await handleSearch({ query: "nonexistent" });

      expect(result.content[0]?.text).toContain('"count": 0');
      expect(result.content[0]?.text).toContain("nonexistent");
    });

    it("should propagate search errors", async () => {
      (searchWiki as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API Error"));

      await expect(handleSearch({ query: "test" })).rejects.toThrow("API Error");
    });
  });

  describe("handleGetArticle", () => {
    it("should get article content without HTML", async () => {
      const mockArticle = {
        title: "Overmind",
        pageId: 123,
        content: "== Overview ==\nOvermind is great.\n\n== Features ==\nMany features.",
        categories: ["Bots", "Architecture"]
      };

      // Mock parseWikitext to return sections
      const { parseWikitext } = await import("../../src/wiki/parser.js");
      (parseWikitext as ReturnType<typeof vi.fn>).mockReturnValue({
        content: "Parsed content",
        sections: [{ heading: "Overview", level: 2, anchor: "Overview" }]
      });

      (getArticleContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);

      const result = await handleGetArticle({ title: "Overmind" });

      expect(getArticleContent).toHaveBeenCalledWith("Overmind");
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Overmind");
    });

    it("should get article content with HTML when requested", async () => {
      const mockArticle = {
        title: "Overmind",
        pageId: 123,
        content: "== Overview ==\nGreat bot",
        categories: ["Bots"]
      };

      const mockHtmlArticle = {
        title: "Overmind",
        pageId: 123,
        html: "<h2>Overview</h2><p>Great bot</p>",
        sections: [{ heading: "Overview", level: 2, anchor: "Overview" }],
        categories: ["Bots"]
      };

      // Mock parseWikitext to return sections
      const { parseWikitext, parseHtmlContent } = await import("../../src/wiki/parser.js");
      (parseWikitext as ReturnType<typeof vi.fn>).mockReturnValue({
        content: "Parsed content",
        sections: [{ heading: "Overview", level: 2, anchor: "Overview" }]
      });
      (parseHtmlContent as ReturnType<typeof vi.fn>).mockReturnValue({
        content: "Parsed HTML content",
        tables: []
      });

      (getArticleContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);
      (getArticleHtml as ReturnType<typeof vi.fn>).mockResolvedValue(mockHtmlArticle);

      const result = await handleGetArticle({ title: "Overmind", includeHtml: true });

      expect(getArticleContent).toHaveBeenCalledWith("Overmind");
      expect(getArticleHtml).toHaveBeenCalledWith("Overmind");
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Overmind");
    });

    it("should handle article not found", async () => {
      (getArticleContent as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await handleGetArticle({ title: "NonExistent" });

      expect(result.content[0]?.text).toContain("Article not found");
      expect(result.content[0]?.text).toContain("NonExistent");
    });
  });

  describe("handleListCategories", () => {
    it("should list all categories without parent", async () => {
      const mockCategories = [
        { name: "Bots", title: "Category:Bots" },
        { name: "Strategies", title: "Category:Strategies" }
      ];

      (listCategories as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategories);

      const result = await handleListCategories({});

      expect(listCategories).toHaveBeenCalledWith(50);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Bots");
      expect(result.content[0]?.text).toContain("Strategies");
    });

    it("should list category members when parent is specified", async () => {
      const mockMembers = [
        { title: "Overmind", pageId: 123 },
        { title: "Screeps-TypeScript-Starter", pageId: 456 }
      ];

      (getCategoryMembers as ReturnType<typeof vi.fn>).mockResolvedValue(mockMembers);

      const result = await handleListCategories({ parent: "Bots" });

      expect(getCategoryMembers).toHaveBeenCalledWith("Bots", 50);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.text).toContain("Overmind");
    });

    it("should respect limit parameter", async () => {
      const mockCategories = [{ name: "Test", title: "Category:Test" }];
      (listCategories as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategories);

      await handleListCategories({ limit: 25 });

      expect(listCategories).toHaveBeenCalledWith(25);
    });

    it("should propagate errors", async () => {
      (listCategories as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("API Error"));

      await expect(handleListCategories({})).rejects.toThrow("API Error");
    });
  });

  describe("handleGetTable", () => {
    it("should extract table from article HTML", async () => {
      const mockArticle = {
        title: "Test Article",
        pageId: 123,
        html: '<table><tr><th>Header</th></tr><tr><td>Data</td></tr></table>',
        sections: [],
        categories: []
      };

      (getArticleHtml as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);

      const result = await handleGetTable({ article: "Test Article" });

      expect(getArticleHtml).toHaveBeenCalledWith("Test Article");
      expect(result.content).toHaveLength(1);
    });

    it("should use tableIndex parameter", async () => {
      const mockArticle = {
        title: "Test",
        pageId: 123,
        html: '<table></table><table><tr><th>Second</th></tr></table>',
        sections: [],
        categories: []
      };

      (getArticleHtml as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);

      await handleGetTable({ article: "Test", tableIndex: 1 });

      expect(getArticleHtml).toHaveBeenCalledWith("Test");
    });

    it("should handle articles without tables", async () => {
      const mockArticle = {
        title: "Test",
        pageId: 123,
        html: "<p>No tables here</p>",
        sections: [],
        categories: []
      };

      (getArticleHtml as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticle);

      const result = await handleGetTable({ article: "Test" });

      expect(result.content[0]?.text).toContain("No tables found");
    });

    it("should propagate errors", async () => {
      (getArticleHtml as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Article not found"));

      await expect(handleGetTable({ article: "NonExistent" })).rejects.toThrow("Article not found");
    });
  });
});
