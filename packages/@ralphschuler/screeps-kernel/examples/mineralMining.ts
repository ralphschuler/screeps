/**
 * Example: Mineral Mining Process
 * 
 * This demonstrates the OS-style process architecture for the mineral mining
 * scenario described in the Gist. The process manages:
 * 
 * - Spawning miners only when mineral is available
 * - Continuing courier operations even when mineral is depleted
 * - Automatically stopping when all work is complete
 */

import {
  OSProcess,
  ProcessStatus,
  registerProcessClass,
  addProcess,
  loadProcessTable,
  runOSKernel,
  storeProcessTable
} from '@ralphschuler/screeps-kernel';

/**
 * Process for managing mineral mining at a flag location
 * 
 * This process solves the problem from the Gist:
 * - When mineral.mineralAmount > 0: Spawn miners and couriers
 * - When mineral.mineralAmount === 0: Stop spawning, let couriers finish
 * - When all work is done: Kill the process
 */
class MineralMiningProcess extends OSProcess {

  public run(memory: any): void {
    const flagName = memory.flagName;
    const flag = Game.flags[flagName];
    
    if (!flag) {
      console.log(`Flag ${flagName} not found, stopping process`);
      this.status = ProcessStatus.DEAD;
      return;
    }
    
    const minerals = flag.pos.lookFor(LOOK_MINERALS);
    const mineral = minerals[0];
    
    if (!mineral) {
      console.log(`No mineral at ${flagName}, stopping process`);
      this.status = ProcessStatus.DEAD;
      return;
    }
    
    // Check mineral amount
    const mineralAmount = mineral.mineralAmount;
    
    if (mineralAmount > 0) {
      // Mineral available: spawn miners and couriers
      memory.shouldSpawnMiners = true;
      memory.shouldSpawnCouriers = true;
      
      this.manageMiners(memory, mineral);
      this.manageCouriers(memory, mineral);
    } else {
      // Mineral depleted: stop spawning miners, let couriers finish
      memory.shouldSpawnMiners = false;
      
      // Check if there's still mineral on the ground to ferry
      const droppedResources = flag.pos.lookFor(LOOK_RESOURCES);
      const hasDroppedMineral = droppedResources.some(
        r => r.resourceType === mineral.mineralType
      );
      
      if (hasDroppedMineral) {
        // Keep couriers running to ferry remaining mineral
        memory.shouldSpawnCouriers = true;
        this.manageCouriers(memory, mineral);
      } else {
        // No more work: stop the process
        memory.shouldSpawnCouriers = false;
        
        // Check if all creeps are dead
        const activeCreeps = this.getActiveCreeps(memory);
        if (activeCreeps.length === 0) {
          console.log(`Mining complete at ${flagName}, stopping process`);
          this.status = ProcessStatus.DEAD;
        }
      }
    }
    
    // Update stats
    memory.lastAmount = mineralAmount;
    memory.lastCheck = Game.time;
  }
  
  private manageMiners(memory: any, mineral: Mineral): void {
    if (!memory.shouldSpawnMiners) return;
    
    // Initialize miner list
    memory.miners = memory.miners || [];
    
    // Remove dead creeps
    memory.miners = memory.miners.filter(
      (name: string) => Game.creeps[name]
    );
    
    // Spawn more miners if needed (example: maintain 2 miners)
    const targetMiners = 2;
    if (memory.miners.length < targetMiners) {
      // Request miner spawn (actual spawning logic would be elsewhere)
      memory.requestMinerSpawn = true;
      console.log(`Process ${this.pid}: Requesting miner spawn at ${memory.flagName}`);
    }
  }
  
  private manageCouriers(memory: any, mineral: Mineral): void {
    if (!memory.shouldSpawnCouriers) return;
    
    // Initialize courier list
    memory.couriers = memory.couriers || [];
    
    // Remove dead creeps
    memory.couriers = memory.couriers.filter(
      (name: string) => Game.creeps[name]
    );
    
    // Spawn more couriers if needed
    const targetCouriers = 3;
    if (memory.couriers.length < targetCouriers) {
      memory.requestCourierSpawn = true;
      console.log(`Process ${this.pid}: Requesting courier spawn at ${memory.flagName}`);
    }
  }
  
  private getActiveCreeps(memory: any): Creep[] {
    const miners = (memory.miners || [])
      .map((name: string) => Game.creeps[name])
      .filter(Boolean);
    
    const couriers = (memory.couriers || [])
      .map((name: string) => Game.creeps[name])
      .filter(Boolean);
    
    return [...miners, ...couriers];
  }

  public reloadFromMemory(memory: any): void {
    // No transient state to restore in this example
    // Could restore cached references if needed
  }
}

/**
 * Example main loop integration
 */
export function exampleMainLoop(): void {
  // Load processes from Memory
  loadProcessTable();
  
  // Check for new mining flags and create processes
  for (const flagName in Game.flags) {
    if (flagName.startsWith('mine-')) {
      const flag = Game.flags[flagName];
      
      // Check if we already have a process for this flag
      const existingPid = Memory.miningProcesses?.[flagName];
      if (existingPid !== undefined) {
        continue; // Already have a process
      }
      
      // Check if there's a mineral at this flag
      const minerals = flag.pos.lookFor(LOOK_MINERALS);
      if (minerals.length === 0) {
        console.log(`No mineral at ${flagName}, skipping`);
        continue;
      }
      
      // Create a new mining process
      const process = addProcess(new MineralMiningProcess(-1));
      
      // Initialize process memory
      if (!Memory.processMemory) {
        Memory.processMemory = {};
      }
      
      Memory.processMemory[process.pid] = {
        flagName: flagName,
        miners: [],
        couriers: [],
        shouldSpawnMiners: false,
        shouldSpawnCouriers: false
      };
      
      // Track which process is handling which flag
      if (!Memory.miningProcesses) {
        Memory.miningProcesses = {};
      }
      Memory.miningProcesses[flagName] = process.pid;
      
      console.log(`Started mining process ${process.pid} for ${flagName}`);
    }
  }
  
  // Run all processes
  runOSKernel();
  
  // Store processes to Memory
  storeProcessTable();
}

// Don't forget to register the process class before loading!
registerProcessClass('MineralMiningProcess', MineralMiningProcess);

// Extend Memory interface
declare global {
  interface Memory {
    miningProcesses?: Record<string, number>; // flagName -> PID
  }
}
