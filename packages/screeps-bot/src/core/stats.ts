/**
 * Unified Statistics System
 *
 * Collects and manages all bot statistics:
 * - Per-subsystem statistics
 * - Per-creep role statistics  
 * - Per-room statistics
 * - Overall/empire statistics
 * - Pheromone statistics
 * - Native calls statistics (pathfinding, creep actions)
 *
 * All stats are published to Memory.stats for consumption by external tools
 * like the Influx exporter and Grafana dashboards.
 */

import { logger } from "./logger";

// ============================================================================
// Stats Interfaces
// ============================================================================

/**
 * Per-subsystem statistics
 */
export interface SubsystemStats {
  /** Average CPU used by subsystem */
  avgCpu: number;
  /** Peak CPU used by subsystem */
  peakCpu: number;
  /** Total calls this tick */
  calls: number;
  /** Number of samples */
  samples: number;
}

/**
 * Per-creep role statistics
 */
export interface RoleStats {
  /** Number of creeps with this role */
  count: number;
  /** Average CPU per creep */
  avgCpu: number;
  /** Peak CPU for any creep of this role */
  peakCpu: number;
  /** Total calls this tick */
  calls: number;
  /** Number of samples */
  samples: number;
}

/**
 * Per-room statistics
 */
export interface RoomStats {
  /** Room name */
  name: string;
  /** Controller level */
  rcl: number;
  /** Energy available */
  energyAvailable: number;
  /** Energy capacity */
  energyCapacity: number;
  /** Storage energy */
  storageEnergy: number;
  /** Number of creeps owned in room */
  creepCount: number;
  /** Number of hostiles in room */
  hostileCount: number;
  /** Average CPU used by room */
  avgCpu: number;
  /** Peak CPU used by room */
  peakCpu: number;
  /** Controller progress */
  controllerProgress: number;
  /** Controller progress total */
  controllerProgressTotal: number;
  /** Energy harvested (rolling average) */
  energyHarvested: number;
  /** Damage received (rolling average) */
  damageReceived: number;
  /** Danger level (0-3) */
  danger: number;
}

/**
 * Overall/empire statistics
 */
export interface EmpireStats {
  /** Total number of owned rooms */
  ownedRooms: number;
  /** Total number of creeps */
  totalCreeps: number;
  /** Total energy in storage across all rooms */
  totalStorageEnergy: number;
  /** Average GCL progress */
  gclProgress: number;
  /** GCL level */
  gcl: number;
  /** GPL level */
  gpl: number;
  /** CPU used this tick */
  cpuUsed: number;
  /** CPU limit */
  cpuLimit: number;
  /** CPU bucket */
  cpuBucket: number;
  /** Heap used (MB) */
  heapUsed: number;
  /** Total credits */
  credits: number;
  /** List of owned room names */
  rooms: string[];
}

/**
 * Pheromone statistics
 */
export interface PheromoneStats {
  /** Room name */
  room: string;
  /** Expand pheromone level */
  expand: number;
  /** Harvest pheromone level */
  harvest: number;
  /** Build pheromone level */
  build: number;
  /** Upgrade pheromone level */
  upgrade: number;
  /** Defense pheromone level */
  defense: number;
  /** War pheromone level */
  war: number;
  /** Siege pheromone level */
  siege: number;
  /** Logistics pheromone level */
  logistics: number;
  /** Dominant pheromone */
  dominant: string | null;
  /** Intent (eco, expand, defense, war, siege, evacuate) */
  intent: string;
}

/**
 * Native calls statistics (pathfinding, creep actions, etc.)
 */
export interface NativeCallsStats {
  /** PathFinder.search calls */
  pathfinderSearch: number;
  /** moveTo calls */
  moveTo: number;
  /** move calls */
  move: number;
  /** harvest calls */
  harvest: number;
  /** transfer calls */
  transfer: number;
  /** withdraw calls */
  withdraw: number;
  /** build calls */
  build: number;
  /** repair calls */
  repair: number;
  /** upgradeController calls */
  upgradeController: number;
  /** attack calls */
  attack: number;
  /** rangedAttack calls */
  rangedAttack: number;
  /** heal calls */
  heal: number;
  /** dismantle calls */
  dismantle: number;
  /** say calls */
  say: number;
  /** Total native calls */
  total: number;
}

