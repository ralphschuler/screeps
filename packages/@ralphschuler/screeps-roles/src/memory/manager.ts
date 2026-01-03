/**
 * Memory manager stub for roles package
 */

import type { EmpireMemory, SwarmState } from "./schemas";

// Extend global Memory interface
declare global {
  interface Memory {
    empire?: EmpireMemory;
    swarmRooms?: Record<string, SwarmState>;
  }
}

export const memoryManager = {
  getCreepMemory: (creepName: string) => Game.creeps[creepName]?.memory,
  setCreepMemory: (creepName: string, memory: any) => {
    if (Game.creeps[creepName]) {
      Game.creeps[creepName].memory = memory;
    }
  },
  getEmpire: (): EmpireMemory => {
    if (!Memory.empire) {
      Memory.empire = {};
    }
    return Memory.empire as EmpireMemory;
  },
  getOrInitSwarmState: (roomName: string): SwarmState => {
    if (!Memory.swarmRooms) {
      Memory.swarmRooms = {};
    }
    if (!Memory.swarmRooms[roomName]) {
      Memory.swarmRooms[roomName] = {};
    }
    return Memory.swarmRooms[roomName];
  },
  getSwarmState: (roomName: string): SwarmState | undefined => {
    return Memory.swarmRooms?.[roomName];
  }
};
