/**
 * Statistics System Type Definitions
 * 
 * Extracted from unifiedStats.ts for better maintainability.
 * All stats-related interfaces and types are consolidated here.
 */

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
export interface ProfilerMemory {
  rooms: Record<string, { avgCpu: number; peakCpu: number; samples: number; lastTick: number }>;
  subsystems: Record<string, { avgCpu: number; peakCpu: number; samples: number; callsThisTick: number }>;
  roles?: Record<string, { avgCpu: number; peakCpu: number; samples: number; callsThisTick: number }>;
  tickCount: number;
  lastUpdate: number;
}
