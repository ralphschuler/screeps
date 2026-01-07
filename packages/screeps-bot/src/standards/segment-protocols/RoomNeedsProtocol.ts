/**
 * Segment Protocol: Room Needs
 * Advertises room resource needs and surpluses
 * Based on: https://github.com/screepers/screepers-standards/blob/master/segment_protocols/roomneeds.md
 */

import { RoomNeed } from "../types";
import { SS1SegmentManager } from "../SS1SegmentManager";
import { KeyExchangeProtocol } from "../terminal-protocols/KeyExchangeProtocol";
import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("RoomNeedsProtocol");

export class RoomNeedsProtocol {
  private static readonly PROTOCOL_NAME = "roomneeds";
  private static readonly VERSION = "v1.0.0";

  /**
   * Advertise room needs
   * @param needs Array of room needs/surpluses
   * @param keyid Optional encryption key ID
   * @returns Success status
   */
  public static advertiseNeeds(
    needs: RoomNeed[],
    keyid?: string
  ): boolean {
    const data = JSON.stringify(needs);
    
    const channel = SS1SegmentManager.createChannel(this.PROTOCOL_NAME, {
      version: this.VERSION,
      data: data,
      keyid: keyid,
    });

    return SS1SegmentManager.updateDefaultPublicSegment({
      [this.PROTOCOL_NAME]: channel,
    });
  }

  /**
   * Read room needs from a player
   * @param username Player username
   * @returns Array of needs or null
   */
  public static readNeeds(username: string): RoomNeed[] | null {
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

      // Decrypt if needed
      if (channel.keyid) {
        const key = KeyExchangeProtocol.getKey(username, channel.keyid);
        
        if (!key) {
          logger.warn(`Channel is encrypted with keyid ${channel.keyid} but key is not available for ${username}`, {
            meta: { username, keyid: channel.keyid }
          });
          return null;
        }
        
        data = SS1SegmentManager.decryptData(data, key);
      }

      return JSON.parse(data) as RoomNeed[];
    } catch (error) {
      logger.error(`Error reading needs from ${username}: ${String(error)}`, {
        meta: { username, error: error instanceof Error ? error.message : String(error) }
      });
      return null;
    }
  }

  /**
   * Calculate room needs based on storage levels
   * @param room Room to analyze
   * @param thresholds Resource thresholds
   * @returns Array of needs
   */
  public static calculateRoomNeeds(
    room: Room,
    thresholds: { [resource: string]: { min: number; max: number } } = {}
  ): RoomNeed[] {
    const needs: RoomNeed[] = [];
    
    if (!room.storage && !room.terminal) {
      return needs;
    }

    const storage = room.storage?.store || {};
    const terminal = room.terminal?.store || {};

    // Combine storage and terminal
    const totalStore: { [resource: string]: number } = {};
    
    for (const resource in storage) {
      totalStore[resource] = (totalStore[resource] || 0) + storage[resource as ResourceConstant];
    }
    
    for (const resource in terminal) {
      totalStore[resource] = (totalStore[resource] || 0) + terminal[resource as ResourceConstant];
    }

    // Check against thresholds
    for (const [resource, levels] of Object.entries(thresholds)) {
      const current = totalStore[resource] || 0;
      
      if (current < levels.min) {
        // Need resource
        needs.push({
          room: room.name,
          resource: resource as ResourceConstant,
          amount: levels.min - current,
          priority: 5,
        });
      } else if (current > levels.max) {
        // Surplus resource
        needs.push({
          room: room.name,
          resource: resource as ResourceConstant,
          amount: -(current - levels.max), // Negative for surplus
          priority: 3,
        });
      }
    }

    return needs;
  }

  /**
   * Find matching needs between players
   * @param ourNeeds Our room needs
   * @param theirUsername Other player username
   * @returns Array of matching trades
   */
  public static findMatches(
    ourNeeds: RoomNeed[],
    theirUsername: string
  ): Array<{ ourNeed: RoomNeed; theirNeed: RoomNeed }> {
    const theirNeeds = this.readNeeds(theirUsername);
    if (!theirNeeds) {
      return [];
    }

    const matches: Array<{ ourNeed: RoomNeed; theirNeed: RoomNeed }> = [];

    for (const ourNeed of ourNeeds) {
      for (const theirNeed of theirNeeds) {
        // Check if resources match and signs are opposite
        if (
          ourNeed.resource === theirNeed.resource &&
          Math.sign(ourNeed.amount) !== Math.sign(theirNeed.amount)
        ) {
          matches.push({ ourNeed, theirNeed });
        }
      }
    }

    return matches;
  }

  /**
   * Auto-calculate and advertise room needs for all owned rooms
   * @param thresholds Optional custom thresholds
   * @returns Success status
   */
  public static autoAdvertiseNeeds(
    thresholds?: { [resource: string]: { min: number; max: number } }
  ): boolean {
    // Default thresholds if not provided
    const defaultThresholds = thresholds || {
      energy: { min: 50000, max: 500000 },
      power: { min: 1000, max: 10000 },
      [RESOURCE_HYDROGEN]: { min: 1000, max: 5000 },
      [RESOURCE_OXYGEN]: { min: 1000, max: 5000 },
      [RESOURCE_UTRIUM]: { min: 1000, max: 5000 },
      [RESOURCE_LEMERGIUM]: { min: 1000, max: 5000 },
      [RESOURCE_KEANIUM]: { min: 1000, max: 5000 },
      [RESOURCE_ZYNTHIUM]: { min: 1000, max: 5000 },
      [RESOURCE_CATALYST]: { min: 1000, max: 5000 },
    };

    const allNeeds: RoomNeed[] = [];

    // Calculate needs for all owned rooms
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const needs = this.calculateRoomNeeds(room, defaultThresholds);
      allNeeds.push(...needs);
    }

    // Only advertise if we have needs
    if (allNeeds.length === 0) {
      return false;
    }

    return this.advertiseNeeds(allNeeds);
  }
}
