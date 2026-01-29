/**
 * Cluster Health Monitor
 * Monitors cluster health and detects issues
 */

import { logger } from "@ralphschuler/screeps-core";
import { memoryManager } from "@ralphschuler/screeps-memory";

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

      // Check energy availability across cluster
      const totalEnergy = clusterRooms.reduce((sum, r) => {
        return sum + (r.storage?.store[RESOURCE_ENERGY] ?? 0) + (r.terminal?.store[RESOURCE_ENERGY] ?? 0);
      }, 0);
      const avgEnergy = totalEnergy / clusterRooms.length;

      // Check CPU usage per room
      const avgCpuPerRoom = Game.cpu.getUsed() / allOwnedRooms.length;

      // Detect unhealthy conditions
      const lowEnergy = avgEnergy < 30000;
      const highCpu = avgCpuPerRoom > 2.0;

      if (lowEnergy || highCpu) {
        logger.warn(`Cluster ${clusterId} health issue detected - avgEnergy: ${avgEnergy.toFixed(0)}, avgCPU: ${avgCpuPerRoom.toFixed(2)}`, {
          subsystem: "Cluster",
          lowEnergy,
          highCpu
        });
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

      // Calculate economy health index (0-100)
      const energyScore = Math.min(100, (avgEnergy / 100000) * 100);
      const roomCountScore = (clusterRooms.length / cluster.memberRooms.length) * 100;
      cluster.metrics.economyIndex = Math.round((energyScore + roomCountScore) / 2);

      // Trigger rebalancing if economy index is low
      if (cluster.metrics.economyIndex < 40 && Game.time % 500 === 0) {
        logger.warn(
          `Cluster ${clusterId} economy index low: ${cluster.metrics.economyIndex} - consider rebalancing`,
          { subsystem: "Cluster" }
        );
      }
    }
  }
}

/**
 * Global cluster monitor instance
 */
export const clusterMonitor = new ClusterMonitor();
