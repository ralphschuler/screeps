/**
 * Nuke Manager - Nuclear Warfare (Framework Wrapper)
 *
 * This is a thin wrapper around @ralphschuler/screeps-empire's NukeCoordinator
 * that integrates with the bot's kernel and memory management.
 *
 * Manages nuke operations:
 * - Nuke candidate scoring
 * - Ghodium accumulation
 * - Nuker resource loading
 * - Nuke launch decisions
 * - Nuke salvo coordination for maximum impact
 * - Impact prediction and damage assessment
 * - Automatic siege squad deployment synchronized with nukes
 * - Incoming nuke detection and alert system
 * - Counter-nuke strategies
 * - Nuke economics analysis and ROI calculation
 * - Strategic target prioritization based on war goals
 *
 * Addresses Issue: #24
 */

import { NukeCoordinator } from "@ralphschuler/screeps-empire";
import type { NukeConfig } from "@ralphschuler/screeps-empire";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { memoryManager } from "@ralphschuler/screeps-memory";

/**
 * Nuke Manager Configuration
 * Re-exported from framework for backward compatibility
 */
export type { NukeConfig } from "@ralphschuler/screeps-empire";

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Partial<NukeConfig> = {
  updateInterval: 500,
  minGhodium: 5000,
  minEnergy: 300000,
  minScore: 35,
  siegeCoordinationWindow: 1000,
  nukeFlightTime: 50000,
  terminalPriority: 5,
  donorRoomBuffer: 1000,
  salvoSyncWindow: 10,
  roiThreshold: 2.0,
  counterNukeWarThreshold: 60
};

/**
 * Nuke Manager Class - Wraps framework NukeCoordinator
 */
@ProcessClass()
export class NukeManager {
  private coordinator: NukeCoordinator;

  public constructor(config: Partial<NukeConfig> = {}) {
    // Initialize framework coordinator with dependency injection
    this.coordinator = new NukeCoordinator(
      { ...DEFAULT_CONFIG, ...config },
      {
        getEmpire: () => memoryManager.getEmpire(),
        getSwarmState: (roomName: string) => memoryManager.getSwarmState(roomName),
        getClusters: () => memoryManager.getClusters()
      }
    );
  }

  /**
   * Main nuke tick
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:nuke", "Nuke Manager", {
    priority: ProcessPriority.LOW,
    interval: 500,
    minBucket: 0,
    cpuBudget: 0.01
  })
  public run(): void {
    this.coordinator.run();
  }

  /**
   * Get current configuration
   */
  public getConfig(): NukeConfig {
    return this.coordinator.getConfig();
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<NukeConfig>): void {
    this.coordinator.updateConfig(config);
  }
}

/**
 * Global nuke manager instance
 */
export const nukeManager = new NukeManager();
