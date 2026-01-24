/**
 * Budget Dashboard Visualization
 *
 * Displays real-time CPU budget allocation, usage, and health metrics.
 * Shows adaptive budget parameters and process-level details.
 *
 * Visual Elements:
 * - Budget allocation bars (high/medium/low frequency)
 * - Budget vs actual usage comparison
 * - Room scaling and bucket multipliers
 * - Process health indicators
 * - Utilization ratio gauge
 */

import { getAdaptiveBudgetInfo } from "@ralphschuler/screeps-stats";
import { kernel } from "../core/kernel";

export interface BudgetDashboardOptions {
  /** Room to display dashboard in (defaults to first owned room) */
  room?: string;
  /** X position on screen (0-50) */
  x?: number;
  /** Y position on screen (0-50) */
  y?: number;
  /** Show detailed process breakdown */
  showProcesses?: boolean;
  /** Maximum number of processes to show */
  maxProcesses?: number;
  /** Maximum length for process names before truncation */
  maxProcessNameLength?: number;
}

/**
 * Render CPU budget dashboard
 *
 * @param options - Dashboard options
 * @returns CPU cost of rendering
 */
export function renderBudgetDashboard(options: BudgetDashboardOptions = {}): number {
  const startCpu = Game.cpu.getUsed();

  // Get target room
  const roomName = options.room || Object.keys(Game.rooms)[0];
  if (!roomName || !Game.rooms[roomName]) {
    return Game.cpu.getUsed() - startCpu;
  }

  const room = Game.rooms[roomName];
  const visual = room.visual;

  // Dashboard position
  const x = options.x ?? 1;
  const y = options.y ?? 1;

  // Get kernel config and budget info
  const config = kernel.getConfig();
  const budgetInfo = getAdaptiveBudgetInfo(config.adaptiveBudgetConfig);
  const processes = kernel.getProcesses();

  // Calculate utilization
  const totalAllocated = processes.reduce((sum, p) => sum + p.cpuBudget, 0);
  const totalUsed = kernel.getTickCpuUsed();
  const utilizationRatio = totalAllocated > 0 ? totalUsed / totalAllocated : 0;

  // Header
  visual.text("⚡ CPU Budget Dashboard", x, y, {
    color: "#FFFFFF",
    font: 0.7,
    align: "left"
  });

  let currentY = y + 1;

  // Adaptive budgets status
  const statusColor = config.enableAdaptiveBudgets ? "#00FF00" : "#888888";
  const statusText = config.enableAdaptiveBudgets ? "ENABLED" : "DISABLED";
  visual.text(`Adaptive Budgets: ${statusText}`, x, currentY, {
    color: statusColor,
    font: 0.5,
    align: "left"
  });

  currentY += 0.7;

  // Empire stats
  visual.text(`Rooms: ${budgetInfo.roomCount} | Bucket: ${budgetInfo.bucket}`, x, currentY, {
    color: "#CCCCCC",
    font: 0.5,
    align: "left"
  });

  currentY += 0.7;

  // Multipliers
  visual.text(
    `Room Multiplier: ${budgetInfo.roomMultiplier.toFixed(2)}x | Bucket Multiplier: ${budgetInfo.bucketMultiplier.toFixed(2)}x`,
    x,
    currentY,
    {
      color: "#AAAAAA",
      font: 0.5,
      align: "left"
    }
  );

  currentY += 1;

  // Budget bars
  const barWidth = 8;
  const barHeight = 0.4;
  const barSpacing = 0.8;

  // Helper function to draw budget bar
  const drawBudgetBar = (label: string, budget: number, yPos: number, color: string) => {
    // Label
    visual.text(label, x, yPos, {
      color: "#FFFFFF",
      font: 0.5,
      align: "left"
    });

    // Background bar
    visual.rect(x + 3, yPos - 0.2, barWidth, barHeight, {
      fill: "#222222",
      opacity: 0.5
    });

    // Filled bar
    const fillWidth = barWidth * Math.min(budget, 1.0);
    visual.rect(x + 3, yPos - 0.2, fillWidth, barHeight, {
      fill: color,
      opacity: 0.8
    });

    // Value text
    visual.text(`${(budget * 100).toFixed(1)}%`, x + 3 + barWidth + 0.3, yPos, {
      color: "#FFFFFF",
      font: 0.4,
      align: "left"
    });
  };

  drawBudgetBar("High Freq:", budgetInfo.budgets.high, currentY, "#FF6B6B");
  currentY += barSpacing;

  drawBudgetBar("Medium Freq:", budgetInfo.budgets.medium, currentY, "#FFD93D");
  currentY += barSpacing;

  drawBudgetBar("Low Freq:", budgetInfo.budgets.low, currentY, "#6BCF7F");
  currentY += barSpacing;

  // Separator
  currentY += 0.3;

  // Utilization gauge
  visual.text("Overall Utilization:", x, currentY, {
    color: "#FFFFFF",
    font: 0.5,
    align: "left"
  });

  currentY += 0.6;

  // Utilization bar
  visual.rect(x, currentY - 0.2, barWidth + 6, barHeight, {
    fill: "#222222",
    opacity: 0.5
  });

  const utilizationColor =
    utilizationRatio > 0.9 ? "#FF0000" : utilizationRatio > 0.7 ? "#FFD93D" : "#00FF00";
  const utilizationWidth = (barWidth + 6) * Math.min(utilizationRatio, 1.0);
  visual.rect(x, currentY - 0.2, utilizationWidth, barHeight, {
    fill: utilizationColor,
    opacity: 0.8
  });

  visual.text(`${(utilizationRatio * 100).toFixed(1)}%`, x + barWidth + 6.5, currentY, {
    color: "#FFFFFF",
    font: 0.5,
    align: "left"
  });

  currentY += 0.7;

  // CPU stats
  visual.text(
    `Allocated: ${totalAllocated.toFixed(2)} | Used: ${totalUsed.toFixed(2)} | Available: ${kernel.getRemainingCpu().toFixed(2)}`,
    x,
    currentY,
    {
      color: "#AAAAAA",
      font: 0.4,
      align: "left"
    }
  );

  currentY += 1;

  // Process health section
  if (options.showProcesses !== false) {
    visual.text("Process Health:", x, currentY, {
      color: "#FFFFFF",
      font: 0.6,
      align: "left"
    });

    currentY += 0.7;

    // Get unhealthy processes
    const processesArray = kernel.getProcesses();
    const unhealthyProcesses = processesArray
      .filter(p => p.stats.healthScore < 80)
      .sort((a, b) => a.stats.healthScore - b.stats.healthScore)
      .slice(0, options.maxProcesses ?? 5);

    if (unhealthyProcesses.length === 0) {
      visual.text("✓ All processes healthy", x, currentY, {
        color: "#00FF00",
        font: 0.4,
        align: "left"
      });
      currentY += 0.6;
    } else {
      for (const process of unhealthyProcesses) {
        const healthColor =
          process.stats.healthScore < 30
            ? "#FF0000"
            : process.stats.healthScore < 60
            ? "#FFA500"
            : "#FFD93D";

        const statusIcon = process.state === "suspended" ? "⚠" : "○";
        const maxNameLength = options.maxProcessNameLength ?? 15;
        const displayName = process.name.length > maxNameLength 
          ? process.name.substring(0, maxNameLength - 1) + "…"
          : process.name;
          
        visual.text(
          `${statusIcon} ${displayName}: ${process.stats.healthScore.toFixed(0)}%`,
          x,
          currentY,
          {
            color: healthColor,
            font: 0.4,
            align: "left"
          }
        );

        currentY += 0.6;
      }
    }

    // Suspended processes count
    const suspendedCount = processesArray.filter(p => p.state === "suspended").length;
    if (suspendedCount > 0) {
      currentY += 0.3;
      visual.text(`⚠ ${suspendedCount} process(es) suspended`, x, currentY, {
        color: "#FF6B6B",
        font: 0.4,
        align: "left"
      });
    }
  }

  return Game.cpu.getUsed() - startCpu;
}

