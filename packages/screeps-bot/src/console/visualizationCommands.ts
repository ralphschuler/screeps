/**
 * Visualization Console Commands
 *
 * Provides console commands for managing visualization layers and modes.
 */

import { visualizationManager } from "../visuals/visualizationManager";
import { VisualizationLayer } from "../memory/schemas";
import type { VisualizationMode } from "../memory/schemas";

/**
 * Set visualization mode
 * @param mode - Preset mode: "debug", "presentation", "minimal", or "performance"
 * @example setVisMode('debug')
 */
export function setVisMode(mode: VisualizationMode): void {
  visualizationManager.setMode(mode);
  console.log(`Visualization mode set to: ${mode}`);
}

/**
 * Toggle a specific visualization layer
 * @param layer - Layer name: "pheromones", "paths", "traffic", "defense", "economy", "construction", "performance"
 * @example toggleVisLayer('pheromones')
 */
export function toggleVisLayer(layer: string): void {
  const layerMap: Record<string, VisualizationLayer> = {
    pheromones: VisualizationLayer.Pheromones,
    paths: VisualizationLayer.Paths,
    traffic: VisualizationLayer.Traffic,
    defense: VisualizationLayer.Defense,
    economy: VisualizationLayer.Economy,
    construction: VisualizationLayer.Construction,
    performance: VisualizationLayer.Performance
  };

  const vizLayer = layerMap[layer.toLowerCase()];
  if (!vizLayer) {
    console.log(`Unknown layer: ${layer}. Valid layers: ${Object.keys(layerMap).join(", ")}`);
    return;
  }

  visualizationManager.toggleLayer(vizLayer);
  const enabled = visualizationManager.isLayerEnabled(vizLayer);
  console.log(`Layer ${layer}: ${enabled ? "enabled" : "disabled"}`);
}

/**
 * Enable a specific visualization layer
 * @param layer - Layer name
 * @example enableVisLayer('defense')
 */
export function enableVisLayer(layer: string): void {
  const layerMap: Record<string, VisualizationLayer> = {
    pheromones: VisualizationLayer.Pheromones,
    paths: VisualizationLayer.Paths,
    traffic: VisualizationLayer.Traffic,
    defense: VisualizationLayer.Defense,
    economy: VisualizationLayer.Economy,
    construction: VisualizationLayer.Construction,
    performance: VisualizationLayer.Performance
  };

  const vizLayer = layerMap[layer.toLowerCase()];
  if (!vizLayer) {
    console.log(`Unknown layer: ${layer}`);
    return;
  }

  visualizationManager.enableLayer(vizLayer);
  console.log(`Layer ${layer}: enabled`);
}

/**
 * Disable a specific visualization layer
 * @param layer - Layer name
 * @example disableVisLayer('pheromones')
 */
export function disableVisLayer(layer: string): void {
  const layerMap: Record<string, VisualizationLayer> = {
    pheromones: VisualizationLayer.Pheromones,
    paths: VisualizationLayer.Paths,
    traffic: VisualizationLayer.Traffic,
    defense: VisualizationLayer.Defense,
    economy: VisualizationLayer.Economy,
    construction: VisualizationLayer.Construction,
    performance: VisualizationLayer.Performance
  };

  const vizLayer = layerMap[layer.toLowerCase()];
  if (!vizLayer) {
    console.log(`Unknown layer: ${layer}`);
    return;
  }

  visualizationManager.disableLayer(vizLayer);
  console.log(`Layer ${layer}: disabled`);
}

/**
 * Show visualization performance metrics
 * @example showVisPerf()
 */
export function showVisPerf(): void {
  const metrics = visualizationManager.getPerformanceMetrics();
  console.log("=== Visualization Performance ===");
  console.log(`Total CPU: ${metrics.totalCost.toFixed(3)}`);
  console.log(`% of Budget: ${metrics.percentOfBudget.toFixed(2)}%`);
  console.log("\nPer-Layer Costs:");
  for (const [layer, cost] of Object.entries(metrics.layerCosts)) {
    if (cost > 0) {
      console.log(`  ${layer}: ${cost.toFixed(3)} CPU`);
    }
  }
}

/**
 * Clear visualization cache
 * @param roomName - Optional room name. If not provided, clears all caches
 * @example clearVisCache()
 * @example clearVisCache('W1N1')
 */
export function clearVisCache(roomName?: string): void {
  visualizationManager.clearCache(roomName);
  if (roomName) {
    console.log(`Visualization cache cleared for room: ${roomName}`);
  } else {
    console.log("All visualization caches cleared");
  }
}

/**
 * Show current visualization configuration
 * @example showVisConfig()
 */
export function showVisConfig(): void {
  const config = visualizationManager.getConfig();
  console.log("=== Visualization Configuration ===");
  console.log(`Mode: ${config.mode}`);
  console.log("\nEnabled Layers:");
  
  const layerNames: Record<number, string> = {
    [VisualizationLayer.Pheromones]: "Pheromones",
    [VisualizationLayer.Paths]: "Paths",
    [VisualizationLayer.Traffic]: "Traffic",
    [VisualizationLayer.Defense]: "Defense",
    [VisualizationLayer.Economy]: "Economy",
    [VisualizationLayer.Construction]: "Construction",
    [VisualizationLayer.Performance]: "Performance"
  };

  for (const [value, name] of Object.entries(layerNames)) {
    const layer = parseInt(value, 10);
    const enabled = (config.enabledLayers & layer) !== 0;
    console.log(`  ${name}: ${enabled ? "✓" : "✗"}`);
  }
}

// Export all commands to global scope when in game environment
if (typeof global !== "undefined") {
  (global as Record<string, unknown>).setVisMode = setVisMode;
  (global as Record<string, unknown>).toggleVisLayer = toggleVisLayer;
  (global as Record<string, unknown>).enableVisLayer = enableVisLayer;
  (global as Record<string, unknown>).disableVisLayer = disableVisLayer;
  (global as Record<string, unknown>).showVisPerf = showVisPerf;
  (global as Record<string, unknown>).clearVisCache = clearVisCache;
  (global as Record<string, unknown>).showVisConfig = showVisConfig;
}
