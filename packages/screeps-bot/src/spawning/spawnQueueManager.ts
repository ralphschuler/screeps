/**
 * Spawn Queue Manager Module
 * 
 * Main spawn coordination system that:
 * - Determines which role to spawn next
 * - Selects optimal body templates
 * - Executes spawn operations
 * - Handles both bootstrap and normal spawning modes
 */

import type { SwarmState, SwarmCreepMemory } from "../memory/schemas";
import { ROLE_DEFINITIONS, type BodyTemplate, type RoleSpawnDef } from "./roleDefinitions";
import { getPostureSpawnWeights, getDynamicPriorityBoost, getPheromoneMult } from "./spawnPriority";
import { countCreepsByRole, needsRole, assignRemoteTargetRoom } from "./spawnNeedsAnalyzer";
import { isBootstrapMode, getBootstrapRole, isEmergencySpawnState, getEnergyProducerCount } from "./bootstrapManager";
import { type WeightedEntry, weightedSelection } from "../utils/weightedSelection";
import { kernel } from "../core/kernel";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { cachedFindMyStructures } from "../utils/roomFindCache";

/**
 * Get best body template for a role based on available energy capacity
 */
export function getBestBody(def: RoleSpawnDef, energyCapacity: number): BodyTemplate | null {
  let best: BodyTemplate | null = null;

  for (const body of def.bodies) {
    if (body.cost <= energyCapacity) {
      if (!best || body.cost > best.cost) {
        best = body;
      }
    }
  }

  return best;
}

/**
 * Determine next role to spawn using weighted selection.
 * In bootstrap mode, uses deterministic priority. In normal mode, uses weighted random selection.
 */
