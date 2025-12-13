/**
 * Power Creep Manager
 *
 * Manages Power Creeps lifecycle and GPL progression:
 * - GPL (Global Power Level) tracking and progression strategy
 * - Power creep spawning, respawning, and assignment
 * - Power processing prioritization for GPL advancement
 * - Eco vs combat operator coordination
 * - Power creep role selection and room assignment
 *
 * Addresses Issue: #26 - Section 14 comprehensive power creep strategy
 */

import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";

/**
 * Power creep configuration
 */
export interface PowerCreepConfig {
  /** Minimum GPL to create first power creep */
  minGPL: number;
  /** Target power in storage before focusing on GPL */
  minPowerReserve: number;
  /** Energy cost per power processed (50 energy per power) */
  energyPerPower: number;
  /** Minimum energy reserve before processing power */
  minEnergyReserve: number;
  /** Preferred GPL milestones to aim for */
  gplMilestones: number[];
}

const DEFAULT_CONFIG: PowerCreepConfig = {
  minGPL: 1,
  minPowerReserve: 10000,
  energyPerPower: 50,
  minEnergyReserve: 100000,
  gplMilestones: [1, 2, 5, 10, 15, 20]
};

/**
 * Power creep assignment
 */
export interface PowerCreepAssignment {
  /** Power creep name */
  name: string;
  /** Power creep class */
  className: "operator";
  /** Assigned role */
  role: "powerQueen" | "powerWarrior";
  /** Assigned room */
  assignedRoom: string;
  /** Current level */
  level: number;
  /** Whether spawned */
  spawned: boolean;
  /** Last respawn tick */
  lastRespawnTick?: number;
  /** Priority score for respawn */
  priority: number;
}

/**
 * GPL progression state
 */
export interface GPLState {
  /** Current GPL level */
  currentLevel: number;
  /** Current progress to next level */
  currentProgress: number;
  /** Progress needed for next level */
  progressNeeded: number;
  /** Power processed this tick */
  powerProcessedThisTick: number;
  /** Total power processed (historical) */
  totalPowerProcessed: number;
  /** Estimated ticks to next GPL level */
  ticksToNextLevel: number;
  /** Target GPL milestone */
  targetMilestone: number;
  /** Last update tick */
  lastUpdate: number;
}

/**
 * Power processing recommendation
 */
export interface PowerProcessingRecommendation {
  /** Room name */
  roomName: string;
  /** Should process power */
  shouldProcess: boolean;
  /** Reason */
  reason: string;
  /** Current power in storage */
  powerAvailable: number;
  /** Current energy in storage */
  energyAvailable: number;
  /** Priority (higher = more important) */
  priority: number;
}

/**
 * Power Creep Manager
 */
@ProcessClass()
export class PowerCreepManager {
  private config: PowerCreepConfig;
  private assignments: Map<string, PowerCreepAssignment> = new Map();
  private gplState: GPLState | null = null;
  private lastGPLUpdate = 0;

