/**
 * Compatibility exports for layout planning.
 *
 * Canonical implementation lives in `@ralphschuler/screeps-layouts`.
 * Keep this shim so older bot-local imports continue to work without
 * duplicating planner logic.
 */

export {
  clearTerrainCache,
  findOptimalAnchor,
  getCachedTerrain,
  hasEnoughSpace
} from "@ralphschuler/screeps-layouts";
