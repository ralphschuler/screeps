/**
 * Room Process Manager
 *
 * Manages room operations as kernel processes, ensuring every room
 * gets processed eventually through the kernel's wrap-around queue system.
 *
 * Each owned room becomes a process with high priority, allowing
 * the kernel to handle CPU budgeting and fair execution scheduling.
 *
 * Design Principles (from ROADMAP.md):
 * - Decentralization: Each room has local control logic
 * - Event-driven logic: Rooms respond to threats and pheromones
 * - Strict tick budget: Eco rooms ≤ 0.1 CPU, War rooms ≤ 0.25 CPU
 */

import { kernel, ProcessPriority } from "./kernel";
import { logger } from "./logger";
import { roomManager } from "./roomNode";

/**
 * Get process priority for a room based on its state
 */
function getRoomProcessPriority(room: Room): ProcessPriority {
  // Rooms under attack get critical priority
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length > 0) {
    return ProcessPriority.CRITICAL;
  }

  // Owned rooms with controller get high priority
  if (room.controller?.my) {
    return ProcessPriority.HIGH;
  }

  // Reserved rooms get medium priority
  if (room.controller?.reservation?.username === "ralphschuler") {
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
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  
  // War mode: higher budget
  // Typical war room usage: 2-6 CPU
  if (hostiles.length > 0) {
    return 0.12; // 12% per room (6 CPU for 50 CPU limit)
  }

  // Eco mode: budget based on RCL
  // Typical eco room usage: 0.5-2 CPU for small rooms, 2-6 CPU for large rooms
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
 * Room Process Manager
 *
 * Manages registration and lifecycle of room processes with the kernel.
 * Each visible room is registered as a high-frequency process that runs
 * every tick (when CPU budget allows).
 *
 * Owned rooms are prioritized higher and can run more frequently even
 * under CPU pressure.
 */
export class RoomProcessManager {
  private registeredRooms = new Set<string>();
  private lastSyncTick = -1;

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
      } else if (existingProcess && 
                 (existingProcess.priority !== newPriority || 
                  Math.abs(existingProcess.cpuBudget - newCpuBudget) > 0.0001)) {
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
   * Register a room as a kernel process
   */
  private registerRoomProcess(room: Room): void {
    const priority = getRoomProcessPriority(room);
    const cpuBudget = getRoomCpuBudget(room);
    const processId = `room:${room.name}`;

    kernel.registerProcess({
      id: processId,
      name: `Room ${room.name}${room.controller?.my ? " (owned)" : ""}`,
      priority,
      frequency: "high", // Rooms run every tick
      interval: 1,
      minBucket: this.getMinBucketForPriority(priority),
      cpuBudget,
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

    logger.debug(`Registered room process: ${room.name} with priority ${priority}`, {
      subsystem: "RoomProcessManager"
    });
  }

  /**
   * Update a room process with new priority and budget
   */
  private updateRoomProcess(room: Room, priority: ProcessPriority, cpuBudget: number): void {
    const processId = `room:${room.name}`;
    
    // Unregister and re-register with new parameters
    kernel.unregisterProcess(processId);
    
    kernel.registerProcess({
      id: processId,
      name: `Room ${room.name}${room.controller?.my ? " (owned)" : ""}`,
      priority,
      frequency: "high",
      interval: 1,
      minBucket: this.getMinBucketForPriority(priority),
      cpuBudget,
      execute: () => {
        const currentRoom = Game.rooms[room.name];
        if (currentRoom) {
          roomManager.runRoom(currentRoom);
        }
      }
    });

    logger.debug(`Updated room process: ${room.name} priority=${priority} budget=${cpuBudget}`, {
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

    logger.debug(`Unregistered room process: ${roomName}`, {
      subsystem: "RoomProcessManager"
    });
  }

  /**
   * Get minimum bucket requirement based on priority
   */
  private getMinBucketForPriority(priority: ProcessPriority): number {
    if (priority >= ProcessPriority.CRITICAL) {
      return 100; // Critical rooms run even at low bucket
    }
    if (priority >= ProcessPriority.HIGH) {
      return 500;
    }
    if (priority >= ProcessPriority.MEDIUM) {
      return 2000;
    }
    return 5000; // Low priority needs healthy bucket
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
    this.lastSyncTick = -1;
  }
}

/**
 * Global room process manager instance
 */
export const roomProcessManager = new RoomProcessManager();
