/**
 * Bot compatibility adapter for CPU budget dashboard visualization.
 *
 * Framework-owned renderer lives in `@ralphschuler/screeps-visuals`; this module
 * only injects bot runtime dependencies.
 */

import { getAdaptiveBudgetInfo } from "@ralphschuler/screeps-stats";
import {
  type BudgetDashboardOptions as FrameworkBudgetDashboardOptions,
  type Kernel as VisualsKernel,
  renderBudgetDashboard as renderFrameworkBudgetDashboard,
  renderCompactBudgetStatus as renderFrameworkCompactBudgetStatus,
  type StatsIntegration
} from "@ralphschuler/screeps-visuals";
import { kernel } from "../core/kernel";

export type BudgetDashboardOptions = Omit<FrameworkBudgetDashboardOptions, "kernel" | "stats">;

const injectedKernel = kernel as unknown as VisualsKernel;
const statsIntegration = { getAdaptiveBudgetInfo } as unknown as StatsIntegration;

export function renderBudgetDashboard(options: BudgetDashboardOptions = {}): number {
  return renderFrameworkBudgetDashboard({
    ...options,
    kernel: injectedKernel,
    stats: statsIntegration
  });
}

export function renderCompactBudgetStatus(roomName?: string): number {
  return renderFrameworkCompactBudgetStatus(roomName, injectedKernel, statsIntegration);
}
