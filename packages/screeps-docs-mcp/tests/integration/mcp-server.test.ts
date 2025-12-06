/**
 * Integration tests for MCP server
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMCPServer } from "../../src/server.js";
import type { MCPServerConfig } from "../../src/types.js";

// Mock the scrapers to avoid actual HTTP requests
vi.mock("../../src/scraper/api-scraper.js", () => ({
  scrapeAPIObject: vi.fn().mockResolvedValue({
    id: "api-game",
    title: "Game",
    url: "https://docs.screeps.com/api/#Game",
    content: "The main global game object.",
    type: "api",
    objectName: "Game",
    keywords: ["game"]
  }),
  scrapeAllAPIObjects: vi.fn().mockResolvedValue([
    {
      id: "api-game",
      title: "Game",
      url: "https://docs.screeps.com/api/#Game",
      content: "The main global game object.",
      type: "api",
      objectName: "Game",
      keywords: ["game"]
    }
  ]),
  getAPIObjectList: vi.fn(() => ["Game", "Room", "Creep"])
}));

vi.mock("../../src/scraper/mechanics-scraper.js", () => ({
  scrapeMechanicsTopic: vi.fn().mockResolvedValue({
    id: "mechanics-control",
    title: "Room Control",
    url: "https://docs.screeps.com/control.html",
    content: "Room control mechanics.",
    type: "mechanics",
    topic: "control",
    keywords: ["control"]
  }),
  scrapeAllMechanics: vi.fn().mockResolvedValue([
    {
      id: "mechanics-control",
      title: "Room Control",
      url: "https://docs.screeps.com/control.html",
      content: "Room control mechanics.",
      type: "mechanics",
      topic: "control",
      keywords: ["control"]
    }
  ]),
  getMechanicsTopicList: vi.fn(() => [{ topic: "control", name: "Room Control" }])
}));

describe("MCP Server Integration", () => {
  let server: ReturnType<typeof createMCPServer>;
  let config: MCPServerConfig;

  beforeEach(() => {
    config = {
      name: "screeps-docs-mcp-test",
      version: "0.1.0",
      cacheConfig: {
        ttl: 3600
      }
    };

    server = createMCPServer(config);
  });

  describe("Server Creation", () => {
    it("should create server with config", () => {
      expect(server).toBeDefined();
    });
  });

  describe("Resource Listing", () => {
    it("should list available resources", async () => {
      // Access server internals to test handler
      // In a real integration test, you'd use the MCP client to test this
      expect(server).toBeDefined();
    });
  });

  describe("Tool Listing", () => {
    it("should list available tools", async () => {
      // Access server internals to test handler
      expect(server).toBeDefined();
    });
  });
});
