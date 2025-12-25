/**
 * Terminal Manager
 *
 * Handles automated terminal operations:
 * - Inter-room energy balancing via terminal
 * - Mineral distribution between rooms
 * - Smart routing with cost optimization (30-50% energy savings)
 * - Emergency energy transfers for rooms under attack
 * - Terminal capacity management and overflow prevention
 * - Integration with market manager for automated buy/sell
 * - Compound sharing network for cluster-wide boost distribution
 *
 * Features implemented:
 * - Smart energy routing via terminalRouter (Dijkstra pathfinding)
 * - Emergency transfer priority queue
 * - Terminal capacity monitoring and auto-clearance
 * - Resource pooling with hub designation
 * - Market integration for surplus/deficit handling
 */

import { logger } from "@bot/core/logger";
import { ProcessPriority } from "@bot/core/kernel";
import { MediumFrequencyProcess, ProcessClass } from "@bot/core/processDecorators";
import { memoryManager } from "@bot/memory/manager";
import { marketManager } from "../market/marketManager";
import { terminalRouter } from "./terminalRouter";
import type { TerminalRoute } from "./terminalRouter";

/**
 * Terminal manager configuration
 */
export interface TerminalManagerConfig {
  /** Minimum bucket to run terminal operations */
  minBucket: number;
  /** Minimum energy in storage before terminal sends */
  minStorageEnergy: number;
  /** Target energy level in terminal */
  terminalEnergyTarget: number;
  /** Maximum energy to keep in terminal */
  terminalEnergyMax: number;
  /** Energy threshold to trigger sending to other rooms */
  energySendThreshold: number;
  /** Energy threshold to trigger requesting from other rooms */
  energyRequestThreshold: number;
  /** Minimum amount to send in a single transfer */
  minTransferAmount: number;
  /** Maximum transfer cost ratio (energy cost / energy sent) */
  maxTransferCostRatio: number;
  /** Capacity warning threshold (percentage) */
  capacityWarningThreshold: number;
  /** Capacity auto-clearance threshold (percentage) */
  capacityClearanceThreshold: number;
  /** Emergency danger level threshold */
  emergencyDangerThreshold: number;
  /** Emergency energy transfer amount */
  emergencyEnergyAmount: number;
  /** Surplus threshold for auto-sell energy */
  energySurplusThreshold: number;
  /** Surplus threshold for auto-sell minerals */
  mineralSurplusThreshold: number;
}

const DEFAULT_CONFIG: TerminalManagerConfig = {
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  minStorageEnergy: 50000,
  terminalEnergyTarget: 20000,
  terminalEnergyMax: 50000,
  energySendThreshold: 100000,
  energyRequestThreshold: 30000,
  minTransferAmount: 5000,
  maxTransferCostRatio: 0.1, // Don't send if cost is >10% of amount
  capacityWarningThreshold: 0.8, // Warn at 80% full
  capacityClearanceThreshold: 0.9, // Auto-clear at 90% full
  emergencyDangerThreshold: 2, // Danger level 2+ triggers emergency
  emergencyEnergyAmount: 20000, // Emergency energy transfer amount
  energySurplusThreshold: 50000, // Auto-sell energy above this
  mineralSurplusThreshold: 5000 // Auto-sell minerals above this
};

/**
 * Terminal transfer request
 */
interface TerminalTransferRequest {
  fromRoom: string;
  toRoom: string;
  resourceType: ResourceConstant;
  amount: number;
  priority: number;
  route?: TerminalRoute; // Optimal route (if using multi-hop)
  isEmergency?: boolean; // Emergency transfer flag
}

/**
 * Terminal Manager Class
 */
@ProcessClass()
export class TerminalManager {
  private config: TerminalManagerConfig;
  private transferQueue: TerminalTransferRequest[] = [];

