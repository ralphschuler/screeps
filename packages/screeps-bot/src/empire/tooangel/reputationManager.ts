/**
 * TooAngel Reputation Manager
 * 
 * Manages reputation tracking and API communication with TooAngel NPC.
 * Reputation is gained by:
 * - Sending resources via terminal
 * - Completing quests
 * 
 * Reputation is reduced by:
 * - Attacking TooAngel NPC with nukes
 * - Failed quests
 */

import { logger } from "../../core/logger";
import type { TooAngelReputationMessage, TooAngelReputation } from "./types";
import { findClosestNPCRoom } from "./npcDetector";

/**
 * Configuration for reputation system
 */
const REPUTATION_CONFIG = {
  /** Minimum energy to send with reputation request */
  MIN_REQUEST_ENERGY: 100,
  /** Cooldown between reputation requests (in ticks) */
  REQUEST_COOLDOWN: 1000,
  /** How long to wait for a reputation response (in ticks) */
  RESPONSE_TIMEOUT: 100
};

/**
 * Get or initialize TooAngel memory
 */
function getTooAngelMemory() {
  const mem = Memory as { 
    tooangel?: {
      enabled?: boolean;
      reputation?: TooAngelReputation;
      npcRooms?: Record<string, any>;
      activeQuests?: Record<string, any>;
      completedQuests?: string[];
      lastProcessedTick?: number;
    }
  };
  
  if (!mem.tooangel) {
    mem.tooangel = {
      enabled: true,
      reputation: {
        value: 0,
        lastUpdated: 0
      },
      npcRooms: {},
      activeQuests: {},
      completedQuests: [],
      lastProcessedTick: 0
    };
  }
  
  if (!mem.tooangel.reputation) {
    mem.tooangel.reputation = {
      value: 0,
      lastUpdated: 0
    };
  }

  return mem.tooangel;
}

/**
 * Get current reputation value
 */
export function getReputation(): number {
  const memory = getTooAngelMemory();
  return memory.reputation?.value || 0;
}

/**
 * Parse incoming terminal transaction for reputation response
 */
export function parseReputationResponse(description: string): number | null {
  try {
    const parsed: TooAngelReputationMessage = JSON.parse(description);
    
    if (parsed.type === "reputation" && typeof parsed.reputation === "number") {
      return parsed.reputation;
    }
  } catch (e) {
    // Not a valid reputation response
  }

  return null;
}

/**
 * Process incoming terminal transactions for reputation updates
 */
export function processReputationUpdates(): void {
  if (!Game.market.incomingTransactions) {
    return;
  }

  const memory = getTooAngelMemory();

  for (const transaction of Game.market.incomingTransactions) {
    // Skip market orders
    if (transaction.order) {
      continue;
    }

    // Skip if no description
    if (!transaction.description) {
      continue;
    }

    const reputation = parseReputationResponse(transaction.description);
    
    if (reputation !== null) {
      logger.info(`Received reputation update from TooAngel: ${reputation}`, {
        subsystem: "TooAngel"
      });

      memory.reputation = {
        value: reputation,
        lastUpdated: Game.time
      };
    }
  }
}

/**
 * Request current reputation from TooAngel NPC
 * 
 * Sends a terminal transfer with JSON message: {"type": "reputation"}
 * TooAngel NPC will respond with: {"type": "reputation", "reputation": REPUTATION}
 * 
 * @param fromRoomName - Room to send request from (must have terminal)
 * @returns true if request was sent successfully
 */
export function requestReputation(fromRoomName?: string): boolean {
  const memory = getTooAngelMemory();

  // Check cooldown
  const lastRequest = memory.reputation?.lastRequestedAt || 0;
  if (Game.time - lastRequest < REPUTATION_CONFIG.REQUEST_COOLDOWN) {
    logger.debug(
      `Reputation request on cooldown (${REPUTATION_CONFIG.REQUEST_COOLDOWN - (Game.time - lastRequest)} ticks remaining)`,
      { subsystem: "TooAngel" }
    );
    return false;
  }

  // Find a room to send from
  let sourceRoom: Room | undefined;
  
  if (fromRoomName) {
    sourceRoom = Game.rooms[fromRoomName];
  } else {
    // Find any owned room with a terminal
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.terminal && room.terminal.my) {
        sourceRoom = room;
        break;
      }
    }
  }

  if (!sourceRoom || !sourceRoom.terminal || !sourceRoom.terminal.my) {
    logger.warn("No terminal available to request reputation", {
      subsystem: "TooAngel"
    });
    return false;
  }

  // Find closest TooAngel NPC room
  const npcRoom = findClosestNPCRoom(sourceRoom.name);
  
  if (!npcRoom || !npcRoom.hasTerminal) {
    logger.warn("No TooAngel NPC room with terminal found", {
      subsystem: "TooAngel"
    });
    return false;
  }

  // Check if we have enough energy
  const terminal = sourceRoom.terminal;
  const energyAvailable = terminal.store[RESOURCE_ENERGY];
  
  if (energyAvailable < REPUTATION_CONFIG.MIN_REQUEST_ENERGY) {
    logger.warn(
      `Insufficient energy for reputation request: ${energyAvailable} < ${REPUTATION_CONFIG.MIN_REQUEST_ENERGY}`,
      { subsystem: "TooAngel" }
    );
    return false;
  }

  // Send reputation request
  const message: TooAngelReputationMessage = {
    type: "reputation"
  };

  const result = terminal.send(
    RESOURCE_ENERGY,
    REPUTATION_CONFIG.MIN_REQUEST_ENERGY,
    npcRoom.roomName,
    JSON.stringify(message)
  );

  if (result === OK) {
    logger.info(
      `Sent reputation request to ${npcRoom.roomName} from ${sourceRoom.name}`,
      { subsystem: "TooAngel" }
    );

    memory.reputation!.lastRequestedAt = Game.time;
    return true;
  } else {
    logger.warn(
      `Failed to send reputation request: ${result}`,
      { subsystem: "TooAngel" }
    );
    return false;
  }
}

/**
 * Read public segments for reputation highscores
 * 
 * Segment 1: Top 10 players (highest reputation)
 * Segment 2: Bottom 10 players (lowest reputation)
 */
export function readReputationHighscores(): {
  top10?: Array<{ username: string; reputation: number }>;
  bottom10?: Array<{ username: string; reputation: number }>;
} {
  const result: {
    top10?: Array<{ username: string; reputation: number }>;
    bottom10?: Array<{ username: string; reputation: number }>;
  } = {};

  // TODO: Read public segments when we have the API available
  // For now, this is a placeholder
  // RawMemory.setActiveSegments([1, 2]);
  // const segment1 = RawMemory.segments[1];
  // const segment2 = RawMemory.segments[2];

  return result;
}

/**
 * Track reputation change from resource transfers
 * Called when sending resources to TooAngel NPC
 */
export function trackReputationGain(resourceType: ResourceConstant, amount: number): void {
  // Reputation increases based on market value
  // For now, we'll estimate based on energy value
  const energyValue = resourceType === RESOURCE_ENERGY ? 
    amount : 
    amount * 0.5; // Rough estimate for other resources

  logger.debug(
    `Estimated reputation gain: +${energyValue} from ${amount} ${resourceType}`,
    { subsystem: "TooAngel" }
  );
}
