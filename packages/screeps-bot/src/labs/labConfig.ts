/**
 * Lab Configuration Manager (Adapter)
 *
 * Adapter layer that bridges bot-specific dependencies with the
 * @ralphschuler/screeps-chemistry package
 *
 * Adds Memory and heapCache integration to the core LabConfigManager
 *
 * Addresses Issue: #10
 */

import { logger } from "@ralphschuler/screeps-core";
import { INFINITE_TTL, heapCache } from "../memory/heapCache";
import {
  LabConfigManager as ChemistryLabConfigManager,
  type LabRole,
  type LabConfigEntry,
  type RoomLabConfig,
  type ChemistryLogger
} from "@ralphschuler/screeps-chemistry";

// Re-export types for backward compatibility
export type { LabRole, LabConfigEntry, RoomLabConfig };

/**
 * Adapt logger interface
 */
const chemistryLogger: ChemistryLogger = {
  info: (message, context) => logger.info(message, context),
  warn: (message, context) => logger.warn(message, context),
  error: (message, context) => logger.error(message, context),
  debug: (message, context) => logger.debug(message, context)
};

/**
 * Lab Configuration Manager (Adapter)
 * 
 * Wraps ChemistryLabConfigManager and adds Memory/heapCache integration
 */
export class LabConfigManager {
  private manager: ChemistryLabConfigManager;

  constructor() {
    this.manager = new ChemistryLabConfigManager({ logger: chemistryLogger });
  }

  /**
   * Initialize lab config for a room
   */
  public initialize(roomName: string): void {
    this.manager.initialize(roomName);
  }

  /**
   * Get lab config for a room
   */
  public getConfig(roomName: string): RoomLabConfig | undefined {
    return this.manager.exportConfig(roomName);
  }

  /**
   * Get labs by role
   */
  public getLabsByRole(roomName: string, role: LabRole): StructureLab[] {
    const config = this.manager.exportConfig(roomName);
    if (!config) return [];

    return config.labs
      .filter(entry => entry.role === role)
      .map(entry => Game.getObjectById(entry.labId))
      .filter((lab): lab is StructureLab => lab !== null);
  }

  /**
   * Get input labs
   */
  public getInputLabs(roomName: string): { input1?: StructureLab; input2?: StructureLab } {
    const config = this.manager.exportConfig(roomName);
    if (!config) return {};

    const input1Entry = config.labs.find(l => l.role === "input1");
    const input2Entry = config.labs.find(l => l.role === "input2");

    return {
      input1: input1Entry ? Game.getObjectById(input1Entry.labId) ?? undefined : undefined,
      input2: input2Entry ? Game.getObjectById(input2Entry.labId) ?? undefined : undefined
    };
  }

  /**
   * Get output labs
   */
  public getOutputLabs(roomName: string): StructureLab[] {
    return this.getLabsByRole(roomName, "output");
  }

  /**
   * Get boost labs
   */
  public getBoostLabs(roomName: string): StructureLab[] {
    return this.getLabsByRole(roomName, "boost");
  }

  /**
   * Set active reaction
   */
  public setActiveReaction(
    roomName: string,
    input1: MineralConstant | MineralCompoundConstant,
    input2: MineralConstant | MineralCompoundConstant,
    output: MineralCompoundConstant
  ): boolean {
    return this.manager.setActiveReaction(roomName, input1, input2, output);
  }

  /**
   * Clear active reaction
   */
  public clearActiveReaction(roomName: string): void {
    this.manager.clearActiveReaction(roomName);
  }

  /**
   * Set lab role manually
   */
  public setLabRole(
    roomName: string,
    labId: Id<StructureLab>,
    role: LabRole
  ): boolean {
    const config = this.manager.exportConfig(roomName);
    if (!config) return false;

    const entry = config.labs.find(l => l.labId === labId);
    if (!entry) return false;

    entry.role = role;
    entry.lastConfigured = Game.time;
    config.lastUpdate = Game.time;

    this.manager.importConfig(config);

    logger.info(`Set ${labId} to role ${role} in ${roomName}`, { subsystem: "Labs" });
    return true;
  }

  /**
   * Run lab reactions using configured labs
   */
  public runReactions(roomName: string): number {
    return this.manager.runReactions(roomName);
  }

  /**
   * Save lab config to memory (cached with infinite TTL)
   * Note: Caches a reference to the Memory object for performance.
   */
  public saveToMemory(roomName: string): void {
    const config = this.manager.exportConfig(roomName);
    if (!config) return;

    // Update Memory first
    const roomMem = Memory.rooms[roomName];
    if (roomMem) {
      (roomMem as unknown as { labConfig: RoomLabConfig }).labConfig = config;
      
      // Cache a reference to the Memory object
      const cacheKey = `memory:room:${roomName}:labConfig`;
      heapCache.set(cacheKey, config, INFINITE_TTL);
    }
  }

  /**
   * Load lab config from memory (cached with infinite TTL)
   * Note: Returns a reference to the cached object for performance.
   */
  public loadFromMemory(roomName: string): void {
    const cacheKey = `memory:room:${roomName}:labConfig`;
    let config = heapCache.get<RoomLabConfig>(cacheKey);
    
    if (!config) {
      const roomMem = Memory.rooms[roomName] as unknown as { labConfig?: RoomLabConfig };
      const memConfig = roomMem?.labConfig;
      if (memConfig) {
        // Cache a reference to the Memory object
        heapCache.set(cacheKey, memConfig, INFINITE_TTL);
        config = memConfig;
      }
    }
    
    if (config) {
      this.manager.importConfig(config);
    }
  }

  /**
   * Get all configured rooms
   */
  public getConfiguredRooms(): string[] {
    // TODO: Export this from chemistry package
    // Issue URL: https://github.com/ralphschuler/screeps/issues/2946
    // For now, we need to check Memory
    return Object.keys(Memory.rooms).filter(roomName => {
      const roomMem = Memory.rooms[roomName] as unknown as { labConfig?: RoomLabConfig };
      return roomMem?.labConfig !== undefined;
    });
  }

  /**
   * Check if a room has valid lab config
   */
  public hasValidConfig(roomName: string): boolean {
    return this.manager.hasValidConfig(roomName);
  }
}

/**
 * Global lab config manager instance
 */
export const labConfigManager = new LabConfigManager();
