/**
 * Room Process Manager
 *
 * Manages room operations as kernel processes with distributed execution.
 *
 * Critical rooms (under attack) run every tick.
 * Economic rooms are distributed across multiple ticks using tick modulo/offset
 * for better CPU efficiency at scale.
 *
 * Design Principles (from ROADMAP.md):
 * - Decentralization: Each room has local control logic
 * - Event-driven logic: Rooms respond to threats and pheromones
 * - CPU budgets: Eco rooms 2-4 CPU (4-8%), War rooms ~6 CPU (12%)
 * - Frequency tiers: Critical (every tick), Economic (every 5 ticks distributed)
 */

import { getActualHostileCreeps } from "@ralphschuler/screeps-core";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { getConfig } from "../config";
import { ProcessPriority, kernel } from "./kernel";
import { logger } from "./logger";
import { roomManager } from "./roomNode";

/**
 * Configuration for room distribution strategy
 */
const ROOM_DISTRIBUTION_CONFIG = {
  /** Economic rooms run every N ticks */
  economicRoomModulo: 5,
  /** Reserved/scout rooms run every N ticks */
  reservedRoomModulo: 10,
  /** Remote/visible rooms run every N ticks */
  remoteRoomModulo: 20
};

/**
 * Nuke priority scans are bounded independently from room execution. Room defense
 * still performs its authoritative scan when the room process runs; this cache
 * only prevents the scheduler from repeating the same FIND_NUKES query every tick.
 */
// Normal-bucket scans are bounded independently from room execution. Repeated
// checks in the same tick still use the cache.
const NUKE_PRIORITY_SCAN_INTERVAL = 5;
const NUKE_PRIORITY_SCAN_INTERVAL_LOW_BUCKET = 50;
const nukePriorityScanCache = new Map<string, { checkedAt: number; active: boolean }>();

function hasPersistedNukeThreat(roomName: string): boolean {
  // Read the current Memory reference first. This survives a global reset even
  // when a heap-backed manager cache has not observed the replacement yet.
  const currentSwarm = (Memory.rooms?.[roomName] as unknown as { swarm?: { nukeDetected?: boolean } } | undefined)?.swarm;
  if (currentSwarm?.nukeDetected) return true;

  const swarm = memoryManager.getSwarmState(roomName);
  if (swarm?.nukeDetected) return true;

  const alerts = memoryManager.getEmpire().incomingNukes;
  return (
    Array.isArray(alerts) &&
    alerts.some(
      alert => alert.roomName === roomName && Number.isFinite(alert.impactTick) && alert.impactTick > Game.time
    )
  );
}

function hasNukeThreat(room: Room): boolean {
  if (!room.controller?.my) return false;
  if (hasPersistedNukeThreat(room.name)) return true;

  const cached = nukePriorityScanCache.get(room.name);
  const lowBucket = Game.cpu.bucket < getConfig().cpu.bucketThresholds.lowMode;
  const scanInterval = lowBucket ? NUKE_PRIORITY_SCAN_INTERVAL_LOW_BUCKET : NUKE_PRIORITY_SCAN_INTERVAL;
  if (cached && Game.time - cached.checkedAt < scanInterval) return cached.active;

  const active = room.find(FIND_NUKES).length > 0;
  nukePriorityScanCache.set(room.name, { checkedAt: Game.time, active });
  return active;
}

function getRoomProcessName(room: Room): string {
  const suffix = room.controller?.my ? " (owned)" : "";
  const nukeSuffix = hasNukeThreat(room) ? " [nuke response]" : "";
  return `Room ${room.name}${suffix}${nukeSuffix}`;
}

/**
 * Get process priority for a room based on its state
 */
function getMyUsername(): string {
  const spawns = Game.spawns ?? {};
  const firstSpawn = Object.values(spawns)[0] as StructureSpawn | undefined;
  return firstSpawn?.owner?.username ?? "";
}

/**
 * Get room process priority based on threat and strategic value.
 */
function getRoomProcessPriority(room: Room): ProcessPriority {
  // Incoming nukes remain critical even when no hostile creep is visible.
  if (hasNukeThreat(room)) {
    return ProcessPriority.CRITICAL;
  }

  // Rooms under attack get critical priority
  const hostiles = getActualHostileCreeps(room);
  if (hostiles.length > 0) {
    return ProcessPriority.CRITICAL;
  }

  // Owned rooms with controller get high priority
  if (room.controller?.my) {
    return ProcessPriority.HIGH;
  }

  // Reserved rooms get medium priority
  const myUsername = getMyUsername();
  if (myUsername && room.controller?.reservation?.username === myUsername) {
    return ProcessPriority.MEDIUM;
  }

  // Other visible rooms get low priority
  return ProcessPriority.LOW;
}

/**
 * Get CPU budget for a room based on its state and RCL
 */
