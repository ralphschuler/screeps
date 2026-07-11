import { selectTowerAction } from "@ralphschuler/screeps-defense";
import type { SwarmState } from "@ralphschuler/screeps-memory";

const TOWER_POLICY_MAINTENANCE_BUCKET_THRESHOLD = 1500;

export interface DefenseStructureTrackingSnapshot {
  lastStructureCount: number;
  spawns: string[];
  towers: string[];
  lastTick: number;
}

export interface DefenseHostileSnapshot {
  id: Id<Creep>;
  owner: string;
  bodyParts: number;
}

export type DefenseDangerLevel = 0 | 1 | 2 | 3;

export interface DefenseThreatSnapshot {
  dangerLevel: DefenseDangerLevel;
  threatScore: number;
}

export interface DefenseNukeSnapshot {
  id: Id<Nuke>;
  timeToLand: number;
  launchRoomName?: string;
}

export interface DefensePostureSnapshot {
  roomName: string;
  time: number;
  currentDanger: DefenseDangerLevel;
  nukeDetected: boolean;
  /** True only when the current room tick performed an explicit nuke scan. */
  nukeScanPerformed: boolean;
  clusterId?: string;
  clusterMemberRooms?: string[];
  previousStructures?: DefenseStructureTrackingSnapshot;
  currentStructures: {
    spawns: string[];
    towers: string[];
  };
  hostiles: DefenseHostileSnapshot[];
  threat?: DefenseThreatSnapshot;
  nukes: DefenseNukeSnapshot[];
}

export type DefensePheromoneEffect =
  | { type: "danger"; threatScore: number; dangerLevel: DefenseDangerLevel }
  | { type: "diffuseDanger"; roomName: string; threatScore: number; memberRooms: string[] }
  | { type: "nukeDetected" };

export type DefenseKernelEvent =
  | {
      type: "hostile.detected";
      payload: {
        roomName: string;
        hostileId: Id<Creep>;
        hostileOwner: string;
        bodyParts: number;
        threatLevel: DefenseDangerLevel;
        source: string;
      };
    }
  | { type: "hostile.cleared"; payload: { roomName: string; source: string } }
  | {
      type: "structure.destroyed";
      payload: { roomName: string; structureType: StructureConstant; structureId: string; source: string };
    }
  | {
      type: "nuke.detected";
      payload: { roomName: string; nukeId: Id<Nuke>; landingTick: number; launchRoomName: string; source: string };
    };

export interface DefenseRoomEvent {
  roomName: string;
  type: "hostileDetected" | "nukeDetected";
  message: string;
}

export interface DefensePostureIntent {
  nextDanger: DefenseDangerLevel;
  nextNukeDetected: boolean;
  nextStructureTracking?: DefenseStructureTrackingSnapshot;
  recordAttackers: boolean;
  pheromoneEffects: DefensePheromoneEffect[];
  roomEvents: DefenseRoomEvent[];
  kernelEvents: DefenseKernelEvent[];
}

export interface TowerDefensePlanInput {
  towers: StructureTower[];
  hostiles?: Creep[];
  posture?: SwarmState["posture"];
  rcl?: number;
  danger?: number;
  isCombatPosture?: boolean;
  wallRepairTarget?: number;
  /**
   * Current CPU bucket passed to tower action policy.
   * Low values defer non-critical maintenance actions.
   */
  bucket?: number;
  /** Set false to roll back wounded hostile tower tie-breaking for this plan. */
  preferWoundedTargets?: boolean;
  /** Set false to roll back siege-posture tower healing for this plan. */
  allowSiegeHealing?: boolean;
}

interface DefenseSettingsMemory {
  defenseSettings?: {
    /** Set false to roll back wounded hostile tower focus-fire tie-breaking globally. */
    towerPreferWoundedTargets?: boolean;
    /** Set false to roll back siege-posture tower healing globally. */
    towerHealInSiege?: boolean;
  };
}

function getDefenseSettings(): DefenseSettingsMemory["defenseSettings"] | undefined {
  if (typeof Memory === "undefined") return undefined;
  return (Memory as unknown as DefenseSettingsMemory).defenseSettings;
}

function isTowerPreferWoundedTargetsEnabled(): boolean {
  return getDefenseSettings()?.towerPreferWoundedTargets !== false;
}

function isTowerHealInSiegeEnabled(): boolean {
  return getDefenseSettings()?.towerHealInSiege !== false;
}

export type TowerDefenseAction =
  | { tower: StructureTower; type: "attack"; target: Creep }
  | { tower: StructureTower; type: "heal"; target: Creep }
  | { tower: StructureTower; type: "repair"; target: Structure };

export function planDefensePostureIntent(snapshot: DefensePostureSnapshot): DefensePostureIntent {
  const intent: DefensePostureIntent = {
    nextDanger: snapshot.currentDanger,
    nextNukeDetected: snapshot.nukeDetected,
    recordAttackers: false,
    pheromoneEffects: [],
    roomEvents: [],
    kernelEvents: []
  };

  planStructureEvents(snapshot, intent);
  planHostileEvents(snapshot, intent);
  planNukeEvents(snapshot, intent);

  return intent;
}

