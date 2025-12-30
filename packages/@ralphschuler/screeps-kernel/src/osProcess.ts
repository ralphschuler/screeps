/**
 * OS-Style Process Architecture
 * 
 * Based on "Writing an OS for Screeps" guide
 * https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85
 * 
 * This implements a memory-serialized process architecture where:
 * - Processes are stored in Memory and recreated each tick
 * - Each process has a unique PID and optional parent PID
 * - Processes are instantiated by className
 * - Processes have their own memory namespace
 */

/**
 * Process status enumeration
 */
export enum ProcessStatus {
  /** Process is running normally */
  RUNNING = "running",
  /** Process has been killed and should be removed */
  DEAD = "dead",
  /** Process is suspended (not yet implemented in basic version) */
  SUSPENDED = "suspended"
}

/**
 * Serialized process representation stored in Memory
 */
export interface SerializedProcess {
  /** Process ID */
  pid: number;
  /** Parent process ID (or -1 for root processes) */
  parentPID: number;
  /** Class name for instantiation */
  className: string;
}

/**
 * Base abstract class for OS-style processes
 * 
 * All processes must extend this class and implement:
 * - run(memory): Execute the process logic with access to its memory
 * - reloadFromMemory(memory): Restore process state from memory
 */
export abstract class OSProcess {
  /** Process ID (set during addProcess, readonly after) */
  public pid: number = -1;
  
  /** Parent process ID (readonly after construction) */
  public readonly parentPID: number;
  
  /** Process status */
  public status: ProcessStatus = ProcessStatus.RUNNING;
  
  /** Class name for serialization */
  public readonly className: string;

  /**
   * Construct a new OS process
   * 
   * @param parentPID - Parent process ID (or -1 for root processes)
   */
  constructor(parentPID: number) {
    this.parentPID = parentPID;
    this.className = this.constructor.name;
  }

  /**
   * Execute the process for this tick
   * 
   * @param memory - Process-specific memory object (mutable)
   */
  public abstract run(memory: any): void;

  /**
   * Reload process state from memory
   * 
   * Called after process is recreated from Memory each tick.
   * Use this to restore any transient state needed for execution.
   * 
   * @param memory - Process-specific memory object
   */
  public abstract reloadFromMemory(memory: any): void;
}