/**
 * Compact budget status bar (for minimal visualization mode)
 *
 * @param roomName - Room to display in
 * @returns CPU cost of rendering
 */
export function renderCompactBudgetStatus(roomName?: string): number {
  const startCpu = Game.cpu.getUsed();

  const targetRoom = roomName || Object.keys(Game.rooms)[0];
  if (!targetRoom || !Game.rooms[targetRoom]) {
    return 0;
  }

  const room = Game.rooms[targetRoom];
  const visual = room.visual;

  // Get budget info
  const config = kernel.getConfig();
  const budgetInfo = getAdaptiveBudgetInfo(config.adaptiveBudgetConfig);
  const processes = kernel.getProcesses();

  // Calculate utilization
  const totalAllocated = processes.reduce((sum, p) => sum + p.cpuBudget, 0);
  const totalUsed = kernel.getTickCpuUsed();
  const utilizationRatio = totalAllocated > 0 ? totalUsed / totalAllocated : 0;

  // Compact status at top right
  const statusColor = utilizationRatio > 0.9 ? "#FF0000" : utilizationRatio > 0.7 ? "#FFD93D" : "#00FF00";

  visual.text(`CPU: ${(utilizationRatio * 100).toFixed(0)}% | ${budgetInfo.roomCount}R | ${budgetInfo.bucket}B`, 49, 1, {
    color: statusColor,
    font: 0.4,
    align: "right"
  });

  return Game.cpu.getUsed() - startCpu;
}
