/**
 * Memory manager stub for roles package
 */

export const memoryManager = {
  getCreepMemory: (creepName: string) => Game.creeps[creepName]?.memory,
  setCreepMemory: (creepName: string, memory: any) => {
    if (Game.creeps[creepName]) {
      Game.creeps[creepName].memory = memory;
    }
  }
};
