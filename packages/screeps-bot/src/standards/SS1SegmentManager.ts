/**
 * SS1: Default Public Segment Manager
 * Manages the default public segment for advertising communication channels
 * Based on: https://github.com/screepers/screepers-standards/blob/master/SS1-Default_Public_Segment.md
 */

import { SS1Channel, SS1DefaultPublicSegment } from "./types";
import * as LZString from "lz-string";
import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("SS1SegmentManager");

/**
 * Metrics for segment operations
 */
interface SS1Metrics {
  segmentWrites: { success: number; failure: number };
  segmentReads: { success: number; failure: number };
  protocolUsage: { [protocol: string]: number };
  lastUpdate: number;
}

/**
 * Discovery cache entry
 */
interface DiscoveryCache {
  username: string;
  channels: string[];
  discoveredAt: number;
  ttl: number;
}

/**
 * Segment manager memory
 */
interface SS1ManagerMemory {
  lastSegmentHash?: string;
  lastUpdateTick?: number;
  discoveryCache?: { [username: string]: DiscoveryCache };
  metrics?: SS1Metrics;
}

/**
 * Extend global Memory interface
 */
declare global {
  interface Memory {
    ss1Manager?: SS1ManagerMemory;
  }
}

export class SS1SegmentManager {
  private static readonly API_VERSION = "v1.0.0";
  private static readonly MAX_SEGMENT_SIZE = 100 * 1024; // 100 KB
  private static readonly MIN_UPDATE_INTERVAL = 100; // ticks
  private static readonly DISCOVERY_TTL = 10000; // ticks
  private static readonly COMPRESSION_THRESHOLD = 1000; // bytes
  private static readonly MAX_DISCOVERY_DISTANCE = 5; // rooms

