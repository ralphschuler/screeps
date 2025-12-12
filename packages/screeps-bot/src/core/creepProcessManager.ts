/**
 * Creep Process Manager
 *
 * Manages individual creeps as kernel processes, ensuring every creep
 * gets run eventually through the kernel's wrap-around queue system.
 *
 * Each creep becomes a process with priority based on its role, allowing
 * the kernel to handle CPU budgeting and fair execution scheduling.
 *
 * Design Principles (from ROADMAP.md):
 * - Decentralization: Each creep is an independent process
 * - Event-driven logic: Creeps respond to events and pheromones
 * - Strict tick budget: CPU allocation per creep is managed by kernel
 */

import { ProcessPriority, kernel } from "./kernel";
import { logger } from "./logger";
import type { RoleFamily, SwarmCreepMemory } from "../memory/schemas";
import { runEconomyRole } from "../roles/economy";
import { runMilitaryRole } from "../roles/military";
import { runPowerCreepRole } from "../roles/power";
import { runUtilityRole } from "../roles/utility";
import { canSkipBehaviorEvaluation, executeIdleAction } from "../utils/idleDetection";
import { unifiedStats } from "./unifiedStats";

/**
 * Role priorities - higher values = run first
 * These map to kernel ProcessPriority levels
 */
const ROLE_PRIORITY_MAP: Record<string, ProcessPriority> = {
  // Critical economy roles (CRITICAL = 100)
  harvester: ProcessPriority.CRITICAL,
  queenCarrier: ProcessPriority.CRITICAL,
  
  // High priority roles (HIGH = 75)
  hauler: ProcessPriority.HIGH,
  guard: ProcessPriority.HIGH,
  healer: ProcessPriority.HIGH,
  soldier: ProcessPriority.HIGH,
  ranger: ProcessPriority.HIGH,
  siegeUnit: ProcessPriority.HIGH,
  harasser: ProcessPriority.HIGH,
  powerQueen: ProcessPriority.HIGH,
  powerWarrior: ProcessPriority.HIGH,
  larvaWorker: ProcessPriority.HIGH,
  
  // Medium priority roles (MEDIUM = 50)
  builder: ProcessPriority.MEDIUM,
  upgrader: ProcessPriority.MEDIUM,
  interRoomCarrier: ProcessPriority.MEDIUM,
  scout: ProcessPriority.MEDIUM,
  claimer: ProcessPriority.MEDIUM,
  engineer: ProcessPriority.MEDIUM,
  remoteHarvester: ProcessPriority.MEDIUM,
  powerHarvester: ProcessPriority.MEDIUM,
  powerCarrier: ProcessPriority.MEDIUM,
  
  // Low priority roles (LOW = 25)
  remoteHauler: ProcessPriority.LOW,
  remoteWorker: ProcessPriority.LOW,
  linkManager: ProcessPriority.LOW,
  terminalManager: ProcessPriority.LOW,
  mineralHarvester: ProcessPriority.LOW,
  
  // Idle priority roles (IDLE = 10)
  labTech: ProcessPriority.IDLE,
  factoryWorker: ProcessPriority.IDLE
};

/**
 * Get role family from creep memory
 */
function getCreepFamily(creep: Creep): RoleFamily {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  return memory.family ?? "economy";
}

/**
 * Get process priority for a creep role
 */
function getCreepProcessPriority(role: string): ProcessPriority {
  return ROLE_PRIORITY_MAP[role] ?? ProcessPriority.MEDIUM;
}

/**
 * Execute a creep's role behavior
 */
function executeCreepRole(creep: Creep): void {
  const memory = creep.memory as unknown as SwarmCreepMemory;
  
  // Log every 10 ticks to track if creep roles are executing
  if (Game.time % 10 === 0) {
    logger.info(`Executing role for creep ${creep.name} (${memory.role})`, {
      subsystem: "CreepProcessManager",
      creep: creep.name
    });
  }
  
  // OPTIMIZATION: Skip behavior evaluation for idle creeps
  // Idle creeps are stationary workers (harvesters, upgraders) that are actively
  // working at their station and don't need to make new decisions.
  // This saves ~0.1-0.2 CPU per skipped creep.
  if (canSkipBehaviorEvaluation(creep)) {
    const success = executeIdleAction(creep);
    
    // BUGFIX: If idle action fails, clear state and fall through to normal behavior
    // This prevents creeps from getting stuck in an infinite loop of trying
    // the same failed action. Common failure scenarios:
    // - Target destroyed/despawned
    // - Target out of range (creep was moved)
    // - Action returns error code (e.g., ERR_FULL, ERR_NOT_ENOUGH_RESOURCES)
    if (!success) {
      delete memory.state;
      // Fall through to normal behavior evaluation below
    } else {
      // Idle action succeeded, we're done
      return;
    }
  }

  const family = getCreepFamily(creep);
  const roleName = memory.role;

  // Profile per-role CPU usage for optimization insights
  unifiedStats.measureSubsystem(`role:${roleName}`, () => {
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
  });
}

/**
 * Creep Process Manager
 *
 * Manages registration and lifecycle of creep processes with the kernel.
 * Each living creep is registered as a high-frequency process that runs
 * every tick (when CPU budget allows).
 */
export class CreepProcessManager {
  private registeredCreeps = new Set<string>();
  private lastSyncTick = -1;

