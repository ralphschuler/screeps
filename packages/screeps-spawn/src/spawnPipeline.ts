import { logger } from "@ralphschuler/screeps-core";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { energyFlowPredictor, powerBankHarvestingManager } from "./botIntegration";
import { optimizeBody } from "./bodyOptimizer";
import { isBootstrapMode, isEmergencySpawnState } from "./bootstrapManager";
import {
  analyzeDefenseAssistThreat,
  buildDefenseAssistBody,
  calculateThreatParitySquadSize,
  type DefenseAssistRole
} from "./defenseAssistBody";
import { analyzeDefenderNeeds, getCurrentDefenders } from "./defenderManager";
import { getEffectiveRoomEnergyAvailable } from "./roomEnergy";
import { createSpawnPlan, ensureRoomVisibleForSpawnAnalysis } from "./spawnIntentCompiler";
import { SpawnPriority, type SpawnRequest, spawnQueue } from "./spawnQueue";
import { executeSpawnRequest } from "./spawnRequestExecution";

const PREEMPTABLE_QUEUED_ROLES = new Set<SpawnRequest["role"]>([
  "pioneer",
  "remoteHarvester",
  "remoteHauler",
  "scout"
]);
const PREEMPTIVE_REPLAN_INTERVAL = 5;

interface SpawnPipelineCpuMemory {
  spawnPipeline?: {
    lastPreemptiveReplanTickByRoom?: Record<string, number>;
  };
}

function getLastPreemptiveReplanTicks(): Record<string, number> {
  const memory = Memory as unknown as SpawnPipelineCpuMemory;
  memory.spawnPipeline ??= {};
  memory.spawnPipeline.lastPreemptiveReplanTickByRoom ??= {};
  return memory.spawnPipeline.lastPreemptiveReplanTickByRoom;
}

interface SpawnPipelineSettingsMemory {
  spawnSettings?: {
    /** Set false to roll back claimer preemption while existing low-priority queues drain. */
    claimerPreemption?: boolean;
  };
}

function isClaimerPreemptionEnabled(): boolean {
  const mem = Memory as unknown as SpawnPipelineSettingsMemory;
  return mem.spawnSettings?.claimerPreemption !== false;
}

export interface SpawnPipelineResult {
  roomName: string;
  queued: number;
  spawned: number;
  stats: ReturnType<typeof spawnQueue.getQueueStats>;
}

/**
 * Populate spawn queue for a room.
 */
export function populateSpawnQueue(room: Room, swarm: SwarmState): void {
  ensureRoomVisibleForSpawnAnalysis(room);

  const queueSize = spawnQueue.getQueueSize(room.name);
  const bootstrapMode = isBootstrapMode(room.name, room);
  const emergencyRecoveryNeeded = isEmergencySpawnState(room.name) && !spawnQueue.hasEmergencySpawns(room.name);
  const defenderNeeds = analyzeDefenderNeeds(room);
  const currentDefenders = getCurrentDefenders(room);

  if (bootstrapMode) {
    if (queueSize > 0) {
      spawnQueue.clearQueue(room.name);
    }
    if (defenderNeeds.guards > 0 || defenderNeeds.rangers > 0 || defenderNeeds.healers > 0) {
      addDefenderRequests(room, swarm, defenderNeeds, currentDefenders);
    }
    for (const request of createSpawnPlan(room, swarm).requests) {
      spawnQueue.addRequest(request);
    }
    return;
  }

  if (defenderNeeds.guards > 0 || defenderNeeds.rangers > 0 || defenderNeeds.healers > 0) {
    addDefenderRequests(room, swarm, defenderNeeds, currentDefenders);
  }

  if (queueSize > 0 && !emergencyRecoveryNeeded) {
    addPreemptiveRequestsWhenMissing(room, swarm);
    return;
  }

  addPowerBankRequests(room);

  for (const request of createSpawnPlan(room, swarm).requests) {
    spawnQueue.addRequest(request);
  }

  const stats = spawnQueue.getQueueStats(room.name);
  logger.debug(
    `Populated spawn queue for ${room.name}: ${stats.total} requests (E:${stats.emergency}, H:${stats.high}, N:${stats.normal}, L:${stats.low})`,
    { subsystem: "SpawnPipeline" }
  );
}

