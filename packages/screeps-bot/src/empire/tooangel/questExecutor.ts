/**
 * TooAngel Quest Executor
 *
 * Executes specific quest types by coordinating creeps and actions.
 * Currently supports:
 * - buildcs: Build all construction sites in target room
 */

import { logger } from "@ralphschuler/screeps-core";
import { planBuildcsQuestLifecycle } from "./questLifecycle";
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
    logger.debug(`Cannot execute buildcs quest ${quest.id}: room ${quest.targetRoom} not visible`, {
      subsystem: "TooAngel"
    });
    return;
  }

  const constructionSites = targetRoom.find(FIND_CONSTRUCTION_SITES);
  logger.debug(
    `Quest ${quest.id} (buildcs): ${constructionSites.length} construction sites remaining in ${quest.targetRoom}`,
    { subsystem: "TooAngel" }
  );

  const existingAssignedCreeps = (quest.assignedCreeps || []).filter(creepName => Game.creeps[creepName]);
  const availableBuilders = getAvailableQuestBuilders();
  const intent = planBuildcsQuestLifecycle({
    quest,
    time: Game.time,
    targetVisible: true,
    constructionSiteCount: constructionSites.length,
    existingAssignedCreeps,
    availableBuilders: availableBuilders.map(builder => builder.name),
    maxBuilders: EXECUTOR_CONFIG.MAX_BUILDERS_PER_QUEST
  });

  quest.assignedCreeps = intent.assignedCreeps;

  if (intent.status) {
    quest.status = intent.status;
    quest.completedAt = intent.completedAt;
  }

  if (intent.notifyComplete) {
    logger.info(`Quest ${quest.id} (buildcs) completed! All construction sites built in ${quest.targetRoom}`, {
      subsystem: "TooAngel"
    });
    notifyQuestComplete(intent.notifyComplete.questId, intent.notifyComplete.success);
  }

  for (const assignment of intent.creepAssignments) {
    const creep = Game.creeps[assignment.creepName];
    if (!creep) continue;
    const memory = creep.memory as unknown as {
      questId?: string;
      questTarget?: string;
      questAction?: string;
    };
    const wasAssigned = memory.questId === assignment.questId;
    memory.questId = assignment.questId;
    memory.questTarget = assignment.questTarget;
    memory.questAction = assignment.questAction;
    if (!wasAssigned) {
      logger.info(`Assigned ${creep.name} to quest ${quest.id} (buildcs)`, { subsystem: "TooAngel" });
    }
  }
}

function getAvailableQuestBuilders(): Creep[] {
  const builders: Creep[] = [];
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    builders.push(
      ...room.find(FIND_MY_CREEPS, {
        filter: c => {
          const memory = c.memory as unknown as {
            role?: string;
            questId?: string;
            assistTarget?: string;
          };
          const role = memory.role;
          return (role === "larvaWorker" || role === "builder") && !memory.questId && !memory.assistTarget;
        }
      })
    );
  }
  return builders;
}

/**
 * Execute active quests
 */
export function executeQuests(): void {
  const mem = Memory as {
    tooangel?: {
      activeQuests?: Record<string, TooAngelQuestMemory>;
    };
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
      logger.warn(`Quest ${questId} missed deadline (${quest.deadline})`, { subsystem: "TooAngel" });
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
        logger.warn(`Unsupported quest type for execution: ${quest.type}`, { subsystem: "TooAngel" });
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
    };
  };

  const activeQuests = mem.tooangel?.activeQuests || {};

  for (const questId in activeQuests) {
    const quest = activeQuests[questId];

    if (!quest.assignedCreeps) {
      continue;
    }

    // Remove dead creeps
    quest.assignedCreeps = quest.assignedCreeps.filter(creepName => Game.creeps[creepName] !== undefined);
  }
}
