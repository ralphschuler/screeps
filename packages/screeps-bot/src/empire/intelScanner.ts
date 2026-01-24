/**
 * Intel Scanner - Continuous Enemy Scanning
 *
 * Continuously scans rooms for enemy activity:
 * - Track hostile players and their rooms
 * - Update threat levels based on hostile activity
 * - Monitor enemy movements and patterns
 * - Detect enemy expansion and military buildup
 *
 * Addresses Issue: Intelligence & Coordination (continuous enemy scanning)
 */

import { logger } from "@ralphschuler/screeps-core";
import { unifiedStats } from "@ralphschuler/screeps-stats";
import { ProcessPriority } from "../core/kernel";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { memoryManager } from "../memory/manager";
import type { RoomIntel } from "../memory/schemas";

/**
 * Enemy player tracking
 */
export interface EnemyPlayer {
  /** Player username */
  username: string;
  /** Last seen tick */
  lastSeen: number;
  /** Known rooms */
  rooms: string[];
  /** Threat level (0-3) */
  threatLevel: 0 | 1 | 2 | 3;
  /** Aggressive actions count (attacks, nukes, etc) */
  aggressionCount: number;
  /** Is ally/whitelisted */
  isAlly: boolean;
}

/**
 * Intel Scanner Configuration
 */
export interface IntelScannerConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum bucket to run scanning */
  minBucket: number;
  /** Maximum CPU budget per tick (fraction of limit) */
  maxCpuBudget: number;
  /** Number of rooms to scan per tick */
  roomsPerTick: number;
  /** Interval to rescan rooms (ticks) */
  rescanInterval: number;
  /** Allied player usernames */
  allies: string[];
  /** Aggression threshold for elevated threat */
  aggressionThreshold: number;
}

const DEFAULT_CONFIG: IntelScannerConfig = {
  updateInterval: 10,
  minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
  maxCpuBudget: 0.02, // 2% of CPU limit
  roomsPerTick: 3,
  rescanInterval: 1000, // Rescan every 1000 ticks
  allies: [],
  aggressionThreshold: 5 // 5 aggressive actions = elevated threat
};

/**
 * Intel Scanner Class
 */
@ProcessClass()
export class IntelScanner {
  private config: IntelScannerConfig;
  private lastRun = 0;
  private scanQueue: string[] = [];
  private enemyPlayers: Map<string, EnemyPlayer> = new Map();

