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
 * All stats are stored as a clean object structure in Memory.stats.
 * No flattening or processing is done here - the Influx exporter
 * handles all processing and formatting for Grafana dashboards.
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
 * Per-creep role statistics (enhanced)
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
  /** Number of spawning creeps */
  spawningCount: number;
  /** Number of idle creeps */
  idleCount: number;
  /** Number of active/working creeps */
  activeCount: number;
  /** Average ticks to live */
  avgTicksToLive: number;
  /** Total body parts across all creeps of this role */
  totalBodyParts: number;
}

/**
 * Per-creep statistics
 */
export interface CreepStats {
  /** Creep name */
  name: string;
  /** Creep role */
  role: string;
  /** Home room */
  homeRoom: string;
  /** Current room */
  currentRoom: string;
  /** CPU used this tick */
  cpu: number;
  /** Current action/state */
  action: string;
  /** Ticks to live */
  ticksToLive: number;
  /** Current hits */
  hits: number;
  /** Max hits */
  hitsMax: number;
  /** Number of body parts */
  bodyParts: number;
  /** Fatigue level */
  fatigue: number;
  /** Actions performed this tick */
  actionsThisTick: number;
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
  /** Total resources in storage and terminal (all resource types) */
  resources: Partial<Record<ResourceConstant, number>>;
  /** Dropped energy on the ground */
  droppedEnergy: number;
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
 * Kernel process statistics
 */
export interface KernelProcessStats {
  /** Process ID */
  id: string;
  /** Process name */
  name: string;
  /** Process priority */
  priority: number;
  /** Process frequency */
  frequency: string;
  /** Process state */
  state: string;
  /** Total CPU used across all runs */
  totalCpu: number;
  /** Number of times process has run */
  runCount: number;
  /** Average CPU per run */
  avgCpu: number;
  /** Maximum CPU used in a single run */
  maxCpu: number;
  /** Last run tick */
  lastRunTick: number;
  /** Number of times process was skipped */
  skippedCount: number;
  /** Number of errors */
  errorCount: number;
  /** CPU budget */
  cpuBudget: number;
  /** Minimum bucket to run */
  minBucket: number;
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
  /** Per-creep statistics */
  creeps: Record<string, CreepStats>;
  /** Overall empire statistics */
  empire: EmpireStats;
  /** Pheromone statistics per room */
  pheromones: Record<string, PheromoneStats>;
  /** Native calls statistics */
  nativeCalls: NativeCallsStats;
  /** Kernel process statistics */
  processes: Record<string, KernelProcessStats>;
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
    
    // Ensure all required properties exist, even if Memory.stats was corrupted
    const stats = mem.stats;
    if (!stats.subsystems || typeof stats.subsystems !== "object") {
      stats.subsystems = {};
    }
    if (!stats.roles || typeof stats.roles !== "object") {
      stats.roles = {};
    }
    if (!stats.rooms || typeof stats.rooms !== "object") {
      stats.rooms = {};
    }
    if (!stats.creeps || typeof stats.creeps !== "object") {
      stats.creeps = {};
    }
    if (!stats.pheromones || typeof stats.pheromones !== "object") {
      stats.pheromones = {};
    }
    if (!stats.empire || typeof stats.empire !== "object") {
      stats.empire = this.createEmptyEmpireStats();
    }
    if (!stats.nativeCalls || typeof stats.nativeCalls !== "object") {
      stats.nativeCalls = this.createEmptyNativeCalls();
    }
    if (!stats.processes || typeof stats.processes !== "object") {
      stats.processes = {};
    }
    
