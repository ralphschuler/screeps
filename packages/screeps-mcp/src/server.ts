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
import {
  handleConsole,
  handleMemoryGet,
  handleMemorySet,
  handleStats,
  handleSegmentGet,
  handleSegmentSet,
  handleGameTime,
  handleRoomTerrain,
  handleRoomObjects,
  handleRoomStatus,
  handleMarketOrders,
  handleMyMarketOrders,
  handleUserInfo,
  handleShardInfo,
  handleUserWorldStatus,
  handleUserWorldStartRoom,
  handleUserRooms,
  handleMarketStats,
  handleLeaderboardSeasons,
  handleLeaderboardFind,
  handleLeaderboardList,
  handleExperimentalPvp,
  handleExperimentalNukes,
  handleUserMoneyHistory,
  handleRoomDecorations,
  handleUserOverview,
  handleRespawnProhibitedRooms,
  toolSchemas
} from "./handlers/tools.js";

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

  server.registerTool(
    "screeps_segment_get",
    {
      title: "screeps_segment_get",
      description: "Read memory segment from Screeps (0-99)",
      inputSchema: toolSchemas.segmentGet as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.segmentGet.parse(args);
      return await handleSegmentGet(client, validated);
    }
  );

  server.registerTool(
    "screeps_segment_set",
    {
      title: "screeps_segment_set",
      description: "Write memory segment to Screeps (max 100KB)",
      inputSchema: toolSchemas.segmentSet as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.segmentSet.parse(args);
      return await handleSegmentSet(client, validated);
    }
  );

  server.registerTool(
    "screeps_game_time",
    {
      title: "screeps_game_time",
      description: "Get current game time/tick",
      inputSchema: toolSchemas.gameTime as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleGameTime(client);
    }
  );

  server.registerTool(
    "screeps_room_terrain",
    {
      title: "screeps_room_terrain",
      description: "Get room terrain data",
      inputSchema: toolSchemas.roomTerrain as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.roomTerrain.parse(args);
      return await handleRoomTerrain(client, validated);
    }
  );

  server.registerTool(
    "screeps_room_objects",
    {
      title: "screeps_room_objects",
      description: "Get all objects in a room",
      inputSchema: toolSchemas.roomObjects as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.roomObjects.parse(args);
      return await handleRoomObjects(client, validated);
    }
  );

  server.registerTool(
    "screeps_room_status",
    {
      title: "screeps_room_status",
      description: "Get room status (owner, reservation, etc.)",
      inputSchema: toolSchemas.roomStatus as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.roomStatus.parse(args);
      return await handleRoomStatus(client, validated);
    }
  );

  server.registerTool(
    "screeps_market_orders",
    {
      title: "screeps_market_orders",
      description: "Get market orders, optionally filtered by resource type",
      inputSchema: toolSchemas.marketOrders as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.marketOrders.parse(args);
      return await handleMarketOrders(client, validated);
    }
  );

  server.registerTool(
    "screeps_my_market_orders",
    {
      title: "screeps_my_market_orders",
      description: "Get your own market orders",
      inputSchema: toolSchemas.myMarketOrders as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleMyMarketOrders(client);
    }
  );

  server.registerTool(
    "screeps_user_info",
    {
      title: "screeps_user_info",
      description: "Get user information by username",
      inputSchema: toolSchemas.userInfo as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.userInfo.parse(args);
      return await handleUserInfo(client, validated);
    }
  );

  server.registerTool(
    "screeps_shard_info",
    {
      title: "screeps_shard_info",
      description: "Get information about all shards",
      inputSchema: toolSchemas.shardInfo as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleShardInfo(client);
    }
  );

  server.registerTool(
    "screeps_user_world_status",
    {
      title: "screeps_user_world_status",
      description: "Get user world status for a specific shard",
      inputSchema: toolSchemas.userWorldStatus as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.userWorldStatus.parse(args);
      return await handleUserWorldStatus(client, validated);
    }
  );

  server.registerTool(
    "screeps_user_world_start_room",
    {
      title: "screeps_user_world_start_room",
      description: "Get user start room information",
      inputSchema: toolSchemas.userWorldStartRoom as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleUserWorldStartRoom(client);
    }
  );

  server.registerTool(
    "screeps_user_rooms",
    {
      title: "screeps_user_rooms",
      description: "Get rooms owned by a specific user",
      inputSchema: toolSchemas.userRooms as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.userRooms.parse(args);
      return await handleUserRooms(client, validated);
    }
  );

  server.registerTool(
    "screeps_market_stats",
    {
      title: "screeps_market_stats",
      description: "Get market statistics for a resource type",
      inputSchema: toolSchemas.marketStats as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.marketStats.parse(args);
      return await handleMarketStats(client, validated);
    }
  );

  server.registerTool(
    "screeps_leaderboard_seasons",
    {
      title: "screeps_leaderboard_seasons",
      description: "Get list of available leaderboard seasons",
      inputSchema: toolSchemas.leaderboardSeasons as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleLeaderboardSeasons(client);
    }
  );

  server.registerTool(
    "screeps_leaderboard_find",
    {
      title: "screeps_leaderboard_find",
      description: "Find a user in the leaderboard",
      inputSchema: toolSchemas.leaderboardFind as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.leaderboardFind.parse(args);
      return await handleLeaderboardFind(client, validated);
    }
  );

  server.registerTool(
    "screeps_leaderboard_list",
    {
      title: "screeps_leaderboard_list",
      description: "Get leaderboard list with pagination",
      inputSchema: toolSchemas.leaderboardList as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.leaderboardList.parse(args);
      return await handleLeaderboardList(client, validated);
    }
  );

  server.registerTool(
    "screeps_experimental_pvp",
    {
      title: "screeps_experimental_pvp",
      description: "Get experimental PVP data for different time intervals",
      inputSchema: toolSchemas.experimentalPvp as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.experimentalPvp.parse(args);
      return await handleExperimentalPvp(client, validated);
    }
  );

  server.registerTool(
    "screeps_experimental_nukes",
    {
      title: "screeps_experimental_nukes",
      description: "Get experimental nukes data for different time intervals",
      inputSchema: toolSchemas.experimentalNukes as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.experimentalNukes.parse(args);
      return await handleExperimentalNukes(client, validated);
    }
  );

  server.registerTool(
    "screeps_user_money_history",
    {
      title: "screeps_user_money_history",
      description: "Get user money/credit transaction history",
      inputSchema: toolSchemas.userMoneyHistory as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.userMoneyHistory.parse(args);
      return await handleUserMoneyHistory(client, validated);
    }
  );

  server.registerTool(
    "screeps_room_decorations",
    {
      title: "screeps_room_decorations",
      description: "Get room decorations (visual customizations)",
      inputSchema: toolSchemas.roomDecorations as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.roomDecorations.parse(args);
      return await handleRoomDecorations(client, validated);
    }
  );

  server.registerTool(
    "screeps_user_overview",
    {
      title: "screeps_user_overview",
      description: "Get user overview with statistics",
      inputSchema: toolSchemas.userOverview as unknown as any
    },
    async (args: unknown) => {
      await ensureConnected();
      const validated = toolSchemas.userOverview.parse(args);
      return await handleUserOverview(client, validated);
    }
  );

  server.registerTool(
    "screeps_respawn_prohibited_rooms",
    {
      title: "screeps_respawn_prohibited_rooms",
      description: "Get list of rooms where respawning is prohibited",
      inputSchema: toolSchemas.respawnProhibitedRooms as unknown as any
    },
    async () => {
      await ensureConnected();
      return await handleRespawnProhibitedRooms(client);
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
