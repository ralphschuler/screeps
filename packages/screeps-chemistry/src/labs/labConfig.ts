/**
 * Lab Configuration Manager
 * 
 * Manages lab role assignments and configuration
 */

import type { LabRole, LabConfigEntry, RoomLabConfig, ChemistryLogger } from "../types";
import { noopLogger } from "../types";

/**
 * Lab Config Manager Options
 */
export interface LabConfigManagerOptions {
  /** Logger instance (optional) */
  logger?: ChemistryLogger;
}

/**
 * Lab Configuration Manager
 */
export class LabConfigManager {
  private configs: Map<string, RoomLabConfig> = new Map();
  private logger: ChemistryLogger;

  constructor(options: LabConfigManagerOptions = {}) {
    this.logger = options.logger ?? noopLogger;
  }

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
   * Auto-assign lab roles based on position and range optimization
   */
  private autoAssignRoles(config: RoomLabConfig, labs: StructureLab[]): void {
    if (labs.length < 3) {
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
      config.isValid = false;
      this.logger.warn(`Lab layout in ${config.roomName} is not optimal for reactions`, {
        subsystem: "Labs"
      });
      return;
    }

    // Assign input labs
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

    this.logger.info(
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

    this.logger.info(`Set active reaction in ${roomName}: ${input1} + ${input2} -> ${output}`, {
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
   * Check if a room has valid lab config
   */
  public hasValidConfig(roomName: string): boolean {
    const config = this.configs.get(roomName);
    return config?.isValid ?? false;
  }

  /**
   * Export config for serialization (e.g., to Memory)
   */
  public exportConfig(roomName: string): RoomLabConfig | undefined {
    return this.configs.get(roomName);
  }

  /**
   * Import config from serialized data (e.g., from Memory)
   */
  public importConfig(config: RoomLabConfig): void {
    this.configs.set(config.roomName, config);
  }
}
