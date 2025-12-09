/**
 * Unified Statistics System
 *
 * Consolidates all bot statistics collection into a single cohesive system:
 * - CPU profiling (formerly profiler.ts)
 * - Performance metrics (formerly stats.ts)
 * - Room/swarm metrics (from SwarmState)
 * - Empire-wide aggregations
 * - Memory segment persistence
 *
 * All stats are exported with proper category prefixes for InfluxDB/Grafana:
 * - stats.cpu.*        - CPU usage metrics
 * - stats.gcl.*        - GCL progression
 * - stats.gpl.*        - GPL progression
 * - stats.empire.*     - Empire-wide aggregations
 * - stats.room.*       - Per-room metrics
 * - stats.profiler.*   - CPU profiling data
 * - stats.role.*       - Per-role performance
 * - stats.subsystem.*  - Per-subsystem performance
 * - stats.native.*     - Native API call tracking
 * - stats.system.*     - System/tick information
 */

import { logger } from "./logger";
import { memoryManager } from "../memory/manager";
import { EvolutionStage, PheromoneState, RoomPosture } from "../memory/schemas";

// ============================================================================
// Configuration
// ============================================================================

export interface UnifiedStatsConfig {
  /** Whether stats collection is enabled */
  enabled: boolean;
  /** Smoothing factor for exponential moving averages (0-1) */
  smoothingFactor: number;
  /** Whether to track native API calls */
  trackNativeCalls: boolean;
  /** Log summary interval in ticks (0 = never) */
  logInterval: number;
  /** Update interval for memory segment persistence (in ticks) */
  segmentUpdateInterval: number;
  /** Memory segment ID for stats storage */
  segmentId: number;
  /** Maximum data points to keep in segment history */
  maxHistoryPoints: number;
}

const DEFAULT_CONFIG: UnifiedStatsConfig = {
  enabled: true,
  smoothingFactor: 0.1,
  trackNativeCalls: true,
  logInterval: 100,
  segmentUpdateInterval: 10,
  segmentId: 90,
  maxHistoryPoints: 1000
};

// ============================================================================
// Stats Data Structures
// ============================================================================

/**
 * CPU usage statistics
 */
export interface CpuStats {
  used: number;
  limit: number;
  bucket: number;
  percent: number;
  heapUsed: number;
}

/**
 * GCL/GPL progression stats
 */
export interface ProgressionStats {
  gcl: {
    level: number;
    progress: number;
    progressTotal: number;
    progressPercent: number;
  };
  gpl: {
    level: number;
  };
}

/**
 * Empire-wide aggregated stats
 */
export interface EmpireStats {
  rooms: number;
  creeps: number;
  energy: {
    storage: number;
    terminal: number;
    available: number;
    capacity: number;
  };
  credits: number;
}

/**
 * Per-room statistics
 */
export interface RoomStatsEntry {
  // Basic info
  name: string;
  rcl: number;
  
  // Energy
  energy: {
    available: number;
    capacity: number;
    storage: number;
    terminal: number;
  };
  
  // Controller
  controller: {
    progress: number;
    progressTotal: number;
    progressPercent: number;
  };
  
  // Population
  creeps: number;
  hostiles: number;
  
  // Brain state
  brain: {
    danger: number;
    postureCode: number;
    colonyLevelCode: number;
  };
  
  // Pheromones
  pheromones: Record<string, number>;
  
  // Room metrics
  metrics: {
    energyHarvested: number;
    energySpawning: number;
    energyConstruction: number;
    energyRepair: number;
    energyTower: number;
    energyAvailableForSharing: number;
    energyCapacityTotal: number;
    energyNeed: number;
    controllerProgress: number;
    hostileCount: number;
    damageReceived: number;
    constructionSites: number;
  };
  
  // CPU profiling
  profiler: {
    avgCpu: number;
    peakCpu: number;
    samples: number;
  };
}

/**
 * Per-subsystem profiling stats
 */
