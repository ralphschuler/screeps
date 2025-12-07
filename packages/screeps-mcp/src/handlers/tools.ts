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

  shardInfo: z.object({})
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
