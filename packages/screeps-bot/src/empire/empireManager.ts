/**
 * Empire Manager - Global Meta-Layer (Overmind)
 *
 * Implements roadmap Section 3.1:
 * - Coordinates shard roles
 * - Manages expansion queue
 * - Tracks war targets
 * - Handles power bank tracking
 * - Runs periodic overmind tick (every 20-50 ticks)
 */

import type { ExpansionCandidate, OvermindMemory, RoomIntel, PowerBankEntry } from "../memory/schemas";
import { createDefaultOvermindMemory } from "../memory/schemas";
import { logger } from "../core/logger";

/**
 * Empire Manager configuration
 */
export interface EmpireConfig {
  /** Ticks between overmind updates */
  updateInterval: number;
  /** Maximum rooms to consider for expansion */
  maxExpansionCandidates: number;
  /** Minimum score for expansion consideration */
  minExpansionScore: number;
  /** Power bank minimum power for harvesting */
  minPowerBankPower: number;
}

const DEFAULT_CONFIG: EmpireConfig = {
  updateInterval: 30,
  maxExpansionCandidates: 10,
  minExpansionScore: 50,
  minPowerBankPower: 2000
};

/**
 * Empire Manager class
 */
export class EmpireManager {
  private config: EmpireConfig;

  public constructor(config: Partial<EmpireConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get or initialize overmind memory
   */
  public getOvermindMemory(): OvermindMemory {
    const mem = Memory as unknown as { overmind?: OvermindMemory };
    if (!mem.overmind) {
      mem.overmind = createDefaultOvermindMemory();
    }
    return mem.overmind;
  }

  /**
   * Run the empire manager (periodic tick)
   */
  public run(): void {
    const overmind = this.getOvermindMemory();

    // Check if it's time to run
    if (Game.time - overmind.lastRun < this.config.updateInterval) {
      return;
    }

    const cpuStart = Game.cpu.getUsed();

    // Update room intel from visible rooms
    this.updateRoomIntel(overmind);

    // Evaluate expansion candidates
    this.evaluateExpansionCandidates(overmind);

    // Update power bank tracking
    this.updatePowerBanks(overmind);

    // Evaluate war targets
    this.evaluateWarTargets(overmind);

    // Update objectives based on current state
    this.updateObjectives(overmind);

    // Clean up old data
    this.cleanupOldData(overmind);

    overmind.lastRun = Game.time;

    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    if (cpuUsed > 1) {
      logger.debug(`Empire manager used ${cpuUsed.toFixed(2)} CPU`, { subsystem: "Empire" });
    }
  }

  /**
   * Update room intel from visible rooms
   */
  private updateRoomIntel(overmind: OvermindMemory): void {
    for (const room of Object.values(Game.rooms)) {
      overmind.roomsSeen[room.name] = Game.time;

      // Only update intel if we don't have recent data
      const existingIntel = overmind.roomIntel[room.name];
      if (existingIntel && Game.time - existingIntel.lastSeen < 1000) {
        continue;
      }

      const intel = this.gatherRoomIntel(room);
      overmind.roomIntel[room.name] = intel;
    }
  }

  /**
   * Gather intelligence about a room
   */
  private gatherRoomIntel(room: Room): RoomIntel {
    const sources = room.find(FIND_SOURCES);
    const mineral = room.find(FIND_MINERALS)[0];
    const controller = room.controller;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    // Classify terrain
    const terrain = room.getTerrain();
    let swampCount = 0;
    let plainCount = 0;
    for (let x = 0; x < 50; x += 5) {
      for (let y = 0; y < 50; y += 5) {
        const t = terrain.get(x, y);
        if (t === TERRAIN_MASK_SWAMP) swampCount++;
        else if (t === 0) plainCount++;
      }
    }
    const terrainType = swampCount > plainCount * 2 ? "swamp" : plainCount > swampCount * 2 ? "plains" : "mixed";

    // Check for highway/source keeper rooms
    const coordMatch = room.name.match(/^[WE](\d+)[NS](\d+)$/);
    const isHighway = coordMatch
      ? parseInt(coordMatch[1]!, 10) % 10 === 0 || parseInt(coordMatch[2]!, 10) % 10 === 0
      : false;
    const isSK = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_KEEPER_LAIR }).length > 0;

