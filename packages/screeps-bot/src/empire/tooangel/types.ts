/**
 * Type definitions for TooAngel diplomacy/quest system
 * Based on: https://github.com/TooAngel/screeps/blob/master/doc/API.md
 */

/**
 * Quest types supported by TooAngel
 */
export type TooAngelQuestType = 
  | "buildcs"      // Build all construction sites in the given room
  | "defend"       // Defend specific room for some time
  | "attack"       // Attack a room
  | "sign"         // Sign controller in room
  | "dismantle"    // Dismantle structure in room
  | "transport"    // Bring resource to room
  | "terminal"     // Send resource via terminal to room
  | "harvest";     // Get resource via creep from room

/**
 * Quest status
 */
export type QuestStatus = 
  | "available"    // Quest detected but not applied
  | "applied"      // Applied for quest
  | "active"       // Quest received and in progress
  | "completed"    // Quest completed
  | "failed"       // Quest failed or expired
  | "cancelled";   // Quest cancelled

/**
 * Quest message format (sent/received via terminal)
 */
export interface TooAngelQuest {
  type: "quest";
  id: string;              // Unique quest identifier
  room: string;            // Room where quest needs to be solved
  quest: TooAngelQuestType; // Type of quest
  end: number;             // Game.time when quest needs to be finished
  origin?: string;         // Origin room for quest communication
  action?: "apply";        // Action for quest application
  result?: "won" | "lost"; // Quest completion result
}

/**
 * Controller sign format for quest advertisement
 */
export interface TooAngelQuestSign {
  type: "quest";
  id: string;
  origin: string;
  info: string; // URL to TooAngel info
}

/**
 * Reputation request/response format
 */
export interface TooAngelReputationMessage {
  type: "reputation";
  reputation?: number; // Response includes reputation value
}

/**
 * Quest tracking in memory
 */
export interface TooAngelQuestMemory {
  id: string;
  type: TooAngelQuestType;
  status: QuestStatus;
  targetRoom: string;
  originRoom: string;
  deadline: number;
  appliedAt?: number;
  receivedAt?: number;
  completedAt?: number;
  assignedCreeps?: string[]; // Creep names assigned to this quest
}

/**
 * TooAngel NPC room information
 */
export interface TooAngelNPCRoom {
  roomName: string;
  lastSeen: number;
  hasTerminal: boolean;
  availableQuests: string[]; // Quest IDs advertised
}

/**
 * Reputation tracking
 */
export interface TooAngelReputation {
  value: number;
  lastUpdated: number;
  lastRequestedAt?: number;
}

/**
 * Main TooAngel memory structure
 */
export interface TooAngelMemory {
  enabled: boolean;
  reputation: TooAngelReputation;
  npcRooms: Record<string, TooAngelNPCRoom>;
  activeQuests: Record<string, TooAngelQuestMemory>;
  completedQuests: string[]; // Quest IDs
  lastProcessedTick: number;
}