  public constructor(config: Partial<PowerCreepConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main tick - manage GPL progression and power creeps
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:powerCreep", "Power Creep Management", {
    priority: ProcessPriority.LOW,
    interval: 20,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.03
  })
  public run(): void {
    // Update GPL state
    this.updateGPLState();

    // Manage power processing
    this.managePowerProcessing();

    // Manage power creep assignments
    this.manageAssignments();

    // Check for respawn needs
    this.checkRespawnNeeds();

    // Log status periodically
    if (Game.time % 100 === 0) {
      this.logStatus();
    }
  }

  /**
   * Update GPL state tracking
   */
  private updateGPLState(): void {
    if (!Game.gpl) {
      this.gplState = null;
      return;
    }

    const currentLevel = Game.gpl.level;
    const currentProgress = Game.gpl.progress;
    const progressNeeded = Game.gpl.progressTotal;

    // Calculate power processed since last update
    let powerProcessedThisTick = 0;
    if (this.gplState && this.gplState.currentProgress < currentProgress) {
      powerProcessedThisTick = currentProgress - this.gplState.currentProgress;
    }

    // Estimate ticks to next level
    const remaining = progressNeeded - currentProgress;
    const avgProcessingRate = this.gplState?.powerProcessedThisTick ?? 1;
    const ticksToNextLevel = avgProcessingRate > 0 ? Math.ceil(remaining / avgProcessingRate) : Infinity;

    // Find next milestone
    const targetMilestone =
      this.config.gplMilestones.find(m => m > currentLevel) ?? currentLevel + 1;

    this.gplState = {
      currentLevel,
      currentProgress,
      progressNeeded,
      powerProcessedThisTick,
      totalPowerProcessed: (this.gplState?.totalPowerProcessed ?? 0) + powerProcessedThisTick,
      ticksToNextLevel,
      targetMilestone,
      lastUpdate: Game.time
    };

    // Log milestone achievements
    if (this.lastGPLUpdate !== currentLevel && currentLevel > 0) {
      logger.info(`GPL milestone reached: Level ${currentLevel}`, {
        subsystem: "PowerCreep"
      });
      this.lastGPLUpdate = currentLevel;
    }
  }

  /**
   * Manage power processing across rooms
   */
  private managePowerProcessing(): void {
    const recommendations = this.evaluatePowerProcessing();

    for (const rec of recommendations) {
      if (!rec.shouldProcess) continue;

      const room = Game.rooms[rec.roomName];
      if (!room) continue;

      // Find power spawn
      const powerSpawn = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_SPAWN
      })[0] as StructurePowerSpawn | undefined;

      if (!powerSpawn) continue;

      // Check if power spawn can process (has enough power and energy)
      const hasPower = powerSpawn.store.getUsedCapacity(RESOURCE_POWER) > 0;
      const hasEnergy = powerSpawn.store.getUsedCapacity(RESOURCE_ENERGY) >= 50;

      if (hasPower && hasEnergy) {
        const result = powerSpawn.processPower();
        if (result === OK) {
          logger.debug(`Processing power in ${rec.roomName}: ${rec.reason}`, {
            subsystem: "PowerCreep"
          });
        }
      }
    }
  }

  /**
   * Evaluate which rooms should process power
   */
  private evaluatePowerProcessing(): PowerProcessingRecommendation[] {
    const recommendations: PowerProcessingRecommendation[] = [];

    // Get all owned rooms with power spawns
    const roomsWithPowerSpawn = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_SPAWN
      }).length > 0
    );

    for (const room of roomsWithPowerSpawn) {
      const storage = room.storage;
      const terminal = room.terminal;

      if (!storage && !terminal) continue;

      const powerAvailable = (storage?.store.getUsedCapacity(RESOURCE_POWER) ?? 0) +
        (terminal?.store.getUsedCapacity(RESOURCE_POWER) ?? 0);
      const energyAvailable = storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;

      let shouldProcess = false;
      let reason = "";
      let priority = 0;

      // Check if we have enough reserves
      if (powerAvailable < 100) {
        shouldProcess = false;
        reason = "Insufficient power (<100)";
      } else if (energyAvailable < this.config.minEnergyReserve) {
        shouldProcess = false;
        reason = `Insufficient energy (<${this.config.minEnergyReserve})`;
      } else if (this.gplState && this.gplState.currentLevel < this.gplState.targetMilestone) {
        // Push towards GPL milestone
        shouldProcess = true;
        reason = `GPL progression: ${this.gplState.currentLevel} → ${this.gplState.targetMilestone}`;
        priority = 100 - Math.abs(this.gplState.currentLevel - this.gplState.targetMilestone);
      } else if (powerAvailable > this.config.minPowerReserve) {
        // Process excess power
        shouldProcess = true;
        reason = `Excess power (${powerAvailable} > ${this.config.minPowerReserve})`;
        priority = 50;
      } else {
        shouldProcess = false;
        reason = "Power reserved for power banks";
      }

      recommendations.push({
        roomName: room.name,
        shouldProcess,
        reason,
        powerAvailable,
        energyAvailable,
        priority
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Manage power creep assignments
   */
  private manageAssignments(): void {
    // Update existing assignments
    for (const name in Game.powerCreeps) {
      const pc = Game.powerCreeps[name];
      if (!pc) continue;

      let assignment = this.assignments.get(name);
      if (!assignment) {
        // Create new assignment
        assignment = this.createAssignment(pc);
        this.assignments.set(name, assignment);
      } else {
        // Update existing assignment
        assignment.level = pc.level;
        assignment.spawned = pc.ticksToLive !== undefined;
        if (assignment.spawned && !assignment.lastRespawnTick) {
          assignment.lastRespawnTick = Game.time;
        }
      }
    }

    // Consider creating new power creeps if we have GPL capacity
    this.considerNewPowerCreeps();
  }

  /**
   * Create assignment for a power creep
   */
  private createAssignment(pc: PowerCreep): PowerCreepAssignment {
    // Determine role based on powers
    const hasOperateSpawn = pc.powers[PWR_OPERATE_SPAWN] !== undefined;
    const hasDisruptSpawn = pc.powers[PWR_DISRUPT_SPAWN] !== undefined;
    const role: "powerQueen" | "powerWarrior" = hasDisruptSpawn ? "powerWarrior" : "powerQueen";

    // Find best room for assignment
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    let bestRoom = ownedRooms[0]?.name ?? "";

    if (role === "powerQueen") {
      // Economy operator: assign to highest RCL room with most structures
      const economyRoom = ownedRooms
        .filter(r => r.controller && r.controller.level >= 7)
        .sort((a, b) => {
          const aScore = (a.controller?.level ?? 0) * 100 +
            a.find(FIND_MY_STRUCTURES).length;
          const bScore = (b.controller?.level ?? 0) * 100 +
            b.find(FIND_MY_STRUCTURES).length;
          return bScore - aScore;
        })[0];
      if (economyRoom) bestRoom = economyRoom.name;
    } else {
      // Combat operator: assign to room with most military activity or threats
      const swarms = ownedRooms.map(r => ({
        room: r,
        swarm: memoryManager.getSwarmState(r.name)
      }));
      const combatRoom = swarms
        .filter(s => s.swarm !== null)
        .sort((a, b) => {
          const aDanger = a.swarm!.danger * 100 + a.swarm!.metrics.hostileCount;
          const bDanger = b.swarm!.danger * 100 + b.swarm!.metrics.hostileCount;
          return bDanger - aDanger;
        })[0];
      if (combatRoom) bestRoom = combatRoom.room.name;
    }

    const assignment: PowerCreepAssignment = {
      name: pc.name,
      className: pc.className,
      role,
      assignedRoom: bestRoom,
      level: pc.level,
      spawned: pc.ticksToLive !== undefined,
      lastRespawnTick: pc.ticksToLive !== undefined ? Game.time : undefined,
      priority: role === "powerQueen" ? 100 : 80
    };

    // Store assignment in power creep memory
    const memory = pc.memory as { homeRoom?: string; role?: string };
    memory.homeRoom = bestRoom;
    memory.role = role;

    logger.info(`Power creep ${pc.name} assigned as ${role} to ${bestRoom}`, {
      subsystem: "PowerCreep"
    });

    return assignment;
  }

  /**
   * Consider creating new power creeps
   */
  private considerNewPowerCreeps(): void {
    if (!this.gplState || this.gplState.currentLevel < this.config.minGPL) {
      return;
    }

    // Count existing power creeps
    const existingCount = Object.keys(Game.powerCreeps).length;
    const maxAllowed = this.gplState.currentLevel;

    if (existingCount >= maxAllowed) {
      return;
    }

    // Create new power creeps based on needs
    const economyOperatorCount = Array.from(this.assignments.values()).filter(
      a => a.role === "powerQueen"
    ).length;
    const combatOperatorCount = Array.from(this.assignments.values()).filter(
      a => a.role === "powerWarrior"
    ).length;

    // Strategy: 70% economy, 30% combat
    const shouldCreateEconomy = economyOperatorCount < Math.ceil(maxAllowed * 0.7);
    const shouldCreateCombat = combatOperatorCount < Math.floor(maxAllowed * 0.3);

    if (shouldCreateEconomy || shouldCreateCombat) {
      const name = `operator_${Game.time}`;
      const className = POWER_CLASS.OPERATOR;
      const result = PowerCreep.create(name, className);

      if (result === OK) {
        logger.info(`Created new power creep: ${name} (${className})`, {
          subsystem: "PowerCreep"
        });
      } else {
        logger.warn(`Failed to create power creep: ${result}`, {
          subsystem: "PowerCreep"
        });
      }
    }
  }

  /**
   * Check for power creeps that need respawning
   */
  private checkRespawnNeeds(): void {
    for (const [name, assignment] of this.assignments) {
      const pc = Game.powerCreeps[name];
      if (!pc) continue;

      // Check if needs respawn
      if (pc.ticksToLive === undefined) {
        // Not spawned - find power spawn to respawn at
        const room = Game.rooms[assignment.assignedRoom];
        if (!room) continue;

        const powerSpawn = room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_POWER_SPAWN
        })[0] as StructurePowerSpawn | undefined;

        if (powerSpawn) {
          const result = pc.spawn(powerSpawn);
          if (result === OK) {
            logger.info(`Power creep ${name} spawned at ${room.name}`, {
              subsystem: "PowerCreep"
            });
            assignment.spawned = true;
            assignment.lastRespawnTick = Game.time;
          }
        }
      } else if (pc.ticksToLive < 500) {
        // Low TTL - find power spawn for renewal
        const room = pc.room;
        if (!room) continue;

        const powerSpawn = room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_POWER_SPAWN
        })[0] as StructurePowerSpawn | undefined;

        if (powerSpawn && pc.pos.getRangeTo(powerSpawn) <= 1) {
          const result = pc.renew(powerSpawn);
          if (result === OK) {
            logger.debug(`Power creep ${name} renewed`, {
              subsystem: "PowerCreep"
            });
          }
        }
      }
    }
  }

  /**
   * Get GPL state
   */
  public getGPLState(): GPLState | null {
    return this.gplState;
  }

  /**
   * Get power creep assignments
   */
  public getAssignments(): PowerCreepAssignment[] {
    return Array.from(this.assignments.values());
  }

  /**
   * Get assignment for a power creep
   */
  public getAssignment(name: string): PowerCreepAssignment | undefined {
    return this.assignments.get(name);
  }

  /**
   * Reassign power creep to a different room
   */
  public reassignPowerCreep(name: string, newRoom: string): boolean {
    const assignment = this.assignments.get(name);
    if (!assignment) return false;

    assignment.assignedRoom = newRoom;

    const pc = Game.powerCreeps[name];
    if (pc) {
      const memory = pc.memory as { homeRoom?: string };
      memory.homeRoom = newRoom;
    }

    logger.info(`Power creep ${name} reassigned to ${newRoom}`, {
      subsystem: "PowerCreep"
    });

    return true;
  }

  /**
   * Log current status
   */
  private logStatus(): void {
    if (!this.gplState) return;

    const activeCreeps = Array.from(this.assignments.values()).filter(a => a.spawned);
    const economyOps = activeCreeps.filter(a => a.role === "powerQueen").length;
    const combatOps = activeCreeps.filter(a => a.role === "powerWarrior").length;

    logger.info(
      `Power System: GPL ${this.gplState.currentLevel} ` +
        `(${this.gplState.currentProgress}/${this.gplState.progressNeeded}), ` +
        `Operators: ${activeCreeps.length}/${this.gplState.currentLevel} ` +
        `(${economyOps} eco, ${combatOps} combat)`,
      { subsystem: "PowerCreep" }
    );
  }
}

/**
 * Global power creep manager instance
 */
export const powerCreepManager = new PowerCreepManager();
