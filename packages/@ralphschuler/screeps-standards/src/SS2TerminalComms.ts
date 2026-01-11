/**
 * SS2: Terminal Communications Manager
 * Handles multi-packet message transmission via terminal transactions
 * Based on: https://github.com/screepers/screepers-standards/blob/master/SS2-Terminal_Communications.md
 */

import { SS2MessageBuffer, SS2TransactionMessage, SS2MessageBufferSerialized } from "./types";
import { createLogger } from "@ralphschuler/screeps-core";

const logger = createLogger("SS2TerminalComms");

export class SS2TerminalComms {
  private static readonly MAX_DESCRIPTION_LENGTH = 100;
  private static readonly MESSAGE_CHUNK_SIZE = 91; // Max 100 - 9 bytes header
  private static readonly MESSAGE_TIMEOUT = 1000; // Ticks before incomplete message expires
  private static readonly QUEUE_TIMEOUT = 1000; // Ticks before queued packets expire
  private static readonly MESSAGE_ID_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  // State persistence to survive global resets
  private static _messageBuffers: Map<string, SS2MessageBuffer> | null = null;
  private static _nextMessageId: number | null = null;
  private static _stateInitialized: boolean = false;

  /**
   * Load state from Memory (called automatically on first access)
   */
  private static loadStateFromMemory(): void {
    if (this._stateInitialized) {
      return;
    }

    if (!Memory.ss2TerminalComms) {
      Memory.ss2TerminalComms = {};
    }

    const persisted = Memory.ss2TerminalComms;

    // Load message buffers
    const buffersMap = new Map<string, SS2MessageBuffer>();
    if (persisted.messageBuffers) {
      for (const key in persisted.messageBuffers) {
        const serialized = persisted.messageBuffers[key];
        const packetsMap = new Map<number, string>();
        for (const packetIdStr in serialized.packets) {
          packetsMap.set(parseInt(packetIdStr, 10), serialized.packets[packetIdStr]);
        }
        buffersMap.set(key, {
          msgId: serialized.msgId,
          sender: serialized.sender,
          finalPacket: serialized.finalPacket,
          packets: packetsMap,
          receivedAt: serialized.receivedAt
        });
      }
    }

    this._messageBuffers = buffersMap;
    this._nextMessageId = typeof persisted.nextMessageId === "number" ? persisted.nextMessageId : 0;
    this._stateInitialized = true;
  }

  /**
   * Save state to Memory
   */
  private static saveStateToMemory(): void {
    if (!this._stateInitialized) {
      this.loadStateFromMemory();
    }

    if (!Memory.ss2TerminalComms) {
      Memory.ss2TerminalComms = {};
    }

    // Save message buffers
    const buffersObject: { [key: string]: SS2MessageBufferSerialized } = {};
    if (this._messageBuffers) {
      this._messageBuffers.forEach((buffer, key) => {
        const packetsObject: { [packetId: number]: string } = {};
        buffer.packets.forEach((chunk, packetId) => {
          packetsObject[packetId] = chunk;
        });
        buffersObject[key] = {
          msgId: buffer.msgId,
          sender: buffer.sender,
          finalPacket: buffer.finalPacket,
          packets: packetsObject,
          receivedAt: buffer.receivedAt
        };
      });
    }

    Memory.ss2TerminalComms.messageBuffers = buffersObject;
    Memory.ss2TerminalComms.nextMessageId = this._nextMessageId ?? 0;
  }

  /**
   * Get message buffers (lazy-loads from Memory)
   */
  private static get messageBuffers(): Map<string, SS2MessageBuffer> {
    if (!this._stateInitialized) {
      this.loadStateFromMemory();
    }
    if (!this._messageBuffers) {
      this._messageBuffers = new Map<string, SS2MessageBuffer>();
    }
    return this._messageBuffers;
  }

  /**
   * Set message buffers (automatically saves to Memory)
   */
  private static set messageBuffers(value: Map<string, SS2MessageBuffer>) {
    this._messageBuffers = value;
    this._stateInitialized = true;
    this.saveStateToMemory();
  }

  /**
   * Get next message ID (lazy-loads from Memory)
   */
  private static get nextMessageId(): number {
    if (!this._stateInitialized) {
      this.loadStateFromMemory();
    }
    if (this._nextMessageId === null) {
      this._nextMessageId = 0;
    }
    return this._nextMessageId;
  }

