/**
 * Evacuation Manager
 *
 * Manages room evacuation logic:
 * - Evacuation trigger detection
 * - Resource priority system
 * - Terminal transfer coordination
 * - Creep recall mechanism
 *
 * Addresses Issue: #31
 */

import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";

/**
 * Evacuation configuration
 */
export interface EvacuationConfig {
  /** Danger level to trigger evacuation consideration */
  triggerDangerLevel: number;
  /** Ticks until nuke impact to start evacuation */
  nukeEvacuationLeadTime: number;
  /** Minimum storage energy to consider evacuating */
  minStorageEnergy: number;
  /** Resources to prioritize for evacuation */
  priorityResources: ResourceConstant[];
  /** Maximum terminal transfers per tick */
  maxTransfersPerTick: number;
}

const DEFAULT_CONFIG: EvacuationConfig = {
  triggerDangerLevel: 3,
  nukeEvacuationLeadTime: 5000,
  minStorageEnergy: 50000,
  priorityResources: [
    RESOURCE_ENERGY,
    RESOURCE_POWER,
    RESOURCE_GHODIUM,
    RESOURCE_CATALYZED_GHODIUM_ACID,
    RESOURCE_CATALYZED_UTRIUM_ACID,
    RESOURCE_CATALYZED_LEMERGIUM_ACID,
    RESOURCE_CATALYZED_KEANIUM_ACID,
    RESOURCE_CATALYZED_ZYNTHIUM_ACID,
    RESOURCE_OPS
  ],
  maxTransfersPerTick: 2
};

/**
 * Evacuation state for a room
 */
export interface EvacuationState {
  /** Room being evacuated */
  roomName: string;
  /** Evacuation reason */
  reason: "nuke" | "siege" | "hostile_takeover" | "manual";
  /** Evacuation started tick */
  startedAt: number;
  /** Target room for resources */
  targetRoom: string;
  /** Resources evacuated */
  resourcesEvacuated: { resourceType: ResourceConstant; amount: number }[];
  /** Creeps recalled */
  creepsRecalled: string[];
  /** Evacuation progress (0-100) */
  progress: number;
  /** Whether evacuation is complete */
  complete: boolean;
  /** Deadline (e.g., nuke impact tick) */
  deadline?: number;
}

/**
 * Evacuation Manager
 */
@ProcessClass()
export class EvacuationManager {
  private config: EvacuationConfig;
  private evacuations: Map<string, EvacuationState> = new Map();
  private lastTransferTick = 0;
  private transfersThisTick = 0;

  public constructor(config: Partial<EvacuationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main tick - check for evacuation triggers and process active evacuations
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("cluster:evacuation", "Evacuation Manager", {
    priority: ProcessPriority.HIGH,
    interval: 5,
    minBucket: 2000,
    cpuBudget: 0.02
  })
  public run(): void {
    // Reset transfer counter
    if (Game.time !== this.lastTransferTick) {
      this.transfersThisTick = 0;
      this.lastTransferTick = Game.time;
    }

    // Check for evacuation triggers in owned rooms
    this.checkEvacuationTriggers();

    // Process active evacuations
    for (const state of this.evacuations.values()) {
      if (!state.complete) {
        this.processEvacuation(state);
      }
    }

    // Clean up completed evacuations after 1000 ticks
    for (const [roomName, state] of this.evacuations.entries()) {
      if (state.complete && Game.time - state.startedAt > 1000) {
        this.evacuations.delete(roomName);
      }
    }
  }

  /**
   * Check for evacuation triggers
   */
  private checkEvacuationTriggers(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      // Skip if already evacuating
      if (this.evacuations.has(roomName)) continue;

      const swarm = memoryManager.getSwarmState(roomName);
      if (!swarm) continue;

      // Check for nuke
      const nukes = room.find(FIND_NUKES);
      if (nukes.length > 0 && swarm.nukeDetected) {
        const nearestNuke = nukes.reduce((a, b) =>
          (a.timeToLand ?? Infinity) < (b.timeToLand ?? Infinity) ? a : b
        );

        if ((nearestNuke.timeToLand ?? Infinity) <= this.config.nukeEvacuationLeadTime) {
          // Increase urgency based on number of nukes
          const nukeCount = nukes.length;
          logger.warn(
            `Triggering evacuation for ${roomName}: ${nukeCount} nuke(s) detected, impact in ${nearestNuke.timeToLand ?? 0} ticks`,
            { subsystem: "Evacuation" }
          );
          
          this.startEvacuation(roomName, "nuke", Game.time + (nearestNuke.timeToLand ?? 0));
          continue;
        }
      }

      // Check for siege (danger level 3)
      if (swarm.danger >= this.config.triggerDangerLevel && swarm.posture === "siege") {
        // Only evacuate if we're clearly losing
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const defenders = room.find(FIND_MY_CREEPS, {
          filter: c => {
            const body = c.body.map(p => p.type);
            return body.includes(ATTACK) || body.includes(RANGED_ATTACK);
          }
        });

        if (hostiles.length > defenders.length * 3) {
          this.startEvacuation(roomName, "siege");
          continue;
        }
      }
    }
  }

