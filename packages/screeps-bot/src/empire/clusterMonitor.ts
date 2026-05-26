/**
 * Cluster Health Monitor
 * Monitors cluster health and detects issues
 */

import { logger } from "@ralphschuler/screeps-core";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { planClusterHealthIntent } from "./clusterHealthIntent";

/**
 * Cluster Monitor
 * Monitors cluster health and triggers rebalancing when needed
 */
export class ClusterMonitor {
  /**
   * Monitor cluster health and detect issues
   */
  public monitorClusterHealth(): void {
    // Only check every 50 ticks
    if (Game.time % 50 !== 0) {
      return;
    }

    const clusters = memoryManager.getClusters();
    const allOwnedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    for (const clusterId in clusters) {
      const cluster = clusters[clusterId];

      // Calculate cluster health metrics
      const clusterRooms = allOwnedRooms.filter(r => cluster.memberRooms.includes(r.name));

      if (clusterRooms.length === 0) {
        continue;
      }

      const healthIntent = planClusterHealthIntent({
        clusterId,
        memberRooms: cluster.memberRooms,
        visibleRooms: clusterRooms.map(room => ({
          roomName: room.name,
          energy: (room.storage?.store[RESOURCE_ENERGY] ?? 0) + (room.terminal?.store[RESOURCE_ENERGY] ?? 0)
        })),
        cpuUsed: Game.cpu.getUsed(),
        ownedRoomCount: allOwnedRooms.length,
        time: Game.time
      });

      if (!healthIntent) continue;

      for (const warning of healthIntent.warnings) {
        logger.warn(warning.message, { subsystem: "Cluster" });
      }

      // Update cluster metrics
      if (!cluster.metrics) {
        cluster.metrics = {
          energyIncome: 0,
          energyConsumption: 0,
          energyBalance: 0,
          warIndex: 0,
          economyIndex: 0
        };
      }

      cluster.metrics.economyIndex = healthIntent.economyIndex;
    }
  }
}

/**
 * Global cluster monitor instance
 */
export const clusterMonitor = new ClusterMonitor();