/**
 * Root stats container
 */
export interface StatsRoot {
  /** Tick when stats were collected */
  tick: number;
  /** Per-subsystem statistics */
  subsystems: Record<string, SubsystemStats>;
  /** Per-role statistics */
  roles: Record<string, RoleStats>;
  /** Per-room statistics */
  rooms: Record<string, RoomStats>;
  /** Overall empire statistics */
  empire: EmpireStats;
  /** Pheromone statistics per room */
  pheromones: Record<string, PheromoneStats>;
  /** Native calls statistics */
  nativeCalls: NativeCallsStats;
}

// ============================================================================
// Stats Manager
// ============================================================================

/**
 * Configuration for stats system
 */
export interface StatsConfig {
  /** Whether stats collection is enabled */
  enabled: boolean;
  /** Smoothing factor for exponential moving averages (0-1) */
  smoothingFactor: number;
  /** Whether to collect native calls stats */
  trackNativeCalls: boolean;
  /** Log interval for stats summary */
  logInterval: number;
}

const DEFAULT_CONFIG: StatsConfig = {
  enabled: true,
  smoothingFactor: 0.1,
  trackNativeCalls: true,
  logInterval: 100
};

/**
 * Unified Statistics Manager
 */
export class StatsManager {
  private config: StatsConfig;
  private nativeCallsThisTick: NativeCallsStats;

  public constructor(config: Partial<StatsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.nativeCallsThisTick = this.createEmptyNativeCalls();
  }

  /**
   * Get or initialize the stats root in Memory
   */
  private getStatsRoot(): StatsRoot {
    const mem = Memory as unknown as Record<string, any>;
    if (!mem.stats || typeof mem.stats !== "object") {
      mem.stats = this.createEmptyStatsRoot();
    }
    return mem.stats as StatsRoot;
  }

  /**
   * Create empty stats root
   */
  private createEmptyStatsRoot(): StatsRoot {
    return {
      tick: Game.time,
      subsystems: {},
      roles: {},
      rooms: {},
      empire: this.createEmptyEmpireStats(),
      pheromones: {},
      nativeCalls: this.createEmptyNativeCalls()
    };
  }

  /**
   * Create empty empire stats
   */
  private createEmptyEmpireStats(): EmpireStats {
    return {
      ownedRooms: 0,
      totalCreeps: 0,
      totalStorageEnergy: 0,
      gclProgress: 0,
      gcl: 0,
      gpl: 0,
      cpuUsed: 0,
      cpuLimit: 0,
      cpuBucket: 0,
      heapUsed: 0,
      credits: 0,
      rooms: []
    };
  }

  /**
   * Create empty native calls stats
   */
  private createEmptyNativeCalls(): NativeCallsStats {
    return {
      pathfinderSearch: 0,
      moveTo: 0,
      move: 0,
      harvest: 0,
      transfer: 0,
      withdraw: 0,
      build: 0,
      repair: 0,
      upgradeController: 0,
      attack: 0,
      rangedAttack: 0,
      heal: 0,
      dismantle: 0,
      say: 0,
      total: 0
    };
  }

  /**
   * Record a subsystem measurement
   */
  public recordSubsystem(name: string, cpu: number, calls: number = 1): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    const existing = stats.subsystems[name];

