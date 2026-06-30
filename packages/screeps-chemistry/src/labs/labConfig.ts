/**
 * Lab Configuration Manager
 *
 * Coordinates ROADMAP §16 lab clusters: keep live lab IDs synchronized, assign
 * input/output/boost roles, persist compact config data, and execute only ready
 * reaction labs. Geometry decisions live in `labLayout.ts`; this class owns
 * Screeps state, Memory import/export, and logging side effects.
 */

import type { LabRole, RoomLabConfig, ChemistryLogger } from "../types";
import { noopLogger } from "../types";
import { getReactionResourceForRole, planLabLayout, type LabLayoutNode } from "./labLayout";

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

    // Update lab entries from live room state first. Memory may contain stale
    // "valid" configs from earlier layouts or partially-built lab clusters.
    this.updateLabEntries(config, labs);

    if (labs.length < 3) {
      this.invalidateConfig(config);
      return;
    }

    // Auto-assign roles when live labs no longer match the serialized config
    // or when new labs were added as unassigned entries.
    if (!this.isCurrentConfigValid(config, labs)) {
      this.autoAssignRoles(config, labs);
    }

    if (config.isValid && config.activeReaction) {
      this.applyActiveReactionResources(config);
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
   * Mark config invalid and clear stale reaction-specific assignments.
   */
  private invalidateConfig(config: RoomLabConfig): void {
    config.isValid = false;
    delete config.activeReaction;
    for (const entry of config.labs) {
      entry.role = "unassigned";
      delete entry.resourceType;
      entry.lastConfigured = Game.time;
    }
    config.lastUpdate = Game.time;
  }

  /**
   * Check whether persisted roles still describe the live lab cluster.
   */
  private isCurrentConfigValid(config: RoomLabConfig, labs: StructureLab[]): boolean {
    if (!config.isValid || labs.length < 3) return false;
    if (config.labs.length !== labs.length) return false;
    if (config.labs.some(entry => entry.role === "unassigned")) return false;

    const labById = new Map(labs.map(lab => [lab.id, lab]));
    const input1Entry = config.labs.find(entry => entry.role === "input1");
    const input2Entry = config.labs.find(entry => entry.role === "input2");
    const outputEntries = config.labs.filter(entry => entry.role === "output");

    if (!input1Entry || !input2Entry || outputEntries.length === 0) return false;

    const input1 = labById.get(input1Entry.labId);
    const input2 = labById.get(input2Entry.labId);
    if (!input1 || !input2) return false;

    for (const entry of outputEntries) {
      const output = labById.get(entry.labId);
      if (!output) return false;
      if (output.pos.getRangeTo(input1) > 2 || output.pos.getRangeTo(input2) > 2) {
        return false;
      }
    }

    return true;
  }

  /**
   * Reapply active reaction resource assignments after roles are refreshed.
   */
  private applyActiveReactionResources(config: RoomLabConfig): void {
    const reaction = config.activeReaction;
    if (!reaction) return;

    for (const entry of config.labs) {
      const resourceType = getReactionResourceForRole(entry.role, reaction);
      if (resourceType) entry.resourceType = resourceType;
    }
  }

  /**
   * Auto-assign lab roles based on position and range optimization.
   *
   * This method owns the state mutation; `planLabLayout` owns the pure geometry
   * decision. Keeping those concerns separate makes Screeps lab placement rules
   * easier to reason about and unit test.
   */
  private autoAssignRoles(config: RoomLabConfig, labs: StructureLab[]): void {
    const plan = planLabLayout(this.toLayoutNodes(labs));
    if (!plan.isValid) {
      this.invalidateConfig(config);
      if (plan.reason === "insufficient-reach" || plan.reason === "no-outputs") {
        this.logger.warn(`Lab layout in ${config.roomName} is not optimal for reactions`, {
          subsystem: "Labs"
        });
      }
      return;
    }

    const roleByLabId = new Map(plan.roles.map(role => [role.labId, role.role]));
    for (const entry of config.labs) {
      entry.role = roleByLabId.get(entry.labId) ?? "unassigned";
      entry.lastConfigured = Game.time;
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

  private toLayoutNodes(labs: StructureLab[]): LabLayoutNode[] {
    return labs.map(lab => ({
      id: lab.id,
      pos: { x: lab.pos.x, y: lab.pos.y }
    }));
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
    this.applyActiveReactionResources(config);
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
   * Get rooms with lab configs persisted in Memory.
   */
  public getConfiguredRooms(): string[] {
    return Object.keys(Memory.rooms).filter(roomName => {
      const roomMem = Memory.rooms[roomName] as { labConfig?: RoomLabConfig } | undefined;
      return roomMem?.labConfig !== undefined;
    });
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
