/**
 * Safe Mode Manager - Emergency Defense
 *
 * Triggers safe mode when defense fails:
 * - Critical structures under attack
 * - Spawn/Storage about to be destroyed
 * - Cooldown tracking
 *
 * Addresses Issue: #21
 */

import type { SwarmState } from "@bot/memory/schemas";
import { logger } from "@bot/core/logger";

/**
 * Safe Mode Manager Class
 */
export class SafeModeManager {
  /**
   * Check if safe mode should be triggered
   */
  public checkSafeMode(room: Room, swarm: SwarmState): void {
    // Don't trigger if already in safe mode
    if (room.controller?.safeMode) {
      return;
    }

    // Don't trigger if on cooldown
    if (room.controller?.safeModeCooldown) {
      return;
    }

    // Don't trigger if no safe modes available
    if ((room.controller?.safeModeAvailable ?? 0) === 0) {
      return;
    }

    // Check if we should trigger safe mode
    if (this.shouldTriggerSafeMode(room, swarm)) {
      const result = room.controller?.activateSafeMode();
      if (result === OK) {
        logger.warn(`SAFE MODE ACTIVATED in ${room.name}`, { subsystem: "Defense" });
      } else {
        const resultStr = result !== undefined ? String(result) : 'undefined';
        logger.error(`Failed to activate safe mode in ${room.name}: ${resultStr}`, { subsystem: "Defense" });
      }
    }
  }

  /**
   * Determine if safe mode should be triggered
   */
  private shouldTriggerSafeMode(room: Room, swarm: SwarmState): boolean {
    // Only trigger if danger is high
    if (swarm.danger < 2) {
      return false;
    }

    // Check spawn health
    const spawns = room.find(FIND_MY_SPAWNS);
    for (const spawn of spawns) {
      if (spawn.hits < spawn.hitsMax * 0.2) {
        logger.warn(`Spawn ${spawn.name} critical: ${spawn.hits}/${spawn.hitsMax}`, { subsystem: "Defense" });
        return true;
      }
    }

    // Check storage health
    if (room.storage && room.storage.hits < room.storage.hitsMax * 0.2) {
      logger.warn(`Storage critical: ${room.storage.hits}/${room.storage.hitsMax}`, { subsystem: "Defense" });
      return true;
    }

    // Check terminal health
    if (room.terminal && room.terminal.hits < room.terminal.hitsMax * 0.2) {
      logger.warn(`Terminal critical: ${room.terminal.hits}/${room.terminal.hitsMax}`, { subsystem: "Defense" });
      return true;
    }

    // Check if we have enough defenders
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const defenders = room.find(FIND_MY_CREEPS, {
      filter: c => {
        const memory = c.memory as unknown as { role?: string };
        const role = memory.role;
        return role === "guard" || role === "ranger" || role === "soldier";
      }
    });

    // Trigger if overwhelmed (3:1 ratio)
    if (hostiles.length > defenders.length * 3) {
      logger.warn(`Overwhelmed: ${hostiles.length} hostiles vs ${defenders.length} defenders`, {
        subsystem: "Defense"
      });
      return true;
    }

    // Check if hostiles are boosted
    const boostedHostiles = hostiles.filter(h => h.body.some(p => p.boost));
    if (boostedHostiles.length > 0 && defenders.length < boostedHostiles.length * 2) {
      logger.warn(`Boosted hostiles detected: ${boostedHostiles.length}`, { subsystem: "Defense" });
      return true;
    }

    return false;
  }
}

/**
 * Global safe mode manager instance
 */
export const safeModeManager = new SafeModeManager();
