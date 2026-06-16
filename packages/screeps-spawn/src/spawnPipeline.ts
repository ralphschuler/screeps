import { logger } from "@ralphschuler/screeps-core";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { energyFlowPredictor, powerBankHarvestingManager } from "./botIntegration";
import { optimizeBody } from "./bodyOptimizer";
import { isBootstrapMode, isEmergencySpawnState } from "./bootstrapManager";
import {
  addCombatPower,
  analyzeDefenseAssistThreat,
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  type CombatPower,
  type DefenseAssistRole,
  type ExistingDefensePower
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
  const pendingDefenders = getPendingDefenderPower(room.name, maxEnergy);
  const activeDefenderPower = getActiveDefenderPower(room);
  const existingPower = mergeDefensePower(activeDefenderPower, pendingDefenders.power);
  const plan = calculateAggregateDefenseResponsePlan(
    defenderEnergy,
    threatProfile,
    {
      guard: Math.max(0, needs.guards - current.guards - pendingDefenders.counts.guards),
      ranger: Math.max(0, needs.rangers - current.rangers - pendingDefenders.counts.rangers),
      healer: Math.max(0, needs.healers - current.healers - pendingDefenders.counts.healers)
    },
    existingPower
  );

  const guardsNeeded = plan.counts.guard;
  const guardBody = plan.bodies.guard ?? getThreatParityDefenderBody("guard", defenderEnergy, threatProfile);
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

  const rangersNeeded = plan.counts.ranger;
  const rangerBody = plan.bodies.ranger ?? getThreatParityDefenderBody("ranger", defenderEnergy, threatProfile);
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

  const healersNeeded = plan.counts.healer;
  const healerBody = plan.bodies.healer ?? getThreatParityDefenderBody("healer", defenderEnergy, threatProfile);
  if (healersNeeded > 0 && (needs.urgency >= 1.5 || plan.healerFloor > 0)) {
    for (let i = 0; i < healersNeeded; i++) {
      addOptimizedRequest(
        room,
        "healer",
        "military",
        SpawnPriority.HIGH,
        defenderEnergy,
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

function getThreatParityDefenderBody(
  role: DefenseAssistRole,
  energyCapacity: number,
  threatProfile: ReturnType<typeof analyzeDefenseAssistThreat>
): ReturnType<typeof buildDefenseAssistBody> {
  if (!threatProfile) return null;
  return buildDefenseAssistBody(role, energyCapacity, threatProfile);
}

function addRolePower(power: ExistingDefensePower, role: DefenseAssistRole, parts: Array<BodyPartConstant | BodyPartDefinition>): void {
  const bodyPower = calculateCombatPower(parts);
  power[role] = power[role] ? addCombatPower(power[role]!, bodyPower) : bodyPower;
}

function mergeDefensePower(a: ExistingDefensePower, b: ExistingDefensePower): ExistingDefensePower {
  const merged: ExistingDefensePower = { ...a };
  for (const role of ["guard", "ranger", "healer"] as const) {
    const power = b[role];
    if (power) merged[role] = merged[role] ? addCombatPower(merged[role]!, power) : power;
  }
  return merged;
}

function getActiveDefenderPower(room: Room): ExistingDefensePower {
  const power: ExistingDefensePower = {};
  for (const creep of room.find(FIND_MY_CREEPS)) {
    if ((creep as { spawning?: boolean }).spawning) continue;
    const role = (creep.memory as { role?: string }).role;
    if (role !== "guard" && role !== "ranger" && role !== "healer") continue;
    const activeBody = (creep.body ?? []).filter(part => part.hits > 0);
    if (activeBody.length === 0) continue;
    addRolePower(power, role, activeBody);
  }
  return power;
}

function getPendingDefenderPower(
  roomName: string,
  energyCapacity: number
): { counts: { guards: number; rangers: number; healers: number }; power: ExistingDefensePower } {
  const counts = { guards: 0, rangers: 0, healers: 0 };
  const power: ExistingDefensePower = {};
  for (const request of spawnQueue.getPendingRequests(roomName)) {
    if (Game.time - request.createdAt > 1500) continue;
    if (request.body.cost > energyCapacity) continue;
    if (request.role === "guard") {
      counts.guards++;
      addRolePower(power, "guard", request.body.parts);
    }
    if (request.role === "ranger") {
      counts.rangers++;
      addRolePower(power, "ranger", request.body.parts);
    }
    if (request.role === "healer") {
      counts.healers++;
      addRolePower(power, "healer", request.body.parts);
    }
  }
  return { counts, power };
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
