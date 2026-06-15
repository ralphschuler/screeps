/**
 * Offensive Operations Coordinator
 *
 * High-level coordinator for offensive military operations.
 * Manages the complete offensive workflow:
 * 1. Target selection
 * 2. Doctrine determination
 * 3. Squad creation
 * 4. Squad formation
 * 5. Operation execution
 * 6. Operation completion → conquest handoff to ExpansionManager
 *
 * CRITICAL: Operations are stored in Memory.empire.offensiveOperations so they
 * survive global resets. A module-level Map would be lost after any reset.
 *
 * Implements ROADMAP Section 12: Offensive Combat
 */

import type { ClusterMemory } from "./types";
import { logger } from "@ralphschuler/screeps-core";
import { memoryManager } from "./adapters/memoryAdapter";
import { findAttackTargets, markRoomAttacked, validateTarget } from "./attackTargetSelector";
import { type OffensiveDoctrine, canLaunchDoctrine, selectDoctrine } from "./offensiveDoctrine";
import { createOffensiveSquad, shouldDissolveSquad, validateSquadState } from "./squadCoordinator";
import { isSquadForming, startSquadFormation, updateSquadFormations } from "./squadFormationManager";

const MAX_CONCURRENT_OPS = 2;
const FORMATION_TIMEOUT = 1000;
const COMPLETED_OP_RETENTION = 5000;

// ---------------------------------------------------------------------------
// Memory persistence helpers
// ---------------------------------------------------------------------------

export interface OffensiveOperation {
  id: string;
  clusterId: string;
  targetRoom: string;
  doctrine: OffensiveDoctrine;
  squadIds: string[];
  state: "planning" | "forming" | "executing" | "complete" | "failed";
  createdAt: number;
  lastUpdate: number;
  isAllyAssist?: boolean;
  allyName?: string;
  /** True when the target room is clear and ready for a claimer. */
  readyForClaim?: boolean;
}

function getOpsStore(): Record<string, OffensiveOperation> {
  const empire = memoryManager.getEmpire();
  if (!empire.offensiveOperations) {
    empire.offensiveOperations = {} as any;
  }
  return empire.offensiveOperations as Record<string, OffensiveOperation>;
}

function getActiveOps(): OffensiveOperation[] {
  return Object.values(getOpsStore()).filter(
    op => op.state !== "complete" && op.state !== "failed"
  );
}

function getClusterActiveOps(clusterId: string): OffensiveOperation[] {
  return getActiveOps().filter(op => op.clusterId === clusterId);
}

function getStoredOp(id: string): OffensiveOperation | undefined {
  return getOpsStore()[id];
}

function saveOp(op: OffensiveOperation): void {
  getOpsStore()[op.id] = op;
}

