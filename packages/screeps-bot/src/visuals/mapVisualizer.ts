/**
 * Map Visualizer
 *
 * Provides map-level visualization using Game.map.visual:
 * - Room status indicators (RCL, danger level, colony type)
 * - Inter-room connections (remotes, highways, portals)
 * - Resource flow visualization
 * - Threat and expansion indicators
 * - Multi-room strategic overlays
 *
 * Complements RoomVisualizer which handles room-specific details.
 */

import { memoryManager } from "../memory/manager";
import { createLogger } from "../core/logger";

const logger = createLogger("MapVisualizer");

/**
 * Map visualization configuration
 */
export interface MapVisualizerConfig {
  /** Enable room status visualization */
  showRoomStatus: boolean;
  /** Enable inter-room connections */
  showConnections: boolean;
  /** Enable threat indicators */
  showThreats: boolean;
  /** Enable expansion candidates */
  showExpansion: boolean;
  /** Enable resource flow */
  showResourceFlow: boolean;
  /** Enable highway visualization */
  showHighways: boolean;
  /** Opacity for overlays */
  opacity: number;
}

const DEFAULT_CONFIG: MapVisualizerConfig = {
  showRoomStatus: true,
  showConnections: true,
  showThreats: true,
  showExpansion: false,
  showResourceFlow: false,
  showHighways: false,
  opacity: 0.6
};

/**
 * Color schemes for room status
 */
const DANGER_COLORS = ["#00ff00", "#ffff00", "#ff8800", "#ff0000"];
const POSTURE_COLORS: Record<string, string> = {
  eco: "#00ff00",
  expand: "#00ffff",
  defense: "#ffff00",
  war: "#ff8800",
  siege: "#ff0000",
  evacuate: "#ff00ff"
};

/**
 * Map Visualizer Class
 */
export class MapVisualizer {
  private config: MapVisualizerConfig;

  public constructor(config: Partial<MapVisualizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Draw all map visualizations
   */
  public draw(): void {
    const visual = Game.map.visual;

    if (this.config.showRoomStatus) {
      this.drawRoomStatus(visual);
    }

    if (this.config.showConnections) {
      this.drawConnections(visual);
    }

    if (this.config.showThreats) {
      this.drawThreats(visual);
    }

    if (this.config.showExpansion) {
      this.drawExpansionCandidates(visual);
    }

    if (this.config.showResourceFlow) {
      this.drawResourceFlow(visual);
    }

    if (this.config.showHighways) {
      this.drawHighways(visual);
    }
  }

  /**
   * Draw room status indicators
   */
  private drawRoomStatus(visual: MapVisual): void {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;

      const swarm = memoryManager.getOrInitSwarmState(room.name);
      const rcl = room.controller.level;
      
      // Color based on danger level (bounds-checked)
      const dangerIndex = Math.min(Math.max(swarm.danger, 0), 3);
      const color = DANGER_COLORS[dangerIndex] ?? "#ffffff";
      
      // Draw circle indicator
      const circleStyle: CircleStyle = {
        radius: 10,
        fill: color,
        opacity: this.config.opacity * 0.5,
        stroke: color,
        strokeWidth: 1
      };
      visual.circle(new RoomPosition(25, 25, room.name), circleStyle);

      // Draw RCL text
      visual.text(`RCL${rcl}`, new RoomPosition(25, 25, room.name), {
        color: "#ffffff",
        fontSize: 8,
        align: "center"
      });

      // Draw posture indicator
      if (swarm.posture !== "eco") {
        const postureColor = POSTURE_COLORS[swarm.posture] ?? "#ffffff";
        visual.text(swarm.posture.toUpperCase(), new RoomPosition(25, 30, room.name), {
          color: postureColor,
          fontSize: 6,
          align: "center"
        });
      }
    }
  }

