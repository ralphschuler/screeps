/**
 * Memory Adapter
 *
 * Provides canonical Memory access for cluster management.
 * Empire keeps cluster IDs in `Memory.empire.clusters`; cluster records live in
 * top-level `Memory.clusters` via @ralphschuler/screeps-memory.
 */

import {
  createDefaultClusterMemory,
  createDefaultEmpireMemory,
  type ClusterMemory,
  type EmpireMemory,
  type SwarmState
} from "@ralphschuler/screeps-memory";

interface ClusterMemoryRoot {
  empire?: EmpireMemory;
  clusters?: Record<string, ClusterMemory>;
}

export class MemoryAdapter {
  public getEmpire(): EmpireMemory {
    const memory = Memory as unknown as ClusterMemoryRoot;
    if (!memory.empire) {
      memory.empire = createDefaultEmpireMemory();
    }
    return memory.empire;
  }

  public getClusters(): Record<string, ClusterMemory> {
    const memory = Memory as unknown as ClusterMemoryRoot;
    if (!memory.clusters) {
      memory.clusters = {};
    }
    return memory.clusters;
  }

  public getCluster(clusterId: string, coreRoom?: string): ClusterMemory | undefined {
    const clusters = this.getClusters();
    if (!clusters[clusterId] && coreRoom) {
      clusters[clusterId] = createDefaultClusterMemory(clusterId, coreRoom);
      const empire = this.getEmpire();
      if (!empire.clusters.includes(clusterId)) {
        empire.clusters.push(clusterId);
      }
    }
    return clusters[clusterId];
  }

  public getSwarmState(roomName: string): SwarmState | undefined {
    const roomMemory = Memory.rooms?.[roomName] as ({ swarm?: SwarmState } | undefined);
    return roomMemory?.swarm;
  }
}

export const memoryManager = new MemoryAdapter();
