import { expect } from "chai";
import { renderBudgetDashboard } from "../src/budgetDashboard.ts";
import { createLogger } from "../src/logger.ts";

describe("Visual Utilities", () => {
  it("skips budget rendering cheaply when dependencies are missing", () => {
    (globalThis as { __resetMockCpuUsed?: () => void }).__resetMockCpuUsed?.();

    const cpuUsed = renderBudgetDashboard();

    expect(cpuUsed).to.be.a("number");
    expect(cpuUsed).to.be.greaterThanOrEqual(0);
  });

  it("renders budget bars from kernel frequency budgets", () => {
    (globalThis as { __resetMockCpuUsed?: () => void }).__resetMockCpuUsed?.();

    const textCalls: string[] = [];
    const visual = {
      text: (text: string) => {
        textCalls.push(text);
        return visual;
      },
      rect: () => visual
    };

    (Game as unknown as { rooms: Record<string, Room> }).rooms = {
      W1N1: { visual } as unknown as Room
    };

    const cpuUsed = renderBudgetDashboard({
      showProcesses: false,
      kernel: {
        getConfig: () => ({
          enableAdaptiveBudgets: true,
          adaptiveBudgetConfig: {},
          frequencyCpuBudgets: {
            high: 0.11,
            medium: 0.07,
            low: 0.03
          }
        }),
        getProcesses: () => [],
        getTickCpuUsed: () => 0,
        getRemainingCpu: () => 100
      },
      stats: {
        getAdaptiveBudgetInfo: () => ({
          roomCount: 2,
          bucket: 5000,
          roomMultiplier: 1,
          bucketMultiplier: 1,
          budgets: {
            high: 0.9,
            medium: 0.8,
            low: 0.7
          }
        })
      }
    });

    expect(cpuUsed).to.be.a("number");
    expect(textCalls).to.include("11.0%");
    expect(textCalls).to.include("7.0%");
    expect(textCalls).to.include("3.0%");
    expect(textCalls).not.to.include("90.0%");
  });

  it("creates package-scoped loggers", () => {
    const originalLog = console.log;
    const messages: unknown[][] = [];
    console.log = (...args: unknown[]) => {
      messages.push(args);
    };

    try {
      createLogger("visuals").warn("test warning", { room: "W1N1" });
    } finally {
      console.log = originalLog;
    }

    expect(String(messages[0][0])).to.contain("[visuals] WARN: test warning");
    expect(String(messages[0][1])).to.contain("W1N1");
  });
});
