/**
 * Memory manager stub for roles package
 */

import type { EmpireMemory } from "./schemas";

// Extend global Memory interface
declare global {
  interface Memory {
    empire?: EmpireMemory;
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
  }
};