    return stats as StatsRoot;
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
      creeps: {},
      empire: this.createEmptyEmpireStats(),
      pheromones: {},
      nativeCalls: this.createEmptyNativeCalls(),
      processes: {}
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
  public recordSubsystem(name: string, cpu: number, calls = 1): void {
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
   * Record a role measurement (enhanced with additional metrics)
   */
  public recordRole(
    role: string, 
    count: number, 
    cpu: number, 
    calls = 1,
    metrics?: {
      spawningCount?: number;
      idleCount?: number;
      activeCount?: number;
      avgTicksToLive?: number;
      totalBodyParts?: number;
    }
  ): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    const existing = stats.roles[role];

    if (!existing) {
      stats.roles[role] = {
        count,
        avgCpu: cpu,
        peakCpu: cpu,
        calls,
        samples: 1,
        spawningCount: metrics?.spawningCount ?? 0,
        idleCount: metrics?.idleCount ?? 0,
        activeCount: metrics?.activeCount ?? count,
        avgTicksToLive: metrics?.avgTicksToLive ?? 0,
        totalBodyParts: metrics?.totalBodyParts ?? 0
      };
    } else {
      existing.count = count;
      existing.avgCpu = existing.avgCpu * (1 - this.config.smoothingFactor) + cpu * this.config.smoothingFactor;
      existing.peakCpu = Math.max(existing.peakCpu, cpu);
      existing.calls = calls;
      existing.samples++;
      existing.spawningCount = metrics?.spawningCount ?? 0;
      existing.idleCount = metrics?.idleCount ?? 0;
      existing.activeCount = metrics?.activeCount ?? count;
      existing.avgTicksToLive = metrics?.avgTicksToLive ?? 0;
      existing.totalBodyParts = metrics?.totalBodyParts ?? 0;
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

    // Collect all resources from storage and terminal
    const resources: Partial<Record<ResourceConstant, number>> = {};
    
    // Helper function to add resources from a store
    const addStoreResources = (store: StoreDefinition) => {
      for (const resourceType in store) {
        if (store[resourceType as ResourceConstant] > 0) {
          const resource = resourceType as ResourceConstant;
          resources[resource] = (resources[resource] ?? 0) + store[resource];
        }
      }
    };
    
    if (room.storage) {
      addStoreResources(room.storage.store);
    }
    if (room.terminal) {
      addStoreResources(room.terminal.store);
    }

    // Find dropped energy on the ground
    const droppedResources = room.find(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY
    });
    const droppedEnergy = droppedResources.reduce((sum, r) => sum + r.amount, 0);

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
      danger: metrics.danger ?? 0,
      resources,
      droppedEnergy
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
   * Record individual creep statistics
   */
  public recordCreep(creep: Creep, cpu: number, action: string, actionsCount = 0): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    const creepMemory = creep.memory as unknown as { role?: string; homeRoom?: string };
    
    stats.creeps[creep.name] = {
      name: creep.name,
      role: creepMemory.role ?? "unknown",
      homeRoom: creepMemory.homeRoom ?? creep.room.name,
      currentRoom: creep.room.name,
      cpu,
      action,
      ticksToLive: creep.ticksToLive ?? 0,
      hits: creep.hits,
      hitsMax: creep.hitsMax,
      bodyParts: creep.body.length,
      fatigue: creep.fatigue,
      actionsThisTick: actionsCount
    };
  }

  /**
   * Record kernel process statistics from a process object
   */
  public recordProcess(process: {
    id: string;
    name: string;
    priority: number;
    frequency: string;
    state: string;
    cpuBudget: number;
    minBucket: number;
    stats: {
      totalCpu: number;
      runCount: number;
      avgCpu: number;
      maxCpu: number;
      lastRunTick: number;
      skippedCount: number;
      errorCount: number;
    };
  }): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    stats.processes[process.id] = {
      id: process.id,
      name: process.name,
      priority: process.priority,
      frequency: process.frequency,
      state: process.state,
      totalCpu: process.stats.totalCpu,
      runCount: process.stats.runCount,
      avgCpu: process.stats.avgCpu,
      maxCpu: process.stats.maxCpu,
      lastRunTick: process.stats.lastRunTick,
      skippedCount: process.stats.skippedCount,
      errorCount: process.stats.errorCount,
      cpuBudget: process.cpuBudget,
      minBucket: process.minBucket
    };
  }

