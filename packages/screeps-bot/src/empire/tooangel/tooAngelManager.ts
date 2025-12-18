/**
 * TooAngel Manager
 * 
 * Main coordination module for TooAngel diplomacy and quest system.
 * Integrates with the bot's kernel as a process.
 * 
 * Features:
 * - Automatic NPC room detection via controller signs
 * - Reputation tracking and API
 * - Quest lifecycle management (discover, apply, execute, complete)
 * - Terminal-based communication
 * - Integration with existing alliance diplomacy
 * 
 * Based on: https://github.com/TooAngel/screeps/blob/master/doc/API.md
 */

import { logger } from "../../core/logger";
import { ProcessPriority } from "../../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../../core/processDecorators";

// TooAngel modules
import { scanForNPCRooms, updateNPCRoom } from "./npcDetector";
import {
  processReputationUpdates,
  requestReputation,
  getReputation
} from "./reputationManager";
import {
  processQuestMessages,
  cleanupExpiredQuests,
  autoDiscoverQuests,
  getActiveQuests,
  applyForQuest
} from "./questManager";
import {
  executeQuests,
  cleanupQuestCreeps
} from "./questExecutor";

/**
 * Configuration for TooAngel manager
 */
const TOOANGEL_CONFIG = {
  /** Enable/disable TooAngel integration */
  enabled: true,
  /** Minimum bucket to run TooAngel operations */
  minBucket: 2000,
  /** How often to scan for NPCs (in ticks) */
  scanInterval: 500,
  /** How often to request reputation (in ticks) */
  reputationInterval: 2000,
  /** How often to auto-discover quests (in ticks) */
  questDiscoveryInterval: 1000
};

/**
 * TooAngel Manager Process
 * Runs as a low-frequency kernel process
 */
@ProcessClass()
export class TooAngelManager {
  private lastScanTick = 0;
  private lastReputationRequestTick = 0;
  private lastQuestDiscoveryTick = 0;

  /**
   * Check if TooAngel integration is enabled
   */
  public isEnabled(): boolean {
    const mem = Memory as { tooangel?: { enabled?: boolean } };
    return mem.tooangel?.enabled ?? TOOANGEL_CONFIG.enabled;
  }

  /**
   * Enable TooAngel integration
   */
  public enable(): void {
    const mem = Memory as { tooangel?: { enabled?: boolean } };
    if (!mem.tooangel) {
      mem.tooangel = {};
    }
    mem.tooangel.enabled = true;
    logger.info("TooAngel integration enabled", { subsystem: "TooAngel" });
  }

  /**
   * Disable TooAngel integration
   */
  public disable(): void {
    const mem = Memory as { tooangel?: { enabled?: boolean } };
    if (!mem.tooangel) {
      mem.tooangel = {};
    }
    mem.tooangel.enabled = false;
    logger.info("TooAngel integration disabled", { subsystem: "TooAngel" });
  }

  /**
   * Main process run method
   * Called by kernel every tick
   */
  @LowFrequencyProcess({ priority: ProcessPriority.LOW, interval: 10 })
  public run(): void {
    if (!this.isEnabled()) {
      return;
    }

    // Check bucket
    if (Game.cpu.bucket < TOOANGEL_CONFIG.minBucket) {
      return;
    }

    try {
      // Process incoming messages (every tick for responsiveness)
      processReputationUpdates();
      processQuestMessages();

      // Cleanup quest assignments
      cleanupQuestCreeps();

      // Execute active quests
      executeQuests();

      // Cleanup expired quests
      cleanupExpiredQuests();

      // Periodic NPC scanning
      if (Game.time - this.lastScanTick >= TOOANGEL_CONFIG.scanInterval) {
        this.scanForNPCs();
        this.lastScanTick = Game.time;
      }

      // Periodic reputation requests
      if (Game.time - this.lastReputationRequestTick >= TOOANGEL_CONFIG.reputationInterval) {
        this.updateReputation();
        this.lastReputationRequestTick = Game.time;
      }

      // Periodic quest discovery
      if (Game.time - this.lastQuestDiscoveryTick >= TOOANGEL_CONFIG.questDiscoveryInterval) {
        this.discoverQuests();
        this.lastQuestDiscoveryTick = Game.time;
      }

    } catch (error) {
      logger.error(`TooAngel manager error: ${error}`, {
        subsystem: "TooAngel"
      });
    }
  }

  /**
   * Scan for TooAngel NPC rooms
   */
  private scanForNPCs(): void {
    const npcRooms = scanForNPCRooms();

    for (const npcRoom of npcRooms) {
      updateNPCRoom(npcRoom);
    }

    if (npcRooms.length > 0) {
      logger.info(
        `Scanned ${npcRooms.length} TooAngel NPC rooms`,
        { subsystem: "TooAngel" }
      );
    }
  }

  /**
   * Request reputation update from TooAngel
   */
  private updateReputation(): void {
    requestReputation();
  }

  /**
   * Auto-discover and apply for quests
   */
  private discoverQuests(): void {
    autoDiscoverQuests();
  }

  /**
   * Get current reputation
   */
  public getReputation(): number {
    return getReputation();
  }

  /**
   * Get active quests
   */
  public getActiveQuests() {
    return getActiveQuests();
  }

  /**
   * Manually apply for a specific quest
   */
  public applyForQuest(questId: string, originRoom: string, fromRoom?: string): boolean {
    return applyForQuest(questId, originRoom, fromRoom);
  }

  /**
   * Get status summary for console
   */
  public getStatus(): string {
    const reputation = this.getReputation();
    const activeQuests = this.getActiveQuests();
    const activeCount = Object.values(activeQuests).filter(
      q => q.status === "active"
    ).length;
    const appliedCount = Object.values(activeQuests).filter(
      q => q.status === "applied"
    ).length;

    const lines: string[] = [];
    lines.push("=== TooAngel Integration ===");
    lines.push(`Enabled: ${this.isEnabled()}`);
    lines.push(`Reputation: ${reputation}`);
    lines.push(`Active Quests: ${activeCount}`);
    lines.push(`Applied Quests: ${appliedCount}`);
    lines.push("");

    if (Object.keys(activeQuests).length > 0) {
      lines.push("Quests:");
      for (const questId in activeQuests) {
        const quest = activeQuests[questId];
        const timeLeft = quest.deadline - Game.time;
        lines.push(
          `  ${questId}: ${quest.type} in ${quest.targetRoom} (${quest.status}, ${timeLeft} ticks left)`
        );
      }
    }

    return lines.join("\n");
  }
}

/**
 * Global instance
 */
export const tooAngelManager = new TooAngelManager();
