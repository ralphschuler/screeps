/**
 * @ralphschuler/screeps-memory
 * 
 * Memory schemas and TypeScript types for the Screeps swarm architecture.
 * Organized by domain for better maintainability and modularity.
 */

// Empire schemas - Global meta-layer state
export * from './schemas/empireSchemas';

// Cluster schemas - Inter-room coordination
export * from './schemas/clusterSchemas';

// Room/Swarm schemas - Room-level state
export * from './schemas/roomSchemas';

// Creep schemas - Creep roles and memory
export * from './schemas/creepSchemas';

// Utility schemas - Visualization and misc
export * from './schemas/utilitySchemas';
