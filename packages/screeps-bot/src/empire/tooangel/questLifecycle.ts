import type { TooAngelQuestMemory } from "./types";

export interface BuildcsQuestSnapshot {
  quest: Pick<TooAngelQuestMemory, "id" | "type" | "status" | "targetRoom" | "deadline" | "assignedCreeps">;
  time: number;
  targetVisible: boolean;
  constructionSiteCount: number;
  existingAssignedCreeps: string[];
  availableBuilders: string[];
  maxBuilders: number;
}

export interface QuestLifecycleIntent {
  status?: TooAngelQuestMemory["status"];
  completedAt?: number;
  notifyComplete?: { questId: string; success: boolean };
  assignedCreeps: string[];
  creepAssignments: { creepName: string; questId: string; questTarget: string; questAction: "build" }[];
  skipReason?: "inactive" | "deadline-missed" | "target-not-visible" | "unsupported";
}

export function planBuildcsQuestLifecycle(snapshot: BuildcsQuestSnapshot): QuestLifecycleIntent {
  if (snapshot.quest.status !== "active") {
    return { assignedCreeps: snapshot.existingAssignedCreeps, creepAssignments: [], skipReason: "inactive" };
  }

  if (snapshot.quest.deadline > 0 && snapshot.time > snapshot.quest.deadline) {
    return {
      status: "failed",
      completedAt: snapshot.time,
      assignedCreeps: snapshot.existingAssignedCreeps,
      creepAssignments: [],
      skipReason: "deadline-missed"
    };
  }

  if (!snapshot.targetVisible) {
    return { assignedCreeps: snapshot.existingAssignedCreeps, creepAssignments: [], skipReason: "target-not-visible" };
  }

  if (snapshot.constructionSiteCount === 0) {
    return {
      status: "completed",
      completedAt: snapshot.time,
      notifyComplete: { questId: snapshot.quest.id, success: true },
      assignedCreeps: snapshot.existingAssignedCreeps,
      creepAssignments: []
    };
  }

  const assigned = [...snapshot.existingAssignedCreeps];
  for (const builder of snapshot.availableBuilders) {
    if (assigned.length >= snapshot.maxBuilders) break;
    if (!assigned.includes(builder)) assigned.push(builder);
  }

  return {
    assignedCreeps: assigned,
    creepAssignments: assigned.map(creepName => ({
      creepName,
      questId: snapshot.quest.id,
      questTarget: snapshot.quest.targetRoom,
      questAction: "build"
    }))
  };
}
