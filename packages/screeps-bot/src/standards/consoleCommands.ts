/**
 * Console commands for Screepers Standards management
 * Provides easy interface for managing protocols and segments
 */

import { ProtocolRegistry } from "./ProtocolRegistry";
import { SS1SegmentManager } from "./SS1SegmentManager";
import { PortalsProtocol } from "./segment-protocols/PortalsProtocol";
import { RoomNeedsProtocol } from "./segment-protocols/RoomNeedsProtocol";
import { ResourceRequestProtocol } from "./terminal-protocols/ResourceRequestProtocol";

/**
 * Standards console commands
 */
export const standardsCommands = {
  /**
   * Show help for standards commands
   */
  help(): string {
    return `
Screepers Standards Console Commands:
  
SS1 Segment Management:
  standards.metrics()                    - Show segment read/write metrics
  standards.resetMetrics()               - Reset all metrics
  standards.discover(maxDistance?)       - Discover nearby player segments
  standards.updateSegment()              - Manually update segment with active protocols
  
Protocol Management:
  standards.listProtocols()              - List all registered protocols
  standards.enableProtocol(name)         - Enable a protocol
  standards.disableProtocol(name)        - Disable a protocol
  standards.initProtocols()              - Initialize default protocols
  
Protocol Actions:
  standards.advertisePortals()           - Auto-scan and advertise portals
  standards.advertiseNeeds()             - Auto-calculate and advertise room needs
  standards.processTransfers()           - Process queued resource transfers
  
Discovery:
  standards.listPlayerChannels(username) - List channels from a player
  standards.getPlayerPortals(username)   - Get portals shared by player
  standards.getPlayerNeeds(username)     - Get needs advertised by player
  
Examples:
  standards.enableProtocol('portals')
  standards.updateSegment()
  standards.discover(5)
  standards.metrics()
`;
  },

  /**
   * Show current metrics
   */
  metrics(): string {
    return SS1SegmentManager.getMetricsSummary();
  },

  /**
   * Reset metrics
   */
  resetMetrics(): string {
    SS1SegmentManager.resetMetrics();
    return "Metrics reset successfully";
  },

  /**
   * Discover nearby players
   */
  discover(maxDistance?: number): string {
    const discovered = SS1SegmentManager.discoverNearbyPlayers(maxDistance);
    
    if (discovered.size === 0) {
      return "No nearby players discovered";
    }

    let output = `Discovered ${discovered.size} nearby players:\n`;
    for (const [username, channels] of discovered) {
      output += `  ${username}: ${channels.join(", ")}\n`;
    }
    return output;
  },

  /**
   * Update segment with active protocols
   */
  updateSegment(): string {
    const success = ProtocolRegistry.updateSegment(true, true);
    return success 
      ? "Segment updated successfully" 
      : "Segment update failed or throttled";
  },

  /**
   * List all protocols
   */
  listProtocols(): string {
    const protocols = ProtocolRegistry.listProtocols();
    
    if (protocols.length === 0) {
      return "No protocols registered. Run standards.initProtocols() first.";
    }

    let output = "Registered Protocols:\n";
    for (const protocol of protocols) {
      const status = protocol.enabled ? "✓ enabled" : "✗ disabled";
      output += `  ${protocol.name} (${protocol.version}) - ${status}\n`;
    }
    return output;
  },

  /**
   * Enable a protocol
   */
  enableProtocol(name: string): string {
    ProtocolRegistry.enableProtocol(name);
    return `Protocol '${name}' enabled`;
  },

  /**
   * Disable a protocol
   */
  disableProtocol(name: string): string {
    ProtocolRegistry.disableProtocol(name);
    return `Protocol '${name}' disabled`;
  },

  /**
   * Initialize default protocols
   */
  initProtocols(): string {
    ProtocolRegistry.initializeDefaults();
    return "Default protocols initialized:\n" + this.listProtocols();
  },

  /**
   * Auto-advertise portals
   */
  advertisePortals(): string {
    const success = PortalsProtocol.autoAdvertisePortals();
    return success 
      ? "Portals advertised successfully" 
      : "No portals found to advertise";
  },

  /**
   * Auto-advertise room needs
   */
  advertiseNeeds(): string {
    const success = RoomNeedsProtocol.autoAdvertiseNeeds();
    return success 
      ? "Room needs advertised successfully" 
      : "No needs found to advertise";
  },

  /**
   * Process queued resource transfers
   */
  processTransfers(): string {
    ResourceRequestProtocol.processQueuedTransfers();
    const count = Memory.resourceTransfers?.length || 0;
    return count > 0 
      ? `Processed transfers, ${count} remaining in queue` 
      : "All transfers processed";
  },

  /**
   * List channels from a player
   */
  listPlayerChannels(username: string): string {
    SS1SegmentManager.requestPlayerSegment(username);
    const channels = SS1SegmentManager.listPlayerChannels(username);
    
    if (channels.length === 0) {
      return `No channels found for ${username} (may need to wait a tick for segment data)`;
    }

    return `${username} channels:\n  ${channels.join("\n  ")}`;
  },

  /**
   * Get portals from a player
   */
  getPlayerPortals(username: string): string {
    const portals = PortalsProtocol.readPortals(username);
    
    if (!portals || portals.length === 0) {
      return `No portals found for ${username}`;
    }

    let output = `${username} portals (${portals.length}):\n`;
    for (const portal of portals) {
      const dest = portal.destination || "unknown";
      const unstable = portal.unstable ? " [UNSTABLE]" : "";
      output += `  ${portal.room} (${portal.pos.x},${portal.pos.y}) -> ${dest}${unstable}\n`;
    }
    return output;
  },

  /**
   * Get needs from a player
   */
  getPlayerNeeds(username: string): string {
    const needs = RoomNeedsProtocol.readNeeds(username);
    
    if (!needs || needs.length === 0) {
      return `No needs found for ${username}`;
    }

    let output = `${username} needs (${needs.length}):\n`;
    for (const need of needs) {
      const type = need.amount > 0 ? "NEED" : "SURPLUS";
      const amount = Math.abs(need.amount);
      const priority = need.priority ? ` [P${need.priority}]` : "";
      output += `  ${need.room}: ${type} ${amount} ${need.resource}${priority}\n`;
    }
    return output;
  },
};

/**
 * Install standards commands to global
 */
export function installStandardsCommands(): void {
  // @ts-ignore: Adding to global
  global.standards = standardsCommands;
  console.log("Standards commands installed. Type 'standards.help()' for usage.");
}
