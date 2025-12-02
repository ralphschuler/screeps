/**
 * Cluster Manager
 *
 * Implements roadmap Section 3.3 and Section 11:
 * - Groups adjacent owned rooms with remotes
 * - Coordinates inter-room logistics (terminal transfers)
 * - Manages military squads across rooms
 * - Aggregates cluster metrics
 */

import type { ClusterMemory, SquadDefinition } from "../memory/schemas";
import { createDefaultClusterMemory } from "../memory/schemas";
import { logger } from "../core/logger";

/**
 * Cluster Manager configuration
 */
export interface ClusterConfig {
  /** Ticks between cluster updates */
  updateInterval: number;
  /** Maximum distance for rooms to be in same cluster */
  maxClusterDistance: number;
  /** Target energy balance in terminals */
  terminalEnergyTarget: number;
}

const DEFAULT_CONFIG: ClusterConfig = {
  updateInterval: 20,
  maxClusterDistance: 3,
  terminalEnergyTarget: 50000
};

/**
 * Cluster Manager class
 */
export class ClusterManager {
  private config: ClusterConfig;
  private lastUpdate = 0;

  public constructor(config: Partial<ClusterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get or initialize clusters memory
   */
  public getClustersMemory(): Record<string, ClusterMemory> {
    const mem = Memory as unknown as { clusters?: Record<string, ClusterMemory> };
    if (!mem.clusters) {
      mem.clusters = {};
    }
    return mem.clusters;
  }

  /**
   * Run the cluster manager
   */
  public run(): void {
    if (Game.time - this.lastUpdate < this.config.updateInterval) {
      return;
    }

    const cpuStart = Game.cpu.getUsed();

    // Update cluster assignments
    this.updateClusterAssignments();

    // Update cluster metrics
    this.updateClusterMetrics();

    // Balance terminal resources
    this.balanceTerminalResources();

    // Update squad states
    this.updateSquads();

    this.lastUpdate = Game.time;

    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    if (cpuUsed > 0.5) {
      logger.debug(`Cluster manager used ${cpuUsed.toFixed(2)} CPU`, { subsystem: "Cluster" });
    }
  }

  /**
   * Update cluster assignments for owned rooms
   */
  private updateClusterAssignments(): void {
    const clusters = this.getClustersMemory();
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Find rooms not in any cluster
    const unassignedRooms = ownedRooms.filter(room => {
      const roomClusterId = this.getRoomClusterId(room.name);
      return !roomClusterId || !clusters[roomClusterId];
    });

    for (const room of unassignedRooms) {
      // Try to find nearby cluster
      let assignedCluster: ClusterMemory | undefined;

      for (const cluster of Object.values(clusters)) {
        const distance = Game.map.getRoomLinearDistance(room.name, cluster.coreRoom);
        if (distance <= this.config.maxClusterDistance) {
          assignedCluster = cluster;
          break;
        }
      }

      if (assignedCluster) {
        // Add to existing cluster
        if (!assignedCluster.memberRooms.includes(room.name)) {
          assignedCluster.memberRooms.push(room.name);
        }
        this.setRoomClusterId(room.name, assignedCluster.id);
      } else {
        // Create new cluster with this room as core
        const clusterId = `cluster_${room.name}`;
        const newCluster = createDefaultClusterMemory(clusterId, room.name);
        clusters[clusterId] = newCluster;
        this.setRoomClusterId(room.name, clusterId);
      }
    }

    // Clean up empty clusters
    for (const [clusterId, cluster] of Object.entries(clusters)) {
      const activeRooms = cluster.memberRooms.filter(name => {
        const room = Game.rooms[name];
        return room && room.controller?.my;
      });

      if (activeRooms.length === 0) {
        delete clusters[clusterId];
      } else {
        cluster.memberRooms = activeRooms;
      }
    }
  }

  /**
   * Get cluster ID for a room
   */
  private getRoomClusterId(roomName: string): string | undefined {
    const room = Game.rooms[roomName];
    if (!room?.memory) return undefined;
    const swarm = (room.memory as unknown as { swarm?: { clusterId?: string } }).swarm;
    return swarm?.clusterId;
  }

  /**
   * Set cluster ID for a room
   */
  private setRoomClusterId(roomName: string, clusterId: string): void {
    const room = Game.rooms[roomName];
    if (!room?.memory) return;
    const mem = room.memory as unknown as { swarm?: { clusterId?: string } };
    if (!mem.swarm) {
      mem.swarm = {};
    }
    mem.swarm.clusterId = clusterId;
  }

  /**
   * Update cluster metrics
   */
  private updateClusterMetrics(): void {
    const clusters = this.getClustersMemory();

    for (const cluster of Object.values(clusters)) {
      let totalEnergyIncome = 0;
      let totalEnergyConsumption = 0;
      let maxThreat = 0;

      for (const roomName of cluster.memberRooms) {
        const room = Game.rooms[roomName];
        if (!room) continue;

        // Estimate energy income from sources
        const sources = room.find(FIND_SOURCES);
        const sourceIncome = sources.reduce((sum, s) => sum + s.energyCapacity / 300, 0);
        totalEnergyIncome += sourceIncome;

        // Estimate consumption from creeps
        const creeps = room.find(FIND_MY_CREEPS);
        const creepCost = creeps.reduce((sum, c) => {
          return sum + c.body.length * 0.5; // Rough estimate
        }, 0);
        totalEnergyConsumption += creepCost;

        // Track threat
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        maxThreat = Math.max(maxThreat, hostiles.length);
      }

      cluster.metrics.energyIncome = totalEnergyIncome;
      cluster.metrics.energyConsumption = totalEnergyConsumption;
      cluster.metrics.energyBalance = totalEnergyIncome - totalEnergyConsumption;
      cluster.metrics.warIndex = Math.min(100, maxThreat * 20);
      cluster.metrics.economyIndex = Math.min(100, Math.max(0, 50 + cluster.metrics.energyBalance * 5));
      cluster.lastUpdate = Game.time;
    }
  }

  /**
   * Balance terminal resources between rooms in cluster
   */
  private balanceTerminalResources(): void {
    const clusters = this.getClustersMemory();

    for (const cluster of Object.values(clusters)) {
      const terminals: StructureTerminal[] = [];

      for (const roomName of cluster.memberRooms) {
        const room = Game.rooms[roomName];
        if (room?.terminal && !room.terminal.cooldown) {
          terminals.push(room.terminal);
        }
      }

      if (terminals.length < 2) continue;

      // Balance energy between terminals
      this.balanceResource(terminals, RESOURCE_ENERGY, this.config.terminalEnergyTarget);
    }
  }

  /**
   * Balance a specific resource between terminals
   */
  private balanceResource(terminals: StructureTerminal[], resource: ResourceConstant, target: number): void {
    // Find terminals with excess and deficit
    const excess: { terminal: StructureTerminal; amount: number }[] = [];
    const deficit: { terminal: StructureTerminal; amount: number }[] = [];

    for (const terminal of terminals) {
      const current = terminal.store.getUsedCapacity(resource);
      if (current > target + 10000) {
        excess.push({ terminal, amount: current - target });
      } else if (current < target - 10000) {
        deficit.push({ terminal, amount: target - current });
      }
    }

    // Transfer from excess to deficit
    for (const from of excess) {
      for (const to of deficit) {
        if (from.amount <= 0 || to.amount <= 0) continue;

        const transferAmount = Math.min(from.amount, to.amount, 10000);
        const cost = Game.market.calcTransactionCost(transferAmount, from.terminal.room.name, to.terminal.room.name);

        // Check if we have enough energy for transfer cost
        if (from.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < cost) continue;

        const result = from.terminal.send(resource, transferAmount, to.terminal.room.name);
        if (result === OK) {
          from.amount -= transferAmount;
          to.amount -= transferAmount;
          logger.debug(
            `Transferred ${transferAmount} ${resource} from ${from.terminal.room.name} to ${to.terminal.room.name}`,
            { subsystem: "Cluster" }
          );
        }
      }
    }
  }

  /**
   * Update squad states
   */
  private updateSquads(): void {
    const clusters = this.getClustersMemory();

    for (const cluster of Object.values(clusters)) {
      const activeSquads: SquadDefinition[] = [];

      for (const squad of cluster.squads) {
        // Check if squad members are still alive
        const aliveMembers = squad.members.filter(name => Game.creeps[name]);
        squad.members = aliveMembers;

        // Update squad state based on member count
        if (aliveMembers.length === 0) {
          squad.state = "dissolving";
        } else if (squad.state === "dissolving") {
          // Keep dissolving squads until all members are gone
        } else if (aliveMembers.length < 2 && squad.state === "attacking") {
          squad.state = "retreating";
        }

        // Remove dissolved squads
        if (squad.state !== "dissolving" || aliveMembers.length > 0) {
          activeSquads.push(squad);
        }
      }

      cluster.squads = activeSquads;
    }
  }

  /**
   * Create a new squad
   */
  public createSquad(
    clusterId: string,
    type: SquadDefinition["type"],
    targetRooms: string[],
    rallyRoom: string
  ): SquadDefinition | undefined {
    const clusters = this.getClustersMemory();
    const cluster = clusters[clusterId];
    if (!cluster) return undefined;

    const squad: SquadDefinition = {
      id: `squad_${Game.time}_${Math.random().toString(36).substring(7)}`,
      type,
      members: [],
      rallyRoom,
      targetRooms,
      state: "gathering",
      createdAt: Game.time
    };

    cluster.squads.push(squad);
    return squad;
  }

  /**
   * Add a creep to a squad
   */
  public addCreepToSquad(clusterId: string, squadId: string, creepName: string): boolean {
    const clusters = this.getClustersMemory();
    const cluster = clusters[clusterId];
    if (!cluster) return false;

    const squad = cluster.squads.find(s => s.id === squadId);
    if (!squad) return false;

    if (!squad.members.includes(creepName)) {
      squad.members.push(creepName);
    }
    return true;
  }

  /**
   * Get cluster for a room
   */
  public getClusterForRoom(roomName: string): ClusterMemory | undefined {
    const clusterId = this.getRoomClusterId(roomName);
    if (!clusterId) return undefined;
    return this.getClustersMemory()[clusterId];
  }
}

/**
 * Global cluster manager instance
 */
export const clusterManager = new ClusterManager();
