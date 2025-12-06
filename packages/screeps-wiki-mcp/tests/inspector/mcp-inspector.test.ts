/**
 * MCP SDK Client integration tests for screeps-wiki-mcp server
 *
 * Uses @modelcontextprotocol/sdk Client to programmatically test
 * the MCP server implementation via stdio transport.
 *
 * This approach validates MCP protocol compliance by using the official
 * SDK client to connect to and interact with the server.
 *
 * @see https://github.com/modelcontextprotocol/inspector
 * @see https://modelcontextprotocol.io/docs/tutorials/building-a-client-node/
 */

import { describe, it, expect, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, ListResourcesResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "../..");
const serverPath = resolve(packageRoot, "dist/server.js");
const serverBuilt = existsSync(serverPath);

/**
 * Creates a new MCP client connected to the server via stdio.
 * The server is started as a child process.
 */
async function createMCPClient(): Promise<{ client: Client }> {
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    env: {
      ...process.env,
      // Cache TTL for testing
      WIKI_CACHE_TTL: "60"
    }
  });

  const client = new Client(
    {
      name: "mcp-inspector-test",
      version: "1.0.0"
    },
    {
      capabilities: {}
    }
  );

  await client.connect(transport);

  return { client };
}

describe.skipIf(!serverBuilt)("MCP SDK Client Integration - screeps-wiki-mcp", () => {
  let client: Client | null = null;

  afterEach(async () => {
    // Clean up client connection after each test
    if (client) {
      try {
        await client.close();
      } catch {
        // Ignore close errors
      }
      client = null;
    }
  });

  describe("tools/list", () => {
    it("should list all available tools via MCP SDK", async () => {
      const connection = await createMCPClient();
      client = connection.client;

      const result = await client.request({ method: "tools/list" }, ListToolsResultSchema);

      expect(result).toBeDefined();
      expect(result.tools).toBeInstanceOf(Array);

      // Should contain expected tools
      const toolNames = result.tools.map(t => t.name);
      expect(toolNames).toContain("screeps_wiki_search");
      expect(toolNames).toContain("screeps_wiki_get_article");
      expect(toolNames).toContain("screeps_wiki_list_categories");
      expect(toolNames).toContain("screeps_wiki_get_table");

      // Each tool should have required properties
      result.tools.forEach(tool => {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
      });
    });
  });

  describe("resources/list", () => {
    it("should list all available resources via MCP SDK", async () => {
      const connection = await createMCPClient();
      client = connection.client;

      const result = await client.request({ method: "resources/list" }, ListResourcesResultSchema);

      expect(result).toBeDefined();
      expect(result.resources).toBeInstanceOf(Array);

      // Should contain screeps-wiki:// URI scheme resources
      const hasWikiResources = result.resources.some(r => r.uri.startsWith("screeps-wiki://"));
      expect(hasWikiResources).toBe(true);

      // Each resource should have required properties
      result.resources.forEach(resource => {
        expect(resource.uri).toBeTruthy();
        expect(resource.name).toBeTruthy();
      });
    });
  });

  describe("Server protocol compliance", () => {
    it("should successfully establish MCP connection", async () => {
      const connection = await createMCPClient();
      client = connection.client;

      // If we got here without errors, the connection was established
      expect(client).toBeDefined();
    });

    it("should have proper tool schemas", async () => {
      const connection = await createMCPClient();
      client = connection.client;

      const result = await client.request({ method: "tools/list" }, ListToolsResultSchema);

      // Check specific tool schemas
      const searchTool = result.tools.find(t => t.name === "screeps_wiki_search");
      expect(searchTool).toBeDefined();
      expect(searchTool?.description).toBeTruthy();
      expect(searchTool?.inputSchema).toBeDefined();

      const getArticleTool = result.tools.find(t => t.name === "screeps_wiki_get_article");
      expect(getArticleTool).toBeDefined();
      expect(getArticleTool?.description).toBeTruthy();
      expect(getArticleTool?.inputSchema).toBeDefined();
    });
  });
});