  public constructor(config: Partial<IntelScannerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main scanning tick - runs periodically
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:intelScanner", "Intel Scanner", {
    priority: ProcessPriority.MEDIUM,
    interval: 10,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.02
  })
  public run(): void {
    const cpuStart = Game.cpu.getUsed();
    this.lastRun = Game.time;

    // Build scan queue if empty
    if (this.scanQueue.length === 0) {
      this.buildScanQueue();
    }

    // Scan rooms from queue
    unifiedStats.measureSubsystem("intel:scanning", () => {
      this.scanRooms();
    });

    // Update enemy player tracking
    unifiedStats.measureSubsystem("intel:enemyTracking", () => {
      this.updateEnemyTracking();
    });

    // Detect threats in visible rooms
    unifiedStats.measureSubsystem("intel:threatDetection", () => {
      this.detectThreats();
    });

    // Update room intel threat levels
    unifiedStats.measureSubsystem("intel:threatUpdate", () => {
      this.updateRoomThreatLevels();
    });

    // Log CPU usage periodically
    const cpuUsed = Game.cpu.getUsed() - cpuStart;
    if (Game.time % 500 === 0) {
      logger.info(`Intel scanner completed in ${cpuUsed.toFixed(2)} CPU, ${this.enemyPlayers.size} enemies tracked`, {
        subsystem: "Intel"
      });
    }
  }

  /**
   * Build queue of rooms to scan
   */
  private buildScanQueue(): void {
    const empire = memoryManager.getEmpire();
    const roomsToScan: string[] = [];

    // Add all known rooms that need rescanning
    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      const timeSinceLastScan = Game.time - intel.lastSeen;

      // Prioritize rooms with higher threat levels and older scans
      if (timeSinceLastScan >= this.config.rescanInterval || intel.threatLevel > 0) {
        roomsToScan.push(roomName);
      }
    }

    // Sort by priority: threat level (desc), last seen (asc)
    roomsToScan.sort((a, b) => {
      const intelA = empire.knownRooms[a];
      const intelB = empire.knownRooms[b];
      if (!intelA || !intelB) return 0;

      // Higher threat first
      if (intelB.threatLevel !== intelA.threatLevel) {
        return intelB.threatLevel - intelA.threatLevel;
      }

      // Older scans first
      return intelA.lastSeen - intelB.lastSeen;
    });

    this.scanQueue = roomsToScan;
    logger.debug(`Built scan queue with ${this.scanQueue.length} rooms`, { subsystem: "Intel" });
  }

  /**
   * Scan rooms from the queue
   */
  private scanRooms(): void {
    const empire = memoryManager.getEmpire();
    let scanned = 0;

    while (scanned < this.config.roomsPerTick && this.scanQueue.length > 0) {
      const roomName = this.scanQueue.shift();
      if (!roomName) break;

      // Check if we have visibility
      const room = Game.rooms[roomName];
      if (!room) {
        // No visibility, mark as seen but not updated
        const intel = empire.knownRooms[roomName];
        if (intel) {
          intel.lastSeen = Game.time;
        }
        continue;
      }

      // Update room intel
      this.updateRoomIntel(room, empire);
      scanned++;
    }
  }

  /**
   * Update room intel from visible room
   */
  private updateRoomIntel(room: Room, empire: ReturnType<typeof memoryManager.getEmpire>): void {
    const intel = empire.knownRooms[room.name] || this.createDefaultIntel(room.name);

    // Update basic info
    intel.lastSeen = Game.time;
    intel.scouted = true;

    // Update sources
    const sources = room.find(FIND_SOURCES);
    intel.sources = sources.length;

    // Update controller info
    if (room.controller) {
      intel.controllerLevel = room.controller.level;
      if (room.controller.owner) {
        intel.owner = room.controller.owner.username;
      } else {
        intel.owner = undefined;
      }
      if (room.controller.reservation) {
        intel.reserver = room.controller.reservation.username;
      } else {
        intel.reserver = undefined;
      }
    }

    // Update mineral
    const minerals = room.find(FIND_MINERALS);
    if (minerals.length > 0) {
      intel.mineralType = minerals[0].mineralType;
    }

    // Update structures
    const towers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });
    intel.towerCount = towers.length;

    const spawns = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_SPAWN });
    intel.spawnCount = spawns.length;

    // Check for portals
    const portals = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_PORTAL });
    intel.hasPortal = portals.length > 0;

    // Update terrain classification
    intel.terrain = this.classifyTerrain(room);
    intel.isHighway = this.isHighwayRoom(room.name);
    intel.isSK = this.isSourceKeeperRoom(room.name);

    empire.knownRooms[room.name] = intel;
  }

  /**
   * Create default intel entry
   */
  private createDefaultIntel(roomName: string): RoomIntel {
    return {
      name: roomName,
      lastSeen: Game.time,
      sources: 0,
      controllerLevel: 0,
      threatLevel: 0,
      scouted: false,
      terrain: "mixed",
      isHighway: this.isHighwayRoom(roomName),
      isSK: this.isSourceKeeperRoom(roomName)
    };
  }

  /**
   * Classify room terrain
   */
  private classifyTerrain(room: Room): "plains" | "swamp" | "mixed" {
    const terrain = room.getTerrain();
    let plains = 0;
    let swamp = 0;

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const tile = terrain.get(x, y);
        if (tile === TERRAIN_MASK_SWAMP) {
          swamp++;
        } else if (tile === 0) {
          plains++;
        }
      }
    }

    if (swamp > plains * 2) return "swamp";
    if (plains > swamp * 2) return "plains";
    return "mixed";
  }

  /**
   * Check if room is highway
   */
  private isHighwayRoom(roomName: string): boolean {
    const match = roomName.match(/[EW](\d+)[NS](\d+)/);
    if (!match) return false;
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    return x % 10 === 0 || y % 10 === 0;
  }

  /**
   * Check if room is source keeper
   */
  private isSourceKeeperRoom(roomName: string): boolean {
    const match = roomName.match(/[EW](\d+)[NS](\d+)/);
    if (!match) return false;
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    const xMod = x % 10;
    const yMod = y % 10;
    return (xMod === 4 || xMod === 5 || xMod === 6) && (yMod === 4 || yMod === 5 || yMod === 6);
  }

  /**
   * Update enemy player tracking from visible rooms
   */
  private updateEnemyTracking(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;

      // Find hostile creeps
      const hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
      for (const creep of hostileCreeps) {
        const owner: string = creep.owner.username;
        if (this.config.allies.includes(owner)) continue;

        let enemy = this.enemyPlayers.get(owner);
        if (!enemy) {
          enemy = {
            username: owner,
            lastSeen: Game.time,
            rooms: [],
            threatLevel: 0,
            aggressionCount: 0,
            isAlly: false
          };
          this.enemyPlayers.set(owner, enemy);
        }

        enemy.lastSeen = Game.time;
        if (!enemy.rooms.includes(roomName)) {
          enemy.rooms.push(roomName);
        }

        // Check for aggressive intent
        if (this.isAggressiveCreep(creep)) {
          enemy.aggressionCount++;
        }
      }

      // Check for hostile structures (owned by other players)
      if (room.controller?.owner && !room.controller.my) {
        const owner = room.controller.owner.username;
        if (this.config.allies.includes(owner)) continue;

        let enemy = this.enemyPlayers.get(owner);
        if (!enemy) {
          enemy = {
            username: owner,
            lastSeen: Game.time,
            rooms: [],
            threatLevel: 0,
            aggressionCount: 0,
            isAlly: false
          };
          this.enemyPlayers.set(owner, enemy);
        }

        enemy.lastSeen = Game.time;
        if (!enemy.rooms.includes(roomName)) {
          enemy.rooms.push(roomName);
        }
      }
    }

    // Update threat levels based on aggression
    for (const enemy of this.enemyPlayers.values()) {
      if (enemy.aggressionCount >= this.config.aggressionThreshold * 3) {
        enemy.threatLevel = 3; // High threat
      } else if (enemy.aggressionCount >= this.config.aggressionThreshold * 2) {
        enemy.threatLevel = 2; // Medium threat
      } else if (enemy.aggressionCount >= this.config.aggressionThreshold) {
        enemy.threatLevel = 1; // Low threat
      } else {
        enemy.threatLevel = 0; // No threat
      }
    }
  }

  /**
   * Check if a creep is aggressive
   */
  private isAggressiveCreep(creep: Creep): boolean {
    const hasCombatParts =
      creep.getActiveBodyparts(ATTACK) > 0 ||
      creep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
      creep.getActiveBodyparts(WORK) > 2; // Dismantlers
    return hasCombatParts;
  }

  /**
   * Detect threats in visible rooms
   */
  private detectThreats(): void {
    const empire = memoryManager.getEmpire();

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;

      const intel = empire.knownRooms[roomName];
      if (!intel) continue;

      // Detect hostile creeps
      const hostileCreeps = room.find(FIND_HOSTILE_CREEPS);
      const aggressiveHostiles = hostileCreeps.filter(c => this.isAggressiveCreep(c));

      // Detect incoming nukes
      const nukes = room.find(FIND_NUKES);

      // Update threat level
      let threatLevel: 0 | 1 | 2 | 3 = 0;
      if (nukes.length > 0) {
        threatLevel = 3; // Nuke = highest threat
        logger.warn(`Nuke detected in ${roomName}, ${nukes.length} incoming`, { subsystem: "Intel" });
      } else if (aggressiveHostiles.length > 10) {
        threatLevel = 3; // Large hostile force
      } else if (aggressiveHostiles.length > 5) {
        threatLevel = 2; // Medium hostile force
      } else if (hostileCreeps.length > 0) {
        threatLevel = 1; // Some hostiles present
      }

      intel.threatLevel = threatLevel;
    }
  }

  /**
   * Update room threat levels in intel database
   */
  private updateRoomThreatLevels(): void {
    const empire = memoryManager.getEmpire();

    // Decay threat levels for rooms not recently seen
    for (const roomName in empire.knownRooms) {
      const intel = empire.knownRooms[roomName];
      const timeSinceLastSeen = Game.time - intel.lastSeen;

      // Decay threat level if not seen recently
      if (timeSinceLastSeen > 100 && intel.threatLevel > 0) {
        intel.threatLevel = Math.max(0, intel.threatLevel - 1) as 0 | 1 | 2 | 3;
      }
    }

    // Update war targets based on enemy tracking
    const warTargets: string[] = [];
    for (const [username, enemy] of this.enemyPlayers) {
      if (enemy.threatLevel >= 2) {
        warTargets.push(username);
      }
    }
    empire.warTargets = [...new Set(warTargets)]; // Remove duplicates
  }

  /**
   * Get enemy player info
   */
  public getEnemyPlayer(username: string): EnemyPlayer | undefined {
    return this.enemyPlayers.get(username);
  }

  /**
   * Get all enemy players
   */
  public getAllEnemies(): EnemyPlayer[] {
    return Array.from(this.enemyPlayers.values());
  }
}
