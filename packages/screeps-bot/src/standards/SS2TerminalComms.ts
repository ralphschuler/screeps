/**
 * SS2: Terminal Communications Manager
 * Handles multi-packet message transmission via terminal transactions
 * Based on: https://github.com/screepers/screepers-standards/blob/master/SS2-Terminal_Communications.md
 */

import { SS2MessageBuffer, SS2TransactionMessage } from "./types";
import { createLogger } from "../core/logger";

const logger = createLogger("SS2TerminalComms");

export class SS2TerminalComms {
  private static readonly MAX_DESCRIPTION_LENGTH = 100;
  private static readonly MESSAGE_CHUNK_SIZE = 91; // Max 100 - 9 bytes header
  private static readonly MESSAGE_TIMEOUT = 1000; // Ticks before incomplete message expires
  private static readonly MESSAGE_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  private static messageBuffers: Map<string, SS2MessageBuffer> = new Map();
  private static nextMessageId = 0;

  /**
   * Parse SS2 transaction description
   * Format: msg_id|packet_id|{final_packet|}message_chunk
   * Regex: ^([\da-zA-Z]{1,3})\|([\d]{1,2})\|.+
   * @param description Transaction description
   * @returns Parsed message or null
   */
  public static parseTransaction(
    description: string
  ): SS2TransactionMessage | null {
    const regex = /^([\da-zA-Z]{1,3})\|([\d]{1,2})\|(.+)$/;
    const match = description.match(regex);

    if (!match) {
      return null;
    }

    const msgId = match[1];
    const packetId = parseInt(match[2], 10);
    let messageChunk = match[3];
    let finalPacket: number | undefined;

    // Check if first packet contains final_packet indicator
    if (packetId === 0) {
      const finalPacketMatch = messageChunk.match(/^(\d{1,2})\|(.+)$/);
      if (finalPacketMatch) {
        finalPacket = parseInt(finalPacketMatch[1], 10);
        messageChunk = finalPacketMatch[2];
      }
    }

    return {
      msgId,
      packetId,
      finalPacket,
      messageChunk,
    };
  }

  /**
   * Process incoming terminal transactions
   * @returns Array of completed messages
   */
  public static processIncomingTransactions(): Array<{
    sender: string;
    message: string;
  }> {
    const completedMessages: Array<{ sender: string; message: string }> = [];

    // Clean up expired message buffers
    this.cleanupExpiredBuffers();

    if (!Game.market.incomingTransactions) {
      return completedMessages;
    }

    for (const transaction of Game.market.incomingTransactions) {
      // Ignore market orders (only process direct terminal sends)
      if (transaction.order) {
        continue;
      }

      // Skip if no description or sender
      if (!transaction.description || !transaction.sender) {
        continue;
      }

      const parsed = this.parseTransaction(transaction.description);
      if (!parsed) {
        continue;
      }

      const bufferKey = `${transaction.sender.username}:${parsed.msgId}`;
      let buffer = this.messageBuffers.get(bufferKey);

      // Create new buffer if needed
      if (!buffer) {
        if (parsed.finalPacket === undefined) {
          // Not first packet and no buffer exists - skip
          continue;
        }

        buffer = {
          msgId: parsed.msgId,
          sender: transaction.sender.username,
          finalPacket: parsed.finalPacket,
          packets: new Map(),
          receivedAt: Game.time,
        };
        this.messageBuffers.set(bufferKey, buffer);
      }

      // Store packet
      buffer.packets.set(parsed.packetId, parsed.messageChunk);

      // Check if message is complete
      if (buffer.packets.size === buffer.finalPacket + 1) {
        // Reconstruct message
        const chunks: string[] = [];
        for (let i = 0; i <= buffer.finalPacket; i++) {
          const chunk = buffer.packets.get(i);
          if (!chunk) {
            console.log(
              `[SS2] Missing packet ${i} for message ${parsed.msgId} from ${transaction.sender.username}`
            );
            break;
          }
          chunks.push(chunk);
        }

        if (chunks.length === buffer.finalPacket + 1) {
          completedMessages.push({
            sender: transaction.sender.username,
            message: chunks.join(""),
          });
          this.messageBuffers.delete(bufferKey);
        }
      }
    }

    return completedMessages;
  }

