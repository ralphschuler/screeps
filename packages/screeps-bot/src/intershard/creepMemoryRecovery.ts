interface StrandedCreepMission {
  role: "interShardScout" | "interShardClaimer" | "interShardPioneer";
  family: "utility" | "economy";
  task: "interShardFootprint" | "interShardClaim" | "interShardBootstrap";
}

const STRANDED_CREEP_MISSIONS: readonly StrandedCreepMission[] = [
  {
    role: "interShardScout",
    family: "utility",
    task: "interShardFootprint"
  },
  {
    role: "interShardClaimer",
    family: "utility",
    task: "interShardClaim"
  },
  {
    role: "interShardPioneer",
    family: "economy",
    task: "interShardBootstrap"
  }
];

/**
 * Recover pre-handoff operation creeps already stranded on an unowned target shard.
 *
 * Generated names retain the role even though shard-local Memory is empty. The
 * destination room is the safest available starting point; normal behavior can
 * then continue room discovery or claim/bootstrap work.
 */
export function recoverStrandedInterShardCreepMemory(creep: Creep, currentShard: string): boolean {
  const existingRole = (creep.memory as CreepMemory & { role?: unknown }).role;
  if (typeof existingRole === "string") return false;

  if (typeof creep.name !== "string") return false;
  const mission = STRANDED_CREEP_MISSIONS.find(candidate => creep.name.startsWith(`${candidate.role}_`));
  if (!mission) return false;

  creep.memory = {
    role: mission.role,
    family: mission.family,
    homeRoom: creep.room.name,
    targetRoom: creep.room.name,
    targetShard: currentShard,
    task: mission.task,
    workflowState: "arrived",
    version: 1
  } as unknown as CreepMemory;
  return true;
}
