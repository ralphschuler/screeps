/**
 * Visualization Manager
 *
 * Manages visualization configuration, caching, and performance tracking.
 * Implements flag-based layer toggles and preset modes.
 *
 * Addresses TODOs from roomVisualizer.ts:
 * - Interactive visualization toggles via flags
 * - Visualization layers with independent control
 * - Visualization caching
 * - Performance impact tracking
 * - Visualization presets
 */

import { createLogger } from "@ralphschuler/screeps-core";
import { VisualizationConfig, VisualizationLayer, VisualizationMode } from "../memory/schemas";

const logger = createLogger("VisualizationManager");

/**
 * Cache TTL in ticks
 */
const CACHE_TTL = 100;

/**
 * Performance tracking sample size
 */
const PERF_SAMPLE_SIZE = 10;

/**
 * Visualization Manager
 */
export class VisualizationManager {
  private config: VisualizationConfig;
  private perfSamples: Record<string, number[]> = {};

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from Memory
   */
  private loadConfig(): VisualizationConfig {
    const mem = Memory as unknown as Record<string, unknown>;
    if (!mem.visualConfig) {
      mem.visualConfig = this.createDefaultConfig();
    }
    return mem.visualConfig as VisualizationConfig;
  }

  /**
   * Save configuration to Memory
   */
  private saveConfig(): void {
    const mem = Memory as unknown as Record<string, unknown>;
    mem.visualConfig = this.config;
  }

  /**
   * Create default configuration
   */
  private createDefaultConfig(): VisualizationConfig {
    return {
      enabledLayers: VisualizationLayer.Pheromones | VisualizationLayer.Defense,
      mode: "presentation",
      layerCosts: {
        pheromones: 0,
        paths: 0,
        traffic: 0,
        defense: 0,
        economy: 0,
        construction: 0
      },
      totalCost: 0,
      cache: {
        terrain: {},
        structures: {}
      },
      lastCacheClear: Game.time
    };
  }

  /**
   * Check if a layer is enabled
   */
  public isLayerEnabled(layer: VisualizationLayer): boolean {
    return (this.config.enabledLayers & layer) !== 0;
  }

  /**
   * Enable a layer
   */
  public enableLayer(layer: VisualizationLayer): void {
    this.config.enabledLayers |= layer;
    this.saveConfig();
  }

  /**
   * Disable a layer
   */
  public disableLayer(layer: VisualizationLayer): void {
    this.config.enabledLayers &= ~layer;
    this.saveConfig();
  }

  /**
   * Toggle a layer
   */
  public toggleLayer(layer: VisualizationLayer): void {
    this.config.enabledLayers ^= layer;
    this.saveConfig();
  }

  /**
   * Set visualization mode (applies preset layer configuration)
   */
  public setMode(mode: VisualizationMode): void {
    this.config.mode = mode;

    switch (mode) {
      case "debug":
        // All layers enabled
        this.config.enabledLayers = 
          VisualizationLayer.Pheromones |
          VisualizationLayer.Paths |
          VisualizationLayer.Traffic |
          VisualizationLayer.Defense |
          VisualizationLayer.Economy |
          VisualizationLayer.Construction |
          VisualizationLayer.Performance;
        break;

      case "presentation":
        // Clean visuals, no debug info
        this.config.enabledLayers = 
          VisualizationLayer.Pheromones |
          VisualizationLayer.Defense |
          VisualizationLayer.Economy;
        break;

      case "minimal":
        // Only critical alerts
        this.config.enabledLayers = VisualizationLayer.Defense;
        break;

      case "performance":
        // All visualizations disabled
        this.config.enabledLayers = VisualizationLayer.None;
        break;
    }

    this.saveConfig();
    logger.info(`Visualization mode set to: ${mode}`);
  }

