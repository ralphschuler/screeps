/**
 * POSIS (Portable Operating System Interface for Screeps)
 *
 * This module provides standard interfaces for building modular, portable
 * Screeps bots following OS principles.
 *
 * Key concepts:
 * - Process-based architecture
 * - Kernel for process management
 * - Inter-process communication via messages and shared memory
 * - Process lifecycle management (init, run, cleanup)
 * - Syscalls for process-kernel interaction
 *
 * References:
 * - https://github.com/screepers/POSIS
 * - https://github.com/screepers/ScreepsOS
 * - ROADMAP.md Section 22: POSIS Operating System Architecture
 */

// Kernel exports
export {
  IPosisKernel,
  IPosisSpawnOptions,
  IPosisProcessSyscalls
} from "./kernel/IPosisKernel";

// Process exports
export {
  IPosisProcess,
  IPosisProcessContext,
  IPosisProcessState,
  IPosisProcessMemory
} from "./process/IPosisProcess";

export { BaseProcess } from "./process/BaseProcess";
