import { logger } from "@ralphschuler/screeps-core";
import {
  buildDefenseAssistBody,
  getVisibleDefenseAssistThreatProfile,
  isDefenseAssistMilitaryRole
} from "@ralphschuler/screeps-defense";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { emergencyResponseManager, energyFlowPredictor } from "./botIntegration";
import { optimizeBody } from "./bodyOptimizer";
import { getBootstrapRole, isBootstrapMode, isEmergencySpawnState } from "./bootstrapManager";
import { getDefenderPriorityBoost } from "./defenderManager";
import { ROLE_DEFINITIONS, type BodyTemplate, type RoleSpawnDef } from "./roleDefinitions";
import { isRemoteEconomyRole } from "./remoteRoleDemand";
import { getEffectiveRoomEnergyAvailable } from "./roomEnergy";
import {
  countCreepsByRole,
  getClaimerSpawnAssignment,
  getDefenseAssistSpawnAssignment,
  getPioneerSpawnAssignment,
  getRemoteRoomNeedingWorkers,
  getRoleTargetCount,
  needsRole
} from "./spawnNeedsAnalyzer";
import { SpawnPriority, type SpawnRequest } from "./spawnQueue";

const TICKS_PER_BODY_PART = 3;
const CONTROLLER_DOWNGRADE_UPGRADER_PRIORITY_TICKS = 5000;

interface SpawnSettingsMemory {
  spawnSettings?: {
    /** Set false to roll back downgrade-risk upgrader priority promotion. */
    controllerDowngradePriority?: boolean;
  };
}

function isControllerDowngradePriorityEnabled(): boolean {
  const mem = Memory as unknown as SpawnSettingsMemory;
  return mem.spawnSettings?.controllerDowngradePriority !== false;
}

function hasControllerDowngradeRisk(room: Room): boolean {
  const controller = room.controller;
  if (!controller?.my) return false;
  return controller.ticksToDowngrade <= CONTROLLER_DOWNGRADE_UPGRADER_PRIORITY_TICKS;
}

function getBestDefinedBody(def: RoleSpawnDef, energyCapacity: number) {
  let best = null as RoleSpawnDef["bodies"][number] | null;
  for (const body of def.bodies) {
    if (body.cost <= energyCapacity && (!best || body.cost > best.cost)) {
      best = body;
    }
  }
  return best;
}

export interface SpawnDemand {
  roleName: string;
  def: RoleSpawnDef;
  current: number;
  target: number;
  missing: number;
  priority: number;
  targetRoom?: string;
  task?: string;
  assistTarget?: string;
  defenseSquadId?: string;
  defenseSquadSize?: number;
  defenseSquadCreatedAt?: number;
  bootstrap?: boolean;
  bodyOverride?: BodyTemplate;
}

export interface SpawnPlan {
  roomName: string;
  demands: SpawnDemand[];
  requests: SpawnRequest[];
}

export function ensureRoomVisibleForSpawnAnalysis(room: Room): void {
  if (!Game.rooms[room.name]) {
    Game.rooms[room.name] = room;
  }
}

function mapSpawnPriority(basePriority: number): SpawnPriority {
  if (basePriority >= 90) return SpawnPriority.HIGH;
  if (basePriority >= 60) return SpawnPriority.NORMAL;
  return SpawnPriority.LOW;
}

function createDemand(room: Room, swarm: SwarmState, input: Omit<SpawnDemand, "target" | "missing">): SpawnDemand {
  const target = getRoleTargetCount(room.name, input.roleName, swarm);
  return {
    ...input,
    target,
    missing: Math.max(0, target - input.current)
  };
}

function priorityForDemand(
  room: Room,
  swarm: SwarmState,
  roleName: string,
  basePriority: number,
  isEmergency: boolean
): number {
  if (isEmergency && (roleName === "larvaWorker" || roleName === "harvester")) {
    return SpawnPriority.EMERGENCY;
  }

  if (roleName === "upgrader" && isControllerDowngradePriorityEnabled() && hasControllerDowngradeRisk(room)) {
    return SpawnPriority.HIGH;
  }

  const emergencyState = emergencyResponseManager.getEmergencyState(room.name);
  if (emergencyState && (roleName === "guard" || roleName === "ranger" || roleName === "healer")) {
    const boost = getDefenderPriorityBoost(room, swarm, roleName);
    if (boost >= 100) return SpawnPriority.EMERGENCY;
    if (boost > 0) return SpawnPriority.HIGH;
  }

  return mapSpawnPriority(basePriority);
}

/**
 * Plan role demand for a room without mutating the spawn queue.
 */