  /**
   * Update layers based on flags
   * Flag naming: viz_{layer_name}
   * Note: Flags only ENABLE layers, they don't disable them
   * Use console commands to disable layers
   */
  public updateFromFlags(): void {
    const flags = Game.flags;
    const flagLayers: Record<string, VisualizationLayer> = {
      viz_pheromones: VisualizationLayer.Pheromones,
      viz_paths: VisualizationLayer.Paths,
      viz_traffic: VisualizationLayer.Traffic,
      viz_defense: VisualizationLayer.Defense,
      viz_economy: VisualizationLayer.Economy,
      viz_construction: VisualizationLayer.Construction,
      viz_performance: VisualizationLayer.Performance
    };

    // Check each flag type
    for (const [flagName, layer] of Object.entries(flagLayers)) {
      const flagExists = Object.values(flags).some(f => f.name === flagName);
      
      // Only enable if flag exists and layer not already enabled
      if (flagExists && !this.isLayerEnabled(layer)) {
        this.enableLayer(layer);
        logger.info(`Enabled layer ${VisualizationLayer[layer]} via flag`);
      }
      // Note: Flags don't disable layers - use console commands for that
      // This prevents flags from overriding manual console settings
    }
  }

  /**
   * Track CPU cost for a layer
   */
  public trackLayerCost(layerName: keyof VisualizationConfig["layerCosts"], cost: number): void {
    // Initialize sample array if needed
    if (!this.perfSamples[layerName]) {
      this.perfSamples[layerName] = [];
    }

    // Add sample
    this.perfSamples[layerName].push(cost);

    // Keep only last N samples
    if (this.perfSamples[layerName].length > PERF_SAMPLE_SIZE) {
      this.perfSamples[layerName].shift();
    }

    // Calculate rolling average
    const samples = this.perfSamples[layerName];
    const average = samples.reduce((sum, val) => sum + val, 0) / samples.length;
    this.config.layerCosts[layerName] = average;

    // Update total cost
    this.config.totalCost = Object.values(this.config.layerCosts).reduce((sum, val) => sum + val, 0);

    // Warn if visualization cost is high
    const cpuLimit = Game.cpu.limit;
    const visualPercent = (this.config.totalCost / cpuLimit) * 100;
    if (visualPercent > 10) {
      logger.warn(`Visualization using ${visualPercent.toFixed(1)}% of CPU budget`);
    }
  }

  /**
   * Get cached terrain data
   */
  public getCachedTerrain(roomName: string): string | null {
    const cached = this.config.cache.terrain[roomName];
    if (!cached || Game.time > cached.ttl) {
      return null;
    }
    return cached.data;
  }

  /**
   * Cache terrain data
   */
  public cacheTerrain(roomName: string, data: string): void {
    this.config.cache.terrain[roomName] = {
      data,
      ttl: Game.time + CACHE_TTL
    };
  }

  /**
   * Get cached structure positions
   */
  public getCachedStructures(roomName: string): { x: number; y: number; type: StructureConstant }[] | null {
    const cached = this.config.cache.structures[roomName];
    if (!cached || Game.time > cached.ttl) {
      return null;
    }
    return cached.data;
  }

  /**
   * Cache structure positions
   */
  public cacheStructures(roomName: string, data: { x: number; y: number; type: StructureConstant }[]): void {
    this.config.cache.structures[roomName] = {
      data,
      ttl: Game.time + CACHE_TTL
    };
  }

  /**
   * Clear cache (call when structures change)
   */
  public clearCache(roomName?: string): void {
    if (roomName) {
      delete this.config.cache.terrain[roomName];
      delete this.config.cache.structures[roomName];
    } else {
      this.config.cache = {
        terrain: {},
        structures: {}
      };
      this.config.lastCacheClear = Game.time;
    }
    this.saveConfig();
  }

  /**
   * Get current configuration (for display)
   */
  public getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    totalCost: number;
    layerCosts: Record<string, number>;
    percentOfBudget: number;
  } {
    const cpuLimit = Game.cpu.limit;
    return {
      totalCost: this.config.totalCost,
      layerCosts: { ...this.config.layerCosts },
      percentOfBudget: (this.config.totalCost / cpuLimit) * 100
    };
  }

  /**
   * Measure CPU cost of a function
   */
  public measureCost<T>(fn: () => T): { result: T; cost: number } {
    const startCpu = Game.cpu.getUsed();
    const result = fn();
    const cost = Game.cpu.getUsed() - startCpu;
    return { result, cost };
  }
}

/**
 * Global visualization manager instance
 */
export const visualizationManager = new VisualizationManager();
