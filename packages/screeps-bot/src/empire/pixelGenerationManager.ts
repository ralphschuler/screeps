/**
 * Pixel Generation Manager - Bot Integration
 *
 * Wraps the framework PixelGenerationManager with bot-specific process decorators and memory access
 */

import { logger } from "@ralphschuler/screeps-core";
import {
  PixelGenerationConfig,
  PixelGenerationManager as FrameworkPixelGenerationManager,
  PixelGenerationMemory,
  PixelGenerationMemoryAccessor,
  createDefaultPixelGenerationMemory
} from "@ralphschuler/screeps-empire";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";

interface PixelGenerationGlobal {
  _pixelGenerationMemory?: PixelGenerationMemory;
}

interface RoomStatsSnapshot {
  hostiles?: number;
  metrics?: {
    hostile_count?: number;
  };
  spawn_queue?: {
    emergency?: number;
  };
  taskBoard?: {
    open_tasks?: number;
    assigned_tasks?: number;
  };
}

interface EmpireMemory {
  recoveryRooms?: Record<string, true>;
}

interface PixelGateMemory {
  defenseRequests?: Record<string, unknown>[] | Record<string, Record<string, unknown>>;
  empire?: EmpireMemory;
  stats?: {
    rooms?: Record<string, RoomStatsSnapshot>;
  };
}

interface DefenseRequestLike {
  roomName?: string;
  targetRoom?: string;
  homeRoom?: string;
}

const MAX_OPEN_TASKS_FOR_PIXEL_GENERATION = 80;
const MAX_TASK_GAP_FOR_PIXEL_GENERATION = 50;

function getPixelGenerationGlobal(): PixelGenerationGlobal {
  return global as unknown as PixelGenerationGlobal;
}

function getPixelGateMemory(): PixelGateMemory {
  return (globalThis as { Memory?: PixelGateMemory }).Memory ?? {};
}

function isDefenseRequest(value: unknown): value is DefenseRequestLike {
  return Boolean(value && typeof value === "object");
}

function countDefenseRequests(defenseRequests: PixelGateMemory["defenseRequests"]): number {
  return Array.isArray(defenseRequests)
    ? defenseRequests.filter(isDefenseRequest).length
    : Object.values(defenseRequests ?? {}).filter(isDefenseRequest).length;
}

function hasDefenseRequestPressure(memory: PixelGateMemory): boolean {
  return countDefenseRequests(memory.defenseRequests) > 0;
}

function hasRecoveryPressure(memory: PixelGateMemory): boolean {
  return Boolean(memory.empire?.recoveryRooms && Object.keys(memory.empire.recoveryRooms).length > 0);
}

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

/**
 * Memory accessor implementation using heap-backed global state.
 */
class BotPixelGenerationMemoryAccessor implements PixelGenerationMemoryAccessor {
  ensurePixelGenerationMemory(): void {
    // Heap state survives within the current VM, but resets on Screeps global resets.
    const pixelGlobal = getPixelGenerationGlobal();
    if (!pixelGlobal._pixelGenerationMemory) {
      pixelGlobal._pixelGenerationMemory = createDefaultPixelGenerationMemory();
    }
  }

  getPixelGenerationMemory(): PixelGenerationMemory | undefined {
    return getPixelGenerationGlobal()._pixelGenerationMemory;
  }
}

/**
 * Bot-integrated Pixel Generation Manager
 * Wraps framework implementation with process decorators
 */
@ProcessClass()
export class BotPixelGenerationManager extends FrameworkPixelGenerationManager {
  private lastGateReason: string | undefined = undefined;

  constructor(config: Partial<PixelGenerationConfig> = {}) {
    super(config, new BotPixelGenerationMemoryAccessor());
  }

  protected isGenerationAllowed(_memory: PixelGenerationMemory): boolean {
    const reason = this.getPixelGenerationBlockReason();

    if (reason) {
      if (this.lastGateReason !== reason) {
        this.lastGateReason = reason;
        logger.debug("Skipping pixel generation", {
          subsystem: "PixelGeneration",
          meta: {
            reason
          }
        });
      }
      return false;
    }

    if (this.lastGateReason !== undefined) {
      this.lastGateReason = undefined;
    }

    return true;
  }

  private getPixelGenerationBlockReason(): string | undefined {
    const memory = getPixelGateMemory();

    if (hasDefenseRequestPressure(memory)) {
      return "active-defense-requests";
    }

    if (hasRecoveryPressure(memory)) {
      return "recovery-mode";
    }

    const roomStats = memory.stats?.rooms;
    if (!roomStats) {
      return undefined;
    }

    for (const [roomName, room] of Object.entries(roomStats)) {
      const hostileCreeps = toNumber(room?.hostiles ?? room?.metrics?.hostile_count);
      if (hostileCreeps > 0) {
        return `hostile-pressure:${roomName}`;
      }

      const emergencySpawnQueue = toNumber(room?.spawn_queue?.emergency);
      if (emergencySpawnQueue > 0) {
        return `emergency-spawn:${roomName}`;
      }

      const openTasks = toNumber(room?.taskBoard?.open_tasks);
      const assignedTasks = toNumber(room?.taskBoard?.assigned_tasks);
      const openTaskGap = openTasks - assignedTasks;
      if (openTasks >= MAX_OPEN_TASKS_FOR_PIXEL_GENERATION || openTaskGap >= MAX_TASK_GAP_FOR_PIXEL_GENERATION) {
        return `task-backlog:${roomName}`;
      }
    }

    return undefined;
  }

  /**
   * Main pixel generation tick
   * Registered as kernel process via decorator
   *
   * Note: Uses interval: 1 to check every tick for accurate consecutive tick counting
   * The IDLE priority ensures this only runs when bot has excess CPU
   */
  @LowFrequencyProcess("empire:pixelGeneration", "Pixel Generation Manager", {
    priority: ProcessPriority.IDLE, // Very low priority - only when everything else is fine
    interval: 1, // Must check every tick to track consecutive ticks accurately
    minBucket: 10000,
    cpuBudget: 0.01
  })
  public run(): void {
    super.run();
  }
}

/**
 * Global pixel generation manager instance
 */
export const pixelGenerationManager = new BotPixelGenerationManager();

export type {
  PixelGenerationConfig,
  PixelGenerationMemory,
  PixelGenerationMemoryAccessor
} from "@ralphschuler/screeps-empire";
export { createDefaultPixelGenerationMemory } from "@ralphschuler/screeps-empire";
