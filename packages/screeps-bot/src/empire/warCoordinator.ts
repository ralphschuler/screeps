/**
 * War Coordinator
 * Handles war target management and tracking
 *
 * For global domination, war targets are automatically populated from:
 * 1. Player postures (war declarations)
 * 2. Nearby enemy-owned rooms (proactive, strategically prioritized)
 * 3. High-threat rooms (reactive, defensively triggered)
 */

import { isKnownAllyPlayer, logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory, RoomIntel } from "@ralphschuler/screeps-memory";

/** Maximum linear distance to auto-add enemy rooms as war targets */
const MAX_WAR_TARGET_DISTANCE = 10;
/** Maximum number of proactive enemy war targets */
const MAX_PROACTIVE_TARGETS = 5;
/** Minimum threat required to add a proactive target while not in war mode */
const MIN_THREAT_FOR_PEACEFUL_PROACTIVE_TARGET = 2;
/** Room name format for quick hostile-room validation */
const ROOM_NAME_RE = /^([WE])(\d+)([NS])(\d+)$/;

interface CandidateWarRoom {
  roomName: string;
  distance: number;
  score: number;
}

export interface WarCoordinatorConfig {
  /** Additional manual allies beyond permanent non-aggression allies. */
  allies: string[];
}

const DEFAULT_CONFIG: WarCoordinatorConfig = {
  allies: []
};

export class WarCoordinator {
  private config: WarCoordinatorConfig;

  public constructor(config: Partial<WarCoordinatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Update war targets based on threats and strategic goals */
  public updateWarTargets(empire: EmpireMemory): void {
    const myUsername = this.getMyUsername();

    // === 1. Remove stale or invalid targets ===
    empire.warTargets = empire.warTargets.filter(target => this.shouldKeepTarget(target, empire, myUsername));

    const ownedRooms = Object.values(Game.rooms)
      .filter(r => r.controller?.my)
      .map(r => r.name);

    // === 2. Add room targets for users in war posture ===
    this.addPostureTargets(empire, myUsername);

    // === 3. Add nearby, strategically valuable enemy rooms ===
    this.addPrioritizedProactiveTargets(empire, ownedRooms, myUsername);

    // === 4. Reactive: if already in war mode, also add high-threat rooms ===
    if (empire.objectives.warMode) {
      this.addThreatTargets(empire);
    }

    // Keep the set bounded and intentionally ordered (best strategic candidates first).
    this.normalizeWarTargets(empire, ownedRooms);
  }

  private shouldKeepTarget(target: string, empire: EmpireMemory, myUsername: string): boolean {
    if (target === myUsername || this.isAllyUsername(target, empire)) {
      return false;
    }

    // Keep non-allied usernames that are explicitly in war posture.
    const playerPosture = empire.playerPostures?.players[target];
    if (playerPosture?.state === "war") {
      return true;
    }

    // Ignore malformed targets when used as room names.
    if (!ROOM_NAME_RE.test(target)) {
      return false;
    }

    const intel = empire.knownRooms[target];
    if (!intel?.owner) {
      return false;
    }

    if (intel.owner === myUsername) {
      return false;
    }

    if (this.isAllyUsername(intel.owner, empire)) {
      return false;
    }

    return true;
  }

  private addPostureTargets(empire: EmpireMemory, myUsername: string): void {
    if (!empire.objectives.warMode) {
      return;
    }

    for (const [username, posture] of Object.entries(empire.playerPostures?.players ?? {})) {
      if (posture.state !== "war" || username === myUsername || this.isAllyUsername(username, empire)) {
        continue;
      }

      for (const roomName in empire.knownRooms) {
        const intel = empire.knownRooms[roomName];
        if (intel?.owner !== username || intel.scouted === false || this.shouldIgnoreRoomForWar(myUsername, intel, empire)) {
          continue;
        }

        if (!empire.warTargets.includes(roomName)) {
          empire.warTargets.push(roomName);
          logger.info(`War posture target added: ${roomName} (player ${username})`, { subsystem: "War" });
        }
      }
    }
  }

  private addPrioritizedProactiveTargets(empire: EmpireMemory, ownedRooms: string[], myUsername: string): void {
    const isWarMode = empire.objectives.warMode;
    const candidates: CandidateWarRoom[] = [];

    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      if (!intel?.owner || this.isInvalidWarCandidate(intel, isWarMode, myUsername, empire)) {
        continue;
      }

      const distance = this.getMinDistance(roomName, ownedRooms);
      if (distance > MAX_WAR_TARGET_DISTANCE) {
        continue;
      }

      const score = this.scoreWarCandidate(intel, distance);
      if (score <= 0) {
        continue;
      }

      candidates.push({ roomName, distance, score });
    }

    candidates.sort((a, b) => {
      if (b.score === a.score) {
        return a.distance - b.distance;
      }
      return b.score - a.score;
    });

    for (const candidate of candidates.slice(0, MAX_PROACTIVE_TARGETS)) {
      if (empire.warTargets.includes(candidate.roomName)) {
        continue;
      }

      empire.warTargets.push(candidate.roomName);
      logger.info(
        `Proactive war target added: ${candidate.roomName} (score ${candidate.score.toFixed(1)}, distance ${candidate.distance})`,
        { subsystem: "War" }
      );
    }
  }

