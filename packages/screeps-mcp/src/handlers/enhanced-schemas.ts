/**
 * Enhanced Tool Schemas for AI Agent Usability
 * 
 * This file provides enhanced Zod schemas with comprehensive descriptions,
 * examples, and validation rules to improve AI agent understanding and usage.
 */

import { z } from "zod";

/**
 * Room name validation pattern
 * Format: [W|E]<number>[N|S]<number>
 * Examples: W1N1, E5S10, W0N0
 */
const roomNameSchema = z.string()
  .regex(/^[WE]\d+[NS]\d+$/, "Room name must be in format like 'W1N1' or 'E5S10'")
  .describe("Room name in Screeps coordinate format (e.g., 'W1N1', 'E5S10')");

/**
 * Memory path validation
 * Supports dot notation for nested paths
 * Examples: "rooms.W1N1", "config.autoBuild", "stats"
 */
const memoryPathSchema = z.string()
  .min(0)
  .describe("Dot-notation path to memory location (e.g., 'rooms.W1N1.sources', 'config.autoBuild'). Use empty string '' for root Memory object.");

/**
 * Enhanced tool schemas with detailed descriptions and validation
 */
export const enhancedToolSchemas = {
  /**
   * Console command execution
   * Executes JavaScript in the Screeps game environment
   */
  console: z.object({
    command: z.string()
      .min(1, "Command cannot be empty")
      .max(10000, "Command too long (max 10000 characters)")
      .describe(
        "JavaScript command to execute in the Screeps game console. " +
        "Examples: 'Game.time', 'Game.rooms[\"W1N1\"].find(FIND_MY_CREEPS)', " +
        "'Memory.stats = {cpu: Game.cpu.getUsed()}'. " +
        "Commands execute in the game environment and can access Game, Memory, and all game objects. " +
        "Responses are retrieved via WebSocket and may take 1-2 game ticks."
      )
  }),

  /**
   * Memory read operation
   * Retrieves data from bot's Memory object
   */
  memoryGet: z.object({
    path: memoryPathSchema
      .describe(
        "Path to memory location using dot notation. " +
        "Examples: 'rooms.W1N1' reads Memory.rooms.W1N1, " +
        "'config' reads Memory.config, " +
        "'' (empty string) reads entire Memory object. " +
        "Returns undefined if path doesn't exist."
      )
  }),

  /**
   * Memory write operation
   * Updates bot's Memory object at specified path
   */
  memorySet: z.object({
    path: memoryPathSchema
      .describe(
        "Path where value will be written using dot notation. " +
        "Examples: 'config.autoBuild', 'rooms.W1N1.level'. " +
        "Creates intermediate objects if they don't exist. " +
        "WARNING: Overwrites existing data at this path."
      ),
    value: z.unknown()
      .describe(
        "Value to store at the specified path. Must be JSON-serializable. " +
        "Can be any type: string, number, boolean, object, array, null. " +
        "Examples: true, 42, \"text\", {key: \"value\"}, [1,2,3]. " +
        "Note: Memory is limited to 2MB per shard."
      )
  }),

  /**
   * Performance statistics
   * Retrieves CPU usage and performance metrics
   */
  stats: z.object({}).describe(
    "Retrieves performance metrics including CPU usage, memory usage, and game statistics. " +
    "No parameters required. Returns current tick statistics."
  ),

  /**
   * Memory segment read
   * Reads one of 100 available memory segments (0-99)
   */
  segmentGet: z.object({
    segment: z.number()
      .int("Segment must be an integer")
      .min(0, "Segment number must be >= 0")
      .max(99, "Segment number must be <= 99")
      .describe(
        "Memory segment number (0-99) to read. " +
        "Each segment can store up to 100KB of string data. " +
        "Segments are persistent across global resets. " +
        "Note: Segment must be activated in bot code before reading."
      )
  }),

  /**
   * Memory segment write
   * Writes data to a memory segment
   */
  segmentSet: z.object({
    segment: z.number()
      .int("Segment must be an integer")
      .min(0, "Segment number must be >= 0")
      .max(99, "Segment number must be <= 99")
      .describe("Memory segment number (0-99) to write to."),
    data: z.string()
      .max(102400, "Segment data exceeds 100KB limit (102400 bytes)")
      .describe(
        "String data to store in the segment (maximum 100KB). " +
        "For objects, use JSON.stringify() before writing. " +
        "WARNING: Overwrites entire segment content."
      )
  }),

  /**
   * Current game time
   * Returns the current game tick number
   */
  gameTime: z.object({}).describe(
    "Retrieves the current game tick/time. " +
    "Returns a number representing the current game tick. " +
    "Useful for timestamps, synchronization, and performance measurement."
  ),

  /**
   * Room terrain data
   * Returns static terrain information (walls, plains, swamps)
   */
  roomTerrain: z.object({
    room: roomNameSchema
      .describe(
        "Room name to get terrain for. " +
        "Examples: 'W1N1', 'E5S10', 'W0N0'. " +
        "Returns 50x50 grid of terrain data where: " +
        "0 = plain, 1 = wall, 2 = swamp. " +
        "Terrain is static and never changes (safe to cache)."
      )
  }),

  /**
   * Room objects
   * Returns all game objects in a room
   */
  roomObjects: z.object({
    room: roomNameSchema
      .describe(
        "Room name to get objects from. " +
        "Returns all objects including: creeps (owned and hostile), " +
        "structures (spawns, extensions, towers, etc.), resources, " +
        "construction sites, tombstones, and ruins. " +
        "Data is current as of the last game tick. " +
        "Note: Can return large datasets for busy rooms."
      )
  }),

  /**
   * Room status
   * Returns ownership and reservation information
   */
  roomStatus: z.object({
    room: roomNameSchema
      .describe(
        "Room name to check status for. " +
        "Returns ownership info (owner username, level), " +
        "reservation status, room type (normal/novice/respawn), " +
        "and sign information. " +
        "Useful for expansion planning and threat assessment."
      )
  }),

  /**
   * Market orders
   * Returns active market orders, optionally filtered
   */
  marketOrders: z.object({
    resourceType: z.string()
      .optional()
      .describe(
        "Optional filter by resource type. " +
        "Examples: 'energy', 'H', 'O', 'XGHO2', 'power'. " +
        "If omitted, returns all active orders. " +
        "Returns both buy and sell orders with price, amount, and location."
      )
  }),

  /**
   * User's market orders
   * Returns your own active market orders
   */
  myMarketOrders: z.object({}).describe(
    "Retrieves all your active market orders (both buy and sell). " +
    "Returns order details including resource type, price, amount remaining, " +
    "and room location. No parameters required."
  ),

  /**
   * User information lookup
   * Gets public information about a user
   */
  userInfo: z.object({
    username: z.string()
      .min(1, "Username cannot be empty")
      .describe(
        "Username to look up (case-sensitive). " +
        "Returns user ID, badge, GCL, power level, and other public profile data. " +
        "Useful for player research and alliance verification."
      )
  }),

  /**
   * Shard information
   * Returns data about all game shards
   */
  shardInfo: z.object({}).describe(
    "Retrieves information about all available shards. " +
    "Returns shard names, tick rates, and status. " +
    "Useful for multi-shard coordination and expansion planning."
  ),

  /**
   * User world status
   * Returns your spawn and room status on a shard
   */
  userWorldStatus: z.object({
    shard: z.string()
      .optional()
      .describe(
        "Shard name to check status on (e.g., 'shard0', 'shard3'). " +
        "If omitted, uses the configured shard from environment variables. " +
        "Returns whether you have spawns, number of rooms, and respawn status."
      )
  }),

  /**
   * Recommended start room
   * Gets optimal starting room for respawn
   */
  userWorldStartRoom: z.object({}).describe(
    "Retrieves recommended starting room for respawn. " +
    "Returns room name with good starting conditions (sources, controller access). " +
    "Useful for automated respawn logic."
  ),

  /**
   * User's rooms
   * Lists all rooms owned by a user
   */
  userRooms: z.object({
    userId: z.string()
      .min(1, "User ID cannot be empty")
      .regex(/^[a-f0-9]{24}$/, "User ID must be a valid 24-character hex string")
      .describe(
        "User ID (not username) to get rooms for. " +
        "Format: 24-character hexadecimal string. " +
        "Get user ID from screeps_user_info tool first. " +
        "Returns list of room names owned by the user."
      )
  }),

  /**
   * Market statistics
   * Historical price and volume data
   */
  marketStats: z.object({
    resourceType: z.string()
      .min(1, "Resource type cannot be empty")
      .describe(
        "Resource type to get statistics for. " +
        "Examples: 'energy', 'H', 'O', 'XGHO2', 'power'. " +
        "Returns historical price data and trading volume."
      ),
    shard: z.string()
      .optional()
      .describe(
        "Shard to get statistics for (optional). " +
        "If omitted, uses configured shard. " +
        "Market is shard-specific."
      )
  }),

  /**
   * Leaderboard seasons
   * Lists available leaderboard seasons
   */
  leaderboardSeasons: z.object({}).describe(
    "Retrieves list of all leaderboard seasons. " +
    "Returns season IDs, names, dates, and status. " +
    "No parameters required."
  ),

  /**
   * Find user in leaderboard
   * Searches for a user's leaderboard position
   */
  leaderboardFind: z.object({
    username: z.string()
      .min(1, "Username cannot be empty")
      .describe("Username to find in the leaderboard (case-sensitive)."),
    season: z.string()
      .optional()
      .describe("Season ID to search in (optional, uses current season if omitted)."),
    mode: z.string()
      .optional()
      .describe("Leaderboard mode/category (optional, e.g., 'world', 'power').")
  }),

  /**
   * Leaderboard rankings
   * Gets top players from leaderboard
   */
  leaderboardList: z.object({
    season: z.string()
      .optional()
      .describe("Season ID to get rankings from (optional, uses current season if omitted)."),
    limit: z.number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .describe("Number of results to return (1-100, default: 20)."),
    offset: z.number()
      .int("Offset must be an integer")
      .min(0, "Offset must be >= 0")
      .optional()
      .describe("Pagination offset (default: 0). Use with limit for pagination."),
    mode: z.string()
      .optional()
      .describe("Leaderboard mode/category (optional).")
  }),

  /**
   * PVP statistics
   * Experimental PVP data
   */
  experimentalPvp: z.object({
    interval: z.number()
      .int("Interval must be an integer")
      .optional()
      .describe(
        "Time interval for statistics: " +
        "8 = last 1 hour, 180 = last 24 hours, 1440 = last 7 days. " +
        "Default: 8 (1 hour)."
      )
  }),

  /**
   * Nuke information
   * Active nuke data
   */
  experimentalNukes: z.object({
    interval: z.number()
      .int("Interval must be an integer")
      .optional()
      .describe(
        "Time interval for nuke data: " +
        "8 = last 1 hour, 180 = last 24 hours, 1440 = last 7 days. " +
        "Default: 8 (1 hour)."
      )
  }),

  /**
   * Money/credit history
   * Transaction history for credits
   */
  userMoneyHistory: z.object({
    page: z.number()
      .int("Page must be an integer")
      .min(0, "Page must be >= 0")
      .optional()
      .describe(
        "Page number for pagination (default: 0). " +
        "Returns credit transaction history including market trades, " +
        "subscription payments, and other credit operations."
      )
  }),

  /**
   * Room decorations
   * Visual effects and decorations in a room
   */
  roomDecorations: z.object({
    room: roomNameSchema
      .describe("Room name to get decorations for."),
    shard: z.string()
      .optional()
      .describe("Shard name (optional, uses configured shard if omitted).")
  }),

  /**
   * User overview
   * Comprehensive user statistics
   */
  userOverview: z.object({
    interval: z.number()
      .int("Interval must be an integer")
      .optional()
      .describe(
        "Time interval for statistics: " +
        "8 = last 1 hour, 180 = last 24 hours, 1440 = last 7 days. " +
        "Default: 8 (1 hour)."
      ),
    statName: z.string()
      .optional()
      .describe("Optional filter for specific stat name.")
  }),

  /**
   * Respawn prohibited rooms
   * Rooms where respawn is not allowed
   */
  respawnProhibitedRooms: z.object({}).describe(
    "Retrieves list of rooms where respawn is prohibited. " +
    "These are typically novice/respawn areas that are full. " +
    "Useful for respawn logic to avoid invalid room selection."
  )
};

