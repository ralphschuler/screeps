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

import {
  type ClusterMemory,
  type EmpireMemory,
  type EventLogEntry,
  type OvermindMemory,
  type SwarmCreepMemory,
  type SwarmState,
  createDefaultClusterMemory,
  createDefaultEmpireMemory,
  createDefaultSwarmState
} from "./schemas";
import { INFINITE_TTL, heapCache } from "./heapCache";
import { memoryMonitor } from "./memoryMonitor";
import { memoryPruner } from "./memoryPruner";
import { migrationRunner } from "./migrations";

// Extend RoomMemory interface to add hostile property
declare global {
  interface RoomMemory {
    hostile?: boolean;
  }
}

const EMPIRE_KEY = "empire";
const CLUSTERS_KEY = "clusters";
/** Screeps memory limit in bytes */
const MEMORY_LIMIT_BYTES = 2097152; // 2MB
/**
 * Interval for dead creep memory cleanup.
 * Running every tick is wasteful since creeps don't die that often.
 */
const DEAD_CREEP_CLEANUP_INTERVAL = 10;
/**
 * Interval for automatic memory pruning.
 * Runs comprehensive cleanup every N ticks.
 */
const MEMORY_PRUNING_INTERVAL = 100;
/**
 * Interval for memory monitoring.
 * Checks memory usage and alerts when approaching limits.
 */
const MEMORY_MONITORING_INTERVAL = 50;

/**
 * Memory Manager class
 */
export class MemoryManager {
  private lastInitializeTick: number | null = null;
  private lastCleanupTick = 0;
  private lastPruningTick = 0;
  private lastMonitoringTick = 0;

  /**
   * Initialize all memory structures
   */
  public initialize(): void {
    if (this.lastInitializeTick === Game.time) return;

    this.lastInitializeTick = Game.time;

    // Initialize heap cache first (rehydrates from Memory if needed)
    heapCache.initialize();

    // Run memory migrations (must run before ensuring memory structures)
    migrationRunner.runMigrations();
    
    this.ensureEmpireMemory();
    this.ensureClustersMemory();

    // Only clean dead creeps periodically to save CPU
    if (Game.time - this.lastCleanupTick >= DEAD_CREEP_CLEANUP_INTERVAL) {
      this.cleanDeadCreeps();
      this.lastCleanupTick = Game.time;
    }

    // Run comprehensive memory pruning periodically
    if (Game.time - this.lastPruningTick >= MEMORY_PRUNING_INTERVAL) {
      memoryPruner.pruneAll();
      this.lastPruningTick = Game.time;
    }

    // Monitor memory usage periodically
    if (Game.time - this.lastMonitoringTick >= MEMORY_MONITORING_INTERVAL) {
      memoryMonitor.checkMemoryUsage();
      this.lastMonitoringTick = Game.time;
    }
  }

  /**
   * Ensure empire memory exists
   */
  private ensureEmpireMemory(): void {
    const mem = Memory as unknown as Record<string, unknown>;
    if (!mem[EMPIRE_KEY]) {
      mem[EMPIRE_KEY] = createDefaultEmpireMemory();
    }
  }

  /**
   * Ensure clusters memory exists
   */
  private ensureClustersMemory(): void {
    const mem = Memory as unknown as Record<string, unknown>;
    if (!mem[CLUSTERS_KEY]) {
      mem[CLUSTERS_KEY] = {};
    }
  }

  /**
   * Get empire memory (cached with infinite TTL)
   * Note: Returns a reference to the cached object. Modifications will be tracked.
   */
  public getEmpire(): EmpireMemory {
    const cacheKey = `memory:${EMPIRE_KEY}`;
    let empire = heapCache.get<EmpireMemory>(cacheKey);
    
    if (!empire) {
      this.ensureEmpireMemory();
      const mem = Memory as unknown as Record<string, EmpireMemory>;
      // Cache a reference to the Memory object for fast access
      // Changes to this object will need to be re-cached to persist
      heapCache.set(cacheKey, mem[EMPIRE_KEY], INFINITE_TTL);
      empire = mem[EMPIRE_KEY];
    }
    
    return empire;
  }

  /**
   * Get all clusters (cached with infinite TTL)
   * Note: Returns a reference to the cached object. Modifications will be tracked.
   */
  public getClusters(): Record<string, ClusterMemory> {
    const cacheKey = `memory:${CLUSTERS_KEY}`;
    let clusters = heapCache.get<Record<string, ClusterMemory>>(cacheKey);
    
    if (!clusters) {
      this.ensureClustersMemory();
      const mem = Memory as unknown as Record<string, Record<string, ClusterMemory>>;
      // Cache a reference to the Memory object for fast access
      heapCache.set(cacheKey, mem[CLUSTERS_KEY], INFINITE_TTL);
      clusters = mem[CLUSTERS_KEY];
    }
    
    return clusters;
  }

  /**
   * Get or create cluster
   */
  public getCluster(clusterId: string, coreRoom?: string): ClusterMemory | undefined {
    const clusters = this.getClusters();
    if (!clusters[clusterId] && coreRoom) {
      clusters[clusterId] = createDefaultClusterMemory(clusterId, coreRoom);
    }
    return clusters[clusterId];
  }

