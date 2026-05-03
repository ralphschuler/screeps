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
