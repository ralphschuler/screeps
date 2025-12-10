/**
 * Threat Predictor - Predict Enemy Threats
 *
 * Analyzes hostile patterns and predicts potential threats:
 * - Track enemy movement patterns
 * - Predict attack vectors
 * - Detect military buildup
 * - Generate threat alerts
 *
 * Addresses Issue: Intelligence & Coordination (threat prediction)
 */

import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import { logger } from "../core/logger";
import { unifiedStats } from "../core/unifiedStats";
import { memoryManager } from "../memory/manager";

/**
 * Hostile creep tracking
 */
export interface HostileCreepTrack {
  /** Creep ID */
  id: string;
  /** Owner username */
  owner: string;
  /** Last position */
  lastPos: { x: number; y: number; roomName: string };
  /** Previous position */
  prevPos?: { x: number; y: number; roomName: string };
  /** Movement vector */
  vector?: { dx: number; dy: number };
  /** Last seen tick */
  lastSeen: number;
  /** Is aggressive */
  isAggressive: boolean;
  /** Body parts count */
  bodyParts: {
    attack: number;
    rangedAttack: number;
    heal: number;
    work: number;
    tough: number;
  };
}

/**
 * Threat prediction
 */
export interface ThreatPrediction {
  /** Target room name */
  targetRoom: string;
  /** Threat level (0-3) */
  threatLevel: 0 | 1 | 2 | 3;
  /** Predicted attack time (game tick) */
  predictedTime?: number;
  /** Enemy player username */
  enemyPlayer: string;
  /** Estimated force strength */
  forceStrength: number;
  /** Confidence (0-1) */
  confidence: number;
  /** Created tick */
  createdAt: number;
}

/**
 * Threat Predictor Configuration
 */
export interface ThreatPredictorConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run prediction */
  minBucket: number;
  /** Maximum CPU budget per tick (fraction of limit) */
  maxCpuBudget: number;
  /** Track history length in ticks */
  trackHistoryLength: number;
  /** Minimum force strength for threat alert */
  minThreatStrength: number;
  /** Prediction confidence threshold */
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: ThreatPredictorConfig = {
  updateInterval: 20,
  minBucket: 5000,
  maxCpuBudget: 0.02, // 2% of CPU limit
  trackHistoryLength: 1000,
  minThreatStrength: 5, // Minimum 5 combat parts
  confidenceThreshold: 0.6 // 60% confidence
};

/**
 * Threat Predictor Class
 */
@ProcessClass()
export class ThreatPredictor {
  private config: ThreatPredictorConfig;
  private lastRun = 0;
  private hostileTracks: Map<string, HostileCreepTrack> = new Map();
  private predictions: ThreatPrediction[] = [];