  /**
   * Split message into packets for transmission
   * @param message Message to split
   * @returns Array of packet descriptions
   */
  public static splitMessage(message: string): string[] {
    if (message.length <= this.MAX_DESCRIPTION_LENGTH) {
      return [message];
    }

    const msgId = this.generateMessageId();
    const packets: string[] = [];
    const chunks = this.chunkMessage(message, this.MESSAGE_CHUNK_SIZE);
    const finalPacket = chunks.length - 1;

    for (let i = 0; i < chunks.length; i++) {
      let packet: string;
      if (i === 0) {
        // First packet includes final_packet indicator
        packet = `${msgId}|${i}|${finalPacket}|${chunks[i]}`;
      } else {
        packet = `${msgId}|${i}|${chunks[i]}`;
      }
      packets.push(packet);
    }

    return packets;
  }

  /**
   * Send a message via terminal
   * @param terminal Terminal to send from
   * @param targetRoom Target room
   * @param resourceType Resource to send (typically energy)
   * @param amount Amount to send
   * @param message Message to include
   * @returns Success status
   */
  public static sendMessage(
    terminal: StructureTerminal,
    targetRoom: string,
    resourceType: ResourceConstant,
    amount: number,
    message: string
  ): ScreepsReturnCode {
    const packets = this.splitMessage(message);

    if (packets.length === 1) {
      // Single packet - send directly
      return terminal.send(resourceType, amount, targetRoom, packets[0]);
    }

    // Multi-packet - queue remaining packets for subsequent ticks
    // TODO: Implement proper multi-packet queue system
    // Issue URL: https://github.com/ralphschuler/screeps/issues/445
    // For now, log warning and send first packet only
    console.log(
      `[SS2] Warning: Multi-packet message requires ${packets.length} transactions. Only sending first packet. Full multi-packet support requires implementation of packet queue.`
    );
    return terminal.send(resourceType, amount, targetRoom, packets[0]);
  }

  /**
   * Generate unique message ID
   * @returns 3-character alphanumeric ID
   */
  private static generateMessageId(): string {
    const chars = this.MESSAGE_ID_CHARS;
    let id = "";
    
    // Simple incrementing counter converted to base-62
    let num = this.nextMessageId++;
    if (this.nextMessageId >= chars.length ** 3) {
      this.nextMessageId = 0;
    }

    for (let i = 0; i < 3; i++) {
      id = chars[num % chars.length] + id;
      num = Math.floor(num / chars.length);
    }

    return id;
  }

  /**
   * Split message into chunks
   * @param message Message to chunk
   * @param chunkSize Size of each chunk
   * @returns Array of chunks
   */
  private static chunkMessage(message: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < message.length; i += chunkSize) {
      chunks.push(message.substring(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Clean up expired message buffers
   */
  private static cleanupExpiredBuffers(): void {
    const now = Game.time;
    for (const [key, buffer] of this.messageBuffers.entries()) {
      if (now - buffer.receivedAt > this.MESSAGE_TIMEOUT) {
        console.log(
          `[SS2] Message ${buffer.msgId} from ${buffer.sender} timed out`
        );
        this.messageBuffers.delete(key);
      }
    }
  }

  /**
   * Parse JSON message
   * @param message Raw message
   * @returns Parsed object or null
   */
  public static parseJSON<T = any>(message: string): T | null {
    try {
      if (message.startsWith("{") || message.startsWith("[")) {
        return JSON.parse(message) as T;
      }
      return null;
    } catch (error) {
      console.log(`[SS2] Error parsing JSON: ${error}`);
      return null;
    }
  }

  /**
   * Format message as JSON
   * @param data Object to serialize
   * @returns JSON string
   */
  public static formatJSON(data: any): string {
    return JSON.stringify(data);
  }
}
