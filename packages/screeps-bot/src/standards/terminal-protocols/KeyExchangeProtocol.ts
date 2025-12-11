/**
 * Terminal Protocol: Key Exchange
 * Secure key exchange via terminal transactions
 * Based on: https://github.com/screepers/screepers-standards/blob/master/terminal_protocols/key_exchange.md
 */

import { KeyExchangeRequest, KeyExchangeResponse } from "../types";
import { SS2TerminalComms } from "../SS2TerminalComms";

export class KeyExchangeProtocol {
  private static readonly PROTOCOL_NAME = "key_exchange";
  private static keyStore: Map<string, string> = new Map();

  /**
   * Send key request
   * @param terminal Terminal to send from
   * @param targetRoom Target room
   * @param keyid Key identifier
   * @returns Success status
   */
  public static sendKeyRequest(
    terminal: StructureTerminal,
    targetRoom: string,
    keyid: string
  ): ScreepsReturnCode {
    const request: KeyExchangeRequest = {
      type: "key_request",
      keyid: keyid,
    };

    const message = `key request ${keyid}`;
    
    // Send minimal energy with request
    return SS2TerminalComms.sendMessage(
      terminal,
      targetRoom,
      RESOURCE_ENERGY,
      10,
      message
    );
  }

  /**
   * Send key response
   * @param terminal Terminal to send from
   * @param targetRoom Target room
   * @param keyid Key identifier
   * @param keystring Encryption key
   * @returns Success status
   */
  public static sendKeyResponse(
    terminal: StructureTerminal,
    targetRoom: string,
    keyid: string,
    keystring: string
  ): ScreepsReturnCode {
    const response: KeyExchangeResponse = {
      type: "key",
      keyid: keyid,
      keystring: keystring,
    };

    const message = `key ${keyid} ${keystring}`;
    
    // Send minimal energy with response
    return SS2TerminalComms.sendMessage(
      terminal,
      targetRoom,
      RESOURCE_ENERGY,
      10,
      message
    );
  }

  /**
   * Process incoming key exchange messages
   * @param sender Sender username
   * @param message Message content
   * @returns True if message was a key exchange
   */
  public static processMessage(
    sender: string,
    message: string
  ): boolean {
    const parts = message.trim().split(/\s+/);
    
    if (parts.length < 2 || parts[0] !== "key") {
      return false;
    }

    if (parts[1] === "request" && parts.length >= 3) {
      // Key request
      const keyid = parts[2];
      console.log(`[KeyExchange] Received key request for ${keyid} from ${sender}`);
      
      // Handle request - implementation depends on key management policy
      this.handleKeyRequest(sender, keyid);
      return true;
    } else if (parts.length >= 3) {
      // Key response
      const keyid = parts[1];
      const keystring = parts[2];
      console.log(`[KeyExchange] Received key ${keyid} from ${sender}`);
      
      // Store key
      this.storeKey(sender, keyid, keystring);
      return true;
    }

    return false;
  }

  /**
   * Handle incoming key request
   * @param sender Sender username
   * @param keyid Key identifier
   * @note TODO: Complete implementation requires TerminalComProtocol integration
   * to discover sender's terminal rooms and send the response
   */
  private static handleKeyRequest(sender: string, keyid: string): void {
    // Check if we have this key and are authorized to share it
    const key = this.getKey(sender, keyid);
    
    if (!key) {
      console.log(`[KeyExchange] Key ${keyid} not found or not authorized for ${sender}`);
      return;
    }

    // Find a terminal to respond from
    const terminal = this.findAvailableTerminal();
    if (!terminal) {
      console.log(`[KeyExchange] No available terminal to respond to ${sender}`);
      return;
    }

    // TODO: Get sender's terminal room from their termcom protocol (TerminalComProtocol)
    // For full implementation:
    // 1. Read sender's terminal list using TerminalComProtocol.readTerminals(sender)
    // 2. Select closest terminal to our terminal
    // 3. Call this.sendKeyResponse(terminal, senderTerminalRoom, keyid, key)
    console.log(`[KeyExchange] TODO: Implement full key response flow. Would send key ${keyid} to ${sender}`);
  }

  /**
   * Store received key
   * @param sender Sender username
   * @param keyid Key identifier
   * @param keystring Key value
   */
  private static storeKey(
    sender: string,
    keyid: string,
    keystring: string
  ): void {
    const key = `${sender}:${keyid}`;
    this.keyStore.set(key, keystring);
  }

  /**
   * Get stored key
   * @param sender Sender username
   * @param keyid Key identifier
   * @returns Key value or null
   */
  public static getKey(sender: string, keyid: string): string | null {
    const key = `${sender}:${keyid}`;
    return this.keyStore.get(key) || null;
  }

  /**
   * Add key to store
   * @param owner Key owner
   * @param keyid Key identifier
   * @param keystring Key value
   */
  public static addKey(
    owner: string,
    keyid: string,
    keystring: string
  ): void {
    const key = `${owner}:${keyid}`;
    this.keyStore.set(key, keystring);
  }

  /**
   * Find an available terminal
   * @returns Terminal or null
   */
  private static findAvailableTerminal(): StructureTerminal | null {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.terminal?.my) {
        return room.terminal;
      }
    }
    return null;
  }
}
