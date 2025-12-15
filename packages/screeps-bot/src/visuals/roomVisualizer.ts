/**
 * Room Visualizer
 *
 * Provides in-game visualization using RoomVisual:
 * - Pheromone heatmaps
 * - Path and traffic visualization
 * - Blueprint overlay
 * - Combat information
 * - Spawn queue visualization
 * - Resource flow visualization
 *
 * Features:
 * ✓ Interactive visualization toggles via flags (viz_{layer_name})
 * ✓ Visualization layers with independent control
 * ✓ 3D visualization effects for depth perception
 * ✓ Animation support for dynamic visualizations
 * ✓ Visualization caching for static elements
 * ✓ Performance impact tracking for visualizations
 * ✓ Visualization presets (debug, presentation, minimal, performance)
 *
 * Addresses Issue: #34
 */

import type { PheromoneState, SwarmState } from "../memory/schemas";
import { VisualizationLayer } from "../memory/schemas";
import { memoryManager } from "../memory/manager";
import { createLogger } from "../core/logger";
import { visualizationManager } from "./visualizationManager";

const logger = createLogger("RoomVisualizer");

/**
 * Visualization configuration
 */
export interface VisualizerConfig {
  /** Enable pheromone visualization */
  showPheromones: boolean;
  /** Enable path visualization */
  showPaths: boolean;
  /** Enable combat info */
  showCombat: boolean;
  /** Enable resource flow */
  showResourceFlow: boolean;
  /** Enable spawn queue */
  showSpawnQueue: boolean;
  /** Enable room stats */
  showRoomStats: boolean;
  /** Enable enhanced structure visualization */
  showStructures: boolean;
  /** Opacity for overlays */
  opacity: number;
}

const DEFAULT_CONFIG: VisualizerConfig = {
  showPheromones: true,
  showPaths: false,
  showCombat: true,
  showResourceFlow: false,
  showSpawnQueue: true,
  showRoomStats: true,
  showStructures: false,
  opacity: 0.5
};

/**
 * Color schemes for pheromones
 */
const PHEROMONE_COLORS: Record<keyof PheromoneState, string> = {
  expand: "#00ff00", // Green
  harvest: "#ffff00", // Yellow
  build: "#ff8800", // Orange
  upgrade: "#0088ff", // Blue
  defense: "#ff0000", // Red
  war: "#ff00ff", // Magenta
  siege: "#880000", // Dark red
  logistics: "#00ffff", // Cyan
  nukeTarget: "#ff0088" // Pink
};

/**
 * Room Visualizer Class
 */
export class RoomVisualizer {
  private config: VisualizerConfig;

