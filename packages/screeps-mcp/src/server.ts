#!/usr/bin/env node
/**
 * Screeps MCP Server
 *
 * Model Context Protocol server integration for Screeps bot development.
 * Exposes Screeps game data, memory, and operations via MCP protocol.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { ScreepsClient } from "./screeps/client.js";
import type { MCPServerConfig } from "./types.js";
import {
  getRoomsResource,
  getCreepsResource,
  getSpawnsResource,
  getMemoryResource,
  getStatsResource,
  listResources
} from "./handlers/resources.js";
import { handleConsole, handleMemoryGet, handleMemorySet, handleStats, toolSchemas } from "./handlers/tools.js";

/**
 * Create and configure the MCP server for Screeps integration.
 *
 * This factory function creates a configured MCP server instance that:
 * - Exposes Screeps game resources (rooms, creeps, spawns, memory, stats)
 * - Provides tools for console commands and memory operations
 * - Handles lazy connection initialization to the Screeps API
 *
 * @param config - Server configuration including name, version, and Screeps credentials
 * @returns Configured MCP Server instance ready for connection
 *
 * @example
 * ```typescript
 * const config: MCPServerConfig = {
 *   name: "screeps-mcp",
 *   version: "0.1.0",
 *   screeps: {
 *     token: process.env.SCREEPS_TOKEN,
 *     host: "screeps.com",
 *     shard: "shard3"
 *   }
 * };
 *
 * const server = createMCPServer(config);
 * await server.connect(new StdioServerTransport());
 * ```
 */
export function createMCPServer(config: MCPServerConfig) {
  const server = new McpServer(
    {
      name: config.name,
      version: config.version
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );

  // Initialize Screeps client
  const client = new ScreepsClient(config.screeps);
  let clientConnected = false;

  // Lazy connection initialization
  const ensureConnected = async () => {
    if (!clientConnected) {
      await client.connect();
      clientConnected = true;
    }
  };

  // Register resources using the SDK ResourceTemplate API
  const resourceEntries = listResources();
  for (const resource of resourceEntries) {
    const template = new ResourceTemplate(resource.uri, {
      list: async () => ({
        resources: [
          {
            uri: resource.uri,
            name: resource.name,
            description: resource.description,
            mimeType: "application/json"
          }
        ]
      })
    });

    server.registerResource(
      resource.name,
      template,
      {
        title: resource.name,
        description: resource.description,
        mimeType: "application/json"
      },
      async uri => {
        await ensureConnected();
        let content: string;

        if (uri.href === "screeps://game/rooms") {
          content = await getRoomsResource(client);
        } else if (uri.href === "screeps://game/creeps") {
          content = await getCreepsResource(client);
        } else if (uri.href === "screeps://game/spawns") {
          content = await getSpawnsResource(client);
        } else if (uri.href === "screeps://memory") {
          content = await getMemoryResource(client);
        } else if (uri.href === "screeps://stats") {
          content = await getStatsResource(client);
        } else {
          throw new Error(`Unknown resource: ${uri.href}`);
        }

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: content
            }
          ]
        };
      }
    );
  }

  // Register tools using SDK helper (explicit to satisfy typing)
  server.registerTool(
    "screeps_console",
    {
      title: "screeps_console",
      description: "Execute console commands in Screeps",
      inputSchema: toolSchemas.console as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.console.parse(args);
      return await handleConsole(client, validated);
    }
  );

  server.registerTool(
    "screeps_memory_get",
    {
      title: "screeps_memory_get",
      description: "Read Memory objects from Screeps",
      inputSchema: toolSchemas.memoryGet as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.memoryGet.parse(args);
      return await handleMemoryGet(client, validated);
    }
  );

  server.registerTool(
    "screeps_memory_set",
    {
      title: "screeps_memory_set",
      description: "Update Memory in Screeps (with safety checks)",
      inputSchema: toolSchemas.memorySet as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.memorySet.parse(args);
      return await handleMemorySet(client, validated);
    }
  );

  server.registerTool(
    "screeps_stats",
    {
      title: "screeps_stats",
      description: "Query performance metrics from Screeps",
      inputSchema: toolSchemas.stats as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleStats(client);
    }
  );

  return server;
}

/**
 * Main function to start the MCP server.
 *
 * Loads configuration from environment variables and starts the server with
 * stdio transport for communication with MCP clients.
 *
 * Required environment variables:
 * - `SCREEPS_TOKEN` or `SCREEPS_EMAIL` + `SCREEPS_PASSWORD`: Authentication
 *
 * Optional environment variables:
 * - `SCREEPS_HOST`: Server hostname (default: screeps.com)
 * - `SCREEPS_PORT`: Server port (default: 443)
 * - `SCREEPS_PROTOCOL`: Protocol (default: https)
 * - `SCREEPS_SHARD`: Target shard (default: shard3)
 */
async function main() {
  // Load configuration from environment variables
  const config: MCPServerConfig = {
    name: "screeps-mcp",
    version: "0.1.0",
    screeps: {
      token: process.env.SCREEPS_TOKEN,
      email: process.env.SCREEPS_EMAIL,
      password: process.env.SCREEPS_PASSWORD,
      host: process.env.SCREEPS_HOST ?? "screeps.com",
      port: process.env.SCREEPS_PORT ? parseInt(process.env.SCREEPS_PORT) : 443,
      protocol: (process.env.SCREEPS_PROTOCOL as "http" | "https") ?? "https",
      shard: process.env.SCREEPS_SHARD ?? "shard3"
    }
  };

  const server = createMCPServer(config);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

// Run server if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

export { MCPServerConfig, ScreepsClient };
