import type { SwarmState } from "@ralphschuler/screeps-memory";
import { isEmergencySpawnState } from "./bootstrapManager";
import { runSpawnPipeline } from "./spawnPipeline";
import { spawnQueue } from "./spawnQueue";

export { compileSpawnDemandToRequest, createSpawnPlan, planSpawnDemand } from "./spawnIntentCompiler";
export {
  buildSpawnMemory,
  executeSpawnRequest,
  generateSpawnCreepName,
  populateSpawnQueue,
  processSpawnQueue,
  runSpawnPipeline,
  type SpawnPipelineResult
} from "./spawnPipeline";

/**
 * Coordinate spawning for a room.
 * Compatibility facade for the deeper spawn pipeline Interface.
 */
export function coordinateSpawning(room: Room, swarm: SwarmState): void {
  runSpawnPipeline(room, swarm);
}

/**
 * Check if room needs emergency spawns.
 */
export function needsEmergencySpawn(room: Room): boolean {
  return isEmergencySpawnState(room.name) || spawnQueue.hasEmergencySpawns(room.name);
}

/**
 * Get spawn queue status for a room.
 */
export function getSpawnQueueStatus(roomName: string): {
  queueSize: number;
  hasEmergency: boolean;
  stats: ReturnType<typeof spawnQueue.getQueueStats>;
} {
  return {
    queueSize: spawnQueue.getQueueSize(roomName),
    hasEmergency: spawnQueue.hasEmergencySpawns(roomName),
    stats: spawnQueue.getQueueStats(roomName)
  };
}
