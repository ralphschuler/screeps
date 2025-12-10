/**
 * Lab Configuration Manager
 *
 * Manages lab role assignments and configuration in memory:
 * - Lab role assignment (input1, input2, output)
 * - Memory storage for lab configuration
 * - Configuration validation
 * - Optimal lab layout detection
 *
 * Addresses Issue: #10
 */

import { logger } from "../core/logger";
import { INFINITE_TTL, heapCache } from "../memory/heapCache";

/**
 * Lab role types
 */
export type LabRole = "input1" | "input2" | "output" | "boost" | "unassigned";

/**
 * Lab configuration entry
 */
export interface LabConfigEntry {
  /** Lab ID */
  labId: Id<StructureLab>;
  /** Lab role */
  role: LabRole;
  /** Assigned resource type */
  resourceType?: MineralConstant | MineralCompoundConstant;
  /** Lab position */
  pos: { x: number; y: number };
  /** Last configured tick */
  lastConfigured: number;
}

/**
 * Room lab configuration
 */
export interface RoomLabConfig {
  /** Room name */
  roomName: string;
  /** Lab configurations */
  labs: LabConfigEntry[];
  /** Active reaction if any */
  activeReaction?: {
    input1: MineralConstant | MineralCompoundConstant;
    input2: MineralConstant | MineralCompoundConstant;
    output: MineralCompoundConstant;
  };
  /** Last update tick */
  lastUpdate: number;
  /** Whether config is valid */
  isValid: boolean;
}

/**
 * Lab Configuration Manager
 */
export class LabConfigManager {
  private configs: Map<string, RoomLabConfig> = new Map();

