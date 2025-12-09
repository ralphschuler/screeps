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

import { kernel, ProcessPriority } from "./kernel";
import { logger } from "./logger";
import type { SwarmCreepMemory, RoleFamily } from "../memory/schemas";
import { runEconomyRole } from "../roles/economy";
import { runMilitaryRole } from "../roles/military";
import { runPowerCreepRole } from "../roles/power";
import { runUtilityRole } from "../roles/utility";
import { canSkipBehaviorEvaluation, executeIdleAction } from "../utils/idleDetection";
import { profiler } from "./profiler";

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
  // OPTIMIZATION: Skip behavior evaluation for idle creeps
  // Idle creeps are stationary workers (harvesters, upgraders) that are actively
  // working at their station and don't need to make new decisions.
  // This saves ~0.1-0.2 CPU per skipped creep.
  if (canSkipBehaviorEvaluation(creep)) {
    executeIdleAction(creep);
    return;
  }

  const family = getCreepFamily(creep);
  const memory = creep.memory as unknown as SwarmCreepMemory;
  const roleName = memory.role;

  // Profile per-role CPU usage for optimization insights
  profiler.measureSubsystem(`role:${roleName}`, () => {
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
    
    // Register all living creeps as processes
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      
      // Skip spawning creeps
      if (creep.spawning) {
        continue;
      }
      
      currentCreeps.add(name);
      
      // Register if not already registered
      if (!this.registeredCreeps.has(name)) {
        this.registerCreepProcess(creep);
      }
    }

    // Unregister dead creeps
    for (const name of this.registeredCreeps) {
      if (!currentCreeps.has(name)) {
        this.unregisterCreepProcess(name);
      }
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
    
    logger.debug(`Registered creep process: ${creep.name} (${role}) with priority ${priority}`, {
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
    
    logger.debug(`Unregistered creep process: ${name}`, {
      subsystem: "CreepProcessManager"
    });
  }

  /**
   * Get minimum bucket requirement based on priority
   */
  private getMinBucketForPriority(priority: ProcessPriority): number {
    if (priority >= ProcessPriority.CRITICAL) {
      return 100; // Critical creeps run even at low bucket
    }
    if (priority >= ProcessPriority.HIGH) {
      return 500;
    }
    if (priority >= ProcessPriority.MEDIUM) {
      return 2000;
    }
    return 5000; // Low priority needs healthy bucket
  }

  /**
   * Get CPU budget based on priority
   * 
   * Typical creep CPU usage ranges from 0.05 to 0.5 CPU depending on role complexity.
   * Budgets should be generous enough to accommodate normal behavior while still
   * catching outliers that need optimization.
   */
  private getCpuBudgetForPriority(priority: ProcessPriority): number {
    if (priority >= ProcessPriority.CRITICAL) {
      return 0.012; // ~0.6 CPU per critical creep (50 creeps = 30 CPU)
    }
    if (priority >= ProcessPriority.HIGH) {
      return 0.01; // ~0.5 CPU per high priority creep
    }
    if (priority >= ProcessPriority.MEDIUM) {
      return 0.008; // ~0.4 CPU per medium priority creep
    }
    return 0.006; // ~0.3 CPU per low priority creep
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