  /**
   * Collect all kernel process statistics (call this from kernel after tick execution)
   */
  public collectProcessStats(processes: Map<string, any>): void {
    if (!this.config.enabled) return;

    processes.forEach((process) => {
      this.recordProcess(process);
    });
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
   * Finalize tick - update tick number, native calls, collect creep stats and enhanced role stats
   */
  public finalizeTick(): void {
    if (!this.config.enabled) return;

    const stats = this.getStatsRoot();
    stats.tick = Game.time;
    stats.nativeCalls = { ...this.nativeCallsThisTick };

    // Collect all creep stats and calculate enhanced role stats
    stats.creeps = {};
    const roleMetrics: Record<string, {
      count: number;
      spawning: number;
      idle: number;
      active: number;
      totalTTL: number;
      totalBodyParts: number;
    }> = {};

    for (const creep of Object.values(Game.creeps)) {
      const creepMemory = creep.memory as unknown as { role?: string; homeRoom?: string; state?: { action?: string }; working?: boolean };
      const role = creepMemory.role ?? "unknown";
      const action = creepMemory.state?.action ?? "idle";
      const isWorking = creepMemory.working ?? (action !== "idle");
      
      // Record individual creep stats if not already recorded this tick
      if (!stats.creeps[creep.name]) {
        stats.creeps[creep.name] = {
          name: creep.name,
          role,
          homeRoom: creepMemory.homeRoom ?? creep.room.name,
          currentRoom: creep.room.name,
          cpu: 0, // Will be filled in by creep runner if tracking
          action,
          ticksToLive: creep.ticksToLive ?? 0,
          hits: creep.hits,
          hitsMax: creep.hitsMax,
          bodyParts: creep.body.length,
          fatigue: creep.fatigue,
          actionsThisTick: 0
        };
      }

      // Aggregate role metrics
      if (!roleMetrics[role]) {
        roleMetrics[role] = { count: 0, spawning: 0, idle: 0, active: 0, totalTTL: 0, totalBodyParts: 0 };
      }
      roleMetrics[role].count++;
      roleMetrics[role].totalBodyParts += creep.body.length;
      roleMetrics[role].totalTTL += creep.ticksToLive ?? 0;
      
      if (creep.spawning) {
        roleMetrics[role].spawning++;
      } else if (!isWorking || action === "idle") {
        roleMetrics[role].idle++;
      } else {
        roleMetrics[role].active++;
      }
    }

    // Update role stats with enhanced metrics
    for (const [role, metrics] of Object.entries(roleMetrics)) {
      const existing = stats.roles[role];
      if (existing) {
        existing.count = metrics.count;
        existing.spawningCount = metrics.spawning;
        existing.idleCount = metrics.idle;
        existing.activeCount = metrics.active;
        existing.avgTicksToLive = metrics.count > 0 ? metrics.totalTTL / metrics.count : 0;
        existing.totalBodyParts = metrics.totalBodyParts;
      } else {
        // Create new role stat if it doesn't exist
        stats.roles[role] = {
          count: metrics.count,
          avgCpu: 0,
          peakCpu: 0,
          calls: 0,
          samples: 0,
          spawningCount: metrics.spawning,
          idleCount: metrics.idle,
          activeCount: metrics.active,
          avgTicksToLive: metrics.count > 0 ? metrics.totalTTL / metrics.count : 0,
          totalBodyParts: metrics.totalBodyParts
        };
      }
    }

    // Reset native calls for next tick
    this.nativeCallsThisTick = this.createEmptyNativeCalls();

    // Log summary periodically
    if (this.config.logInterval > 0 && Game.time % this.config.logInterval === 0) {
      this.logSummary();
    }
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
    let valueA = 0;
    let valueB = 0;
    
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
