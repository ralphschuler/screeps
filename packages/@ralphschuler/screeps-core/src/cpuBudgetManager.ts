import { logger } from "./logger";
import {
  DEFAULT_CPU_BUDGET_CONFIG,
  formatBudgetOverage,
  getBudgetLimit,
  mergeBudgetConfig,
  toViolationSummary
} from "./cpuBudgetPolicy";

/**
 * CPU Budget Manager
 *
 * Tracks and reports CPU budget usage per subsystem. The default limits mirror
 * ROADMAP.md Section 2 tick-budget targets:
 * - Eco rooms: ≤ 0.1 CPU per room
 * - War rooms: ≤ 0.25 CPU per room
 * - Global overmind: ≤ 1 CPU every 20-50 ticks
 *
 * Strict mode only changes logging severity and follow-up warnings; it does not
 * halt the wrapped function. Callers stay responsible for degrading optional
 * work when the bucket is low.
 *
 * Addresses Issue: #5
 */

/** Subsystem categories with ROADMAP CPU budget targets. */
export type SubsystemType = "ecoRoom" | "warRoom" | "overmind" | "other";

/** Runtime-tunable CPU budget configuration. */
export interface CpuBudgetConfig {
  /** CPU limit for eco rooms (per room per tick) */
  ecoRoomLimit: number;
  /** CPU limit for war rooms (per room per tick) */
  warRoomLimit: number;
  /** CPU limit for overmind (total per execution) */
  overmindLimit: number;
  /** Whether to log budget violations as strict errors. */
  strictMode: boolean;
}

/**
 * Small stateful wrapper around the pure CPU budget policy helpers.
 *
 * The class owns mutable runtime config and violation counters. Policy math and
 * summary formatting live in `cpuBudgetPolicy.ts` to keep the manager focused on
 * Screeps side effects: CPU measurement and structured logging.
 */
export class CpuBudgetManager {
  private config: CpuBudgetConfig;
  private budgetViolations: Map<string, number> = new Map();

  public constructor(config: Partial<CpuBudgetConfig> = {}) {
    this.config = mergeBudgetConfig(DEFAULT_CPU_BUDGET_CONFIG, config);
  }

  /**
   * Check whether a subsystem stayed inside its configured CPU budget.
   *
   * Over-budget checks are recorded by subsystem name and emitted through the
   * structured logger so stats/alerts can inspect recurring offenders.
   */
  public checkBudget(subsystem: string, type: SubsystemType, cpuUsed: number): boolean {
    const limit = getBudgetLimit(this.config, type);
    const withinBudget = cpuUsed <= limit;

    if (!withinBudget) {
      this.recordBudgetViolation(subsystem, cpuUsed, limit);
    }

    return withinBudget;
  }

  /**
   * Execute a function and record the CPU it consumed.
   *
   * If the callback throws, the error is logged and `null` is returned before a
   * budget check is recorded. This keeps failures distinct from slow successful
   * work in violation summaries.
   */
  public executeWithBudget<T>(
    subsystem: string,
    type: SubsystemType,
    fn: () => T
  ): T | null {
    const cpuBefore = Game.cpu.getUsed();

    try {
      const result = fn();
      const cpuUsed = Game.cpu.getUsed() - cpuBefore;

      this.checkBudget(subsystem, type, cpuUsed);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Error in ${subsystem}: ${errorMessage}`, { subsystem: "CPUBudget" });
      return null;
    }
  }

  /**
   * Execute room logic under the eco/war room CPU budget category.
   *
   * If room logic throws, the error is logged and no budget violation is
   * recorded for that failed execution.
   */
  public executeRoomWithBudget(
    roomName: string,
    isWarRoom: boolean,
    fn: () => void
  ): void {
    const type: SubsystemType = isWarRoom ? "warRoom" : "ecoRoom";
    const cpuBefore = Game.cpu.getUsed();

    try {
      fn();
      const cpuUsed = Game.cpu.getUsed() - cpuBefore;
      const withinBudget = this.checkBudget(roomName, type, cpuUsed);

      if (!withinBudget && this.config.strictMode) {
        logger.warn(`Strict CPU budget exceeded after ${roomName} completed`, { subsystem: "CPUBudget" });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Error in room ${roomName}: ${errorMessage}`, { subsystem: "CPUBudget" });
    }
  }

  /** Get budget violations sorted by most frequent offenders first. */
  public getViolationsSummary(): { subsystem: string; violations: number }[] {
    return toViolationSummary(this.budgetViolations);
  }

  /** Clear all accumulated violation counters. */
  public resetViolations(): void {
    this.budgetViolations.clear();
  }

  /** Return a defensive copy of the active runtime configuration. */
  public getConfig(): CpuBudgetConfig {
    return { ...this.config };
  }

  /** Merge partial runtime configuration updates. */
  public updateConfig(config: Partial<CpuBudgetConfig>): void {
    this.config = mergeBudgetConfig(this.config, config);
  }

  private recordBudgetViolation(subsystem: string, cpuUsed: number, limit: number): void {
    const violations = (this.budgetViolations.get(subsystem) ?? 0) + 1;
    this.budgetViolations.set(subsystem, violations);

    const overage = formatBudgetOverage(cpuUsed, limit);
    const message = `${subsystem} used ${cpuUsed.toFixed(3)} CPU (limit: ${limit}, overage: ${overage}%)`;

    if (this.config.strictMode) {
      logger.error(`CPU budget violation: ${message}`, { subsystem: "CPUBudget" });
    } else {
      logger.warn(`CPU budget exceeded: ${message}`, { subsystem: "CPUBudget" });
    }
  }
}

/** Global CPU budget manager instance. */
export const cpuBudgetManager = new CpuBudgetManager();
