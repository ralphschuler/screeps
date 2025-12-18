/**
 * TooAngel Quest Manager
 * 
 * Manages quest lifecycle:
 * 1. Detection - Scan for quests advertised on controller signs
 * 2. Application - Apply for quests via terminal transfer
 * 3. Reception - Receive quest details via terminal
 * 4. Execution - Coordinate quest completion
 * 5. Completion - Report quest success/failure
 */

import { logger } from "../../core/logger";
import type {
  TooAngelQuest,
  TooAngelQuestMemory,
  TooAngelQuestType
} from "./types";
import { getNPCRooms } from "./npcDetector";
import { getTooAngelMemory } from "./memoryInit";

/**
 * Quest configuration
 */
const QUEST_CONFIG = {
  /** Maximum active quests at once */
  MAX_ACTIVE_QUESTS: 3,
  /** Minimum energy for quest application */
  MIN_APPLICATION_ENERGY: 100,
  /** Quest timeout buffer (ticks before deadline to stop) */
  DEADLINE_BUFFER: 500,
  /** Supported quest types */
  SUPPORTED_TYPES: ["buildcs"] as TooAngelQuestType[]
};

/**
 * Parse quest message from terminal transaction
 */
export function parseQuestMessage(description: string): TooAngelQuest | null {
  try {
    const parsed = JSON.parse(description);

    if (parsed.type === "quest" &&
        parsed.id &&
        parsed.room &&
        parsed.quest &&
        typeof parsed.end === "number") {
      
      // Validate deadline is in the future (if not a completion message)
      if (!parsed.result && parsed.end <= Game.time) {
        logger.debug(
          `Ignoring quest ${parsed.id} with past deadline: ${parsed.end} (current: ${Game.time})`,
          { subsystem: "TooAngel" }
        );
        return null;
      }
      
      return parsed as TooAngelQuest;
    }
  } catch {
    // Not a valid quest message
  }

  return null;
}

/**
 * Get active quests from memory
 */
export function getActiveQuests(): Record<string, TooAngelQuestMemory> {
  const memory = getTooAngelMemory();
  return memory.activeQuests || {};
}

/**
 * Get a specific quest by ID
 */
export function getQuest(questId: string): TooAngelQuestMemory | null {
  const activeQuests = getActiveQuests();
  return activeQuests[questId] || null;
}

/**
 * Check if we can accept more quests
 */
export function canAcceptQuest(): boolean {
  const activeQuests = getActiveQuests();
  const activeCount = Object.values(activeQuests).filter(
    q => q.status === "active" || q.status === "applied"
  ).length;

  return activeCount < QUEST_CONFIG.MAX_ACTIVE_QUESTS;
}

/**
 * Check if a quest type is supported
 */
export function isSupportedQuestType(questType: TooAngelQuestType): boolean {
  return QUEST_CONFIG.SUPPORTED_TYPES.includes(questType);
}

/**
 * Apply for a quest
 * 
 * @param questId - Quest ID from controller sign
 * @param originRoom - TooAngel NPC room advertising the quest
 * @param fromRoomName - Our room to send application from
 * @returns true if application was sent
 */
export function applyForQuest(
  questId: string,
  originRoom: string,
  fromRoomName?: string
): boolean {
  if (!canAcceptQuest()) {
    logger.debug("Cannot accept more quests (at max capacity)", {
      subsystem: "TooAngel"
    });
    return false;
  }

  // Find a room to send from
  let sourceRoom: Room | undefined;

  if (fromRoomName) {
    sourceRoom = Game.rooms[fromRoomName];
  } else {
    // Find closest owned room with terminal
    let minDistance = Infinity;
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.terminal && room.terminal.my) {
        const distance = Game.map.getRoomLinearDistance(roomName, originRoom);
        if (distance < minDistance) {
          minDistance = distance;
          sourceRoom = room;
        }
      }
    }
  }

  if (!sourceRoom || !sourceRoom.terminal || !sourceRoom.terminal.my) {
    logger.warn("No terminal available to apply for quest", {
      subsystem: "TooAngel"
    });
    return false;
  }

  const terminal = sourceRoom.terminal;
  const energyAvailable = terminal.store[RESOURCE_ENERGY];

  if (energyAvailable < QUEST_CONFIG.MIN_APPLICATION_ENERGY) {
    logger.warn(
      `Insufficient energy for quest application: ${energyAvailable} < ${QUEST_CONFIG.MIN_APPLICATION_ENERGY}`,
      { subsystem: "TooAngel" }
    );
    return false;
  }

  // Create application message (only include required fields for application)
  const application: Partial<TooAngelQuest> = {
    type: "quest",
    id: questId,
    action: "apply"
  };

  const result = terminal.send(
    RESOURCE_ENERGY,
    QUEST_CONFIG.MIN_APPLICATION_ENERGY,
    originRoom,
    JSON.stringify(application)
  );

  if (result === OK) {
    logger.info(
      `Applied for quest ${questId} from ${sourceRoom.name} to ${originRoom}`,
      { subsystem: "TooAngel" }
    );

    // Track application in memory (will be updated when quest details are received)
    const memory = getTooAngelMemory();
    memory.activeQuests![questId] = {
      id: questId,
      type: "buildcs", // Placeholder - will be updated when quest is received
      status: "applied",
      targetRoom: "", // Will be updated when quest is received
      originRoom: originRoom,
      deadline: 0, // Will be updated when quest is received
      appliedAt: Game.time
    };

    return true;
  } else {
    logger.warn(`Failed to apply for quest: ${result}`, {
      subsystem: "TooAngel"
    });
    return false;
  }
}