  /**
   * Synchronize creep processes with kernel.
   * Registers new creeps and unregisters dead ones.
   * Should be called once per tick before kernel.run()
   */
  public syncCreepProcesses(): void {
    // Only sync once per tick
    if (this.lastSyncTick === Game.time) {
      return;
    }
    this.lastSyncTick = Game.time;

    const currentCreeps = new Set<string>();
    let registeredCount = 0;
    let unregisteredCount = 0;
    let spawningCount = 0;
    
    // Count total creeps for visibility
    const totalCreeps = Object.keys(Game.creeps).length;
    
    // Register all living creeps as processes
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      // Skip spawning creeps
      if (creep.spawning) {
        spawningCount++;
        continue;
      }
      
      currentCreeps.add(name);
      
      // Register if not already registered
      if (!this.registeredCreeps.has(name)) {
        this.registerCreepProcess(creep);
        registeredCount++;
      }
    }

    // Unregister dead creeps
    for (const name of this.registeredCreeps) {
      if (!currentCreeps.has(name)) {
        this.unregisterCreepProcess(name);
        unregisteredCount++;
      }
    }

    // Enhanced logging for better visibility
    // Log on changes OR periodically to show current state
    const shouldLog = registeredCount > 0 || unregisteredCount > 0 || Game.time % 10 === 0;
    
    if (shouldLog) {
      logger.info(
        `CreepProcessManager: ${currentCreeps.size} active, ${spawningCount} spawning, ${totalCreeps} total (registered: ${registeredCount}, unregistered: ${unregisteredCount})`,
        { 
          subsystem: "CreepProcessManager",
          meta: {
            activeCreeps: currentCreeps.size,
            spawningCreeps: spawningCount,
            totalCreeps,
            registeredThisTick: registeredCount,
            unregisteredThisTick: unregisteredCount
          }
        }
      );
    }
  }

  /**
   * Register a creep as a kernel process
   */
  private registerCreepProcess(creep: Creep): void {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    const role = memory.role;
    const priority = getCreepProcessPriority(role);
    
    const processId = `creep:${creep.name}`;
    
    kernel.registerProcess({
      id: processId,
      name: `Creep ${creep.name} (${role})`,
      priority,
      frequency: "high", // Creeps run every tick
      interval: 1,
      minBucket: this.getMinBucketForPriority(priority),
      cpuBudget: this.getCpuBudgetForPriority(priority),
      execute: () => {
        // Check if creep still exists
        const currentCreep = Game.creeps[creep.name];
        if (currentCreep && !currentCreep.spawning) {
          executeCreepRole(currentCreep);
        }
      }
    });

    this.registeredCreeps.add(creep.name);
    
    logger.info(`Registered creep process: ${creep.name} (${role}) with priority ${priority}`, {
      subsystem: "CreepProcessManager"
    });
  }

  /**
   * Unregister a dead creep from the kernel
   */
  private unregisterCreepProcess(name: string): void {
    const processId = `creep:${name}`;
    kernel.unregisterProcess(processId);
    this.registeredCreeps.delete(name);
    
    logger.info(`Unregistered creep process: ${name}`, {
      subsystem: "CreepProcessManager"
    });
  }

  /**
   * Get minimum bucket requirement based on priority
   * 
   * REMOVED: All bucket requirements - user regularly depletes bucket and doesn't
   * want minBucket limitations blocking processes. Returns 0 for all priorities.
   * Bucket mode in kernel still provides priority-based filtering during low bucket.
   */
  private getMinBucketForPriority(priority: ProcessPriority): number {
    return 0; // No bucket requirements - processes run regardless of bucket level
  }

  /**
   * Get CPU budget based on priority
   * 
   * These budgets are fractions of the total CPU limit allocated per creep process.
   * For a 50 CPU limit:
   * - Critical: 1.2% = 0.6 CPU budget per creep
   * - High: 1.0% = 0.5 CPU budget per creep
   * - Medium: 0.8% = 0.4 CPU budget per creep
   * - Low: 0.6% = 0.3 CPU budget per creep
   * 
   * These are generous to accommodate complex behaviors while still catching outliers.
   */
  private getCpuBudgetForPriority(priority: ProcessPriority): number {
    if (priority >= ProcessPriority.CRITICAL) {
      return 0.012; // 1.2% of CPU limit per creep
    }
    if (priority >= ProcessPriority.HIGH) {
      return 0.01; // 1.0% of CPU limit per creep
    }
    if (priority >= ProcessPriority.MEDIUM) {
      return 0.008; // 0.8% of CPU limit per creep
    }
    return 0.006; // 0.6% of CPU limit per creep
  }

  /**
   * Get statistics about registered creeps
   */
  public getStats(): {
    totalCreeps: number;
    registeredCreeps: number;
    creepsByPriority: Record<string, number>;
  } {
    const creepsByPriority: Record<string, number> = {};
    
    for (const name of this.registeredCreeps) {
      const creep = Game.creeps[name];
      if (creep) {
        const memory = creep.memory as unknown as SwarmCreepMemory;
        const role = memory.role;
        const priority = getCreepProcessPriority(role);
        const priorityName = ProcessPriority[priority] ?? "UNKNOWN";
        creepsByPriority[priorityName] = (creepsByPriority[priorityName] ?? 0) + 1;
      }
    }

    return {
      totalCreeps: Object.keys(Game.creeps).length,
      registeredCreeps: this.registeredCreeps.size,
      creepsByPriority
    };
  }

  /**
   * Force resync of all creep processes
   */
  public forceResync(): void {
    this.lastSyncTick = -1;
    this.syncCreepProcesses();
  }

  /**
   * Clear all internal state (for testing)
   */
  public reset(): void {
    this.registeredCreeps.clear();
    this.lastSyncTick = -1;
  }
}

/**
 * Global creep process manager instance
 */
export const creepProcessManager = new CreepProcessManager();
