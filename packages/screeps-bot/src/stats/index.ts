/**
 * Statistics System
 * 
 * Modular statistics collection and export system for Screeps bot.
 * Extracted from monolithic unifiedStats.ts for better maintainability.
 */

// Export all types
export type {
  UnifiedStatsConfig,
  CpuStats,
  KernelBudgetStats,
  ProgressionStats,
  EmpireStats,
  RoomStatsEntry,
  SubsystemStatsEntry,
  RoleStatsEntry,
  NativeCallStats,
  CacheStats,
  ProcessStatsEntry,
  CreepStatsEntry,
  CPUBudgetAlert,
  CPUAnomaly,
  CPUBudgetReport,
  CreepMetrics,
  StatsSnapshot,
  ProfilerMemory
} from "./types";

// Main manager is still in core/unifiedStats for now
// This index file provides a cleaner import path for types
