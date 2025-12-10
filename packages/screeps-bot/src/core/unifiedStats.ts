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
  /** Update interval for memory segment persistence (in ticks, requires an active RawMemory segment) */
  segmentUpdateInterval: number;
  /** Memory segment ID for stats storage (request via RawMemory.setActiveSegments) */
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
 * Per-role profiling stats with additional metrics including spawn status,
 * activity state (idle/active), average ticks to live, and body composition
 */
export interface RoleStatsEntry {
  name: string;
  count: number;
  avgCpu: number;
  peakCpu: number;
  calls: number;
  samples: number;
  spawningCount: number;
  idleCount: number;
  activeCount: number;
  avgTicksToLive: number;
  totalBodyParts: number;
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
 * Kernel process statistics entry
 */
export interface ProcessStatsEntry {
  id: string;
  name: string;
  priority: number;
  frequency: string;
  state: string;
  totalCpu: number;
  runCount: number;
  avgCpu: number;
  maxCpu: number;
  lastRunTick: number;
  skippedCount: number;
  errorCount: number;
  cpuBudget: number;
  minBucket: number;
}

/**
 * Per-creep statistics entry
 */
export interface CreepStatsEntry {
  name: string;
  role: string;
  homeRoom: string;
  currentRoom: string;
  cpu: number;
  action: string;
  ticksToLive: number;
  hits: number;
  hitsMax: number;
  bodyParts: number;
  fatigue: number;
  actionsThisTick: number;
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
  processes: Record<string, ProcessStatsEntry>;
  creeps: Record<string, CreepStatsEntry>;
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
    if (RawMemory.segments[this.config.segmentId] === undefined) {
      RawMemory.setActiveSegments([this.config.segmentId]);
      this.segmentRequested = true;
    }
    logger.info("Unified stats system initialized", { subsystem: "Stats" });
  }

