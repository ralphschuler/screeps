/**
 * Segment Protocol: Room Needs
 * Advertises room resource needs and surpluses
 * Based on: https://github.com/screepers/screepers-standards/blob/master/segment_protocols/roomneeds.md
 */

import { RoomNeed } from "../types";
import { SS1SegmentManager } from "../SS1SegmentManager";
import { createLogger } from "../../core/logger";

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

      // Note: Decryption would happen here if keyid is present
      // TODO: Implement decryption support using the KeyExchangeProtocol
      // Issue URL: https://github.com/ralphschuler/screeps/issues/446
      // For encrypted channels, integrate with KeyExchangeProtocol.getKey()
      if (channel.keyid) {
        console.log(`[RoomNeeds] Warning: Channel is encrypted with keyid ${channel.keyid} but decryption is not implemented`);
      }

      return JSON.parse(data) as RoomNeed[];
    } catch (error) {
      console.log(`[RoomNeeds] Error reading needs from ${username}: ${error}`);
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
}