  /**
   * Create or update the default public segment
   * @param channels Channel definitions to advertise
   * @returns Success status
   */
  public static updateDefaultPublicSegment(
    channels: { [channelName: string]: SS1Channel }
  ): boolean {
    try {
      // Validate all channels and filter out invalid ones
      const validChannels: { [channelName: string]: SS1Channel } = {};
      for (const [name, channel] of Object.entries(channels)) {
        const validation = this.validateChannel(name, channel);
        if (!validation.valid) {
          logger.error(`Channel ${name} validation failed: ${validation.errors.join(", ")}`, {
            meta: { channel: name, errors: validation.errors }
          });
          this.trackMetric("segmentWrites", false, channel.protocol);
          // Continue processing other channels instead of failing entire operation
          continue;
        }
        validChannels[name] = channel;
      }
      
      // If no valid channels, return false
      if (Object.keys(validChannels).length === 0) {
        logger.warn("No valid channels to advertise", { meta: {} });
        return false;
      }

      const segment: SS1DefaultPublicSegment = {
        api: {
          version: this.API_VERSION,
          update: Game.time,
        },
        channels: validChannels,
      };

      const data = JSON.stringify(segment);
      
      // Check size limit
      if (data.length > this.MAX_SEGMENT_SIZE) {
        logger.warn(`Segment data too large: ${data.length} bytes > ${this.MAX_SEGMENT_SIZE} bytes`, {
          meta: { size: data.length, limit: this.MAX_SEGMENT_SIZE, channelCount: Object.keys(channels).length }
        });
        this.trackMetric("segmentWrites", false);
        return false;
      }

      // Set as default public segment (segment 0 is commonly used)
      // Note: In actual implementation, the segment ID should be configurable
      RawMemory.setPublicSegments([0]);
      RawMemory.setDefaultPublicSegment(0);
      RawMemory.segments[0] = data;

      logger.info(`Updated default public segment with ${Object.keys(validChannels).length} channels`, {
        meta: { size: data.length, channels: Object.keys(validChannels) }
      });
      
      // Track metrics for each protocol
      for (const channel of Object.values(channels)) {
        this.trackMetric("segmentWrites", true, channel.protocol);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error updating default public segment: ${String(error)}`, {
        meta: { error: error instanceof Error ? error.message : String(error) }
      });
      this.trackMetric("segmentWrites", false);
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
        logger.warn("Invalid segment - missing API version", { meta: { username } });
        this.trackMetric("segmentReads", false);
        return null;
      }

      this.trackMetric("segmentReads", true);
      return segment;
    } catch (error) {
      logger.error("Error reading player segment", { meta: { username, error: String(error) } });
      this.trackMetric("segmentReads", false);
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
          logger.warn("Missing segment in multi-segment channel", { meta: { username, segmentId } });
          return null;
        }
        segments.push(data.data);
      }

      return segments.join("");
    } catch (error) {
      logger.error("Error reading multi-segment channel", { meta: { username, error: String(error) } });
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
        logger.warn("Decompression failed, returning raw data");
        return data;
      }
      return decompressed;
    } catch (error) {
      logger.error("Error during decompression", { meta: { error: String(error) } });
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
      logger.error("Error during compression, returning raw data", { meta: { error: String(error) } });
      return data;
    }
  }

  /**
   * Decrypt channel data using XOR cipher
   * @param data Encrypted data
   * @param key Encryption key
   * @returns Decrypted data
   */
  public static decryptData(data: string, key: string): string {
    try {
      if (!key || key.length === 0) {
        logger.warn("Decryption key is empty", { meta: {} });
        return data;
      }

      let decrypted = "";
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      logger.error(`Error during decryption: ${String(error)}`, {
        meta: { error: error instanceof Error ? error.message : String(error) }
      });
      return data;
    }
  }

  /**
   * Encrypt channel data using XOR cipher
   * @param data Raw data
   * @param key Encryption key
   * @returns Encrypted data
   */
  public static encryptData(data: string, key: string): string {
    try {
      if (!key || key.length === 0) {
        logger.warn("Encryption key is empty", { meta: {} });
        return data;
      }

      let encrypted = "";
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return encrypted;
    } catch (error) {
      logger.error(`Error during encryption: ${String(error)}`, {
        meta: { error: error instanceof Error ? error.message : String(error) }
      });
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

  /**
   * Get or initialize segment manager memory
   * @returns Manager memory
   */
  private static getMemory(): SS1ManagerMemory {
    if (!Memory.ss1Manager) {
      Memory.ss1Manager = {
        metrics: {
          segmentWrites: { success: 0, failure: 0 },
          segmentReads: { success: 0, failure: 0 },
          protocolUsage: {},
          lastUpdate: 0,
        },
        discoveryCache: {},
      };
    }
    return Memory.ss1Manager as SS1ManagerMemory;
  }

  /**
   * Calculate hash of segment content
   * @param data Segment data
   * @returns Hash string
   */
  private static hashContent(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Validate channel configuration
   * @param channelName Channel name
   * @param channel Channel configuration
   * @returns Validation result with errors
   */
  public static validateChannel(
    channelName: string,
    channel: SS1Channel
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate segment IDs
    if (channel.segments) {
      for (const segmentId of channel.segments) {
        if (segmentId < 0 || segmentId > 99) {
          errors.push(`Invalid segment ID ${segmentId}: must be 0-99`);
        }
      }
    }

    // Validate protocol name
    if (channel.protocol && typeof channel.protocol !== "string") {
      errors.push("Protocol must be a string");
    }

    // Validate version format
    if (channel.version && !/^v?\d+\.\d+\.\d+$/.test(channel.version)) {
      errors.push(`Invalid version format: ${channel.version}`);
    }

    // Validate mutually exclusive fields
    if (channel.data && channel.segments) {
      errors.push("Channel cannot have both 'data' and 'segments' fields");
    }

    // Validate compression flag
    if (channel.compressed !== undefined && typeof channel.compressed !== "boolean") {
      errors.push("Compressed flag must be boolean");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Update segment with throttling
   * @param channels Channels to advertise
   * @param forceUpdate Force update even if throttled
   * @returns Success status
   */
  public static updateWithThrottling(
    channels: { [channelName: string]: SS1Channel },
    forceUpdate: boolean = false
  ): boolean {
    const memory = this.getMemory();
    const data = JSON.stringify({
      api: { version: this.API_VERSION, update: Game.time },
      channels: channels,
    });
    const hash = this.hashContent(data);

    // Check if content changed
    if (!forceUpdate && memory.lastSegmentHash === hash) {
      return true; // No update needed
    }

    // Check minimum interval
    const ticksSinceLastUpdate = Game.time - (memory.lastUpdateTick || 0);
    if (!forceUpdate && ticksSinceLastUpdate < this.MIN_UPDATE_INTERVAL) {
      logger.debug(
        `Throttling segment update: only ${ticksSinceLastUpdate} ticks since last update`,
        { meta: { ticksSinceLastUpdate, minInterval: this.MIN_UPDATE_INTERVAL } }
      );
      return false;
    }

    // Perform update
    const success = this.updateDefaultPublicSegment(channels);
    
    if (success) {
      memory.lastSegmentHash = hash;
      memory.lastUpdateTick = Game.time;
    }

    return success;
  }

  /**
   * Compress channels if size exceeds threshold
   * @param channels Channels to compress
   * @returns Compressed channels object
   */
  public static compressChannelsIfNeeded(
    channels: { [channelName: string]: SS1Channel }
  ): { [channelName: string]: SS1Channel } {
    const result: { [channelName: string]: SS1Channel } = {};

    for (const [name, channel] of Object.entries(channels)) {
      if (channel.data && channel.data.length > this.COMPRESSION_THRESHOLD) {
        // Compress the data
        const compressed = this.compressData(channel.data);
        result[name] = {
          ...channel,
          data: compressed,
          compressed: true,
        };
        logger.debug(
          `Compressed channel ${name}: ${channel.data.length} -> ${compressed.length} bytes`,
          { meta: { original: channel.data.length, compressed: compressed.length } }
        );
      } else {
        result[name] = channel;
      }
    }

    return result;
  }

  /**
   * Discover segments from nearby players
   * @param maxDistance Maximum room distance
   * @returns Map of username to discovered channels
   */
  public static discoverNearbyPlayers(
    maxDistance: number = this.MAX_DISCOVERY_DISTANCE
  ): Map<string, string[]> {
    const memory = this.getMemory();
    const discovered = new Map<string, string[]>();
    const nearbyPlayers = new Set<string>();

    // Find nearby players from visible rooms
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller) continue;

      // Check room distance from our rooms
      let isNearby = false;
      for (const myRoomName in Game.rooms) {
        const myRoom = Game.rooms[myRoomName];
        if (!myRoom.controller?.my) continue;

        const distance = Game.map.getRoomLinearDistance(roomName, myRoomName);
        if (distance <= maxDistance) {
          isNearby = true;
          break;
        }
      }

      if (!isNearby) continue;

      // Add room owner to nearby players (exclude our own username and Invader)
      if (room.controller.owner && 
          room.controller.owner.username !== "Invader" &&
          !room.controller.my) {
        nearbyPlayers.add(room.controller.owner.username);
      }
    }

    // Check cache and request segments
    const now = Game.time;
    for (const username of nearbyPlayers) {
      // Check cache
      const cached = memory.discoveryCache?.[username];
      if (cached && now - cached.discoveredAt < cached.ttl) {
        discovered.set(username, cached.channels);
        continue;
      }

      // Request player segment
      this.requestPlayerSegment(username);

      // Try to read segment (might not be available immediately)
      const channels = this.listPlayerChannels(username);
      if (channels.length > 0) {
        discovered.set(username, channels);

        // Update cache
        if (!memory.discoveryCache) {
          memory.discoveryCache = {};
        }
        memory.discoveryCache[username] = {
          username,
          channels,
          discoveredAt: now,
          ttl: this.DISCOVERY_TTL,
        };

        this.trackMetric("segmentReads", true);
      }
    }

    return discovered;
  }

  /**
   * Track metrics
   * @param metric Metric type
   * @param success Success status
   * @param protocol Optional protocol name
   */
  private static trackMetric(
    metric: "segmentWrites" | "segmentReads",
    success: boolean,
    protocol?: string
  ): void {
    const memory = this.getMemory();
    if (!memory.metrics) return;

    if (success) {
      memory.metrics[metric].success++;
    } else {
      memory.metrics[metric].failure++;
    }

    if (protocol) {
      memory.metrics.protocolUsage[protocol] =
        (memory.metrics.protocolUsage[protocol] || 0) + 1;
    }

    memory.metrics.lastUpdate = Game.time;
  }

  /**
   * Get current metrics
   * @returns Metrics object
   */
  public static getMetrics(): SS1Metrics | null {
    const memory = this.getMemory();
    return memory.metrics || null;
  }

  /**
   * Reset metrics
   */
  public static resetMetrics(): void {
    const memory = this.getMemory();
    memory.metrics = {
      segmentWrites: { success: 0, failure: 0 },
      segmentReads: { success: 0, failure: 0 },
      protocolUsage: {},
      lastUpdate: Game.time,
    };
  }

  /**
   * Get metrics summary as string for console
   * @returns Formatted metrics string
   */
  public static getMetricsSummary(): string {
    const metrics = this.getMetrics();
    if (!metrics) {
      return "No metrics available";
    }

    const writeRate = metrics.segmentWrites.success + metrics.segmentWrites.failure > 0
      ? (metrics.segmentWrites.success / (metrics.segmentWrites.success + metrics.segmentWrites.failure) * 100).toFixed(1)
      : "N/A";
    
    const readRate = metrics.segmentReads.success + metrics.segmentReads.failure > 0
      ? (metrics.segmentReads.success / (metrics.segmentReads.success + metrics.segmentReads.failure) * 100).toFixed(1)
      : "N/A";

    const protocolList = Object.entries(metrics.protocolUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([protocol, count]) => `  ${protocol}: ${count}`)
      .join("\n");

    return `SS1 Segment Manager Metrics:
  Segment Writes: ${metrics.segmentWrites.success}/${metrics.segmentWrites.success + metrics.segmentWrites.failure} (${writeRate}% success)
  Segment Reads: ${metrics.segmentReads.success}/${metrics.segmentReads.success + metrics.segmentReads.failure} (${readRate}% success)
  Protocol Usage:
${protocolList || "  (none)"}
  Last Updated: ${metrics.lastUpdate}`;
  }
}