  public constructor(config: Partial<ThreatPredictorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main prediction tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:threatPredictor", "Threat Predictor", {
    priority: ProcessPriority.MEDIUM,
    interval: 20,
    minBucket: 5000,
    cpuBudget: 0.02
  })
  public run(): void {
    const cpuStart = Game.cpu.getUsed();
    this.lastRun = Game.time;

    // Track hostile creeps
    unifiedStats.measureSubsystem("threat:tracking", () => {
      this.trackHostileCreeps();
    });

    // Analyze movement patterns
    unifiedStats.measureSubsystem("threat:analysis", () => {
      this.analyzeMovementPatterns();
    });

    // Generate predictions
    unifiedStats.measureSubsystem("threat:prediction", () => {
      this.generatePredictions();
    });

    // Cleanup old tracks
    unifiedStats.measureSubsystem("threat:cleanup", () => {
      this.cleanupOldTracks();
    });

    // Log CPU usage periodically
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    if (Game.time % 500 === 0) {
      logger.info(
        `Threat predictor completed in ${cpuUsed.toFixed(2)} CPU, ${this.hostileTracks.size} hostiles tracked, ${this.predictions.length} active predictions`,
        { subsystem: "Threat" }
      );
    }
  }

  /**
   * Track hostile creeps in visible rooms
   */
  private trackHostileCreeps(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;

      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      for (const hostile of hostiles) {
        const existingTrack = this.hostileTracks.get(hostile.id);
        const pos = { x: hostile.pos.x, y: hostile.pos.y, roomName: hostile.pos.roomName };

        const track: HostileCreepTrack = {
          id: hostile.id,
          owner: hostile.owner.username,
          lastPos: pos,
          prevPos: existingTrack?.lastPos,
          lastSeen: Game.time,
          isAggressive: this.isAggressiveCreep(hostile),
          bodyParts: {
            attack: hostile.getActiveBodyparts(ATTACK),
            rangedAttack: hostile.getActiveBodyparts(RANGED_ATTACK),
            heal: hostile.getActiveBodyparts(HEAL),
            work: hostile.getActiveBodyparts(WORK),
            tough: hostile.getActiveBodyparts(TOUGH)
          }
        };

        // Calculate movement vector
        if (track.prevPos && track.prevPos.roomName === track.lastPos.roomName) {
          track.vector = {
            dx: track.lastPos.x - track.prevPos.x,
            dy: track.lastPos.y - track.prevPos.y
          };
        }

        this.hostileTracks.set(hostile.id, track);
      }
    }
  }

  /**
   * Check if a creep is aggressive
   */
  private isAggressiveCreep(creep: Creep): boolean {
    return (
      creep.getActiveBodyparts(ATTACK) > 0 ||
      creep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
      creep.getActiveBodyparts(WORK) > 2
    );
  }

  /**
   * Analyze movement patterns
   */
  private analyzeMovementPatterns(): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);

    // Group hostiles by owner
    const hostilesByOwner = new Map<string, HostileCreepTrack[]>();
    for (const track of this.hostileTracks.values()) {
      if (!track.isAggressive) continue; // Skip non-aggressive

      const tracks = hostilesByOwner.get(track.owner) || [];
      tracks.push(track);
      hostilesByOwner.set(track.owner, tracks);
    }

    // Analyze each owner's forces
    for (const [owner, tracks] of hostilesByOwner) {
      // Check if moving towards owned rooms
      for (const ownedRoom of ownedRooms) {
        let threateningCount = 0;
        let totalStrength = 0;

        for (const track of tracks) {
          // Check if hostile is approaching owned room
          if (this.isApproaching(track, ownedRoom.name)) {
            threateningCount++;
            totalStrength += this.calculateCreepStrength(track);
          }
        }

        // Generate threat if significant force detected
        if (threateningCount >= 2 && totalStrength >= this.config.minThreatStrength) {
          logger.warn(
            `Detected ${threateningCount} hostile creeps from ${owner} approaching ${ownedRoom.name}, total strength: ${totalStrength}`,
            { subsystem: "Threat" }
          );

          // Update room intel threat level
          const overmind = memoryManager.getOvermind();
          const intel = overmind.roomIntel[ownedRoom.name];
          if (intel) {
            intel.threatLevel = Math.max(intel.threatLevel, 2) as 0 | 1 | 2 | 3;
          }
        }
      }
    }
  }

  /**
   * Check if hostile is approaching target room
   */
  private isApproaching(track: HostileCreepTrack, targetRoom: string): boolean {
    if (!track.vector) return false;
    if (track.lastPos.roomName === targetRoom) return true;

    // Check if movement vector points towards target room
    // This is a simplified check - a more sophisticated implementation
    // would use pathfinding to determine actual approach
    return this.getAdjacentRooms(track.lastPos.roomName).includes(targetRoom);
  }

  /**
   * Get adjacent room names
   */
  private getAdjacentRooms(roomName: string): string[] {
    const match = roomName.match(/([EW])(\d+)([NS])(\d+)/);
    if (!match) return [];

    const [, ewDir, xStr, nsDir, yStr] = match;
    const x = parseInt(xStr, 10);
    const y = parseInt(yStr, 10);

    const adjacent: string[] = [];

    // North
    adjacent.push(`${ewDir}${x}${nsDir}${nsDir === "N" ? y + 1 : y - 1}`);
    // South
    adjacent.push(`${ewDir}${x}${nsDir}${nsDir === "N" ? y - 1 : y + 1}`);
    // East
    adjacent.push(`${ewDir === "E" ? x + 1 : x - 1}${nsDir}${y}`);
    // West
    adjacent.push(`${ewDir === "E" ? x - 1 : x + 1}${nsDir}${y}`);

    return adjacent;
  }

  /**
   * Calculate creep combat strength
   */
  private calculateCreepStrength(track: HostileCreepTrack): number {
    let strength = 0;
    strength += track.bodyParts.attack * 2; // Attack parts weighted heavily
    strength += track.bodyParts.rangedAttack * 1.5; // Ranged attack parts
    strength += track.bodyParts.heal * 1.5; // Heal parts are valuable
    strength += track.bodyParts.work * 0.5; // Work parts for dismantling
    strength += track.bodyParts.tough * 0.1; // Tough parts add durability
    return strength;
  }

  /**
   * Generate threat predictions
   */
  private generatePredictions(): void {
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    const newPredictions: ThreatPrediction[] = [];

    // Group hostiles by owner and room
    const hostilesByOwnerRoom = new Map<string, Map<string, HostileCreepTrack[]>>();
    for (const track of this.hostileTracks.values()) {
      if (!track.isAggressive) continue;

      const ownerMap = hostilesByOwnerRoom.get(track.owner) || new Map<string, HostileCreepTrack[]>();
      const roomTracks = ownerMap.get(track.lastPos.roomName) || [];
      roomTracks.push(track);
      ownerMap.set(track.lastPos.roomName, roomTracks);
      hostilesByOwnerRoom.set(track.owner, ownerMap);
    }

    // Generate predictions for each owned room
    for (const ownedRoom of ownedRooms) {
      for (const [owner, roomMap] of hostilesByOwnerRoom) {
        let totalStrength = 0;
        let hostileCount = 0;

        // Check adjacent rooms for hostile forces
        const adjacentRooms = this.getAdjacentRooms(ownedRoom.name);
        adjacentRooms.push(ownedRoom.name); // Include the room itself

        for (const adjacentRoom of adjacentRooms) {
          const tracks = roomMap.get(adjacentRoom);
          if (!tracks) continue;

          for (const track of tracks) {
            totalStrength += this.calculateCreepStrength(track);
            hostileCount++;
          }
        }

        // Create prediction if significant threat
        if (totalStrength >= this.config.minThreatStrength) {
          const threatLevel = this.calculateThreatLevel(totalStrength);
          const confidence = this.calculateConfidence(hostileCount, totalStrength);

          if (confidence >= this.config.confidenceThreshold) {
            newPredictions.push({
              targetRoom: ownedRoom.name,
              threatLevel,
              enemyPlayer: owner,
              forceStrength: totalStrength,
              confidence,
              createdAt: Game.time
            });
          }
        }
      }
    }

    this.predictions = newPredictions;

    // Log significant predictions
    for (const prediction of newPredictions) {
      if (prediction.threatLevel >= 2) {
        logger.warn(
          `Threat prediction: ${prediction.enemyPlayer} targeting ${prediction.targetRoom}, threat level ${prediction.threatLevel}, strength ${prediction.forceStrength.toFixed(1)}, confidence ${(prediction.confidence * 100).toFixed(0)}%`,
          { subsystem: "Threat" }
        );
      }
    }
  }

  /**
   * Calculate threat level from force strength
   */
  private calculateThreatLevel(strength: number): 0 | 1 | 2 | 3 {
    if (strength >= 50) return 3; // Critical threat
    if (strength >= 25) return 2; // High threat
    if (strength >= 10) return 1; // Medium threat
    return 0; // Low threat
  }

  /**
   * Calculate confidence in prediction
   */
  private calculateConfidence(hostileCount: number, totalStrength: number): number {
    // More hostiles and higher strength = higher confidence
    let confidence = 0;

    // Base confidence from hostile count
    confidence += Math.min(hostileCount / 10, 0.5); // Up to 50% from count

    // Additional confidence from strength
    confidence += Math.min(totalStrength / 100, 0.5); // Up to 50% from strength

    return Math.min(confidence, 1.0);
  }

  /**
   * Cleanup old tracks
   */
  private cleanupOldTracks(): void {
    const cutoff = Game.time - this.config.trackHistoryLength;
    const toRemove: string[] = [];

    for (const [id, track] of this.hostileTracks) {
      if (track.lastSeen < cutoff) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      this.hostileTracks.delete(id);
    }
  }

  /**
   * Get predictions for a room
   */
  public getPredictionsForRoom(roomName: string): ThreatPrediction[] {
    return this.predictions.filter(p => p.targetRoom === roomName);
  }

  /**
   * Get all active predictions
   */
  public getAllPredictions(): ThreatPrediction[] {
    return this.predictions;
  }

  /**
   * Get hostile tracks for a player
   */
  public getHostileTracksForPlayer(username: string): HostileCreepTrack[] {
    return Array.from(this.hostileTracks.values()).filter(t => t.owner === username);
  }
}
