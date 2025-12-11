/**
 * Screepers Standards (screepers-standards) Type Definitions
 * Based on: https://github.com/screepers/screepers-standards
 */

/**
 * SS1: Default Public Segment v1.0.0
 * Protocol for advertising communication channels via default public segment
 */
export interface SS1Api {
  version: string; // Semantic version (e.g., "v1.0.0")
  update: number; // Game tick when segment was last saved
}

export interface SS1Channel {
  protocol?: string; // Protocol name (defaults to channel name if undefined)
  version?: string; // Protocol version
  update?: number; // Tick when channel was last updated
  segments?: number[]; // List of segment IDs for multi-segment messages
  data?: string; // Direct message data (mutually exclusive with segments)
  compressed?: boolean; // True if data/segments are compressed with lzstring
  keyid?: string; // Key identifier for encrypted messages
  [key: `x-${string}`]: any; // Protocol-specific custom options prefixed with x-
}

export interface SS1DefaultPublicSegment {
  api: SS1Api;
  channels: {
    [channelName: string]: SS1Channel;
  };
}

/**
 * SS2: Terminal Communications v1.1.0
 * Protocol for sending multi-packet messages via terminal transactions
 */
export interface SS2TransactionMessage {
  msgId: string; // 3-character alphanumeric message ID
  packetId: number; // Packet order (0-99)
  finalPacket?: number; // Last packet ID (only in first packet)
  messageChunk: string; // Piece of the message
}

export interface SS2MessageBuffer {
  msgId: string;
  sender: string;
  finalPacket: number;
  packets: Map<number, string>; // packetId -> messageChunk
  receivedAt: number; // First packet received tick
}

/**
 * SS3: Unified Credentials File v1.0
 * Standardized credentials storage format
 */
export interface SS3ServerConfig {
  host: string; // Required: server hostname
  port?: number; // Optional: non-standard TCP port
  secure?: boolean; // Optional: true if SSL available
  token?: string; // Optional: auth token (public server)
  username?: string; // Optional: username (private server)
  password?: string; // Optional: password (private server)
  ptr?: boolean; // Optional: true for PTR server
}

export interface SS3Config {
  servers: {
    [serverName: string]: SS3ServerConfig;
  };
  configs?: {
    [appName: string]: any; // App-specific configs
  };
}

/**
 * Segment Protocol: Portals
 * Shares portal information between players
 */
export interface PortalInfo {
  room: string; // Room name where portal is located
  pos: { x: number; y: number }; // Position of portal
  destination?: string; // Destination room (if known)
  unstable?: boolean; // True if portal is unstable
  expires?: number; // Tick when portal expires (for unstable)
}

/**
 * Segment Protocol: Room Needs
 * Advertises room resource needs/offers
 */
export interface RoomNeed {
  room: string;
  resource: ResourceConstant;
  amount: number; // Positive for need, negative for surplus
  priority?: number; // 1-10 priority
}

/**
 * Segment Protocol: Terminal Communications
 * Lists terminals available for communication
 */
export type TerminalRoomsList = string[]; // Array of room names with terminals

/**
 * Terminal Protocol: Key Exchange
 * Secure key exchange via terminal
 */
export interface KeyExchangeRequest {
  type: "key_request";
  keyid: string;
}

export interface KeyExchangeResponse {
  type: "key";
  keyid: string;
  keystring: string;
}

/**
 * Terminal Protocol: Resource Request
 * Request resources from allies
 */
export interface ResourceRequest {
  type: "resource_request";
  resource: ResourceConstant;
  amount: number;
  toRoom: string;
  priority?: number;
}

export interface ResourceResponse {
  type: "resource_response";
  requestId: string;
  accepted: boolean;
  estimatedTicks?: number;
}
