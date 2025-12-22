/**
 * Spawn System Adapter
 * 
 * Demonstrates integration of @ralphschuler/screeps-spawn package with the bot.
 * This file shows how to bridge the new spawn package with existing bot code.
 * 
 * NOTE: This is an example adapter for demonstration purposes.
 * The actual spawn system integration will be done incrementally.
 */

import { SpawnManager, RoomState } from "@ralphschuler/screeps-spawn";
import type { SwarmState } from "../memory/schemas";

/**
 * Example: Convert bot's SwarmState to spawn package's RoomState
 */
export function convertToRoomState(room: Room, swarm: SwarmState): RoomState {
  return {
    name: room.name,
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    rcl: room.controller?.level ?? 0,
    posture: swarm.posture,
    pheromones: {
      expand: swarm.pheromones.expand ?? 0,
      harvest: swarm.pheromones.harvest ?? 0,
      build: swarm.pheromones.build ?? 0,
      upgrade: swarm.pheromones.upgrade ?? 0,
      defense: swarm.pheromones.defense ?? 0,
      war: swarm.pheromones.war ?? 0,
      siege: swarm.pheromones.siege ?? 0,
      logistics: swarm.pheromones.logistics ?? 0
    },
    danger: swarm.danger,
    bootstrap: swarm.colonyLevel === "larva" || swarm.colonyLevel === "egg"
  };
}

/**
 * Example: Create spawn manager instance
 */
export function createSpawnManager(): SpawnManager {
  return new SpawnManager({
    debug: false, // Set to true for debug logging
    // Custom role priorities can be configured here
    rolePriorities: {
      // Override default priorities if needed
    },
    // Custom min/max counts can be configured here
    minCreepCounts: {
      // Minimum creeps per role
    },
    maxCreepCounts: {
      // Maximum creeps per role (overrides role definitions)
    }
  });
}

/**
 * Example: Get best body for a role
 * This demonstrates how to use the spawn manager to get optimal bodies.
 */
export function getOptimalBody(role: string, energyAvailable: number): BodyPartConstant[] | null {
  const spawnManager = createSpawnManager();
  const bodyTemplate = spawnManager.getBestBody(role, energyAvailable);
  return bodyTemplate ? bodyTemplate.parts : null;
}