  /**
   * Initialize lab config for a room
   */
  public initialize(roomName: string): void {
    const room = Game.rooms[roomName];
    if (!room || !room.controller?.my) return;

    const foundLabs = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LAB
    });
    const labs = foundLabs as StructureLab[];

    if (labs.length === 0) {
      this.configs.delete(roomName);
      return;
    }

    // Get or create config
    let config = this.configs.get(roomName);
    if (!config) {
      config = {
        roomName,
        labs: [],
        lastUpdate: Game.time,
        isValid: false
      };
      this.configs.set(roomName, config);
    }

    // Update lab entries
    this.updateLabEntries(config, labs);

    // Auto-assign roles if not configured
    if (!config.isValid) {
      this.autoAssignRoles(config, labs);
    }
  }

  /**
   * Update lab entries in config
   */
  private updateLabEntries(config: RoomLabConfig, labs: StructureLab[]): void {
    // Remove entries for destroyed labs
    config.labs = config.labs.filter(entry =>
      labs.some(lab => lab.id === entry.labId)
    );

    // Add new labs
    for (const lab of labs) {
      const existing = config.labs.find(entry => entry.labId === lab.id);
      if (!existing) {
        config.labs.push({
          labId: lab.id,
          role: "unassigned",
          pos: { x: lab.pos.x, y: lab.pos.y },
          lastConfigured: Game.time
        });
      }
    }

    config.lastUpdate = Game.time;
  }

  /**
   * Auto-assign lab roles based on position
   */
  private autoAssignRoles(config: RoomLabConfig, labs: StructureLab[]): void {
    if (labs.length < 3) {
      // Need at least 3 labs for reactions
      config.isValid = false;
      return;
    }

    // Find labs that are within range 2 of at least 2 other labs
    const labDistances: Map<Id<StructureLab>, Id<StructureLab>[]> = new Map();

    for (const lab of labs) {
      const inRangeLabs: Id<StructureLab>[] = [];
      for (const other of labs) {
        if (lab.id !== other.id && lab.pos.getRangeTo(other) <= 2) {
          inRangeLabs.push(other.id);
        }
      }
      labDistances.set(lab.id, inRangeLabs);
    }

    // Find the two labs that have the most labs in range (best input candidates)
    const labsByReach = labs
      .map(lab => ({
        lab,
        reach: labDistances.get(lab.id)?.length ?? 0
      }))
      .sort((a, b) => b.reach - a.reach);

    if (labsByReach.length < 3 || (labsByReach[0]?.reach ?? 0) < 2) {
      // Labs are not in valid positions for reactions
      config.isValid = false;
      logger.warn(`Lab layout in ${config.roomName} is not optimal for reactions`, {
        subsystem: "Labs"
      });
      return;
    }

    // Assign input labs (the two with most reach)
    const input1Lab = labsByReach[0]?.lab;
    const input2Lab = labsByReach[1]?.lab;

    if (!input1Lab || !input2Lab) {
      config.isValid = false;
      return;
    }

    // Update config
    for (const entry of config.labs) {
      if (entry.labId === input1Lab.id) {
        entry.role = "input1";
        entry.lastConfigured = Game.time;
      } else if (entry.labId === input2Lab.id) {
        entry.role = "input2";
        entry.lastConfigured = Game.time;
      } else {
        // Check if this lab is in range of both inputs
        const inRangeOf1 = input1Lab.pos.getRangeTo(Game.getObjectById(entry.labId)!) <= 2;
        const inRangeOf2 = input2Lab.pos.getRangeTo(Game.getObjectById(entry.labId)!) <= 2;

        if (inRangeOf1 && inRangeOf2) {
          entry.role = "output";
        } else {
          entry.role = "boost";
        }
        entry.lastConfigured = Game.time;
      }
    }

    config.isValid = true;
    config.lastUpdate = Game.time;

    logger.info(
      `Auto-assigned lab roles in ${config.roomName}: ` +
        `${config.labs.filter(l => l.role === "input1").length} input1, ` +
        `${config.labs.filter(l => l.role === "input2").length} input2, ` +
        `${config.labs.filter(l => l.role === "output").length} output, ` +
        `${config.labs.filter(l => l.role === "boost").length} boost`,
      { subsystem: "Labs" }
    );
  }

  /**
   * Get lab config for a room
   */
  public getConfig(roomName: string): RoomLabConfig | undefined {
    return this.configs.get(roomName);
  }

  /**
   * Get labs by role
   */
  public getLabsByRole(roomName: string, role: LabRole): StructureLab[] {
    const config = this.configs.get(roomName);
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
    const config = this.configs.get(roomName);
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
    const config = this.configs.get(roomName);
    if (!config || !config.isValid) return false;

    config.activeReaction = { input1, input2, output };

    // Update resource assignments
    const input1Entry = config.labs.find(l => l.role === "input1");
    const input2Entry = config.labs.find(l => l.role === "input2");

    if (input1Entry) input1Entry.resourceType = input1;
    if (input2Entry) input2Entry.resourceType = input2;

    for (const entry of config.labs.filter(l => l.role === "output")) {
      entry.resourceType = output;
    }

    config.lastUpdate = Game.time;

    logger.info(`Set active reaction in ${roomName}: ${input1} + ${input2} -> ${output}`, {
      subsystem: "Labs"
    });

    return true;
  }

  /**
   * Clear active reaction
   */
  public clearActiveReaction(roomName: string): void {
    const config = this.configs.get(roomName);
    if (!config) return;

    delete config.activeReaction;

    for (const entry of config.labs) {
      delete entry.resourceType;
    }

    config.lastUpdate = Game.time;
  }

  /**
   * Manually set lab role
   */
  public setLabRole(
    roomName: string,
    labId: Id<StructureLab>,
    role: LabRole,
    resourceType?: MineralConstant | MineralCompoundConstant
  ): boolean {
    const config = this.configs.get(roomName);
    if (!config) return false;

    const entry = config.labs.find(l => l.labId === labId);
    if (!entry) return false;

    entry.role = role;
    entry.resourceType = resourceType;
    entry.lastConfigured = Game.time;

    // Revalidate config
    this.validateConfig(config);

    return true;
  }

  /**
   * Validate lab configuration
   */
  private validateConfig(config: RoomLabConfig): void {
    const hasInput1 = config.labs.some(l => l.role === "input1");
    const hasInput2 = config.labs.some(l => l.role === "input2");
    const hasOutput = config.labs.some(l => l.role === "output");

    config.isValid = hasInput1 && hasInput2 && hasOutput;

    // Verify input labs are in range of output labs
    if (config.isValid) {
      const input1Entry = config.labs.find(l => l.role === "input1");
      const input2Entry = config.labs.find(l => l.role === "input2");
      const outputEntries = config.labs.filter(l => l.role === "output");

      if (input1Entry && input2Entry && outputEntries.length > 0) {
        const input1Lab = Game.getObjectById(input1Entry.labId);
        const input2Lab = Game.getObjectById(input2Entry.labId);

        if (input1Lab && input2Lab) {
          // Check at least one output lab is in range of both inputs
          const validOutput = outputEntries.some(entry => {
            const outputLab = Game.getObjectById(entry.labId);
            return (
              outputLab &&
              input1Lab.pos.getRangeTo(outputLab) <= 2 &&
              input2Lab.pos.getRangeTo(outputLab) <= 2
            );
          });

          config.isValid = validOutput;
        } else {
          config.isValid = false;
        }
      }
    }
  }

  /**
   * Run lab reactions using configured labs
   */
  public runReactions(roomName: string): number {
    const config = this.configs.get(roomName);
    if (!config || !config.isValid || !config.activeReaction) return 0;

    const { input1, input2 } = this.getInputLabs(roomName);
    if (!input1 || !input2) return 0;

    const outputLabs = this.getOutputLabs(roomName);
    let reactionsRun = 0;

    for (const outputLab of outputLabs) {
      if (outputLab.cooldown === 0) {
        const result = outputLab.runReaction(input1, input2);
        if (result === OK) {
          reactionsRun++;
        }
      }
    }

    return reactionsRun;
  }

  /**
   * Save lab config to memory (cached with infinite TTL)
   * Note: Caches a reference to the Memory object for performance.
   */
  public saveToMemory(roomName: string): void {
    const config = this.configs.get(roomName);
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
      this.configs.set(roomName, config);
    }
  }

  /**
   * Get all configured rooms
   */
  public getConfiguredRooms(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Check if a room has valid lab config
   */
  public hasValidConfig(roomName: string): boolean {
    const config = this.configs.get(roomName);
    return config?.isValid ?? false;
  }
}

/**
 * Global lab config manager instance
 */
export const labConfigManager = new LabConfigManager();
