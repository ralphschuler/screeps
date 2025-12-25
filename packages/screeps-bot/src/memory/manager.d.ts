/**
 * Memory Manager
 *
 * Handles initialization, validation, and access to all memory structures.
 * Integrates memory compression, segmentation, monitoring, and automatic pruning.
 *
 * Memory Management Strategy (ROADMAP Section 4):
 * - Layer 1: Memory monitoring with alerts (memoryMonitor.ts)
 * - Layer 2: Automatic data pruning (memoryPruner.ts)
 * - Layer 3: Memory segmentation for rarely-accessed data (memorySegmentManager.ts)
 * - Layer 4: Data compression using LZ-String (memoryCompressor.ts)
 * - Layer 5: Schema migration system (migrations.ts)
 */
import { type ClusterMemory, type EmpireMemory, type SwarmCreepMemory, type SwarmState } from "./schemas";
import { heapCache } from "./heapCache";
/**
 * Memory Manager class
 */
export declare class MemoryManager {
    private lastInitializeTick;
    private lastCleanupTick;
    private lastPruningTick;
    private lastMonitoringTick;
    /**
     * Initialize all memory structures
     */
    initialize(): void;
    /**
     * Ensure empire memory exists
     */
    private ensureEmpireMemory;
    /**
     * Ensure clusters memory exists
     */
    private ensureClustersMemory;
    /**
     * Get empire memory (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    getEmpire(): EmpireMemory;
    /**
     * Get all clusters (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    getClusters(): Record<string, ClusterMemory>;
    /**
     * Get or create cluster
     */
    getCluster(clusterId: string, coreRoom?: string): ClusterMemory | undefined;
    /**
     * Get swarm state for a room (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    getSwarmState(roomName: string): SwarmState | undefined;
    /**
     * Initialize swarm state for a room (cached with infinite TTL)
     * Note: Returns a reference to the cached object. Modifications will be tracked.
     */
    initSwarmState(roomName: string): SwarmState;
    /**
     * Get or init swarm state
     */
    getOrInitSwarmState(roomName: string): SwarmState;
    /**
     * Get creep memory with type safety
     */
    getCreepMemory(creepName: string): SwarmCreepMemory | undefined;
    /**
     * Clean up dead creep memory
     * OPTIMIZATION: Use for-in loop instead of Object.keys() to avoid creating temporary array.
     * With 100+ creeps, this saves ~0.1 CPU per cleanup cycle.
     * TODO(P3): PERF - Add batch cleanup with configurable limit to spread cost across ticks
     * For 1000+ creeps, cleaning all at once might be expensive
     * TODO(P3): FEATURE - Consider tracking high-value creep data before cleanup for post-mortem analysis
     * Log or cache stats for expensive boosted creeps to analyze their effectiveness
     */
    cleanDeadCreeps(): number;
    /**
     * Record room as seen
     * Updates the lastSeen timestamp for a room in empire memory
     * Note: Modifies the cached object in-place. Changes persist via Memory reference.
     */
    recordRoomSeen(roomName: string): void;
    /**
     * Add event to room log
     */
    addRoomEvent(roomName: string, type: string, details?: string): void;
    /**
     * Get memory size estimate
     */
    getMemorySize(): number;
    /**
     * Check if memory is near limit
     */
    isMemoryNearLimit(): boolean;
    /**
     * Persist heap cache to Memory.
     * Should be called periodically to save cache state.
     */
    persistHeapCache(): void;
    /**
     * Get heap cache manager instance.
     * Provides access to the cache for external use.
     */
    getHeapCache(): typeof heapCache;
    /**
     * Check if a room is marked as hostile (cached for 100 ticks)
     */
    isRoomHostile(roomName: string): boolean;
    /**
     * Mark a room as hostile (cached for 100 ticks)
     */
    setRoomHostile(roomName: string, hostile: boolean): void;
}
/**
 * Global memory manager instance
 */
export declare const memoryManager: MemoryManager;
//# sourceMappingURL=manager.d.ts.map