/**
 * Type exports for use in handlers
 */
export type ConsoleInput = z.infer<typeof enhancedToolSchemas.console>;
export type MemoryGetInput = z.infer<typeof enhancedToolSchemas.memoryGet>;
export type MemorySetInput = z.infer<typeof enhancedToolSchemas.memorySet>;
export type StatsInput = z.infer<typeof enhancedToolSchemas.stats>;
export type SegmentGetInput = z.infer<typeof enhancedToolSchemas.segmentGet>;
export type SegmentSetInput = z.infer<typeof enhancedToolSchemas.segmentSet>;
export type GameTimeInput = z.infer<typeof enhancedToolSchemas.gameTime>;
export type RoomTerrainInput = z.infer<typeof enhancedToolSchemas.roomTerrain>;
export type RoomObjectsInput = z.infer<typeof enhancedToolSchemas.roomObjects>;
export type RoomStatusInput = z.infer<typeof enhancedToolSchemas.roomStatus>;
export type MarketOrdersInput = z.infer<typeof enhancedToolSchemas.marketOrders>;
export type MyMarketOrdersInput = z.infer<typeof enhancedToolSchemas.myMarketOrders>;
export type UserInfoInput = z.infer<typeof enhancedToolSchemas.userInfo>;
export type ShardInfoInput = z.infer<typeof enhancedToolSchemas.shardInfo>;
export type UserWorldStatusInput = z.infer<typeof enhancedToolSchemas.userWorldStatus>;
export type UserWorldStartRoomInput = z.infer<typeof enhancedToolSchemas.userWorldStartRoom>;
export type UserRoomsInput = z.infer<typeof enhancedToolSchemas.userRooms>;
export type MarketStatsInput = z.infer<typeof enhancedToolSchemas.marketStats>;
export type LeaderboardSeasonsInput = z.infer<typeof enhancedToolSchemas.leaderboardSeasons>;
export type LeaderboardFindInput = z.infer<typeof enhancedToolSchemas.leaderboardFind>;
export type LeaderboardListInput = z.infer<typeof enhancedToolSchemas.leaderboardList>;
export type ExperimentalPvpInput = z.infer<typeof enhancedToolSchemas.experimentalPvp>;
export type ExperimentalNukesInput = z.infer<typeof enhancedToolSchemas.experimentalNukes>;
export type UserMoneyHistoryInput = z.infer<typeof enhancedToolSchemas.userMoneyHistory>;
export type RoomDecorationsInput = z.infer<typeof enhancedToolSchemas.roomDecorations>;
export type UserOverviewInput = z.infer<typeof enhancedToolSchemas.userOverview>;
export type RespawnProhibitedRoomsInput = z.infer<typeof enhancedToolSchemas.respawnProhibitedRooms>;
