/**
 * Cluster Manager - Multi-Room Coordination
 *
 * Coordinates operations across rooms in a cluster:
 * - Terminal resource balancing
 * - Squad formation and coordination
 * - Rally point management
 * - Inter-room logistics
 * - Cluster-wide metrics
 *
 * Addresses Issues: #8, #20, #36
 */

import type { ClusterMemory, SquadDefinition } from "../memory/schemas";
import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { profiler } from "../core/profiler";

/**
 * Cluster Manager Configuration
 */
export interface ClusterConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run cluster logic */
  minBucket: number;
  /** Resource balance threshold (send if surplus > this) */
  resourceBalanceThreshold: number;
  /** Minimum terminal energy to keep */
  minTerminalEnergy: number;
}

const DEFAULT_CONFIG: ClusterConfig = {
  updateInterval: 10,
  minBucket: 3000,
  resourceBalanceThreshold: 10000,
  minTerminalEnergy: 50000
};

/**
 * Cluster Manager Class
 */
export class ClusterManager {
  private config: ClusterConfig;
  private lastRun: Map<string, number> = new Map();

  public constructor(config: Partial<ClusterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run all clusters
   */
  public run(): void {
    // Check bucket
    if (Game.cpu.bucket < this.config.minBucket) {
      return;
    }

    const clusters = memoryManager.getClusters();

    for (const clusterId in clusters) {
      const cluster = clusters[clusterId];

      // Check if we should run this cluster
      if (!this.shouldRunCluster(clusterId)) {
        continue;
      }

      try {
        this.runCluster(cluster);
        this.lastRun.set(clusterId, Game.time);
      } catch (err) {
        logger.error(`Cluster ${clusterId} error: ${err}`, { subsystem: "Cluster" });
      }
    }
  }

  /**
   * Check if cluster should run this tick
   */
  private shouldRunCluster(clusterId: string): boolean {
    const lastRun = this.lastRun.get(clusterId) ?? 0;
    return Game.time - lastRun >= this.config.updateInterval;
  }

  /**
   * Run a single cluster
   */
  private runCluster(cluster: ClusterMemory): void {
    const cpuStart = Game.cpu.getUsed();

    // Update cluster metrics
    profiler.measureSubsystem(`cluster:${cluster.id}:metrics`, () => {
      this.updateClusterMetrics(cluster);
    });

    // Balance terminal resources
    profiler.measureSubsystem(`cluster:${cluster.id}:terminals`, () => {
      this.balanceTerminalResources(cluster);
    });

    // Update squads
    profiler.measureSubsystem(`cluster:${cluster.id}:squads`, () => {
      this.updateSquads(cluster);
    });

    // Update cluster role
    profiler.measureSubsystem(`cluster:${cluster.id}:role`, () => {
      this.updateClusterRole(cluster);
    });

    cluster.lastUpdate = Game.time;

    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    if (cpuUsed > 1 && Game.time % 50 === 0) {
      logger.debug(`Cluster ${cluster.id} tick: ${cpuUsed.toFixed(2)} CPU`, { subsystem: "Cluster" });
    }
  }

  /**
   * Update cluster-wide metrics
   */
  private updateClusterMetrics(cluster: ClusterMemory): void {
    let totalEnergyIncome = 0;
    let totalEnergyConsumption = 0;
    let totalWarIndex = 0;
    let totalEconomyIndex = 0;
    let roomCount = 0;

    for (const roomName of cluster.memberRooms) {
      const swarm = memoryManager.getSwarmState(roomName);
      if (!swarm) continue;

      totalEnergyIncome += swarm.metrics.energyHarvested;
      totalEnergyConsumption += swarm.metrics.energySpawning + swarm.metrics.energyConstruction + swarm.metrics.energyRepair;
      totalWarIndex += swarm.danger * 25; // Convert danger (0-3) to index (0-75)
      
      // Economy index based on storage and energy income
      const room = Game.rooms[roomName];
      if (room?.storage) {
        const storageRatio = room.storage.store.getUsedCapacity(RESOURCE_ENERGY) / room.storage.store.getCapacity();
        totalEconomyIndex += storageRatio * 100;
      } else {
        totalEconomyIndex += swarm.metrics.energyHarvested > 0 ? 50 : 0;
      }

      roomCount++;
    }

    if (roomCount > 0) {
      cluster.metrics.energyIncome = totalEnergyIncome / roomCount;
      cluster.metrics.energyConsumption = totalEnergyConsumption / roomCount;
      cluster.metrics.energyBalance = cluster.metrics.energyIncome - cluster.metrics.energyConsumption;
      cluster.metrics.warIndex = Math.min(100, totalWarIndex / roomCount);
      cluster.metrics.economyIndex = Math.min(100, totalEconomyIndex / roomCount);
    }
  }

  /**
   * Balance terminal resources across cluster
   */
  private balanceTerminalResources(cluster: ClusterMemory): void {
    // Get all terminals in cluster
    const terminals: { room: Room; terminal: StructureTerminal }[] = [];

    for (const roomName of cluster.memberRooms) {
      const room = Game.rooms[roomName];
      if (room?.terminal && room.terminal.my) {
        terminals.push({ room, terminal: room.terminal });
      }
    }

    if (terminals.length < 2) {
      return; // Need at least 2 terminals to balance
    }

    // Balance energy
    this.balanceResource(terminals, RESOURCE_ENERGY);

    // Balance minerals (every 50 ticks)
    if (Game.time % 50 === 0) {
      const minerals: ResourceConstant[] = [
        RESOURCE_HYDROGEN,
        RESOURCE_OXYGEN,
        RESOURCE_UTRIUM,
        RESOURCE_LEMERGIUM,
        RESOURCE_KEANIUM,
        RESOURCE_ZYNTHIUM,
        RESOURCE_CATALYST
      ];

      for (const mineral of minerals) {
        this.balanceResource(terminals, mineral);
      }
    }
  }

  /**
   * Balance a specific resource across terminals
   */
  private balanceResource(
    terminals: { room: Room; terminal: StructureTerminal }[],
    resource: ResourceConstant
  ): void {
    // Calculate average
    let total = 0;
    for (const { terminal } of terminals) {
      total += terminal.store.getUsedCapacity(resource);
    }
    const average = total / terminals.length;

    // Find surplus and deficit terminals
    const surplus = terminals.filter(t => t.terminal.store.getUsedCapacity(resource) > average + this.config.resourceBalanceThreshold);
    const deficit = terminals.filter(t => t.terminal.store.getUsedCapacity(resource) < average - this.config.resourceBalanceThreshold);

    if (surplus.length === 0 || deficit.length === 0) {
      return;
    }

    // Transfer from surplus to deficit
    for (const source of surplus) {
      if (source.terminal.cooldown > 0) continue;

      // Don't send if it would drop below minimum energy
      if (resource === RESOURCE_ENERGY) {
        if (source.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < this.config.minTerminalEnergy + this.config.resourceBalanceThreshold) {
          continue;
        }
      }

      for (const target of deficit) {
        const amount = Math.min(
          source.terminal.store.getUsedCapacity(resource) - average,
          average - target.terminal.store.getUsedCapacity(resource),
          10000 // Max transfer per tick
        );

        if (amount > 1000) {
          const result = source.terminal.send(resource, amount, target.room.name);
          if (result === OK) {
            logger.debug(
              `Transferred ${amount} ${resource} from ${source.room.name} to ${target.room.name}`,
              { subsystem: "Cluster" }
            );
            break; // One transfer per terminal per tick
          }
        }
      }
    }
  }

  /**
   * Update squad status
   */
  private updateSquads(cluster: ClusterMemory): void {
    // Remove dissolved squads
    cluster.squads = cluster.squads.filter(squad => squad.state !== "dissolving");

    // Update existing squads
    for (const squad of cluster.squads) {
      this.updateSquad(squad);
    }
  }

  /**
   * Update a single squad
   */
  private updateSquad(squad: SquadDefinition): void {
    // Remove dead members
    squad.members = squad.members.filter(name => Game.creeps[name]);

    // Check if squad should dissolve
    if (squad.members.length === 0) {
      squad.state = "dissolving";
      logger.info(`Squad ${squad.id} dissolved - no members remaining`, { subsystem: "Cluster" });
      return;
    }

    // Update squad state based on member positions
    const members = squad.members.map(name => Game.creeps[name]).filter(c => c);

    if (members.length === 0) {
      squad.state = "dissolving";
      return;
    }

    // Check if all members are in rally room
    const inRally = members.every(c => c.room.name === squad.rallyRoom);

    if (squad.state === "gathering" && inRally) {
      squad.state = "moving";
      logger.info(`Squad ${squad.id} gathered, moving to target`, { subsystem: "Cluster" });
    }

    // Check if all members are in target room
    const inTarget = members.some(c => squad.targetRooms.includes(c.room.name));

    if (squad.state === "moving" && inTarget) {
      squad.state = "attacking";
      logger.info(`Squad ${squad.id} reached target, engaging`, { subsystem: "Cluster" });
    }

    // Check if squad should retreat (>50% casualties)
    const originalSize = squad.members.length;
    if (squad.state === "attacking" && members.length < originalSize * 0.5) {
      squad.state = "retreating";
      logger.warn(`Squad ${squad.id} retreating - heavy casualties`, { subsystem: "Cluster" });
    }
  }

  /**
   * Update cluster role based on metrics
   */
  private updateClusterRole(cluster: ClusterMemory): void {
    const { warIndex, economyIndex } = cluster.metrics;

    // Determine role based on metrics
    if (warIndex > 50) {
      cluster.role = "war";
    } else if (economyIndex > 70 && warIndex < 20) {
      cluster.role = "economic";
    } else if (economyIndex < 40) {
      cluster.role = "frontier";
    } else {
      cluster.role = "mixed";
    }
  }

  /**
   * Create a new cluster for a room
   */
  public createCluster(coreRoom: string): ClusterMemory {
    const clusterId = `cluster_${coreRoom}`;
    const cluster = memoryManager.getCluster(clusterId, coreRoom);

    if (!cluster) {
      throw new Error(`Failed to create cluster for ${coreRoom}`);
    }

    logger.info(`Created cluster ${clusterId} with core room ${coreRoom}`, { subsystem: "Cluster" });
    return cluster;
  }

  /**
   * Add room to cluster
   */
  public addRoomToCluster(clusterId: string, roomName: string, isRemote: boolean = false): void {
    const cluster = memoryManager.getCluster(clusterId);
    if (!cluster) {
      logger.error(`Cluster ${clusterId} not found`, { subsystem: "Cluster" });
      return;
    }

    if (isRemote) {
      if (!cluster.remoteRooms.includes(roomName)) {
        cluster.remoteRooms.push(roomName);
        logger.info(`Added remote room ${roomName} to cluster ${clusterId}`, { subsystem: "Cluster" });
      }
    } else {
      if (!cluster.memberRooms.includes(roomName)) {
        cluster.memberRooms.push(roomName);
        logger.info(`Added member room ${roomName} to cluster ${clusterId}`, { subsystem: "Cluster" });
      }
    }
  }
}

/**
 * Global cluster manager instance
 */
export const clusterManager = new ClusterManager();
