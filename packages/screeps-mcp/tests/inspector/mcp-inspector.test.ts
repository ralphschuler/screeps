/**
 * MCP SDK Client integration tests for screeps-mcp server
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

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, ListResourcesResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "../..");
const serverPath = resolve(packageRoot, "dist/server.js");

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
      // Provide mock credentials for testing
      SCREEPS_TOKEN: "test-token-for-inspector",
      SCREEPS_HOST: "localhost",
      SCREEPS_SHARD: "shard0"
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

describe("MCP SDK Client Integration - screeps-mcp", () => {
  let client: Client | null = null;

  beforeAll(async () => {
    // Ensure the server is built
    if (!existsSync(serverPath)) {
      throw new Error(`Server not built. Run 'npm run build' in ${packageRoot} first.`);
    }
  });

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
      expect(toolNames).toContain("screeps_console");
      expect(toolNames).toContain("screeps_memory_get");
      expect(toolNames).toContain("screeps_memory_set");
      expect(toolNames).toContain("screeps_stats");

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

      // Should contain screeps:// URI scheme resources
      const hasScreepsResources = result.resources.some(r => r.uri.startsWith("screeps://"));
      expect(hasScreepsResources).toBe(true);

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
      const consoleTool = result.tools.find(t => t.name === "screeps_console");
      expect(consoleTool).toBeDefined();
      expect(consoleTool?.description).toBeTruthy();
      expect(consoleTool?.inputSchema).toBeDefined();

      const memoryGetTool = result.tools.find(t => t.name === "screeps_memory_get");
      expect(memoryGetTool).toBeDefined();
      expect(memoryGetTool?.description).toBeTruthy();
      expect(memoryGetTool?.inputSchema).toBeDefined();
    });
  });
});