    if (!existing) {
      stats.subsystems[name] = {
        avgCpu: cpu,
        peakCpu: cpu,
        calls,
        samples: 1
      };
    } else {
      existing.avgCpu = existing.avgCpu * (1 - this.config.smoothingFactor) + cpu * this.config.smoothingFactor;
      existing.peakCpu = Math.max(existing.peakCpu, cpu);
      existing.calls = calls;
      existing.samples++;
    }
  }

  /**
   * Record a role measurement
   */
  public recordRole(role: string, count: number, cpu: number, calls: number = 1): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    const existing = stats.roles[role];

    if (!existing) {
      stats.roles[role] = {
        count,
        avgCpu: cpu,
        peakCpu: cpu,
        calls,
        samples: 1
      };
    } else {
      existing.count = count;
      existing.avgCpu = existing.avgCpu * (1 - this.config.smoothingFactor) + cpu * this.config.smoothingFactor;
      existing.peakCpu = Math.max(existing.peakCpu, cpu);
      existing.calls = calls;
      existing.samples++;
    }
  }

  /**
   * Record room statistics
   */
  public recordRoom(room: Room, avgCpu: number, peakCpu: number, metrics: Partial<RoomStats> = {}): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    const creepsInRoom = Object.values(Game.creeps).filter(c => c.room.name === room.name).length;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    stats.rooms[room.name] = {
      name: room.name,
      rcl: room.controller?.level ?? 0,
      energyAvailable: room.energyAvailable,
      energyCapacity: room.energyCapacityAvailable,
      storageEnergy: room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0,
      creepCount: creepsInRoom,
      hostileCount: hostiles.length,
      avgCpu,
      peakCpu,
      controllerProgress: room.controller?.progress ?? 0,
      controllerProgressTotal: room.controller?.progressTotal ?? 1,
      energyHarvested: metrics.energyHarvested ?? 0,
      damageReceived: metrics.damageReceived ?? 0,
      danger: metrics.danger ?? 0
    };
  }

  /**
   * Record pheromone statistics
   */
  public recordPheromones(
    roomName: string,
    pheromones: {
      expand: number;
      harvest: number;
      build: number;
      upgrade: number;
      defense: number;
      war: number;
      siege: number;
      logistics: number;
    },
    intent: string,
    dominant: string | null
  ): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    stats.pheromones[roomName] = {
      room: roomName,
      expand: pheromones.expand,
      harvest: pheromones.harvest,
      build: pheromones.build,
      upgrade: pheromones.upgrade,
      defense: pheromones.defense,
      war: pheromones.war,
      siege: pheromones.siege,
      logistics: pheromones.logistics,
      dominant,
      intent
    };
  }

  /**
   * Record a native call
   */
  public recordNativeCall(type: keyof Omit<NativeCallsStats, "total">): void {
    if (!this.config.enabled || !this.config.trackNativeCalls) return;
    
    this.nativeCallsThisTick[type]++;
    this.nativeCallsThisTick.total++;
  }

  /**
   * Update empire statistics
   */
  public updateEmpireStats(): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    const totalCreeps = Object.keys(Game.creeps).length;
    const totalStorageEnergy = ownedRooms.reduce(
      (sum, r) => sum + (r.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0),
      0
    );

    stats.empire = {
      ownedRooms: ownedRooms.length,
      totalCreeps,
      totalStorageEnergy,
      gclProgress: Game.gcl.progress,
      gcl: Game.gcl.level,
      gpl: Game.gpl?.level ?? 0,
      cpuUsed: Game.cpu.getUsed(),
      cpuLimit: Game.cpu.limit,
      cpuBucket: Game.cpu.bucket,
      heapUsed: (Game.cpu.getHeapStatistics?.()?.used_heap_size ?? 0) / 1024 / 1024,
      credits: Game.market.credits,
      rooms: ownedRooms.map(r => r.name)
    };
  }

  /**
   * Finalize tick - update tick number and native calls
   */
  public finalizeTick(): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    stats.tick = Game.time;
    stats.nativeCalls = { ...this.nativeCallsThisTick };

    // Reset native calls for next tick
    this.nativeCallsThisTick = this.createEmptyNativeCalls();

    // Publish flattened stats for external consumption
    this.publishFlattenedStats();

    // Log summary periodically
    if (this.config.logInterval > 0 && Game.time % this.config.logInterval === 0) {
      this.logSummary();
    }
  }

  /**
   * Publish flattened stats for Influx exporter
   */
  private publishFlattenedStats(): void {
    const stats = this.getStatsRoot();
    const mem = Memory as unknown as Record<string, any>;

    // Publish empire stats
    mem["stats.empire.owned_rooms"] = stats.empire.ownedRooms;
    mem["stats.empire.total_creeps"] = stats.empire.totalCreeps;
    mem["stats.empire.total_storage_energy"] = stats.empire.totalStorageEnergy;
    mem["stats.empire.gcl_progress"] = stats.empire.gclProgress;
    mem["stats.empire.gcl"] = stats.empire.gcl;
    mem["stats.empire.gpl"] = stats.empire.gpl;
    mem["stats.empire.cpu_used"] = stats.empire.cpuUsed;
    mem["stats.empire.cpu_limit"] = stats.empire.cpuLimit;
    mem["stats.empire.cpu_bucket"] = stats.empire.cpuBucket;
    mem["stats.empire.heap_used"] = stats.empire.heapUsed;
    mem["stats.empire.credits"] = stats.empire.credits;

    // Publish subsystem stats
    for (const [name, data] of Object.entries(stats.subsystems)) {
      mem[`stats.subsystem.${name}.avg_cpu`] = data.avgCpu;
      mem[`stats.subsystem.${name}.peak_cpu`] = data.peakCpu;
      mem[`stats.subsystem.${name}.calls`] = data.calls;
      mem[`stats.subsystem.${name}.samples`] = data.samples;
    }

    // Publish role stats
    for (const [role, data] of Object.entries(stats.roles)) {
      mem[`stats.role.${role}.count`] = data.count;
      mem[`stats.role.${role}.avg_cpu`] = data.avgCpu;
      mem[`stats.role.${role}.peak_cpu`] = data.peakCpu;
      mem[`stats.role.${role}.calls`] = data.calls;
    }

    // Publish room stats
    for (const [roomName, data] of Object.entries(stats.rooms)) {
      mem[`stats.room.${roomName}.rcl`] = data.rcl;
      mem[`stats.room.${roomName}.energy_available`] = data.energyAvailable;
      mem[`stats.room.${roomName}.energy_capacity`] = data.energyCapacity;
      mem[`stats.room.${roomName}.storage_energy`] = data.storageEnergy;
      mem[`stats.room.${roomName}.creep_count`] = data.creepCount;
      mem[`stats.room.${roomName}.hostile_count`] = data.hostileCount;
      mem[`stats.room.${roomName}.avg_cpu`] = data.avgCpu;
      mem[`stats.room.${roomName}.peak_cpu`] = data.peakCpu;
      mem[`stats.room.${roomName}.controller_progress`] = data.controllerProgress;
      mem[`stats.room.${roomName}.energy_harvested`] = data.energyHarvested;
      mem[`stats.room.${roomName}.damage_received`] = data.damageReceived;
      mem[`stats.room.${roomName}.danger`] = data.danger;
    }

    // Intent/posture to numeric mapping for efficient storage
    const INTENT_VALUES: Record<string, number> = {
      eco: 0,
      expand: 1,
      defensive: 2,
      defense: 2, // alias
      war: 3,
      siege: 4,
      evacuate: 5,
      nukePrep: 6
    };

    // Publish pheromone stats
    for (const [roomName, data] of Object.entries(stats.pheromones)) {
      mem[`stats.pheromone.${roomName}.expand`] = data.expand;
      mem[`stats.pheromone.${roomName}.harvest`] = data.harvest;
      mem[`stats.pheromone.${roomName}.build`] = data.build;
      mem[`stats.pheromone.${roomName}.upgrade`] = data.upgrade;
      mem[`stats.pheromone.${roomName}.defense`] = data.defense;
      mem[`stats.pheromone.${roomName}.war`] = data.war;
      mem[`stats.pheromone.${roomName}.siege`] = data.siege;
      mem[`stats.pheromone.${roomName}.logistics`] = data.logistics;
      mem[`stats.pheromone.${roomName}.intent`] = INTENT_VALUES[data.intent] ?? 0;
    }

    // Publish native calls stats
    mem["stats.native_calls.pathfinder_search"] = stats.nativeCalls.pathfinderSearch;
    mem["stats.native_calls.move_to"] = stats.nativeCalls.moveTo;
    mem["stats.native_calls.move"] = stats.nativeCalls.move;
    mem["stats.native_calls.harvest"] = stats.nativeCalls.harvest;
    mem["stats.native_calls.transfer"] = stats.nativeCalls.transfer;
    mem["stats.native_calls.withdraw"] = stats.nativeCalls.withdraw;
    mem["stats.native_calls.build"] = stats.nativeCalls.build;
    mem["stats.native_calls.repair"] = stats.nativeCalls.repair;
    mem["stats.native_calls.upgrade_controller"] = stats.nativeCalls.upgradeController;
    mem["stats.native_calls.attack"] = stats.nativeCalls.attack;
    mem["stats.native_calls.ranged_attack"] = stats.nativeCalls.rangedAttack;
    mem["stats.native_calls.heal"] = stats.nativeCalls.heal;
    mem["stats.native_calls.dismantle"] = stats.nativeCalls.dismantle;
    mem["stats.native_calls.say"] = stats.nativeCalls.say;
    mem["stats.native_calls.total"] = stats.nativeCalls.total;
  }

  /**
   * Log a summary of statistics
   */
  public logSummary(): void {
    const stats = this.getStatsRoot();

    logger.info("=== Stats Summary ===");
    logger.info(`Empire: ${stats.empire.ownedRooms} rooms, ${stats.empire.totalCreeps} creeps, ${stats.empire.cpuUsed.toFixed(2)}/${stats.empire.cpuLimit} CPU`);

    // Top 5 subsystems by CPU
    const topSubsystems = Object.entries(stats.subsystems)
      .sort((a, b) => b[1].avgCpu - a[1].avgCpu)
      .slice(0, 5);
    if (topSubsystems.length > 0) {
      logger.info("Top Subsystems:");
      for (const [name, data] of topSubsystems) {
        logger.info(`  ${name}: ${data.avgCpu.toFixed(3)} CPU avg`);
      }
    }

    // Top 5 roles by CPU
    const topRoles = Object.entries(stats.roles)
      .sort((a, b) => b[1].avgCpu - a[1].avgCpu)
      .slice(0, 5);
    if (topRoles.length > 0) {
      logger.info("Top Roles:");
      for (const [role, data] of topRoles) {
        logger.info(`  ${role}: ${data.count} creeps, ${data.avgCpu.toFixed(3)} CPU avg`);
      }
    }

    // Native calls summary
    if (this.config.trackNativeCalls) {
      logger.info(`Native calls: ${stats.nativeCalls.total} total`);
    }
  }

  /**
   * Get the current stats root
   */
  public getStats(): StatsRoot {
    return this.getStatsRoot();
  }

  /**
   * Reset all statistics
   */
  public reset(): void {
    const mem = Memory as unknown as Record<string, any>;
    mem.stats = this.createEmptyStatsRoot();
  }

  /**
   * Enable/disable stats collection
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if stats collection is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }
}

/**
 * Global stats manager instance
 */