export interface SubsystemStatsEntry {
  name: string;
  avgCpu: number;
  peakCpu: number;
  calls: number;
  samples: number;
}

/**
 * Per-role profiling stats
 */
export interface RoleStatsEntry {
  name: string;
  count: number;
  avgCpu: number;
  peakCpu: number;
  calls: number;
  samples: number;
}

/**
 * Native API call tracking
 */
export interface NativeCallStats {
  pathfinderSearch: number;
  moveTo: number;
  move: number;
  harvest: number;
  transfer: number;
  withdraw: number;
  build: number;
  repair: number;
  upgradeController: number;
  attack: number;
  rangedAttack: number;
  heal: number;
  dismantle: number;
  say: number;
  total: number;
}

/**
 * Complete stats snapshot for a single tick
 */
export interface StatsSnapshot {
  tick: number;
  timestamp: number;
  cpu: CpuStats;
  progression: ProgressionStats;
  empire: EmpireStats;
  rooms: Record<string, RoomStatsEntry>;
  subsystems: Record<string, SubsystemStatsEntry>;
  roles: Record<string, RoleStatsEntry>;
  native: NativeCallStats;
}

/**
 * Profiler memory structure for EMA tracking across ticks
 */
interface ProfilerMemory {
  rooms: Record<string, { avgCpu: number; peakCpu: number; samples: number; lastTick: number }>;
  subsystems: Record<string, { avgCpu: number; peakCpu: number; samples: number; callsThisTick: number }>;
  roles?: Record<string, { avgCpu: number; peakCpu: number; samples: number; callsThisTick: number }>;
  tickCount: number;
  lastUpdate: number;
}

// ============================================================================
// Unified Stats Manager
// ============================================================================

export class UnifiedStatsManager {
  private config: UnifiedStatsConfig;
  private currentSnapshot: StatsSnapshot;
  private nativeCallsThisTick: NativeCallStats;
  private subsystemMeasurements: Map<string, number[]> = new Map();
  private roomMeasurements: Map<string, number> = new Map();
  private lastSegmentUpdate = 0;
  private segmentRequested = false;

  public constructor(config: Partial<UnifiedStatsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentSnapshot = this.createEmptySnapshot();
    this.nativeCallsThisTick = this.createEmptyNativeCalls();
  }

  /**
   * Initialize stats system (call once at bot startup)
   */
  public initialize(): void {
    // Request memory segment for historical data
    RawMemory.setActiveSegments([this.config.segmentId]);
    this.segmentRequested = true;
    logger.info("Unified stats system initialized", { subsystem: "Stats" });
  }

  /**
   * Start of tick - reset transient data
   */
  public startTick(): void {
    if (!this.config.enabled) return;
    
    this.currentSnapshot = this.createEmptySnapshot();
    this.nativeCallsThisTick = this.createEmptyNativeCalls();
    this.subsystemMeasurements.clear();
    this.roomMeasurements.clear();
  }

  /**
   * End of tick - finalize and publish stats
   */
  public finalizeTick(): void {
    if (!this.config.enabled) return;

    // Finalize CPU stats
    this.currentSnapshot.cpu = {
      used: Game.cpu.getUsed(),
      limit: Game.cpu.limit,
      bucket: Game.cpu.bucket,
      percent: Game.cpu.limit > 0 ? (Game.cpu.getUsed() / Game.cpu.limit) * 100 : 0,
      heapUsed: (Game.cpu.getHeapStatistics?.()?.used_heap_size ?? 0) / 1024 / 1024
    };

    // Finalize progression stats
    this.currentSnapshot.progression = {
      gcl: {
        level: Game.gcl.level,
        progress: Game.gcl.progress,
        progressTotal: Game.gcl.progressTotal,
        progressPercent: Game.gcl.progressTotal > 0 ? (Game.gcl.progress / Game.gcl.progressTotal) * 100 : 0
      },
      gpl: {
        level: Game.gpl?.level ?? 0
      }
    };

    // Finalize empire stats
    this.finalizeEmpireStats();

    // Finalize subsystem stats
    this.finalizeSubsystemStats();

    // Finalize native calls
    this.currentSnapshot.native = { ...this.nativeCallsThisTick };

    // Finalize tick info
    this.currentSnapshot.tick = Game.time;
    this.currentSnapshot.timestamp = Date.now();

    // Publish to Memory.stats in InfluxDB-friendly format
    this.publishToMemory();

    // Update memory segment periodically
    if (Game.time - this.lastSegmentUpdate >= this.config.segmentUpdateInterval) {
      this.updateSegment();
      this.lastSegmentUpdate = Game.time;
    }

    // Log summary periodically
    if (this.config.logInterval > 0 && Game.time % this.config.logInterval === 0) {
      this.logSummary();
    }
  }

