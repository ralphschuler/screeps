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
import { EvolutionStage, RoomPosture } from "../memory/schemas";
import { shardManager } from "../intershard/shardManager";
import { 
  getRoomFindCacheStats,
  getBodyPartCacheStats,
  getObjectCacheStats,
  getPathCacheStats,
  getRoleCacheStats
} from "../utils/caching";
import { globalCache } from "../cache";
import { calculateRoomScalingMultiplier, calculateBucketMultiplier, type AdaptiveBudgetConfig } from "./adaptiveBudgets";

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
  /** CPU budget limits (from ROADMAP.md Section 18) */
  budgetLimits: {
    /** Eco room budget in CPU per tick */
    ecoRoom: number;
    /** War room budget in CPU per tick */
    warRoom: number;
    /** Global overmind budget in CPU (amortized) */
    overmind: number;
  };
  /** Thresholds for budget alerts */
  budgetAlertThresholds: {
    /** Warning threshold (e.g., 0.8 for 80%) */
    warning: number;
    /** Critical threshold (e.g., 1.0 for 100%) */
    critical: number;
  };
  /** Anomaly detection configuration */
  anomalyDetection: {
    /** Enable anomaly detection */
    enabled: boolean;
    /** CPU spike threshold multiplier (e.g., 2.0 = 2x average) */
    spikeThreshold: number;
    /** Minimum samples before anomaly detection activates */
    minSamples: number;
  };
}

const DEFAULT_CONFIG: UnifiedStatsConfig = {
  enabled: true,
  smoothingFactor: 0.1,
  trackNativeCalls: true,
  logInterval: 100,
  segmentUpdateInterval: 10,
  segmentId: 90,
  maxHistoryPoints: 1000,
  budgetLimits: {
    ecoRoom: 0.1,    // ≤0.1 CPU per tick for eco rooms
    warRoom: 0.25,   // ≤0.25 CPU per tick for war rooms
    overmind: 1.0    // ≤1 CPU every 20-50 ticks for empire
  },
  budgetAlertThresholds: {
    warning: 0.8,    // Alert at 80% of budget
    critical: 1.0    // Alert at 100% of budget
  },
  anomalyDetection: {
    enabled: true,
    spikeThreshold: 2.0,  // 2x average CPU is anomalous
    minSamples: 10        // Need 10 samples before detecting anomalies
  }
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
 * Kernel adaptive budget statistics
 */
export interface KernelBudgetStats {
  /** Whether adaptive budgets are enabled */
  adaptiveBudgetsEnabled: boolean;
  /** Current room count used for budget scaling */
  roomCount: number;
  /** Current room scaling multiplier */
  roomMultiplier: number;
  /** Current bucket multiplier */
  bucketMultiplier: number;
  /** Per-frequency budget allocations */
  budgets: {
    high: number;
    medium: number;
    low: number;
  };
  /** Total allocated budget across all processes */
  totalAllocated: number;
  /** Total budget used this tick */
  totalUsed: number;
  /** Budget utilization ratio (used / allocated) */
  utilizationRatio: number;
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
    progress: number;
    progressTotal: number;
    progressPercent: number;
  };
}

/**
 * Empire-wide aggregated stats
 */
