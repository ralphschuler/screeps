/**
 * Nuke Coordinator - Main Entry Point
 * 
 * Coordinates all nuke operations: detection, targeting, launching, defense, and logistics
 */

import { terminalManager } from "@ralphschuler/screeps-economy";
import type { NukeConfig } from "./types";
import { DEFAULT_NUKE_CONFIG } from "./types";
import { detectIncomingNukes, hasCriticalStructuresThreatened } from "./detection";
import { triggerEvacuation, processCounterNukeStrategies, canAffordNuke } from "./defense";
import { evaluateNukeCandidates } from "./targeting";
import { loadNukers, manageNukeResources, createResourceTransferRequest } from "./logistics";
import {
  launchNukes,
  coordinateNukeSalvos,
  updateNukeEconomics,
  cleanupNukeTracking,
  initializeNukeTracking
} from "./launcher";
import { coordinateWithSieges } from "./coordination";

// Note: These will be imported from the bot layer when integrated
type EmpireMemory = any;
type SwarmState = any;
type ClusterMemory = any;

export interface NukeRunOptions {
  /** Run offensive targeting, logistics, and launch operations. */
  offensive?: boolean;
}

/**
 * Nuke Coordinator Class
 */
export class NukeCoordinator {
  private config: NukeConfig;
  private nukerReadyLogged: Set<string> = new Set();

  // Dependency injection for memory access
  private getEmpire: () => EmpireMemory;
  private getSwarmState: (roomName: string) => SwarmState | undefined;
  private getClusters: () => Record<string, ClusterMemory>;

  public constructor(
    config: Partial<NukeConfig> = {},
    deps: {
      getEmpire: () => EmpireMemory;
      getSwarmState: (roomName: string) => SwarmState | undefined;
      getClusters: () => Record<string, ClusterMemory>;
    }
  ) {
    this.config = { ...DEFAULT_NUKE_CONFIG, ...config };
    this.getEmpire = deps.getEmpire;
    this.getSwarmState = deps.getSwarmState;
    this.getClusters = deps.getClusters;
  }

  /**
   * Main nuke coordination tick
   * Called by kernel process
   */
  public run(options: NukeRunOptions = {}): void {
    const empire = this.getEmpire();
    const offensive = options.offensive ?? true;

    // Initialize nuke tracking if needed
    initializeNukeTracking(empire);

    // Defensive observation is independent of offensive nuker availability.
    detectIncomingNukes(empire, this.getSwarmState);

    // Handle evacuation for threatened rooms
    this.handleEvacuations(empire);

    if (!offensive) {
      // Keep landed-alert cleanup active without evaluating targets, moving
      // resources, or launching counter-nukes from a nukerless empire.
      cleanupNukeTracking(empire);
      return;
    }

    // Process counter-nuke strategies
    processCounterNukeStrategies(
      empire,
      this.config,
      this.getSwarmState,
      canAffordNuke
    );

    // Manage resource accumulation
    manageNukeResources(
      empire,
      this.config,
      this.nukerReadyLogged,
      (roomName, resourceType, amount) => this.requestResourceTransfer(roomName, resourceType, amount)
    );

    // Load nukers with resources
    loadNukers();

    // Evaluate nuke candidates with enhanced scoring
    evaluateNukeCandidates(empire, this.config, this.getSwarmState);

    // Update nuke economics tracking
    updateNukeEconomics(empire);

    // Check for siege coordination opportunities
    coordinateWithSieges(
      empire,
      this.config,
      this.getClusters,
      this.getSwarmState
    );

    // Coordinate nuke salvos for maximum impact
    coordinateNukeSalvos(empire, this.config);

    // Launch nukes if appropriate
    launchNukes(empire, this.config);

    // Clean up old tracking data
    cleanupNukeTracking(empire);
  }

  /**
   * Handle evacuation triggers for rooms with incoming nukes
   */
  private handleEvacuations(empire: EmpireMemory): void {
    if (!empire.incomingNukes) return;

    for (const alert of empire.incomingNukes) {
      if (alert.evacuationTriggered) continue;

      const hasCriticalStructures = hasCriticalStructuresThreatened(alert);
      if (!hasCriticalStructures) continue;

      const room = Game.rooms[alert.roomName];
      if (!room) continue;

      const swarm = this.getSwarmState(alert.roomName);
      if (!swarm) continue;

      triggerEvacuation(room, alert, swarm);
      alert.evacuationTriggered = true;
    }
  }

  /**
   * Request resource transfer via terminal manager
   */
  private requestResourceTransfer(
    roomName: string,
    resourceType: ResourceConstant,
    amount: number
  ): void {
    createResourceTransferRequest(
      roomName,
      resourceType,
      amount,
      this.config,
      terminalManager
    );
  }

  /**
   * Get current configuration
   */
  public getConfig(): NukeConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<NukeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Re-export types and utilities
export * from "./types";
export * from "./detection";
export * from "./defense";
export * from "./targeting";
export * from "./logistics";
export * from "./launcher";
export * from "./coordination";
