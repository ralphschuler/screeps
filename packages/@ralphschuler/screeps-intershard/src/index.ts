/**
 * @ralphschuler/screeps-intershard
 * 
 * Multi-shard coordination and communication
 */

// Export main components
export { shardManager, ShardManager } from './shardManager';
export {
  configureResourceTransferCoordinator,
  resourceTransferCoordinator,
  ResourceTransferCoordinator
} from './resourceTransferCoordinator';
export type {
  CrossShardTransferRequest,
  ResourceTransferCoordinatorDependencies,
  ResourceTransferSpawnPriorities
} from './resourceTransferCoordinator';

// Export schema and types
export * from './schema';
export * from './localMemory';
export * from './creepMemoryHandoff';
export * from './types';
export type { ShardManagerConfig } from './shardManager';
