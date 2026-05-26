import { logger } from "@ralphschuler/screeps-core";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { emergencyResponseManager, energyFlowPredictor } from "./botIntegration";
import { optimizeBody } from "./bodyOptimizer";
import { getBootstrapRole, isBootstrapMode, isEmergencySpawnState } from "./bootstrapManager";
import { getDefenderPriorityBoost } from "./defenderManager";
import { ROLE_DEFINITIONS, type RoleSpawnDef } from "./roleDefinitions";
import { countCreepsByRole, getRemoteRoomNeedingWorkers, getRoleTargetCount, needsRole } from "./spawnNeedsAnalyzer";
import { SpawnPriority, type SpawnRequest } from "./spawnQueue";

const TICKS_PER_BODY_PART = 3;

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
  bootstrap?: boolean;
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
    if (!needsRole(room.name, roleName, swarm, isEmergency)) {
      continue;
    }

    const targetRoom =
      roleName === "remoteHarvester" || roleName === "remoteHauler"
        ? getRemoteRoomNeedingWorkers(room.name, roleName, swarm)
        : null;

    if ((roleName === "remoteHarvester" || roleName === "remoteHauler") && !targetRoom) {
      continue;
    }

    demands.push(createDemand(room, swarm, {
      roleName,
      def,
      current,
      priority: priorityForDemand(room, swarm, roleName, def.priority, isEmergency),
      targetRoom: targetRoom ?? undefined
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
    const effectiveMaxEnergy =
      demand.priority >= SpawnPriority.EMERGENCY || demand.bootstrap
        ? room.energyAvailable
        : Math.max(maxEnergy, predictedEnergy);
    const body =
      getBestDefinedBody(demand.def, effectiveMaxEnergy) ??
      optimizeBody({
        maxEnergy: effectiveMaxEnergy,
        role: demand.roleName
      });

    if (!body) return null;

    return {
      id: `${demand.roleName}_${Game.time}_${Math.random().toString(36).substring(2, 11)}`,
      roomName: room.name,
      role: demand.def.role,
      family: demand.def.family,
      body,
      priority: demand.priority,
      targetRoom: demand.targetRoom,
      createdAt: Game.time
    };
  } catch (error) {
    logger.error(`Failed to optimize body for ${demand.roleName}: ${error}`, {
      subsystem: "SpawnCoordinator"
    });
    return null;
  }
}
