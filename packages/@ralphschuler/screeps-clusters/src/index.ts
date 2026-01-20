/**
 * @ralphschuler/screeps-clusters
 * 
 * Colony cluster management and coordination for multi-room operations.
 * Handles military coordination, resource sharing, and offensive operations.
 */

// Cluster Manager
export { clusterManager, ClusterManager } from "./clusterManager";

// Military Coordination
export * from "./squadCoordinator";
export * from "./squadFormationManager";
export * from "./attackTargetSelector";
export * from "./rallyPointManager";

// Resource Management
export { resourceSharingManager, ResourceSharingManager } from "./resourceSharing";
export * from "./militaryResourcePooling";

// Offensive Operations - explicit exports to avoid conflicts
export { 
  planOffensiveOperations,
  updateOffensiveOperations,
  type OffensiveOperation
} from "./offensiveOperations";
export {
  type OffensiveDoctrine,
  type DoctrineComposition,
  type TargetPriority,
  type DoctrineConfig,
  DOCTRINE_CONFIGS,
  selectDoctrine,
  canLaunchDoctrine,
  getTargetPriority,
  getDoctrineComposition,
  getEngagementRules
} from "./offensiveDoctrine";

// Types
export * from "./types";

// Adapters (for advanced usage)
export * from "./adapters/memoryAdapter";
export * from "./adapters/defenderAdapter";
export * from "./adapters/spawnQueueAdapter";