export { buildSpawnMemory, executeSpawnRequest, generateSpawnCreepName } from "./spawnRequestExecution";

/**
 * Process queued spawn requests for a room.
 */
export function processSpawnQueue(room: Room): number {
  const availableSpawns = spawnQueue.getAvailableSpawns(room.name);
  if (availableSpawns.length === 0) {
    return 0;
  }

  let spawnsInitiated = 0;
  let availableEnergy = getEffectiveRoomEnergyAvailable(room);

  for (const spawn of availableSpawns) {
    const request = spawnQueue.getNextRequest(room.name, availableEnergy);
    if (!request) {
      break;
    }

    if (shouldDelaySpawn(room, request, availableEnergy)) {
      logger.debug(
        `Delaying spawn of ${request.role} (priority: ${request.priority}) - waiting for better energy availability`,
        { subsystem: "SpawnPipeline" }
      );
      break;
    }

    const result = executeSpawnRequest(spawn, request);

    if (result === OK) {
      spawnsInitiated++;
      availableEnergy -= request.body.cost;
      spawnQueue.markInProgress(room.name, request.id, spawn.id);
      spawnQueue.removeRequest(room.name, request.id);

      logger.info(
        `Spawned ${request.role} in ${room.name} (priority: ${request.priority}, cost: ${request.body.cost})`,
        { subsystem: "SpawnPipeline" }
      );
    } else if (result !== ERR_NOT_ENOUGH_ENERGY) {
      spawnQueue.removeRequest(room.name, request.id);
      logger.warn(`Spawn failed for ${request.role} in ${room.name}: ${result}`, { subsystem: "SpawnPipeline" });
    }
  }

  return spawnsInitiated;
}

/**
 * Spawn Interface for room-level callers: plan, queue, and process spawn work.
 */
export function runSpawnPipeline(room: Room, swarm: SwarmState): SpawnPipelineResult {
  populateSpawnQueue(room, swarm);
  const spawned = processSpawnQueue(room);
  const stats = spawnQueue.getQueueStats(room.name);

  if (spawned > 0) {
    logger.debug(`Spawned ${spawned} creeps in ${room.name}`, { subsystem: "SpawnPipeline" });
  }

  if (Game.time % 100 === 0) {
    logger.debug(`Spawn queue stats for ${room.name}: ${stats.total} pending (${stats.inProgress} in progress)`, {
      subsystem: "SpawnPipeline"
    });
  }

  return {
    roomName: room.name,
    queued: stats.total,
    spawned,
    stats
  };
}

function addPreemptiveRequestsWhenMissing(room: Room, swarm: SwarmState): void {
  const lastReplanTicks = getLastPreemptiveReplanTicks();
  const lastReplanTick = lastReplanTicks[room.name] ?? -Infinity;
  if (Game.time - lastReplanTick < PREEMPTIVE_REPLAN_INTERVAL) return;
  lastReplanTicks[room.name] = Game.time;

  const queuedRequestKeys = new Set(spawnQueue.getPendingRequests(room.name).map(getSpawnRequestDedupeKey));

  for (const request of createSpawnPlan(room, swarm).requests) {
    const isPriorityUpgrader = request.role === "upgrader" && request.priority >= SpawnPriority.HIGH;
    const isClaimerPreemption = request.role === "claimer" && isClaimerPreemptionEnabled();
    const isDefenseAssistPreemption = isDefenseAssistRequest(request);
    if (
      !PREEMPTABLE_QUEUED_ROLES.has(request.role) &&
      !isPriorityUpgrader &&
      !isClaimerPreemption &&
      !isDefenseAssistPreemption
    ) continue;

    const requestKey = getSpawnRequestDedupeKey(request);
    if (queuedRequestKeys.has(requestKey)) continue;

    spawnQueue.addRequest(request);
    queuedRequestKeys.add(requestKey);
  }
}