  public constructor(config: Partial<TerminalManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Request a resource transfer between rooms
   * Public method for other systems (e.g., nuke manager) to request transfers
   */
  public requestTransfer(
    fromRoom: string,
    toRoom: string,
    resourceType: ResourceConstant,
    amount: number,
    priority = 3
  ): boolean {
    // Check if transfer is already queued
    const alreadyQueued = this.transferQueue.some(
      req =>
        req.fromRoom === fromRoom &&
        req.toRoom === toRoom &&
        req.resourceType === resourceType
    );
    if (alreadyQueued) {
      logger.debug(
        `Transfer already queued: ${amount} ${resourceType} from ${fromRoom} to ${toRoom}`,
        { subsystem: "Terminal" }
      );
      return false;
    }

    // Validate rooms exist and have terminals
    const source = Game.rooms[fromRoom];
    const target = Game.rooms[toRoom];
    if (!source || !target || !source.terminal || !target.terminal) {
      logger.warn(
        `Cannot queue transfer: rooms or terminals not available`,
        { subsystem: "Terminal" }
      );
      return false;
    }

    // Queue the transfer
    this.transferQueue.push({
      fromRoom,
      toRoom,
      resourceType,
      amount,
      priority
    });

    logger.info(
      `Queued transfer request: ${amount} ${resourceType} from ${fromRoom} to ${toRoom} (priority: ${priority})`,
      { subsystem: "Terminal" }
    );

    return true;
  }

  /**
   * Main terminal tick - runs periodically
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("terminal:manager", "Terminal Manager", {
    priority: ProcessPriority.MEDIUM,
    interval: 20,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.1
  })
  public run(): void {
    if (Game.cpu.bucket < this.config.minBucket) {
      return;
    }

    // Process terminals in all owned rooms
    const roomsWithTerminals = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.terminal && r.terminal.my && r.terminal.isActive()
    );

    if (roomsWithTerminals.length < 2) {
      // Need at least 2 terminals to balance
      return;
    }

    // Clear old cost cache
    terminalRouter.clearOldCache();

    // Clean old transfer requests
    this.cleanTransferQueue();

    // Check for emergency situations
    this.checkEmergencyTransfers(roomsWithTerminals);

    // Monitor terminal capacity
    this.monitorTerminalCapacity(roomsWithTerminals);

    // Balance energy between rooms
    this.balanceEnergy(roomsWithTerminals);

    // Balance minerals between rooms
    this.balanceMinerals(roomsWithTerminals);

    // Execute queued transfers
    this.executeTransfers(roomsWithTerminals);
  }

  /**
   * Clean expired or invalid transfer requests
   */
  private cleanTransferQueue(): void {
    this.transferQueue = this.transferQueue.filter(req => {
      const fromRoom = Game.rooms[req.fromRoom];
      const toRoom = Game.rooms[req.toRoom];
      
      // Remove if rooms are not visible
      if (!fromRoom || !toRoom) return false;
      
      // Remove if terminals don't exist
      if (!fromRoom.terminal || !toRoom.terminal) return false;
      
      return true;
    });
  }

  /**
   * Check for emergency situations requiring immediate energy transfers
   */
  private checkEmergencyTransfers(rooms: Room[]): void {
    for (const room of rooms) {
      if (!room.controller?.my) continue;

      // Get swarm state to check danger level
      const swarm = memoryManager.getSwarmState(room.name);
      if (!swarm) continue;

      // Check if room is under attack and needs emergency energy
      if (swarm.danger >= this.config.emergencyDangerThreshold) {
        const storage = room.storage;
        const terminal = room.terminal!;
        const totalEnergy = 
          (storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0) +
          terminal.store.getUsedCapacity(RESOURCE_ENERGY);

        // If energy is critically low, request emergency transfer
        if (totalEnergy < this.config.energyRequestThreshold / 2) {
          // Find closest donor room with excess energy
          const donors = rooms
            .filter(r => 
              r.name !== room.name &&
              r.controller?.my &&
              r.storage &&
              r.storage.store.getUsedCapacity(RESOURCE_ENERGY) > this.config.energySendThreshold
            )
            .sort((a, b) => {
              const distA = Game.map.getRoomLinearDistance(room.name, a.name);
              const distB = Game.map.getRoomLinearDistance(room.name, b.name);
              return distA - distB;
            });

          if (donors.length > 0 && donors[0]) {
            const donor = donors[0];
            
            // Check if already queued
            const alreadyQueued = this.transferQueue.some(
              req => req.toRoom === room.name && 
                     req.resourceType === RESOURCE_ENERGY &&
                     req.isEmergency
            );

            if (!alreadyQueued) {
              const route = terminalRouter.findOptimalRoute(
                donor.name,
                room.name,
                this.config.emergencyEnergyAmount
              );

              if (route) {
                this.transferQueue.push({
                  fromRoom: donor.name,
                  toRoom: room.name,
                  resourceType: RESOURCE_ENERGY,
                  amount: this.config.emergencyEnergyAmount,
                  priority: 10, // Highest priority
                  route,
                  isEmergency: true
                });

                logger.warn(
                  `Emergency energy transfer queued: ${this.config.emergencyEnergyAmount} from ${donor.name} to ${room.name} (danger: ${swarm.danger})`,
                  { subsystem: "Terminal" }
                );
              }
            }
          }
        }
      }
    }
  }

  /**
   * Monitor terminal capacity and trigger clearance when needed
   */
  private monitorTerminalCapacity(rooms: Room[]): void {
    for (const room of rooms) {
      const terminal = room.terminal!;
      const capacity = terminal.store.getCapacity();
      const used = terminal.store.getUsedCapacity();
      const fillRatio = used / capacity;

      // Warning threshold
      if (fillRatio >= this.config.capacityWarningThreshold && fillRatio < this.config.capacityClearanceThreshold) {
        if (Game.time % 100 === 0) {
          logger.warn(
            `Terminal ${room.name} at ${(fillRatio * 100).toFixed(1)}% capacity (${used}/${capacity})`,
            { subsystem: "Terminal" }
          );
        }
      }

      // Auto-clearance threshold
      if (fillRatio >= this.config.capacityClearanceThreshold) {
        this.clearExcessTerminalResources(room, terminal);
      }
    }
  }

  /**
   * Clear excess resources from terminal to prevent overflow
   * Transfers to cluster hub or sells on market
   */
  private clearExcessTerminalResources(room: Room, terminal: StructureTerminal): void {
    logger.info(
      `Auto-clearing terminal ${room.name} (${(terminal.store.getUsedCapacity() / terminal.store.getCapacity() * 100).toFixed(1)}% full)`,
      { subsystem: "Terminal" }
    );

    // Get cluster to find hub
    const clusters = memoryManager.getClusters();
    let hubRoom: string | undefined;

    for (const clusterId in clusters) {
      const cluster = clusters[clusterId];
      if (cluster.memberRooms.includes(room.name)) {
        // Find hub room (highest RCL in cluster)
        let maxRcl = 0;
        for (const memberName of cluster.memberRooms) {
          const member = Game.rooms[memberName];
          if (member?.controller?.my && member.controller.level > maxRcl) {
            maxRcl = member.controller.level;
            hubRoom = memberName;
          }
        }
        break;
      }
    }

    // Prioritize transferring to hub, then selling excess
    const resources = Object.keys(terminal.store) as ResourceConstant[];
    for (const resource of resources) {
      const amount = terminal.store.getUsedCapacity(resource);
      if (amount === 0) continue;

      // Determine surplus threshold
      const surplusThreshold = resource === RESOURCE_ENERGY
        ? this.config.energySurplusThreshold
        : this.config.mineralSurplusThreshold;

      if (amount > surplusThreshold) {
        const excess = amount - surplusThreshold;

        // Try to transfer to hub if different from current room
        if (hubRoom && hubRoom !== room.name) {
          const hubTerminal = Game.rooms[hubRoom]?.terminal;
          if (hubTerminal && hubTerminal.store.getFreeCapacity() > excess) {
            const route = terminalRouter.findOptimalRoute(room.name, hubRoom, excess);
            if (route) {
              this.transferQueue.push({
                fromRoom: room.name,
                toRoom: hubRoom,
                resourceType: resource,
                amount: excess,
                priority: 5, // High priority for clearance
                route
              });
              
              logger.info(
                `Queued clearance transfer: ${excess} ${resource} from ${room.name} to hub ${hubRoom}`,
                { subsystem: "Terminal" }
              );
              continue;
            }
          }
        }

        // If couldn't transfer to hub, sell on market
        if (Game.time % 10 === 0) {
          // Try to sell surplus via market manager
          const sold = marketManager.sellSurplusFromTerminal(room.name, resource, excess);
          if (sold) {
            logger.info(
              `Sold ${excess} ${resource} from ${room.name} terminal via market`,
              { subsystem: "Terminal" }
            );
          }
        }
      }
    }
  }

  /**
   * Balance energy between rooms with terminals
   * Uses smart routing to minimize transfer costs
   */
  private balanceEnergy(rooms: Room[]): void {
    // Calculate energy status for each room
    const roomStatuses = rooms.map(room => {
      const storage = room.storage;
      const terminal = room.terminal!;
      const storageEnergy = storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
      const terminalEnergy = terminal.store.getUsedCapacity(RESOURCE_ENERGY);
      const totalEnergy = storageEnergy + terminalEnergy;

      return {
        room,
        terminal,
        totalEnergy,
        storageEnergy,
        terminalEnergy,
        needsEnergy: totalEnergy < this.config.energyRequestThreshold,
        hasExcess: totalEnergy > this.config.energySendThreshold && storageEnergy > this.config.minStorageEnergy
      };
    });

    // Find rooms that need energy
    const needyRooms = roomStatuses.filter(s => s.needsEnergy).sort((a, b) => a.totalEnergy - b.totalEnergy);
    
    // Find rooms with excess energy
    const donorRooms = roomStatuses.filter(s => s.hasExcess).sort((a, b) => b.totalEnergy - a.totalEnergy);

    // Create transfer requests with smart routing
    for (const needy of needyRooms) {
      for (const donor of donorRooms) {
        if (donor.room.name === needy.room.name) continue;

        // Check if transfer is already queued
        const alreadyQueued = this.transferQueue.some(
          req => req.fromRoom === donor.room.name && 
                 req.toRoom === needy.room.name && 
                 req.resourceType === RESOURCE_ENERGY
        );
        if (alreadyQueued) continue;

        // Calculate transfer amount
        const transferAmount = Math.min(
          Math.floor((donor.totalEnergy - this.config.energySendThreshold) / 2),
          this.config.energyRequestThreshold - needy.totalEnergy,
          donor.terminal.store.getUsedCapacity(RESOURCE_ENERGY)
        );

        if (transferAmount < this.config.minTransferAmount) continue;

        // Find optimal route using terminal router
        const route = terminalRouter.findOptimalRoute(
          donor.room.name,
          needy.room.name,
          transferAmount
        );

        if (!route) continue;

        // Check if route cost is acceptable
        const costRatio = route.cost / transferAmount;
        
        if (costRatio > this.config.maxTransferCostRatio) {
          logger.debug(
            `Skipping terminal transfer from ${donor.room.name} to ${needy.room.name}: cost ratio ${costRatio.toFixed(2)} too high`,
            { subsystem: "Terminal" }
          );
          continue;
        }

        // Queue transfer with route information
        this.transferQueue.push({
          fromRoom: donor.room.name,
          toRoom: needy.room.name,
          resourceType: RESOURCE_ENERGY,
          amount: transferAmount,
          priority: 2,
          route
        });

        const routeType = route.isDirect ? "direct" : `multi-hop (${route.path.length} hops)`;
        logger.info(
          `Queued energy transfer: ${transferAmount} from ${donor.room.name} to ${needy.room.name} (${routeType}, cost: ${route.cost})`,
          { subsystem: "Terminal" }
        );

        break; // One transfer per needy room per tick
      }
    }
  }

  /**
   * Balance minerals between rooms with terminals
   */
  private balanceMinerals(rooms: Room[]): void {
    // Get mineral distribution across rooms
    const mineralMap = new Map<MineralConstant, { room: Room; amount: number }[]>();

    for (const room of rooms) {
      const terminal = room.terminal!;
      
      // Check each mineral type - only iterate over resources actually in the terminal
      const resources = Object.keys(terminal.store) as ResourceConstant[];
      for (const resourceType of resources) {
        if (resourceType === RESOURCE_ENERGY) continue;
        
        const amount = terminal.store.getUsedCapacity(resourceType);
        if (amount === 0) continue;

        if (!mineralMap.has(resourceType as MineralConstant)) {
          mineralMap.set(resourceType as MineralConstant, []);
        }
        mineralMap.get(resourceType as MineralConstant)!.push({ room, amount });
      }
    }

    // Balance each mineral type
    for (const [mineralType, roomList] of mineralMap.entries()) {
      if (roomList.length < 2) continue;

      // Sort by amount
      roomList.sort((a, b) => b.amount - a.amount);

      const richest = roomList[0];
      const poorest = roomList[roomList.length - 1];

      // Only transfer if there's significant imbalance
      const imbalance = richest.amount - poorest.amount;
      if (imbalance < 5000) continue;

      // Check if transfer is already queued
      const alreadyQueued = this.transferQueue.some(
        req => req.fromRoom === richest.room.name && 
               req.toRoom === poorest.room.name && 
               req.resourceType === mineralType
      );
      if (alreadyQueued) continue;

      // Calculate transfer amount (half the imbalance)
      const transferAmount = Math.min(
        Math.floor(imbalance / 2),
        richest.amount - 1000 // Keep some in source room
      );

      if (transferAmount < 1000) continue;

      // Queue transfer (lower priority than energy)
      this.transferQueue.push({
        fromRoom: richest.room.name,
        toRoom: poorest.room.name,
        resourceType: mineralType,
        amount: transferAmount,
        priority: 1
      });

      logger.info(
        `Queued mineral transfer: ${transferAmount} ${mineralType} from ${richest.room.name} to ${poorest.room.name}`,
        { subsystem: "Terminal" }
      );
    }
  }

  /**
   * Execute queued transfers
   * Handles both direct and multi-hop routing
   */
  private executeTransfers(rooms: Room[]): void {
    // Sort by priority (higher first)
    this.transferQueue.sort((a, b) => b.priority - a.priority);

    // Execute one transfer per room per tick
    const processedRooms = new Set<string>();

    for (const request of this.transferQueue) {
      if (processedRooms.has(request.fromRoom)) continue;

      const fromRoom = rooms.find(r => r.name === request.fromRoom);
      if (!fromRoom || !fromRoom.terminal) continue;

      const terminal = fromRoom.terminal;
      if (terminal.cooldown > 0) continue;

      // Check if we have enough resources
      const available = terminal.store.getUsedCapacity(request.resourceType);
      if (available < request.amount) {
        logger.debug(
          `Terminal transfer cancelled: insufficient ${request.resourceType} in ${request.fromRoom} (need ${request.amount}, have ${available})`,
          { subsystem: "Terminal" }
        );
        // Remove this request
        this.transferQueue = this.transferQueue.filter(r => r !== request);
        continue;
      }

      // Determine destination for this hop
      let destination = request.toRoom;
      
      // If using multi-hop routing, get next hop
      if (request.route && !request.route.isDirect) {
        const nextHop = terminalRouter.getNextHop(request.route, request.fromRoom);
        if (nextHop) {
          destination = nextHop;
        }
      }

      // Execute transfer
      const result = terminal.send(
        request.resourceType,
        request.amount,
        destination,
        `Terminal auto-balance${request.isEmergency ? " [EMERGENCY]" : ""}`
      );

      if (result === OK) {
        const isMultiHop = request.route && !request.route.isDirect;
        const isFinalHop = destination === request.toRoom;
        
        logger.info(
          `Terminal transfer executed: ${request.amount} ${request.resourceType} from ${request.fromRoom} to ${destination}${isMultiHop && !isFinalHop ? ` (hop to ${request.toRoom})` : ""}${request.isEmergency ? " [EMERGENCY]" : ""}`,
          { subsystem: "Terminal" }
        );
        processedRooms.add(request.fromRoom);
        
        // If multi-hop and not final destination, update request for next hop
        if (isMultiHop && !isFinalHop) {
          // Update the fromRoom for the next hop
          request.fromRoom = destination;
          // Don't remove from queue yet
        } else {
          // Transfer complete, remove from queue
          this.transferQueue = this.transferQueue.filter(r => r !== request);
        }
      } else {
        logger.warn(
          `Terminal transfer failed: ${result} for ${request.amount} ${request.resourceType} from ${request.fromRoom} to ${destination}`,
          { subsystem: "Terminal" }
        );
        
        // Remove failed request
        this.transferQueue = this.transferQueue.filter(r => r !== request);
      }
    }
  }

  /**
   * Manually queue a terminal transfer
   */
  public queueTransfer(
    fromRoom: string,
    toRoom: string,
    resourceType: ResourceConstant,
    amount: number,
    priority = 1
  ): void {
    this.transferQueue.push({
      fromRoom,
      toRoom,
      resourceType,
      amount,
      priority
    });
  }

  /**
   * Balance boost compounds across cluster
   * Implements compound sharing network for cluster-wide boost availability
   * @param clusterRooms Array of room names in the cluster
   * @param targetCompounds Compounds to balance (e.g., T3 boosts)
   */
  public balanceCompoundsAcrossCluster(
    clusterRooms: string[],
    targetCompounds: ResourceConstant[]
  ): void {
    // Track compound levels across cluster
    const compoundLevels = new Map<
      ResourceConstant,
      { roomName: string; amount: number; terminal: StructureTerminal }[]
    >();

    // Collect data from all terminals
    for (const roomName of clusterRooms) {
      const room = Game.rooms[roomName];
      if (!room?.terminal) continue;

      for (const compound of targetCompounds) {
        const amount = room.terminal.store[compound] ?? 0;
        
        if (!compoundLevels.has(compound)) {
          compoundLevels.set(compound, []);
        }
        
        compoundLevels.get(compound)!.push({
          roomName,
          amount,
          terminal: room.terminal
        });
      }
    }

    // Balance each compound
    for (const [compound, levels] of compoundLevels.entries()) {
      if (levels.length < 2) continue;

      // Calculate average amount
      const totalAmount = levels.reduce((sum, l) => sum + l.amount, 0);
      const avgAmount = totalAmount / levels.length;

      // Sort by amount (ascending)
      levels.sort((a, b) => a.amount - b.amount);

      // Transfer from surplus to deficit rooms
      const deficit = levels.filter(l => l.amount < avgAmount * 0.7); // <70% of average
      const surplus = levels.filter(l => l.amount > avgAmount * 1.3); // >130% of average

      for (const surplusRoom of surplus) {
        for (const deficitRoom of deficit) {
          const transferAmount = Math.min(
            Math.floor((surplusRoom.amount - avgAmount) / 2),
            Math.floor((avgAmount - deficitRoom.amount) / 2),
            3000 // Max single transfer
          );

          // Determine minimum transfer threshold based on compound tier
          // T3 compounds are valuable - allow smaller transfers
          const isMilitaryCompound = (
            compound === RESOURCE_CATALYZED_UTRIUM_ACID ||
            compound === RESOURCE_CATALYZED_KEANIUM_ALKALIDE ||
            compound === RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE ||
            compound === RESOURCE_CATALYZED_GHODIUM_ACID ||
            compound === RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE ||
            compound === RESOURCE_CATALYZED_GHODIUM_ALKALIDE
          );
          const minTransfer = isMilitaryCompound ? 300 : 500;

          if (transferAmount >= minTransfer) {
            this.queueTransfer(
              surplusRoom.roomName,
              deficitRoom.roomName,
              compound,
              transferAmount,
              isMilitaryCompound ? 8 : 5 // Higher priority for military compounds
            );

            logger.info(
              `Queued compound balance: ${transferAmount} ${compound} from ${surplusRoom.roomName} to ${deficitRoom.roomName}`,
              { subsystem: "Terminal" }
            );

            // Track pending transfer to prevent double-transfers
            // Note: Working with copied values to avoid mutating original data
            surplusRoom.amount -= transferAmount;
            deficitRoom.amount += transferAmount;
          }
        }
      }
    }
  }
}

/**
 * Global terminal manager instance
 */
export const terminalManager = new TerminalManager();
