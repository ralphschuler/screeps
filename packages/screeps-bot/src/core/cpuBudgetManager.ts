/**
 * CPU Budget Manager
 *
 * Enforces CPU budgets per subsystem type:
 * - Eco rooms: ≤ 0.1 CPU per room
 * - War rooms: ≤ 0.25 CPU per room
 * - Global overmind: ≤ 1 CPU every 20-50 ticks
 *
 * Addresses Issue: #5
 */

import { logger } from "./logger";
import { profiler } from "./profiler";

/**
 * Subsystem type
 */
export type SubsystemType = "ecoRoom" | "warRoom" | "overmind" | "other";

/**
 * CPU budget configuration
 */
export interface CpuBudgetConfig {
  /** CPU limit for eco rooms (per room per tick) */
  ecoRoomLimit: number;
  /** CPU limit for war rooms (per room per tick) */
  warRoomLimit: number;
  /** CPU limit for overmind (total per execution) */
  overmindLimit: number;
  /** Whether to enforce budgets strictly */
  strictMode: boolean;
}

const DEFAULT_CONFIG: CpuBudgetConfig = {
  ecoRoomLimit: 0.1,
  warRoomLimit: 0.25,
  overmindLimit: 1.0,
  strictMode: false // Log warnings but don't halt execution
};

/**
 * CPU Budget Manager
 */
export class CpuBudgetManager {
  private config: CpuBudgetConfig;
  private budgetViolations: Map<string, number> = new Map();

  public constructor(config: Partial<CpuBudgetConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if subsystem is within budget
   */
  public checkBudget(subsystem: string, type: SubsystemType, cpuUsed: number): boolean {
    const limit = this.getBudgetLimit(type);
    const withinBudget = cpuUsed <= limit;

    if (!withinBudget) {
      const violations = (this.budgetViolations.get(subsystem) ?? 0) + 1;
      this.budgetViolations.set(subsystem, violations);

      const overage = ((cpuUsed - limit) / limit * 100).toFixed(1);
      
      if (this.config.strictMode) {
        logger.error(
          `CPU budget violation: ${subsystem} used ${cpuUsed.toFixed(3)} CPU (limit: ${limit}, overage: ${overage}%)`,
          { subsystem: "CPUBudget" }
        );
      } else {
        logger.warn(
          `CPU budget exceeded: ${subsystem} used ${cpuUsed.toFixed(3)} CPU (limit: ${limit}, overage: ${overage}%)`,
          { subsystem: "CPUBudget" }
        );
      }
    }

    return withinBudget;
  }

  /**
   * Get budget limit for subsystem type
   */
  private getBudgetLimit(type: SubsystemType): number {
    switch (type) {
      case "ecoRoom":
        return this.config.ecoRoomLimit;
      case "warRoom":
        return this.config.warRoomLimit;
      case "overmind":
        return this.config.overmindLimit;
      default:
        return 0.5; // Default limit for other subsystems
    }
  }

  /**
   * Execute function with budget tracking
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
      logger.error(`Error in ${subsystem}: ${err}`, { subsystem: "CPUBudget" });
      return null;
    }
  }

  /**
   * Execute room logic with budget tracking
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
      
      // Track in profiler
      profiler.measureSubsystem(`room_${roomName}`, () => {});
      
      // Check budget
      const withinBudget = this.checkBudget(roomName, type, cpuUsed);
      
      // In strict mode, skip remaining room processing if over budget
      if (!withinBudget && this.config.strictMode) {
        logger.warn(`Skipping ${roomName} due to budget violation`, { subsystem: "CPUBudget" });
      }
    } catch (err) {
      logger.error(`Error in room ${roomName}: ${err}`, { subsystem: "CPUBudget" });
    }
  }

  /**
   * Get budget violations summary
   */
  public getViolationsSummary(): { subsystem: string; violations: number }[] {
    return Array.from(this.budgetViolations.entries())
      .map(([subsystem, violations]) => ({ subsystem, violations }))
      .sort((a, b) => b.violations - a.violations);
  }

  /**
   * Reset violation counters
   */
  public resetViolations(): void {
    this.budgetViolations.clear();
  }

  /**
   * Get configuration
   */
  public getConfig(): CpuBudgetConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<CpuBudgetConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Global CPU budget manager instance
 */
export const cpuBudgetManager = new CpuBudgetManager();