export interface EmpireStats {
  rooms: number;
  creeps: number;
  powerCreeps: {
    total: number;
    spawned: number;
    eco: number;
    combat: number;
  };
  energy: {
    storage: number;
    terminal: number;
    available: number;
    capacity: number;
  };
  credits: number;
  skippedProcesses: number;
  shard?: {
    name: string;
    role: string;
    cpuUsage: number;
    cpuCategory: string;
    bucketLevel: number;
    economyIndex: number;
    warIndex: number;
    avgRCL: number;
    portalsCount: number;
    activeTasksCount: number;
  };
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
 * Unified cache statistics from all cache systems
 */
export interface CacheStats {
  /** Room.find() cache statistics */
  roomFind: {
    rooms: number;
    totalEntries: number;
    hits: number;
    misses: number;
    invalidations: number;
    hitRate: number;
  };
  /** Body part cache statistics */
  bodyPart: {
    size: number;
  };
  /** Object cache (Game.getObjectById) statistics */
  object: {
    size: number;
  };
  /** Path cache statistics */
  path: {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    evictions: number;
    hitRate: number;
  };
  /** Role-specific data cache statistics */
  role: {
    totalEntries: number;
  };
  /** Global cache manager aggregate statistics */
  global: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    evictions: number;
  };
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
  /** Tick modulo for distributed execution (if set) */
  tickModulo?: number;
  /** Tick offset for distributed execution (if set) */
  tickOffset?: number;
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
 * CPU budget alert
 */
export interface CPUBudgetAlert {
  /** Alert severity level */
  severity: "warning" | "critical";
  /** Room or subsystem name */
  target: string;
  /** Type of target */
  targetType: "room" | "process" | "overmind";
  /** Actual CPU used */
  cpuUsed: number;
  /** Budget limit */
  budgetLimit: number;
  /** Percentage of budget used */
  percentUsed: number;
  /** Game tick when alert was generated */
  tick: number;
}

/**
 * CPU anomaly detection result
 */
export interface CPUAnomaly {
  /** Anomaly type */
  type: "spike" | "sustained_high";
  /** Room or subsystem name */
  target: string;
  /** Type of target */
  targetType: "room" | "process" | "subsystem";
  /** Current CPU usage */
  current: number;
  /** Baseline average CPU */
  baseline: number;
  /** Multiplier above baseline */
  multiplier: number;
  /** Game tick when detected */
  tick: number;
  /** Additional context */
  context?: string;
}

/**
 * CPU budget validation report
 */
export interface CPUBudgetReport {
  /** Total rooms evaluated */
  roomsEvaluated: number;
  /** Rooms within budget */
  roomsWithinBudget: number;
  /** Rooms over budget */
  roomsOverBudget: number;
  /** Active budget alerts */
  alerts: CPUBudgetAlert[];
  /** Detected anomalies */
  anomalies: CPUAnomaly[];
  /** Report generation tick */
  tick: number;
}

/**
 * Role-specific efficiency metrics stored in creep memory.
 * Used by creepMetrics.ts for tracking individual creep performance.
 * 
 * NOTE: Consolidated from legacy stats.ts - this is now the canonical definition.
 */
export interface CreepMetrics {
  /** Total number of tasks completed (builds finished, upgrades done, etc.) */
  tasksCompleted: number;
  /** Total energy/resources transferred to structures or other creeps */
  energyTransferred: number;
  /** Total energy harvested from sources */
  energyHarvested: number;
  /** Total construction progress contributed */
  buildProgress: number;
  /** Total repair progress contributed */
  repairProgress: number;
  /** Total upgrade progress contributed to controllers */
  upgradeProgress: number;
  /** Total damage dealt (for combat roles) */
  damageDealt: number;
  /** Total healing done (for healer roles) */
  healingDone: number;
}

/**
 * Complete stats snapshot for a single tick
 */
export interface StatsSnapshot {
  tick: number;
  timestamp: number;
  cpu: CpuStats;
  kernelBudgets: KernelBudgetStats;
  progression: ProgressionStats;
  empire: EmpireStats;
  rooms: Record<string, RoomStatsEntry>;
  subsystems: Record<string, SubsystemStatsEntry>;
  roles: Record<string, RoleStatsEntry>;
  native: NativeCallStats;
  processes: Record<string, ProcessStatsEntry>;
  creeps: Record<string, CreepStatsEntry>;
  cache: CacheStats;
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
  private skippedProcessesThisTick = 0;

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

