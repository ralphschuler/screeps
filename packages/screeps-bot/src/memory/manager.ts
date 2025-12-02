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

const OVERMIND_KEY = "overmind";
const CLUSTERS_KEY = "clusters";
/** Screeps memory limit in bytes */
const MEMORY_LIMIT_BYTES = 2097152; // 2MB
/** Current memory version */
const CURRENT_MEMORY_VERSION = 1;

/**
 * Memory Manager class
 */
export class MemoryManager {
  private initialized = false;

  /**
   * Initialize all memory structures
   */
  public initialize(): void {
    if (this.initialized) return;

    this.runMemoryMigration();
    this.ensureOvermindMemory();
    this.ensureClustersMemory();
    this.cleanDeadCreeps();

    this.initialized = true;
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
   * Get overmind memory
   */
  public getOvermind(): OvermindMemory {
    this.ensureOvermindMemory();
    const mem = Memory as unknown as Record<string, OvermindMemory>;
    return mem[OVERMIND_KEY];
  }

  /**
   * Get all clusters
   */
  public getClusters(): Record<string, ClusterMemory> {
    this.ensureClustersMemory();
    const mem = Memory as unknown as Record<string, Record<string, ClusterMemory>>;
    return mem[CLUSTERS_KEY];
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
   * Get swarm state for a room
   */
  public getSwarmState(roomName: string): SwarmState | undefined {
    const roomMemory = Memory.rooms?.[roomName];
    if (!roomMemory) return undefined;
    return (roomMemory as unknown as { swarm?: SwarmState }).swarm;
  }

  /**
   * Initialize swarm state for a room
   */
  public initSwarmState(roomName: string): SwarmState {
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
   */
  public cleanDeadCreeps(): number {
    let cleaned = 0;
    for (const name of Object.keys(Memory.creeps || {})) {
      if (!Game.creeps[name]) {
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
}

/**
 * Global memory manager instance
 */
export const memoryManager = new MemoryManager();
