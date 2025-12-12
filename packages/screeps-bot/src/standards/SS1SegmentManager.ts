/**
 * SS1: Default Public Segment Manager
 * Manages the default public segment for advertising communication channels
 * Based on: https://github.com/screepers/screepers-standards/blob/master/SS1-Default_Public_Segment.md
 * 
 * TODO: Implement automatic channel registration from active protocols
 * Scan for active protocols and auto-populate channels
 * TODO: Add segment compression for larger channel lists
 * Support more channels within 100KB limit
 * TODO: Implement segment update throttling
 * Only update when channels actually change
 * TODO: Add validation for channel configurations
 * Ensure all required fields are present and valid
 * TODO: Consider implementing segment discovery for nearby players
 * Auto-discover communication channels from neighboring players
 * TODO: Add metrics for segment read/write success rates
 * Track communication reliability
 */

import { SS1Api, SS1Channel, SS1DefaultPublicSegment } from "./types";
import * as LZString from "lz-string";
import { createLogger } from "../core/logger";

const logger = createLogger("SS1SegmentManager");

export class SS1SegmentManager {
  private static readonly API_VERSION = "v1.0.0";
  private static readonly MAX_SEGMENT_SIZE = 100 * 1024; // 100 KB

  /**
   * Create or update the default public segment
   * @param channels Channel definitions to advertise
   * @returns Success status
   */
  public static updateDefaultPublicSegment(
    channels: { [channelName: string]: SS1Channel }
  ): boolean {
    try {
      const segment: SS1DefaultPublicSegment = {
        api: {
          version: this.API_VERSION,
          update: Game.time,
        },
        channels: channels,
      };

      const data = JSON.stringify(segment);
      
      // Check size limit
      if (data.length > this.MAX_SEGMENT_SIZE) {
        console.log(
          `[SS1] Warning: Segment data too large (${data.length} > ${this.MAX_SEGMENT_SIZE})`
        );
        return false;
      }

      // Set as default public segment (segment 0 is commonly used)
      // Note: In actual implementation, the segment ID should be configurable
      RawMemory.setPublicSegments([0]);
      RawMemory.setDefaultPublicSegment(0);
      RawMemory.segments[0] = data;

      return true;
    } catch (error) {
      console.log(`[SS1] Error updating default public segment: ${error}`);
      return false;
    }
  }

  /**
   * Read default public segment from another player
   * @param username Player username
   * @returns Parsed segment data or null
   */
  public static readPlayerSegment(
    username: string
  ): SS1DefaultPublicSegment | null {
    try {
      const data = RawMemory.foreignSegment;
      if (!data || data.username !== username) {
        return null;
      }

      const segment: SS1DefaultPublicSegment = JSON.parse(data.data);
      
      // Validate API version compatibility
      if (!segment.api || !segment.api.version) {
        console.log(`[SS1] Invalid segment from ${username}: missing API version`);
        return null;
      }

      return segment;
    } catch (error) {
      console.log(`[SS1] Error reading segment from ${username}: ${error}`);
      return null;
    }
  }

  /**
   * Request to read a player's default public segment
   * @param username Player username
   */
  public static requestPlayerSegment(username: string): void {
    RawMemory.setActiveForeignSegment(username);
  }

  /**
   * Read multi-segment channel data
   * @param username Player username
   * @param segmentIds Array of segment IDs to read
   * @returns Combined segment data or null
   */
  public static readMultiSegmentChannel(
    username: string,
    segmentIds: number[]
  ): string | null {
    try {
      // Note: In actual implementation, this would require multiple ticks
      // to read all segments. This is a simplified version.
      const segments: string[] = [];
      
      for (const segmentId of segmentIds) {
        const data = RawMemory.foreignSegment;
        if (!data || data.username !== username) {
          console.log(
            `[SS1] Missing segment ${segmentId} from ${username}`
          );
          return null;
        }
        segments.push(data.data);
      }

      return segments.join("");
    } catch (error) {
      console.log(
        `[SS1] Error reading multi-segment from ${username}: ${error}`
      );
      return null;
    }
  }

  /**
   * Decompress channel data if compressed
   * @param data Compressed data
   * @returns Decompressed data
   */
  public static decompressData(data: string): string {
    try {
      const decompressed = LZString.decompressFromUTF16(data);
      if (decompressed === null) {
        console.log("[SS1] Warning: Decompression failed. Returning raw data.");
        return data;
      }
      return decompressed;
    } catch (error) {
      console.log(`[SS1] Error during decompression: ${error}`);
      return data;
    }
  }

  /**
   * Compress channel data
   * @param data Raw data
   * @returns Compressed data
   */
  public static compressData(data: string): string {
    try {
      return LZString.compressToUTF16(data);
    } catch (error) {
      console.log(`[SS1] Error during compression: ${error}. Returning raw data.`);
      return data;
    }
  }

  /**
   * Create a channel definition for advertising
   * @param protocol Protocol name
   * @param options Channel options
   * @returns Channel definition
   */
  public static createChannel(
    protocol: string,
    options: {
      version?: string;
      segments?: number[];
      data?: string;
      compressed?: boolean;
      keyid?: string;
      custom?: { [key: string]: any };
    } = {}
  ): SS1Channel {
    const channel: SS1Channel = {
      protocol: protocol,
      update: Game.time,
    };

    if (options.version) channel.version = options.version;
    if (options.segments) channel.segments = options.segments;
    if (options.data) channel.data = options.data;
    if (options.compressed !== undefined)
      channel.compressed = options.compressed;
    if (options.keyid) channel.keyid = options.keyid;

    // Add custom properties with x- prefix
    if (options.custom) {
      for (const [key, value] of Object.entries(options.custom)) {
        const prefixedKey = key.startsWith("x-") ? key : `x-${key}`;
        (channel as any)[prefixedKey] = value;
      }
    }

    return channel;
  }

  /**
   * Get channel from a player's segment
   * @param username Player username
   * @param channelName Channel name
   * @returns Channel data or null
   */
  public static getPlayerChannel(
    username: string,
    channelName: string
  ): SS1Channel | null {
    const segment = this.readPlayerSegment(username);
    if (!segment || !segment.channels) {
      return null;
    }

    return segment.channels[channelName] || null;
  }

  /**
   * List all channels advertised by a player
   * @param username Player username
   * @returns Array of channel names
   */
  public static listPlayerChannels(username: string): string[] {
    const segment = this.readPlayerSegment(username);
    if (!segment || !segment.channels) {
      return [];
    }

    return Object.keys(segment.channels);
  }
}
