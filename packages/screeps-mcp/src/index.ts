/**
 * Screeps MCP Server - Public API
 */

export { createMCPServer } from "./server.js";
export { ScreepsClient } from "./screeps/client.js";
export type {
  MCPServerConfig,
  ScreepsConfig,
  RoomData,
  CreepData,
  SpawnData,
  StatsData,
  MemoryResult,
  ConsoleResult,
  DeployResult
} from "./types.js";
export {
  getRoomsResource,
  getCreepsResource,
  getSpawnsResource,
  getMemoryResource,
  getStatsResource,
  listResources
} from "./handlers/resources.js";
export {
  listTools,
  handleConsole,
  handleMemoryGet,
  handleMemorySet,
  handleStats,
  toolSchemas
} from "./handlers/tools.js";
