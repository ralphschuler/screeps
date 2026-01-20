/**
 * Memory Adapter
 * 
 * Provides access to Memory structures for cluster management.
 * This is a lightweight adapter that accesses Screeps Memory directly.
 */

import type { ClusterMemory, EmpireMemory, SwarmState } from "../types";
import { createDefaultClusterMemory } from "../types";

/**
 * Memory Manager Adapter
 * Provides access to Memory structures for cluster management
 */
export class MemoryAdapter {
  /**
   * Get empire memory (all clusters)
   */
  public getEmpire(): EmpireMemory {
    if (!Memory.empire) {
      Memory.empire = { clusters: {} };
    }
    return Memory.empire as EmpireMemory;
  }

  /**
   * Get all clusters
   */
  public getClusters(): Record<string, ClusterMemory> {
    return this.getEmpire().clusters;
  }

  /**
   * Get a specific cluster by ID
   */
  public getCluster(clusterId: string, coreRoom?: string): ClusterMemory {
    const clusters = this.getClusters();
    if (!clusters[clusterId]) {
      if (!coreRoom) {
        throw new Error(`Cluster ${clusterId} not found and no coreRoom provided`);
      }
      clusters[clusterId] = createDefaultClusterMemory(clusterId, coreRoom);
    }
    return clusters[clusterId];
  }

  /**
   * Get swarm state for a room
   */
  public getSwarmState(roomName: string): SwarmState | undefined {
    const room = Game.rooms[roomName];
    if (!room) {
      return undefined;
    }
    
    // Access RoomMemory.swarm if it exists
    if (!Memory.rooms[roomName]) {
      Memory.rooms[roomName] = {};
    }
    
    const roomMemory = Memory.rooms[roomName] as any;
    return roomMemory.swarm as SwarmState | undefined;
  }
}

/**
 * Singleton instance
 */
export const memoryManager = new MemoryAdapter();
