import { logger } from "@ralphschuler/screeps-core";
import {
  addCombatPower,
  analyzeDefenseAssistThreat,
  buildDefenseAssistBody,
  calculateAggregateDefenseResponsePlan,
  calculateCombatPower,
  getActualHostileCreeps,
  type DefenseAssistRole,
  type ExistingDefensePower
} from "@ralphschuler/screeps-defense";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { energyFlowPredictor, powerBankHarvestingManager, type PowerBankOperationSpawnRequest } from "./botIntegration";
import { optimizeBody } from "./bodyOptimizer";
import { isBootstrapMode, isEmergencySpawnState } from "./bootstrapManager";
import { analyzeDefenderNeeds, getCurrentDefenders } from "./defenderManager";
import { getAffordableEmergencyDefenderFallback } from "./emergencyDefenseBody";
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
const AFFORDABLE_EMERGENCY_DEFENDER_FALLBACK_LIMIT = 3;
const LOCAL_DEFENSE_ROLES = new Set<SpawnRequest["role"]>(["guard", "ranger", "healer"]);
const DEFENSE_ASSIST_TASK = "defenseAssist";
const DEFENSE_REFUEL_TASK = "defenseRefuel";

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

function hasCompletedLocalSpawnCapacity(room: Room): boolean {
  return room.find(FIND_MY_SPAWNS).length > 0 && room.energyCapacityAvailable > 0;
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
  if (!hasCompletedLocalSpawnCapacity(room)) {
    if (queueSize > 0) {
      spawnQueue.clearQueue(room.name);
    }
    return;
  }

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

  addPowerBankRequests(room);

  if (queueSize > 0 && !emergencyRecoveryNeeded) {
    addPreemptiveRequestsWhenMissing(room, swarm);
    return;
  }

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
    const isDefenseRefuelPreemption = isDefenseRefuelRequest(request);
    if (
      !PREEMPTABLE_QUEUED_ROLES.has(request.role) &&
      !isPriorityUpgrader &&
      !isClaimerPreemption &&
      !isDefenseAssistPreemption &&
      !isDefenseRefuelPreemption
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
    (request.additionalMemory as { task?: string; assistTarget?: string } | undefined)?.task === DEFENSE_ASSIST_TASK
  );
}

function isDefenseRefuelRequest(request: SpawnRequest): boolean {
  return (
    request.priority >= SpawnPriority.EMERGENCY &&
    request.role === "hauler" &&
    (request.additionalMemory as { task?: string } | undefined)?.task === DEFENSE_REFUEL_TASK
  );
}

