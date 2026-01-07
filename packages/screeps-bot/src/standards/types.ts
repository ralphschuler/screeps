/**
 * Screepers Standards (screepers-standards) Type Definitions
 * Minimal implementation - only types for actively used protocols
 * 
 * Based on: https://github.com/screepers/screepers-standards
 */

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

export interface SS2PacketQueueItem {
  terminalId: Id<StructureTerminal>; // Terminal to send from
  targetRoom: string; // Destination room
  resourceType: ResourceConstant; // Resource to send
  amount: number; // Amount per packet
  packets: string[]; // Array of packet descriptions to send
  nextPacketIndex: number; // Index of next packet to send
  queuedAt: number; // Tick when item was queued
}

export interface SS2PacketQueue {
  [key: string]: SS2PacketQueueItem; // Key format: terminalId:msgId
}
