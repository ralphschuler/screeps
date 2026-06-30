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

import { memoryManager } from "@ralphschuler/screeps-memory";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { pheromoneManager } from "@ralphschuler/screeps-pheromones";
import { memorySegmentStats } from "@ralphschuler/screeps-stats";
import { getConfig } from "../config";
import { labConfigManager } from "../labs/labConfig";
import { ProcessPriority } from "./kernel";
import { logger } from "./logger";
import { IdleProcess, LowFrequencyProcess, MediumFrequencyProcess, ProcessClass } from "./processDecorators";

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
    const rawMemory = (globalThis as { RawMemory?: { get?: () => string } }).RawMemory;
    let used: number;

    if (rawMemory?.get && typeof rawMemory.get === "function") {
      const memoryDump = rawMemory.get();
      if (typeof memoryDump === "string") {
        used = memoryDump.length;
      } else {
        return;
      }
    } else {
      // In simulation/test environments RawMemory.get can be unavailable.
      // Fall back to approximate memory size from serialized Memory object.
      try {
        used = JSON.stringify(Memory).length;
      } catch {
        used = 0;
      }
    }

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
   * Memory Segment Stats - Update segment statistics.
   * Live profiling showed this optional monitor can cost multiple CPU when it samples all segments,
   * so keep it low-frequency and only run while the bucket is healthy.
   */
  @IdleProcess("core:memorySegmentStats", "Memory Segment Stats", {
    interval: 500,
    minBucket: getConfig().cpu.bucketThresholds.highMode,
    cpuBudget: 0.01
  })
  public updateMemorySegmentStats(): void {
    memorySegmentStats.run();
  }

  /**
   * Pheromone Diffusion - Inter-room communication.
   * Strategic signal propagation is not tactical tick work; run less often to protect CPU.
   */
  @MediumFrequencyProcess("cluster:pheromoneDiffusion", "Pheromone Diffusion", {
    priority: ProcessPriority.LOW,
    interval: 50,
    minBucket: getConfig().cpu.bucketThresholds.lowMode,
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