  /**
   * Set next message ID (automatically saves to Memory)
   */
  private static set nextMessageId(value: number) {
    this._nextMessageId = value;
    this._stateInitialized = true;
    this.saveStateToMemory();
  }

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
        this.saveStateToMemory();
      }

      // Store packet
      buffer.packets.set(parsed.packetId, parsed.messageChunk);
      this.saveStateToMemory();

      // Check if message is complete
      if (buffer.packets.size === buffer.finalPacket + 1) {
        // Reconstruct message
        const chunks: string[] = [];
        for (let i = 0; i <= buffer.finalPacket; i++) {
          const chunk = buffer.packets.get(i);
          if (!chunk) {
            logger.warn("Missing packet in multi-packet message", { 
              meta: { 
                packetId: i, 
                messageId: parsed.msgId, 
                sender: transaction.sender.username 
              } 
            });
            break;
          }
          chunks.push(chunk);
        }

        if (chunks.length === buffer.finalPacket + 1) {
          const fullMessage = chunks.join("");
          completedMessages.push({
            sender: transaction.sender.username,
            message: fullMessage,
          });
          this.messageBuffers.delete(bufferKey);
          this.saveStateToMemory();
          logger.info(`Received complete multi-packet message from ${transaction.sender.username}`, {
            meta: { 
              messageId: parsed.msgId, 
              packets: chunks.length, 
              totalSize: fullMessage.length,
              sender: transaction.sender.username
            }
          });
        }
      }
    }

    if (completedMessages.length > 0) {
      logger.debug(`Processed ${Game.market.incomingTransactions.length} terminal transactions, completed ${completedMessages.length} messages`);
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
   * 
   * For single-packet messages, sends immediately and returns the result.
   * For multi-packet messages, queues packets for transmission in future ticks
   * and returns OK immediately. Use processQueue() each tick to send queued packets.
   * 
   * @param terminal Terminal to send from
   * @param targetRoom Target room
   * @param resourceType Resource to send (typically energy)
   * @param amount Amount to send per packet
   * @param message Message to include
   * @returns OK for queued multi-packet messages or terminal.send() result for single packets
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

    // Multi-packet - queue all packets for subsequent ticks
    const msgId = this.extractMessageId(packets[0]);
    if (!msgId) {
      logger.error("Failed to extract message ID from first packet");
      return ERR_INVALID_ARGS;
    }

    this.queuePackets(terminal.id, targetRoom, resourceType, amount, packets, msgId);
    logger.info(`Queued ${packets.length} packets for multi-packet message`, {
      meta: { 
        terminalId: terminal.id, 
        messageId: msgId, 
        packets: packets.length,
        targetRoom 
      }
    });
    // Note: Returns OK immediately; actual sending happens via processQueue()
    return OK;
  }

  /**
   * Extract message ID from a packet description
   * @param packet Packet description
   * @returns Message ID or null
   */
  private static extractMessageId(packet: string): string | null {
    const match = packet.match(/^([\da-zA-Z]{1,3})\|/);
    return match ? match[1] : null;
  }

  /**
   * Queue packets for multi-packet transmission
   * @param terminalId Terminal ID to send from
   * @param targetRoom Target room
   * @param resourceType Resource to send
   * @param amount Amount to send per packet
   * @param packets Array of packet descriptions
   * @param msgId Message ID for this transmission
   */
  private static queuePackets(
    terminalId: Id<StructureTerminal>,
    targetRoom: string,
    resourceType: ResourceConstant,
    amount: number,
    packets: string[],
    msgId: string
  ): void {
    if (!Memory.ss2PacketQueue) {
      Memory.ss2PacketQueue = {};
    }

    const queueKey = `${terminalId}:${msgId}`;
    Memory.ss2PacketQueue[queueKey] = {
      terminalId,
      targetRoom,
      resourceType,
      amount,
      packets,
      nextPacketIndex: 0,
      queuedAt: Game.time,
    };
  }

  /**
   * Process packet queue for all terminals
   * Should be called each tick to send queued packets
   * @returns Number of packets sent this tick
   */
  public static processQueue(): number {
    if (!Memory.ss2PacketQueue) {
      return 0;
    }

    this.cleanupExpiredQueue();

    let packetsSent = 0;
    const toDelete: string[] = [];
    const cpuStart = Game.cpu.getUsed();
    const maxCpuPerTick = 5; // Limit CPU usage for queue processing

    for (const [queueKey, queueItem] of Object.entries(Memory.ss2PacketQueue)) {
      // CPU budget check - don't process more items if we've used too much CPU
      if (Game.cpu.getUsed() - cpuStart > maxCpuPerTick) {
        logger.debug(`Queue processing stopped due to CPU budget limit (${maxCpuPerTick} CPU)`);
        break;
      }

      // Get terminal object
      const terminal = Game.getObjectById(queueItem.terminalId);
      if (!terminal) {
        logger.warn(`Terminal not found for queue item, removing from queue`, {
          meta: { queueKey, terminalId: queueItem.terminalId }
        });
        toDelete.push(queueKey);
        continue;
      }

      // Check terminal cooldown
      if (terminal.cooldown > 0) {
        continue;
      }

      // Send next packet
      const packet = queueItem.packets[queueItem.nextPacketIndex];
      if (!packet) {
        // Should not happen, but cleanup if it does
        logger.warn(`No packet at index ${queueItem.nextPacketIndex}, removing queue item`, {
          meta: { queueKey }
        });
        toDelete.push(queueKey);
        continue;
      }

      const result = terminal.send(
        queueItem.resourceType,
        queueItem.amount,
        queueItem.targetRoom,
        packet
      );

      if (result === OK) {
        // Explicitly update Memory to ensure persistence
        Memory.ss2PacketQueue[queueKey].nextPacketIndex = queueItem.nextPacketIndex + 1;
        packetsSent++;

        // Check if all packets sent
        if (Memory.ss2PacketQueue[queueKey].nextPacketIndex >= queueItem.packets.length) {
          const msgId = this.extractMessageId(packet);
          logger.info(`Completed sending multi-packet message`, {
            meta: { 
              messageId: msgId, 
              packets: queueItem.packets.length,
              targetRoom: queueItem.targetRoom 
            }
          });
          toDelete.push(queueKey);
        }
      } else if (result === ERR_NOT_ENOUGH_RESOURCES) {
        logger.warn(`Not enough resources to send packet, will retry next tick`, {
          meta: { 
            queueKey, 
            resource: queueItem.resourceType, 
            amount: queueItem.amount 
          }
        });
      } else {
        logger.error(`Failed to send packet: ${result}, removing queue item`, {
          meta: { queueKey, result }
        });
        toDelete.push(queueKey);
      }
    }

    // Cleanup completed/failed queue items
    for (const key of toDelete) {
      delete Memory.ss2PacketQueue[key];
    }

    if (packetsSent > 0) {
      logger.debug(`Sent ${packetsSent} queued packets this tick`);
    }

    return packetsSent;
  }

  /**
   * Clean up expired queue items
   */
  private static cleanupExpiredQueue(): void {
    if (!Memory.ss2PacketQueue) {
      return;
    }

    const now = Game.time;
    const toDelete: string[] = [];

    for (const [queueKey, queueItem] of Object.entries(Memory.ss2PacketQueue)) {
      if (now - queueItem.queuedAt > this.QUEUE_TIMEOUT) {
        const msgId = this.extractMessageId(queueItem.packets[0]);
        logger.warn(`Queue item timed out after ${now - queueItem.queuedAt} ticks`, {
          meta: { 
            messageId: msgId, 
            queueKey,
            sentPackets: queueItem.nextPacketIndex,
            totalPackets: queueItem.packets.length
          }
        });
        toDelete.push(queueKey);
      }
    }

    for (const key of toDelete) {
      delete Memory.ss2PacketQueue[key];
    }
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
        logger.warn("Message timed out", { 
          meta: { 
            messageId: buffer.msgId, 
            sender: buffer.sender 
          } 
        });
        this.messageBuffers.delete(key);
        this.saveStateToMemory();
      }
    }
  }

  /**
   * Parse JSON message
   * @param message Raw message
   * @returns Parsed object or null
   */
  public static parseJSON<T = unknown>(message: string): T | null {
    try {
      if (message.startsWith("{") || message.startsWith("[")) {
        return JSON.parse(message) as T;
      }
      return null;
    } catch (error) {
      logger.error("Error parsing JSON", { meta: { error: String(error) } });
      return null;
    }
  }

  /**
   * Format message as JSON
   * @param data Object to serialize
   * @returns JSON string
   */
  public static formatJSON<T>(data: T): string {
    return JSON.stringify(data);
  }
}
