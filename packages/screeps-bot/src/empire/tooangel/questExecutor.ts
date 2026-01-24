/**
 * TooAngel Quest Executor
 * 
 * Executes specific quest types by coordinating creeps and actions.
 * Currently supports:
 * - buildcs: Build all construction sites in target room
 */

import { logger } from "@ralphschuler/screeps-core";
import { notifyQuestComplete } from "./questManager";
import type { TooAngelQuestMemory } from "./types";

/**
 * Quest executor configuration
 */
const EXECUTOR_CONFIG = {
  /** Maximum builders to assign per quest */
  MAX_BUILDERS_PER_QUEST: 3
};

/**
 * Check if a buildcs quest is completed
 */
export function checkBuildcsComplete(targetRoom: string): boolean {
  const room = Game.rooms[targetRoom];
  
  if (!room) {
    // Can't check if we can't see the room
    return false;
  }

  const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
  return constructionSites.length === 0;
}

/**
 * Execute buildcs quest
 * Assigns available builders to construct all sites in the target room
 */
export function executeBuildcsQuest(quest: TooAngelQuestMemory): void {
  const targetRoom = Game.rooms[quest.targetRoom];

  if (!targetRoom) {
    logger.debug(
      `Cannot execute buildcs quest ${quest.id}: room ${quest.targetRoom} not visible`,
      { subsystem: "TooAngel" }
    );
    return;
  }

  // Check if already complete
  if (checkBuildcsComplete(quest.targetRoom)) {
    logger.info(
      `Quest ${quest.id} (buildcs) completed! All construction sites built in ${quest.targetRoom}`,
      { subsystem: "TooAngel" }
    );

    // Notify TooAngel of completion
    notifyQuestComplete(quest.id, true);
    quest.status = "completed";
    quest.completedAt = Game.time;
    return;
  }

  const constructionSites = targetRoom.find(FIND_CONSTRUCTION_SITES);
  logger.debug(
    `Quest ${quest.id} (buildcs): ${constructionSites.length} construction sites remaining in ${quest.targetRoom}`,
    { subsystem: "TooAngel" }
  );

  // Find available builders
  const assignedCreeps = quest.assignedCreeps || [];
  const builders: Creep[] = [];

  // Check existing assigned creeps
  for (const creepName of assignedCreeps) {
    const creep = Game.creeps[creepName];
    if (creep) {
      builders.push(creep);
    }
  }

  // Assign more builders if needed
  if (builders.length < EXECUTOR_CONFIG.MAX_BUILDERS_PER_QUEST && constructionSites.length > 0) {
    // Find idle builders in nearby rooms
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const availableBuilders = room.find(FIND_MY_CREEPS, {
        filter: (c) => {
          const memory = c.memory as unknown as { 
            role?: string; 
            questId?: string;
            assistTarget?: string;
          };
          const role = memory.role;
          return (role === "larvaWorker" || role === "builder") &&
                 !memory.questId &&
                 !memory.assistTarget;
        }
      });

      for (const builder of availableBuilders) {
        const memory = builder.memory as unknown as { questId?: string };
        memory.questId = quest.id;
        builders.push(builder);
        assignedCreeps.push(builder.name);

        logger.info(
          `Assigned ${builder.name} to quest ${quest.id} (buildcs)`,
          { subsystem: "TooAngel" }
        );

        if (builders.length >= EXECUTOR_CONFIG.MAX_BUILDERS_PER_QUEST) break;
      }

      if (builders.length >= EXECUTOR_CONFIG.MAX_BUILDERS_PER_QUEST) break;
    }
  }

  quest.assignedCreeps = assignedCreeps;

  // Direct builders to construct sites
  for (const builder of builders) {
    const memory = builder.memory as unknown as {
      questId?: string;
      questTarget?: string;
      questAction?: string;
    };

    // Update builder memory for quest
    memory.questId = quest.id;
    memory.questTarget = quest.targetRoom;
    memory.questAction = "build";
  }
}

/**
 * Execute active quests
 */
export function executeQuests(): void {
  const mem = Memory as {
    tooangel?: {
      activeQuests?: Record<string, TooAngelQuestMemory>;
    }
  };

  const activeQuests = mem.tooangel?.activeQuests || {};

  for (const questId in activeQuests) {
    const quest = activeQuests[questId];

    // Only execute active quests
    if (quest.status !== "active") {
      continue;
    }

    // Check deadline (use > to allow execution on the deadline tick itself)
    if (quest.deadline > 0 && Game.time > quest.deadline) {
      logger.warn(
        `Quest ${questId} missed deadline (${quest.deadline})`,
        { subsystem: "TooAngel" }
      );
      quest.status = "failed";
      quest.completedAt = Game.time;
      continue;
    }

    // Execute based on quest type
    switch (quest.type) {
      case "buildcs":
        executeBuildcsQuest(quest);
        break;

      default:
        logger.warn(
          `Unsupported quest type for execution: ${quest.type}`,
          { subsystem: "TooAngel" }
        );
        quest.status = "failed";
        quest.completedAt = Game.time;
    }
  }
}

/**
 * Cleanup quest assignments from dead creeps
 */
export function cleanupQuestCreeps(): void {
  const mem = Memory as {
    tooangel?: {
      activeQuests?: Record<string, TooAngelQuestMemory>;
    }
  };

  const activeQuests = mem.tooangel?.activeQuests || {};

  for (const questId in activeQuests) {
    const quest = activeQuests[questId];

    if (!quest.assignedCreeps) {
      continue;
    }

    // Remove dead creeps
    quest.assignedCreeps = quest.assignedCreeps.filter(
      creepName => Game.creeps[creepName] !== undefined
    );
  }
}
