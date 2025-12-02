/**
 * Power Bank Harvesting Manager
 *
 * Manages power bank discovery and harvesting:
 * - Power bank discovery across highway rooms
 * - Profitability calculation
 * - Attack/heal squad coordination
 * - Power transport logistics
 *
 * Addresses Issue: #26
 */

import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import type { PowerBankEntry } from "../memory/schemas";

/**
 * Power bank harvesting configuration
 */
export interface PowerBankConfig {
  /** Minimum power to consider harvesting */
  minPower: number;
  /** Maximum distance from nearest owned room */
  maxDistance: number;
  /** Minimum remaining ticks to harvest */
  minTicksRemaining: number;
  /** Healer to attacker ratio */
  healerRatio: number;
  /** Minimum CPU bucket to start new operation */
  minBucket: number;
  /** Maximum concurrent operations */
  maxConcurrentOps: number;
}

const DEFAULT_CONFIG: PowerBankConfig = {
  minPower: 1000,
  maxDistance: 5,
  minTicksRemaining: 3000,
  healerRatio: 0.5,
  minBucket: 7000,
  maxConcurrentOps: 2
};

/**
 * Power bank operation state
 */
export interface PowerBankOperation {
  /** Power bank room */
  roomName: string;
  /** Power bank position */
  pos: { x: number; y: number };
  /** Power amount */
  power: number;
  /** Expected decay tick */
  decayTick: number;
  /** Home room for this operation */
  homeRoom: string;
  /** Operation state */
  state: "scouting" | "attacking" | "collecting" | "complete" | "failed";
  /** Assigned creeps */
  assignedCreeps: {
    attackers: string[];
    healers: string[];
    carriers: string[];
  };
  /** Damage dealt so far */
  damageDealt: number;
  /** Power collected */
  powerCollected: number;
  /** Operation start tick */
  startedAt: number;
  /** Estimated completion tick */
  estimatedCompletion: number;
}

/**
 * Power Bank Harvesting Manager
 */
export class PowerBankHarvestingManager {
  private config: PowerBankConfig;
  private operations: Map<string, PowerBankOperation> = new Map();
  private lastScan: number = 0;

