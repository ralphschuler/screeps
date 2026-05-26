/**
 * Economy Console Commands
 *
 * Console commands for economy management including energy prediction
 */

import { Command } from "../core/commandRegistry";
import { energyFlowPredictor } from "./energyFlowPredictor";
import {
  formatEnergyAffordabilityReport,
  formatEnergyConsumptionReport,
  formatEnergyIncomeReport,
  formatEnergyPredictionReport,
  formatEnergySpawnDelayReport
} from "./energyFlowReport";

/**
 * Economy system commands
 */
export class EconomyCommands {
  @Command({
    name: "economy.energy.predict",
    description: "Predict energy availability for a room in N ticks",
    usage: "economy.energy.predict(roomName, ticks)",
    examples: ["economy.energy.predict('W1N1', 50)", "economy.energy.predict('E1S1', 100)"],
    category: "Economy"
  })
  public predictEnergy(roomName: string, ticks: number = 50): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    if (!room.controller || !room.controller.my) {
      return `Room ${roomName} is not owned by you`;
    }

    return formatEnergyPredictionReport(roomName, energyFlowPredictor.predictEnergyInTicks(room, ticks));
  }

  @Command({
    name: "economy.energy.income",
    description: "Show energy income breakdown for a room",
    usage: "economy.energy.income(roomName)",
    examples: ["economy.energy.income('W1N1')"],
    category: "Economy"
  })
  public showIncome(roomName: string): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    return formatEnergyIncomeReport(roomName, energyFlowPredictor.calculateEnergyIncome(room));
  }

  @Command({
    name: "economy.energy.consumption",
    description: "Show energy consumption breakdown for a room",
    usage: "economy.energy.consumption(roomName)",
    examples: ["economy.energy.consumption('W1N1')"],
    category: "Economy"
  })
  public showConsumption(roomName: string): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    return formatEnergyConsumptionReport(roomName, energyFlowPredictor.calculateEnergyConsumption(room));
  }

  @Command({
    name: "economy.energy.canAfford",
    description: "Check if a room can afford a certain energy cost within N ticks",
    usage: "economy.energy.canAfford(roomName, cost, ticks)",
    examples: ["economy.energy.canAfford('W1N1', 1000, 50)", "economy.energy.canAfford('E1S1', 500, 25)"],
    category: "Economy"
  })
  public canAfford(roomName: string, cost: number, ticks: number = 50): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    const canAfford = energyFlowPredictor.canAffordInTicks(room, cost, ticks);
    const prediction = energyFlowPredictor.predictEnergyInTicks(room, ticks);

    return formatEnergyAffordabilityReport({
      roomName,
      cost,
      ticks,
      canAfford,
      predicted: prediction.predicted,
      delay: energyFlowPredictor.getRecommendedSpawnDelay(room, cost)
    });
  }

  @Command({
    name: "economy.energy.spawnDelay",
    description: "Get recommended spawn delay for a body cost",
    usage: "economy.energy.spawnDelay(roomName, cost)",
    examples: ["economy.energy.spawnDelay('W1N1', 1000)", "economy.energy.spawnDelay('E1S1', 500)"],
    category: "Economy"
  })
  public getSpawnDelay(roomName: string, cost: number): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    const delay = energyFlowPredictor.getRecommendedSpawnDelay(room, cost);
    const current = room.energyAvailable;

    const prediction = delay > 0 && delay < 999 ? energyFlowPredictor.predictEnergyInTicks(room, delay) : undefined;
    return formatEnergySpawnDelayReport({ roomName, cost, delay, current, predicted: prediction?.predicted });
  }
}

// Export singleton instance
export const economyCommands = new EconomyCommands();
