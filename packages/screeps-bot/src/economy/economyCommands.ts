/**
 * Economy Console Commands
 *
 * Console commands for economy management including energy prediction
 */

import { Command } from "../core/commandRegistry";
import { energyFlowPredictor } from "./energyFlowPredictor";

/**
 * Economy system commands
 */
export class EconomyCommands {
  @Command({
    name: "economy.energy.predict",
    description: "Predict energy availability for a room in N ticks",
    usage: "economy.energy.predict(roomName, ticks)",
    examples: [
      "economy.energy.predict('W1N1', 50)",
      "economy.energy.predict('E1S1', 100)"
    ],
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

    const prediction = energyFlowPredictor.predictEnergyInTicks(room, ticks);
    
    let output = `=== Energy Prediction: ${roomName} ===\n`;
    output += `Current Energy: ${prediction.current}\n`;
    output += `Predicted (${ticks} ticks): ${Math.round(prediction.predicted)}\n`;
    output += `Net Flow: ${prediction.netFlow.toFixed(2)} energy/tick\n\n`;

    output += `Income Breakdown (per tick):\n`;
    output += `  Harvesters: ${prediction.income.harvesters.toFixed(2)}\n`;
    output += `  Static Miners: ${prediction.income.miners.toFixed(2)}\n`;
    output += `  Links: ${prediction.income.links.toFixed(2)}\n`;
    output += `  Total: ${prediction.income.total.toFixed(2)}\n\n`;

    output += `Consumption Breakdown (per tick):\n`;
    output += `  Upgraders: ${prediction.consumption.upgraders.toFixed(2)}\n`;
    output += `  Builders: ${prediction.consumption.builders.toFixed(2)}\n`;
    output += `  Towers: ${prediction.consumption.towers.toFixed(2)}\n`;
    output += `  Spawning: ${prediction.consumption.spawning.toFixed(2)}\n`;
    output += `  Repairs: ${prediction.consumption.repairs.toFixed(2)}\n`;
    output += `  Total: ${prediction.consumption.total.toFixed(2)}\n`;

    return output;
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

    const income = energyFlowPredictor.calculateEnergyIncome(room);

    let output = `=== Energy Income: ${roomName} ===\n`;
    output += `Harvesters: ${income.harvesters.toFixed(2)} energy/tick\n`;
    output += `Static Miners: ${income.miners.toFixed(2)} energy/tick\n`;
    output += `Links: ${income.links.toFixed(2)} energy/tick\n`;
    output += `Total: ${income.total.toFixed(2)} energy/tick\n`;

    return output;
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

    const consumption = energyFlowPredictor.calculateEnergyConsumption(room);

    let output = `=== Energy Consumption: ${roomName} ===\n`;
    output += `Upgraders: ${consumption.upgraders.toFixed(2)} energy/tick\n`;
    output += `Builders: ${consumption.builders.toFixed(2)} energy/tick\n`;
    output += `Towers: ${consumption.towers.toFixed(2)} energy/tick\n`;
    output += `Spawning: ${consumption.spawning.toFixed(2)} energy/tick\n`;
    output += `Repairs: ${consumption.repairs.toFixed(2)} energy/tick\n`;
    output += `Total: ${consumption.total.toFixed(2)} energy/tick\n`;

    return output;
  }

  @Command({
    name: "economy.energy.canAfford",
    description: "Check if a room can afford a certain energy cost within N ticks",
    usage: "economy.energy.canAfford(roomName, cost, ticks)",
    examples: [
      "economy.energy.canAfford('W1N1', 1000, 50)",
      "economy.energy.canAfford('E1S1', 500, 25)"
    ],
    category: "Economy"
  })
  public canAfford(roomName: string, cost: number, ticks: number = 50): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    const canAfford = energyFlowPredictor.canAffordInTicks(room, cost, ticks);
    const prediction = energyFlowPredictor.predictEnergyInTicks(room, ticks);

    if (canAfford) {
      return `✓ Room ${roomName} CAN afford ${cost} energy within ${ticks} ticks (predicted: ${Math.round(prediction.predicted)})`;
    } else {
      const delay = energyFlowPredictor.getRecommendedSpawnDelay(room, cost);
      if (delay >= 999) {
        return `✗ Room ${roomName} CANNOT afford ${cost} energy (negative energy flow)`;
      }
      return `✗ Room ${roomName} CANNOT afford ${cost} energy within ${ticks} ticks (would need ${delay} ticks)`;
    }
  }

  @Command({
    name: "economy.energy.spawnDelay",
    description: "Get recommended spawn delay for a body cost",
    usage: "economy.energy.spawnDelay(roomName, cost)",
    examples: [
      "economy.energy.spawnDelay('W1N1', 1000)",
      "economy.energy.spawnDelay('E1S1', 500)"
    ],
    category: "Economy"
  })
  public getSpawnDelay(roomName: string, cost: number): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return `Room ${roomName} is not visible`;
    }

    const delay = energyFlowPredictor.getRecommendedSpawnDelay(room, cost);
    const current = room.energyAvailable;

    if (delay === 0) {
      return `✓ Room ${roomName} can spawn ${cost} energy body NOW (current: ${current})`;
    } else if (delay >= 999) {
      return `✗ Room ${roomName} has negative energy flow, cannot spawn ${cost} energy body`;
    } else {
      const prediction = energyFlowPredictor.predictEnergyInTicks(room, delay);
      return `Room ${roomName} needs to wait ${delay} ticks to spawn ${cost} energy body (current: ${current}, predicted: ${Math.round(prediction.predicted)})`;
    }
  }
}

// Export singleton instance
export const economyCommands = new EconomyCommands();
