/**
 * OS-Style Kernel
 * 
 * Based on "Writing an OS for Screeps" guide
 * https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85
 * 
 * The kernel manages process lifecycle:
 * - Adding and removing processes
 * - Process ID generation
 * - Process table storage and loading from Memory
 * - Running all active processes each tick
 * - Managing process memory
 */

import { OSProcess, ProcessStatus, SerializedProcess } from "./osProcess";
import { logger } from "./logger";

/**
 * Process registry for className -> constructor mapping
 * 
 * Users must register their process classes here before the kernel
 * can instantiate them from Memory.
 */
const processRegistry = new Map<string, new (pid: number, parentPID: number) => OSProcess>();

/**
 * Register a process class for instantiation by className
 * 
 * @param className - Name of the class
 * @param constructor - Constructor function
 */
export function registerProcessClass(
  className: string,
  constructor: new (pid: number, parentPID: number) => OSProcess
): void {
  processRegistry.set(className, constructor);
  logger.debug(`OS Kernel: Registered process class "${className}"`, { subsystem: "OSKernel" });
}

/**
 * Get a process constructor by className
 * 
 * @param className - Name of the class
 * @returns Constructor function or undefined
 */
export function getProcessClass(
  className: string
): (new (pid: number, parentPID: number) => OSProcess) | undefined {
  return processRegistry.get(className);
}

/**
 * Process table: maps PID to process instance
 */
let processTable: Map<number, OSProcess> = new Map();

/**
 * Process queue: list of processes to run this tick
 */
let processQueue: OSProcess[] = [];

/**
 * Reboot the kernel (clear all runtime state)
 */
function reboot(): void {
  processTable = new Map();
  processQueue = [];
}

/**
 * Get a free PID
 * 
 * Finds the lowest available PID by scanning existing PIDs.
 * Returns 0 if no processes exist, otherwise returns the first gap.
 */
function getFreePid(): number {
  const currentPids = Array.from(processTable.keys()).sort((a, b) => a - b);
  
  let counter = 0;
  for (const pid of currentPids) {
    if (pid !== counter) {
      return counter;
    }
    counter++;
  }
  
  return currentPids.length;
}

/**
 * Add a process to the kernel
 * 
 * Assigns a new PID to the process and adds it to the process table.
 * The process will start running in the next tick (not immediately).
 * 
 * @param process - Process instance to add
 * @returns The process (with PID assigned)
 */
export function addProcess<T extends OSProcess>(process: T): T {
  const pid = getFreePid();
  
  // Assign PID via object property mutation
  // This is safe because pid is readonly only for external callers
  (process as any).pid = pid;
  
  processTable.set(pid, process);
  
  logger.debug(
    `OS Kernel: Added process "${process.className}" (PID: ${pid}, Parent: ${process.parentPID})`,
    { subsystem: "OSKernel" }
  );
  
  return process;
}

/**
 * Kill a process by PID
 * 
 * Marks the process as DEAD and clears its memory.
 * The process will be removed from Memory in storeProcessTable().
 * 
 * TODO: Kill child processes when parent is killed
 * 
 * @param pid - Process ID to kill
 * @returns The PID that was killed
 */
export function killProcess(pid: number): number {
  const process = processTable.get(pid);
  
  if (process) {
    process.status = ProcessStatus.DEAD;
    
    // Clear process memory
    if (Memory.processMemory) {
      Memory.processMemory[pid] = undefined;
    }
    
    logger.debug(`OS Kernel: Killed process PID ${pid} ("${process.className}")`, {
      subsystem: "OSKernel"
    });
    
    // TODO: Implement killing child processes
    // Find all processes with parentPID === pid and kill them recursively
  }
  
  return pid;
}

/**
 * Get a process by PID
 * 
 * @param pid - Process ID
 * @returns Process instance or undefined
 */
export function getProcessById(pid: number): OSProcess | undefined {
  return processTable.get(pid);
}

/**
 * Get process memory for a process
 * 
 * Ensures the processMemory structure exists and returns
 * the memory object for the given process.
 * 
 * @param process - Process instance
 * @returns Process-specific memory object
 */
