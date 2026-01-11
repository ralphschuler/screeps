/**
 * Memory Manager - Stub for roles package
 * 
 * Provides basic memory management interface needed by behaviors.
 * The full implementation should be provided by the consuming application.
 */

import type { RoomIntel, EmpireMemory, SwarmState } from "./schemas";

/**
 * Simple memory manager stub
 */
class MemoryManager {
  /**
   * Get room intel from memory
   */
  getRoomIntel(roomName: string): RoomIntel | undefined {
    const empire = Memory as unknown as { empire?: EmpireMemory };
    if (!empire.empire?.knownRooms) return undefined;
    return empire.empire.knownRooms[roomName];
  }
  
  /**
   * Set room intel in memory
   */
  setRoomIntel(roomName: string, intel: RoomIntel): void {
    const empire = Memory as unknown as { empire?: EmpireMemory };
    if (!empire.empire) {
      // Create minimal empire memory structure
      empire.empire = {
        knownRooms: {},
        clusters: [],
        warTargets: [],
        ownedRooms: {},
        claimQueue: [],
        nukeCandidates: [],
        powerBanks: [],
        objectives: {
          targetPowerLevel: 0,
          targetRoomCount: 1,
          warMode: false,
          expansionPaused: false
        },
        lastUpdate: Game.time
      };
    }
    if (!empire.empire.knownRooms) {
      empire.empire.knownRooms = {};
    }
    empire.empire.knownRooms[roomName] = intel;
  }
  
  /**
   * Get swarm state for a room
   */
  getSwarmState(roomName: string): SwarmState | undefined {
    const roomMemory = Memory.rooms[roomName] as unknown as { swarm?: SwarmState };
    return roomMemory?.swarm;
  }
  
  /**
   * Get or initialize swarm state for a room
   */
  getOrInitSwarmState(roomName: string): SwarmState {
    const roomMemory = Memory.rooms[roomName] as unknown as { swarm?: SwarmState };
    if (!roomMemory.swarm) {
      roomMemory.swarm = {
        pheromones: {
          needsBuilding: false,
          needsUpgrading: false,
          needsRepairing: false,
          lastUpdated: Game.time,
          logistics: 0,
          defense: 0,
          build: 0,
          upgrade: 0,
          harvest: 0,
          war: 0,
          expand: 0,
          siege: 0
        }
      };
    }
    return roomMemory.swarm;
  }
  
  /**
   * Get empire memory
   */
  getEmpire(): EmpireMemory {
    const empire = Memory as unknown as { empire?: EmpireMemory };
    if (!empire.empire) {
      empire.empire = {
        knownRooms: {},
        clusters: [],
        warTargets: [],
        ownedRooms: {},
        claimQueue: [],
        nukeCandidates: [],
        powerBanks: [],
        objectives: {
          targetPowerLevel: 0,
          targetRoomCount: 1,
          warMode: false,
          expansionPaused: false
        },
        lastUpdate: Game.time
      };
    }
    return empire.empire;
  }
}

export const memoryManager = new MemoryManager();
