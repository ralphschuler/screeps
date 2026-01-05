/**
 * Screeps MCP Integration Helpers
 * 
 * Similar to grafana.ts, these are helper functions that serve as documentation
 * and examples for how AI agents should use the screeps-mcp tools.
 * 
 * AI agents should use screeps-mcp tools directly rather than calling these functions.
 */

import { BotHealth } from './types.js';

/**
 * Get current bot health and status
 * 
 * AI Agent Usage:
 * ```
 * const stats = await screeps_stats();
 * const rooms = await screeps_user_rooms({ userId: "your-user-id" });
 * const memory = await screeps_memory_get({ path: "stats" });
 * ```
 * 
 * @returns Bot health metrics
 */
export async function getBotHealth(): Promise<BotHealth> {
  console.warn('getBotHealth: AI agents should use screeps-mcp tools (screeps_stats, screeps_user_rooms) directly.');
  
  // Placeholder implementation
  return {
    cpu: {
      used: 50.5,
      limit: 100,
      bucket: 8500,
      usage: 50.5
    },
    gcl: {
      level: 8,
      progress: 15234567,
      progressTotal: 20000000
    },
    rooms: {
      total: 8,
      owned: 8,
      reserved: 0
    },
    creeps: {
      total: 120,
      byRole: {
        harvester: 24,
        upgrader: 16,
        builder: 12,
        hauler: 32,
        claimer: 2,
        scout: 4
      }
    },
    energy: {
      total: 500000,
      available: 125000
    }
  };
}

/**
 * Get room status and information
 * 
 * AI Agent Usage:
 * ```
 * await screeps_room_status({ room: "W1N1" });
 * await screeps_room_objects({ room: "W1N1" });
 * await screeps_room_terrain({ room: "W1N1" });
 * ```
 */
export async function getRoomInfo(roomName: string): Promise<any> {
  console.warn('getRoomInfo: AI agents should use screeps-mcp tools (screeps_room_status, screeps_room_objects) directly.');
  
  return null;
}

/**
 * Execute console command
 * 
 * AI Agent Usage:
 * ```
 * await screeps_console({ 
 *   command: "Game.cpu.getUsed()" 
 * });
 * ```
 */
export async function executeCommand(command: string): Promise<any> {
  console.warn('executeCommand: AI agents should use screeps-mcp screeps_console tool directly.');
  
  return null;
}

/**
 * Get memory at path
 * 
 * AI Agent Usage:
 * ```
 * await screeps_memory_get({ path: "empire.colonies" });
 * ```
 */
export async function getMemory(path: string): Promise<any> {
  console.warn('getMemory: AI agents should use screeps-mcp screeps_memory_get tool directly.');
  
  return null;
}

/**
 * Get market information
 * 
 * AI Agent Usage:
 * ```
 * await screeps_market_orders({ resourceType: "energy" });
 * await screeps_market_stats({ resourceType: "energy" });
 * ```
 */
export async function getMarketData(resourceType?: string): Promise<any> {
  console.warn('getMarketData: AI agents should use screeps-mcp tools (screeps_market_orders, screeps_market_stats) directly.');
  
  return null;
}

/**
 * Get current game time
 * 
 * AI Agent Usage:
 * ```
 * await screeps_game_time();
 * ```
 */
export async function getGameTime(): Promise<number> {
  console.warn('getGameTime: AI agents should use screeps-mcp screeps_game_time tool directly.');
  
  return Date.now();
}