function getRoomCpuBudget(room: Room): number {
  if (!room.controller?.my) {
    return 0.02; // 2% for non-owned rooms (1 CPU for 50 CPU limit)
  }

  const rcl = room.controller.level;
  const nukeThreat = hasNukeThreat(room);
  const hostiles = getActualHostileCreeps(room);

  // Nuke response requires the same room budget as active combat, even without
  // visible hostiles. The scheduler still bounds scans using the TTL above.
  // War mode: higher budget
  // Typical war room usage: 2-6 CPU (budget set at upper end for safety)
  if (nukeThreat || hostiles.length > 0) {
    return 0.12; // 12% per room (6 CPU for 50 CPU limit)
  }

  // Eco mode: budget based on RCL
  // Typical eco room usage: 0.5-2 CPU for small rooms, 2-6 CPU for large rooms
  // Budgets are set at the upper end of observed usage to avoid false positives
  // RCL 1-3: Allow up to 2 CPU (4% of 50 CPU limit)
  // RCL 4-6: Allow up to 3 CPU (6% of 50 CPU limit)
  // RCL 7-8: Allow up to 4 CPU (8% of 50 CPU limit)
  if (rcl <= 3) {
    return 0.04; // 4% (2 CPU for 50 CPU limit)
  } else if (rcl <= 6) {
    return 0.06; // 6% (3 CPU for 50 CPU limit)
  } else {
    return 0.08; // 8% (4 CPU for 50 CPU limit)
  }
}

/**
 * Get tick distribution parameters for a room based on its priority
 * Returns { tickModulo, tickOffset } or undefined for non-distributed execution
 */
function getRoomDistribution(
  room: Room,
  priority: ProcessPriority,
  roomIndex: number
): { tickModulo?: number; tickOffset?: number } {
  // CRITICAL priority rooms (under attack) always run every tick - no distribution
  if (priority === ProcessPriority.CRITICAL) {
    return { tickModulo: undefined, tickOffset: undefined };
  }

  // HIGH priority rooms (owned, eco mode) - distribute across 5 ticks
  if (priority === ProcessPriority.HIGH && room.controller?.my) {
    return {
      tickModulo: ROOM_DISTRIBUTION_CONFIG.economicRoomModulo,
      tickOffset: roomIndex % ROOM_DISTRIBUTION_CONFIG.economicRoomModulo
    };
  }

  // MEDIUM priority rooms (reserved) - distribute across 10 ticks
  if (priority === ProcessPriority.MEDIUM) {
    return {
      tickModulo: ROOM_DISTRIBUTION_CONFIG.reservedRoomModulo,
      tickOffset: roomIndex % ROOM_DISTRIBUTION_CONFIG.reservedRoomModulo
    };
  }

  // LOW priority rooms (remote/visible) - distribute across 20 ticks
  if (priority === ProcessPriority.LOW) {
    return {
      tickModulo: ROOM_DISTRIBUTION_CONFIG.remoteRoomModulo,
      tickOffset: roomIndex % ROOM_DISTRIBUTION_CONFIG.remoteRoomModulo
    };
  }

  // Default: no distribution
  return { tickModulo: undefined, tickOffset: undefined };
}

/**
 * Room Process Manager
 *
 * Manages registration and lifecycle of room processes with the kernel.
 * Implements distributed execution to spread room processing across ticks.
 *
 * Distribution Strategy:
 * - Critical rooms (under attack): Every tick
 * - Economic rooms (owned): Every 5 ticks, distributed
 * - Reserved rooms: Every 10 ticks, distributed
 * - Remote/visible rooms: Every 20 ticks, distributed
 */
export class RoomProcessManager {
  private registeredRooms = new Set<string>();
  private lastSyncTick = -1;
  /** Maps room names to their assigned index for distribution */
  private roomIndices = new Map<string, number>();
  /** Counter for assigning room indices */
  private nextRoomIndex = 0;

  /**
   * Get or assign an index for a room (used for tick distribution)
   */
  private getRoomIndex(roomName: string): number {
    let index = this.roomIndices.get(roomName);
    if (index === undefined) {
      index = this.nextRoomIndex++;
      this.roomIndices.set(roomName, index);
    }
    return index;
  }

  /**
   * Synchronize room processes with kernel.
   * Registers new rooms and unregisters rooms that are no longer visible.
   * Should be called once per tick before kernel.run()
   */
  public syncRoomProcesses(): void {
    // Only sync once per tick
    if (this.lastSyncTick === Game.time) {
      return;
    }
    this.lastSyncTick = Game.time;

    const currentRooms = new Set<string>();

    // Register all visible rooms as processes
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      currentRooms.add(roomName);

      // Update priority if room state changed
      const processId = `room:${roomName}`;
      const existingProcess = kernel.getProcess(processId);
      const newPriority = getRoomProcessPriority(room);
      const newCpuBudget = getRoomCpuBudget(room);

      if (!this.registeredRooms.has(roomName)) {
        // Register new room
        this.registerRoomProcess(room);
      } else if (
        existingProcess &&
        (existingProcess.priority !== newPriority || Math.abs(existingProcess.cpuBudget - newCpuBudget) > 0.0001)
      ) {
        // Update priority/budget if changed significantly
        this.updateRoomProcess(room, newPriority, newCpuBudget);
      }
    }

