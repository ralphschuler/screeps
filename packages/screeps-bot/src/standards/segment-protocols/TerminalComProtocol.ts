/**
 * Segment Protocol: Terminal Communications
 * Lists terminals available for communication
 * Based on: https://github.com/screepers/screepers-standards/blob/master/segment_protocols/termcom.md
 */

import { TerminalRoomsList } from "../types";
import { SS1SegmentManager } from "../SS1SegmentManager";

export class TerminalComProtocol {
  private static readonly PROTOCOL_NAME = "termcom";
  private static readonly VERSION = "v1.0.0";

  /**
   * Advertise terminals available for communication
   * @param rooms Array of room names with terminals
   * @returns Success status
   */
  public static advertiseTerminals(rooms: string[]): boolean {
    const data = JSON.stringify(rooms);
    
    const channel = SS1SegmentManager.createChannel(this.PROTOCOL_NAME, {
      version: this.VERSION,
      data: data,
    });

    return SS1SegmentManager.updateDefaultPublicSegment({
      [this.PROTOCOL_NAME]: channel,
    });
  }

  /**
   * Read terminal list from a player
   * @param username Player username
   * @returns Array of room names or null
   */
  public static readTerminals(username: string): TerminalRoomsList | null {
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

      return JSON.parse(data) as TerminalRoomsList;
    } catch (error) {
      console.log(`[TermCom] Error reading terminals from ${username}: ${error}`);
      return null;
    }
  }

  /**
   * Get list of our rooms with active terminals
   * @returns Array of room names
   */
  public static getOurTerminals(): string[] {
    const terminalRooms: string[] = [];
    
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.terminal && room.terminal.my) {
        terminalRooms.push(roomName);
      }
    }

    return terminalRooms;
  }

  /**
   * Auto-update our terminal list
   * @returns Success status
   */
  public static updateOurTerminals(): boolean {
    const terminals = this.getOurTerminals();
    return this.advertiseTerminals(terminals);
  }

  /**
   * Check if a player has a terminal in a specific room
   * @param username Player username
   * @param roomName Room to check
   * @returns True if player has terminal in room
   */
  public static hasTerminalInRoom(
    username: string,
    roomName: string
  ): boolean {
    const terminals = this.readTerminals(username);
    if (!terminals) {
      return false;
    }

    return terminals.includes(roomName);
  }
}