function getSpawnRequestDedupeKey(request: SpawnRequest): string {
  const task = (request.additionalMemory as { task?: string } | undefined)?.task ?? "";
  return `${request.role}:${request.targetRoom ?? ""}:${task}`;
}

function isDefenseAssistRequest(request: SpawnRequest): boolean {
  return (
    request.priority >= SpawnPriority.HIGH &&
    (request.additionalMemory as { task?: string; assistTarget?: string } | undefined)?.task === "defenseAssist"
  );
}

function addDefenderRequests(
  room: Room,
  swarm: SwarmState,
  needs: ReturnType<typeof analyzeDefenderNeeds>,
  current: ReturnType<typeof getCurrentDefenders>
): void {
  const maxEnergy = room.energyCapacityAvailable;
  const emergencyEnergy = getEffectiveRoomEnergyAvailable(room);
  const priority = needs.urgency >= 2.0 || swarm.danger >= 3 ? SpawnPriority.EMERGENCY : SpawnPriority.HIGH;

  const threatProfile = analyzeDefenseAssistThreat(getActualHostileCreeps(room));
  const defenderEnergy = priority === SpawnPriority.EMERGENCY ? emergencyEnergy : maxEnergy;
  const pendingDefenders = getPendingDefenderCounts(room.name, maxEnergy);
  const guardsTarget = getThreatParityDefenderTarget("guard", needs.guards, defenderEnergy, threatProfile);
  const guardsNeeded = Math.max(0, guardsTarget - current.guards - pendingDefenders.guards);
  const guardBody = getThreatParityDefenderBody("guard", defenderEnergy, threatProfile);
  for (let i = 0; i < guardsNeeded; i++) {
    addOptimizedRequest(
      room,
      "guard",
      "military",
      priority,
      defenderEnergy,
      `guard_defense_${Game.time}_${i}`,
      guardBody
    );
  }

  const rangersTarget = getThreatParityDefenderTarget("ranger", needs.rangers, defenderEnergy, threatProfile);
  const rangersNeeded = Math.max(0, rangersTarget - current.rangers - pendingDefenders.rangers);
  const rangerBody = getThreatParityDefenderBody("ranger", defenderEnergy, threatProfile);
  for (let i = 0; i < rangersNeeded; i++) {
    addOptimizedRequest(
      room,
      "ranger",
      "military",
      priority,
      defenderEnergy,
      `ranger_defense_${Game.time}_${i}`,
      rangerBody
    );
  }

  const healersTarget = getThreatParityDefenderTarget("healer", needs.healers, maxEnergy, threatProfile);
  const healersNeeded = Math.max(0, healersTarget - current.healers - pendingDefenders.healers);
  const healerBody = getThreatParityDefenderBody("healer", maxEnergy, threatProfile);
  if (healersNeeded > 0 && needs.urgency >= 1.5) {
    for (let i = 0; i < healersNeeded; i++) {
      addOptimizedRequest(
        room,
        "healer",
        "military",
        SpawnPriority.HIGH,
        maxEnergy,
        `healer_defense_${Game.time}_${i}`,
        healerBody
      );
    }
  }

  if (guardsNeeded > 0 || rangersNeeded > 0 || healersNeeded > 0) {
    logger.info(
      `Added defender spawn requests: ${guardsNeeded} guards, ${rangersNeeded} rangers, ${healersNeeded} healers (priority: ${priority})`,
      { subsystem: "SpawnPipeline" }
    );
  }
}

function getThreatParityDefenderTarget(
  role: DefenseAssistRole,
  baseNeed: number,
  energyCapacity: number,
  threatProfile: ReturnType<typeof analyzeDefenseAssistThreat>
): number {
  if (baseNeed <= 0 || !threatProfile) return baseNeed;
  return Math.max(baseNeed, calculateThreatParitySquadSize(role, energyCapacity, threatProfile));
}

