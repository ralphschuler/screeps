/**
 * Visualization Console Commands
 *
 * Commands for toggling visual overlays and managing visualization settings.
 * Extracted from consoleCommands.ts for better modularity.
 */

import { Command } from "../commandRegistry";
import { getConfig, updateConfig } from "../../config";
import { roomVisualizer, mapVisualizer } from "../../SwarmBot";
import { visualizationManager } from "../../visuals/visualizationManager";
import { VisualizationLayer } from "../../memory/schemas";

/**
 * Visualization commands
 */
export class VisualizationCommands {
  @Command({
    name: "toggleVisualizations",
    description: "Toggle all visualizations on/off",
    usage: "toggleVisualizations()",
    examples: ["toggleVisualizations()"],
    category: "Visualization"
  })
  public toggleVisualizations(): string {
    const config = getConfig();
    const newValue = !config.visualizations;
    updateConfig({ visualizations: newValue });
    return `Visualizations: ${newValue ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "toggleVisualization",
    description: "Toggle a specific room visualization feature",
    usage: "toggleVisualization(key)",
    examples: [
      "toggleVisualization('showPheromones')",
      "toggleVisualization('showPaths')",
      "toggleVisualization('showCombat')"
    ],
    category: "Visualization"
  })
  public toggleVisualization(key: string): string {
    const config = roomVisualizer.getConfig();
    const validKeys = Object.keys(config).filter(
      k => k.startsWith("show") && typeof config[k as keyof typeof config] === "boolean"
    );

    if (!validKeys.includes(key)) {
      return `Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`;
    }

    const validKey = key as keyof typeof config;
    roomVisualizer.toggle(validKey);
    const newConfig = roomVisualizer.getConfig();
    const value = newConfig[validKey];
    return `Room visualization '${key}': ${value ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "toggleMapVisualization",
    description: "Toggle a specific map visualization feature",
    usage: "toggleMapVisualization(key)",
    examples: [
      "toggleMapVisualization('showRoomStatus')",
      "toggleMapVisualization('showConnections')",
      "toggleMapVisualization('showThreats')",
      "toggleMapVisualization('showExpansion')"
    ],
    category: "Visualization"
  })
  public toggleMapVisualization(key: string): string {
    const config = mapVisualizer.getConfig();
    const validKeys = Object.keys(config).filter(
      k => k.startsWith("show") && typeof config[k as keyof typeof config] === "boolean"
    );

    if (!validKeys.includes(key)) {
      return `Invalid key: ${key}. Valid keys: ${validKeys.join(", ")}`;
    }

    const validKey = key as keyof typeof config;
    mapVisualizer.toggle(validKey);
    const newConfig = mapVisualizer.getConfig();
    const value = newConfig[validKey];
    return `Map visualization '${key}': ${value ? "ENABLED" : "DISABLED"}`;
  }

  @Command({
    name: "showMapConfig",
    description: "Show current map visualization configuration",
    usage: "showMapConfig()",
    examples: ["showMapConfig()"],
    category: "Visualization"
  })
  public showMapConfig(): string {
    const config = mapVisualizer.getConfig();
    return Object.entries(config)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join("\n");
  }

  @Command({
    name: "setVisMode",
    description: "Set visualization mode preset (debug, presentation, minimal, performance)",
    usage: "setVisMode(mode)",
    examples: [
      "setVisMode('debug')",
      "setVisMode('presentation')",
      "setVisMode('minimal')",
      "setVisMode('performance')"
    ],
    category: "Visualization"
  })
  public setVisMode(mode: string): string {
    const validModes = ["debug", "presentation", "minimal", "performance"];
    if (!validModes.includes(mode)) {
      return `Invalid mode: ${mode}. Valid modes: ${validModes.join(", ")}`;
    }

    visualizationManager.setMode(mode as "debug" | "presentation" | "minimal" | "performance");
    return `Visualization mode set to: ${mode}`;
  }

  @Command({
    name: "toggleVisLayer",
    description: "Toggle a specific visualization layer",
    usage: "toggleVisLayer(layer)",
    examples: [
      "toggleVisLayer('pheromones')",
      "toggleVisLayer('paths')",
      "toggleVisLayer('defense')",
      "toggleVisLayer('economy')",
      "toggleVisLayer('performance')"
    ],
    category: "Visualization"
  })
  public toggleVisLayer(layer: string): string {
    const layerMap: Record<string, number> = {
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
      return `Unknown layer: ${layer}. Valid layers: ${Object.keys(layerMap).join(", ")}`;
    }

    visualizationManager.toggleLayer(vizLayer);
    const enabled = visualizationManager.isLayerEnabled(vizLayer);
    return `Layer ${layer}: ${enabled ? "enabled" : "disabled"}`;
  }

  @Command({
    name: "showVisPerf",
    description: "Show visualization performance metrics",
    usage: "showVisPerf()",
    examples: ["showVisPerf()"],
    category: "Visualization"
  })
  public showVisPerf(): string {
    const metrics = visualizationManager.getPerformanceMetrics();
    
    let result = "=== Visualization Performance ===\n";
    result += `Total CPU: ${metrics.totalCost.toFixed(3)}\n`;
    result += `% of Budget: ${metrics.percentOfBudget.toFixed(2)}%\n`;
    result += "\nPer-Layer Costs:\n";
    
    for (const [layer, cost] of Object.entries(metrics.layerCosts)) {
      const costValue = cost as number;
      if (costValue > 0) {
        result += `  ${layer}: ${costValue.toFixed(3)} CPU\n`;
      }
    }
    
    return result;
  }

  @Command({
    name: "showVisConfig",
    description: "Show current visualization configuration",
    usage: "showVisConfig()",
    examples: ["showVisConfig()"],
    category: "Visualization"
  })
  public showVisConfig(): string {
    const config = visualizationManager.getConfig();
    
    let result = "=== Visualization Configuration ===\n";
    result += `Mode: ${config.mode}\n`;
    result += "\nEnabled Layers:\n";
    
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
      result += `  ${name}: ${enabled ? "✓" : "✗"}\n`;
    }
    
    return result;
  }

  @Command({
    name: "clearVisCache",
    description: "Clear visualization cache",
    usage: "clearVisCache(roomName?)",
    examples: ["clearVisCache()", "clearVisCache('W1N1')"],
    category: "Visualization"
  })
  public clearVisCache(roomName?: string): string {
    visualizationManager.clearCache(roomName);
    
    if (roomName) {
      return `Visualization cache cleared for room: ${roomName}`;
    }
    return "All visualization caches cleared";
  }
}
