import type { SwarmCreepMemory } from "@ralphschuler/screeps-memory";

export const DEFENSE_ASSIST_TASK = "defenseAssist" as const;

export type DefenseAssistStagingMemory = Pick<
  SwarmCreepMemory,
  | "assistTarget"
  | "targetRoom"
  | "task"
  | "defenseSquadId"
  | "defenseSquadSize"
  | "defenseSquadCreatedAt"
  | "defenseAssistReleasedAt"
  | "defenseAssistReleaseReason"
>;

export interface DefenseAssistStagingOptions {
  homeRoom: string;
  targetRoom: string;
  now: number;
  squadSize: number;
  squadId?: string;
  createdAt?: number;
}

export function createDefenseAssistSquadId(homeRoom: string, targetRoom: string, createdAt: number): string {
  return `defenseAssist:${homeRoom}:${targetRoom}:${createdAt}`;
}

export function createDefenseAssistMemory(options: DefenseAssistStagingOptions): DefenseAssistStagingMemory {
  const createdAt = options.createdAt ?? options.now;
  return {
    assistTarget: options.targetRoom,
    targetRoom: options.targetRoom,
    task: DEFENSE_ASSIST_TASK,
    defenseSquadId: options.squadId ?? createDefenseAssistSquadId(options.homeRoom, options.targetRoom, createdAt),
    defenseSquadSize: Math.max(1, options.squadSize),
    defenseSquadCreatedAt: createdAt
  };
}

export function stageDefenseAssistCreep(creep: Pick<Creep, "memory">, options: DefenseAssistStagingOptions): void {
  Object.assign(creep.memory as unknown as DefenseAssistStagingMemory, createDefenseAssistMemory(options));
}

export function getDefenseAssistTargetRoom(memory: Partial<DefenseAssistStagingMemory>): string | undefined {
  return memory.assistTarget ?? (memory.task === DEFENSE_ASSIST_TASK ? memory.targetRoom : undefined);
}

export function clearDefenseAssistMemory(memory: Partial<DefenseAssistStagingMemory>): void {
  delete memory.assistTarget;
  delete memory.defenseSquadId;
  delete memory.defenseSquadSize;
  delete memory.defenseSquadCreatedAt;
  delete memory.defenseAssistReleasedAt;
  delete memory.defenseAssistReleaseReason;
  if (memory.task === DEFENSE_ASSIST_TASK) {
    delete memory.task;
    delete memory.targetRoom;
  }
}
