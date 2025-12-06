#!/usr/bin/env node
/**
 * Screeps Wiki MCP Server
 *
 * Model Context Protocol server for accessing the Screeps community wiki
 * at wiki.screepspl.us. Provides search, article retrieval, category
 * browsing, and table extraction capabilities.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { MCPServerConfig } from "./types.js";
import { listResources, handleResourceRead } from "./handlers/resources.js";
import { handleSearch, handleGetArticle, handleListCategories, handleGetTable, toolSchemas } from "./handlers/tools.js";
import { configureCaches } from "./wiki/cache.js";

/**
 * Create and configure the MCP server
 */
export function createMCPServer(config: MCPServerConfig) {
  configureCaches(config.cacheConfig);

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
    "screeps_wiki_search",
    {
      title: "screeps_wiki_search",
      description: "Search the Screeps community wiki"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.search.parse(args);
      return (await handleSearch(validated)) as any;
    }
  );

  server.registerTool(
    "screeps_wiki_get_article",
    {
      title: "screeps_wiki_get_article",
      description: "Fetch a wiki article by title"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getArticle.parse(args);
      return (await handleGetArticle(validated)) as any;
    }
  );

  server.registerTool(
    "screeps_wiki_list_categories",
    {
      title: "screeps_wiki_list_categories",
      description: "List wiki categories"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.listCategories.parse(args);
      return (await handleListCategories(validated)) as any;
    }
  );

  server.registerTool(
    "screeps_wiki_get_table",
    {
      title: "screeps_wiki_get_table",
      description: "Extract table data from a wiki article"
    },
    async (args: unknown, _extra?: unknown) => {
      const validated = toolSchemas.getTable.parse(args);
      return (await handleGetTable(validated)) as any;
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
    name: "screeps-wiki-mcp",
    version: "0.1.0",
    cacheConfig: {
      ttl: process.env.WIKI_CACHE_TTL ? parseInt(process.env.WIKI_CACHE_TTL) : 3600
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