function getProcessMemory(process: OSProcess): any {
  if (!Memory.processMemory) {
    Memory.processMemory = {};
  }
  
  const pid = process.pid;
  if (!Memory.processMemory[pid]) {
    Memory.processMemory[pid] = {};
  }
  
  return Memory.processMemory[pid];
}

/**
 * Store the process table to Memory
 * 
 * Serializes all alive processes as (pid, parentPID, className) tuples.
 * Dead processes are filtered out.
 */
export function storeProcessTable(): void {
  const aliveProcesses = Array.from(processTable.values()).filter(
    (p) => p.status !== ProcessStatus.DEAD
  );
  
  const serialized: SerializedProcess[] = aliveProcesses.map((p) => ({
    pid: p.pid,
    parentPID: p.parentPID,
    className: p.className
  }));
  
  Memory.processTable = serialized;
  
  logger.debug(`OS Kernel: Stored ${serialized.length} processes to Memory`, {
    subsystem: "OSKernel"
  });
}

/**
 * Load the process table from Memory
 * 
 * Recreates process instances from serialized data.
 * Process classes must be registered via registerProcessClass() before loading.
 */
export function loadProcessTable(): void {
  reboot();
  
  const storedTable = Memory.processTable as SerializedProcess[] | undefined;
  
  if (!storedTable || storedTable.length === 0) {
    logger.debug("OS Kernel: No processes in Memory to load", { subsystem: "OSKernel" });
    return;
  }
  
  for (const item of storedTable) {
    const { pid, parentPID, className } = item;
    
    try {
      const ProcessClass = getProcessClass(className);
      
      if (!ProcessClass) {
        logger.error(
          `OS Kernel: Cannot load process PID ${pid} - class "${className}" not registered`,
          { subsystem: "OSKernel" }
        );
        continue;
      }
      
      const process = new ProcessClass(pid, parentPID);
      process.reloadFromMemory(getProcessMemory(process));
      
      processTable.set(process.pid, process);
      processQueue.push(process);
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error(`OS Kernel: Error loading process PID ${pid}: ${errorMsg}`, {
        subsystem: "OSKernel"
      });
      logger.error(`OS Kernel: Failed className: ${className}`, { subsystem: "OSKernel" });
    }
  }
  
  logger.info(`OS Kernel: Loaded ${processTable.size} processes from Memory`, {
    subsystem: "OSKernel"
  });
}

/**
 * Run all processes in the process queue
 * 
 * Executes each process's run() method with its memory object.
 * Errors are caught and logged but don't stop other processes.
 */
export function run(): void {
  while (processQueue.length > 0) {
    const process = processQueue.pop();
    
    if (!process) continue;
    
    try {
      if (process.status !== ProcessStatus.DEAD) {
        process.run(getProcessMemory(process));
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.error(`OS Kernel: Failed to run process PID ${process.pid}: ${errorMsg}`, {
        subsystem: "OSKernel"
      });
    }
  }
}

/**
 * Get all registered process classes
 * 
 * @returns Array of class names
 */
export function getRegisteredProcessClasses(): string[] {
  return Array.from(processRegistry.keys());
}

/**
 * Get process table statistics
 * 
 * @returns Statistics about current processes
 */
export function getProcessStats(): {
  totalProcesses: number;
  aliveProcesses: number;
  deadProcesses: number;
  processesByClass: Record<string, number>;
} {
  const processes = Array.from(processTable.values());
  const alive = processes.filter((p) => p.status !== ProcessStatus.DEAD);
  const dead = processes.filter((p) => p.status === ProcessStatus.DEAD);
  
  const byClass: Record<string, number> = {};
  for (const process of alive) {
    byClass[process.className] = (byClass[process.className] || 0) + 1;
  }
  
  return {
    totalProcesses: processes.length,
    aliveProcesses: alive.length,
    deadProcesses: dead.length,
    processesByClass: byClass
  };
}

/**
 * Reset the kernel (for testing)
 * 
 * Clears all processes and queues. Useful for test isolation.
 */
export function resetOSKernel(): void {
  reboot();
  logger.debug("OS Kernel: Reset complete", { subsystem: "OSKernel" });
}

// Declare global Memory interface extensions
declare global {
  interface Memory {
    /** Process table (serialized) */
    processTable?: SerializedProcess[];
    /** Process memory (per-process namespace) */
    processMemory?: Record<number, any>;
  }
}
