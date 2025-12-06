#!/usr/bin/env node
/**
 * Screeps Documentation MCP Server
 *
 * Model Context Protocol server for browsing and querying Screeps documentation.
 * Provides access to API reference and game mechanics documentation.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { MCPServerConfig } from "./types.js";
import { listResources, handleResourceRead } from "./handlers/resources.js";
import {
  handleSearch,
  handleGetAPI,
  handleGetMechanics,
  handleListAPIs,
  handleListMechanics,
  toolSchemas
} from "./handlers/tools.js";
import { configureCache } from "./scraper/index-builder.js";

/**
 * Create and configure the MCP server
 */
export function createMCPServer(config: MCPServerConfig) {
  // Apply cache configuration before handlers start using the index
  configureCache(config.cacheConfig);

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
        const content = await handleResourceRead(uri.href);
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

  // Tools
  server.registerTool(
    "screeps_docs_search",
    {
      title: "screeps_docs_search",
      description: "Search Screeps docs"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.search.parse(args);
      const result = await handleSearch(validated);
      return {
        ...result,
        isError: false
      };
    }
  );

  server.registerTool(
    "screeps_docs_get_api",
    {
      title: "screeps_docs_get_api",
      description: "Get API object documentation"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getAPI.parse(args);
      const result = await handleGetAPI(validated);
      return {
        ...result,
        isError: false
      };
    }
  );

  server.registerTool(
    "screeps_docs_get_mechanics",
    {
      title: "screeps_docs_get_mechanics",
      description: "Get game mechanics documentation"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getMechanics.parse(args);
      const result = await handleGetMechanics(validated);
      return {
        ...result,
        isError: false
      };
    }
  );

  server.registerTool(
    "screeps_docs_list_apis",
    {
      title: "screeps_docs_list_apis",
      description: "List Screeps API objects"
    },
    async (_args: unknown, _extra?: unknown) => {
      const result = await handleListAPIs();
      return {
        ...result,
        isError: false
      };
    }
  );

  server.registerTool(
    "screeps_docs_list_mechanics",
    {
      title: "screeps_docs_list_mechanics",
      description: "List Screeps mechanics topics"
    },
    async (args: unknown, _extra?: unknown) => {
      toolSchemas.listMechanics.parse(args);
      const result = await handleListMechanics();
      return {
        ...result,
        isError: false
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
    name: "screeps-docs-mcp",
    version: "0.1.0",
    cacheConfig: {
      ttl: process.env.DOCS_CACHE_TTL ? parseInt(process.env.DOCS_CACHE_TTL) : 3600
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

export { MCPServerConfig };
