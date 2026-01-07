/**
 * Protocol Registry for automatic channel registration
 * Manages active protocols and auto-generates SS1 channels
 */

import { SS1Channel, SS1SegmentManager } from "./SS1SegmentManager";
import { PortalsProtocol } from "./segment-protocols/PortalsProtocol";
import { RoomNeedsProtocol } from "./segment-protocols/RoomNeedsProtocol";
import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("ProtocolRegistry");

/**
 * Protocol configuration
 */
export interface ProtocolConfig {
  name: string;
  version: string;
  enabled: boolean;
  channelGenerator: () => SS1Channel | null;
}

/**
 * Protocol Registry manages active protocols
 */
export class ProtocolRegistry {
  private static protocols: Map<string, ProtocolConfig> = new Map();

  /**
   * Register a protocol
   * @param config Protocol configuration
   */
  public static registerProtocol(config: ProtocolConfig): void {
    this.protocols.set(config.name, config);
    logger.debug(`Registered protocol: ${config.name} v${config.version}`, {
      meta: { protocol: config.name, version: config.version }
    });
  }

  /**
   * Unregister a protocol
   * @param name Protocol name
   */
  public static unregisterProtocol(name: string): void {
    this.protocols.delete(name);
    logger.debug(`Unregistered protocol: ${name}`, { meta: { protocol: name } });
  }

  /**
   * Enable a protocol
   * @param name Protocol name
   */
  public static enableProtocol(name: string): void {
    const protocol = this.protocols.get(name);
    if (protocol) {
      protocol.enabled = true;
      logger.info(`Enabled protocol: ${name}`, { meta: { protocol: name } });
    }
  }

  /**
   * Disable a protocol
   * @param name Protocol name
   */
  public static disableProtocol(name: string): void {
    const protocol = this.protocols.get(name);
    if (protocol) {
      protocol.enabled = false;
      logger.info(`Disabled protocol: ${name}`, { meta: { protocol: name } });
    }
  }

  /**
   * Get all active protocols
   * @returns Map of active protocols
   */
  public static getActiveProtocols(): Map<string, ProtocolConfig> {
    const active = new Map<string, ProtocolConfig>();
    for (const [name, config] of this.protocols) {
      if (config.enabled) {
        active.set(name, config);
      }
    }
    return active;
  }

  /**
   * Generate channels from all active protocols
   * @returns Channels object for SS1
   */
  public static generateChannels(): { [channelName: string]: SS1Channel } {
    const channels: { [channelName: string]: SS1Channel } = {};
    
    for (const [name, config] of this.protocols) {
      if (!config.enabled) continue;

      try {
        const channel = config.channelGenerator();
        if (channel) {
          channels[name] = channel;
          logger.debug(`Generated channel for ${name}`, { meta: { protocol: name } });
        }
      } catch (error) {
        logger.error(`Error generating channel for ${name}: ${String(error)}`, {
          meta: { protocol: name, error: error instanceof Error ? error.message : String(error) }
        });
      }
    }

    return channels;
  }

  /**
   * Update SS1 segment with active protocols
   * @param useThrottling Use update throttling
   * @param useCompression Auto-compress large channels
   * @returns Success status
   */
  public static updateSegment(
    useThrottling: boolean = true,
    useCompression: boolean = true
  ): boolean {
    let channels = this.generateChannels();

    // Validate channels first before compression (fail fast)
    const validChannels: { [channelName: string]: SS1Channel } = {};
    for (const [name, channel] of Object.entries(channels)) {
      const validation = SS1SegmentManager.validateChannel(name, channel);
      if (validation.valid) {
        validChannels[name] = channel;
      } else {
        logger.warn(`Skipping invalid channel ${name}: ${validation.errors.join(", ")}`, {
          meta: { channel: name, errors: validation.errors }
        });
      }
    }

    // Apply compression if needed
    if (useCompression) {
      channels = SS1SegmentManager.compressChannelsIfNeeded(validChannels);
    } else {
      channels = validChannels;
    }

    // Update with or without throttling
    if (useThrottling) {
      return SS1SegmentManager.updateWithThrottling(channels);
    } else {
      return SS1SegmentManager.updateDefaultPublicSegment(channels);
    }
  }

  /**
   * Initialize default protocols
   */
  public static initializeDefaults(): void {
    // Register Portals Protocol
    this.registerProtocol({
      name: "portals",
      version: "v1.0.0",
      enabled: false, // Disabled by default
      channelGenerator: () => {
        // Auto-scan owned rooms for portals
        const allPortals = [];
        for (const roomName in Game.rooms) {
          const room = Game.rooms[roomName];
          if (!room.controller?.my) continue;
          
          const portals = PortalsProtocol.scanRoomForPortals(roomName);
          allPortals.push(...portals);
        }

        if (allPortals.length === 0) return null;

        const data = JSON.stringify(allPortals);
        return SS1SegmentManager.createChannel("portals", {
          version: "v1.0.0",
          data: data,
        });
      },
    });

    // Register Room Needs Protocol
    this.registerProtocol({
      name: "roomneeds",
      version: "v1.0.0",
      enabled: false, // Disabled by default
      channelGenerator: () => {
        // Auto-calculate room needs
        const allNeeds = [];
        
        // Default thresholds (could be configurable)
        const thresholds = {
          energy: { min: 50000, max: 500000 },
          power: { min: 1000, max: 10000 },
          [RESOURCE_HYDROGEN]: { min: 1000, max: 5000 },
          [RESOURCE_OXYGEN]: { min: 1000, max: 5000 },
        };

        for (const roomName in Game.rooms) {
          const room = Game.rooms[roomName];
          if (!room.controller?.my) continue;
          
          const needs = RoomNeedsProtocol.calculateRoomNeeds(room, thresholds);
          allNeeds.push(...needs);
        }

        if (allNeeds.length === 0) return null;

        const data = JSON.stringify(allNeeds);
        return SS1SegmentManager.createChannel("roomneeds", {
          version: "v1.0.0",
          data: data,
        });
      },
    });

    // Register Terminal Communications Protocol
    this.registerProtocol({
      name: "terminalcom",
      version: "v1.0.0",
      enabled: false, // Disabled by default
      channelGenerator: () => {
        // Auto-list terminals
        const terminals: string[] = [];
        for (const roomName in Game.rooms) {
          const room = Game.rooms[roomName];
          if (room.controller?.my && room.terminal?.my) {
            terminals.push(roomName);
          }
        }

        if (terminals.length === 0) return null;

        const data = JSON.stringify(terminals);
        return SS1SegmentManager.createChannel("terminalcom", {
          version: "v1.0.0",
          data: data,
        });
      },
    });

    logger.info("Initialized default protocols", { meta: { count: this.protocols.size } });
  }

  /**
   * List all registered protocols
   * @returns Array of protocol names with status
   */
  public static listProtocols(): Array<{ name: string; version: string; enabled: boolean }> {
    return Array.from(this.protocols.values()).map(p => ({
      name: p.name,
      version: p.version,
      enabled: p.enabled,
    }));
  }
}
