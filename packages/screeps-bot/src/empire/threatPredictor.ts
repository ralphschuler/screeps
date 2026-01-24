/**
 * Threat Predictor - Bot Integration
 * 
 * Wraps the framework ThreatPredictor with bot-specific process decorators and memory access
 */

import {
  ThreatPredictor as FrameworkThreatPredictor,
  RoomIntelAccessor,
  ThreatPredictorConfig
} from "@ralphschuler/screeps-empire";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { memoryManager } from "../memory/manager";

/**
 * Room intel accessor implementation for bot's memory system
 */
class BotRoomIntelAccessor implements RoomIntelAccessor {
  updateThreatLevel(roomName: string, threatLevel: 0 | 1 | 2 | 3): void {
    const empire = memoryManager.getEmpire();
    const intel = empire.knownRooms[roomName];
    if (intel) {
      intel.threatLevel = Math.max(intel.threatLevel, threatLevel) as 0 | 1 | 2 | 3;
    }
  }
}

/**
 * Bot-integrated Threat Predictor
 * Wraps framework implementation with process decorators
 */
@ProcessClass()
class BotThreatPredictor extends FrameworkThreatPredictor {
  constructor(config: Partial<ThreatPredictorConfig> = {}) {
    super(config, new BotRoomIntelAccessor());
  }

  /**
   * Main prediction tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:threatPredictor", "Threat Predictor", {
    priority: ProcessPriority.MEDIUM,
    interval: 20,
    minBucket: 0,
    cpuBudget: 0.02
  })
  public run(): void {
    super.run();
  }
}

/**
 * Global threat predictor instance
 */
export const threatPredictor = new BotThreatPredictor();

// Re-export types for backward compatibility
export type {
  ThreatPredictorConfig,
  HostileCreepTrack,
  ThreatPrediction,
  RoomIntelAccessor
} from "@ralphschuler/screeps-empire";
