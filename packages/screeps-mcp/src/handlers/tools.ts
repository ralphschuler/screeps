/**
 * MCP Tool handlers for Screeps operations
 */

import { z } from "zod";
import type { ScreepsClient } from "../screeps/client.js";

/**
 * Tool schemas
 */
export const toolSchemas = {
  console: z.object({
    command: z.string().describe("Console command to execute")
  }),

  memoryGet: z.object({
    path: z.string().describe("Memory path to read (e.g., 'rooms.W1N1')")
  }),

  memorySet: z.object({
    path: z.string().describe("Memory path to write (e.g., 'myData.config')"),
    value: z.unknown().describe("Value to set at the path")
  }),

  stats: z.object({}),

  segmentGet: z.object({
    segment: z.number().int().min(0).max(99).describe("Memory segment number (0-99)")
  }),

  segmentSet: z.object({
    segment: z.number().int().min(0).max(99).describe("Memory segment number (0-99)"),
    data: z.string().describe("Segment data (max 100KB)")
  }),

  gameTime: z.object({}),

  roomTerrain: z.object({
    room: z.string().describe("Room name (e.g., 'W1N1')")
  }),

  roomObjects: z.object({
    room: z.string().describe("Room name (e.g., 'W1N1')")
  }),

  roomStatus: z.object({
    room: z.string().describe("Room name (e.g., 'W1N1')")
  }),

  marketOrders: z.object({
    resourceType: z.string().optional().describe("Resource type filter (optional)")
  }),

  myMarketOrders: z.object({}),

  userInfo: z.object({
    username: z.string().describe("Username to look up")
  }),

  shardInfo: z.object({}),

  userWorldStatus: z.object({
    shard: z.string().optional().describe("Shard name (optional, uses configured shard if not provided)")
  }),

  userWorldStartRoom: z.object({}),

  userRooms: z.object({
    userId: z.string().describe("User ID to get rooms for")
  }),

  marketStats: z.object({
    resourceType: z.string().describe("Resource type (e.g., 'energy', 'H')"),
    shard: z.string().optional().describe("Shard name (optional, uses configured shard if not provided)")
  }),

  leaderboardSeasons: z.object({}),

  leaderboardFind: z.object({
    username: z.string().describe("Username to find in leaderboard"),
    season: z.string().optional().describe("Season ID (optional)"),
    mode: z.string().optional().describe("Leaderboard mode (optional)")
  }),

  leaderboardList: z.object({
    season: z.string().optional().describe("Season ID (optional)"),
    limit: z.number().int().min(1).max(100).optional().describe("Number of results to return (default: 20)"),
    offset: z.number().int().min(0).optional().describe("Offset for pagination (default: 0)"),
    mode: z.string().optional().describe("Leaderboard mode (optional)")
  }),

  experimentalPvp: z.object({
    interval: z.number().int().optional().describe("Interval: 8 for 1 hour, 180 for 24 hours, 1440 for 7 days (default: 8)")
  }),

  experimentalNukes: z.object({
    interval: z.number().int().optional().describe("Interval: 8 for 1 hour, 180 for 24 hours, 1440 for 7 days (default: 8)")
  }),

  userMoneyHistory: z.object({
    page: z.number().int().min(0).optional().describe("Page number for pagination (default: 0)")
  }),

  roomDecorations: z.object({
    room: z.string().describe("Room name (e.g., 'W1N1')"),
    shard: z.string().optional().describe("Shard name (optional, uses configured shard if not provided)")
  }),

  userOverview: z.object({
    interval: z.number().int().optional().describe("Interval: 8 for 1 hour, 180 for 24 hours, 1440 for 7 days (default: 8)"),
    statName: z.string().optional().describe("Stat name filter (optional)")
  }),

  respawnProhibitedRooms: z.object({})
};

/**
 * Tool definitions
 */
