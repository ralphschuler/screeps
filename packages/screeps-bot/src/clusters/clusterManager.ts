/**
 * Cluster Manager - Multi-Room Coordination
 *
 * Coordinates operations across rooms in a cluster:
 * - Terminal resource balancing (RCL 6+)
 * - Pre-terminal resource sharing (RCL 1-5)
 * - Squad formation and coordination
 * - Rally point management
 * - Inter-room logistics
 * - Cluster-wide metrics
 *
 * Addresses Issues: #8, #20, #36
 */

import type { ClusterMemory, SquadDefinition } from "../memory/schemas";
import { ProcessPriority } from "../core/kernel";
import { logger } from "../core/logger";
import { profiler } from "../core/profiler";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { memoryManager } from "../memory/manager";
import {
  createDefenseRequest,
  needsDefenseAssistance,
  type DefenseRequest
} from "../spawning/defenderManager";
import { resourceSharingManager } from "./resourceSharing";

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
@ProcessClass()
export class ClusterManager {
  private config: ClusterConfig;
  private lastRun: Map<string, number> = new Map();

  public constructor(config: Partial<ClusterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run all clusters
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("cluster:manager", "Cluster Manager", {
    priority: ProcessPriority.MEDIUM,
    interval: 10,
    minBucket: 3000,
    cpuBudget: 0.03
  })
  public run(): void {
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
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Cluster ${clusterId} error: ${errorMessage}`, { subsystem: "Cluster" });
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

    // Handle defense requests
    profiler.measureSubsystem(`cluster:${cluster.id}:defense`, () => {
      this.processDefenseRequests(cluster);
    });

    // Balance terminal resources (RCL 6+ rooms)
    profiler.measureSubsystem(`cluster:${cluster.id}:terminals`, () => {
      this.balanceTerminalResources(cluster);
    });

    // Process resource sharing for pre-terminal rooms (RCL 1-5)
    profiler.measureSubsystem(`cluster:${cluster.id}:resourceSharing`, () => {
      resourceSharingManager.processCluster(cluster);
    });

    // Update squads
    profiler.measureSubsystem(`cluster:${cluster.id}:squads`, () => {
      this.updateSquads(cluster);
    });

    // Update cluster role
    profiler.measureSubsystem(`cluster:${cluster.id}:role`, () => {
      this.updateClusterRole(cluster);
    });

    // Update focus room for sequential upgrading
    profiler.measureSubsystem(`cluster:${cluster.id}:focusRoom`, () => {
      this.updateFocusRoom(cluster);
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
   * Update focus room for sequential upgrading strategy.
   * Prioritizes one room to upgrade to RCL 8, then moves to the next room.
   * This stabilizes one room before moving on, ensuring efficient resource use.
   */
  private updateFocusRoom(cluster: ClusterMemory): void {
    // Get all member rooms with their RCL
    const roomsWithRcl: { roomName: string; rcl: number }[] = [];
    
    for (const roomName of cluster.memberRooms) {
      const room = Game.rooms[roomName];
      if (!room || !room.controller?.my) continue;
      
      roomsWithRcl.push({
        roomName,
        rcl: room.controller.level
      });
    }

    if (roomsWithRcl.length === 0) return;

    // Check if current focus room still valid
    if (cluster.focusRoom) {
      const focusRoom = Game.rooms[cluster.focusRoom];
      
      // If focus room reached RCL 8, clear it
      if (focusRoom?.controller?.level === 8) {
        logger.info(
          `Focus room ${cluster.focusRoom} reached RCL 8, selecting next room`,
          { subsystem: "Cluster" }
        );
        cluster.focusRoom = undefined;
      }
      
      // If focus room no longer exists or not in cluster, clear it
      if (!focusRoom || (cluster.focusRoom && !cluster.memberRooms.includes(cluster.focusRoom))) {
        logger.warn(
          `Focus room ${cluster.focusRoom ?? 'unknown'} no longer valid, selecting new focus`,
          { subsystem: "Cluster" }
        );
        cluster.focusRoom = undefined;
      }
    }

    // Select new focus room if needed
    if (!cluster.focusRoom) {
      // Find room with lowest RCL that's not yet 8
      const eligibleRooms = roomsWithRcl.filter(r => r.rcl < 8);
      
      if (eligibleRooms.length === 0) {
        // All rooms are RCL 8, no focus needed
        return;
      }

      // Sort by RCL (lowest first), then by room name for determinism
      eligibleRooms.sort((a, b) => {
        if (a.rcl !== b.rcl) return a.rcl - b.rcl;
        return a.roomName.localeCompare(b.roomName);
      });

      cluster.focusRoom = eligibleRooms[0].roomName;
      logger.info(
        `Selected ${cluster.focusRoom} (RCL ${eligibleRooms[0].rcl}) as focus room for upgrading`,
        { subsystem: "Cluster" }
      );
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
  public addRoomToCluster(clusterId: string, roomName: string, isRemote = false): void {
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

  /**
   * Process defense requests within the cluster
   * Coordinates assistance to rooms that need defense help
   */
  private processDefenseRequests(cluster: ClusterMemory): void {

    // Clean up old/expired requests (older than 500 ticks)
    cluster.defenseRequests = cluster.defenseRequests.filter(req => {
      const age = Game.time - req.createdAt;
      // Remove if too old or if no longer needed
      if (age > 500) {
        logger.debug(`Defense request for ${req.roomName} expired (${age} ticks old)`, { subsystem: "Cluster" });
        return false;
      }
      
      // Check if threat is still present
      const room = Game.rooms[req.roomName];
      if (!room) return false;
      
      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length === 0) {
        logger.info(`Defense request for ${req.roomName} resolved - no more hostiles`, { subsystem: "Cluster" });
        return false;
      }
      
      return true;
    });

    // Check each member room for new defense needs
    for (const roomName of cluster.memberRooms) {
      const room = Game.rooms[roomName];
      if (!room || !room.controller?.my) continue;

      const swarm = memoryManager.getSwarmState(roomName);
      if (!swarm) continue;

      // Check if room needs assistance
      if (needsDefenseAssistance(room, swarm)) {
        // Check if we already have a request for this room
        const existingRequest = cluster.defenseRequests.find(req => req.roomName === roomName);
        if (existingRequest) {
          // Update existing request if needed
          const newRequest: DefenseRequest | null = createDefenseRequest(room, swarm);
          if (newRequest && newRequest.urgency > existingRequest.urgency) {
            existingRequest.urgency = newRequest.urgency;
            existingRequest.guardsNeeded = newRequest.guardsNeeded;
            existingRequest.rangersNeeded = newRequest.rangersNeeded;
            existingRequest.healersNeeded = newRequest.healersNeeded;
            existingRequest.threat = newRequest.threat;
          }
        } else {
          // Create new defense request
          const request: DefenseRequest | null = createDefenseRequest(room, swarm);
          if (request) {
            cluster.defenseRequests.push({
              ...request,
              assignedCreeps: []
            });
          }
        }
      }
    }

    // Assign available defenders to pending requests
    this.assignDefendersToRequests(cluster);
  }

  /**
   * Assign available military creeps to defense requests
   */
  private assignDefendersToRequests(cluster: ClusterMemory): void {
    if (cluster.defenseRequests.length === 0) return;

    // Sort requests by urgency (highest first)
    const sortedRequests = [...cluster.defenseRequests].sort((a, b) => b.urgency - a.urgency);

    // Find available military creeps in cluster rooms
    const availableDefenders: { creep: Creep; room: Room; distance: number; targetRoom: string }[] = [];

    for (const request of sortedRequests) {
      const targetRoom = Game.rooms[request.roomName];
      if (!targetRoom) continue;

      // Find available defenders in cluster
      for (const roomName of cluster.memberRooms) {
        if (roomName === request.roomName) continue; // Don't use defenders from the room under attack
        
        const room = Game.rooms[roomName];
        if (!room) continue;

        const creeps = room.find(FIND_MY_CREEPS);
        for (const creep of creeps) {
          const mem = creep.memory as { role?: string; family?: string; assistTarget?: string };
          
          // Check if creep is a military role and not already assigned
          if (mem.family !== "military") continue;
          if (mem.assistTarget) continue; // Already assigned
          if (request.assignedCreeps.includes(creep.name)) continue;

          // Check if creep matches needed role
          const needsGuards = request.guardsNeeded > 0;
          const needsRangers = request.rangersNeeded > 0;
          const needsHealers = request.healersNeeded > 0;

          const isGuard = mem.role === "guard";
          const isRanger = mem.role === "ranger";
          const isHealer = mem.role === "healer";

          if ((needsGuards && isGuard) || (needsRangers && isRanger) || (needsHealers && isHealer)) {
            // Calculate distance (rough estimate)
            const distance = Game.map.getRoomLinearDistance(roomName, request.roomName);
            
            availableDefenders.push({
              creep,
              room,
              distance,
              targetRoom: request.roomName
            });
          }
        }
      }

      // Assign closest defenders to this request
      availableDefenders.sort((a, b) => a.distance - b.distance);

      const needed = request.guardsNeeded + request.rangersNeeded + request.healersNeeded;
      const toAssign = Math.min(needed, availableDefenders.length);

      for (let i = 0; i < toAssign; i++) {
        const defender = availableDefenders[i];
        if (!defender) continue;

        const creepMem = defender.creep.memory as { assistTarget?: string };
        creepMem.assistTarget = request.roomName;
        request.assignedCreeps.push(defender.creep.name);

        logger.info(
          `Assigned ${defender.creep.name} (${defender.creep.memory.role}) from ${defender.room.name} to assist ${request.roomName} (distance: ${defender.distance})`,
          { subsystem: "Cluster" }
        );

        // Decrement needed count
        if (defender.creep.memory.role === "guard") request.guardsNeeded--;
        if (defender.creep.memory.role === "ranger") request.rangersNeeded--;
        if (defender.creep.memory.role === "healer") request.healersNeeded--;
      }

      // Clear assigned defenders from available pool
      for (let i = availableDefenders.length - 1; i >= 0; i--) {
        if (request.assignedCreeps.includes(availableDefenders[i]!.creep.name)) {
          availableDefenders.splice(i, 1);
        }
      }
    }
  }
}

/**
 * Global cluster manager instance
 */
export const clusterManager = new ClusterManager();