function getThreatParityDefenderBody(
  role: DefenseAssistRole,
  energyCapacity: number,
  threatProfile: ReturnType<typeof analyzeDefenseAssistThreat>
): ReturnType<typeof buildDefenseAssistBody> {
  if (!threatProfile) return null;
  return buildDefenseAssistBody(role, energyCapacity, threatProfile);
}

function getPendingDefenderCounts(roomName: string, energyCapacity: number): { guards: number; rangers: number; healers: number } {
  const counts = { guards: 0, rangers: 0, healers: 0 };
  for (const request of spawnQueue.getPendingRequests(roomName)) {
    if (Game.time - request.createdAt > 1500) continue;
    if (request.body.cost > energyCapacity) continue;
    if (request.role === "guard") counts.guards++;
    if (request.role === "ranger") counts.rangers++;
    if (request.role === "healer") counts.healers++;
  }
  return counts;
}

function addPowerBankRequests(room: Room): void {
  const requests = powerBankHarvestingManager.requestSpawns(room.name);

  if (requests.powerHarvesters === 0 && requests.healers === 0 && requests.powerCarriers === 0) {
    return;
  }

  const maxEnergy = room.energyCapacityAvailable;
  const priority = SpawnPriority.NORMAL;

  for (let i = 0; i < requests.powerHarvesters; i++) {
    addOptimizedRequest(room, "powerHarvester", "power", priority, maxEnergy, `powerHarvester_${Game.time}_${i}`);
  }

  for (let i = 0; i < requests.healers; i++) {
    addOptimizedRequest(room, "healer", "military", priority, maxEnergy, `healer_powerBank_${Game.time}_${i}`);
  }

  for (let i = 0; i < requests.powerCarriers; i++) {
    addOptimizedRequest(room, "powerCarrier", "power", priority, maxEnergy, `powerCarrier_${Game.time}_${i}`);
  }

  logger.info(
    `Added power bank spawn requests: ${requests.powerHarvesters} harvesters, ${requests.healers} healers, ${requests.powerCarriers} carriers`,
    { subsystem: "SpawnPipeline" }
  );
}

function addOptimizedRequest(
  room: Room,
  role: SpawnRequest["role"],
  family: SpawnRequest["family"],
  priority: SpawnPriority,
  maxEnergy: number,
  id: string,
  bodyOverride: SpawnRequest["body"] | null = null
): void {
  try {
    const body = bodyOverride ?? optimizeBody({ maxEnergy, role });
    if (body.cost > maxEnergy) {
      logger.warn(`Skipping unspawnable ${role} request in ${room.name}: body cost ${body.cost} exceeds ${maxEnergy}`, {
        subsystem: "SpawnPipeline"
      });
      return;
    }
    spawnQueue.addRequest({
      id,
      roomName: room.name,
      role,
      family,
      body,
      priority,
      createdAt: Game.time
    });
  } catch (error) {
    logger.error(`Failed to create ${role} spawn request: ${error}`, {
      subsystem: "SpawnPipeline"
    });
  }
}

function shouldDelaySpawn(room: Room, request: SpawnRequest, availableEnergy = room.energyAvailable): boolean {
  if (request.priority >= SpawnPriority.HIGH) {
    return false;
  }

  const currentEnergy = availableEnergy;
  const bodyCost = request.body.cost;

  if (currentEnergy < bodyCost) {
    return false;
  }

  if (request.role === "scout") {
    return false;
  }

  if (request.priority < SpawnPriority.NORMAL) {
    const prediction = energyFlowPredictor.predictEnergyInTicks(room, 50);

    if (prediction.netFlow < 0) {
      return true;
    }

    const energyPercent = currentEnergy / room.energyCapacityAvailable;
    if (energyPercent < 0.5) {
      return true;
    }
  }

  if (request.priority === SpawnPriority.NORMAL) {
    const energyPercent = currentEnergy / room.energyCapacityAvailable;

    if (energyPercent < 0.3) {
      const prediction = energyFlowPredictor.predictEnergyInTicks(room, 25);

      if (prediction.netFlow > 0) {
        return true;
      }
    }
  }

  return false;
}
