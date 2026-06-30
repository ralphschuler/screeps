const REMOTE_WORKER_REPAIR_TARGET_RATIO = 0.75;
const REMOTE_WORKER_MAX_PER_REMOTE = 2;
const REMOTE_WORKER_WORK_ITEMS_PER_EXTRA_CREEP = 5;

/**
 * Remote workers only maintain mining infrastructure.
 * This keeps spawn demand tied to visible construction/repair work rather than
 * treating remoteWorker as a generic remote hauler fallback.
 */
export function isRemoteWorkerRepairTarget(structure: Structure): boolean {
  return (
    (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_ROAD) &&
    structure.hits < structure.hitsMax * REMOTE_WORKER_REPAIR_TARGET_RATIO
  );
}

/** Count visible remote construction/repair items that justify remoteWorker spawns. */
export function getRemoteWorkerWorkItemCount(room: Room): number {
  const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES).length;
  const repairTargets = room.find(FIND_STRUCTURES, { filter: isRemoteWorkerRepairTarget }).length;
  return constructionSites + repairTargets;
}

/**
 * Return how many remoteWorkers a visible remote can use right now.
 * Invisible remotes return zero because work cannot be verified safely.
 */
export function getRemoteWorkerMaxPerRemote(room: Room | undefined): number {
  if (!room) return 0;

  const workItems = getRemoteWorkerWorkItemCount(room);
  if (workItems === 0) return 0;

  return Math.min(
    REMOTE_WORKER_MAX_PER_REMOTE,
    Math.max(1, Math.ceil(workItems / REMOTE_WORKER_WORK_ITEMS_PER_EXTRA_CREEP))
  );
}
