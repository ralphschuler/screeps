/**
 * War Coordinator
 * Handles war target management and tracking
 *
 * For global domination, war targets are automatically populated from:
 * 1. Nearby enemy-owned rooms (proactive, always enabled)
 * 2. High-threat rooms with hostile creeps (reactive, defensively triggered)
 */

import { logger } from "@ralphschuler/screeps-core";
import { isAllyPlayer } from "@ralphschuler/screeps-defense";
import type { EmpireMemory } from "@ralphschuler/screeps-memory";

/** Maximum linear distance to auto-add enemy rooms as war targets */
const MAX_WAR_TARGET_DISTANCE = 10;
/** Maximum number of proactive enemy war targets */
const MAX_PROACTIVE_TARGETS = 5;

export class WarCoordinator {
  /** Update war targets based on threats and strategic goals */
  public updateWarTargets(empire: EmpireMemory): void {
    const myUsername = this.getMyUsername();

    // === 1. Clean stale / invalid targets ===
    empire.warTargets = empire.warTargets.filter(target => {
      const intel = empire.knownRooms[target];
      if (!intel) return false; // Remove unknown targets
      if (isAllyPlayer(target) || (intel.owner && isAllyPlayer(intel.owner))) return false;
      if (intel.owner === myUsername) return false;
      return !!intel.owner;
    });

    // === 2. Proactive: always add nearby enemy rooms (offensive expansion) ===
    const ownedRooms = Object.values(Game.rooms)
      .filter(r => r.controller?.my)
      .map(r => r.name);
    const enemyRooms: { roomName: string; distance: number }[] = [];

    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      if (!intel || !intel.owner) continue;
      if (intel.owner === myUsername) continue;
      if (isAllyPlayer(intel.owner)) continue;
      if (intel.isHighway || intel.isSK) continue;

      const minDistance = this.getMinDistance(roomName, ownedRooms);
      if (minDistance <= MAX_WAR_TARGET_DISTANCE) {
        enemyRooms.push({ roomName, distance: minDistance });
      }
    }

    // Sort by distance (closest first) and add up to limit
    enemyRooms.sort((a, b) => a.distance - b.distance);
    for (const entry of enemyRooms.slice(0, MAX_PROACTIVE_TARGETS)) {
      if (!empire.warTargets.includes(entry.roomName)) {
        empire.warTargets.push(entry.roomName);
        logger.info(`Proactive war target added: ${entry.roomName} (distance ${entry.distance})`, {
          subsystem: "War"
        });
      }
    }

    // === 3. Reactive: if already in war mode, also add high-threat rooms ===
    if (empire.objectives.warMode) {
      for (const roomName in empire.knownRooms) {
        const intel = empire.knownRooms[roomName];
        if (!intel) continue;
        if ((intel.owner && isAllyPlayer(intel.owner)) || (intel.reserver && isAllyPlayer(intel.reserver))) {
          continue;
        }
        if (intel.threatLevel >= 2 && !empire.warTargets.includes(roomName)) {
          empire.warTargets.push(roomName);
          logger.warn(`Threat war target added: ${roomName} (threat level ${intel.threatLevel})`, {
            subsystem: "War"
          });
        }
      }
    }
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
