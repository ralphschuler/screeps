/**
 * SwarmBot - Main Bot Entry Point
 *
 * Coordinates all swarm bot subsystems:
 * - Memory initialization
 * - Room management
 * - Creep role execution
 * - Spawning
 * - Strategic decisions
 */

import { memoryManager } from "./memory/manager";
import { roomManager } from "./core/roomNode";
import { profiler } from "./core/profiler";
import { runSpawnManager } from "./logic/spawn";
import { runEconomyRole } from "./roles/economy";
import { runMilitaryRole } from "./roles/military";
import { runUtilityRole } from "./roles/utility";
import { runPowerCreepRole, runPowerRole } from "./roles/power";
import { initMovement, finalizeMovement } from "./utils/movement";
import type { RoleFamily, SwarmCreepMemory } from "./memory/schemas";

/**
 * Get role family from creep memory
 */
function getCreepFamily(creep: Creep): RoleFamily {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  return memory.family ?? "economy";
}

/**
 * Run creep based on its role family
 */
function runCreep(creep: Creep): void {
  const family = getCreepFamily(creep);

  switch (family) {
    case "economy":
      runEconomyRole(creep);
      break;
    case "military":
      runMilitaryRole(creep);
      break;
    case "utility":
      runUtilityRole(creep);
      break;
    case "power":
      runPowerCreepRole(creep);
      break;
    default:
      runEconomyRole(creep);
  }
}

/**
 * Run all power creeps
 */
function runPowerCreeps(): void {
  for (const powerCreep of Object.values(Game.powerCreeps)) {
    if (powerCreep.ticksToLive !== undefined) {
      runPowerRole(powerCreep);
    }
  }
}

/**
 * Run spawn logic for all owned rooms
 */
function runSpawns(): void {
  for (const room of Object.values(Game.rooms)) {
    if (room.controller?.my) {
      const swarm = memoryManager.getSwarmState(room.name);
      if (swarm) {
        runSpawnManager(room, swarm);
      }
    }
  }
}

/**
 * Main loop for SwarmBot
 */
export function loop(): void {
  // Initialize movement system (cartographer preTick)
  initMovement();

  // Initialize memory structures
  memoryManager.initialize();

  // Run all owned rooms
  profiler.measureSubsystem("rooms", () => {
    roomManager.run();
  });

  // Run spawns
  profiler.measureSubsystem("spawns", () => {
    runSpawns();
  });

  // Run all creeps
  profiler.measureSubsystem("creeps", () => {
    for (const creep of Object.values(Game.creeps)) {
      if (!creep.spawning) {
        runCreep(creep);
      }
    }
  });

  // Run power creeps
  profiler.measureSubsystem("powerCreeps", () => {
    runPowerCreeps();
  });

  // Clean up dead creeps (every 50 ticks)
  if (Game.time % 50 === 0) {
    memoryManager.cleanDeadCreeps();
  }

  // Finalize movement system (cartographer reconcileTraffic)
  finalizeMovement();

  // Finalize profiler tick
  profiler.finalizeTick();
}

// Re-export key modules
export { memoryManager } from "./memory/manager";
export { roomManager } from "./core/roomNode";
export { profiler } from "./core/profiler";
export { logger } from "./core/logger";
export { scheduler } from "./core/scheduler";
export { pheromoneManager } from "./logic/pheromone";
export { evolutionManager, postureManager } from "./logic/evolution";
export * from "./memory/schemas";
export * from "./config";
