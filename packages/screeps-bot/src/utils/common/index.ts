/**
 * Common Utilities
 *
 * Generic utilities for random number generation, weighted selection,
 * target distribution, and collection points.
 */

// Collection Point - rally point calculation for military units
export {
  getCollectionPoint,
  invalidateCollectionPoint
} from "./collectionPoint";

// Random - seeded and unseeded random number generation
export {
  random,
  randomInt,
  shuffle,
  pick,
  createSeededRandom
} from "./random";

// Target Distribution - distributed target assignment
export {
  clearTargetAssignments,
  findDistributedTarget,
  registerAssignment,
  getAssignmentCount,
  getAssignedCreeps
} from "./targetDistribution";

// Weighted Selection - probabilistic selection from weighted entries
export type { WeightedEntry } from "./weightedSelection";
export {
  weightedSelection,
  weightedSelectionEntry,
  selectTopN,
  selectTopNEntries
} from "./weightedSelection";