function _deleteOp(id: string): void {
  delete getOpsStore()[id];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function planOffensiveOperations(cluster: ClusterMemory): void {
  if (cluster.role !== "war" && cluster.role !== "mixed") return;

  const activeOps = getClusterActiveOps(cluster.id);

  if (activeOps.length >= MAX_CONCURRENT_OPS) {
    logger.debug(`Cluster ${cluster.id} at max operations (${activeOps.length})`, {
      subsystem: "Offensive"
    });
    return;
  }

  const targets = findAttackTargets(cluster, 10, 3);
  if (targets.length === 0) {
    logger.debug(`No attack targets found for cluster ${cluster.id}`, {
      subsystem: "Offensive"
    });
    return;
  }

  const target = targets[0]!;

  if (!canLaunchDoctrine(cluster, target.doctrine)) {
    logger.info(
      `Cluster ${cluster.id} cannot launch ${target.doctrine} doctrine (insufficient resources)`,
      { subsystem: "Offensive" }
    );
    return;
  }

  launchOffensiveOperation(cluster, target.roomName, target.doctrine);
}

export function launchOffensiveOperation(
  cluster: ClusterMemory,
  targetRoom: string,
  doctrine?: OffensiveDoctrine
): OffensiveOperation | null {
  if (!validateTarget(targetRoom)) {
    logger.warn(`Invalid target ${targetRoom}`, { subsystem: "Offensive" });
    return null;
  }

  const empire = memoryManager.getEmpire();
  const knownRooms = empire.knownRooms || {};
  const intel = knownRooms[targetRoom];
  const finalDoctrine =
    doctrine ??
    selectDoctrine(targetRoom, {
      towerCount: intel?.towerCount,
      spawnCount: intel?.spawnCount,
      rcl: intel?.controllerLevel,
      owner: intel?.owner
    });

  if (!canLaunchDoctrine(cluster, finalDoctrine)) {
    logger.warn(
      `Cannot launch ${finalDoctrine} operation on ${targetRoom} - insufficient resources`,
      { subsystem: "Offensive" }
    );
    return null;
  }

  const opId = `op_${cluster.id}_${targetRoom}_${Game.time}`;
  const op: OffensiveOperation = {
    id: opId,
    clusterId: cluster.id,
    targetRoom,
    doctrine: finalDoctrine,
    squadIds: [],
    state: "planning",
    createdAt: Game.time,
    lastUpdate: Game.time
  };

  saveOp(op);

  const squadType = finalDoctrine === "harassment" ? "harass" : finalDoctrine;
  const squad = createOffensiveSquad(cluster, targetRoom, squadType, {
    towerCount: intel?.towerCount,
    spawnCount: intel?.spawnCount
  });

  cluster.squads.push(squad);
  op.squadIds.push(squad.id);
  saveOp(op);

  startSquadFormation(cluster, squad);
  op.state = "forming";
  op.lastUpdate = Game.time;
  saveOp(op);

  markRoomAttacked(targetRoom);

  logger.info(
    `Launched ${finalDoctrine} operation ${opId} on ${targetRoom} with squad ${squad.id}`,
    { subsystem: "Offensive" }
  );

  return op;
}

export function updateOffensiveOperations(): void {
  updateSquadFormations();

  const store = getOpsStore();
  for (const id in store) {
    const op = store[id]!;
    updateSingleOperation(op);
  }

  cleanupOperations();
}

// ---------------------------------------------------------------------------
// Update helpers
// ---------------------------------------------------------------------------

function updateSingleOperation(op: OffensiveOperation): void {
  op.lastUpdate = Game.time;

  const cluster = memoryManager.getCluster(op.clusterId);
  if (!cluster) {
    op.state = "failed";
    saveOp(op);
    logger.error(`Cluster ${op.clusterId} not found for operation ${op.id}`, {
      subsystem: "Offensive"
    });
    return;
  }

  switch (op.state) {
    case "forming":
      updateFormingOperation(op, cluster);
      break;
    case "executing":
      updateExecutingOperation(op, cluster);
      break;
  }
}

function updateFormingOperation(op: OffensiveOperation, _cluster: ClusterMemory): void {
  const allFormed = op.squadIds.every(squadId => !isSquadForming(squadId));

  if (allFormed) {
    op.state = "executing";
    logger.info(`Operation ${op.id} entering execution phase`, { subsystem: "Offensive" });
  }

  if (Game.time - op.createdAt > FORMATION_TIMEOUT) {
    op.state = "failed";
    logger.warn(`Operation ${op.id} formation timed out`, { subsystem: "Offensive" });
  }

  saveOp(op);
}

function updateExecutingOperation(op: OffensiveOperation, cluster: ClusterMemory): void {
  for (const squadId of op.squadIds) {
    const squad = cluster.squads.find(s => s.id === squadId);
    if (!squad) continue;

    validateSquadState(squad);

    if (shouldDissolveSquad(squad)) {
      logger.info(`Squad ${squadId} dissolving, operation ${op.id} may complete`, {
        subsystem: "Offensive"
      });
      const index = cluster.squads.findIndex(s => s.id === squadId);
      if (index >= 0) cluster.squads.splice(index, 1);
    }
  }

  const activeSquads = op.squadIds.filter(squadId =>
    cluster.squads.some(s => s.id === squadId)
  );

  checkAndHandleConquest(op);

  if (activeSquads.length === 0) {
    op.state = "complete";
    logger.info(`Operation ${op.id} complete`, { subsystem: "Offensive" });
  }

  saveOp(op);
}

/**
 * After clearing a room, mark it so the expansion system can send a claimer.
 * We clear the owner in intel and set readyForClaim so follow-up logic
 * (either through expansion queue or manual mark) can pick it up.
 */
function checkAndHandleConquest(op: OffensiveOperation): void {
  const empire = memoryManager.getEmpire();
  const intel = empire.knownRooms?.[op.targetRoom];

  if (!intel) return;

  const room = Game.rooms[op.targetRoom];
  if (!room || !room.controller) return;

  const myUsername = getMyUsername();

  const isCleared =
    !room.controller.owner &&
    (!room.controller.reservation || room.controller.reservation.username === myUsername);

  if (isCleared && !op.readyForClaim) {
    op.readyForClaim = true;

    // Clear the owner in intel so the expansion system sees it as claimable
    intel.owner = undefined;
    intel.reserver = undefined;
    intel.threatLevel = 0;

    logger.info(
      `Room ${op.targetRoom} cleared by operation ${op.id} — flagged for claiming`,
      { subsystem: "Offensive" }
    );

    // Add to claim queue immediately for rapid takeover.
    // EmpireMemory may not have claimQueue typed in this package,
    // so we access via any for cross-package compatibility.
    const claimQueue = (empire as any).claimQueue as Array<{ roomName: string; score: number; distance: number; claimed: boolean; lastEvaluated: number }> | undefined;
    const candidate = claimQueue?.find((c: any) => c.roomName === op.targetRoom);
    if (!candidate) {
      if (!claimQueue) {
        (empire as any).claimQueue = [];
      }
      (empire as any).claimQueue.push({
        roomName: op.targetRoom,
        score: 100,
        distance: 0,
        claimed: false,
        lastEvaluated: Game.time
      });
      (empire as any).claimQueue.sort((a: any, b: any) => b.score - a.score);
    }
  }
}

function cleanupOperations(): void {
  const store = getOpsStore();
  for (const id in store) {
    const op = store[id]!;
    if (
      (op.state === "complete" || op.state === "failed") &&
      Game.time - op.createdAt > COMPLETED_OP_RETENTION
    ) {
      delete store[id];
      logger.debug(`Cleaned up operation ${id}`, { subsystem: "Offensive" });
    }
  }
}

// ---------------------------------------------------------------------------
// Utility exports
// ---------------------------------------------------------------------------

export function getOperationStatus(operationId: string): OffensiveOperation | null {
  return getStoredOp(operationId) ?? null;
}

export function getClusterOperations(clusterId: string): OffensiveOperation[] {
  return getActiveOps().filter(op => op.clusterId === clusterId);
}

export function getAllOperations(): OffensiveOperation[] {
  return Object.values(getOpsStore());
}

export function cancelOperation(operationId: string): void {
  const op = getStoredOp(operationId);
  if (!op) return;
  op.state = "failed";
  saveOp(op);
  logger.info(`Cancelled operation ${operationId}`, { subsystem: "Offensive" });
}

function getMyUsername(): string {
  const spawns = Object.values(Game.spawns);
  return spawns.length > 0 ? spawns[0].owner.username : "";
}