export const statsManager = new StatsManager();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get list of owned room names
 */
export function getOwnedRoomNames(): string[] {
  return Object.values(Game.rooms)
    .filter(r => r.controller?.my)
    .map(r => r.name);
}

/**
 * Get total creep count
 */
export function getTotalCreepCount(): number {
  return Object.keys(Game.creeps).length;
}

/**
 * Get creep count by role
 */
export function getCreepCountByRole(role: string): number {
  return Object.values(Game.creeps).filter(c => {
    const memory = c.memory as unknown as { role: string };
    return memory.role === role;
  }).length;
}

/**
 * Get total storage energy across all owned rooms
 */
export function getTotalStorageEnergy(): number {
  return Object.values(Game.rooms)
    .filter(r => r.controller?.my)
    .reduce((sum, r) => sum + (r.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0), 0);
}

/**
 * Get average RCL across owned rooms
 */
export function getAverageRCL(): number {
  const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
  if (ownedRooms.length === 0) return 0;
  
  const totalRCL = ownedRooms.reduce((sum, r) => sum + (r.controller?.level ?? 0), 0);
  return totalRCL / ownedRooms.length;
}

/**
 * Get room with highest/lowest metric
 */
export function getRoomByMetric(
  metric: "energy" | "rcl" | "creeps" | "cpu",
  order: "highest" | "lowest" = "highest"
): string | null {
  const stats = statsManager.getStats();
  const rooms = Object.values(stats.rooms);
  
  if (rooms.length === 0) return null;
  
  const sorted = rooms.sort((a, b) => {
    let valueA = 0, valueB = 0;
    
    switch (metric) {
      case "energy":
        valueA = a.storageEnergy;
        valueB = b.storageEnergy;
        break;
      case "rcl":
        valueA = a.rcl;
        valueB = b.rcl;
        break;
      case "creeps":
        valueA = a.creepCount;
        valueB = b.creepCount;
        break;
      case "cpu":
        valueA = a.avgCpu;
        valueB = b.avgCpu;
        break;
    }
    
    return order === "highest" ? valueB - valueA : valueA - valueB;
  });
  
  return sorted[0]?.name ?? null;
}
