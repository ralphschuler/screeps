/**
 * Spawn Manager
 * 
 * Core spawn system logic decoupled from bot-specific dependencies.
 * Provides spawn queue processing, role selection, and body optimization.
 */

import {
  RoomState,
  SpawnRequest,
  SpawnResult,
  SpawnConfig,
  BodyTemplate,
  RoleSpawnDef
} from "./types";
import { DEFAULT_ROLE_DEFINITIONS, getRoleDefinition } from "./roleDefinitions";
import { calculateBodyCost, validateBody, sortBodyParts } from "./bodyUtils";

/**
 * Pheromone calculation constants
 */
const PHEROMONE_BASE_MULTIPLIER = 0.5; // Base multiplier ensures roles have minimum priority
const ECONOMY_PHEROMONE_WEIGHT = 3; // Average across 3 pheromone types for economy
const MILITARY_PHEROMONE_WEIGHT = 3; // Average across 3 pheromone types for military  
const UTILITY_PHEROMONE_WEIGHT = 2; // Average across 2 pheromone types for utility

/**
 * SpawnManager class
 * 
 * Manages spawn operations with clean separation from game state.
 */
export class SpawnManager {
  private config: SpawnConfig;
  private roleDefs: Record<string, RoleSpawnDef>;

  constructor(config: SpawnConfig = {}, customRoles?: Record<string, RoleSpawnDef>) {
    this.config = config;
    this.roleDefs = customRoles || DEFAULT_ROLE_DEFINITIONS;
  }

  /**
   * Get the best body template for a role based on available energy
   */
  getBestBody(role: string, energyAvailable: number): BodyTemplate | null {
    const def = getRoleDefinition(role, this.roleDefs);
    if (!def) return null;

    let best: BodyTemplate | null = null;

    for (const body of def.bodies) {
      if (body.cost <= energyAvailable) {
        if (!best || body.cost > best.cost) {
          best = body;
        }
      }
    }

    return best;
  }

  /**
   * Execute a spawn request on a specific spawn
   * 
   * Verified with MCP (screeps-docs-mcp: StructureSpawn.spawnCreep):
   * - API signature: spawnCreep(body, name, {memory}) ✓
   * - Return codes: OK, ERR_BUSY, ERR_NOT_ENOUGH_ENERGY, ERR_INVALID_ARGS, etc. ✓
   * - Body constraints: 1-50 body parts ✓
   * 
   * @returns SpawnResult with success status and details
   */
  executeSpawn(spawn: StructureSpawn, request: SpawnRequest): SpawnResult {
    // If spawn is busy, return error
    if (spawn.spawning) {
      return {
        success: false,
        error: ERR_BUSY,
        message: "Spawn is busy",
        role: request.role
      };
    }

    // Get body parts
    let body: BodyPartConstant[];
    if (request.body) {
      body = request.body;
    } else {
      const energyBudget = request.energyBudget || spawn.room.energyCapacityAvailable;
      const bodyTemplate = this.getBestBody(request.role, energyBudget);
      
      if (!bodyTemplate) {
        return {
          success: false,
          error: ERR_NOT_FOUND,
          message: `No valid body template found for role ${request.role}`,
          role: request.role
        };
      }
      
      body = bodyTemplate.parts;
    }

    // Validate body
    const validation = validateBody(body);
    if (validation !== true) {
      return {
        success: false,
        error: ERR_INVALID_ARGS,
        message: `Invalid body: ${validation}`,
        role: request.role
      };
    }

    // Sort body parts for optimal placement
    const sortedBody = sortBodyParts(body);
    
    // Generate creep name
    const creepName = this.generateCreepName(request.role);
    
    // Calculate cost
    const energyCost = calculateBodyCost(sortedBody, this.config.bodyCosts);

    // Attempt spawn
    const result = spawn.spawnCreep(sortedBody, creepName, { memory: request.memory });

    if (result === OK) {
      return {
        success: true,
        creepName,
        role: request.role,
        energyCost
      };
    } else {
      return {
        success: false,
        error: result,
        message: `Spawn failed with code ${result}`,
        role: request.role
      };
    }
  }