export function determineNextRole(room: Room, swarm: SwarmState): string | null {
  const counts = countCreepsByRole(room.name);

  // Bootstrap mode: use deterministic priority spawning for critical roles
  // This ensures proper recovery from bad states (all creeps dead, missing critical roles)
  if (isBootstrapMode(room.name, room)) {
    const bootstrapRole = getBootstrapRole(room.name, room, swarm);
    if (bootstrapRole) {
      return bootstrapRole;
    }
    // If no bootstrap role needed, fall through to weighted selection
  }

  // Normal mode: weighted selection based on posture, pheromones, and priorities
  const postureWeights = getPostureSpawnWeights(swarm.posture);

  // Build weighted entries
  const entries: WeightedEntry<string>[] = [];

  for (const [role, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (!needsRole(room.name, role, swarm)) continue;

    const baseWeight = def.priority;
    const postureWeight = postureWeights[role] ?? 0.5;
    const pheromoneMult = getPheromoneMult(role, swarm.pheromones as unknown as Record<string, number>);
    const priorityBoost = getDynamicPriorityBoost(room, swarm, role);

    // Reduce weight based on current count (guard against division by zero)
    const current = counts.get(role) ?? 0;
    const countFactor = def.maxPerRoom > 0 ? Math.max(0.1, 1 - current / def.maxPerRoom) : 0.1;

    const weight = (baseWeight + priorityBoost) * postureWeight * pheromoneMult * countFactor;

    entries.push({ key: role, weight });
  }

  if (entries.length === 0) return null;

  return weightedSelection(entries) ?? null;
}

/**
 * Generate unique creep name
 */
export function generateCreepName(role: string): string {
  return `${role}_${Game.time}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Get all roles that need spawning, sorted by priority (highest first)
 */
export function getAllSpawnableRoles(room: Room, swarm: SwarmState): string[] {
  const counts = countCreepsByRole(room.name);
  const postureWeights = getPostureSpawnWeights(swarm.posture);

  // Collect all roles that need spawning with their calculated priorities
  const roleScores: { role: string; score: number }[] = [];

  for (const [role, def] of Object.entries(ROLE_DEFINITIONS)) {
    if (!needsRole(room.name, role, swarm)) continue;

    const baseWeight = def.priority;
    const postureWeight = postureWeights[role] ?? 0.5;
    const pheromoneMult = getPheromoneMult(role, swarm.pheromones as unknown as Record<string, number>);
    const priorityBoost = getDynamicPriorityBoost(room, swarm, role);

    // Reduce weight based on current count (guard against division by zero)
    const current = counts.get(role) ?? 0;
    const countFactor = def.maxPerRoom > 0 ? Math.max(0.1, 1 - current / def.maxPerRoom) : 0.1;

    const score = (baseWeight + priorityBoost) * postureWeight * pheromoneMult * countFactor;

    roleScores.push({ role, score });
  }

  // Sort by score descending (highest priority first)
  roleScores.sort((a, b) => b.score - a.score);

  return roleScores.map(rs => rs.role);
}

/**
 * Main spawn manager - coordinates all spawning for a room
 */
export function runSpawnManager(room: Room, swarm: SwarmState): void {
  const spawns = cachedFindMyStructures<StructureSpawn>(room, STRUCTURE_SPAWN);
  const availableSpawn = spawns.find(s => !s.spawning);

  if (!availableSpawn) return;

  const energyCapacity = room.energyCapacityAvailable;
  const energyAvailable = room.energyAvailable;

  // Emergency mode: when no energy-producing creeps exist and extensions are empty,
  // use energyAvailable to select body instead of energyCapacityAvailable.
  // This prevents deadlock where we wait for extensions to fill but have no creeps to fill them.
  const isEmergency = isEmergencySpawnState(room.name);
  const effectiveCapacity = isEmergency ? energyAvailable : energyCapacity;

  // Workforce collapse warning: If we're in emergency with very low energy
  // Log a warning to help identify critical situations
  if (isEmergency && energyAvailable < 150) {
    logger.warn(
      `WORKFORCE COLLAPSE: ${energyAvailable} energy available, need 150 to spawn minimal larvaWorker. ` +
      `Room will recover once energy reaches 150.`,
      {
        subsystem: "spawn",
        room: room.name
      }
    );
    
    kernel.emit("spawn.emergency", {
      roomName: room.name,
      energyAvailable,
      message: "Critical workforce collapse - waiting for energy to spawn minimal creep",
      source: "SpawnManager"
    });
  }
  
  // Log bootstrap mode for visibility
  const inBootstrapMode = isBootstrapMode(room.name, room);
  if (inBootstrapMode && Game.time % 10 === 0) {
    const activeCounts = countCreepsByRole(room.name, true);
    const totalCounts = countCreepsByRole(room.name, false);
    const activeLarva = activeCounts.get("larvaWorker") ?? 0;
    const activeHarvest = activeCounts.get("harvester") ?? 0;
    
    logger.info(
      `BOOTSTRAP MODE: ${getEnergyProducerCount(activeCounts)} active energy producers ` +
      `(${activeLarva} larva, ${activeHarvest} harvest), ${getEnergyProducerCount(totalCounts)} total. ` +
      `Energy: ${energyAvailable}/${energyCapacity}`,
      {
        subsystem: "spawn",
        room: room.name
      }
    );
  }

  // SPAWN FIX: Try roles in priority order until we find one we can afford
  // This prevents the spawn system from stalling when high-priority roles
  // are too expensive for current energy levels.
  
  // In bootstrap mode, use deterministic bootstrap order
  if (isBootstrapMode(room.name, room)) {
    const role = getBootstrapRole(room.name, room, swarm);
    if (!role) return;

    const def = ROLE_DEFINITIONS[role];
    if (!def) return;

    // SPAWN FIX: Try optimal body first (based on capacity), then fallback to smaller body
    // This prevents bootstrap from stalling when optimal body is too expensive
    let body = getBestBody(def, effectiveCapacity);
    if (body && energyAvailable >= body.cost) {
      // Can afford optimal body, use it
    } else {
      // Can't afford optimal body, try smaller body based on available energy
      body = getBestBody(def, energyAvailable);
      if (!body) {
        // No body configuration exists within available energy
        logger.info(
          `Bootstrap: No affordable body for ${role} (available: ${energyAvailable}, min needed: ${def.bodies[0]?.cost ?? "unknown"})`,
          {
            subsystem: "spawn",
            room: room.name
          }
        );
        return;
      }
    }

    // Spawn creep
    const name = generateCreepName(role);
    const memory: SwarmCreepMemory = {
      role: def.role,
      family: def.family,
      homeRoom: room.name,
      version: 1
    };

    // For remote roles, set the targetRoom to the remote room that needs workers
    // Skip spawning if no valid target room is available (prevents spawn blocking)
    if (!assignRemoteTargetRoom(role, memory, swarm, room.name)) {
      return;
    }

    let result: ScreepsReturnCode;
    try {
      result = availableSpawn.spawnCreep(body.parts, name, {
        memory: memory as unknown as CreepMemory
      });
    } catch (error) {
      logger.error(
        `EXCEPTION during spawn attempt for ${role}: ${error}`,
        {
          subsystem: "spawn",
          room: room.name,
          meta: {
            error: String(error),
            role,
            bodyCost: body.cost,
            bodyParts: body.parts.length
          }
        }
      );
      return;
    }

    if (result === OK) {
      logger.info(
        `BOOTSTRAP SPAWN: ${role} (${name}) with ${body.parts.length} parts, cost ${body.cost}. Recovery in progress.`,
        {
          subsystem: "spawn",
          room: room.name
        }
      );
      
      kernel.emit("spawn.completed", {
        roomName: room.name,
        creepName: name,
        role,
        cost: body.cost,
        source: "SpawnManager"
      });
    } else {
      // Log spawn failures to diagnose issues
      const errorName = result === ERR_NOT_ENOUGH_ENERGY ? "ERR_NOT_ENOUGH_ENERGY" :
                        result === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" :
                        result === ERR_BUSY ? "ERR_BUSY" :
                        result === ERR_NOT_OWNER ? "ERR_NOT_OWNER" :
                        result === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" :
                        result === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" :
                        `UNKNOWN(${result})`;
      
      logger.warn(
        `BOOTSTRAP SPAWN FAILED: ${role} (${name}) - ${errorName}. Body: ${body.parts.length} parts, cost: ${body.cost}, available: ${energyAvailable}`,
        {
          subsystem: "spawn",
          room: room.name,
          meta: {
            errorCode: result,
            errorName,
            role,
            bodyCost: body.cost,
            energyAvailable,
            energyCapacity
          }
        }
      );
    }
    return;
  }

  // Normal mode: Get all spawnable roles sorted by priority
  // CHANGED: Wait for optimal energy instead of spawning smaller creeps
  // When out of bootstrap mode, we want to spawn larger, more efficient creeps
  // rather than spawning whatever we can afford immediately.
  const spawnableRoles = getAllSpawnableRoles(room, swarm);

  for (const role of spawnableRoles) {
    const def = ROLE_DEFINITIONS[role];
    if (!def) continue;

    // Get the optimal body for our room's energy capacity
    const optimalBody = getBestBody(def, effectiveCapacity);
    if (!optimalBody) continue; // No body template exists for this role
    
    // In normal mode, only spawn if we can afford the optimal body
    // This prevents spawning small inefficient creeps when we're not in emergency
    if (energyAvailable < optimalBody.cost) {
      // Can't afford optimal body for this role, skip it and try next role
      continue;
    }

    // We can afford the optimal body, spawn it
    const name = generateCreepName(role);
    const memory: SwarmCreepMemory = {
      role: def.role,
      family: def.family,
      homeRoom: room.name,
      version: 1
    };

    // For remote roles, set the targetRoom to the remote room that needs workers
    // Skip spawning if no valid target room is available (prevents spawn blocking)
    if (!assignRemoteTargetRoom(role, memory, swarm, room.name)) {
      continue;
    }

    // For inter-room carrier, assign a transfer request
    if (role === "interRoomCarrier" && swarm.clusterId) {
      const cluster = memoryManager.getCluster(swarm.clusterId);
      if (cluster) {
        // Find request from this room that needs carriers
        const request = cluster.resourceRequests.find(req => {
          if (req.fromRoom !== room.name) return false;
          const assignedCount = req.assignedCreeps.filter(n => Game.creeps[n]).length;
          const remaining = req.amount - req.delivered;
          return remaining > 500 && assignedCount < 2;
        });

        if (request) {
          memory.transferRequest = {
            fromRoom: request.fromRoom,
            toRoom: request.toRoom,
            resourceType: request.resourceType,
            amount: request.amount
          };
          request.assignedCreeps.push(name);
        }
      }
    }

    const result = availableSpawn.spawnCreep(optimalBody.parts, name, {
      memory: memory as unknown as CreepMemory
    });

    // Emit spawn completed event on successful spawn
    if (result === OK) {
      kernel.emit("spawn.completed", {
        roomName: room.name,
        creepName: name,
        role,
        cost: optimalBody.cost,
        source: "SpawnManager"
      });
      return; // Successfully spawned, exit
    }

    // Log spawn failures for non-energy issues
    if (result !== ERR_NOT_ENOUGH_ENERGY) {
      const errorName = result === ERR_NAME_EXISTS ? "ERR_NAME_EXISTS" :
                        result === ERR_BUSY ? "ERR_BUSY" :
                        result === ERR_NOT_OWNER ? "ERR_NOT_OWNER" :
                        result === ERR_INVALID_ARGS ? "ERR_INVALID_ARGS" :
                        result === ERR_RCL_NOT_ENOUGH ? "ERR_RCL_NOT_ENOUGH" :
                        `UNKNOWN(${result})`;
      
      logger.warn(
        `Spawn failed for ${role}: ${errorName}. Body: ${optimalBody.parts.length} parts, cost: ${optimalBody.cost}`,
        {
          subsystem: "spawn",
          room: room.name,
          meta: {
            errorCode: result,
            errorName,
            role,
            bodyCost: optimalBody.cost
          }
        }
      );
      return;
    }
  }
  
  // If we get here, we tried all spawnable roles but couldn't afford optimal bodies
  // In normal mode, we wait for energy to accumulate rather than spawning small creeps
  // Log this periodically for visibility
  if (spawnableRoles.length > 0 && Game.time % 20 === 0) {
    logger.info(
      `Waiting for energy: ${spawnableRoles.length} roles need spawning, waiting for optimal bodies. ` +
      `Energy: ${energyAvailable}/${energyCapacity}`,
      {
        subsystem: "spawn",
        room: room.name,
        meta: {
          topRoles: spawnableRoles.slice(0, 3).join(", "),
          energyAvailable,
          energyCapacity
        }
      }
    );
  } else if (spawnableRoles.length === 0 && Game.time % 100 === 0) {
    // No roles need spawning at all - room is fully staffed
    logger.info(
      `No spawns needed: All roles fully staffed. Energy: ${energyAvailable}/${energyCapacity}`,
      {
        subsystem: "spawn",
        room: room.name,
        meta: {
          energyAvailable,
          energyCapacity,
          activeCreeps: countCreepsByRole(room.name, true).size
        }
      }
    );
  }
}
