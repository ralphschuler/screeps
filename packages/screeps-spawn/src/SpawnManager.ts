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
  SpawnConfig
} from "./types";
import { ROLE_DEFINITIONS, getRoleDefinition, type BodyTemplate, type RoleSpawnDef } from "./roleDefinitions";
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
 * Provides intelligent body selection, priority-based queue management,
 * and pheromone-based dynamic priority adjustments.
 * 
 * @example
 * ```typescript
 * const spawnManager = new SpawnManager({
 *   debug: true,
 *   rolePriorities: {
 *     harvester: 100,
 *     hauler: 90
 *   }
 * });
 * 
 * const requests: SpawnRequest[] = [
 *   { role: 'harvester', priority: 100, memory: { role: 'harvester' } }
 * ];
 * 
 * const spawns = room.find(FIND_MY_SPAWNS);
 * const results = spawnManager.processSpawnQueue(spawns, requests);
 * ```
 */
export class SpawnManager {
  private config: SpawnConfig;
  private roleDefs: Record<string, RoleSpawnDef>;

  /**
   * Create a new SpawnManager instance
   * 
   * @param config - Optional configuration for spawn behavior
   * @param customRoles - Optional custom role definitions to override defaults
   * 
   * @example
   * ```typescript
   * // With default configuration
   * const manager = new SpawnManager();
   * 
   * // With custom configuration
   * const manager = new SpawnManager({
   *   debug: true,
   *   rolePriorities: { harvester: 100 }
   * });
   * 
   * // With custom roles
   * const customRoles = {
   *   myRole: {
   *     role: 'myRole',
   *     family: 'economy',
   *     bodies: [{ parts: [WORK, CARRY, MOVE], cost: 200, minCapacity: 200 }],
   *     priority: 50,
   *     maxPerRoom: 5,
   *     remoteRole: false
   *   }
   * };
   * const manager = new SpawnManager({}, customRoles);
   * ```
   */
  constructor(config: SpawnConfig = {}, customRoles?: Record<string, RoleSpawnDef>) {
    this.config = config;
    this.roleDefs = customRoles || ROLE_DEFINITIONS;
  }

  /**
   * Get the best body template for a role based on available energy
   * 
   * Selects the most expensive body template that fits within the energy budget.
   * Returns null if no valid template is found.
   * 
   * @param role - The role name (e.g., 'harvester', 'upgrader')
   * @param energyAvailable - Available energy for spawning
   * @returns The best matching body template, or null if none found
   * 
   * @example
   * ```typescript
   * const body = spawnManager.getBestBody('harvester', 550);
   * if (body) {
   *   console.log(`Selected body: ${body.parts}, cost: ${body.cost}`);
   * }
   * ```
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
   * 
   * Processes an array of spawn requests across multiple spawns, selecting
   * the highest priority request that can be afforded. Requests are sorted
   * by priority (highest first) and matched with available spawns.
   * 
   * @param spawns - Array of available spawns (non-spawning spawns will be used)
   * @param requests - Array of spawn requests (will be sorted by priority internally)
   * @returns Array of spawn results for each spawning attempt
   * 
   * @example
   * ```typescript
   * const spawns = room.find(FIND_MY_SPAWNS);
   * const requests: SpawnRequest[] = [
   *   { role: 'harvester', priority: 100, memory: { role: 'harvester' } },
   *   { role: 'upgrader', priority: 80, memory: { role: 'upgrader' } }
   * ];
   * 
   * const results = spawnManager.processSpawnQueue(spawns, requests);
   * for (const result of results) {
   *   if (result.success) {
   *     console.log(`Spawned ${result.creepName}`);
   *   } else {
   *     console.log(`Failed: ${result.message}`);
   *   }
   * }
   * ```
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
   * 
   * Creates a unique name by combining the role with the current game time
   * and a random number. Falls back to Date.now() if Game.time is not available
   * (useful for testing).
   * 
   * @param role - The role name to use as prefix
   * @returns A unique creep name in format: `{role}_{time}_{random}`
   * 
   * @example
   * ```typescript
   * const name = spawnManager.generateCreepName('harvester');
   * // Returns: "harvester_12345678_123"
   * ```
   * 
   * @internal
   */
  generateCreepName(role: string): string {
    const time = (typeof Game !== 'undefined' && Game.time) ? Game.time : Date.now();
    return `${role}_${time}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Check if a role should be spawned based on current counts
   * 
   * Determines whether more creeps of a given role are needed by comparing
   * the current count against configured minimum and maximum values.
   * 
   * @param role - The role name to check
   * @param currentCount - Current number of creeps with this role
   * @param roomState - Current state of the room (for advanced logic)
   * @returns True if the role should be spawned
   * 
   * @example
   * ```typescript
   * const roomState: RoomState = {
   *   name: 'W1N1',
   *   energyAvailable: 300,
   *   energyCapacityAvailable: 550,
   *   rcl: 3,
   *   posture: 'eco',
   *   pheromones: { harvest: 0.5, build: 0.3, upgrade: 0.2 },
   *   danger: 0,
   *   bootstrap: false
   * };
   * 
   * const shouldSpawn = spawnManager.shouldSpawnRole('harvester', 2, roomState);
   * if (shouldSpawn) {
   *   console.log('Need more harvesters');
   * }
   * ```
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
   * 
   * Computes the spawn priority by starting with the base priority,
   * applying configuration overrides, adjusting for current creep count,
   * and applying pheromone multipliers based on room posture.
   * 
   * @param role - The role name
   * @param currentCount - Current number of creeps with this role
   * @param roomState - Current state of the room including pheromones
   * @returns The calculated priority value (higher = more important)
   * 
   * @example
   * ```typescript
   * const roomState: RoomState = {
   *   name: 'W1N1',
   *   energyAvailable: 300,
   *   energyCapacityAvailable: 550,
   *   rcl: 3,
   *   posture: 'eco',
   *   pheromones: { 
   *     harvest: 0.8,  // High harvest pheromone
   *     build: 0.3,
   *     upgrade: 0.5
   *   },
   *   danger: 0,
   *   bootstrap: false
   * };
   * 
   * const priority = spawnManager.calculatePriority('harvester', 1, roomState);
   * console.log(`Harvester priority: ${priority}`);
   * // Higher priority due to high harvest pheromone
   * ```
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
