/**
 * TooAngel NPC Detector
 * 
 * Scans for TooAngel NPC rooms by:
 * - Looking for quest advertisements on controller signs
 * - Tracking terminal availability for communication
 */

import { logger } from "../../core/logger";
import type { TooAngelQuestSign, TooAngelNPCRoom } from "./types";

/**
 * Check if a controller sign is a TooAngel quest advertisement
 */
export function parseQuestSign(sign: string | undefined): TooAngelQuestSign | null {
  if (!sign) {
    return null;
  }

  try {
    const parsed = JSON.parse(sign);
    
    if (parsed.type === "quest" && 
        parsed.id && 
        parsed.origin && 
        typeof parsed.info === "string") {
      return parsed as TooAngelQuestSign;
    }
  } catch (e) {
    // Not JSON or not a quest sign
  }

  return null;
}

/**
 * Scan a room for TooAngel NPC presence
 */
export function scanRoomForNPC(room: Room): TooAngelNPCRoom | null {
  if (!room.controller) {
    return null;
  }

  const controller = room.controller;
  
  // Check for quest sign
  const questSign = parseQuestSign(controller.sign?.text);
  
  if (!questSign) {
    return null;
  }

  // Found a TooAngel NPC room!
  const terminal = room.terminal;
  
  return {
    roomName: room.name,
    lastSeen: Game.time,
    hasTerminal: terminal !== undefined && terminal.my === false,
    availableQuests: [questSign.id]
  };
}

/**
 * Scan all visible rooms for TooAngel NPCs
 */
export function scanForNPCRooms(): TooAngelNPCRoom[] {
  const npcRooms: TooAngelNPCRoom[] = [];

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    const npcRoom = scanRoomForNPC(room);
    
    if (npcRoom) {
      logger.info(`Detected TooAngel NPC room: ${roomName}`, {
        subsystem: "TooAngel"
      });
      npcRooms.push(npcRoom);
    }
  }

  return npcRooms;
}

/**
 * Get TooAngel NPC rooms from memory
 */
export function getNPCRooms(): Record<string, TooAngelNPCRoom> {
  const mem = Memory as { tooangel?: { npcRooms?: Record<string, TooAngelNPCRoom> } };
  return mem.tooangel?.npcRooms || {};
}

/**
 * Update NPC room information in memory
 */
export function updateNPCRoom(npcRoom: TooAngelNPCRoom): void {
  const mem = Memory as { tooangel?: { npcRooms?: Record<string, TooAngelNPCRoom> } };
  
  if (!mem.tooangel) {
    mem.tooangel = {};
  }
  
  if (!mem.tooangel.npcRooms) {
    mem.tooangel.npcRooms = {};
  }

  // Merge with existing data
  const existing = mem.tooangel.npcRooms[npcRoom.roomName];
  if (existing) {
    // Merge quest lists
    const questSet = new Set([...existing.availableQuests, ...npcRoom.availableQuests]);
    npcRoom.availableQuests = Array.from(questSet);
  }

  mem.tooangel.npcRooms[npcRoom.roomName] = npcRoom;
}

/**
 * Find closest NPC room to a given room
 */
export function findClosestNPCRoom(fromRoom: string): TooAngelNPCRoom | null {
  const npcRooms = getNPCRooms();
  let closestRoom: TooAngelNPCRoom | null = null;
  let minDistance = Infinity;

  for (const roomName in npcRooms) {
    const distance = Game.map.getRoomLinearDistance(fromRoom, roomName);
    if (distance < minDistance) {
      minDistance = distance;
      closestRoom = npcRooms[roomName];
    }
  }

  return closestRoom;
}
