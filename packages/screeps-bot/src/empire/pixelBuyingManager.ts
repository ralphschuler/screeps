/**
 * Pixel Buying Manager - Bot Integration
 * 
 * Wraps the framework PixelBuyingManager with bot-specific process decorators and memory access
 */

import {
  PixelBuyingManager as FrameworkPixelBuyingManager,
  PixelBuyingConfig,
  PixelBuyingMemory,
  PixelBuyingMemoryAccessor,
  createDefaultPixelBuyingMemory
} from "@ralphschuler/screeps-empire";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { memoryManager } from "@ralphschuler/screeps-memory";

/**
 * Memory accessor implementation for bot's memory system
 */
class BotPixelBuyingMemoryAccessor implements PixelBuyingMemoryAccessor {
  ensurePixelBuyingMemory(): void {
    const empire = memoryManager.getEmpire();
    if (!empire.market) {
      return;
    }
    // Store pixel buying data in market memory
    const marketMem = empire.market as unknown as Record<string, unknown>;
    if (!marketMem.pixelBuying) {
      marketMem.pixelBuying = createDefaultPixelBuyingMemory();
    }
  }

  getPixelBuyingMemory(): PixelBuyingMemory | undefined {
    const empire = memoryManager.getEmpire();
    if (!empire.market) return undefined;
    const marketMem = empire.market as unknown as Record<string, unknown>;
    return marketMem.pixelBuying as PixelBuyingMemory | undefined;
  }
}

/**
 * Bot-integrated Pixel Buying Manager
 * Wraps framework implementation with process decorators
 */
@ProcessClass()
class BotPixelBuyingManager extends FrameworkPixelBuyingManager {
  constructor(config: Partial<PixelBuyingConfig> = {}) {
    super(config, new BotPixelBuyingMemoryAccessor());
  }

  /**
   * Main pixel buying tick
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:pixelBuying", "Pixel Buying Manager", {
    priority: ProcessPriority.IDLE, // Very low priority - only runs when everything else is fine
    interval: 200,
    minBucket: 0,
    cpuBudget: 0.01
  })
  public run(): void {
    super.run();
  }
}

/**
 * Global pixel buying manager instance
 */
export const pixelBuyingManager = new BotPixelBuyingManager();

// Re-export types for backward compatibility
export type {
  PixelBuyingConfig,
  PixelBuyingMemory,
  PixelBuyingMemoryAccessor
} from "@ralphschuler/screeps-empire";
export { createDefaultPixelBuyingMemory } from "@ralphschuler/screeps-empire";