  // ============================================================================
  // Recording Methods
  // ============================================================================

  /**
   * Start measuring a room's execution
   */
  public startRoom(_roomName: string): number {
    if (!this.config.enabled) return 0;
    return Game.cpu.getUsed();
  }

  /**
   * End measuring a room's execution
   */
  public endRoom(roomName: string, startCpu: number): void {
    if (!this.config.enabled) return;
    
    const cpuUsed = Game.cpu.getUsed() - startCpu;
    this.roomMeasurements.set(roomName, cpuUsed);
  }

  /**
   * Measure a subsystem execution
   */
  public measureSubsystem<T>(name: string, fn: () => T): T {
    if (!this.config.enabled) {
      return fn();
    }

    const startCpu = Game.cpu.getUsed();
    const result = fn();
    const cpuUsed = Game.cpu.getUsed() - startCpu;

    const existing = this.subsystemMeasurements.get(name) ?? [];
    existing.push(cpuUsed);
    this.subsystemMeasurements.set(name, existing);

    return result;
  }

  /**
   * Record a native API call
   */
  public recordNativeCall(type: keyof Omit<NativeCallStats, "total">): void {
    if (!this.config.enabled || !this.config.trackNativeCalls) return;
    
    this.nativeCallsThisTick[type]++;
    this.nativeCallsThisTick.total++;
  }

