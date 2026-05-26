import { expect } from "chai";
import {
  formatEnergyAffordabilityReport,
  formatEnergyConsumptionReport,
  formatEnergyIncomeReport,
  formatEnergyPredictionReport,
  formatEnergySpawnDelayReport
} from "../../src/economy/energyFlowReport";

describe("Energy-flow report Module", () => {
  const income = { harvesters: 1, miners: 2, links: 3, total: 6 };
  const consumption = { upgraders: 1, builders: 1, towers: 1, spawning: 1, repairs: 1, total: 5 };

  it("formats prediction, income, and consumption snapshots", () => {
    expect(formatEnergyPredictionReport("W1N1", { current: 100, predicted: 150, income, consumption, netFlow: 1, ticks: 50 })).to.include(
      "Predicted (50 ticks): 150"
    );
    expect(formatEnergyIncomeReport("W1N1", income)).to.include("Total: 6.00 energy/tick");
    expect(formatEnergyConsumptionReport("W1N1", consumption)).to.include("Repairs: 1.00 energy/tick");
  });

  it("formats afford and spawn-delay guidance", () => {
    expect(formatEnergyAffordabilityReport({ roomName: "W1N1", cost: 500, ticks: 50, canAfford: true, predicted: 700, delay: 0 })).to.include(
      "CAN afford"
    );
    expect(formatEnergyAffordabilityReport({ roomName: "W1N1", cost: 500, ticks: 50, canAfford: false, predicted: 100, delay: 999 })).to.include(
      "negative energy flow"
    );
    expect(formatEnergySpawnDelayReport({ roomName: "W1N1", cost: 500, delay: 3, current: 100, predicted: 500 })).to.include(
      "needs to wait 3 ticks"
    );
  });
});
