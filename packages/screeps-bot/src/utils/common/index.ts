/**
 * Common Utilities
 *
 * Bot-specific utilities that are tightly coupled to the bot's
 * memory schemas and cannot be easily extracted.
 */

// Collection Point - rally point calculation for military units (uses SwarmState)
export {
  getCollectionPoint,
  invalidateCollectionPoint
} from "./collectionPoint";