  /**
   * Record room statistics (call at end of room processing)
   */
  public recordRoom(room: Room, cpuUsed: number): void {
    if (!this.config.enabled) return;

    const swarm = memoryManager.getSwarmState(room.name);
    const creepsInRoom = Object.values(Game.creeps).filter(c => c.room.name === room.name).length;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    // Get or create room stats entry
    let roomStats = this.currentSnapshot.rooms[room.name];
    if (!roomStats) {
      roomStats = {
        name: room.name,
        rcl: room.controller?.level ?? 0,
        energy: {
          available: room.energyAvailable,
          capacity: room.energyCapacityAvailable,
          storage: room.storage?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0,
          terminal: room.terminal?.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0
        },
        controller: {
          progress: room.controller?.progress ?? 0,
          progressTotal: room.controller?.progressTotal ?? 1,
          progressPercent: 0
        },
        creeps: creepsInRoom,
        hostiles: hostiles.length,
        brain: {
          danger: swarm?.danger ?? 0,
          postureCode: this.postureToCode(swarm?.posture ?? "eco"),
          colonyLevelCode: this.colonyLevelToCode(swarm?.colonyLevel ?? "seedNest")
        },
        pheromones: {},
        metrics: {
          energyHarvested: 0,
          energySpawning: 0,
          energyConstruction: 0,
          energyRepair: 0,
          energyTower: 0,
          energyAvailableForSharing: 0,
          energyCapacityTotal: 0,
          energyNeed: 0,
          controllerProgress: 0,
          hostileCount: hostiles.length,
          damageReceived: 0,
          constructionSites: 0
        },
        profiler: {
          avgCpu: cpuUsed,
          peakCpu: cpuUsed,
          samples: 1
        }
      } as RoomStatsEntry;

      this.currentSnapshot.rooms[room.name] = roomStats;
    }

    // Update controller progress percent
    roomStats.controller.progressPercent = roomStats.controller.progressTotal > 0
      ? (roomStats.controller.progress / roomStats.controller.progressTotal) * 100
      : 0;

    // Update swarm metrics if available
    if (swarm) {
      // Pheromones
      for (const [pheromone, value] of Object.entries(swarm.pheromones)) {
        roomStats.pheromones[pheromone] = value;
      }

      // Metrics
      roomStats.metrics = {
        energyHarvested: swarm.metrics.energyHarvested,
        energySpawning: swarm.metrics.energySpawning,
        energyConstruction: swarm.metrics.energyConstruction,
        energyRepair: swarm.metrics.energyRepair,
        energyTower: swarm.metrics.energyTower,
        energyAvailableForSharing: swarm.metrics.energyAvailable,
        energyCapacityTotal: swarm.metrics.energyCapacity,
        energyNeed: swarm.metrics.energyNeed,
        controllerProgress: swarm.metrics.controllerProgress,
        hostileCount: swarm.metrics.hostileCount,
        damageReceived: swarm.metrics.damageReceived,
        constructionSites: swarm.metrics.constructionSites
      };
    }

    // Update profiler data with EMA
    const existingRoom = this.getProfilerMemory().rooms[room.name];
    if (existingRoom) {
      roomStats.profiler.avgCpu = existingRoom.avgCpu * (1 - this.config.smoothingFactor) 
        + cpuUsed * this.config.smoothingFactor;
      roomStats.profiler.peakCpu = Math.max(existingRoom.peakCpu, cpuUsed);
      roomStats.profiler.samples = existingRoom.samples + 1;
    }

    // Store back to profiler memory for next tick
    this.getProfilerMemory().rooms[room.name] = {
      avgCpu: roomStats.profiler.avgCpu,
      peakCpu: roomStats.profiler.peakCpu,
      samples: roomStats.profiler.samples,
      lastTick: Game.time
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private createEmptySnapshot(): StatsSnapshot {
    return {
      tick: Game.time,
      timestamp: Date.now(),
      cpu: {
        used: 0,
        limit: 0,
        bucket: 0,
        percent: 0,
        heapUsed: 0
      },
      progression: {
        gcl: {
          level: 0,
          progress: 0,
          progressTotal: 1,
          progressPercent: 0
        },
        gpl: {
          level: 0
        }
      },
      empire: {
        rooms: 0,
        creeps: 0,
        energy: {
          storage: 0,
          terminal: 0,
          available: 0,
          capacity: 0
        },
        credits: 0
      },
      rooms: {},
      subsystems: {},
      roles: {},
      native: this.createEmptyNativeCalls()
    };
  }

  private createEmptyNativeCalls(): NativeCallStats {
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

  private finalizeEmpireStats(): void {
    const ownedRooms = Object.values(this.currentSnapshot.rooms);
    const totalCreeps = Object.keys(Game.creeps).length;

    this.currentSnapshot.empire = {
      rooms: ownedRooms.length,
      creeps: totalCreeps,
      energy: {
        storage: ownedRooms.reduce((sum, r) => sum + r.energy.storage, 0),
        terminal: ownedRooms.reduce((sum, r) => sum + r.energy.terminal, 0),
        available: ownedRooms.reduce((sum, r) => sum + r.energy.available, 0),
        capacity: ownedRooms.reduce((sum, r) => sum + r.energy.capacity, 0)
      },
      credits: Game.market.credits
    };
  }

  private finalizeSubsystemStats(): void {
    const profilerMem = this.getProfilerMemory();

    // Process subsystem measurements
    for (const [name, measurements] of this.subsystemMeasurements) {
      const totalCpu = measurements.reduce((sum, m) => sum + m, 0);
      const isRole = name.startsWith("role:");
      const cleanName = isRole ? name.substring(5) : name;

      if (isRole) {
        // Role stats
        const roleCount = Object.values(Game.creeps).filter(c => {
          const mem = c.memory as unknown as { role: string };
          return mem.role === cleanName;
        }).length;

        const existing = profilerMem.roles?.[cleanName];
        const avgCpu = existing
          ? existing.avgCpu * (1 - this.config.smoothingFactor) + totalCpu * this.config.smoothingFactor
          : totalCpu;
        const peakCpu = existing ? Math.max(existing.peakCpu, totalCpu) : totalCpu;

        this.currentSnapshot.roles[cleanName] = {
          name: cleanName,
          count: roleCount,
          avgCpu,
          peakCpu,
          calls: measurements.length,
          samples: (existing?.samples ?? 0) + 1
        };

        // Update profiler memory
        if (!profilerMem.roles) profilerMem.roles = {};
        profilerMem.roles[cleanName] = {
          avgCpu,
          peakCpu,
          samples: this.currentSnapshot.roles[cleanName].samples,
          callsThisTick: measurements.length
        };
      } else {
        // Subsystem stats
        const existing = profilerMem.subsystems[cleanName];
        const avgCpu = existing
          ? existing.avgCpu * (1 - this.config.smoothingFactor) + totalCpu * this.config.smoothingFactor
          : totalCpu;
        const peakCpu = existing ? Math.max(existing.peakCpu, totalCpu) : totalCpu;

        this.currentSnapshot.subsystems[cleanName] = {
          name: cleanName,
          avgCpu,
          peakCpu,
          calls: measurements.length,
          samples: (existing?.samples ?? 0) + 1
        };

        // Update profiler memory
        profilerMem.subsystems[cleanName] = {
          avgCpu,
          peakCpu,
          samples: this.currentSnapshot.subsystems[cleanName].samples,
          callsThisTick: measurements.length
        };
      }
    }
  }

  /**
   * Publish stats to Memory.stats in InfluxDB-friendly flat format
   */
  private publishToMemory(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem = Memory as unknown as Record<string, Record<string, number>>;
    mem.stats = {} as Record<string, number>;
    const stats = mem.stats;

    const snap = this.currentSnapshot;

    // CPU stats
    stats["stats.cpu.used"] = snap.cpu.used;
    stats["stats.cpu.limit"] = snap.cpu.limit;
    stats["stats.cpu.bucket"] = snap.cpu.bucket;
    stats["stats.cpu.percent"] = snap.cpu.percent;
    stats["stats.cpu.heap_mb"] = snap.cpu.heapUsed;

    // Progression stats
    stats["stats.gcl.level"] = snap.progression.gcl.level;
    stats["stats.gcl.progress"] = snap.progression.gcl.progress;
    stats["stats.gcl.progress_total"] = snap.progression.gcl.progressTotal;
    stats["stats.gcl.progress_percent"] = snap.progression.gcl.progressPercent;
    stats["stats.gpl.level"] = snap.progression.gpl.level;

    // Empire stats
    stats["stats.empire.rooms"] = snap.empire.rooms;
    stats["stats.empire.creeps"] = snap.empire.creeps;
    stats["stats.empire.energy.storage"] = snap.empire.energy.storage;
    stats["stats.empire.energy.terminal"] = snap.empire.energy.terminal;
    stats["stats.empire.energy.available"] = snap.empire.energy.available;
    stats["stats.empire.energy.capacity"] = snap.empire.energy.capacity;
    stats["stats.empire.credits"] = snap.empire.credits;

    // Room stats
    for (const [roomName, room] of Object.entries(snap.rooms)) {
      const prefix = `stats.room.${roomName}`;
      
      stats[`${prefix}.rcl`] = room.rcl;
      stats[`${prefix}.energy.available`] = room.energy.available;
      stats[`${prefix}.energy.capacity`] = room.energy.capacity;
      stats[`${prefix}.energy.storage`] = room.energy.storage;
      stats[`${prefix}.energy.terminal`] = room.energy.terminal;
      stats[`${prefix}.controller.progress`] = room.controller.progress;
      stats[`${prefix}.controller.progress_total`] = room.controller.progressTotal;
      stats[`${prefix}.controller.progress_percent`] = room.controller.progressPercent;
      stats[`${prefix}.creeps`] = room.creeps;
      stats[`${prefix}.hostiles`] = room.hostiles;
      
      stats[`${prefix}.brain.danger`] = room.brain.danger;
      stats[`${prefix}.brain.posture_code`] = room.brain.postureCode;
      stats[`${prefix}.brain.colony_level_code`] = room.brain.colonyLevelCode;
      
      for (const [pheromone, value] of Object.entries(room.pheromones)) {
        stats[`${prefix}.pheromone.${pheromone}`] = value;
      }
      
      stats[`${prefix}.metrics.energy.harvested`] = room.metrics.energyHarvested;
      stats[`${prefix}.metrics.energy.spawning`] = room.metrics.energySpawning;
      stats[`${prefix}.metrics.energy.construction`] = room.metrics.energyConstruction;
      stats[`${prefix}.metrics.energy.repair`] = room.metrics.energyRepair;
      stats[`${prefix}.metrics.energy.tower`] = room.metrics.energyTower;
      stats[`${prefix}.metrics.energy.available_for_sharing`] = room.metrics.energyAvailableForSharing;
      stats[`${prefix}.metrics.energy.capacity_total`] = room.metrics.energyCapacityTotal;
      stats[`${prefix}.metrics.energy.need`] = room.metrics.energyNeed;
      stats[`${prefix}.metrics.controller_progress`] = room.metrics.controllerProgress;
      stats[`${prefix}.metrics.hostile_count`] = room.metrics.hostileCount;
      stats[`${prefix}.metrics.damage_received`] = room.metrics.damageReceived;
      stats[`${prefix}.metrics.construction_sites`] = room.metrics.constructionSites;
      
      stats[`${prefix}.profiler.avg_cpu`] = room.profiler.avgCpu;
      stats[`${prefix}.profiler.peak_cpu`] = room.profiler.peakCpu;
      stats[`${prefix}.profiler.samples`] = room.profiler.samples;
    }

    // Subsystem stats
    for (const [name, subsys] of Object.entries(snap.subsystems)) {
      const prefix = `stats.profiler.subsystem.${name}`;
      stats[`${prefix}.avg_cpu`] = subsys.avgCpu;
      stats[`${prefix}.peak_cpu`] = subsys.peakCpu;
      stats[`${prefix}.calls`] = subsys.calls;
      stats[`${prefix}.samples`] = subsys.samples;
    }

    // Role stats
    for (const [name, role] of Object.entries(snap.roles)) {
      const prefix = `stats.profiler.role.${name}`;
      stats[`${prefix}.count`] = role.count;
      stats[`${prefix}.avg_cpu`] = role.avgCpu;
      stats[`${prefix}.peak_cpu`] = role.peakCpu;
      stats[`${prefix}.calls`] = role.calls;
      stats[`${prefix}.samples`] = role.samples;
    }

    // Native calls
    stats["stats.native.pathfinder_search"] = snap.native.pathfinderSearch;
    stats["stats.native.move_to"] = snap.native.moveTo;
    stats["stats.native.move"] = snap.native.move;
    stats["stats.native.harvest"] = snap.native.harvest;
    stats["stats.native.transfer"] = snap.native.transfer;
    stats["stats.native.withdraw"] = snap.native.withdraw;
    stats["stats.native.build"] = snap.native.build;
    stats["stats.native.repair"] = snap.native.repair;
    stats["stats.native.upgrade_controller"] = snap.native.upgradeController;
    stats["stats.native.attack"] = snap.native.attack;
    stats["stats.native.ranged_attack"] = snap.native.rangedAttack;
    stats["stats.native.heal"] = snap.native.heal;
    stats["stats.native.dismantle"] = snap.native.dismantle;
    stats["stats.native.say"] = snap.native.say;
    stats["stats.native.total"] = snap.native.total;

    // System info
    stats["stats.system.tick"] = snap.tick;
    stats["stats.system.timestamp"] = snap.timestamp;
  }

  /**
   * Update memory segment with historical data
   */
  private updateSegment(): void {
    // TODO: Implement segment persistence if needed
    // For now, Memory.stats is sufficient for the influx exporter
  }

  /**
   * Get profiler memory (for EMA tracking across ticks)
   */
  private getProfilerMemory(): ProfilerMemory {
    const mem = Memory as unknown as Record<string, any>;
    if (!mem.stats || typeof mem.stats !== "object") {
      mem.stats = {};
    }
    if (!mem.stats.profiler) {
      mem.stats.profiler = {
        rooms: {},
        subsystems: {},
        roles: {},
        tickCount: 0,
        lastUpdate: 0
      };
    }
    return mem.stats.profiler;
  }

  /**
   * Log summary of stats
   */
  private logSummary(): void {
    const snap = this.currentSnapshot;

    logger.info("=== Unified Stats Summary ===");
    logger.info(
      `CPU: ${snap.cpu.used.toFixed(2)}/${snap.cpu.limit} (${snap.cpu.percent.toFixed(1)}%) | Bucket: ${snap.cpu.bucket}`
    );
    logger.info(`Empire: ${snap.empire.rooms} rooms, ${snap.empire.creeps} creeps, ${snap.empire.credits} credits`);

    // Top 5 subsystems by CPU
    const topSubsystems = Object.values(snap.subsystems)
      .sort((a, b) => b.avgCpu - a.avgCpu)
      .slice(0, 5);
    if (topSubsystems.length > 0) {
      logger.info("Top Subsystems:");
      for (const sys of topSubsystems) {
        logger.info(`  ${sys.name}: ${sys.avgCpu.toFixed(3)} CPU`);
      }
    }

    // Top 5 roles by CPU
    const topRoles = Object.values(snap.roles)
      .sort((a, b) => b.avgCpu - a.avgCpu)
      .slice(0, 5);
    if (topRoles.length > 0) {
      logger.info("Top Roles:");
      for (const role of topRoles) {
        logger.info(`  ${role.name}: ${role.count} creeps, ${role.avgCpu.toFixed(3)} CPU`);
      }
    }

    if (this.config.trackNativeCalls) {
      logger.info(`Native calls: ${snap.native.total} total`);
    }
  }

  /**
   * Convert posture to numeric code for Grafana
   */
  private postureToCode(posture: RoomPosture): number {
    const mapping: Record<RoomPosture, number> = {
      eco: 0,
      expand: 1,
      defensive: 2,
      war: 3,
      siege: 4,
      evacuate: 5,
      nukePrep: 6
    };
    return mapping[posture] ?? -1;
  }

  /**
   * Convert colony level to numeric code for Grafana
   */
  private colonyLevelToCode(colonyLevel: EvolutionStage): number {
    const mapping: Record<EvolutionStage, number> = {
      seedNest: 1,
      foragingExpansion: 2,
      matureColony: 3,
      fortifiedHive: 4,
      empireDominance: 5
    };
    return mapping[colonyLevel] ?? 0;
  }

  /**
   * Get current stats snapshot
   */
  public getSnapshot(): StatsSnapshot {
    return this.currentSnapshot;
  }

  /**
   * Enable/disable stats collection
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if stats is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Reset all stats
   */
  public reset(): void {
    this.currentSnapshot = this.createEmptySnapshot();
    const mem = Memory as unknown as Record<string, any>;
    if (mem.stats?.profiler) {
      mem.stats.profiler = {
        rooms: {},
        subsystems: {},
        roles: {},
        tickCount: 0,
        lastUpdate: 0
      };
    }
  }
}

/**
 * Global unified stats instance
 */
export const unifiedStats = new UnifiedStatsManager();
