/**
 * Nuke Manager - Nuclear Warfare
 *
 * Manages nuke operations:
 * - Nuke candidate scoring
 * - Ghodium accumulation
 * - Nuker resource loading
 * - Nuke launch decisions
 * - Coordination with siege timing
 *
 * Addresses Issue: #24
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";

/**
 * Nuke Manager Configuration
 */
export interface NukeConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum ghodium to launch nuke */
  minGhodium: number;
  /** Minimum energy to launch nuke */
  minEnergy: number;
  /** Minimum score to launch nuke */
  minScore: number;
}

const DEFAULT_CONFIG: NukeConfig = {
  updateInterval: 500,
  minGhodium: 5000,
  minEnergy: 300000,
  minScore: 50
};

/**
 * Nuke candidate scoring factors
 */
interface NukeScore {
  roomName: string;
  score: number;
  reasons: string[];
}

/**
 * Nuke Manager Class
 */
export class NukeManager {
  private config: NukeConfig;
  private lastRun = 0;

  public constructor(config: Partial<NukeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main nuke tick
   */
  public run(): void {
    // Check if we should run
    if (!this.shouldRun()) {
      return;
    }

    this.lastRun = Game.time;

    try {
      // Load nukers with resources
      this.loadNukers();

      // Evaluate nuke candidates
      this.evaluateNukeCandidates();

      // Launch nukes if appropriate
      this.launchNukes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Nuke manager error: ${errorMessage}`, { subsystem: "Nuke" });
    }
  }

  /**
   * Check if nuke manager should run this tick
   */
  private shouldRun(): boolean {
    const ticksSinceRun = Game.time - this.lastRun;
    return ticksSinceRun >= this.config.updateInterval;
  }

  /**
   * Load nukers with energy and ghodium
   */
  private loadNukers(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const nuker = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_NUKER
      })[0] as StructureNuker | undefined;

      if (!nuker) continue;

      // Check if nuker needs resources
      const energyNeeded = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
      const ghodiumNeeded = nuker.store.getFreeCapacity(RESOURCE_GHODIUM);

      if (energyNeeded > 0 || ghodiumNeeded > 0) {
        logger.debug(`Nuker in ${roomName} needs ${energyNeeded} energy, ${ghodiumNeeded} ghodium`, {
          subsystem: "Nuke"
        });
        // Terminal manager should handle transfers
      }
    }
  }

  /**
   * Evaluate nuke candidates
   */
  private evaluateNukeCandidates(): void {
    const overmind = memoryManager.getOvermind();

    // Clear old candidates
    overmind.nukeCandidates = [];

    // Only evaluate if in war mode
    if (!overmind.objectives.warMode) {
      return;
    }

    // Score all war targets
    for (const roomName of overmind.warTargets) {
      const score = this.scoreNukeCandidate(roomName);
      if (score.score >= this.config.minScore) {
        overmind.nukeCandidates.push({
          roomName,
          score: score.score,
          launched: false,
          launchTick: 0
        });

        logger.info(`Nuke candidate: ${roomName} (score: ${score.score}) - ${score.reasons.join(", ")}`, {
          subsystem: "Nuke"
        });
      }
    }

    // Sort by score
    overmind.nukeCandidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a nuke candidate
   */
  private scoreNukeCandidate(roomName: string): NukeScore {
    let score = 0;
    const reasons: string[] = [];

    const intel = memoryManager.getOvermind().roomIntel[roomName];
    if (!intel) {
      return { roomName, score: 0, reasons: ["No intel"] };
    }

    // Owned room bonus
    if (intel.owner && intel.owner !== "") {
      score += 30;
      reasons.push("Owned room");
    }

    // High threat bonus
    if (intel.threatLevel >= 2) {
      score += 20;
      reasons.push("High threat");
    }

    // Tower count bonus (more towers = better target)
    if (intel.towerCount) {
      score += intel.towerCount * 5;
      reasons.push(`${intel.towerCount} towers`);
    }

    // Spawn count bonus
    if (intel.spawnCount) {
      score += intel.spawnCount * 10;
      reasons.push(`${intel.spawnCount} spawns`);
    }

    // Controller level bonus
    if (intel.controllerLevel) {
      score += intel.controllerLevel * 3;
      reasons.push(`RCL ${intel.controllerLevel}`);
    }

    // Distance penalty (prefer closer targets)
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    if (ownedRooms.length > 0) {
      const minDistance = Math.min(...ownedRooms.map(r => Game.map.getRoomLinearDistance(roomName, r.name)));
      score -= minDistance * 2;
      reasons.push(`${minDistance} rooms away`);
    }

    // War target bonus
    if (memoryManager.getOvermind().warTargets.includes(roomName)) {
      score += 15;
      reasons.push("War target");
    }

    return { roomName, score, reasons };
  }

  /**
   * Launch nukes at top candidates
   */
  private launchNukes(): void {
    const overmind = memoryManager.getOvermind();

    // Only launch if in war mode
    if (!overmind.objectives.warMode) {
      return;
    }

    // Get all nukers
    const nukers: StructureNuker[] = [];
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const nuker = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_NUKER
      })[0] as StructureNuker | undefined;

      if (
        nuker &&
        nuker.store.getUsedCapacity(RESOURCE_ENERGY) >= this.config.minEnergy &&
        nuker.store.getUsedCapacity(RESOURCE_GHODIUM) >= this.config.minGhodium
      ) {
        nukers.push(nuker);
      }
    }

    if (nukers.length === 0) {
      return; // No ready nukers
    }

    // Launch at top candidates
    for (const candidate of overmind.nukeCandidates) {
      if (candidate.launched) continue;

      // Find a nuker in range
      for (const nuker of nukers) {
        const distance = Game.map.getRoomLinearDistance(nuker.room.name, candidate.roomName);
        if (distance > 10) continue; // Out of range

        // Get target position (center of room)
        const targetPos = new RoomPosition(25, 25, candidate.roomName);

        const result = nuker.launchNuke(targetPos);
        if (result === OK) {
          candidate.launched = true;
          candidate.launchTick = Game.time;

          logger.warn(`NUKE LAUNCHED from ${nuker.room.name} to ${candidate.roomName}!`, { subsystem: "Nuke" });

          // Remove this nuker from available list
          const index = nukers.indexOf(nuker);
          if (index > -1) {
            nukers.splice(index, 1);
          }

          break;
        } else {
          logger.error(`Failed to launch nuke: ${result}`, { subsystem: "Nuke" });
        }
      }

      if (nukers.length === 0) {
        break; // No more nukers available
      }
    }
  }
}

/**
 * Global nuke manager instance
 */
export const nukeManager = new NukeManager();