function planStructureEvents(snapshot: DefensePostureSnapshot, intent: DefensePostureIntent): void {
  if (snapshot.time % 5 !== 0) return;

  const currentStructureCount = snapshot.currentStructures.spawns.length + snapshot.currentStructures.towers.length;
  const previous = snapshot.previousStructures;

  if (previous && previous.lastTick < snapshot.time && currentStructureCount < previous.lastStructureCount) {
    if (snapshot.currentStructures.spawns.length < previous.spawns.length) {
      intent.kernelEvents.push({
        type: "structure.destroyed",
        payload: {
          roomName: snapshot.roomName,
          structureType: STRUCTURE_SPAWN,
          structureId: "unknown",
          source: snapshot.roomName
        }
      });
    }

    if (snapshot.currentStructures.towers.length < previous.towers.length) {
      intent.kernelEvents.push({
        type: "structure.destroyed",
        payload: {
          roomName: snapshot.roomName,
          structureType: STRUCTURE_TOWER,
          structureId: "unknown",
          source: snapshot.roomName
        }
      });
    }
  }

  intent.nextStructureTracking = {
    lastStructureCount: currentStructureCount,
    spawns: [...snapshot.currentStructures.spawns],
    towers: [...snapshot.currentStructures.towers],
    lastTick: snapshot.time
  };
}

function planHostileEvents(snapshot: DefensePostureSnapshot, intent: DefensePostureIntent): void {
  if (snapshot.hostiles.length > 0) {
    intent.recordAttackers = true;
    const threat = snapshot.threat;
    if (!threat) return;

    intent.nextDanger = threat.dangerLevel;

    if (threat.dangerLevel > snapshot.currentDanger) {
      intent.pheromoneEffects.push({
        type: "danger",
        threatScore: threat.threatScore,
        dangerLevel: threat.dangerLevel
      });

      if (snapshot.clusterId && snapshot.clusterMemberRooms) {
        intent.pheromoneEffects.push({
          type: "diffuseDanger",
          roomName: snapshot.roomName,
          threatScore: threat.threatScore,
          memberRooms: [...snapshot.clusterMemberRooms]
        });
      }

      intent.roomEvents.push({
        roomName: snapshot.roomName,
        type: "hostileDetected",
        message: `${snapshot.hostiles.length} hostiles, danger=${threat.dangerLevel}, score=${threat.threatScore}`
      });

      for (const hostile of snapshot.hostiles) {
        intent.kernelEvents.push({
          type: "hostile.detected",
          payload: {
            roomName: snapshot.roomName,
            hostileId: hostile.id,
            hostileOwner: hostile.owner,
            bodyParts: hostile.bodyParts,
            threatLevel: threat.dangerLevel,
            source: snapshot.roomName
          }
        });
      }
    }

    return;
  }

  const activeNukeEvidence = snapshot.nukeScanPerformed ? snapshot.nukes.length > 0 : snapshot.nukeDetected;
  if (snapshot.currentDanger > 0 && !activeNukeEvidence) {
    intent.nextDanger = 0;
    if (!snapshot.nukeDetected) {
      intent.kernelEvents.push({ type: "hostile.cleared", payload: { roomName: snapshot.roomName, source: snapshot.roomName } });
    }
  }
}

function planNukeEvents(snapshot: DefensePostureSnapshot, intent: DefensePostureIntent): void {
  if (!snapshot.nukeScanPerformed) {
    // A skipped scan is not evidence that incoming nukes are gone. Preserve the
    // persisted critical posture until an explicit empty scan is completed.
    if (snapshot.nukeDetected) intent.nextDanger = 3;
    return;
  }

  if (snapshot.nukes.length > 0) {
    // Incoming nukes remain a critical threat between room-process executions.
    // Every explicit room scan may discover the first nuke for this posture.
    intent.nextDanger = 3;
    if (snapshot.nukeDetected) return;

    intent.nextNukeDetected = true;
    intent.pheromoneEffects.push({ type: "nukeDetected" });
    const launchSource = snapshot.nukes[0]?.launchRoomName ?? "unidentified source";
    intent.roomEvents.push({
      roomName: snapshot.roomName,
      type: "nukeDetected",
      message: `${snapshot.nukes.length} nuke(s) incoming from ${launchSource}`
    });

    for (const nuke of snapshot.nukes) {
      intent.kernelEvents.push({
        type: "nuke.detected",
        payload: {
          roomName: snapshot.roomName,
          nukeId: nuke.id,
          landingTick: snapshot.time + nuke.timeToLand,
          launchRoomName: nuke.launchRoomName ?? "unidentified source",
          source: snapshot.roomName
        }
      });
    }
    return;
  }

  intent.nextNukeDetected = false;
}

export function planTowerDefenseIntent(input: TowerDefensePlanInput): TowerDefenseAction[] {
  if (input.towers.length === 0) return [];
  const hostiles = input.hostiles ?? [];
  const posture = input.posture ?? "eco";
  const rcl = input.rcl ?? 1;
  const danger = input.danger ?? 0;
  const isCombatPosture = input.isCombatPosture ?? false;
  const wallRepairTarget = input.wallRepairTarget ?? 0;
  const preferWoundedTargets = input.preferWoundedTargets ?? isTowerPreferWoundedTargetsEnabled();
  const allowSiegeHealing = input.allowSiegeHealing ?? isTowerHealInSiegeEnabled();
  const bucket = input.bucket ?? (typeof Game !== "undefined" && Number.isFinite(Game.cpu?.bucket) ? Game.cpu.bucket : 10000);
  const canPerformMaintenance = (bucket >= TOWER_POLICY_MAINTENANCE_BUCKET_THRESHOLD);
  const actions: TowerDefenseAction[] = [];

  for (const tower of input.towers) {
    if (tower.store.getUsedCapacity(RESOURCE_ENERGY) < 10) continue;

    const action = selectTowerAction({
      tower,
      hostiles,
      posture,
      rcl,
      danger,
      isCombatPosture,
      wallRepairTarget,
      bucket,
      preferWoundedTargets,
      allowSiegeHealing
    });
    if (!canPerformMaintenance && (action.type === "heal" || action.type === "repair")) {
      continue;
    }

    if (action.type !== "idle") {
      actions.push({ tower, type: action.type, target: action.target } as TowerDefenseAction);
    }
  }

  return actions;
}