export function listTools() {
  return [
    {
      name: "screeps_console",
      description: "Execute console commands in Screeps",
      inputSchema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "Console command to execute"
          }
        },
        required: ["command"]
      }
    },
    {
      name: "screeps_memory_get",
      description: "Read Memory objects from Screeps",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Memory path to read (e.g., 'rooms.W1N1')"
          }
        },
        required: ["path"]
      }
    },
    {
      name: "screeps_memory_set",
      description: "Update Memory in Screeps (with safety checks)",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Memory path to write (e.g., 'myData.config')"
          },
          value: {
            description: "Value to set at the path (any JSON-serializable value)"
          }
        },
        required: ["path", "value"]
      }
    },
    {
      name: "screeps_stats",
      description: "Query performance metrics from Screeps",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "screeps_segment_get",
      description: "Read memory segment from Screeps (0-99)",
      inputSchema: {
        type: "object",
        properties: {
          segment: {
            type: "number",
            description: "Memory segment number (0-99)"
          }
        },
        required: ["segment"]
      }
    },
    {
      name: "screeps_segment_set",
      description: "Write memory segment to Screeps (max 100KB)",
      inputSchema: {
        type: "object",
        properties: {
          segment: {
            type: "number",
            description: "Memory segment number (0-99)"
          },
          data: {
            type: "string",
            description: "Segment data (max 100KB)"
          }
        },
        required: ["segment", "data"]
      }
    },
    {
      name: "screeps_game_time",
      description: "Get current game time/tick",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "screeps_room_terrain",
      description: "Get room terrain data",
      inputSchema: {
        type: "object",
        properties: {
          room: {
            type: "string",
            description: "Room name (e.g., 'W1N1')"
          }
        },
        required: ["room"]
      }
    },
    {
      name: "screeps_room_objects",
      description: "Get all objects in a room",
      inputSchema: {
        type: "object",
        properties: {
          room: {
            type: "string",
            description: "Room name (e.g., 'W1N1')"
          }
        },
        required: ["room"]
      }
    },
    {
      name: "screeps_room_status",
      description: "Get room status (owner, reservation, etc.)",
      inputSchema: {
        type: "object",
        properties: {
          room: {
            type: "string",
            description: "Room name (e.g., 'W1N1')"
          }
        },
        required: ["room"]
      }
    },
    {
      name: "screeps_market_orders",
      description: "Get market orders, optionally filtered by resource type",
      inputSchema: {
        type: "object",
        properties: {
          resourceType: {
            type: "string",
            description: "Resource type filter (optional)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_my_market_orders",
      description: "Get your own market orders",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "screeps_user_info",
      description: "Get user information by username",
      inputSchema: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "Username to look up"
          }
        },
        required: ["username"]
      }
    },
    {
      name: "screeps_shard_info",
      description: "Get information about all shards",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "screeps_user_world_status",
      description: "Get user world status for a specific shard",
      inputSchema: {
        type: "object",
        properties: {
          shard: {
            type: "string",
            description: "Shard name (optional, uses configured shard if not provided)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_user_world_start_room",
      description: "Get user start room information",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "screeps_user_rooms",
      description: "Get rooms owned by a specific user",
      inputSchema: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "User ID to get rooms for"
          }
        },
        required: ["userId"]
      }
    },
    {
      name: "screeps_market_stats",
      description: "Get market statistics for a resource type",
      inputSchema: {
        type: "object",
        properties: {
          resourceType: {
            type: "string",
            description: "Resource type (e.g., 'energy', 'H')"
          },
          shard: {
            type: "string",
            description: "Shard name (optional, uses configured shard if not provided)"
          }
        },
        required: ["resourceType"]
      }
    },
    {
      name: "screeps_leaderboard_seasons",
      description: "Get list of available leaderboard seasons",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "screeps_leaderboard_find",
      description: "Find a user in the leaderboard",
      inputSchema: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "Username to find in leaderboard"
          },
          season: {
            type: "string",
            description: "Season ID (optional)"
          },
          mode: {
            type: "string",
            description: "Leaderboard mode (optional)"
          }
        },
        required: ["username"]
      }
    },
    {
      name: "screeps_leaderboard_list",
      description: "Get leaderboard list with pagination",
      inputSchema: {
        type: "object",
        properties: {
          season: {
            type: "string",
            description: "Season ID (optional)"
          },
          limit: {
            type: "number",
            description: "Number of results to return (default: 20, max: 100)"
          },
          offset: {
            type: "number",
            description: "Offset for pagination (default: 0)"
          },
          mode: {
            type: "string",
            description: "Leaderboard mode (optional)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_experimental_pvp",
      description: "Get experimental PVP data for different time intervals",
      inputSchema: {
        type: "object",
        properties: {
          interval: {
            type: "number",
            description: "Interval: 8 for 1 hour, 180 for 24 hours, 1440 for 7 days (default: 8)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_experimental_nukes",
      description: "Get experimental nukes data for different time intervals",
      inputSchema: {
        type: "object",
        properties: {
          interval: {
            type: "number",
            description: "Interval: 8 for 1 hour, 180 for 24 hours, 1440 for 7 days (default: 8)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_user_money_history",
      description: "Get user money/credit transaction history",
      inputSchema: {
        type: "object",
        properties: {
          page: {
            type: "number",
            description: "Page number for pagination (default: 0)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_room_decorations",
      description: "Get room decorations (visual customizations)",
      inputSchema: {
        type: "object",
        properties: {
          room: {
            type: "string",
            description: "Room name (e.g., 'W1N1')"
          },
          shard: {
            type: "string",
            description: "Shard name (optional, uses configured shard if not provided)"
          }
        },
        required: ["room"]
      }
    },
    {
      name: "screeps_user_overview",
      description: "Get user overview with statistics",
      inputSchema: {
        type: "object",
        properties: {
          interval: {
            type: "number",
            description: "Interval: 8 for 1 hour, 180 for 24 hours, 1440 for 7 days (default: 8)"
          },
          statName: {
            type: "string",
            description: "Stat name filter (optional)"
          }
        },
        required: []
      }
    },
    {
      name: "screeps_respawn_prohibited_rooms",
      description: "Get list of rooms where respawning is prohibited",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  ];
}

/**
 * Tool handler: Execute console command
 */
export async function handleConsole(client: ScreepsClient, args: z.infer<typeof toolSchemas.console>) {
  const result = await client.executeConsole(args.command);
  return {
    content: [
      {
        type: "text" as const,
        text:
          result.success && result.output
            ? result.output
            : result.success
              ? "Command sent; output appears in the Screeps in-game console."
              : `Error: ${result.error}`
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get memory
 */
export async function handleMemoryGet(client: ScreepsClient, args: z.infer<typeof toolSchemas.memoryGet>) {
  const result = await client.getMemory(args.path);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Set memory
 */
export async function handleMemorySet(client: ScreepsClient, args: z.infer<typeof toolSchemas.memorySet>) {
  const result = await client.setMemory(args.path, args.value);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get stats
 */
export async function handleStats(client: ScreepsClient) {
  const stats = await client.getStats();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(stats, null, 2)
      }
    ],
    isError: false
  };
}

/**
 * Tool handler: Get segment
 */
export async function handleSegmentGet(client: ScreepsClient, args: z.infer<typeof toolSchemas.segmentGet>) {
  const result = await client.getSegment(args.segment);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Set segment
 */
export async function handleSegmentSet(client: ScreepsClient, args: z.infer<typeof toolSchemas.segmentSet>) {
  const result = await client.setSegment(args.segment, args.data);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get game time
 */
export async function handleGameTime(client: ScreepsClient) {
  const result = await client.getGameTime();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get room terrain
 */
export async function handleRoomTerrain(client: ScreepsClient, args: z.infer<typeof toolSchemas.roomTerrain>) {
  const result = await client.getRoomTerrain(args.room);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get room objects
 */
export async function handleRoomObjects(client: ScreepsClient, args: z.infer<typeof toolSchemas.roomObjects>) {
  const result = await client.getRoomObjects(args.room);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get room status
 */
export async function handleRoomStatus(client: ScreepsClient, args: z.infer<typeof toolSchemas.roomStatus>) {
  const result = await client.getRoomStatus(args.room);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get market orders
 */
export async function handleMarketOrders(client: ScreepsClient, args: z.infer<typeof toolSchemas.marketOrders>) {
  const result = await client.getMarketOrders(args.resourceType);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get my market orders
 */
export async function handleMyMarketOrders(client: ScreepsClient) {
  const result = await client.getMyMarketOrders();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get user info
 */
export async function handleUserInfo(client: ScreepsClient, args: z.infer<typeof toolSchemas.userInfo>) {
  const result = await client.getUserInfo(args.username);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get shard info
 */
export async function handleShardInfo(client: ScreepsClient) {
  const result = await client.getShardInfo();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get user world status
 */
export async function handleUserWorldStatus(client: ScreepsClient, args: z.infer<typeof toolSchemas.userWorldStatus>) {
  const result = await client.getUserWorldStatus(args.shard);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get user world start room
 */
export async function handleUserWorldStartRoom(client: ScreepsClient) {
  const result = await client.getUserWorldStartRoom();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get user rooms
 */
export async function handleUserRooms(client: ScreepsClient, args: z.infer<typeof toolSchemas.userRooms>) {
  const result = await client.getUserRooms(args.userId);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get market stats
 */
export async function handleMarketStats(client: ScreepsClient, args: z.infer<typeof toolSchemas.marketStats>) {
  const result = await client.getMarketStats(args.resourceType, args.shard);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get leaderboard seasons
 */
export async function handleLeaderboardSeasons(client: ScreepsClient) {
  const result = await client.getLeaderboardSeasons();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Find user in leaderboard
 */
export async function handleLeaderboardFind(client: ScreepsClient, args: z.infer<typeof toolSchemas.leaderboardFind>) {
  const result = await client.findInLeaderboard(args.username, args.season, args.mode);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get leaderboard list
 */
export async function handleLeaderboardList(client: ScreepsClient, args: z.infer<typeof toolSchemas.leaderboardList>) {
  const result = await client.getLeaderboardList(args.season, args.limit, args.offset, args.mode);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get experimental PVP data
 */
export async function handleExperimentalPvp(client: ScreepsClient, args: z.infer<typeof toolSchemas.experimentalPvp>) {
  const result = await client.getExperimentalPvp(args.interval);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get experimental nukes data
 */
export async function handleExperimentalNukes(client: ScreepsClient, args: z.infer<typeof toolSchemas.experimentalNukes>) {
  const result = await client.getExperimentalNukes(args.interval);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get user money history
 */
export async function handleUserMoneyHistory(client: ScreepsClient, args: z.infer<typeof toolSchemas.userMoneyHistory>) {
  const result = await client.getUserMoneyHistory(args.page);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get room decorations
 */
export async function handleRoomDecorations(client: ScreepsClient, args: z.infer<typeof toolSchemas.roomDecorations>) {
  const result = await client.getRoomDecorations(args.room, args.shard);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get user overview
 */
export async function handleUserOverview(client: ScreepsClient, args: z.infer<typeof toolSchemas.userOverview>) {
  const result = await client.getUserOverview(args.interval, args.statName);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}

/**
 * Tool handler: Get respawn prohibited rooms
 */
export async function handleRespawnProhibitedRooms(client: ScreepsClient) {
  const result = await client.getRespawnProhibitedRooms();
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ],
    isError: !result.success
  };
}
