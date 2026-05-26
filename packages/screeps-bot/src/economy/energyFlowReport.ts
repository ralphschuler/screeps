import type { EnergyConsumptionBreakdown, EnergyIncomeBreakdown, EnergyPrediction } from "./energyFlowPredictor";

export function formatEnergyPredictionReport(roomName: string, prediction: EnergyPrediction): string {
  return [
    `=== Energy Prediction: ${roomName} ===`,
    `Current Energy: ${prediction.current}`,
    `Predicted (${prediction.ticks} ticks): ${Math.round(prediction.predicted)}`,
    `Net Flow: ${prediction.netFlow.toFixed(2)} energy/tick`,
    "",
    "Income Breakdown (per tick):",
    `  Harvesters: ${prediction.income.harvesters.toFixed(2)}`,
    `  Static Miners: ${prediction.income.miners.toFixed(2)}`,
    `  Links: ${prediction.income.links.toFixed(2)}`,
    `  Total: ${prediction.income.total.toFixed(2)}`,
    "",
    "Consumption Breakdown (per tick):",
    `  Upgraders: ${prediction.consumption.upgraders.toFixed(2)}`,
    `  Builders: ${prediction.consumption.builders.toFixed(2)}`,
    `  Towers: ${prediction.consumption.towers.toFixed(2)}`,
    `  Spawning: ${prediction.consumption.spawning.toFixed(2)}`,
    `  Repairs: ${prediction.consumption.repairs.toFixed(2)}`,
    `  Total: ${prediction.consumption.total.toFixed(2)}`,
    ""
  ].join("\n");
}

export function formatEnergyIncomeReport(roomName: string, income: EnergyIncomeBreakdown): string {
  return [
    `=== Energy Income: ${roomName} ===`,
    `Harvesters: ${income.harvesters.toFixed(2)} energy/tick`,
    `Static Miners: ${income.miners.toFixed(2)} energy/tick`,
    `Links: ${income.links.toFixed(2)} energy/tick`,
    `Total: ${income.total.toFixed(2)} energy/tick`,
    ""
  ].join("\n");
}

export function formatEnergyConsumptionReport(roomName: string, consumption: EnergyConsumptionBreakdown): string {
  return [
    `=== Energy Consumption: ${roomName} ===`,
    `Upgraders: ${consumption.upgraders.toFixed(2)} energy/tick`,
    `Builders: ${consumption.builders.toFixed(2)} energy/tick`,
    `Towers: ${consumption.towers.toFixed(2)} energy/tick`,
    `Spawning: ${consumption.spawning.toFixed(2)} energy/tick`,
    `Repairs: ${consumption.repairs.toFixed(2)} energy/tick`,
    `Total: ${consumption.total.toFixed(2)} energy/tick`,
    ""
  ].join("\n");
}

export function formatEnergyAffordabilityReport(input: {
  roomName: string;
  cost: number;
  ticks: number;
  canAfford: boolean;
  predicted: number;
  delay: number;
}): string {
  if (input.canAfford) {
    return `✓ Room ${input.roomName} CAN afford ${input.cost} energy within ${input.ticks} ticks (predicted: ${Math.round(input.predicted)})`;
  }
  if (input.delay >= 999) return `✗ Room ${input.roomName} CANNOT afford ${input.cost} energy (negative energy flow)`;
  return `✗ Room ${input.roomName} CANNOT afford ${input.cost} energy within ${input.ticks} ticks (would need ${input.delay} ticks)`;
}

export function formatEnergySpawnDelayReport(input: { roomName: string; cost: number; delay: number; current: number; predicted?: number }): string {
  if (input.delay === 0) return `✓ Room ${input.roomName} can spawn ${input.cost} energy body NOW (current: ${input.current})`;
  if (input.delay >= 999) return `✗ Room ${input.roomName} has negative energy flow, cannot spawn ${input.cost} energy body`;
  return `Room ${input.roomName} needs to wait ${input.delay} ticks to spawn ${input.cost} energy body (current: ${input.current}, predicted: ${Math.round(input.predicted ?? 0)})`;
}
