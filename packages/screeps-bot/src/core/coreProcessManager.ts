/**
 * Core Process Manager
 *
 * Manages core bot processes that don't belong to a specific subsystem:
 * - Memory cleanup (removing dead creeps)
 * - Memory size monitoring
 * - Memory segment statistics
 * - Pheromone diffusion
 * - Lab configuration initialization
 * - Path cache precaching
 *
 * All processes use decorators for declarative registration with the kernel.
 */

import { HighFrequencyProcess, IdleProcess, LowFrequencyProcess, MediumFrequencyProcess, ProcessClass } from "./processDecorators";
import { ProcessPriority, kernel } from "./kernel";
import type { SwarmState } from "../memory/schemas";
import { memoryManager } from "../memory/manager";
import { pheromoneManager } from "../logic/pheromone";
import { labConfigManager } from "../labs/labConfig";
import { memorySegmentStats } from "./memorySegmentStats";
import { logger } from "./logger";

/**
 * Core Process Manager Class
 */
@ProcessClass()
export class CoreProcessManager {
  /**
   * Memory Cleanup - Remove dead creeps from Memory
   * Runs every 50 ticks to clean up memory for creeps that no longer exist
   */
  @LowFrequencyProcess("core:memoryCleanup", "Memory Cleanup", {
    priority: ProcessPriority.LOW,
    interval: 50,
    cpuBudget: 0.01
  })
  public cleanupMemory(): void {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  }

  /**
   * Memory Size Check - Monitor memory usage
   * Runs every 100 ticks to warn about high memory usage
   */
  @IdleProcess("core:memorySizeCheck", "Memory Size Check", {
    interval: 100,
    cpuBudget: 0.005
  })
  public checkMemorySize(): void {
    const used = RawMemory.get().length;
    const limit = 2 * 1024 * 1024; // 2MB
    const percentage = (used / limit) * 100;

    if (percentage > 90) {
      logger.error(`Memory usage critical: ${percentage.toFixed(1)}% (${used}/${limit} bytes)`, {
        subsystem: "Memory"
      });
    } else if (percentage > 75) {
      logger.warn(`Memory usage high: ${percentage.toFixed(1)}% (${used}/${limit} bytes)`, {
        subsystem: "Memory"
      });
    }
  }

  /**
   * Memory Segment Stats - Update segment statistics
   * Runs every 10 ticks to track memory segment usage
   */
  @MediumFrequencyProcess("core:memorySegmentStats", "Memory Segment Stats", {
    priority: ProcessPriority.IDLE,
    interval: 10,
    cpuBudget: 0.01
  })
  public updateMemorySegmentStats(): void {
    memorySegmentStats.run();
  }

  /**
   * Pheromone Diffusion - Inter-room communication
   * Runs every 10 ticks to diffuse pheromone signals between rooms
   */
  @MediumFrequencyProcess("cluster:pheromoneDiffusion", "Pheromone Diffusion", {
    priority: ProcessPriority.MEDIUM,
    interval: 10,
    cpuBudget: 0.02
  })
  public runPheromoneDiffusion(): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    const swarmStates = new Map<string, SwarmState>();
    for (const room of ownedRooms) {
      const state = memoryManager.getSwarmState(room.name);
      if (state) {
        swarmStates.set(room.name, state);
      }
    }
    pheromoneManager.applyDiffusion(swarmStates);
  }

  /**
   * Lab Config Manager - Initialize lab configurations
   * Runs every 200 ticks to set up lab configurations for rooms
   */
  @LowFrequencyProcess("room:labConfig", "Lab Config Manager", {
    priority: ProcessPriority.LOW,
    interval: 200,
    cpuBudget: 0.01
  })
  public initializeLabConfigs(): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    for (const room of ownedRooms) {
      labConfigManager.initialize(room.name);
    }
  }

  /**
   * Path Cache Precaching - Pre-cache room paths
   * Runs every 1000 ticks to precache frequently used paths
   */
  // Path cache precaching is now handled by screeps-cartographer internally
  // This process is no longer needed with the cartographer library
  @IdleProcess("room:pathCachePrecache", "Path Cache Precache (Disabled)", {
    interval: 1000,
    cpuBudget: 0.01
  })
  public precacheRoomPaths(): void {
    // No-op: Cartographer handles path caching internally
  }
}

/**
 * Global core process manager instance
 */
export const coreProcessManager = new CoreProcessManager();
