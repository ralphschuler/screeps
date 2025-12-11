#!/usr/bin/env node
/**
 * Screeps TypeScript MCP Server
 *
 * Model Context Protocol server for browsing and querying TypeScript type definitions
 * from the typed-screeps library (https://github.com/screepers/typed-screeps).
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { MCPServerConfig } from "./types.js";
import { listResources, handleResourceRead } from "./handlers/resources.js";
import {
  handleSearch,
  handleGetType,
  handleListTypes,
  handleGetRelated,
  handleGetByFile,
  toolSchemas,
} from "./handlers/tools.js";
import { configureCache } from "./scraper/index-builder.js";

/**
 * Create and configure the MCP server
 */
export function createMCPServer(config: MCPServerConfig) {
  // Apply cache configuration
  configureCache(config.cacheConfig);

  const server = new McpServer(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Resources
  const resourceEntries = listResources();
  for (const resource of resourceEntries) {
    const template = new ResourceTemplate(resource.uri, {
      list: async () => ({
        resources: [
          {
            uri: resource.uri,
            name: resource.name,
            description: resource.description,
            mimeType: "application/json",
          },
        ],
      }),
    });

    server.registerResource(
      resource.name,
      template,
      {
        title: resource.name,
        description: resource.description,
        mimeType: "application/json",
      },
      async uri => {
        const content = await handleResourceRead(uri.href);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: content,
            },
          ],
        };
      }
    );
  }

  // TODO: Missing inputSchema - Tool registrations missing inputSchema property
  // Details: All registerTool calls are missing the inputSchema property which causes validation errors
  // Encountered: When calling any screeps-typescript-mcp tool
  // Suggested Fix: Add inputSchema to all registerTool calls like this:
  // {
  //   title: "screeps_types_search",
  //   description: "Search TypeScript type definitions from typed-screeps by name or keyword",
  //   inputSchema: toolSchemas.search as unknown as any
  // }
  // See screeps-mcp/src/server.ts for correct examples
  // Tool: Search types
  server.registerTool(
    "screeps_types_search",
    {
      title: "screeps_types_search",
      description: "Search TypeScript type definitions from typed-screeps by name or keyword",
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.search.parse(args);
      const result = await handleSearch(validated);
      return {
        ...result,
        isError: false,
      };
    }
  );

  // Same missing inputSchema issue for all tool registrations below
  // Tool: Get specific type
  server.registerTool(
    "screeps_types_get",
    {
      title: "screeps_types_get",
      description: "Get full TypeScript type definition by name",
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getType.parse(args);
      const result = await handleGetType(validated);
      return {
        ...result,
        isError: false,
      };
    }
  );

  // Tool: List all types
  server.registerTool(
    "screeps_types_list",
    {
      title: "screeps_types_list",
      description: "List all available TypeScript types with optional filtering",
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.listTypes.parse(args);
      const result = await handleListTypes(validated);
      return {
        ...result,
        isError: false,
      };
    }
  );

  // Tool: Get related types
  server.registerTool(
    "screeps_types_related",
    {
      title: "screeps_types_related",
      description: "Get types related to a specific type (extended, implemented, or referenced)",
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getRelated.parse(args);
      const result = await handleGetRelated(validated);
      return {
        ...result,
        isError: false,
      };
    }
  );

  // Tool: Get types by file
  server.registerTool(
    "screeps_types_by_file",
    {
      title: "screeps_types_by_file",
      description: "Get all TypeScript types defined in a specific source file",
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getByFile.parse(args);
      const result = await handleGetByFile(validated);
      return {
        ...result,
        isError: false,
      };
    }
  );

  return server;
}

/**
 * Main function to start the server
 */
async function main() {
  // Load configuration from environment variables
  const config: MCPServerConfig = {
    name: "screeps-typescript-mcp",
    version: "0.1.0",
    cacheConfig: {
      ttl: process.env.TYPES_CACHE_TTL ? parseInt(process.env.TYPES_CACHE_TTL) : 3600,
    },
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

export { MCPServerConfig };