    // Unregister rooms that are no longer visible
    for (const roomName of this.registeredRooms) {
      if (!currentRooms.has(roomName)) {
        this.unregisterRoomProcess(roomName);
      }
    }
  }

  /**
   * Register a room as a kernel process with tick distribution
   */
  private registerRoomProcess(room: Room): void {
    const priority = getRoomProcessPriority(room);
    const cpuBudget = getRoomCpuBudget(room);
    const processId = `room:${room.name}`;
    const roomIndex = this.getRoomIndex(room.name);
    const distribution = getRoomDistribution(room, priority, roomIndex);

    kernel.registerProcess({
      id: processId,
      name: getRoomProcessName(room),
      priority,
      frequency: "high",
      interval: 1,
      tickModulo: distribution.tickModulo,
      tickOffset: distribution.tickOffset,
      minBucket: this.getMinBucketForPriority(priority),
      cpuBudget,
      topology: { group: "room", layer: "room" },
      execute: () => {
        // Check if room is still visible
        const currentRoom = Game.rooms[room.name];
        if (currentRoom) {
          // Delegate to existing room manager for room logic
          roomManager.runRoom(currentRoom);
        }
      }
    });

    this.registeredRooms.add(room.name);

    const distributionInfo = distribution.tickModulo
      ? `(mod=${distribution.tickModulo}, offset=${distribution.tickOffset})`
      : "(every tick)";
    logger.debug(`Registered room process: ${room.name} with priority ${priority} ${distributionInfo}`, {
      subsystem: "RoomProcessManager"
    });
  }

  /**
   * Update a room process with new priority, budget, and distribution
   */
  private updateRoomProcess(room: Room, priority: ProcessPriority, cpuBudget: number): void {
    const processId = `room:${room.name}`;
    const roomIndex = this.getRoomIndex(room.name);
    const distribution = getRoomDistribution(room, priority, roomIndex);

    // Unregister and re-register with new parameters
    kernel.unregisterProcess(processId);

    kernel.registerProcess({
      id: processId,
      name: getRoomProcessName(room),
      priority,
      frequency: "high",
      interval: 1,
      tickModulo: distribution.tickModulo,
      tickOffset: distribution.tickOffset,
      minBucket: this.getMinBucketForPriority(priority),
      cpuBudget,
      topology: { group: "room", layer: "room" },
      execute: () => {
        const currentRoom = Game.rooms[room.name];
        if (currentRoom) {
          roomManager.runRoom(currentRoom);
        }
      }
    });

    const distributionInfo = distribution.tickModulo
      ? `mod=${distribution.tickModulo}, offset=${distribution.tickOffset}`
      : "every tick";
    logger.debug(`Updated room process: ${room.name} priority=${priority} budget=${cpuBudget} (${distributionInfo})`, {
      subsystem: "RoomProcessManager"
    });
  }

  /**
   * Unregister a room from the kernel
   */
  private unregisterRoomProcess(roomName: string): void {
    const processId = `room:${roomName}`;
    kernel.unregisterProcess(processId);
    this.registeredRooms.delete(roomName);
    this.roomIndices.delete(roomName);
    nukePriorityScanCache.delete(roomName);

    logger.debug(`Unregistered room process: ${roomName}`, {
      subsystem: "RoomProcessManager"
    });
  }

  /**
   * Get minimum bucket requirement based on priority.
   *
   * Competitive strategy: keep critical room coordination and owned-room control
   * running, but defer peripheral/strategic room work when bucket drops.
   */
  private getMinBucketForPriority(priority: ProcessPriority): number {
    const { lowMode } = getConfig().cpu.bucketThresholds;

    // Owned-room control and emergency logic should keep running.
    if (priority >= ProcessPriority.HIGH) {
      return 0;
    }

    // Other room work is optional under pressure.
    return lowMode;
  }

  /**
   * Get statistics about registered rooms
   */
  public getStats(): {
    totalRooms: number;
    registeredRooms: number;
    roomsByPriority: Record<string, number>;
    ownedRooms: number;
  } {
    const roomsByPriority: Record<string, number> = {};
    let ownedRooms = 0;

    for (const roomName of this.registeredRooms) {
      const room = Game.rooms[roomName];
      if (room) {
        const priority = getRoomProcessPriority(room);
        const priorityName = ProcessPriority[priority] ?? "UNKNOWN";
        roomsByPriority[priorityName] = (roomsByPriority[priorityName] ?? 0) + 1;

        if (room.controller?.my) {
          ownedRooms++;
        }
      }
    }

    return {
      totalRooms: Object.keys(Game.rooms).length,
      registeredRooms: this.registeredRooms.size,
      roomsByPriority,
      ownedRooms
    };
  }

  /**
   * Force resync of all room processes
   */
  public forceResync(): void {
    this.lastSyncTick = -1;
    this.syncRoomProcesses();
  }

  /**
   * Clear all internal state (for testing)
   */
  public reset(): void {
    this.registeredRooms.clear();
    this.roomIndices.clear();
    this.nextRoomIndex = 0;
    this.lastSyncTick = -1;
    nukePriorityScanCache.clear();
  }
}

/**
 * Global room process manager instance
 */
export const roomProcessManager = new RoomProcessManager();