/**
 * Process incoming quest messages from terminal transactions
 */
export function processQuestMessages(): void {
  if (!Game.market.incomingTransactions) {
    return;
  }

  const memory = getTooAngelMemory();

  for (const transaction of Game.market.incomingTransactions) {
    // Skip market orders
    if (transaction.order) {
      continue;
    }

    if (!transaction.description) {
      continue;
    }

    const quest = parseQuestMessage(transaction.description);

    if (quest) {
      logger.info(
        `Received quest ${quest.id}: ${quest.quest} in ${quest.room} (deadline: ${quest.end})`,
        { subsystem: "TooAngel" }
      );

      // Check if this is a quest completion confirmation
      if (quest.result) {
        handleQuestCompletion(quest);
        continue;
      }

      // Store quest in memory
      const existing = memory.activeQuests![quest.id];

      memory.activeQuests![quest.id] = {
        id: quest.id,
        type: quest.quest,
        status: existing?.status === "completed" || existing?.status === "failed" 
          ? existing.status 
          : "active",
        targetRoom: quest.room,
        originRoom: quest.origin || transaction.from,
        deadline: quest.end,
        appliedAt: existing?.appliedAt,
        receivedAt: Game.time,
        assignedCreeps: []
      };

      // Check if we support this quest type
      if (!isSupportedQuestType(quest.quest)) {
        logger.warn(
          `Received unsupported quest type: ${quest.quest}`,
          { subsystem: "TooAngel" }
        );
        memory.activeQuests![quest.id].status = "failed";
      }
    }
  }
}

/**
 * Handle quest completion response from TooAngel
 */
function handleQuestCompletion(quest: TooAngelQuest): void {
  const memory = getTooAngelMemory();
  const questData = memory.activeQuests![quest.id];

  if (!questData) {
    logger.warn(`Received completion for unknown quest: ${quest.id}`, {
      subsystem: "TooAngel"
    });
    return;
  }

  if (quest.result === "won") {
    logger.info(`Quest ${quest.id} completed successfully!`, {
      subsystem: "TooAngel"
    });
    questData.status = "completed";
  } else {
    logger.warn(`Quest ${quest.id} failed`, {
      subsystem: "TooAngel"
    });
    questData.status = "failed";
  }

  questData.completedAt = Game.time;

  // Move to completed list
  if (!memory.completedQuests!.includes(quest.id)) {
    memory.completedQuests!.push(quest.id);
  }

  // Note: Quest cleanup happens in cleanupExpiredQuests() based on completedAt timestamp
}

/**
 * Send quest completion notification
 * (Optional - TooAngel detects completion automatically)
 */
export function notifyQuestComplete(questId: string, won: boolean): boolean {
  const quest = getQuest(questId);

  if (!quest) {
    logger.warn(`Cannot notify completion for unknown quest: ${questId}`, {
      subsystem: "TooAngel"
    });
    return false;
  }

  // Find a room with terminal
  let sourceRoom: Room | undefined;
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room.controller?.my && room.terminal && room.terminal.my) {
      sourceRoom = room;
      break;
    }
  }

  if (!sourceRoom || !sourceRoom.terminal) {
    return false;
  }

  const message: TooAngelQuest = {
    type: "quest",
    id: questId,
    room: quest.targetRoom,
    quest: quest.type,
    end: quest.deadline,
    result: won ? "won" : "lost"
  };

  const result = sourceRoom.terminal.send(
    RESOURCE_ENERGY,
    100,
    quest.originRoom,
    JSON.stringify(message)
  );

  if (result === OK) {
    logger.info(
      `Notified quest completion: ${questId} (${won ? "won" : "lost"})`,
      { subsystem: "TooAngel" }
    );
    return true;
  }

  return false;
}

/**
 * Clean up expired quests
 */
export function cleanupExpiredQuests(): void {
  const memory = getTooAngelMemory();
  const activeQuests = memory.activeQuests || {};

  for (const questId in activeQuests) {
    const quest = activeQuests[questId];

    // Mark as failed if past deadline
    if (quest.deadline > 0 && Game.time >= quest.deadline - QUEST_CONFIG.DEADLINE_BUFFER) {
      if (quest.status === "active" || quest.status === "applied") {
        logger.warn(
          `Quest ${questId} expired (deadline: ${quest.deadline}, current: ${Game.time})`,
          { subsystem: "TooAngel" }
        );
        quest.status = "failed";
        quest.completedAt = Game.time;
      }
    }

    // Clean up old completed/failed quests
    if ((quest.status === "completed" || quest.status === "failed") &&
        quest.completedAt &&
        Game.time - quest.completedAt > 10000) {
      delete activeQuests[questId];
    }
  }
}

/**
 * Auto-discover and apply for quests from scanned NPC rooms
 */
export function autoDiscoverQuests(): void {
  if (!canAcceptQuest()) {
    return;
  }

  const npcRooms = getNPCRooms();
  const activeQuests = getActiveQuests();

  for (const roomName in npcRooms) {
    const npcRoom = npcRooms[roomName];

    // Check each advertised quest
    for (const questId of npcRoom.availableQuests) {
      // Skip if already applied or active
      if (activeQuests[questId]) {
        continue;
      }

      // Try to apply
      logger.info(`Auto-applying for quest ${questId} from ${roomName}`, {
        subsystem: "TooAngel"
      });

      applyForQuest(questId, roomName);

      // Only apply for one quest at a time
      return;
    }
  }
}
