/**
 * Pixel Generation Manager - Bot Integration
 * 
 * Wraps the framework PixelGenerationManager with bot-specific process decorators and memory access
 */

import {
  PixelGenerationManager as FrameworkPixelGenerationManager,
  PixelGenerationConfig,
  PixelGenerationMemory,
  PixelGenerationMemoryAccessor,
  createDefaultPixelGenerationMemory
} from "@ralphschuler/screeps-empire";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";

/**
 * Memory accessor implementation using global memory
 */
class BotPixelGenerationMemoryAccessor implements PixelGenerationMemoryAccessor {
  ensurePixelGenerationMemory(): void {
    // Use global memory to persist across global resets
    const g = global as any;
    if (!g._pixelGenerationMemory) {
      g._pixelGenerationMemory = createDefaultPixelGenerationMemory();
    }
  }

  getPixelGenerationMemory(): PixelGenerationMemory | undefined {
    const g = global as any;
    return g._pixelGenerationMemory as PixelGenerationMemory | undefined;
  }
}

/**
 * Bot-integrated Pixel Generation Manager
 * Wraps framework implementation with process decorators
 */
@ProcessClass()
class BotPixelGenerationManager extends FrameworkPixelGenerationManager {
  constructor(config: Partial<PixelGenerationConfig> = {}) {
    super(config, new BotPixelGenerationMemoryAccessor());
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
    minBucket: 0,
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

// Re-export types for backward compatibility
export type {
  PixelGenerationConfig,
  PixelGenerationMemory,
  PixelGenerationMemoryAccessor
} from "@ralphschuler/screeps-empire";
export { createDefaultPixelGenerationMemory } from "@ralphschuler/screeps-empire";
