/**
 * Role Cache - MIGRATED TO UNIFIED CACHE SYSTEM
 *
 * This file now re-exports from the unified cache system.
 * See: src/cache/domains/RoleCache.ts
 */

export {
  getRoleCache,
  setRoleCache,
  deleteRoleCache,
  hasRoleCache,
  clearRoleTypeCache,
  clearAllRoleCache,
  getRoleCacheStats,
  getCachedRepairTarget,
  getCachedBuildTarget,
  getAssignedSource,
  getSourceContainer,
  getControllerEnergySource,
  clearTargetCaches
} from "../../cache/domains/RoleCache";
