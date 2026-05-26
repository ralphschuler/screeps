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

import { DEFAULT_NUKE_CONFIG, NukeCoordinator } from "@ralphschuler/screeps-empire";
import type { NukeConfig } from "@ralphschuler/screeps-empire";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";

/**
 * Nuke Manager Class - Wraps framework NukeCoordinator
 */
@ProcessClass()
export class NukeManager {
  private coordinator: NukeCoordinator;

  public constructor(config: Partial<NukeConfig> = {}) {
    // Initialize framework coordinator with dependency injection
    this.coordinator = new NukeCoordinator(
      { ...DEFAULT_NUKE_CONFIG, ...config },
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
    minBucket: 2000,
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