  private addThreatTargets(empire: EmpireMemory): void {
    const myUsername = this.getMyUsername();

    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      if (!intel) {
        continue;
      }

      if (
        intel.scouted !== true ||
        intel.owner === myUsername ||
        !intel.owner ||
        this.isAllyUsername(intel.owner, empire) ||
        (intel.reserver && this.isAllyUsername(intel.reserver, empire))
      ) {
        continue;
      }

      if (intel.threatLevel >= 2 && !empire.warTargets.includes(roomName)) {
        empire.warTargets.push(roomName);
        logger.warn(`Threat war target added: ${roomName} (threat level ${intel.threatLevel})`, { subsystem: "War" });
      }
    }
  }

  private isInvalidWarCandidate(
    intel: RoomIntel,
    isWarMode: boolean,
    myUsername: string,
    empire: EmpireMemory
  ): boolean {
    if (intel.scouted !== true) {
      return true;
    }

    if (intel.isSK || intel.isHighway) {
      return true;
    }

    const owner = intel.owner;
    if (!owner || owner === myUsername || this.isAllyUsername(owner, empire)) {
      return true;
    }

    if (!isWarMode && intel.threatLevel < MIN_THREAT_FOR_PEACEFUL_PROACTIVE_TARGET) {
      return true;
    }

    return false;
  }

  private shouldIgnoreRoomForWar(myUsername: string, intel: RoomIntel, empire: EmpireMemory): boolean {
    return this.isInvalidWarCandidate(intel, true, myUsername, empire);
  }

  private normalizeWarTargets(empire: EmpireMemory, ownedRooms: string[]): void {
    const myUsername = this.getMyUsername();
    const isWarMode = empire.objectives.warMode;

    const userTargets = empire.warTargets.filter(
      target => !this.isRoomName(target) && !this.isAllyUsername(target, empire)
    );
    const roomTargets = [...new Set(empire.warTargets.filter(target => this.isRoomName(target)))];

    const rankedTargets = roomTargets
      .filter(roomName => {
        const intel = empire.knownRooms[roomName];
        return intel !== undefined && !this.isInvalidWarCandidate(intel, isWarMode, myUsername, empire);
      })
      .map((roomName): CandidateWarRoom => ({
        roomName,
        score: this.scoreWarCandidate(empire.knownRooms[roomName]!, this.getMinDistance(roomName, ownedRooms)),
        distance: this.getMinDistance(roomName, ownedRooms)
      }))
      .sort((a, b) => {
        if (b.score === a.score) {
          return a.distance - b.distance;
        }
        return b.score - a.score;
      });

    const topRoomTargets = rankedTargets
      .slice(0, MAX_PROACTIVE_TARGETS)
      .map(target => target.roomName)
      .filter(target => !userTargets.includes(target));

    empire.warTargets = [...userTargets, ...topRoomTargets];
  }

  private isAllyUsername(username: string | undefined, empire: EmpireMemory): boolean {
    return isKnownAllyPlayer(username, { configuredAllies: this.config.allies, empire });
  }

  private isRoomName(target: string): boolean {
    return ROOM_NAME_RE.test(target);
  }

  private scoreWarCandidate(intel: RoomIntel, distance: number): number {
    const proximityScore = Math.max(0, 80 - distance * 6);
    const controlScore = (intel.controllerLevel ?? 0) * 10;
    const threatScore = intel.threatLevel * 8;
    const towerScore = (intel.towerCount ?? 0) * 8;
    const spawnScore = (intel.spawnCount ?? 0) * 6;
    const reservationScore = intel.reserver ? 6 : 0;
    return proximityScore + controlScore + threatScore + towerScore + spawnScore + reservationScore;
  }

  private getMyUsername(): string {
    const spawns = Object.values(Game.spawns);
    return spawns.length > 0 ? spawns[0].owner.username : "";
  }

  private getMinDistance(roomName: string, ownedRooms: string[]): number {
    let min = Infinity;
    for (const owned of ownedRooms) {
      const d = Game.map.getRoomLinearDistance(roomName, owned);
      if (d < min) min = d;
    }
    return min;
  }
}

export const warCoordinator = new WarCoordinator();
