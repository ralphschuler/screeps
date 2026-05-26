import type { Reaction } from "@ralphschuler/screeps-chemistry";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { logger } from "../core/logger";
import { boostManager } from "./boostManager";
import { chemistryPlanner } from "./chemistryPlanner";
import { labConfigManager } from "./labConfig";
import { labManager, type ReactionStep } from "./labManager";

export interface LabWorkflowResult {
  roomName: string;
  initialized: boolean;
  boostPrepared: boolean;
  reactionPlanned: boolean;
  reactionReady: boolean;
  activeReactionChanged: boolean;
  reactionExecuted: boolean;
  saved: boolean;
}

interface LabWorkflowLabManager {
  initialize(roomName: string): void;
  areLabsReady(roomName: string, reaction: ReactionStep): boolean;
  setActiveReaction(
    roomName: string,
    input1: MineralConstant | MineralCompoundConstant,
    input2: MineralConstant | MineralCompoundConstant,
    output: MineralCompoundConstant
  ): boolean;
  save(roomName: string): void;
}

interface LabWorkflowBoostManager {
  prepareLabs(room: Room, swarm: SwarmState): void;
}

interface LabWorkflowChemistryPlanner {
  planReactions(room: Room, swarm: SwarmState): Reaction | null;
  executeReaction(room: Room, reaction: Reaction): void;
}

interface LabWorkflowConfigManager {
  getConfig(roomName: string):
    | {
        activeReaction?: {
          input1: ResourceConstant;
          input2: ResourceConstant;
          output: ResourceConstant;
        };
      }
    | undefined;
}

interface LabWorkflowLogger {
  debug(message: string, context?: unknown): void;
}

export interface LabEconomyWorkflowDeps {
  labManager: LabWorkflowLabManager;
  boostManager: LabWorkflowBoostManager;
  chemistryPlanner: LabWorkflowChemistryPlanner;
  labConfigManager: LabWorkflowConfigManager;
  logger: LabWorkflowLogger;
}

const DEFAULT_DEPS: LabEconomyWorkflowDeps = {
  labManager,
  boostManager,
  chemistryPlanner,
  labConfigManager,
  logger
};

/**
 * Lab economy workflow Module.
 *
 * Keeps room-level chemistry ordering behind one Interface: initialize lab state,
 * prepare boost labs, plan/activate/execute reactions, and persist lab memory.
 */
export class LabEconomyWorkflow {
  public constructor(private readonly deps: LabEconomyWorkflowDeps = DEFAULT_DEPS) {}

  public run(room: Room, swarm: SwarmState): LabWorkflowResult {
    const result: LabWorkflowResult = {
      roomName: room.name,
      initialized: false,
      boostPrepared: false,
      reactionPlanned: false,
      reactionReady: false,
      activeReactionChanged: false,
      reactionExecuted: false,
      saved: false
    };

    this.deps.labManager.initialize(room.name);
    result.initialized = true;

    this.deps.boostManager.prepareLabs(room, swarm);
    result.boostPrepared = true;

    const reaction = this.deps.chemistryPlanner.planReactions(room, swarm);
    result.reactionPlanned = reaction !== null;

    if (reaction) {
      this.runPlannedReaction(room, reaction, result);
    }

    this.deps.labManager.save(room.name);
    result.saved = true;

    return result;
  }

  private runPlannedReaction(room: Room, reaction: Reaction, result: LabWorkflowResult): void {
    const reactionStep: ReactionStep = {
      product: reaction.product as MineralCompoundConstant,
      input1: reaction.input1 as MineralConstant | MineralCompoundConstant,
      input2: reaction.input2 as MineralConstant | MineralCompoundConstant,
      amountNeeded: 1000,
      priority: reaction.priority
    };

    if (!this.deps.labManager.areLabsReady(room.name, reactionStep)) {
      this.deps.logger.debug(`Labs not ready for reaction: ${reaction.input1} + ${reaction.input2} -> ${reaction.product}`, {
        subsystem: "Labs",
        room: room.name
      });
      return;
    }

    result.reactionReady = true;

    if (!this.isActiveReactionCurrent(room.name, reaction)) {
      result.activeReactionChanged = this.deps.labManager.setActiveReaction(
        room.name,
        reaction.input1 as MineralConstant | MineralCompoundConstant,
        reaction.input2 as MineralConstant | MineralCompoundConstant,
        reaction.product as MineralCompoundConstant
      );
    }

    this.deps.chemistryPlanner.executeReaction(room, reaction);
    result.reactionExecuted = true;
  }

  private isActiveReactionCurrent(roomName: string, reaction: Reaction): boolean {
    const currentReaction = this.deps.labConfigManager.getConfig(roomName)?.activeReaction;
    return (
      currentReaction?.input1 === reaction.input1 &&
      currentReaction.input2 === reaction.input2 &&
      currentReaction.output === reaction.product
    );
  }
}

export const labEconomyWorkflow = new LabEconomyWorkflow();
