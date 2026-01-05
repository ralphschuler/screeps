/**
 * Creep Metrics Utilities
 * 
 * Helper functions for initializing and updating role-specific efficiency metrics.
 * These metrics track creep performance for analysis and optimization.
 */

import type { CreepMetrics } from "./statsTypes";

// Type for creep memory with metrics support
interface CreepMemoryWithMetrics {
  _metrics?: CreepMetrics;
}

/**
 * Initialize metrics for a creep if not already present.
 * Called when a creep is first spawned or when metrics are enabled.
 */
export function initializeMetrics(creepMemory: CreepMemoryWithMetrics): void {
  if (!creepMemory._metrics) {
    creepMemory._metrics = {
      tasksCompleted: 0,
      energyTransferred: 0,
      energyHarvested: 0,
      buildProgress: 0,
      repairProgress: 0,
      upgradeProgress: 0,
      damageDealt: 0,
      healingDone: 0
    };
  }
}

/**
 * Get metrics for a creep, initializing if necessary.
 */
export function getMetrics(creepMemory: CreepMemoryWithMetrics): CreepMetrics {
  initializeMetrics(creepMemory);
  return creepMemory._metrics!;
}

/**
 * Record energy harvested from a source.
 */
export function recordHarvest(creepMemory: CreepMemoryWithMetrics, amount: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.energyHarvested += amount;
}

/**
 * Record energy or resources transferred to a structure or creep.
 */
export function recordTransfer(creepMemory: CreepMemoryWithMetrics, amount: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.energyTransferred += amount;
}

/**
 * Record build progress contributed to a construction site.
 */
export function recordBuild(creepMemory: CreepMemoryWithMetrics, progress: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.buildProgress += progress;
}

/**
 * Record repair progress contributed to a structure.
 */
export function recordRepair(creepMemory: CreepMemoryWithMetrics, progress: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.repairProgress += progress;
}

/**
 * Record upgrade progress contributed to a controller.
 */
export function recordUpgrade(creepMemory: CreepMemoryWithMetrics, progress: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.upgradeProgress += progress;
}

/**
 * Record damage dealt to an enemy creep or structure.
 */
export function recordDamage(creepMemory: CreepMemoryWithMetrics, damage: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.damageDealt += damage;
}

/**
 * Record healing done to a friendly creep.
 */
export function recordHealing(creepMemory: CreepMemoryWithMetrics, healing: number): void {
  const metrics = getMetrics(creepMemory);
  metrics.healingDone += healing;
}

/**
 * Record a completed task (build finished, upgrade complete, etc.)
 */
export function recordTaskComplete(creepMemory: CreepMemoryWithMetrics): void {
  const metrics = getMetrics(creepMemory);
  metrics.tasksCompleted += 1;
}

/**
 * Get efficiency summary for a creep.
 * Returns human-readable statistics about the creep's performance.
 */
export function getEfficiencySummary(creepMemory: CreepMemoryWithMetrics): string {
  if (!creepMemory._metrics) {
    return "No metrics available";
  }
  
  const m = creepMemory._metrics;
  const parts: string[] = [];
  
  if (m.tasksCompleted > 0) parts.push(`${m.tasksCompleted} tasks`);
  if (m.energyHarvested > 0) parts.push(`${m.energyHarvested} harvested`);
  if (m.energyTransferred > 0) parts.push(`${m.energyTransferred} transferred`);
  if (m.buildProgress > 0) parts.push(`${m.buildProgress} built`);
  if (m.repairProgress > 0) parts.push(`${m.repairProgress} repaired`);
  if (m.upgradeProgress > 0) parts.push(`${m.upgradeProgress} upgraded`);
  if (m.damageDealt > 0) parts.push(`${m.damageDealt} damage`);
  if (m.healingDone > 0) parts.push(`${m.healingDone} healing`);
  
  return parts.length > 0 ? parts.join(", ") : "No activity";
}

/**
 * Reset metrics for a creep (useful for testing or manual resets).
 */
export function resetMetrics(creepMemory: CreepMemoryWithMetrics): void {
  creepMemory._metrics = {
    tasksCompleted: 0,
    energyTransferred: 0,
    energyHarvested: 0,
    buildProgress: 0,
    repairProgress: 0,
    upgradeProgress: 0,
    damageDealt: 0,
    healingDone: 0
  };
}
