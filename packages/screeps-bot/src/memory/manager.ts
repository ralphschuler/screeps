/**
 * Memory Manager
 *
 * Handles initialization, validation, and access to all memory structures.
 */

import {
  type ClusterMemory,
  type EventLogEntry,
  type OvermindMemory,
  type SwarmCreepMemory,
  type SwarmState,
  createDefaultClusterMemory,
  createDefaultOvermindMemory,
  createDefaultSwarmState
} from "./schemas";
import { heapCache, INFINITE_TTL } from "./heapCache";

const OVERMIND_KEY = "overmind";
const CLUSTERS_KEY = "clusters";
/** Screeps memory limit in bytes */
const MEMORY_LIMIT_BYTES = 2097152; // 2MB
/** Current memory version */
const CURRENT_MEMORY_VERSION = 1;
/**
 * Interval for dead creep memory cleanup.
 * Running every tick is wasteful since creeps don't die that often.
 */
const DEAD_CREEP_CLEANUP_INTERVAL = 10;

/**
 * Memory Manager class
 */
export class MemoryManager {
  private lastInitializeTick: number | null = null;
  private lastCleanupTick = 0;

  /**
   * Initialize all memory structures
   */
  public initialize(): void {
    if (this.lastInitializeTick === Game.time) return;

    this.lastInitializeTick = Game.time;

    // Initialize heap cache first (rehydrates from Memory if needed)
    heapCache.initialize();

    this.runMemoryMigration();
    this.ensureOvermindMemory();
    this.ensureClustersMemory();

    // Only clean dead creeps periodically to save CPU
    if (Game.time - this.lastCleanupTick >= DEAD_CREEP_CLEANUP_INTERVAL) {
      this.cleanDeadCreeps();
      this.lastCleanupTick = Game.time;
    }
  }

  /**
   * Run memory migration if version changed
   */
  private runMemoryMigration(): void {
    const mem = Memory as unknown as Record<string, unknown>;
    const storedVersion = (mem.memoryVersion as number) ?? 0;

    if (storedVersion < CURRENT_MEMORY_VERSION) {
      console.log(`[MemoryManager] Migrating memory from version ${storedVersion} to ${CURRENT_MEMORY_VERSION}`);
      
      // Run migrations in sequence
      if (storedVersion < 1) {
        this.migrateToV1();
      }
      
      // Update version
      mem.memoryVersion = CURRENT_MEMORY_VERSION;
      console.log(`[MemoryManager] Memory migration complete`);
    }
  }

  /**
   * Migrate to version 1
   */
  private migrateToV1(): void {
    // Migration to v1: Update all creep memory to include version field
    for (const name in Memory.creeps) {
      const creepMem = Memory.creeps[name] as unknown as SwarmCreepMemory;
      if (creepMem && creepMem.version === undefined) {
        creepMem.version = 1;
      }
    }
  }

  /**
   * Ensure overmind memory exists
   */
  private ensureOvermindMemory(): void {
    const mem = Memory as unknown as Record<string, unknown>;
    if (!mem[OVERMIND_KEY]) {
      mem[OVERMIND_KEY] = createDefaultOvermindMemory();
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
   * Get overmind memory (cached with infinite TTL)
   */
  public getOvermind(): OvermindMemory {
    const cacheKey = `memory:${OVERMIND_KEY}`;
    let overmind = heapCache.get<OvermindMemory>(cacheKey);
    
    if (!overmind) {
      this.ensureOvermindMemory();
      const mem = Memory as unknown as Record<string, OvermindMemory>;
      overmind = mem[OVERMIND_KEY];
      heapCache.set(cacheKey, overmind, INFINITE_TTL);
    }
    
    return overmind;
  }

  /**
   * Get all clusters (cached with infinite TTL)
   */
  public getClusters(): Record<string, ClusterMemory> {
    const cacheKey = `memory:${CLUSTERS_KEY}`;
    let clusters = heapCache.get<Record<string, ClusterMemory>>(cacheKey);
    
    if (!clusters) {
      this.ensureClustersMemory();
      const mem = Memory as unknown as Record<string, Record<string, ClusterMemory>>;
      clusters = mem[CLUSTERS_KEY];
      heapCache.set(cacheKey, clusters, INFINITE_TTL);
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
   */
  public getSwarmState(roomName: string): SwarmState | undefined {
    const cacheKey = `memory:room:${roomName}:swarm`;
    let swarmState = heapCache.get<SwarmState>(cacheKey);
    
    if (!swarmState) {
      const roomMemory = Memory.rooms?.[roomName];
      if (!roomMemory) return undefined;
      swarmState = (roomMemory as unknown as { swarm?: SwarmState }).swarm;
      if (swarmState) {
        heapCache.set(cacheKey, swarmState, INFINITE_TTL);
      }
    }
    
    return swarmState;
  }

  /**
   * Initialize swarm state for a room (cached with infinite TTL)
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

    // Cache the swarm state with infinite TTL
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
   */
  public recordRoomSeen(roomName: string): void {
    const overmind = this.getOvermind();
    overmind.roomsSeen[roomName] = Game.time;
    
    // Invalidate cache to ensure changes are persisted
    const cacheKey = `memory:${OVERMIND_KEY}`;
    heapCache.set(cacheKey, overmind, INFINITE_TTL);
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
   * Check if a room is marked as hostile (cached)
   */
  public isRoomHostile(roomName: string): boolean {
    const cacheKey = `memory:room:${roomName}:hostile`;
    let hostile = heapCache.get<boolean>(cacheKey);
    
    if (hostile === undefined) {
      hostile = Memory.rooms?.[roomName]?.hostile ?? false;
      heapCache.set(cacheKey, hostile, 100); // Cache for 100 ticks
    }
    
    return hostile;
  }

  /**
   * Mark a room as hostile (cached)
   */
  public setRoomHostile(roomName: string, hostile: boolean): void {
    if (!Memory.rooms) Memory.rooms = {};
    if (!Memory.rooms[roomName]) Memory.rooms[roomName] = {};
    Memory.rooms[roomName].hostile = hostile;
    
    const cacheKey = `memory:room:${roomName}:hostile`;
    heapCache.set(cacheKey, hostile, 100); // Cache for 100 ticks
  }
}

/**
 * Global memory manager instance
 */
export const memoryManager = new MemoryManager();
