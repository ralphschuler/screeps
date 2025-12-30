/**
 * Example: Task Priority Management
 * 
 * This demonstrates the task priority scenario from the Gist:
 * - Normal mode: Run reactions first, then invasion with leftover CPU
 * - War mode: Run invasion first, then reactions with leftover CPU
 * 
 * This shows how to dynamically change execution order based on priorities
 * stored in process memory.
 */

import {
  OSProcess,
  ProcessStatus,
  registerProcessClass,
  addProcess,
  loadProcessTable,
  runOSKernel,
  storeProcessTable,
  getProcessById
} from '@ralphschuler/screeps-kernel';

/**
 * Process for running lab reactions
 * 
 * Expensive CPU operation that runs when there's sufficient CPU budget
 */
class LabReactionsProcess extends OSProcess {

  public run(memory: any): void {
    // Check if we should run based on CPU and priority
    const cpuUsed = Game.cpu.getUsed();
    const cpuLimit = Game.cpu.limit;
    
    // Get priority from memory (higher = run first)
    const priority = memory.priority || 50;
    
    // In war mode, reactions have lower priority
    if (priority < 75 && cpuUsed > cpuLimit * 0.5) {
      console.log(`Reactions: Skipping due to low priority (${priority}) and high CPU`);
      return;
    }
    
    console.log(`Reactions: Running (priority: ${priority})`);
    
    // Simulate expensive reactions
    // In a real implementation, this would run lab logic
    this.runReactions(memory);
    
    memory.lastRun = Game.time;
  }
  
  private runReactions(memory: any): void {
    // Example: Process labs in main room
    const room = Game.rooms[memory.roomName];
    if (!room) return;
    
    const labs = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LAB
    }) as StructureLab[];
    
    console.log(`Processing ${labs.length} labs`);
    
    // Reaction logic would go here
    // This is a CPU-intensive operation
    memory.labsProcessed = labs.length;
  }

  public reloadFromMemory(memory: any): void {
    // Restore any cached state
  }
}

/**
 * Process for invasion/raiding operations
 * 
 * Can be high priority (war mode) or low priority (normal mode)
 */
class InvasionProcess extends OSProcess {

  public run(memory: any): void {
    const cpuUsed = Game.cpu.getUsed();
    const cpuLimit = Game.cpu.limit;
    
    // Get priority from memory
    const priority = memory.priority || 50;
    
    // In normal mode, invasion has lower priority
    if (priority < 75 && cpuUsed > cpuLimit * 0.5) {
      console.log(`Invasion: Skipping due to low priority (${priority}) and high CPU`);
      return;
    }
    
    console.log(`Invasion: Running (priority: ${priority})`);
    
    // Run invasion logic
    this.runInvasion(memory);
    
    memory.lastRun = Game.time;
  }
  
  private runInvasion(memory: any): void {
    const targetRoom = memory.targetRoom;
    console.log(`RAWR! Invading ${targetRoom}`);
    
    // Invasion logic would go here
    // This could be expensive depending on combat complexity
    memory.invasionActive = true;
  }

  public reloadFromMemory(memory: any): void {
    // Restore state
  }
}

/**
 * Example: Switch between normal and war mode
 */
export function examplePrioritySwitch(): void {
  loadProcessTable();
  
  // Get or create processes
  let labsPid = Memory.taskPriorities?.labsPid;
  let invasionPid = Memory.taskPriorities?.invasionPid;
  
  if (labsPid === undefined) {
    const labs = addProcess(new LabReactionsProcess(-1));
    labsPid = labs.pid;
    
    Memory.processMemory![labsPid] = {
      roomName: 'W1N1',
      priority: 100, // High priority by default
      lastRun: 0
    };
  }
  
  if (invasionPid === undefined) {
    const invasion = addProcess(new InvasionProcess(-1));
    invasionPid = invasion.pid;
    
    Memory.processMemory![invasionPid] = {
      targetRoom: 'W2N2',
      priority: 25, // Low priority by default
      lastRun: 0
    };
  }
  
  // Store PIDs
  if (!Memory.taskPriorities) {
    Memory.taskPriorities = {};
  }
  Memory.taskPriorities.labsPid = labsPid;
  Memory.taskPriorities.invasionPid = invasionPid;
  
  // Check for war mode (e.g., set via console: Memory.warMode = true)
  const warMode = Memory.warMode || false;
  
  if (warMode) {
    console.log('WAR MODE ACTIVE: Prioritizing invasion');
    
    // Swap priorities: invasion first, reactions second
    Memory.processMemory![invasionPid].priority = 100;
    Memory.processMemory![labsPid].priority = 25;
  } else {
    console.log('NORMAL MODE: Prioritizing reactions');
    
    // Normal priorities: reactions first, invasion second
    Memory.processMemory![labsPid].priority = 100;
    Memory.processMemory![invasionPid].priority = 25;
  }
  
  // Run processes (they'll execute based on priority and CPU)
  runOSKernel();
  
  storeProcessTable();
}

/**
 * Alternative: Custom execution order based on priority
 * 
 * This shows how you could implement custom priority-based execution
 * by sorting processes before running them.
 */
export function exampleCustomPriorityExecution(): void {
  loadProcessTable();
  
  // Get all processes and their memory
  const processes: Array<{ process: OSProcess; memory: any }> = [];
  
  // This would require access to the internal process table
  // For demonstration, we'll use a simplified approach
  
  // In a real implementation, you might:
  // 1. Store process PIDs in a priority queue in Memory
  // 2. Execute processes in priority order
  // 3. Stop when CPU budget is exhausted
  
  runOSKernel();
  storeProcessTable();
}

// Register process classes
registerProcessClass('LabReactionsProcess', LabReactionsProcess);
registerProcessClass('InvasionProcess', InvasionProcess);

// Extend Memory interface
declare global {
  interface Memory {
    warMode?: boolean;
    taskPriorities?: {
      labsPid?: number;
      invasionPid?: number;
    };
  }
}