  /**
   * Get swarm state for a room (cached with infinite TTL)
   * Note: Returns a reference to the cached object. Modifications will be tracked.
   */
  public getSwarmState(roomName: string): SwarmState | undefined {
    const cacheKey = `memory:room:${roomName}:swarm`;
    let swarmState = heapCache.get<SwarmState>(cacheKey);
    
    if (!swarmState) {
      const roomMemory = Memory.rooms?.[roomName];
      if (!roomMemory) return undefined;
      const roomSwarm = (roomMemory as unknown as { swarm?: SwarmState }).swarm;
      if (roomSwarm) {
        // Cache a reference to the Memory object for fast access
        heapCache.set(cacheKey, roomSwarm, INFINITE_TTL);
        swarmState = roomSwarm;
      }
    }
    
    return swarmState;
  }

  /**
   * Initialize swarm state for a room (cached with infinite TTL)
   * Note: Returns a reference to the cached object. Modifications will be tracked.
   */
  public initSwarmState(roomName: string): SwarmState {
    const cacheKey = `memory:room:${roomName}:swarm`;
    
    if (!Memory.rooms) {
      Memory.rooms = {};
    }
    if (!Memory.rooms[roomName]) {
      Memory.rooms[roomName] = {} as RoomMemory;
    }

    const roomMem = Memory.rooms[roomName] as unknown as { swarm?: SwarmState };
    if (!roomMem.swarm) {
      roomMem.swarm = createDefaultSwarmState();
    }

    // Cache a reference to the Memory object for fast access
    heapCache.set(cacheKey, roomMem.swarm, INFINITE_TTL);
    
    return roomMem.swarm;
  }

  /**
   * Get or init swarm state
   */
  public getOrInitSwarmState(roomName: string): SwarmState {
    return this.getSwarmState(roomName) ?? this.initSwarmState(roomName);
  }

  /**
   * Get creep memory with type safety
   */
  public getCreepMemory(creepName: string): SwarmCreepMemory | undefined {
    const creep = Game.creeps[creepName];
    if (!creep) return undefined;
    return creep.memory as unknown as SwarmCreepMemory;
  }

  /**
   * Clean up dead creep memory
   * OPTIMIZATION: Use for-in loop instead of Object.keys() to avoid creating temporary array.
   * With 100+ creeps, this saves ~0.1 CPU per cleanup cycle.
   * TODO(P3): PERF - Add batch cleanup with configurable limit to spread cost across ticks
   * For 1000+ creeps, cleaning all at once might be expensive
   * TODO(P3): FEATURE - Consider tracking high-value creep data before cleanup for post-mortem analysis
   * Log or cache stats for expensive boosted creeps to analyze their effectiveness
   */
  public cleanDeadCreeps(): number {
    let cleaned = 0;
    // Use for-in loop instead of Object.keys() - more memory efficient
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
        cleaned++;
      }
    }
    return cleaned;
  }

  /**
   * Record room as seen
   * Updates the lastSeen timestamp for a room in empire memory
   * Note: Modifies the cached object in-place. Changes persist via Memory reference.
   */
  public recordRoomSeen(roomName: string): void {
    const empire = this.getEmpire();
    if (!empire.knownRooms[roomName]) {
      empire.knownRooms[roomName] = {
        name: roomName,
        lastSeen: Game.time,
        sources: 0,
        controllerLevel: 0,
        threatLevel: 0,
        scouted: false,
        terrain: "mixed",
        isHighway: false,
        isSK: false
      };
    } else {
      empire.knownRooms[roomName].lastSeen = Game.time;
    }
    // No need to re-cache: empire is a reference to Memory object
  }

  /**
   * Add event to room log
   */
  public addRoomEvent(roomName: string, type: string, details?: string): void {
    const swarm = this.getSwarmState(roomName);
    if (!swarm) return;

    const entry: EventLogEntry = {
      type,
      time: Game.time
    };

    if (details !== undefined) {
      entry.details = details;
    }

    swarm.eventLog.push(entry);

    // Keep only last 20 events
    while (swarm.eventLog.length > 20) {
      swarm.eventLog.shift();
    }
  }

  /**
   * Get memory size estimate
   */
  public getMemorySize(): number {
    return JSON.stringify(Memory).length;
  }

  /**
   * Check if memory is near limit
   */
  public isMemoryNearLimit(): boolean {
    const size = this.getMemorySize();
    return size > MEMORY_LIMIT_BYTES * 0.9;
  }

  /**
   * Persist heap cache to Memory.
   * Should be called periodically to save cache state.
   */
  public persistHeapCache(): void {
    heapCache.persist();
  }

  /**
   * Get heap cache manager instance.
   * Provides access to the cache for external use.
   */
  public getHeapCache(): typeof heapCache {
    return heapCache;
  }

  /**
   * Check if a room is marked as hostile (cached for 100 ticks)
   */
  public isRoomHostile(roomName: string): boolean {
    const cacheKey = `memory:room:${roomName}:hostile`;
    const cached = heapCache.get<boolean | null>(cacheKey);
    
    // Check if value is cached (null means "not hostile" was cached)
    if (cached !== undefined) {
      return cached === true;
    }
    
    // Not cached, fetch from Memory
    const hostile = Memory.rooms?.[roomName]?.hostile ?? false;
    heapCache.set(cacheKey, hostile ? true : null, 100); // Cache for 100 ticks
    
    return hostile;
  }

  /**
   * Mark a room as hostile (cached for 100 ticks)
   */
  public setRoomHostile(roomName: string, hostile: boolean): void {
    if (!Memory.rooms) Memory.rooms = {};
    if (!Memory.rooms[roomName]) Memory.rooms[roomName] = {};
    Memory.rooms[roomName].hostile = hostile;
    
    const cacheKey = `memory:room:${roomName}:hostile`;
    heapCache.set(cacheKey, hostile ? true : null, 100); // Cache for 100 ticks
  }
}

/**
 * Global memory manager instance
 */
export const memoryManager = new MemoryManager();