function isHardDefenseThreat(threatProfile: ReturnType<typeof analyzeDefenseAssistThreat>): boolean {
  const strongest = threatProfile?.strongest;
  return Boolean(strongest && (strongest.partCount >= 25 || strongest.score >= 250));
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
  const defenderEnergy = isHardDefenseThreat(threatProfile)
    ? maxEnergy
    : priority === SpawnPriority.EMERGENCY
      ? emergencyEnergy
      : maxEnergy;
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
  if (guardsNeeded > 0 && guardBody) {
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
  }

  const rangersNeeded = plan.counts.ranger;
  const rangerBody = plan.bodies.ranger ?? getThreatParityDefenderBody("ranger", defenderEnergy, threatProfile);
  if (rangersNeeded > 0 && rangerBody) {
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
  }

  const healersNeeded = plan.counts.healer;
  const healerBody = plan.bodies.healer ?? getThreatParityDefenderBody("healer", defenderEnergy, threatProfile);
  if (healersNeeded > 0 && healerBody && (needs.urgency >= 1.5 || plan.healerFloor > 0)) {
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

  addAffordableEmergencyDefenderFallback(room, priority, emergencyEnergy, threatProfile);

  if (guardsNeeded > 0 || rangersNeeded > 0 || healersNeeded > 0) {
    logger.info(
      `Added defender spawn requests: ${guardsNeeded} guards, ${rangersNeeded} rangers, ${healersNeeded} healers (priority: ${priority})`,
      { subsystem: "SpawnPipeline" }
    );
  }
}

function addAffordableEmergencyDefenderFallback(
  room: Room,
  priority: SpawnPriority,
  availableEnergy: number,
  threatProfile: ReturnType<typeof analyzeDefenseAssistThreat>
): void {
  if (priority < SpawnPriority.EMERGENCY) return;
  if (countAffordableEmergencyLocalDefenders(room, availableEnergy) >= AFFORDABLE_EMERGENCY_DEFENDER_FALLBACK_LIMIT) return;

  const fallback = getAffordableEmergencyDefenderFallback(availableEnergy, threatProfile);
  if (!fallback) return;

  addOptimizedRequest(
    room,
    fallback.role,
    "military",
    SpawnPriority.EMERGENCY,
    availableEnergy,
    `${fallback.role}_defense_affordable_${Game.time}`,
    fallback.body
  );
}

function countAffordableEmergencyLocalDefenders(room: Room, availableEnergy: number): number {
  let count = room.find(FIND_MY_CREEPS).filter(creep => {
    if ((creep as { spawning?: boolean }).spawning) return false;
    const role = (creep.memory as { role?: SpawnRequest["role"] }).role;
    if (!role || !LOCAL_DEFENSE_ROLES.has(role)) return false;
    return (creep.body ?? []).some(part => part.hits > 0 && (part.type === ATTACK || part.type === RANGED_ATTACK));
  }).length;

  for (const request of spawnQueue.getPendingRequests(room.name)) {
    if (request.priority < SpawnPriority.EMERGENCY) continue;
    if (!LOCAL_DEFENSE_ROLES.has(request.role)) continue;
    if (!isLocalPendingDefenderRequest(request, room.name)) continue;
    if (request.body.cost <= availableEnergy) count++;
  }

  return count;
}

function isLocalPendingDefenderRequest(request: SpawnRequest, roomName: string): boolean {
  if (request.targetRoom && request.targetRoom !== roomName) return false;
  if (request.additionalMemory?.task === "defenseAssist") return false;
  if (request.additionalMemory?.assistTarget) return false;
  return true;
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
    if (!isLocalPendingDefenderRequest(request, roomName)) continue;
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
  const operations = getPowerBankOperationRequests(requests);

  if (operations.length === 0) {
    if (requests.powerHarvesters > 0 || requests.healers > 0 || requests.powerCarriers > 0) {
      logger.warn(
        `Skipping targetless power bank spawn requests in ${room.name}: ${requests.powerHarvesters} harvesters, ${requests.healers} healers, ${requests.powerCarriers} carriers`,
        { subsystem: "SpawnPipeline" }
      );
    }
    return;
  }

  const maxEnergy = room.energyCapacityAvailable;
  const priority = SpawnPriority.NORMAL;
  let addedHarvesters = 0;
  let addedHealers = 0;
  let addedCarriers = 0;

  for (const operation of operations) {
    const targetRoom = operation.targetRoom;
    const operationMemory = { task: "powerBank", targetRoom };
    const pendingHarvesters = countPendingPowerBankRequests(room.name, "powerHarvester", targetRoom);
    const pendingHealers = countPendingPowerBankRequests(room.name, "healer", targetRoom);
    const pendingCarriers = countPendingPowerBankRequests(room.name, "powerCarrier", targetRoom);

    for (let i = 0; i < Math.max(0, operation.powerHarvesters - pendingHarvesters); i++) {
      addOptimizedRequest(
        room,
        "powerHarvester",
        "power",
        priority,
        maxEnergy,
        `powerHarvester_${targetRoom}_${Game.time}_${i}`,
        null,
        targetRoom,
        operationMemory
      );
      addedHarvesters++;
    }

    for (let i = 0; i < Math.max(0, operation.healers - pendingHealers); i++) {
      addOptimizedRequest(
        room,
        "healer",
        "military",
        priority,
        maxEnergy,
        `healer_powerBank_${targetRoom}_${Game.time}_${i}`,
        null,
        targetRoom,
        operationMemory
      );
      addedHealers++;
    }

    for (let i = 0; i < Math.max(0, operation.powerCarriers - pendingCarriers); i++) {
      addOptimizedRequest(
        room,
        "powerCarrier",
        "power",
        priority,
        maxEnergy,
        `powerCarrier_${targetRoom}_${Game.time}_${i}`,
        null,
        targetRoom,
        operationMemory
      );
      addedCarriers++;
    }
  }

  if (addedHarvesters === 0 && addedHealers === 0 && addedCarriers === 0) return;

  logger.info(
    `Added power bank spawn requests: ${addedHarvesters} harvesters, ${addedHealers} healers, ${addedCarriers} carriers`,
    { subsystem: "SpawnPipeline" }
  );
}

function getPowerBankOperationRequests(requests: {
  powerHarvesters: number;
  healers: number;
  powerCarriers: number;
  operations?: PowerBankOperationSpawnRequest[];
  targetRoom?: string;
}): PowerBankOperationSpawnRequest[] {
  if (requests.operations?.length) {
    return requests.operations.filter(operation =>
      operation.targetRoom && (operation.powerHarvesters > 0 || operation.healers > 0 || operation.powerCarriers > 0)
    );
  }

  if (!requests.targetRoom) return [];
  if (requests.powerHarvesters === 0 && requests.healers === 0 && requests.powerCarriers === 0) return [];

  return [
    {
      targetRoom: requests.targetRoom,
      powerHarvesters: requests.powerHarvesters,
      healers: requests.healers,
      powerCarriers: requests.powerCarriers
    }
  ];
}

function countPendingPowerBankRequests(roomName: string, role: SpawnRequest["role"], targetRoom: string): number {
  return spawnQueue.getPendingRequests(roomName).filter(request =>
    request.role === role &&
    request.targetRoom === targetRoom &&
    request.additionalMemory?.task === "powerBank"
  ).length;
}

function addOptimizedRequest(
  room: Room,
  role: SpawnRequest["role"],
  family: SpawnRequest["family"],
  priority: SpawnPriority,
  maxEnergy: number,
  id: string,
  bodyOverride: SpawnRequest["body"] | null = null,
  targetRoom?: string,
  additionalMemory?: SpawnRequest["additionalMemory"]
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
      targetRoom,
      additionalMemory,
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
