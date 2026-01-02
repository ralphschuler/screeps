/**
 * Console commands for TooAngel integration
 * 
 * Available commands:
 * - tooangel.status() - Show current status
 * - tooangel.enable() - Enable TooAngel integration
 * - tooangel.disable() - Disable TooAngel integration
 * - tooangel.reputation() - Get current reputation
 * - tooangel.requestReputation(fromRoom?) - Request reputation update
 * - tooangel.quests() - List active quests
 * - tooangel.apply(questId, originRoom, fromRoom?) - Apply for a quest
 */

import { tooAngelManager } from "./tooAngelManager";
import { requestReputation, getReputation } from "./reputationManager";
import { getActiveQuests, applyForQuest } from "./questManager";
import { getNPCRooms } from "./npcDetector";

export const tooAngelCommands = {
  /**
   * Show TooAngel status
   */
  status: (): string => {
    return tooAngelManager.getStatus();
  },

  /**
   * Enable TooAngel integration
   */
  enable: (): string => {
    tooAngelManager.enable();
    return "TooAngel integration enabled";
  },

  /**
   * Disable TooAngel integration
   */
  disable: (): string => {
    tooAngelManager.disable();
    return "TooAngel integration disabled";
  },

  /**
   * Get current reputation
   */
  reputation: (): string => {
    const rep = getReputation();
    return `Current TooAngel reputation: ${rep}`;
  },

  /**
   * Request reputation update
   */
  requestReputation: (fromRoom?: string): string => {
    const success = requestReputation(fromRoom);
    if (success) {
      return `Reputation request sent${fromRoom ? ` from ${fromRoom}` : ""}`;
    } else {
      return "Failed to send reputation request (check logs for details)";
    }
  },

  /**
   * List active quests
   */
  quests: (): string => {
    const activeQuests = getActiveQuests();
    const lines: string[] = ["Active Quests:"];

    if (Object.keys(activeQuests).length === 0) {
      lines.push("  No active quests");
    } else {
      for (const questId in activeQuests) {
        const quest = activeQuests[questId];
        const timeLeft = quest.deadline - Game.time;
        const creepCount = quest.assignedCreeps?.length || 0;
        lines.push(
          `  ${questId}:`
        );
        lines.push(`    Type: ${quest.type}`);
        lines.push(`    Target: ${quest.targetRoom}`);
        lines.push(`    Status: ${quest.status}`);
        lines.push(`    Time left: ${timeLeft} ticks`);
        lines.push(`    Assigned creeps: ${creepCount}`);
      }
    }

    return lines.join("\n");
  },

  /**
   * List discovered NPC rooms
   */
  npcs: (): string => {
    const npcRooms = getNPCRooms();
    const lines: string[] = ["TooAngel NPC Rooms:"];

    if (Object.keys(npcRooms).length === 0) {
      lines.push("  No NPC rooms discovered");
    } else {
      for (const roomName in npcRooms) {
        const npc = npcRooms[roomName];
        lines.push(`  ${roomName}:`);
        lines.push(`    Has terminal: ${npc.hasTerminal}`);
        lines.push(`    Available quests: ${npc.availableQuests.length}`);
        lines.push(`    Last seen: ${Game.time - npc.lastSeen} ticks ago`);
      }
    }

    return lines.join("\n");
  },

  /**
   * Apply for a quest
   */
  apply: (questId: string, originRoom: string, fromRoom?: string): string => {
    const success = applyForQuest(questId, originRoom, fromRoom);
    if (success) {
      return `Applied for quest ${questId}${fromRoom ? ` from ${fromRoom}` : ""}`;
    } else {
      return "Failed to apply for quest (check logs for details)";
    }
  },

  /**
   * Help message
   */
  help: (): string => {
    const lines: string[] = [
      "TooAngel Console Commands:",
      "",
      "  tooangel.status()                    - Show current status",
      "  tooangel.enable()                    - Enable integration",
      "  tooangel.disable()                   - Disable integration",
      "  tooangel.reputation()                - Get current reputation",
      "  tooangel.requestReputation(fromRoom) - Request reputation update",
      "  tooangel.quests()                    - List active quests",
      "  tooangel.npcs()                      - List discovered NPC rooms",
      "  tooangel.apply(id, origin, fromRoom) - Apply for a quest",
      "  tooangel.help()                      - Show this help"
    ];
    return lines.join("\n");
  }
};
