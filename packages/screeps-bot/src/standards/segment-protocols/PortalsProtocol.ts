/**
 * Segment Protocol: Portals
 * Shares portal information between players
 * Based on: https://github.com/screepers/screepers-standards/blob/master/segment_protocols/portals.md
 */

import { PortalInfo } from "../types";
import { SS1SegmentManager } from "../SS1SegmentManager";
import { createLogger } from "../../core/logger";

const logger = createLogger("PortalsProtocol");

export class PortalsProtocol {
  private static readonly PROTOCOL_NAME = "portals";
  private static readonly VERSION = "v1.0.0";

  /**
   * Advertise portal information
   * @param portals Array of portal information
   * @param segmentIds Segment IDs to use (optional)
   * @returns Success status
   */
  public static advertisePortals(
    portals: PortalInfo[],
    segmentIds?: number[]
  ): boolean {
    const data = JSON.stringify(portals);
    
    const channel = SS1SegmentManager.createChannel(this.PROTOCOL_NAME, {
      version: this.VERSION,
      data: data,
      segments: segmentIds,
    });

    return SS1SegmentManager.updateDefaultPublicSegment({
      [this.PROTOCOL_NAME]: channel,
    });
  }

  /**
   * Read portal information from a player
   * @param username Player username
   * @returns Array of portals or null
   */
  public static readPortals(username: string): PortalInfo[] | null {
    const channel = SS1SegmentManager.getPlayerChannel(
      username,
      this.PROTOCOL_NAME
    );

    if (!channel || !channel.data) {
      return null;
    }

    try {
      let data = channel.data;
      
      // Decompress if needed
      if (channel.compressed) {
        data = SS1SegmentManager.decompressData(data);
      }

      return JSON.parse(data) as PortalInfo[];
    } catch (error) {
      console.log(`[Portals] Error reading portals from ${username}: ${error}`);
      return null;
    }
  }

  /**
   * Scan room for portals
   * @param roomName Room to scan
   * @returns Array of portals found
   */
  public static scanRoomForPortals(roomName: string): PortalInfo[] {
    const room = Game.rooms[roomName];
    if (!room) {
      return [];
    }

    const portals = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_PORTAL,
    }) as StructurePortal[];

    return portals.map((portal) => {
      const info: PortalInfo = {
        room: roomName,
        pos: { x: portal.pos.x, y: portal.pos.y },
      };

      if (portal.destination) {
        if (portal.destination instanceof RoomPosition) {
          info.destination = portal.destination.roomName;
        }
      }

      if (portal.ticksToDecay) {
        info.unstable = true;
        info.expires = Game.time + portal.ticksToDecay;
      }

      return info;
    });
  }

  /**
   * Aggregate portals from multiple players
   * @param usernames Array of player usernames
   * @returns Combined portal information
   */
  public static aggregatePortals(usernames: string[]): PortalInfo[] {
    const allPortals: PortalInfo[] = [];
    const seenPortals = new Set<string>();

    for (const username of usernames) {
      const portals = this.readPortals(username);
      if (!portals) {
        continue;
      }

      for (const portal of portals) {
        const key = `${portal.room}:${portal.pos.x},${portal.pos.y}`;
        if (!seenPortals.has(key)) {
          seenPortals.add(key);
          allPortals.push(portal);
        }
      }
    }

    return allPortals;
  }

  /**
   * Auto-scan all owned rooms and advertise portals
   * @returns Success status
   */
  public static autoAdvertisePortals(): boolean {
    const allPortals: PortalInfo[] = [];

    // Scan all owned rooms
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const portals = this.scanRoomForPortals(roomName);
      allPortals.push(...portals);
    }

    // Only advertise if we have portals
    if (allPortals.length === 0) {
      return false;
    }

    return this.advertisePortals(allPortals);
  }
}
