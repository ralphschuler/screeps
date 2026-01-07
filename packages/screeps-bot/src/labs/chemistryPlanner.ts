/**
 * Chemistry Planner - Reaction Chain Planning (Adapter)
 *
 * Adapter layer that bridges bot-specific dependencies with the
 * @ralphschuler/screeps-chemistry package
 *
 * Addresses Issue: #28
 */

import type { SwarmState } from "../memory/schemas";
import { logger } from "@ralphschuler/screeps-core";
import {
  ChemistryManager,
  type Reaction,
  type ChemistryState,
  type ChemistryLogger
} from "@ralphschuler/screeps-chemistry";

/**
 * Convert SwarmState to ChemistryState
 */
function toChemistryState(swarm: SwarmState): ChemistryState {
  // Map RoomPosture to ChemistryState posture
  let posture: ChemistryState["posture"];
  switch (swarm.posture) {
    case "defensive":
      posture = "defense";
      break;
    case "nukePrep":
      posture = "defense"; // Treat nuke prep as defensive
      break;
    default:
      posture = swarm.posture;
  }

  return {
    currentTick: Game.time,
    danger: swarm.danger,
    posture,
    pheromones: {
      war: swarm.pheromones.war,
      siege: swarm.pheromones.siege
    }
  };
}

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
 * Chemistry Planner Class (Adapter)
 */
export class ChemistryPlanner {
  private manager: ChemistryManager;

  constructor() {
    this.manager = new ChemistryManager({ logger: chemistryLogger });
  }

  /**
   * Get reaction for a compound (lookup in REACTIONS table)
   */
  public getReaction(compound: ResourceConstant): Reaction | undefined {
    return this.manager.getReaction(compound);
  }

  /**
   * Calculate full reaction chain for a target compound
   * Returns array of reactions in order (dependencies first)
   */
  public calculateReactionChain(
    target: ResourceConstant,
    availableResources: Partial<Record<ResourceConstant, number>>
  ): Reaction[] {
    return this.manager.calculateReactionChain(target, availableResources);
  }

  /**
   * Check if we have enough resources for a reaction
   */
  public hasResourcesForReaction(
    terminal: StructureTerminal,
    reaction: Reaction,
    minAmount = 100
  ): boolean {
    return this.manager.hasResourcesForReaction(terminal, reaction, minAmount);
  }

  /**
   * Plan reactions for a room
   */
  public planReactions(room: Room, swarm: SwarmState): Reaction | null {
    const state = toChemistryState(swarm);
    return this.manager.planReactions(room, state);
  }

  /**
   * Schedule compound production based on demand and priorities
   * Returns prioritized list of reactions needed across all rooms
   */
  public scheduleCompoundProduction(
    rooms: Room[],
    swarm: SwarmState
  ): { room: Room; reaction: Reaction; priority: number }[] {
    const state = toChemistryState(swarm);
    return this.manager.scheduleCompoundProduction(rooms, state);
  }

  /**
   * Execute reaction in labs
   */
  public executeReaction(room: Room, reaction: Reaction): void {
    this.manager.executeReaction(room, reaction);
  }
}

/**
 * Global chemistry planner instance
 */
export const chemistryPlanner = new ChemistryPlanner();
