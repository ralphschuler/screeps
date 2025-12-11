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
 * - ROADMAP.md Section 3: Architektur-Ebenen
 */

export * from "./IPosisKernel";
export * from "./IPosisProcess";
export * from "./PosisKernelAdapter";
export * from "./BaseProcess";