  /**
   * Draw inter-room connections (remotes, military routes)
   */
  private drawConnections(visual: MapVisual): void {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;

      const swarm = memoryManager.getOrInitSwarmState(room.name);
      
      // Draw connections to remote rooms
      if (swarm.remoteAssignments && swarm.remoteAssignments.length > 0) {
        for (const remoteName of swarm.remoteAssignments) {
          // Draw line from home to remote
          const lineStyle: LineStyle = {
            color: "#00ffff",
            opacity: this.config.opacity * 0.8,
            width: 0.5
          };
          visual.line(
            new RoomPosition(25, 25, room.name),
            new RoomPosition(25, 25, remoteName),
            lineStyle
          );

          // Draw remote indicator
          const remoteCircleStyle: CircleStyle = {
            radius: 5,
            fill: "#00ffff",
            opacity: this.config.opacity * 0.3
          };
          visual.circle(new RoomPosition(25, 25, remoteName), remoteCircleStyle);
        }
      }

      // Draw military connections (war targets)
      if (swarm.posture === "war" || swarm.posture === "siege") {
        // Note: In a full implementation, we'd track war targets in memory
        // For now, we just show rooms with hostiles
        const hostileRooms = Object.values(Game.rooms).filter(r => 
          r.find(FIND_HOSTILE_CREEPS).length > 0 && 
          Game.map.getRoomLinearDistance(room.name, r.name) <= 5
        );

        for (const hostileRoom of hostileRooms) {
          const militaryLineStyle: LineStyle = {
            color: "#ff0000",
            opacity: this.config.opacity,
            width: 1
          };
          visual.line(
            new RoomPosition(25, 25, room.name),
            new RoomPosition(25, 25, hostileRoom.name),
            militaryLineStyle
          );
        }
      }
    }
  }

  /**
   * Draw threat indicators
   */
  private drawThreats(visual: MapVisual): void {
    for (const room of Object.values(Game.rooms)) {
      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      const hostileStructures = room.find(FIND_HOSTILE_STRUCTURES);

      if (hostiles.length > 0 || hostileStructures.length > 0) {
        const threatLevel = hostiles.length + hostileStructures.length * 2;
        const color = threatLevel > 10 ? "#ff0000" : "#ff8800";

        // Draw threat indicator
        visual.rect(new RoomPosition(20, 20, room.name), 10, 10, {
          fill: color,
          opacity: this.config.opacity * 0.5,
          stroke: color,
          strokeWidth: 1
        });

        // Draw threat count
        visual.text(`⚠${threatLevel}`, new RoomPosition(25, 25, room.name), {
          color: "#ffffff",
          fontSize: 8,
          align: "center"
        });
      }

      // Draw incoming nukes
      if (room.find(FIND_NUKES).length > 0) {
        const nukes = room.find(FIND_NUKES);
        visual.circle(new RoomPosition(25, 25, room.name), {
          radius: 15,
          fill: "#ff00ff",
          opacity: this.config.opacity * 0.7,
          stroke: "#ff00ff",
          strokeWidth: 2
        });

        visual.text(`☢${nukes.length}`, new RoomPosition(25, 25, room.name), {
          color: "#ffffff",
          fontSize: 10,
          align: "center",
          backgroundColor: "#ff00ff",
          backgroundPadding: 2
        });
      }
    }
  }

  /**
   * Draw expansion candidates
   */
  private drawExpansionCandidates(visual: MapVisual): void {
    // In a full implementation, this would query expansion manager
    // For now, we show rooms with neutral controllers near our rooms
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller || room.controller.my || room.controller.owner) continue;

      // Check if near any owned room
      const nearOwnedRoom = ownedRooms.some(
        owned => Game.map.getRoomLinearDistance(owned.name, room.name) <= 3
      );

      if (nearOwnedRoom) {
        visual.circle(new RoomPosition(25, 25, room.name), {
          radius: 8,
          fill: "#00ff00",
          opacity: this.config.opacity * 0.3,
          stroke: "#00ff00",
          strokeWidth: 0.5,
          lineStyle: "dashed"
        });

        visual.text("EXP", new RoomPosition(25, 25, room.name), {
          color: "#00ff00",
          fontSize: 6,
          align: "center"
        });
      }
    }
  }

  /**
   * Draw resource flow between rooms
   */
  private drawResourceFlow(visual: MapVisual): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    for (const room of ownedRooms) {
      if (!room.terminal) continue;

      // Show terminal activity (orders being filled)
      const orders = Game.market.orders;
      for (const orderId in orders) {
        const order = orders[orderId];
        if (order.roomName === room.name && order.remainingAmount < order.amount) {
          // Active order
          visual.circle(new RoomPosition(25, 25, room.name), {
            radius: 12,
            fill: "#ffff00",
            opacity: this.config.opacity * 0.2,
            stroke: "#ffff00",
            strokeWidth: 0.5
          });
        }
      }
    }
  }

  /**
   * Draw highway rooms
   */
  private drawHighways(visual: MapVisual): void {
    for (const room of Object.values(Game.rooms)) {
      // Check if room is a highway (rooms with 0 in coordinates)
      const match = room.name.match(/[WE](\d+)[NS](\d+)/);
      if (!match) continue;

      const x = parseInt(match[1], 10);
      const y = parseInt(match[2], 10);

      if (x % 10 === 0 || y % 10 === 0) {
        // This is a highway room
        visual.rect(new RoomPosition(0, 0, room.name), 50, 50, {
          fill: "#444444",
          opacity: this.config.opacity * 0.2
        });

        // Mark SK rooms (highways with both coords divisible by 10)
        if (x % 10 === 0 && y % 10 === 0) {
          visual.text("SK", new RoomPosition(25, 25, room.name), {
            color: "#ff8800",
            fontSize: 12,
            align: "center"
          });
        }
      }
    }
  }

  /**
   * Draw a specific room with detailed overlay
   */
  public drawRoomOverlay(roomName: string): void {
    const visual = Game.map.visual;
    const room = Game.rooms[roomName];
    
    if (!room) return;

    // Draw detailed border
    visual.rect(new RoomPosition(0, 0, roomName), 50, 50, {
      fill: "transparent",
      opacity: 1,
      stroke: "#00ffff",
      strokeWidth: 2
    });

    // Add room name label
    visual.text(roomName, new RoomPosition(25, 5, roomName), {
      color: "#00ffff",
      fontSize: 10,
      align: "center",
      backgroundColor: "#000000",
      backgroundPadding: 2
    });
  }

  /**
   * Update configuration
   */
  public setConfig(config: Partial<MapVisualizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): MapVisualizerConfig {
    return { ...this.config };
  }

  /**
   * Toggle a specific boolean visualization option
   */
  public toggle(key: keyof MapVisualizerConfig): void {
    const value = this.config[key];
    if (typeof value === "boolean") {
      (this.config[key] as boolean) = !value;
    }
    // Note: opacity is a number and cannot be toggled, use setConfig() instead
  }
}

/**
 * Global map visualizer instance
 */
export const mapVisualizer = new MapVisualizer();