  /**
   * Start evacuation for a room
   */
  public startEvacuation(
    roomName: string,
    reason: EvacuationState["reason"],
    deadline?: number
  ): boolean {
    if (this.evacuations.has(roomName)) {
      return false; // Already evacuating
    }

    const room = Game.rooms[roomName];
    if (!room || !room.controller?.my) return false;

    // Find target room for evacuation
    const targetRoom = this.findEvacuationTarget(roomName);
    if (!targetRoom) {
      logger.error(`Cannot evacuate ${roomName}: no valid target room found`, {
        subsystem: "Evacuation"
      });
      return false;
    }

    const state: EvacuationState = {
      roomName,
      reason,
      startedAt: Game.time,
      targetRoom,
      resourcesEvacuated: [],
      creepsRecalled: [],
      progress: 0,
      complete: false,
      deadline
    };

    this.evacuations.set(roomName, state);

    // Update room posture
    const swarm = memoryManager.getSwarmState(roomName);
    if (swarm) {
      swarm.posture = "evacuate";
    }

    logger.warn(
      `Starting evacuation of ${roomName} (${reason}), target: ${targetRoom}` +
        (deadline ? `, deadline: ${deadline - Game.time} ticks` : ""),
      { subsystem: "Evacuation" }
    );

    return true;
  }

  /**
   * Find best target room for evacuation
   */
  private findEvacuationTarget(fromRoom: string): string | null {
    const ownedRooms = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.name !== fromRoom
    );

    if (ownedRooms.length === 0) return null;

