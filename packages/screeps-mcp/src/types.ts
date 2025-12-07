/**
 * Type definitions for Screeps MCP server
 */

/**
 * Screeps API configuration
 */
export interface ScreepsConfig {
  token?: string;
  email?: string;
  password?: string;
  host?: string;
  port?: number;
  protocol?: "http" | "https";
  shard?: string;
}

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  screeps: ScreepsConfig;
}

/**
 * Screeps room data structure
 */
export interface RoomData {
  name: string;
  controller?: {
    level: number;
    progress: number;
    progressTotal: number;
  };
  energyAvailable: number;
  energyCapacityAvailable: number;
}

/**
 * Screeps creep data structure
 */
export interface CreepData {
  name: string;
  role?: string;
  room: string;
  hits: number;
  hitsMax: number;
  ticksToLive?: number;
}

/**
 * Screeps spawn data structure
 */
export interface SpawnData {
  name: string;
  room: string;
  spawning?: {
    name: string;
    needTime: number;
    remainingTime: number;
  };
  energy: number;
  energyCapacity: number;
}

/**
 * Screeps stats data structure
 */
export interface StatsData {
  cpu: {
    used: number;
    limit: number;
    bucket?: number;
  };
  gcl?: {
    level: number;
    progress: number;
    progressTotal: number;
  };
  rooms: number;
  creeps: number;
}

/**
 * Memory operation result
 */
export interface MemoryResult {
  success: boolean;
  path: string;
  value?: unknown;
  error?: string;
}

/**
 * Console command result
 */
export interface ConsoleResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Deployment result
 */
export interface DeployResult {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Generic API result
 */
export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Room terrain result
 */
export interface RoomTerrainResult {
  success: boolean;
  terrain?: string; // encoded terrain string
  error?: string;
}

/**
 * Room objects result
 */
export interface RoomObjectsResult {
  success: boolean;
  objects?: unknown;
  error?: string;
}

/**
 * Game time result
 */
export interface GameTimeResult {
  success: boolean;
  time?: number;
  error?: string;
}

/**
 * Market orders result
 */
export interface MarketOrdersResult {
  success: boolean;
  orders?: unknown[];
  error?: string;
}

/**
 * Segment result
 */
export interface SegmentResult {
  success: boolean;
  data?: string;
  error?: string;
}