  public constructor(config: Partial<PowerBankConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main tick - scan for power banks and manage operations
   */
  public run(): void {
    // Scan for new power banks every 50 ticks
    if (Game.time - this.lastScan >= 50) {
      this.scanForPowerBanks();
      this.lastScan = Game.time;
    }

    // Update active operations
    this.updateOperations();

    // Evaluate new opportunities
    if (Game.cpu.bucket >= this.config.minBucket) {
      this.evaluateOpportunities();
    }

    // Log status periodically
    if (Game.time % 100 === 0 && this.operations.size > 0) {
      this.logStatus();
    }
  }

  /**
   * Scan visible rooms for power banks
   */
  private scanForPowerBanks(): void {
    const overmind = memoryManager.getOvermind();

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];

      // Only scan highway rooms
      const coordMatch = roomName.match(/^[WE](\d+)[NS](\d+)$/);
      if (!coordMatch) continue;

      const x = parseInt(coordMatch[1]!, 10);
      const y = parseInt(coordMatch[2]!, 10);
      const isHighway = x % 10 === 0 || y % 10 === 0;
      if (!isHighway) continue;

      // Find power banks
      const powerBanks = room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_BANK
      }) as StructurePowerBank[];

      for (const pb of powerBanks) {
        // Check if already tracked
        const existing = overmind.powerBanks.find(
          entry => entry.roomName === roomName && entry.pos.x === pb.pos.x && entry.pos.y === pb.pos.y
        );

        if (!existing) {
          const entry: PowerBankEntry = {
            roomName,
            pos: { x: pb.pos.x, y: pb.pos.y },
            power: pb.power,
            decayTick: Game.time + (pb.ticksToDecay ?? 5000),
            active: false
          };

          overmind.powerBanks.push(entry);

          if (pb.power >= this.config.minPower) {
            logger.info(`Power bank discovered in ${roomName}: ${pb.power} power`, {
              subsystem: "PowerBank"
            });
          }
        } else {
          // Update existing entry
          existing.power = pb.power;
          existing.decayTick = Game.time + (pb.ticksToDecay ?? 5000);
        }
      }
    }

    // Clean up decayed power banks
    overmind.powerBanks = overmind.powerBanks.filter(pb => pb.decayTick > Game.time);
  }

  /**
   * Update active operations
   */
  private updateOperations(): void {
    for (const [opId, op] of this.operations) {
      switch (op.state) {
        case "scouting":
          this.updateScoutingOp(op);
          break;
        case "attacking":
          this.updateAttackingOp(op);
          break;
        case "collecting":
          this.updateCollectingOp(op);
          break;
        case "complete":
        case "failed":
          // Remove completed/failed operations after some time
          if (Game.time - op.startedAt > 10000) {
            this.operations.delete(opId);
          }
          break;
      }
    }
  }

  /**
   * Update scouting operation
   */
  private updateScoutingOp(op: PowerBankOperation): void {
    const room = Game.rooms[op.roomName];
    if (!room) return;

    // Check if power bank still exists
    const powerBank = room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_POWER_BANK &&
        s.pos.x === op.pos.x &&
        s.pos.y === op.pos.y
    })[0] as StructurePowerBank | undefined;

    if (!powerBank) {
      op.state = "failed";
      logger.warn(`Power bank in ${op.roomName} disappeared`, { subsystem: "PowerBank" });
      return;
    }

    // Update power amount
    op.power = powerBank.power;
    op.decayTick = Game.time + (powerBank.ticksToDecay ?? 0);

    // Transition to attacking once we have creeps
    if (op.assignedCreeps.attackers.length > 0) {
      op.state = "attacking";
      logger.info(`Starting attack on power bank in ${op.roomName}`, {
        subsystem: "PowerBank"
      });
    }
  }

  /**
   * Update attacking operation
   */
  private updateAttackingOp(op: PowerBankOperation): void {
    const room = Game.rooms[op.roomName];

    // Check if attackers are still alive
    op.assignedCreeps.attackers = op.assignedCreeps.attackers.filter(name => Game.creeps[name]);
    op.assignedCreeps.healers = op.assignedCreeps.healers.filter(name => Game.creeps[name]);

    if (!room) {
      // Lost visibility - check if we still have creeps en route
      if (op.assignedCreeps.attackers.length === 0 && op.assignedCreeps.healers.length === 0) {
        op.state = "failed";
      }
      return;
    }

    // Check if power bank is destroyed
    const powerBank = room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_POWER_BANK &&
        s.pos.x === op.pos.x &&
        s.pos.y === op.pos.y
    })[0] as StructurePowerBank | undefined;

    if (!powerBank) {
      // Power bank destroyed - transition to collecting
      op.state = "collecting";
      logger.info(`Power bank destroyed in ${op.roomName}, collecting power`, {
        subsystem: "PowerBank"
      });
      return;
    }

    // Track damage
    const previousHits = (op as { lastHits?: number }).lastHits ?? 2000000;
    (op as { lastHits?: number }).lastHits = powerBank.hits;
    if (previousHits > powerBank.hits) {
      op.damageDealt += previousHits - powerBank.hits;
    }

    // Check if we'll finish in time
    const ticksRemaining = op.decayTick - Game.time;
    const dpsEstimate = op.damageDealt / Math.max(1, Game.time - op.startedAt);
    const ticksToDestroy = powerBank.hits / Math.max(1, dpsEstimate);

    if (ticksToDestroy > ticksRemaining * 0.9) {
      // We won't make it - consider adding more attackers
      logger.warn(
        `Power bank in ${op.roomName} may decay before completion (${Math.round(ticksToDestroy)} > ${ticksRemaining})`,
        { subsystem: "PowerBank" }
      );
    }

    op.estimatedCompletion = Game.time + Math.round(ticksToDestroy);
  }

  /**
   * Update collecting operation
   */
  private updateCollectingOp(op: PowerBankOperation): void {
    const room = Game.rooms[op.roomName];

    // Check if carriers are still alive
    op.assignedCreeps.carriers = op.assignedCreeps.carriers.filter(name => Game.creeps[name]);

    if (!room) {
      if (op.assignedCreeps.carriers.length === 0) {
        // No carriers and no visibility - operation failed
        op.state = "failed";
      }
      return;
    }

    // Check for dropped power
    const droppedPower = room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_POWER
    });

    // Check for power in ruins
    const ruins = room.find(FIND_RUINS, {
      filter: r => r.store.getUsedCapacity(RESOURCE_POWER) > 0
    });

    if (droppedPower.length === 0 && ruins.length === 0) {
      // All power collected
      op.state = "complete";
      logger.info(
        `Power bank operation complete in ${op.roomName}: ${op.powerCollected} power collected`,
        { subsystem: "PowerBank" }
      );
    }
  }

  /**
   * Evaluate opportunities for new operations
   */
  private evaluateOpportunities(): void {
    // Check if we can start more operations
    const activeOps = Array.from(this.operations.values()).filter(
      op => op.state !== "complete" && op.state !== "failed"
    );

    if (activeOps.length >= this.config.maxConcurrentOps) {
      return;
    }

    const overmind = memoryManager.getOvermind();
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my && r.controller.level >= 7);

    if (ownedRooms.length === 0) return;

    // Find best power bank opportunity
    const candidates = overmind.powerBanks
      .filter(pb => {
        // Not already active
        if (pb.active || this.operations.has(pb.roomName)) return false;

        // Minimum power
        if (pb.power < this.config.minPower) return false;

        // Minimum time remaining
        const ticksRemaining = pb.decayTick - Game.time;
        if (ticksRemaining < this.config.minTicksRemaining) return false;

        // Check distance
        const minDistance = this.getMinDistanceToOwned(pb.roomName, ownedRooms);
        if (minDistance > this.config.maxDistance) return false;

        return true;
      })
      .map(pb => ({
        entry: pb,
        score: this.scorePowerBank(pb, ownedRooms)
      }))
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0 && (candidates[0]?.score ?? 0) > 0) {
      const best = candidates[0]!;
      this.startOperation(best.entry, ownedRooms);
    }
  }

  /**
   * Score a power bank opportunity
   */
  private scorePowerBank(pb: PowerBankEntry, ownedRooms: Room[]): number {
    let score = 0;

    // Base score from power amount
    score += pb.power * 0.01;

    // Time remaining bonus
    const ticksRemaining = pb.decayTick - Game.time;
    if (ticksRemaining > 4000) score += 50;
    if (ticksRemaining > 5000) score += 30;

    // Distance penalty
    const distance = this.getMinDistanceToOwned(pb.roomName, ownedRooms);
    score -= distance * 20;

    // Power threshold bonus
    if (pb.power >= 3000) score += 50;
    if (pb.power >= 5000) score += 50;

    return score;
  }

  /**
   * Get minimum distance to owned rooms
   */
  private getMinDistanceToOwned(roomName: string, ownedRooms: Room[]): number {
    let minDistance = Infinity;
    for (const room of ownedRooms) {
      const distance = Game.map.getRoomLinearDistance(roomName, room.name);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    return minDistance;
  }

  /**
   * Start a new power bank operation
   */
  private startOperation(pb: PowerBankEntry, ownedRooms: Room[]): void {
    // Find best home room
    let bestRoom: Room | null = null;
    let bestDistance = Infinity;

    for (const room of ownedRooms) {
      const distance = Game.map.getRoomLinearDistance(pb.roomName, room.name);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRoom = room;
      }
    }

    if (!bestRoom) return;

    const op: PowerBankOperation = {
      roomName: pb.roomName,
      pos: pb.pos,
      power: pb.power,
      decayTick: pb.decayTick,
      homeRoom: bestRoom.name,
      state: "scouting",
      assignedCreeps: {
        attackers: [],
        healers: [],
        carriers: []
      },
      damageDealt: 0,
      powerCollected: 0,
      startedAt: Game.time,
      estimatedCompletion: 0
    };

    this.operations.set(pb.roomName, op);
    pb.active = true;

    logger.info(
      `Started power bank operation in ${pb.roomName} (${pb.power} power, home: ${bestRoom.name})`,
      { subsystem: "PowerBank" }
    );
  }

  /**
   * Assign a creep to an operation
   */
  public assignCreep(creepName: string, opRoomName: string, role: "attacker" | "healer" | "carrier"): boolean {
    const op = this.operations.get(opRoomName);
    if (!op) return false;

    switch (role) {
      case "attacker":
        if (!op.assignedCreeps.attackers.includes(creepName)) {
          op.assignedCreeps.attackers.push(creepName);
        }
        break;
      case "healer":
        if (!op.assignedCreeps.healers.includes(creepName)) {
          op.assignedCreeps.healers.push(creepName);
        }
        break;
      case "carrier":
        if (!op.assignedCreeps.carriers.includes(creepName)) {
          op.assignedCreeps.carriers.push(creepName);
        }
        break;
    }

    return true;
  }

  /**
   * Record power collected
   */
  public recordPowerCollected(opRoomName: string, amount: number): void {
    const op = this.operations.get(opRoomName);
    if (op) {
      op.powerCollected += amount;
    }
  }

  /**
   * Get active operations
   */
  public getActiveOperations(): PowerBankOperation[] {
    return Array.from(this.operations.values()).filter(
      op => op.state !== "complete" && op.state !== "failed"
    );
  }

  /**
   * Get operation for a room
   */
  public getOperation(roomName: string): PowerBankOperation | undefined {
    return this.operations.get(roomName);
  }

  /**
   * Calculate required creeps for an operation
   */
  public getRequiredCreeps(op: PowerBankOperation): {
    attackers: number;
    healers: number;
    carriers: number;
  } {
    const ticksRemaining = op.decayTick - Game.time;
    const hitsRemaining = 2000000 - op.damageDealt;

    // Safety margin to account for travel time and coordination delays
    const COMPLETION_SAFETY_MARGIN = 0.8;
    // Assume 600 DPS per attacker pair (attacker + healer)
    // Power bank reflects 50% of damage, so we need ~300 heal/tick per attacker
    const dpsNeeded = hitsRemaining / (ticksRemaining * COMPLETION_SAFETY_MARGIN);
    const attackersNeeded = Math.ceil(dpsNeeded / 600);

    // Healers at configured ratio
    const healersNeeded = Math.ceil(attackersNeeded * this.config.healerRatio);

    // Carriers based on power amount (assume 2000 carry capacity each)
    const carriersNeeded = Math.ceil(op.power / 2000);

    return {
      attackers: Math.max(1, attackersNeeded),
      healers: Math.max(1, healersNeeded),
      carriers: Math.max(1, carriersNeeded)
    };
  }

  /**
   * Log current status
   */
  private logStatus(): void {
    const activeOps = Array.from(this.operations.values()).filter(
      op => op.state !== "complete" && op.state !== "failed"
    );

    for (const op of activeOps) {
      logger.info(
        `Power bank op ${op.roomName}: ${op.state}, ` +
          `${op.assignedCreeps.attackers.length}A/${op.assignedCreeps.healers.length}H/${op.assignedCreeps.carriers.length}C, ` +
          `${Math.round(op.damageDealt / 1000)}k damage, ${op.powerCollected} collected`,
        { subsystem: "PowerBank" }
      );
    }
  }
}

/**
 * Global power bank harvesting manager instance
 */
export const powerBankHarvestingManager = new PowerBankHarvestingManager();