  /**
   * Process spawn queue for multiple spawns
   * @param spawns Array of available spawns
   * @param requests Array of spawn requests (sorted by priority)
   * @returns Array of spawn results
   */
  processSpawnQueue(spawns: StructureSpawn[], requests: SpawnRequest[]): SpawnResult[] {
    const results: SpawnResult[] = [];
    
    // Sort requests by priority (highest first)
    const sortedRequests = [...requests].sort((a, b) => b.priority - a.priority);
    
    for (const spawn of spawns) {
      if (spawn.spawning) continue;
      
      // Find highest priority request that can be spawned
      const requestIndex = sortedRequests.findIndex(req => {
        const energyBudget = req.energyBudget || spawn.room.energyCapacityAvailable;
        
        let cost: number;
        if (req.body) {
          cost = calculateBodyCost(req.body, this.config.bodyCosts);
        } else {
          const bodyTemplate = this.getBestBody(req.role, energyBudget);
          if (!bodyTemplate) return false;
          cost = bodyTemplate.cost;
        }
        
        return cost <= spawn.room.energyAvailable;
      });
      
      if (requestIndex === -1) continue;
      
      const request = sortedRequests[requestIndex];
      sortedRequests.splice(requestIndex, 1);
      
      const result = this.executeSpawn(spawn, request);
      results.push(result);
      
      if (this.config.debug && result.success) {
        console.log(`[SpawnManager] Spawned ${result.creepName} (${result.role}) for ${result.energyCost} energy`);
      }
    }
    
    return results;
  }

  /**
   * Generate unique creep name
   * Note: Uses Game.time if available, falls back to random if not
   */
  generateCreepName(role: string): string {
    const time = (typeof Game !== 'undefined' && Game.time) ? Game.time : Date.now();
    return `${role}_${time}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Check if a role should be spawned based on current counts
   */
  shouldSpawnRole(role: string, currentCount: number, roomState: RoomState): boolean {
    const def = getRoleDefinition(role, this.roleDefs);
    if (!def) return false;

    // Check config overrides
    const minCount = this.config.minCreepCounts?.[role] ?? 0;
    const maxCount = this.config.maxCreepCounts?.[role] ?? def.maxPerRoom;

    // If below minimum, should spawn
    if (currentCount < minCount) return true;

    // If at or above maximum, should not spawn
    if (currentCount >= maxCount) return false;

    // Otherwise, check if room state indicates need
    // This is a simplified check - more sophisticated logic would be in bot-specific code
    return currentCount < maxCount;
  }

  /**
   * Calculate effective priority for a role based on room state
   */
  calculatePriority(role: string, currentCount: number, roomState: RoomState): number {
    const def = getRoleDefinition(role, this.roleDefs);
    if (!def) return 0;

    // Start with base priority
    let priority = def.priority;

    // Apply config overrides
    if (this.config.rolePriorities && this.config.rolePriorities[role] !== undefined) {
      priority = this.config.rolePriorities[role];
    }

    // Reduce priority based on current count
    const maxCount = this.config.maxCreepCounts?.[role] ?? def.maxPerRoom;
    if (maxCount > 0) {
      const countFactor = Math.max(0.1, 1 - currentCount / maxCount);
      priority *= countFactor;
    }

    // Apply pheromone multipliers (simplified)
    const pheromoneMult = this.getPheromoneMult(role, roomState);
    priority *= pheromoneMult;

    return priority;
  }

  /**
   * Get pheromone multiplier for a role based on room state
   * 
   * Calculates a multiplier (0.5 to 1.5) based on relevant pheromone values:
   * - Economy roles: Average of harvest, build, upgrade pheromones
   * - Military roles: Average of defense, war, siege pheromones
   * - Utility roles: Average of expand, logistics pheromones
   * 
   * Base multiplier of 0.5 ensures all roles maintain minimum priority
   */
  private getPheromoneMult(role: string, roomState: RoomState): number {
    const def = getRoleDefinition(role, this.roleDefs);
    if (!def) return 1.0;

    const pheromones = roomState.pheromones;
    
    switch (def.family) {
      case "economy":
        // Economy roles boost with harvest/build/upgrade pheromones
        return PHEROMONE_BASE_MULTIPLIER + 
          (pheromones.harvest + pheromones.build + pheromones.upgrade) / ECONOMY_PHEROMONE_WEIGHT;
      
      case "military":
        // Military roles boost with defense/war pheromones
        return PHEROMONE_BASE_MULTIPLIER + 
          (pheromones.defense + pheromones.war + pheromones.siege) / MILITARY_PHEROMONE_WEIGHT;
      
      case "utility":
        // Utility roles boost with expansion/logistics
        return PHEROMONE_BASE_MULTIPLIER + 
          (pheromones.expand + pheromones.logistics) / UTILITY_PHEROMONE_WEIGHT;
      
      default:
        return 1.0;
    }
  }
}
