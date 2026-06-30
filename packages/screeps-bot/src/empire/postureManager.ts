import { logger } from "@ralphschuler/screeps-core";
import { isAllyPlayer } from "@ralphschuler/screeps-defense";
import { memoryManager } from "@ralphschuler/screeps-memory";
import type { EmpireMemory } from "@ralphschuler/screeps-memory";

export type AttackIncidentSeverity = "hostileCombat" | "structureDamage" | "structureDestroyed";

export interface PlayerAttackIncident {
  tick: number;
  roomName: string;
  severity: AttackIncidentSeverity;
}

export interface PlayerPostureEntry {
  username: string;
  incidents: PlayerAttackIncident[];
  lastIncidentTick: number;
  attackCount: number;
  state: "neutral" | "war";
  warDeclaredAt?: number;
}

export interface PlayerPostureMemory {
  players: Record<string, PlayerPostureEntry>;
  threshold: number;
  windowTicks: number;
}

export const PLAYER_ATTACK_THRESHOLD = 3;
export const PLAYER_ATTACK_WINDOW_TICKS = 20_000;
export const PLAYER_ATTACK_MAX_STORED_INCIDENTS = 10;

function getPostureMemory(empire: EmpireMemory): PlayerPostureMemory {
  const mutableEmpire = empire as EmpireMemory & { playerPostures?: PlayerPostureMemory };
  if (!mutableEmpire.playerPostures) {
    mutableEmpire.playerPostures = {
      players: {},
      threshold: PLAYER_ATTACK_THRESHOLD,
      windowTicks: PLAYER_ATTACK_WINDOW_TICKS
    };
  }
  mutableEmpire.playerPostures.threshold = PLAYER_ATTACK_THRESHOLD;
  mutableEmpire.playerPostures.windowTicks = PLAYER_ATTACK_WINDOW_TICKS;
  return mutableEmpire.playerPostures;
}

function isQualifyingHostile(creep: Creep): boolean {
  if (isAllyPlayer(creep.owner.username)) return false;
  return creep.body.some(part =>
    part.hits > 0 &&
    (part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK || part.type === HEAL)
  );
}

export function getQualifyingAttackers(hostiles: Creep[]): string[] {
  const attackers = new Set<string>();
  for (const hostile of hostiles) {
    if (isQualifyingHostile(hostile)) {
      attackers.add(hostile.owner.username);
    }
  }
  return [...attackers];
}

export function recordPlayerAttack(
  username: string,
  roomName: string,
  severity: AttackIncidentSeverity = "hostileCombat"
): PlayerPostureEntry | null {
  if (!username || isAllyPlayer(username)) return null;

  const empire = memoryManager.getEmpire();
  const posture = getPostureMemory(empire);
  const cutoff = Game.time - posture.windowTicks;
  const existing = posture.players[username];
  const entry: PlayerPostureEntry = existing ?? {
    username,
    incidents: [],
    lastIncidentTick: 0,
    attackCount: 0,
    state: "neutral"
  };

  entry.incidents = entry.incidents.filter(incident => incident.tick >= cutoff);

  let attackCount = Math.min(entry.incidents.length, PLAYER_ATTACK_MAX_STORED_INCIDENTS);
  const duplicateThisTick = entry.incidents.some(
    incident => incident.tick === Game.time && incident.roomName === roomName && incident.severity === severity
  );
  if (!duplicateThisTick) {
    entry.incidents.push({ tick: Game.time, roomName, severity });
    attackCount += 1;
  }

  if (entry.incidents.length > PLAYER_ATTACK_MAX_STORED_INCIDENTS) {
    entry.incidents = entry.incidents.slice(-PLAYER_ATTACK_MAX_STORED_INCIDENTS);
  }

  entry.lastIncidentTick = Game.time;
  entry.attackCount = Math.min(attackCount, PLAYER_ATTACK_MAX_STORED_INCIDENTS);

  if (entry.attackCount >= posture.threshold && entry.state !== "war") {
    entry.state = "war";
    entry.warDeclaredAt = Game.time;
    if (!empire.warTargets.includes(username)) {
      empire.warTargets.push(username);
    }
    empire.objectives.warMode = true;
    logger.warn(`Declared war on ${username} after ${entry.attackCount} attacks`, {
      subsystem: "Posture",
      room: roomName
    });
  }

  posture.players[username] = entry;
  return entry;
}

export function recordRoomAttackers(roomName: string, hostiles: Creep[]): void {
  for (const username of getQualifyingAttackers(hostiles)) {
    recordPlayerAttack(username, roomName, "hostileCombat");
  }
}