export function planSpawnDemand(room: Room, swarm: SwarmState): SpawnDemand[] {
  ensureRoomVisibleForSpawnAnalysis(room);

  const counts = countCreepsByRole(room.name);
  const isEmergency = isEmergencySpawnState(room.name);
  const demands: SpawnDemand[] = [];

  if (isBootstrapMode(room.name, room)) {
    const roleName = getBootstrapRole(room.name, room, swarm);
    if (!roleName) return demands;

    const def = ROLE_DEFINITIONS[roleName];
    if (!def || !needsRole(room.name, roleName, swarm, true)) return demands;

    demands.push(createDemand(room, swarm, {
      roleName,
      def,
      current: counts.get(roleName) ?? 0,
      priority: priorityForDemand(room, swarm, roleName, def.priority, isEmergency),
      bootstrap: true
    }));
    return demands;
  }

  for (const [roleName, def] of Object.entries(ROLE_DEFINITIONS)) {
    const current = counts.get(roleName) ?? 0;
    const defenseAssistAssignment = getDefenseAssistSpawnAssignment(room.name, roleName);
    if (defenseAssistAssignment) {
      demands.push({
        roleName,
        def,
        current,
        target: current + 1,
        missing: 1,
        priority: defenseAssistAssignment.priority,
        targetRoom: defenseAssistAssignment.targetRoom,
        task: defenseAssistAssignment.task,
        assistTarget: defenseAssistAssignment.targetRoom,
        defenseSquadId: defenseAssistAssignment.defenseSquadId,
        defenseSquadSize: defenseAssistAssignment.defenseSquadSize,
        defenseSquadCreatedAt: defenseAssistAssignment.defenseSquadCreatedAt
      });
      continue;
    }

    if (!needsRole(room.name, roleName, swarm, isEmergency)) {
      continue;
    }

    const remoteEconomyRole = isRemoteEconomyRole(roleName);
    const remoteTargetRoom = remoteEconomyRole ? getRemoteRoomNeedingWorkers(room.name, roleName, swarm) : null;
    const claimerAssignment = roleName === "claimer" ? getClaimerSpawnAssignment(room.name, swarm) : null;
    const pioneerAssignment = roleName === "pioneer" ? getPioneerSpawnAssignment(room.name, swarm) : null;

    if (remoteEconomyRole && !remoteTargetRoom) {
      continue;
    }
    if (roleName === "claimer" && !claimerAssignment) {
      continue;
    }
    if (roleName === "pioneer" && !pioneerAssignment) {
      continue;
    }

    demands.push(createDemand(room, swarm, {
      roleName,
      def,
      current,
      priority: priorityForDemand(room, swarm, roleName, def.priority, isEmergency),
      targetRoom: claimerAssignment?.targetRoom ?? pioneerAssignment?.targetRoom ?? remoteTargetRoom ?? undefined,
      task: claimerAssignment?.task ?? pioneerAssignment?.task
    }));
  }

  return demands;
}

function orderSpawnDemands(demands: SpawnDemand[]): SpawnDemand[] {
  return [...demands].sort((a, b) => b.priority - a.priority);
}

export function createSpawnPlan(room: Room, swarm: SwarmState): SpawnPlan {
  const demands = orderSpawnDemands(planSpawnDemand(room, swarm));
  const requests: SpawnRequest[] = [];

  for (const demand of demands) {
    const request = compileSpawnDemandToRequest(room, demand);
    if (request) {
      requests.push(request);
    }
  }

  return {
    roomName: room.name,
    demands,
    requests
  };
}

/**
 * Compile one spawn demand into a concrete queue request.
 */
export function compileSpawnDemandToRequest(room: Room, demand: SpawnDemand): SpawnRequest | null {
  const maxEnergy = room.energyCapacityAvailable;

  try {
    const estimatedBodyParts = Math.max(3, Math.min(50, Math.floor(maxEnergy / 100)));
    const ticksToSpawn = estimatedBodyParts * TICKS_PER_BODY_PART;
    const predictedEnergy = energyFlowPredictor.getMaxAffordableInTicks(room, ticksToSpawn);
    const availableEnergy = getEffectiveRoomEnergyAvailable(room);
    const effectiveMaxEnergy =
      demand.priority >= SpawnPriority.EMERGENCY || demand.bootstrap
        ? availableEnergy
        : Math.max(maxEnergy, predictedEnergy);
    const defenseAssistRole = demand.assistTarget && isDefenseAssistMilitaryRole(demand.roleName)
      ? demand.roleName
      : null;
    const isDefenseAssistDemand = Boolean(defenseAssistRole);
    const defenseAssistThreatProfile = demand.assistTarget
      ? getVisibleDefenseAssistThreatProfile(demand.assistTarget)
      : null;
    const defenseAssistBody = defenseAssistRole
      ? buildDefenseAssistBody(
          defenseAssistRole,
          maxEnergy,
          defenseAssistThreatProfile
        )
      : null;
    if (isDefenseAssistDemand && defenseAssistThreatProfile && !defenseAssistBody && !demand.bodyOverride) return null;

    const body =
      demand.bodyOverride ??
      defenseAssistBody ??
      getBestDefinedBody(demand.def, effectiveMaxEnergy) ??
      optimizeBody({
        maxEnergy: effectiveMaxEnergy,
        role: demand.roleName
      });
    const maxBodyEnergy = demand.bodyOverride || defenseAssistBody ? maxEnergy : effectiveMaxEnergy;

    if (!body) return null;
    if (demand.roleName === "claimer" && !body.parts.includes(CLAIM)) return null;
    if (body.cost > maxBodyEnergy) return null;

    const additionalMemory = {
      ...(demand.task ? { task: demand.task } : {}),
      ...(demand.assistTarget ? { assistTarget: demand.assistTarget } : {}),
      ...(demand.defenseSquadId ? { defenseSquadId: demand.defenseSquadId } : {}),
      ...(demand.defenseSquadSize ? { defenseSquadSize: demand.defenseSquadSize } : {}),
      ...(demand.defenseSquadCreatedAt ? { defenseSquadCreatedAt: demand.defenseSquadCreatedAt } : {})
    };

    return {
      id: `${demand.roleName}_${Game.time}_${Math.random().toString(36).substring(2, 11)}`,
      roomName: room.name,
      role: demand.def.role,
      family: demand.def.family,
      body,
      priority: demand.priority,
      targetRoom: demand.targetRoom,
      additionalMemory: Object.keys(additionalMemory).length > 0 ? additionalMemory : undefined,
      createdAt: Game.time
    };
  } catch (error) {
    logger.error(`Failed to optimize body for ${demand.roleName}: ${error}`, {
      subsystem: "SpawnCoordinator"
    });
    return null;
  }
}
