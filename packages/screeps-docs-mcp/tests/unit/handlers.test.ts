/**
 * Unit tests for MCP handlers
 */

import { describe, it, expect, vi } from "vitest";
import { listResources, parseResourceURI, handleResourceRead } from "../../src/handlers/resources.js";
import {
  listTools,
  handleSearch,
  handleGetAPI,
  handleGetMechanics,
  handleListAPIs,
  handleListMechanics
} from "../../src/handlers/tools.js";

// Mock the index builder
vi.mock("../../src/scraper/index-builder.js", () => ({
  buildIndex: vi.fn().mockResolvedValue({
    entries: [
      {
        id: "api-game",
        title: "Game",
        url: "https://docs.screeps.com/api/#Game",
        content: "The main global game object containing all the game play information.",
        type: "api",
        objectName: "Game",
        keywords: ["game"]
      },
      {
        id: "api-creep",
        title: "Creep",
        url: "https://docs.screeps.com/api/#Creep",
        content: "Creeps are your units. They can move, harvest, build, attack, and perform other actions.",
        type: "api",
        objectName: "Creep",
        keywords: ["creep"]
      },
      {
        id: "mechanics-control",
        title: "Room Control",
        url: "https://docs.screeps.com/control.html",
        content: "Room control mechanics and controller mechanics.",
        type: "mechanics",
        topic: "control",
        keywords: ["control", "room control"]
      }
    ],
    lastUpdated: new Date(),
    version: "1.0.0"
  }),
  searchIndex: vi.fn((index, query) => {
    return index.entries
      .filter((entry: { content: string }) => entry.content.toLowerCase().includes(query.toLowerCase()))
      .map((entry: unknown) => ({
        entry,
        score: 5,
        matches: ["content"]
      }));
  }),
  getEntryById: vi.fn((index, id) => {
    return index.entries.find((entry: { id: string }) => entry.id === id) || null;
  }),
  getEntriesByType: vi.fn((index, type) => {
    return index.entries.filter((entry: { type: string }) => entry.type === type);
  })
}));

// Mock the scrapers
vi.mock("../../src/scraper/api-scraper.js", () => ({
  getAPIObjectList: vi.fn(() => ["Game", "Room", "Creep"])
}));

vi.mock("../../src/scraper/mechanics-scraper.js", () => ({
  getMechanicsTopicList: vi.fn(() => [
    { topic: "control", name: "Room Control" },
    { topic: "market", name: "Market" }
  ])
}));

describe("Resource Handlers", () => {
  describe("listResources", () => {
    it("should return list of available resources", () => {
      const resources = listResources();

      expect(resources).toHaveLength(4);
      expect(resources[0]).toHaveProperty("uri");
      expect(resources[0]).toHaveProperty("name");
      expect(resources[0]).toHaveProperty("description");
    });
  });

  describe("parseResourceURI", () => {
    it("should parse API resource URI", () => {
      const result = parseResourceURI("screeps-docs://api/Game");

      expect(result).toEqual({ type: "api", param: "Game" });
    });

    it("should parse mechanics resource URI", () => {
      const result = parseResourceURI("screeps-docs://mechanics/control");

      expect(result).toEqual({ type: "mechanics", param: "control" });
    });

    it("should parse API list URI", () => {
      const result = parseResourceURI("screeps-docs://api/list");

      expect(result).toEqual({ type: "api-list" });
    });

    it("should parse mechanics list URI", () => {
      const result = parseResourceURI("screeps-docs://mechanics/list");

      expect(result).toEqual({ type: "mechanics-list" });
    });

    it("should return null for invalid URI", () => {
      const result = parseResourceURI("invalid://uri");

      expect(result).toBeNull();
    });
  });

  describe("handleResourceRead", () => {
    it("should handle API resource read", async () => {
      const result = await handleResourceRead("screeps-docs://api/Game");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("id", "api-game");
      expect(parsed).toHaveProperty("title", "Game");
    });

    it("should handle mechanics resource read", async () => {
      const result = await handleResourceRead("screeps-docs://mechanics/control");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("id", "mechanics-control");
      expect(parsed).toHaveProperty("title", "Room Control");
    });

    it("should handle API list read", async () => {
      const result = await handleResourceRead("screeps-docs://api/list");
      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]).toHaveProperty("id");
    });

    it("should throw error for invalid URI", async () => {
      await expect(handleResourceRead("invalid://uri")).rejects.toThrow();
    });

    it("should throw error for missing API object", async () => {
      await expect(handleResourceRead("screeps-docs://api/NonExistent")).rejects.toThrow();
    });
  });
});

describe("Tool Handlers", () => {
  describe("listTools", () => {
    it("should return list of available tools", () => {
      const tools = listTools();

      expect(tools).toHaveLength(5);
      expect(tools[0]).toHaveProperty("name");
      expect(tools[0]).toHaveProperty("description");
      expect(tools[0]).toHaveProperty("inputSchema");
    });
  });

  describe("handleSearch", () => {
    it("should return search results", async () => {
      const result = await handleSearch({ query: "creep" });

      expect(result).toHaveProperty("content");
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty("type", "text");

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("query", "creep");
      expect(data).toHaveProperty("results");
    });
  });

  describe("handleGetAPI", () => {
    it("should return API documentation", async () => {
      const result = await handleGetAPI({ objectName: "Game" });

      expect(result).toHaveProperty("content");
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("id", "api-game");
    });

    it("should return error for non-existent API", async () => {
      const result = await handleGetAPI({ objectName: "NonExistent" });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("available");
    });
  });

  describe("handleGetMechanics", () => {
    it("should return mechanics documentation", async () => {
      const result = await handleGetMechanics({ topic: "control" });

      expect(result).toHaveProperty("content");
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("id", "mechanics-control");
    });

    it("should return error for non-existent topic", async () => {
      const result = await handleGetMechanics({ topic: "nonexistent" });

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("available");
    });
  });

  describe("handleListAPIs", () => {
    it("should return list of APIs", async () => {
      const result = await handleListAPIs();

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("apis");
      expect(data).toHaveProperty("count");
      expect(Array.isArray(data.apis)).toBe(true);
    });
  });

  describe("handleListMechanics", () => {
    it("should return list of mechanics", async () => {
      const result = await handleListMechanics();

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("mechanics");
      expect(data).toHaveProperty("count");
      expect(Array.isArray(data.mechanics)).toBe(true);
    });
  });
});
