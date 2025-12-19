/**
 * @ralphschuler/screeps-chemistry
 * 
 * Chemistry and lab management system for Screeps
 * 
 * This package provides:
 * - Reaction chain planning and calculation
 * - Lab role assignment and coordination  
 * - Boost configuration and management
 * - Compound stockpile target calculation
 * - Integration with Screeps game API
 * 
 * @example
 * ```typescript
 * import { ChemistryManager, LabConfigManager } from '@ralphschuler/screeps-chemistry';
 * 
 * const chemistry = new ChemistryManager({ logger: myLogger });
 * const labConfig = new LabConfigManager({ logger: myLogger });
 * 
 * // Initialize labs
 * labConfig.initialize('W1N1');
 * 
 * // Plan reactions
 * const reaction = chemistry.planReactions(Game.rooms['W1N1'], gameState);
 * if (reaction) {
 *   labConfig.setActiveReaction('W1N1', reaction.input1, reaction.input2, reaction.product);
 *   labConfig.runReactions('W1N1');
 * }
 * ```
 */

// Core types
export type {
  ChemistryLogger,
  ChemistryState,
  Reaction,
  ReactionStep,
  BoostConfig,
  LabRole,
  LabConfigEntry,
  RoomLabConfig,
  LabResourceNeed,
  LabOverflow,
  LabTaskType
} from "./types";

export { noopLogger } from "./types";

// Reaction chains
export {
  REACTIONS,
  getReaction,
  calculateReactionChain,
  hasResourcesForReaction
} from "./reactions/reactionChains";

// Chemistry manager
export {
  ChemistryManager,
  type ChemistryManagerOptions
} from "./reactions/chemistryManager";

// Compound targets
export {
  BASE_STOCKPILE_TARGETS,
  getStockpileTarget,
  getTargetCompounds
} from "./compounds/targets";

// Boost configurations
export {
  BOOST_CONFIGS,
  getBoostConfig,
  calculateBoostCost
} from "./boosts/config";

// Lab configuration
export {
  LabConfigManager,
  type LabConfigManagerOptions
} from "./labs/labConfig";