    // Score target rooms
    const candidates = ownedRooms
      .map(room => {
        let score = 0;

        // Terminal required for transfers
        if (!room.terminal) return { room, score: -1000 };

        // Prefer closer rooms
        const distance = Game.map.getRoomLinearDistance(fromRoom, room.name);
        score -= distance * 10;

        // Prefer rooms with free terminal capacity
        const freeCapacity = room.terminal.store.getFreeCapacity();
        score += Math.min(100, freeCapacity / 10000) * 10;

        // Prefer higher RCL rooms
        score += (room.controller?.level ?? 0) * 5;

        // Prefer rooms with storage
        if (room.storage) {
          score += 50;
          // Prefer rooms with free storage capacity
          const storageFree = room.storage.store.getFreeCapacity();
          score += Math.min(100, storageFree / 50000) * 5;
        }

        // Avoid rooms under attack
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
          score -= hostiles.length * 20;
        }

        return { room, score };
      })
      .filter(c => c.score > -500)
      .sort((a, b) => b.score - a.score);

    return candidates.length > 0 ? (candidates[0]?.room.name ?? null) : null;
  }

  /**
   * Process an active evacuation
   */
  private processEvacuation(state: EvacuationState): void {
    const room = Game.rooms[state.roomName];
    const targetRoom = Game.rooms[state.targetRoom];

    if (!room) {
      // Lost room - evacuation failed
      state.complete = true;
      logger.error(`Lost room ${state.roomName} during evacuation`, {
        subsystem: "Evacuation"
      });
      return;
    }

    // Transfer resources via terminal
    if (this.transfersThisTick < this.config.maxTransfersPerTick) {
      this.transferResources(state, room, targetRoom);
    }

    // Recall creeps
    this.recallCreeps(state, room);

    // Update progress
    state.progress = this.calculateProgress(state, room);

    // Check if complete
    if (state.progress >= 100) {
      state.complete = true;
      logger.info(
        `Evacuation of ${state.roomName} complete: ` +
          `${state.resourcesEvacuated.reduce((sum, r) => sum + r.amount, 0)} resources, ` +
          `${state.creepsRecalled.length} creeps`,
        { subsystem: "Evacuation" }
      );
    }

    // Check deadline
    if (state.deadline && Game.time >= state.deadline) {
      state.complete = true;
      logger.warn(`Evacuation of ${state.roomName} reached deadline`, {
        subsystem: "Evacuation"
      });
    }
  }

  /**
   * Transfer resources to target room
   */
  private transferResources(
    state: EvacuationState,
    sourceRoom: Room,
    targetRoom?: Room
  ): void {
    const sourceTerminal = sourceRoom.terminal;
    const targetTerminal = targetRoom?.terminal;

    if (!sourceTerminal || !targetTerminal) return;

    // Calculate transfer cost - energy cost formula from Screeps API
    const TRANSFER_DISTANCE_DECAY_FACTOR = 30;
    const distance = Game.map.getRoomLinearDistance(sourceRoom.name, state.targetRoom);
    const transferCost = (amount: number) => Math.ceil(amount * (1 - Math.exp(-distance / TRANSFER_DISTANCE_DECAY_FACTOR)));

    // Transfer priority resources first
    for (const resourceType of this.config.priorityResources) {
      const amount = sourceTerminal.store.getUsedCapacity(resourceType);
      if (amount <= 0) continue;

      // Check target capacity
      const targetFree = targetTerminal.store.getFreeCapacity(resourceType);
      if (targetFree <= 0) continue;

      // Calculate transfer amount
      const cost = transferCost(amount);
      const energyAvailable = sourceTerminal.store.getUsedCapacity(RESOURCE_ENERGY);

      if (resourceType !== RESOURCE_ENERGY && cost > energyAvailable) {
        continue; // Not enough energy for transfer
      }

      const transferAmount = Math.min(amount, targetFree, 50000);
      if (transferAmount <= 0) continue;

      const result = sourceTerminal.send(resourceType, transferAmount, state.targetRoom);
      if (result === OK) {
        state.resourcesEvacuated.push({ resourceType, amount: transferAmount });
        this.transfersThisTick++;

        logger.debug(
          `Evacuated ${transferAmount} ${resourceType} from ${sourceRoom.name} to ${state.targetRoom}`,
          { subsystem: "Evacuation" }
        );

        return; // One transfer at a time
      }
    }

    // Transfer other resources
    for (const resourceType of Object.keys(sourceTerminal.store) as ResourceConstant[]) {
      if (this.config.priorityResources.includes(resourceType)) continue;

      const amount = sourceTerminal.store.getUsedCapacity(resourceType);
      if (amount <= 0) continue;

      const targetFree = targetTerminal.store.getFreeCapacity(resourceType);
      if (targetFree <= 0) continue;

      const cost = transferCost(amount);
      const energyAvailable = sourceTerminal.store.getUsedCapacity(RESOURCE_ENERGY);

      if (resourceType !== RESOURCE_ENERGY && cost > energyAvailable) {
        continue;
      }

      const transferAmount = Math.min(amount, targetFree, 50000);
      if (transferAmount <= 0) continue;

      const result = sourceTerminal.send(resourceType, transferAmount, state.targetRoom);
      if (result === OK) {
        state.resourcesEvacuated.push({ resourceType, amount: transferAmount });
        this.transfersThisTick++;
        return;
      }
    }
  }

  /**
   * Recall creeps from the evacuating room
   */
  private recallCreeps(state: EvacuationState, room: Room): void {
    // Mark creeps for recall
    for (const creep of room.find(FIND_MY_CREEPS)) {
      const memory = creep.memory as unknown as { evacuating?: boolean; evacuationTarget?: string };

      if (!memory.evacuating) {
        memory.evacuating = true;
        memory.evacuationTarget = state.targetRoom;
        state.creepsRecalled.push(creep.name);
      }
    }
  }

  /**
   * Calculate evacuation progress
   */
  private calculateProgress(state: EvacuationState, room: Room): number {
    // Resources progress (50%)
    const terminal = room.terminal;
    const storage = room.storage;

    let totalResources = 0;
    let remainingResources = 0;

    if (terminal) {
      totalResources += 100000; // Assume max terminal
      remainingResources += terminal.store.getUsedCapacity();
    }

    if (storage) {
      totalResources += storage.store.getCapacity();
      remainingResources += storage.store.getUsedCapacity();
    }

    const resourceProgress = totalResources > 0
      ? Math.min(100, ((totalResources - remainingResources) / totalResources) * 100)
      : 100;

    // Creep progress (50%)
    const creepsInRoom = room.find(FIND_MY_CREEPS).length;
    const creepProgress = state.creepsRecalled.length > 0
      ? Math.min(100, ((state.creepsRecalled.length - creepsInRoom) / state.creepsRecalled.length) * 100)
      : 100;

    return Math.round((resourceProgress + creepProgress) / 2);
  }

  /**
   * Cancel an evacuation
   */
  public cancelEvacuation(roomName: string): void {
    const state = this.evacuations.get(roomName);
    if (!state) return;

    this.evacuations.delete(roomName);

    // Reset creep memory
    for (const creepName of state.creepsRecalled) {
      const creep = Game.creeps[creepName];
      if (creep) {
        const memory = creep.memory as unknown as { evacuating?: boolean; evacuationTarget?: string };
        delete memory.evacuating;
        delete memory.evacuationTarget;
      }
    }

    // Reset room posture
    const swarm = memoryManager.getSwarmState(roomName);
    if (swarm) {
      swarm.posture = "eco";
    }

    logger.info(`Evacuation of ${roomName} cancelled`, { subsystem: "Evacuation" });
  }

  /**
   * Get evacuation state for a room
   */
  public getEvacuationState(roomName: string): EvacuationState | undefined {
    return this.evacuations.get(roomName);
  }

  /**
   * Check if a room is being evacuated
   */
  public isEvacuating(roomName: string): boolean {
    const state = this.evacuations.get(roomName);
    return state !== undefined && !state.complete;
  }

  /**
   * Get all active evacuations
   */
  public getActiveEvacuations(): EvacuationState[] {
    return Array.from(this.evacuations.values()).filter(s => !s.complete);
  }
}

/**
 * Global evacuation manager instance
 */
export const evacuationManager = new EvacuationManager();
