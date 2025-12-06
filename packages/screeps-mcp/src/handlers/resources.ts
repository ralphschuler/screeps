/**
 * MCP Resource handlers for Screeps data
 */

import type { ScreepsClient } from "../screeps/client.js";

/**
 * Resource handler for Screeps rooms
 */
export async function getRoomsResource(client: ScreepsClient): Promise<string> {
  const rooms = await client.getRooms();
  return JSON.stringify(rooms, null, 2);
}

/**
 * Resource handler for Screeps creeps
 */
export async function getCreepsResource(client: ScreepsClient): Promise<string> {
  const creeps = await client.getCreeps();
  return JSON.stringify(creeps, null, 2);
}

/**
 * Resource handler for Screeps spawns
 */
export async function getSpawnsResource(client: ScreepsClient): Promise<string> {
  const spawns = await client.getSpawns();
  return JSON.stringify(spawns, null, 2);
}

/**
 * Resource handler for Screeps memory
 */
export async function getMemoryResource(client: ScreepsClient, path: string = ""): Promise<string> {
  const result = await client.getMemory(path);
  return JSON.stringify(result, null, 2);
}

/**
 * Resource handler for Screeps stats
 */
export async function getStatsResource(client: ScreepsClient): Promise<string> {
  const stats = await client.getStats();
  return JSON.stringify(stats, null, 2);
}

/**
 * List all available resources
 */
export function listResources(): Array<{ uri: string; name: string; description: string }> {
  return [
    {
      uri: "screeps://game/rooms",
      name: "Rooms",
      description: "Room state and structures"
    },
    {
      uri: "screeps://game/creeps",
      name: "Creeps",
      description: "Creep status and memory"
    },
    {
      uri: "screeps://game/spawns",
      name: "Spawns",
      description: "Spawn queue and energy"
    },
    {
      uri: "screeps://memory",
      name: "Memory",
      description: "Bot memory structure"
    },
    {
      uri: "screeps://stats",
      name: "Stats",
      description: "Performance and telemetry data"
    }
  ];
}