  public constructor(config: Partial<VisualizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Draw all visualizations for a room
   */
  public draw(room: Room): void {
    const visual = new RoomVisual(room.name);
    const swarm = memoryManager.getOrInitSwarmState(room.name);

    // Update from flags every tick
    visualizationManager.updateFromFlags();

    if (this.config.showRoomStats) {
      this.drawRoomStats(visual, room, swarm);
    }

    // Draw layers based on visualization manager configuration
    if (this.config.showPheromones && visualizationManager.isLayerEnabled(VisualizationLayer.Pheromones) && swarm) {
      const { cost } = visualizationManager.measureCost(() => {
        this.drawPheromoneBars(visual, swarm);
        this.drawPheromoneHeatmap(visual, swarm);
      });
      visualizationManager.trackLayerCost("pheromones", cost);
    }

    if (this.config.showCombat && visualizationManager.isLayerEnabled(VisualizationLayer.Defense)) {
      const { cost } = visualizationManager.measureCost(() => {
        this.drawCombatInfo(visual, room);
      });
      visualizationManager.trackLayerCost("defense", cost);
    }

    if (this.config.showSpawnQueue) {
      this.drawSpawnQueue(visual, room);
    }

    if (this.config.showResourceFlow && visualizationManager.isLayerEnabled(VisualizationLayer.Economy)) {
      const { cost } = visualizationManager.measureCost(() => {
        this.drawResourceFlow(visual, room);
      });
      visualizationManager.trackLayerCost("economy", cost);
    }

    if (this.config.showPaths && visualizationManager.isLayerEnabled(VisualizationLayer.Paths)) {
      const { cost } = visualizationManager.measureCost(() => {
        this.drawTrafficPaths(visual, room);
      });
      visualizationManager.trackLayerCost("paths", cost);
    }

    if (this.config.showStructures && visualizationManager.isLayerEnabled(VisualizationLayer.Construction)) {
      const { cost } = visualizationManager.measureCost(() => {
        this.drawEnhancedStructures(visual, room);
      });
      visualizationManager.trackLayerCost("construction", cost);
    }

    // Always draw collection point if available
    if (swarm?.collectionPoint) {
      this.drawCollectionPoint(visual, swarm);
    }

    // Draw performance metrics if enabled
    if (visualizationManager.isLayerEnabled(VisualizationLayer.Performance)) {
      this.drawPerformanceMetrics(visual);
    }
  }

  /**
   * Draw room statistics panel
   */
  private drawRoomStats(visual: RoomVisual, room: Room, swarm?: SwarmState): void {
    const x = 0.5;
    let y = 0.5;
    const lineHeight = 0.6;

    // Background
    visual.rect(0, 0, 8, 6.5, {
      fill: "#000000",
      opacity: 0.7,
      stroke: "#ffffff",
      strokeWidth: 0.05
    });

    // Room name and RCL
    const rcl = room.controller?.level ?? 0;
    const progress = room.controller
      ? `${Math.round((room.controller.progress / room.controller.progressTotal) * 100)}%`
      : "N/A";
    visual.text(`${room.name} | RCL ${rcl} (${progress})`, x, y, {
      align: "left",
      font: "0.5 monospace",
      color: "#ffffff"
    });
    y += lineHeight;

    // Energy
    const energy = room.energyAvailable;
    const energyMax = room.energyCapacityAvailable;
    const energyPercent = energyMax > 0 ? Math.round((energy / energyMax) * 100) : 0;
    visual.text(`Energy: ${energy}/${energyMax} (${energyPercent}%)`, x, y, {
      align: "left",
      font: "0.4 monospace",
      color: "#ffff00"
    });
    y += lineHeight;

    // Storage
    if (room.storage) {
      const storageEnergy = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
      visual.text(`Storage: ${Math.round(storageEnergy / 1000)}k energy`, x, y, {
        align: "left",
        font: "0.4 monospace",
        color: "#00ff00"
      });
      y += lineHeight;
    }

    // Swarm state
    if (swarm) {
      visual.text(`Stage: ${swarm.colonyLevel}`, x, y, {
        align: "left",
        font: "0.4 monospace",
        color: "#00ffff"
      });
      y += lineHeight;

      const dangerColors = ["#00ff00", "#ffff00", "#ff8800", "#ff0000"];
      visual.text(`Posture: ${swarm.posture} | Danger: ${swarm.danger}`, x, y, {
        align: "left",
        font: "0.4 monospace",
        color: dangerColors[swarm.danger] ?? "#ffffff"
      });
      y += lineHeight;
    }

    // Creep count
    const creeps = room.find(FIND_MY_CREEPS).length;
    const hostiles = room.find(FIND_HOSTILE_CREEPS).length;
    visual.text(`Creeps: ${creeps} | Hostiles: ${hostiles}`, x, y, {
      align: "left",
      font: "0.4 monospace",
      color: hostiles > 0 ? "#ff0000" : "#ffffff"
    });
    y += lineHeight;

    // CPU
    const cpu = Game.cpu.getUsed().toFixed(1);
    const bucket = Game.cpu.bucket;
    visual.text(`CPU: ${cpu} | Bucket: ${bucket}`, x, y, {
      align: "left",
      font: "0.4 monospace",
      color: bucket < 3000 ? "#ff8800" : "#ffffff"
    });
  }

  /**
   * Draw pheromone bars
   */
  private drawPheromoneBars(visual: RoomVisual, swarm: SwarmState): void {
    const x = 42;
    let y = 0.5;
    const barWidth = 6;
    const barHeight = 0.4;

    // Background
    visual.rect(41.5, 0, 8, 5.5, {
      fill: "#000000",
      opacity: 0.7,
      stroke: "#ffffff",
      strokeWidth: 0.05
    });

    visual.text("Pheromones", x + 3, y, {
      align: "center",
      font: "0.5 monospace",
      color: "#ffffff"
    });
    y += 0.6;

    const maxValue = 100;

    for (const [key, value] of Object.entries(swarm.pheromones) as [keyof PheromoneState, number][]) {
      const color = PHEROMONE_COLORS[key];
      const fillWidth = Math.min(1, value / maxValue) * barWidth;

      // Background bar
      visual.rect(x, y, barWidth, barHeight, {
        fill: "#333333",
        opacity: 0.8
      });

      // Fill bar
      if (fillWidth > 0) {
        visual.rect(x, y, fillWidth, barHeight, {
          fill: color,
          opacity: this.config.opacity
        });
      }

      // Label
      visual.text(`${key}: ${Math.round(value)}`, x - 0.2, y + 0.35, {
        align: "right",
        font: "0.35 monospace",
        color
      });

      y += 0.5;
    }
  }

  /**
   * Minimum pheromone value to display in heatmap
   */
  private static readonly HEATMAP_MIN_THRESHOLD = 10;

  /**
   * Draw pheromone heatmap overlay
   */
  private drawPheromoneHeatmap(visual: RoomVisual, swarm: SwarmState): void {
    // Find dominant pheromone (highest value)
    let maxPheromone: keyof PheromoneState | null = null;
    let maxValue = RoomVisualizer.HEATMAP_MIN_THRESHOLD;

    for (const [key, value] of Object.entries(swarm.pheromones) as [keyof PheromoneState, number][]) {
      if (value > maxValue) {
        maxValue = value;
        maxPheromone = key;
      }
    }

    // Only draw if there's a significant dominant pheromone
    if (!maxPheromone || maxValue < RoomVisualizer.HEATMAP_MIN_THRESHOLD) return;

    // TypeScript now knows maxPheromone is not null here
    const color = PHEROMONE_COLORS[maxPheromone];
    const intensity = Math.min(1, maxValue / 100) * 0.15; // Scale opacity

    // Draw room-wide overlay in top-right corner
    visual.rect(40, 10, 8, 5, {
      fill: color,
      opacity: intensity
    });

    visual.text(`Dominant: ${maxPheromone}`, 44, 12.5, {
      align: "center",
      font: "0.5 monospace",
      color
    });

    visual.text(`Intensity: ${Math.round(maxValue)}`, 44, 13.5, {
      align: "center",
      font: "0.4 monospace",
      color: "#ffffff"
    });
  }

  /**
   * Draw combat information with animated markers and 3D depth effects
   */
  private drawCombatInfo(visual: RoomVisual, room: Room): void {
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    // Draw circles around hostiles with threat level
    for (const hostile of hostiles) {
      const threat = this.calculateCreepThreat(hostile);
      const color = threat > 30 ? "#ff0000" : threat > 10 ? "#ff8800" : "#ffff00";

      // 3D effect: Size variation based on threat level
      const radius = 0.4 + (threat / 100);
      const opacity = 0.2 + (threat / 100) * 0.3; // Higher threat = more visible

      visual.circle(hostile.pos, {
        radius,
        fill: color,
        opacity,
        stroke: color,
        strokeWidth: 0.1
      });

      visual.text(`T:${threat}`, hostile.pos.x, hostile.pos.y - 0.8, {
        font: "0.4 monospace",
        color
      });

      // Animated pulsing effect for high-threat hostiles
      if (threat > 20) {
        visual.animatedPosition(hostile.pos.x, hostile.pos.y, {
          color,
          opacity: 0.8,
          radius: 1.0,
          frames: 8
        });
      }
    }

    // Draw tower ranges if under attack with 3D depth
    if (hostiles.length > 0) {
      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_TOWER
      }) ;

      for (const tower of towers) {
        // 3D effect: Layer ranges with decreasing opacity
        // Optimal range (full damage) - elevated/bright
        visual.circle(tower.pos, {
          radius: 5,
          fill: "#00ff00",
          opacity: 0.15, // Increased from 0.1 for elevation effect
          stroke: "#00ff00",
          strokeWidth: 0.05
        });

        // Medium range - ground level
        visual.circle(tower.pos, {
          radius: 10,
          fill: "#ffff00",
          opacity: 0.08, // Reduced for depth
          stroke: "#ffff00",
          strokeWidth: 0.05
        });
      }
    }
  }

  /**
   * Calculate threat level of a creep
   */
  private calculateCreepThreat(creep: Creep): number {
    let threat = 0;
    for (const part of creep.body) {
      if (!part.hits) continue;
      switch (part.type) {
        case ATTACK:
          threat += 5 * (part.boost ? 4 : 1);
          break;
        case RANGED_ATTACK:
          threat += 4 * (part.boost ? 4 : 1);
          break;
        case HEAL:
          threat += 6 * (part.boost ? 4 : 1);
          break;
        case TOUGH:
          threat += 1 * (part.boost ? 4 : 1);
          break;
        case WORK:
          threat += 2 * (part.boost ? 4 : 1);
          break;
      }
    }
    return threat;
  }

  /**
   * Draw spawn queue visualization with enhanced speech bubbles
   */
  private drawSpawnQueue(visual: RoomVisual, room: Room): void {
    const spawns = room.find(FIND_MY_SPAWNS);

    for (const spawn of spawns) {
      if (spawn.spawning) {
        const creep = Game.creeps[spawn.spawning.name];
        const progress = 1 - spawn.spawning.remainingTime / spawn.spawning.needTime;

        // Progress bar above spawn
        const barWidth = 2;
        const barHeight = 0.3;
        const barX = spawn.pos.x - 1;
        const barY = spawn.pos.y - 1.5;

        visual.rect(barX, barY, barWidth, barHeight, {
          fill: "#333333",
          opacity: 0.8
        });

        visual.rect(barX, barY, barWidth * progress, barHeight, {
          fill: "#00ff00",
          opacity: 0.8
        });

        // Use speech bubble for spawning creep
        const memory = creep?.memory as unknown as { role?: string };
        const role = memory?.role ?? spawn.spawning.name;
        visual.speech(role, spawn.pos.x, spawn.pos.y, {
          background: "#2ccf3b",
          textcolor: "#000000",
          textsize: 0.4,
          opacity: 0.9
        });

        // Show animated marker for new spawns in first few ticks
        if (spawn.spawning.remainingTime > spawn.spawning.needTime - 5) {
          visual.animatedPosition(spawn.pos.x, spawn.pos.y, {
            color: "#00ff00",
            opacity: 0.6,
            radius: 1.2,
            frames: 10
          });
        }
      }
    }
  }

  /**
   * Draw resource flow arrows and resource badges with animation
   */
  private drawResourceFlow(visual: RoomVisual, room: Room): void {
    const storage = room.storage;
    if (!storage) return;

    // Draw animated arrows from sources to storage
    const sources = room.find(FIND_SOURCES);
    for (const source of sources) {
      this.drawFlowingArrow(visual, source.pos, storage.pos, "#ffff00", 0.3);
      // Draw energy badge at midpoint
      const midX = (source.pos.x + storage.pos.x) / 2;
      const midY = (source.pos.y + storage.pos.y) / 2;
      visual.resource(RESOURCE_ENERGY, midX, midY, 0.2);
    }

    // Draw animated arrows from storage to spawns
    const spawns = room.find(FIND_MY_SPAWNS);
    for (const spawn of spawns) {
      if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        this.drawFlowingArrow(visual, storage.pos, spawn.pos, "#00ff00", 0.3);
      }
    }

    // Draw animated arrows from storage to controller
    const controller = room.controller;
    if (controller) {
      this.drawFlowingArrow(visual, storage.pos, controller.pos, "#00ffff", 0.3);
    }

    // Draw resource badges for major resources in storage
    if (storage.store.getUsedCapacity() > 0) {
      let offsetX = 0.8;
      const offsetY = -0.8;
      
      // Show top 3 resources by quantity
      const resources = Object.keys(storage.store) as ResourceConstant[];
      const sorted = resources
        .filter(r => storage.store[r] > 1000)
        .sort((a, b) => storage.store[b] - storage.store[a])
        .slice(0, 3);
      
      for (const resource of sorted) {
        visual.resource(resource, storage.pos.x + offsetX, storage.pos.y + offsetY, 0.3);
        offsetX += 0.6;
      }
    }

    // Draw resource badges for terminal if available
    const terminal = room.terminal;
    if (terminal && terminal.store.getUsedCapacity() > 0) {
      let offsetX = 0.8;
      const offsetY = -0.8;
      
      // Show top 3 resources by quantity
      const resources = Object.keys(terminal.store) as ResourceConstant[];
      const sorted = resources
        .filter(r => terminal.store[r] > 1000)
        .sort((a, b) => terminal.store[b] - terminal.store[a])
        .slice(0, 3);
      
      for (const resource of sorted) {
        visual.resource(resource, terminal.pos.x + offsetX, terminal.pos.y + offsetY, 0.3);
        offsetX += 0.6;
      }
    }
  }

  /**
   * Draw an animated flowing arrow between two positions
   */
  private drawFlowingArrow(
    visual: RoomVisual,
    from: RoomPosition,
    to: RoomPosition,
    color: string,
    opacity: number
  ): void {
    // Base line
    visual.line(from, to, {
      color,
      opacity: opacity * 0.5,
      width: 0.1,
      lineStyle: "dashed"
    });

    // Animated flow indicator (moves along the line)
    const frame = Game.time % 20;
    const progress = frame / 20;
    const flowX = from.x + (to.x - from.x) * progress;
    const flowY = from.y + (to.y - from.y) * progress;

    visual.circle(flowX, flowY, {
      radius: 0.15,
      fill: color,
      opacity: opacity
    });
  }

  /**
   * Draw an arrow between two positions
   */
  private drawArrow(
    visual: RoomVisual,
    from: RoomPosition,
    to: RoomPosition,
    color: string,
    opacity: number
  ): void {
    visual.line(from, to, {
      color,
      opacity,
      width: 0.1,
      lineStyle: "dashed"
    });
  }

  /**
   * Draw enhanced structure visualization with 3D depth effects
   * Uses the new structure() method from roomVisualExtensions
   */
  private drawEnhancedStructures(visual: RoomVisual, room: Room): void {
    // Use cached structure positions if available
    const cached = visualizationManager.getCachedStructures(room.name);
    
    if (cached) {
      // Draw from cache
      for (const struct of cached) {
        const opacity = this.getStructureDepthOpacity(struct.type);
        visual.structure(struct.x, struct.y, struct.type, { opacity });
      }
    } else {
      // Draw and cache
      const structures = room.find(FIND_STRUCTURES);
      const structureData: Array<{ x: number; y: number; type: StructureConstant }> = [];
      
      for (const structure of structures) {
        const opacity = this.getStructureDepthOpacity(structure.structureType);
        visual.structure(structure.pos.x, structure.pos.y, structure.structureType, { opacity });
        structureData.push({
          x: structure.pos.x,
          y: structure.pos.y,
          type: structure.structureType
        });
      }
      
      // Cache for next time
      visualizationManager.cacheStructures(room.name, structureData);
    }

    // Draw construction sites with lower opacity (ground level)
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    for (const site of sites) {
      visual.structure(site.pos.x, site.pos.y, site.structureType, {
        opacity: 0.3 // Ground level blueprint
      });
    }
  }

  /**
   * Get 3D depth opacity for structure types
   */
  private getStructureDepthOpacity(type: StructureConstant): number {
    // 3D depth effect: Opacity indicates elevation
    switch (type) {
      case STRUCTURE_RAMPART:
        return 0.8; // Elevated defensive structure
      case STRUCTURE_TOWER:
        return 0.9; // Tall structure
      case STRUCTURE_SPAWN:
      case STRUCTURE_STORAGE:
      case STRUCTURE_TERMINAL:
        return 0.85; // Important/large structures
      case STRUCTURE_ROAD:
        return 0.3; // Ground level
      case STRUCTURE_WALL:
        return 0.9; // Tall barrier
      default:
        return 0.7; // Default elevation
    }
  }

  /**
   * Draw performance metrics overlay
   */
  private drawPerformanceMetrics(visual: RoomVisual): void {
    const metrics = visualizationManager.getPerformanceMetrics();
    const x = 0.5;
    let y = 7.5;
    const lineHeight = 0.5;

    // Background panel
    visual.rect(0, 7, 10, 5.5, {
      fill: "#000000",
      opacity: 0.8,
      stroke: "#ffff00",
      strokeWidth: 0.05
    });

    // Title
    visual.text("Visualization Performance", x, y, {
      align: "left",
      font: "0.5 monospace",
      color: "#ffff00"
    });
    y += lineHeight;

    // Total cost
    const costColor = metrics.percentOfBudget > 10 ? "#ff0000" : "#00ff00";
    visual.text(`Total: ${metrics.totalCost.toFixed(3)} CPU`, x, y, {
      align: "left",
      font: "0.4 monospace",
      color: costColor
    });
    y += lineHeight;

    visual.text(`(${metrics.percentOfBudget.toFixed(1)}% of budget)`, x, y, {
      align: "left",
      font: "0.35 monospace",
      color: costColor
    });
    y += lineHeight;

    // Per-layer costs
    visual.text("Layer Costs:", x, y, {
      align: "left",
      font: "0.4 monospace",
      color: "#ffffff"
    });
    y += lineHeight;

    for (const [layer, cost] of Object.entries(metrics.layerCosts)) {
      if (cost > 0) {
        visual.text(`  ${layer}: ${cost.toFixed(3)}`, x, y, {
          align: "left",
          font: "0.35 monospace",
          color: "#aaaaaa"
        });
        y += 0.4;
      }
    }
  }

  /**
   * Draw traffic paths
   */
  private drawTrafficPaths(visual: RoomVisual, room: Room): void {
    // Draw roads with usage intensity
    const roads = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_ROAD
    }) ;

    for (const road of roads) {
      // Color based on hits (more traffic = more damage)
      const hitsPercent = road.hits / road.hitsMax;
      const intensity = 1 - hitsPercent;
      const color = `hsl(${120 - intensity * 120}, 100%, 50%)`;

      visual.circle(road.pos, {
        radius: 0.2,
        fill: color,
        opacity: 0.5
      });
    }
  }

  /**
   * Draw blueprint overlay for planned structures
   * Now uses enhanced structure visualization from roomVisualExtensions
   */
  public drawBlueprint(visual: RoomVisual, blueprint: { type: StructureConstant; pos: { x: number; y: number } }[]): void {
    for (const item of blueprint) {
      // Use the enhanced structure drawing from RoomVisual extensions
      visual.structure(item.pos.x, item.pos.y, item.type, { opacity: 0.4 });
    }
  }

  /**
   * Update configuration
   */
  public setConfig(config: Partial<VisualizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): VisualizerConfig {
    return { ...this.config };
  }

  /**
   * Draw collection point marker
   */
  private drawCollectionPoint(visual: RoomVisual, swarm: SwarmState): void {
    if (!swarm.collectionPoint) return;

    const { x, y } = swarm.collectionPoint;

    // Draw a circle at the collection point
    visual.circle(x, y, {
      radius: 0.5,
      fill: "#00ff00",
      opacity: 0.3,
      stroke: "#00ff00",
      strokeWidth: 0.1
    });

    // Draw a label
    visual.text("⚓", x, y + 0.25, {
      font: "0.6 monospace",
      color: "#00ff00",
      opacity: 0.8
    });
  }

  /**
   * Toggle a specific visualization
   */
  public toggle(key: keyof VisualizerConfig): void {
    if (typeof this.config[key] === "boolean") {
      (this.config[key] as boolean) = !this.config[key];
    }
  }
}

/**
 * Global room visualizer instance
 */
export const roomVisualizer = new RoomVisualizer();