  /**
   * Start of tick - reset transient data
   */
  public startTick(): void {
    if (!this.config.enabled) return;

    // Keep the stats segment active for the next tick
    RawMemory.setActiveSegments([this.config.segmentId]);
    this.segmentRequested = true;

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

    // Collect creep stats if not already recorded
    this.finalizeCreepStats();

    // Finalize tick info
    this.currentSnapshot.tick = Game.time;
    this.currentSnapshot.timestamp = Date.now();

    // Publish to Memory.stats first (console output reads from this)
    this.publishToMemory();

    // Publish to console for graphite exporter to parse
    this.publishToConsole();

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
   * Record kernel process statistics
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

    this.currentSnapshot.processes[process.id] = {
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
   * Collect all kernel process statistics
   */
  public collectProcessStats(processes: Map<string, {
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
  }>): void {
    if (!this.config.enabled) return;

    processes.forEach((process) => {
      this.recordProcess(process);
    });
  }

  /**
   * Record individual creep statistics
   */
  public recordCreep(creep: Creep, cpu: number, action: string, actionsCount = 0): void {
    if (!this.config.enabled) return;

    const creepMemory = creep.memory as unknown as { role?: string; homeRoom?: string };
    
    this.currentSnapshot.creeps[creep.name] = {
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
      native: this.createEmptyNativeCalls(),
      processes: {},
      creeps: {}
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
        // Role stats with enhanced metrics
        const roleCreeps = Object.values(Game.creeps).filter(c => {
          const mem = c.memory as unknown as { role: string };
          return mem.role === cleanName;
        });
        
        const roleCount = roleCreeps.length;
        
        // Calculate enhanced metrics
        let spawningCount = 0;
        let idleCount = 0;
        let activeCount = 0;
        let totalTTL = 0;
        let totalBodyParts = 0;
        
        for (const creep of roleCreeps) {
          const creepMemory = creep.memory as unknown as { 
            role?: string; 
            state?: { action?: string }; 
            working?: boolean 
          };
          const action = creepMemory.state?.action ?? "idle";
          const isWorking = creepMemory.working ?? (action !== "idle");
          
          totalBodyParts += creep.body.length;
          totalTTL += creep.ticksToLive ?? 0;
          
          if (creep.spawning) {
            spawningCount++;
          } else if (!isWorking || action === "idle") {
            idleCount++;
          } else {
            activeCount++;
          }
        }

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
          samples: (existing?.samples ?? 0) + 1,
          spawningCount,
          idleCount,
          activeCount,
          avgTicksToLive: roleCount > 0 ? totalTTL / roleCount : 0,
          totalBodyParts
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
   * Finalize creep stats - collect stats for all creeps if not already recorded
   */
  private finalizeCreepStats(): void {
    for (const creep of Object.values(Game.creeps)) {
      // Only record if not already recorded this tick
      if (!this.currentSnapshot.creeps[creep.name]) {
        const creepMemory = creep.memory as unknown as { 
          role?: string; 
          homeRoom?: string; 
          state?: { action?: string }; 
          working?: boolean 
        };
        const action = creepMemory.state?.action ?? (creepMemory.working ? "working" : "idle");
        
        this.currentSnapshot.creeps[creep.name] = {
          name: creep.name,
          role: creepMemory.role ?? "unknown",
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
    }
  }

  /**
   * Output stats to console in JSON format for graphite exporter
   * Outputs the entire Memory.stats object as a single JSON object
   */
  private publishToConsole(): void {
    // Get the Memory.stats object that was just created by publishToMemory()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem = Memory as unknown as Record<string, any>;
    
    if (mem.stats && typeof mem.stats === "object") {
      // Output as a single JSON object with type "stats"
      const statsOutput = {
        type: "stats",
        data: mem.stats
      };
      console.log(JSON.stringify(statsOutput));
    }
  }

  /**
   * Publish stats to Memory.stats as nested objects (not flat)
   * The graphite exporter will handle flattening for Grafana
   */
  private publishToMemory(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mem = Memory as unknown as Record<string, any>;
    const snap = this.currentSnapshot;

    // Create nested stats structure
    mem.stats = {
      tick: snap.tick,
      timestamp: snap.timestamp,
      cpu: {
        used: snap.cpu.used,
        limit: snap.cpu.limit,
        bucket: snap.cpu.bucket,
        percent: snap.cpu.percent,
        heap_mb: snap.cpu.heapUsed
      },
      gcl: {
        level: snap.progression.gcl.level,
        progress: snap.progression.gcl.progress,
        progress_total: snap.progression.gcl.progressTotal,
        progress_percent: snap.progression.gcl.progressPercent
      },
      gpl: {
        level: snap.progression.gpl.level
      },
      empire: {
        rooms: snap.empire.rooms,
        creeps: snap.empire.creeps,
        energy: {
          storage: snap.empire.energy.storage,
          terminal: snap.empire.energy.terminal,
          available: snap.empire.energy.available,
          capacity: snap.empire.energy.capacity
        },
        credits: snap.empire.credits
      },
      rooms: {} as Record<string, any>,
      subsystems: {} as Record<string, any>,
      roles: {} as Record<string, any>,
      native: {
        pathfinder_search: snap.native.pathfinderSearch,
        move_to: snap.native.moveTo,
        move: snap.native.move,
        harvest: snap.native.harvest,
        transfer: snap.native.transfer,
        withdraw: snap.native.withdraw,
        build: snap.native.build,
        repair: snap.native.repair,
        upgrade_controller: snap.native.upgradeController,
        attack: snap.native.attack,
        ranged_attack: snap.native.rangedAttack,
        heal: snap.native.heal,
        dismantle: snap.native.dismantle,
        say: snap.native.say,
        total: snap.native.total
      }
    };

    // Room stats with nested structure
    for (const [roomName, room] of Object.entries(snap.rooms)) {
      mem.stats.rooms[roomName] = {
        rcl: room.rcl,
        energy: {
          available: room.energy.available,
          capacity: room.energy.capacity,
          storage: room.energy.storage,
          terminal: room.energy.terminal
        },
        controller: {
          progress: room.controller.progress,
          progress_total: room.controller.progressTotal,
          progress_percent: room.controller.progressPercent
        },
        creeps: room.creeps,
        hostiles: room.hostiles,
        brain: {
          danger: room.brain.danger,
          posture_code: room.brain.postureCode,
          colony_level_code: room.brain.colonyLevelCode
        },
        pheromones: { ...room.pheromones },
        metrics: {
          energy: {
            harvested: room.metrics.energyHarvested,
            spawning: room.metrics.energySpawning,
            construction: room.metrics.energyConstruction,
            repair: room.metrics.energyRepair,
            tower: room.metrics.energyTower,
            available_for_sharing: room.metrics.energyAvailableForSharing,
            capacity_total: room.metrics.energyCapacityTotal,
            need: room.metrics.energyNeed
          },
          controller_progress: room.metrics.controllerProgress,
          hostile_count: room.metrics.hostileCount,
          damage_received: room.metrics.damageReceived,
          construction_sites: room.metrics.constructionSites
        },
        profiler: {
          avg_cpu: room.profiler.avgCpu,
          peak_cpu: room.profiler.peakCpu,
          samples: room.profiler.samples
        }
      };
    }

    // Subsystem stats
    for (const [name, subsys] of Object.entries(snap.subsystems)) {
      mem.stats.subsystems[name] = {
        avg_cpu: subsys.avgCpu,
        peak_cpu: subsys.peakCpu,
        calls: subsys.calls,
        samples: subsys.samples
      };
    }

    // Role stats (enhanced)
    for (const [name, role] of Object.entries(snap.roles)) {
      mem.stats.roles[name] = {
        count: role.count,
        avg_cpu: role.avgCpu,
        peak_cpu: role.peakCpu,
        calls: role.calls,
        samples: role.samples,
        spawning_count: role.spawningCount,
        idle_count: role.idleCount,
        active_count: role.activeCount,
        avg_ticks_to_live: role.avgTicksToLive,
        total_body_parts: role.totalBodyParts
      };
    }

    // Process stats
    mem.stats.processes = {} as Record<string, any>;
    for (const [id, process] of Object.entries(snap.processes)) {
      mem.stats.processes[id] = {
        name: process.name,
        priority: process.priority,
        frequency: process.frequency,
        state: process.state,
        total_cpu: process.totalCpu,
        run_count: process.runCount,
        avg_cpu: process.avgCpu,
        max_cpu: process.maxCpu,
        last_run_tick: process.lastRunTick,
        skipped_count: process.skippedCount,
        error_count: process.errorCount,
        cpu_budget: process.cpuBudget,
        min_bucket: process.minBucket
      };
    }

    // Creep stats
    mem.stats.creeps = {} as Record<string, any>;
    for (const [name, creep] of Object.entries(snap.creeps)) {
      mem.stats.creeps[name] = {
        role: creep.role,
        home_room: creep.homeRoom,
        current_room: creep.currentRoom,
        cpu: creep.cpu,
        action: creep.action,
        ticks_to_live: creep.ticksToLive,
        hits: creep.hits,
        hits_max: creep.hitsMax,
        body_parts: creep.bodyParts,
        fatigue: creep.fatigue,
        actions_this_tick: creep.actionsThisTick
      };
    }
  }

  /**
   * Update memory segment with historical data
   */
  private updateSegment(): void {
    if (!this.config.enabled) return;

    // If the segment is not yet active, request it and retry next tick
    if (RawMemory.segments[this.config.segmentId] === undefined) {
      if (!this.segmentRequested) {
        RawMemory.setActiveSegments([this.config.segmentId]);
        this.segmentRequested = true;
      }
      return;
    }

    this.segmentRequested = false;

    const SEGMENT_SIZE_LIMIT = 100 * 1024; // 100KB limit per Screeps rules

    // Load existing history if present
    let history: StatsSnapshot[] = [];
    const rawSegment = RawMemory.segments[this.config.segmentId];
    if (rawSegment) {
      try {
        const parsed = JSON.parse(rawSegment);
        if (Array.isArray(parsed)) {
          history = parsed as StatsSnapshot[];
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Failed to parse stats segment: ${errorMessage}`, { subsystem: "Stats" });
      }
    }

    // Append current snapshot and trim to configured history length
    history.push(this.currentSnapshot);
    if (history.length > this.config.maxHistoryPoints) {
      history = history.slice(-this.config.maxHistoryPoints);
    }

    // Serialize and ensure it fits within the segment limit
    let json = JSON.stringify(history);
    if (json.length > SEGMENT_SIZE_LIMIT) {
      logger.warn(
        `Stats segment size ${json.length} exceeds ${SEGMENT_SIZE_LIMIT} bytes, trimming history`,
        { subsystem: "Stats" }
      );

      while (json.length > SEGMENT_SIZE_LIMIT && history.length > 1) {
        history.shift();
        json = JSON.stringify(history);
      }

      if (json.length > SEGMENT_SIZE_LIMIT) {
        logger.error(
          `Failed to persist stats segment within ${SEGMENT_SIZE_LIMIT} bytes after trimming`,
          { subsystem: "Stats" }
        );
        return;
      }
    }

    try {
      RawMemory.segments[this.config.segmentId] = json;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to save stats segment: ${errorMessage}`, { subsystem: "Stats" });
    }
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

    // Top 5 processes by CPU
    const topProcesses = Object.values(snap.processes)
      .sort((a, b) => b.avgCpu - a.avgCpu)
      .slice(0, 5);
    if (topProcesses.length > 0) {
      logger.info("Top Processes:");
      for (const proc of topProcesses) {
        logger.info(`  ${proc.name}: ${proc.avgCpu.toFixed(3)} CPU (runs: ${proc.runCount}, state: ${proc.state})`);
      }
    }

    // Top 5 rooms by CPU
    const topRooms = Object.values(snap.rooms)
      .sort((a, b) => b.profiler.avgCpu - a.profiler.avgCpu)
      .slice(0, 5);
    if (topRooms.length > 0) {
      logger.info("Top Rooms by CPU:");
      for (const room of topRooms) {
        logger.info(`  ${room.name}: ${room.profiler.avgCpu.toFixed(3)} CPU (RCL ${room.rcl})`);
      }
    }

    // Top 5 creeps by CPU
    const topCreeps = Object.values(snap.creeps)
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5);
    if (topCreeps.length > 0) {
      logger.info("Top Creeps by CPU:");
      for (const creep of topCreeps) {
        logger.info(`  ${creep.name} (${creep.role}): ${creep.cpu.toFixed(3)} CPU in ${creep.currentRoom}`);
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
