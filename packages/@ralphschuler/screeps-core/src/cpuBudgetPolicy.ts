import type { CpuBudgetConfig, SubsystemType } from "./cpuBudgetManager";

/**
 * Default budget policy from ROADMAP.md Section 2.
 *
 * These values encode the bot's strict tick-budget targets without coupling the
 * budget manager to any specific room or process implementation.
 */
export const DEFAULT_CPU_BUDGET_CONFIG: CpuBudgetConfig = {
  ecoRoomLimit: 0.1,
  warRoomLimit: 0.25,
  overmindLimit: 1.0,
  strictMode: false
};

/** Default budget for uncategorized subsystems that still need guardrails. */
const OTHER_SUBSYSTEM_LIMIT = 0.5;

/** Resolve the configured CPU ceiling for a subsystem category. */
export function getBudgetLimit(config: CpuBudgetConfig, type: SubsystemType): number {
  switch (type) {
    case "ecoRoom":
      return config.ecoRoomLimit;
    case "warRoom":
      return config.warRoomLimit;
    case "overmind":
      return config.overmindLimit;
    default:
      return OTHER_SUBSYSTEM_LIMIT;
  }
}

/** Format how far an observed CPU measurement exceeded its ceiling. */
export function formatBudgetOverage(cpuUsed: number, limit: number): string {
  return (((cpuUsed - limit) / limit) * 100).toFixed(1);
}

/** Merge partial runtime config updates while preserving omitted fields. */
export function mergeBudgetConfig(
  currentConfig: CpuBudgetConfig,
  updates: Partial<CpuBudgetConfig>
): CpuBudgetConfig {
  return { ...currentConfig, ...updates };
}

/** Convert mutable violation counters into the stable public summary shape. */
export function toViolationSummary(
  budgetViolations: Map<string, number>
): { subsystem: string; violations: number }[] {
  return Array.from(budgetViolations.entries())
    .map(([subsystem, violations]) => ({ subsystem, violations }))
    .sort((a, b) => b.violations - a.violations);
}