    const intel: RoomIntel = {
      name: room.name,
      lastSeen: Game.time,
      sources: sources.length,
      controllerLevel: controller?.level ?? 0,
      threatLevel: hostiles.length > 5 ? 3 : hostiles.length > 2 ? 2 : hostiles.length > 0 ? 1 : 0,
      scouted: true,
      terrain: terrainType,
      isHighway,
      isSK
    };

    if (controller?.owner?.username) intel.owner = controller.owner.username;
    if (controller?.reservation?.username) intel.reserver = controller.reservation.username;
    if (mineral?.mineralType) intel.mineralType = mineral.mineralType;

    return intel;
  }

  /**
   * Evaluate and score expansion candidates
   */
  private evaluateExpansionCandidates(overmind: OvermindMemory): void {
    // Skip if expansion is paused
    if (overmind.objectives.expansionPaused) {
      return;
    }

    // Get current owned room count
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    const currentRoomCount = ownedRooms.length;

    // Check GCL limit
    if (currentRoomCount >= Game.gcl.level) {
      return; // Can't expand beyond GCL
    }

    const candidates: ExpansionCandidate[] = [];

    for (const [roomName, intel] of Object.entries(overmind.roomIntel)) {
      // Skip if already owned or reserved by someone else
      if (intel.owner || intel.reserver) continue;

      // Skip highway and source keeper rooms
      if (intel.isHighway || intel.isSK) continue;

      // Skip if no controller
      if (intel.controllerLevel === 0 && !intel.scouted) continue;

      // Calculate score
      const score = this.calculateExpansionScore(intel, ownedRooms);

      if (score >= this.config.minExpansionScore) {
        // Calculate distance to nearest owned room
        const distance = this.calculateMinDistance(roomName, ownedRooms.map(r => r.name));

        candidates.push({
          roomName,
          score,
          distance,
          claimed: false,
          lastEvaluated: Game.time
        });
      }
    }

    // Sort by score and keep top candidates
    candidates.sort((a, b) => b.score - a.score);
    overmind.claimQueue = candidates.slice(0, this.config.maxExpansionCandidates);
  }

  /**
   * Calculate expansion score for a room
   */
  private calculateExpansionScore(intel: RoomIntel, ownedRooms: Room[]): number {
    let score = 0;

    // Sources (major factor)
    score += intel.sources * 30;

    // Terrain preference (plains > mixed > swamp)
    if (intel.terrain === "plains") score += 20;
    else if (intel.terrain === "mixed") score += 10;

    // Mineral value (some minerals are more valuable)
    if (intel.mineralType) {
      const valuableMinerals: MineralConstant[] = [RESOURCE_CATALYST, RESOURCE_KEANIUM, RESOURCE_UTRIUM];
      if (valuableMinerals.includes(intel.mineralType)) {
        score += 15;
      } else {
        score += 10;
      }
    }

    // Threat penalty
    score -= intel.threatLevel * 10;

    // Distance penalty (prefer closer rooms)
    const distance = this.calculateMinDistance(intel.name, ownedRooms.map(r => r.name));
    score -= Math.max(0, distance - 2) * 5;

    return score;
  }

  /**
   * Calculate minimum linear distance between a room and owned rooms
   */
  private calculateMinDistance(roomName: string, ownedRoomNames: string[]): number {
    let minDist = Infinity;

    for (const owned of ownedRoomNames) {
      const dist = Game.map.getRoomLinearDistance(roomName, owned);
      if (dist < minDist) minDist = dist;
    }

    return minDist === Infinity ? 10 : minDist;
  }

  /**
   * Update power bank tracking
   */
  private updatePowerBanks(overmind: OvermindMemory): void {
    // Remove expired power banks
    overmind.powerBanks = overmind.powerBanks.filter(pb => pb.decayTick > Game.time);

    // Scan visible rooms for power banks
    for (const room of Object.values(Game.rooms)) {
      const powerBanks = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_BANK
      }) as StructurePowerBank[];

      for (const pb of powerBanks) {
        // Check if already tracked
        const existing = overmind.powerBanks.find(
          e => e.roomName === room.name && e.pos.x === pb.pos.x && e.pos.y === pb.pos.y
        );

        if (existing) {
          existing.power = pb.power;
          existing.decayTick = pb.ticksToDecay + Game.time;
        } else if (pb.power >= this.config.minPowerBankPower) {
          const entry: PowerBankEntry = {
            roomName: room.name,
            pos: { x: pb.pos.x, y: pb.pos.y },
            power: pb.power,
            decayTick: pb.ticksToDecay + Game.time,
            active: false
          };
          overmind.powerBanks.push(entry);
        }
      }
    }
  }

  /**
   * Evaluate war targets
   */
  private evaluateWarTargets(overmind: OvermindMemory): void {
    // War mode is disabled by default
    if (!overmind.objectives.warMode) {
      return;
    }

    // Look for hostile activity in our rooms
    const hostileOwners = new Set<string>();

    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;

      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      for (const hostile of hostiles) {
        if (hostile.owner?.username) {
          hostileOwners.add(hostile.owner.username);
        }
      }
    }

    // Add hostile owners to war targets if not already present
    for (const owner of hostileOwners) {
      if (!overmind.warTargets.includes(owner)) {
        overmind.warTargets.push(owner);
        logger.warn(`Added war target: ${owner}`, { subsystem: "Empire" });
      }
    }
  }

  /**
   * Update global objectives
   */
  private updateObjectives(overmind: OvermindMemory): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Update target room count based on GCL
    overmind.objectives.targetRoomCount = Math.min(Game.gcl.level, 10);

    // Update target power level based on GPL
    overmind.objectives.targetPowerLevel = Game.gpl?.level ?? 0;

    // Pause expansion if any room is under attack
    const underAttack = ownedRooms.some(room => {
      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      return hostiles.length > 3;
    });

    if (underAttack && !overmind.objectives.expansionPaused) {
      overmind.objectives.expansionPaused = true;
      logger.warn("Expansion paused due to hostile activity", { subsystem: "Empire" });
    } else if (!underAttack && overmind.objectives.expansionPaused) {
      overmind.objectives.expansionPaused = false;
      logger.info("Expansion resumed", { subsystem: "Empire" });
    }
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(overmind: OvermindMemory): void {
    // Remove old room intel (not seen in 50000 ticks)
    const staleThreshold = Game.time - 50000;
    for (const [roomName, intel] of Object.entries(overmind.roomIntel)) {
      if (intel.lastSeen < staleThreshold) {
        delete overmind.roomIntel[roomName];
        delete overmind.roomsSeen[roomName];
      }
    }

    // Remove old expansion candidates
    overmind.claimQueue = overmind.claimQueue.filter(c => Game.time - c.lastEvaluated < 5000);
  }

  /**
   * Get the next expansion target
   */
  public getNextExpansionTarget(): ExpansionCandidate | undefined {
    const overmind = this.getOvermindMemory();
    return overmind.claimQueue.find(c => !c.claimed);
  }

  /**
   * Mark a room as claimed
   */
  public markRoomClaimed(roomName: string): void {
    const overmind = this.getOvermindMemory();
    const candidate = overmind.claimQueue.find(c => c.roomName === roomName);
    if (candidate) {
      candidate.claimed = true;
    }
  }

  /**
   * Get power banks available for harvesting
   */
  public getAvailablePowerBanks(): PowerBankEntry[] {
    const overmind = this.getOvermindMemory();
    return overmind.powerBanks.filter(pb => !pb.active && pb.decayTick - Game.time > 3000);
  }

  /**
   * Activate power bank harvesting
   */
  public activatePowerBank(roomName: string, x: number, y: number): void {
    const overmind = this.getOvermindMemory();
    const pb = overmind.powerBanks.find(p => p.roomName === roomName && p.pos.x === x && p.pos.y === y);
    if (pb) {
      pb.active = true;
    }
  }
}

/**
 * Global empire manager instance
 */
export const empireManager = new EmpireManager();