    // BUGFIX: Don't clear room stats - they persist across ticks since rooms don't run every tick
    // Room processes are distributed (run every 5 ticks for eco rooms) but stats are exported every tick
    // Solution: Preserve room stats from previous snapshot, only clear per-tick measurements
    const previousRoomStats = this.currentSnapshot?.rooms ?? {};
    
    this.currentSnapshot = this.createEmptySnapshot();
    this.currentSnapshot.rooms = previousRoomStats;  // Preserve room stats across ticks
    
    this.nativeCallsThisTick = this.createEmptyNativeCalls();
    this.subsystemMeasurements.clear();
    this.roomMeasurements.clear();
    this.skippedProcessesThisTick = 0;
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
        level: Game.gpl?.level ?? 0,
        progress: Game.gpl?.progress ?? 0,
        progressTotal: Game.gpl?.progressTotal ?? 0,
        progressPercent: (Game.gpl?.progressTotal ?? 0) > 0 
          ? ((Game.gpl?.progress ?? 0) / (Game.gpl?.progressTotal ?? 0)) * 100 
          : 0
      }
    };

    // Finalize empire stats
    this.finalizeEmpireStats();

    // Finalize subsystem stats
    this.finalizeSubsystemStats();

    // Finalize cache stats
    this.finalizeCacheStats();

    // Finalize native calls
    this.currentSnapshot.native = { ...this.nativeCallsThisTick };

    // Collect creep stats if not already recorded
    this.finalizeCreepStats();

    // Finalize tick info
    this.currentSnapshot.tick = Game.time;
    this.currentSnapshot.timestamp = Date.now();

    // Validate CPU budgets and detect anomalies
    const budgetReport = this.validateBudgets();
    const anomalies = this.detectAnomalies();

    // Log critical budget violations
    if (budgetReport.alerts.length > 0) {
      const criticalAlerts = budgetReport.alerts.filter(a => a.severity === "critical");
      const warningAlerts = budgetReport.alerts.filter(a => a.severity === "warning");
      
      if (criticalAlerts.length > 0) {
        logger.error(
          `CPU Budget: ${criticalAlerts.length} critical violations detected`,
          {
            subsystem: "CPUBudget",
            meta: { 
              violations: criticalAlerts.map(a => `${a.target}: ${(a.percentUsed * 100).toFixed(1)}% (${a.cpuUsed.toFixed(3)}/${a.budgetLimit})`)
            }
          }
        );
      }
      
      if (warningAlerts.length > 0) {
        logger.warn(
          `CPU Budget: ${warningAlerts.length} warnings (≥80% of limit)`,
          {
            subsystem: "CPUBudget",
            meta: { 
              warnings: warningAlerts.map(a => `${a.target}: ${(a.percentUsed * 100).toFixed(1)}%`)
            }
          }
        );
      }
    }

    // Log CPU anomalies
    if (anomalies.length > 0) {
      logger.warn(
        `CPU Anomalies: ${anomalies.length} detected`,
        {
          subsystem: "CPUProfiler",
          meta: {
            anomalies: anomalies.map(a => 
              `${a.target} (${a.type}): ${a.current.toFixed(3)} CPU (${a.multiplier.toFixed(1)}x baseline)${a.context ? ` - ${a.context}` : ""}`
            )
          }
        }
      );
    }

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
    tickModulo?: number;
    tickOffset?: number;
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
      minBucket: process.minBucket,
      tickModulo: process.tickModulo,
      tickOffset: process.tickOffset
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
    tickModulo?: number;
    tickOffset?: number;
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
   * Set the number of processes skipped this tick
   */
  public setSkippedProcesses(count: number): void {
    if (!this.config.enabled) return;
    this.skippedProcessesThisTick = Math.max(0, count);
  }

  /**
   * Collect kernel adaptive budget statistics
   * 
   * @param kernel - Kernel instance to collect budget stats from
   */
  public collectKernelBudgetStats(kernel: {
    getConfig: () => {
      enableAdaptiveBudgets: boolean;
      frequencyCpuBudgets: Record<string, number>;
      adaptiveBudgetConfig: AdaptiveBudgetConfig;
    };
    getTickCpuUsed: () => number;
    getProcesses: () => Array<{ cpuBudget: number }>;
  }): void {
    if (!this.config.enabled) return;

    const config = kernel.getConfig();
    const adaptiveBudgetsEnabled = config.enableAdaptiveBudgets;
    
    // Calculate metrics if adaptive budgets are enabled
    if (adaptiveBudgetsEnabled) {
      const roomCount = Object.keys(Game.rooms).length;
      const bucket = Game.cpu.bucket;
      
      // Calculate total allocated and used budgets
      const processes = kernel.getProcesses();
      const totalAllocated = processes.reduce((sum, p) => sum + p.cpuBudget, 0);
      const totalUsed = kernel.getTickCpuUsed();
      const utilizationRatio = totalAllocated > 0 ? totalUsed / totalAllocated : 0;

      this.currentSnapshot.kernelBudgets = {
        adaptiveBudgetsEnabled: true,
        roomCount,
        roomMultiplier: calculateRoomScalingMultiplier(roomCount, config.adaptiveBudgetConfig),
        bucketMultiplier: calculateBucketMultiplier(bucket, config.adaptiveBudgetConfig),
        budgets: {
          high: config.frequencyCpuBudgets.high || 0,
          medium: config.frequencyCpuBudgets.medium || 0,
          low: config.frequencyCpuBudgets.low || 0
        },
        totalAllocated,
        totalUsed,
        utilizationRatio
      };
    } else {
      // Static budgets
      const processes = kernel.getProcesses();
      const totalAllocated = processes.reduce((sum, p) => sum + p.cpuBudget, 0);
      const totalUsed = kernel.getTickCpuUsed();

      this.currentSnapshot.kernelBudgets = {
        adaptiveBudgetsEnabled: false,
        roomCount: Object.keys(Game.rooms).length,
        roomMultiplier: 1.0,
        bucketMultiplier: 1.0,
        budgets: {
          high: config.frequencyCpuBudgets.high || 0,
          medium: config.frequencyCpuBudgets.medium || 0,
          low: config.frequencyCpuBudgets.low || 0
        },
        totalAllocated,
        totalUsed,
        utilizationRatio: totalAllocated > 0 ? totalUsed / totalAllocated : 0
      };
    }
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

  /**
   * Check if a room is in war mode (war/siege posture or high danger)
   */
  private isWarRoom(roomName: string): boolean {
    const swarm = memoryManager.getSwarmState(roomName);
    if (!swarm) return false;
    return swarm.posture === "war" || swarm.posture === "siege" || swarm.danger >= 2;
  }

  /**
   * Validate CPU budgets for all rooms and generate alerts
   * Returns a report with budget status and any violations
   */
  public validateBudgets(): CPUBudgetReport {
    const report: CPUBudgetReport = {
      roomsEvaluated: 0,
      roomsWithinBudget: 0,
      roomsOverBudget: 0,
      alerts: [],
      anomalies: [],
      tick: Game.time
    };

    // Validate room budgets
    for (const [roomName, roomStats] of Object.entries(this.currentSnapshot.rooms)) {
      report.roomsEvaluated++;
      
      // Determine budget limit based on room posture
      const isWarRoom = this.isWarRoom(roomName);
      const budgetLimit = isWarRoom ? this.config.budgetLimits.warRoom : this.config.budgetLimits.ecoRoom;
      
      // Get current CPU (use average to smooth out spikes)
      const cpuUsed = roomStats.profiler.avgCpu;
      const percentUsed = cpuUsed / budgetLimit;
      
      // Check budget thresholds
      if (percentUsed >= this.config.budgetAlertThresholds.critical) {
        report.roomsOverBudget++;
        report.alerts.push({
          severity: "critical",
          target: roomName,
          targetType: "room",
          cpuUsed,
          budgetLimit,
          percentUsed,
          tick: Game.time
        });
      } else if (percentUsed >= this.config.budgetAlertThresholds.warning) {
        report.alerts.push({
          severity: "warning",
          target: roomName,
          targetType: "room",
          cpuUsed,
          budgetLimit,
          percentUsed,
          tick: Game.time
        });
        report.roomsWithinBudget++; // Warning but still functioning
      } else {
        report.roomsWithinBudget++;
      }
    }

    return report;
  }

  /**
   * Detect CPU anomalies (spikes and sustained high usage)
   * Returns list of detected anomalies
   */
  public detectAnomalies(): CPUAnomaly[] {
    if (!this.config.anomalyDetection.enabled) {
      return [];
    }

    const anomalies: CPUAnomaly[] = [];

    // Check room CPU for anomalies
    for (const [roomName, roomStats] of Object.entries(this.currentSnapshot.rooms)) {
      // Need enough samples for reliable anomaly detection
      if (roomStats.profiler.samples < this.config.anomalyDetection.minSamples) {
        continue;
      }

      const current = this.roomMeasurements.get(roomName) ?? 0;
      const baseline = roomStats.profiler.avgCpu;
      
      // Skip if no meaningful baseline
      if (baseline < 0.01) {
        continue;
      }

      const multiplier = current / baseline;

      // Detect CPU spike
      if (multiplier >= this.config.anomalyDetection.spikeThreshold) {
        const swarm = memoryManager.getSwarmState(roomName);
        const context = swarm 
          ? `RCL ${Game.rooms[roomName]?.controller?.level ?? 0}, posture: ${swarm.posture}, danger: ${swarm.danger}`
          : undefined;

        anomalies.push({
          type: "spike",
          target: roomName,
          targetType: "room",
          current,
          baseline,
          multiplier,
          tick: Game.time,
          context
        });
      }
    }

    // Check process CPU for anomalies
    for (const [processId, processStats] of Object.entries(this.currentSnapshot.processes)) {
      // Need enough samples
      if (processStats.runCount < this.config.anomalyDetection.minSamples) {
        continue;
      }

      // Use maxCpu as the current spike indicator, avgCpu as baseline
      const current = processStats.maxCpu;
      const baseline = processStats.avgCpu;
      
      // Skip if process hasn't run recently or has negligible CPU
      if (Game.time - processStats.lastRunTick > 100 || baseline < 0.01) {
        continue;
      }

      // Check for CPU spikes (similar to room spike detection)
      if (current >= baseline * this.config.anomalyDetection.spikeThreshold) {
        anomalies.push({
          type: "spike",
          target: processId,
          targetType: "process",
          current,
          baseline,
          multiplier: current / baseline,
          tick: Game.time,
          context: `${processStats.name} (${processStats.frequency})`
        });
      }

      // Check for sustained high CPU compared to budget
      if (processStats.cpuBudget > 0) {
        const utilizationRatio = baseline / processStats.cpuBudget;
        if (utilizationRatio >= 1.5) { // 50% over budget is anomalous
          anomalies.push({
            type: "sustained_high",
            target: processId,
            targetType: "process",
            current: baseline,
            baseline: processStats.cpuBudget,
            multiplier: utilizationRatio,
            tick: Game.time,
            context: `${processStats.name} (${processStats.frequency})`
          });
        }
      }
    }

    return anomalies;
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
          level: 0,
          progress: 0,
          progressTotal: 0,
          progressPercent: 0
        }
      },
      empire: {
        rooms: 0,
        creeps: 0,
        powerCreeps: {
          total: 0,
          spawned: 0,
          eco: 0,
          combat: 0
        },
        energy: {
          storage: 0,
          terminal: 0,
          available: 0,
          capacity: 0
        },
        credits: 0,
        skippedProcesses: 0
      },
      rooms: {},
      subsystems: {},
      roles: {},
      native: this.createEmptyNativeCalls(),
      processes: {},
      creeps: {},
      kernelBudgets: {
        adaptiveBudgetsEnabled: false,
        roomCount: 0,
        roomMultiplier: 1.0,
        bucketMultiplier: 1.0,
        budgets: {
          high: 0,
          medium: 0,
          low: 0
        },
        totalAllocated: 0,
        totalUsed: 0,
        utilizationRatio: 0
      },
      cache: {
        roomFind: {
          rooms: 0,
          totalEntries: 0,
          hits: 0,
          misses: 0,
          invalidations: 0,
          hitRate: 0
        },
        bodyPart: {
          size: 0
        },
        object: {
          size: 0
        },
        path: {
          size: 0,
          maxSize: 0,
          hits: 0,
          misses: 0,
          evictions: 0,
          hitRate: 0
        },
        role: {
          totalEntries: 0
        },
        global: {
          hits: 0,
          misses: 0,
          hitRate: 0,
          size: 0,
          evictions: 0
        }
      }
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
    
    // Count power creeps
    const powerCreeps = Object.values(Game.powerCreeps);
    const spawnedPowerCreeps = powerCreeps.filter(pc => pc.ticksToLive !== undefined);
    const ecoPowerCreeps = powerCreeps.filter(pc => {
      const memory = pc.memory as { role?: string };
      return memory.role === "powerQueen";
    });
    const combatPowerCreeps = powerCreeps.filter(pc => {
      const memory = pc.memory as { role?: string };
      return memory.role === "powerWarrior";
    });

    // Collect shard stats if available
    let shardStats: EmpireStats["shard"];
    try {
      const shardState = shardManager.getCurrentShardState();
      
      if (shardState) {
        shardStats = {
          name: shardState.name,
          role: shardState.role,
          cpuUsage: shardState.health.cpuUsage,
          cpuCategory: shardState.health.cpuCategory,
          bucketLevel: shardState.health.bucketLevel,
          economyIndex: shardState.health.economyIndex,
          warIndex: shardState.health.warIndex,
          avgRCL: shardState.health.avgRCL,
          portalsCount: shardState.portals.length,
          activeTasksCount: shardState.activeTasks.length
        };
      }
    } catch (err) {
      // ShardManager not available or failed to load
    }

    this.currentSnapshot.empire = {
      rooms: ownedRooms.length,
      creeps: totalCreeps,
      powerCreeps: {
        total: powerCreeps.length,
        spawned: spawnedPowerCreeps.length,
        eco: ecoPowerCreeps.length,
        combat: combatPowerCreeps.length
      },
      energy: {
        storage: ownedRooms.reduce((sum, r) => sum + r.energy.storage, 0),
        terminal: ownedRooms.reduce((sum, r) => sum + r.energy.terminal, 0),
        available: ownedRooms.reduce((sum, r) => sum + r.energy.available, 0),
        capacity: ownedRooms.reduce((sum, r) => sum + r.energy.capacity, 0)
      },
      credits: Game.market.credits,
      skippedProcesses: this.skippedProcessesThisTick,
      shard: shardStats
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

        // BUGFIX: Calculate per-creep average CPU, not total CPU for all creeps
        // measurements.length = number of creeps that executed this tick
        // totalCpu = sum of CPU used by all creeps that executed
        // avgCpuPerCreep = average CPU per creep that executed
        const avgCpuPerCreep = measurements.length > 0 ? totalCpu / measurements.length : 0;
        
        const existing = profilerMem.roles?.[cleanName];
        const avgCpu = existing
          ? existing.avgCpu * (1 - this.config.smoothingFactor) + avgCpuPerCreep * this.config.smoothingFactor
          : avgCpuPerCreep;
        const peakCpu = existing ? Math.max(existing.peakCpu, avgCpuPerCreep) : avgCpuPerCreep;

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
   * Finalize cache stats - collect statistics from all cache systems
   */
  private finalizeCacheStats(): void {
    const roomFindStats = getRoomFindCacheStats();
    const bodyPartStats = getBodyPartCacheStats();
    const objectStats = getObjectCacheStats();
    const pathStats = getPathCacheStats();
    const roleStats = getRoleCacheStats();
    // Get aggregate stats across all namespaces (hits, misses, size, evictions summed)
    const globalStats = globalCache.getCacheStats();
    
    this.currentSnapshot.cache = {
      roomFind: roomFindStats,
      bodyPart: {
        size: bodyPartStats.size
      },
      object: {
        size: objectStats.size
      },
      path: pathStats,
      role: roleStats,
      global: globalStats
    };
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
      // Output as a single JSON object with type "stats" and tick for traceability
      const statsOutput = {
        type: "stats",
        tick: typeof Game !== "undefined" ? Game.time : 0,
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
      kernel: {
        adaptive_budgets_enabled: snap.kernelBudgets.adaptiveBudgetsEnabled,
        room_count: snap.kernelBudgets.roomCount,
        room_multiplier: snap.kernelBudgets.roomMultiplier,
        bucket_multiplier: snap.kernelBudgets.bucketMultiplier,
        budget_high: snap.kernelBudgets.budgets.high,
        budget_medium: snap.kernelBudgets.budgets.medium,
        budget_low: snap.kernelBudgets.budgets.low,
        total_allocated: snap.kernelBudgets.totalAllocated,
        total_used: snap.kernelBudgets.totalUsed,
        utilization_ratio: snap.kernelBudgets.utilizationRatio
      },
      gcl: {
        level: snap.progression.gcl.level,
        progress: snap.progression.gcl.progress,
        progress_total: snap.progression.gcl.progressTotal,
        progress_percent: snap.progression.gcl.progressPercent
      },
      gpl: {
        level: snap.progression.gpl.level,
        progress: snap.progression.gpl.progress,
        progress_total: snap.progression.gpl.progressTotal,
        progress_percent: snap.progression.gpl.progressPercent
      },
      empire: {
        rooms: snap.empire.rooms,
        creeps: snap.empire.creeps,
        power_creeps: {
          total: snap.empire.powerCreeps.total,
          spawned: snap.empire.powerCreeps.spawned,
          eco: snap.empire.powerCreeps.eco,
          combat: snap.empire.powerCreeps.combat
        },
        energy: {
          storage: snap.empire.energy.storage,
          terminal: snap.empire.energy.terminal,
          available: snap.empire.energy.available,
          capacity: snap.empire.energy.capacity
        },
        credits: snap.empire.credits,
        skipped_processes: snap.empire.skippedProcesses,
        shard: snap.empire.shard ? {
          name: snap.empire.shard.name,
          role: snap.empire.shard.role,
          cpu_usage: snap.empire.shard.cpuUsage,
          cpu_category: snap.empire.shard.cpuCategory,
          bucket_level: snap.empire.shard.bucketLevel,
          economy_index: snap.empire.shard.economyIndex,
          war_index: snap.empire.shard.warIndex,
          avg_rcl: snap.empire.shard.avgRCL,
          portals_count: snap.empire.shard.portalsCount,
          active_tasks_count: snap.empire.shard.activeTasksCount
        } : undefined
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
   * Posture code to name mapping for console display
   */
  public static readonly POSTURE_NAMES: readonly string[] = [
    "eco",
    "expand", 
    "defensive",
    "war",
    "siege",
    "evacuate",
    "nukePrep"
  ] as const;

  /**
   * Convert posture code back to name
   */
  public postureCodeToName(code: number): string {
    return UnifiedStatsManager.POSTURE_NAMES[code] ?? "eco";
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

  /**
   * Get current stats snapshot (for console commands)
   */
  public getCurrentSnapshot(): StatsSnapshot {
    return { ...this.currentSnapshot };
  }
}

/**
 * Global unified stats instance
 */
export const unifiedStats = new UnifiedStatsManager();
