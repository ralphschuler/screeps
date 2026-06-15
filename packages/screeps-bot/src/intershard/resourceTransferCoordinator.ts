/**
 * Bot intershard resource transfer coordinator adapter.
 *
 * The framework intershard package owns transfer request lifecycle logic. This
 * runtime adapter injects the real spawn body planner and spawn queue so the
 * reusable package can stay independent from `@ralphschuler/screeps-spawn` and
 * `packages/screeps-bot`.
 */

import { configureResourceTransferCoordinator } from "@ralphschuler/screeps-intershard";
import { optimizeBody, SpawnPriority, spawnQueue } from "@ralphschuler/screeps-spawn";
import type { SpawnRequest as RuntimeSpawnRequest } from "@ralphschuler/screeps-spawn";

configureResourceTransferCoordinator({
  optimizeBody,
  spawnQueue: {
    addRequest: request => spawnQueue.addRequest(request as unknown as RuntimeSpawnRequest)
  },
  spawnPriorities: {
    LOW: SpawnPriority.LOW,
    NORMAL: SpawnPriority.NORMAL,
    HIGH: SpawnPriority.HIGH
  }
});

export {
  configureResourceTransferCoordinator,
  ResourceTransferCoordinator,
  resourceTransferCoordinator
} from "@ralphschuler/screeps-intershard";
export type {
  CrossShardTransferRequest,
  ResourceTransferCoordinatorDependencies,
  ResourceTransferSpawnPriorities
} from "@ralphschuler/screeps-intershard";
