/**
 * Performance Profiler Module
 *
 * Measures per-room loop cost, global/strategic loop cost,
 * and stores rolling averages in Memory for tuning.
 */

import { logger } from "./logger";
import { statsManager } from "./stats";

/**
 * Profiler memory schema
 */
export interface ProfilerMemory {
  /** Per-room CPU averages */
  rooms: Record<string, RoomProfileData>;
  /** Global subsystem CPU averages */
  subsystems: Record<string, SubsystemProfileData>;
  /** Per-role CPU averages (for identifying expensive roles) */
  roles?: Record<string, SubsystemProfileData>;
  /** Total tick count since reset */
  tickCount: number;
  /** Last profile update tick */
  lastUpdate: number;
}

/**
 * Room profile data
 */
export interface RoomProfileData {
  /** Exponential moving average of CPU used */
  avgCpu: number;
  /** Peak CPU observed */
  peakCpu: number;
  /** Sample count */
  samples: number;
  /** Last measurement tick */
  lastTick: number;
}

/**
 * Subsystem profile data
 */
export interface SubsystemProfileData {
  /** Exponential moving average of CPU used */
  avgCpu: number;
  /** Peak CPU observed */
  peakCpu: number;
  /** Sample count */
  samples: number;
  /** Call count this tick */
  callsThisTick: number;
}

/**
 * Profiler configuration
 */
export interface ProfilerConfig {
  /** Smoothing factor for EMA (0-1, higher = more weight on recent) */
  smoothingFactor: number;
  /** Whether profiling is enabled */
  enabled: boolean;
  /** How often to log summary (0 = never) */
  logInterval: number;
}

const DEFAULT_CONFIG: ProfilerConfig = {
  smoothingFactor: 0.1,
  enabled: true,
  logInterval: 100
};

const STATS_ROOT_KEY = "stats";
const PROFILER_MEMORY_KEY = "profiler";
const LEGACY_MEMORY_KEY = "swarmProfiler";

/**
 * Performance Profiler
 */
export class Profiler {
  private config: ProfilerConfig;
  private tickMeasurements: Map<string, number> = new Map();
  private subsystemMeasurements: Map<string, number[]> = new Map();

  public constructor(config: Partial<ProfilerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get or initialize the shared stats root in Memory
   */
  private getStatsRoot(): Record<string, any> {
    const mem = Memory as unknown as Record<string, any>;
    if (!mem[STATS_ROOT_KEY] || typeof mem[STATS_ROOT_KEY] !== "object") {
      mem[STATS_ROOT_KEY] = {};
    }
    return mem[STATS_ROOT_KEY] as Record<string, any>;
  }

  /**
   * Get or initialize profiler memory
   */
  private getMemory(): ProfilerMemory {
    const mem = Memory as unknown as Record<string, unknown>;
    const statsRoot = this.getStatsRoot();

    // Migrate legacy location if present
    if (!statsRoot[PROFILER_MEMORY_KEY] && mem[LEGACY_MEMORY_KEY]) {
      statsRoot[PROFILER_MEMORY_KEY] = mem[LEGACY_MEMORY_KEY] as ProfilerMemory;
      delete mem[LEGACY_MEMORY_KEY];
    }

    if (!statsRoot[PROFILER_MEMORY_KEY]) {
      statsRoot[PROFILER_MEMORY_KEY] = {
        rooms: {},
        subsystems: {},
        roles: {},
        tickCount: 0,
        lastUpdate: 0
      } as ProfilerMemory;
    }

    return statsRoot[PROFILER_MEMORY_KEY] as ProfilerMemory;
  }



  /**
   * Start measuring a room's loop
   */
  public startRoom(_roomName: string): number {
    if (!this.config.enabled) return 0;
    return Game.cpu.getUsed();
  }

  /**
   * End measuring a room's loop
   */
  public endRoom(roomName: string, startCpu: number): void {
    if (!this.config.enabled) return;

    const cpuUsed = Game.cpu.getUsed() - startCpu;
    this.tickMeasurements.set(roomName, cpuUsed);

    const memory = this.getMemory();
    if (!memory.rooms[roomName]) {
      memory.rooms[roomName] = {
        avgCpu: cpuUsed,
        peakCpu: cpuUsed,
        samples: 1,
        lastTick: Game.time
      };
    } else {
      const data = memory.rooms[roomName];
      data.avgCpu = data.avgCpu * (1 - this.config.smoothingFactor) + cpuUsed * this.config.smoothingFactor;
      data.peakCpu = Math.max(data.peakCpu, cpuUsed);
      data.samples++;
      data.lastTick = Game.time;
    }
  }

  /**
   * Measure a subsystem function
   */
  public measureSubsystem<T>(name: string, fn: () => T): T {
    if (!this.config.enabled) {
      return fn();
    }

    const startCpu = Game.cpu.getUsed();
    const result = fn();
    const cpuUsed = Game.cpu.getUsed() - startCpu;

    // Track this tick's measurements
    const existing = this.subsystemMeasurements.get(name) ?? [];
    existing.push(cpuUsed);
    this.subsystemMeasurements.set(name, existing);

    return result;
  }

  /**
   * Finalize tick and update subsystem averages
   */
  public finalizeTick(): void {
    if (!this.config.enabled) return;

    const memory = this.getMemory();
    memory.tickCount++;
    memory.lastUpdate = Game.time;

    // Ensure roles map exists
    if (!memory.roles) {
      memory.roles = {};
    }

    // Update subsystem averages and record to unified stats
    for (const [name, measurements] of this.subsystemMeasurements) {
      const totalCpu = measurements.reduce((sum, m) => sum + m, 0);

      // Check if this is a role measurement (prefixed with "role:")
      const isRole = name.startsWith("role:");
      const targetMap = isRole ? memory.roles : memory.subsystems;
      const cleanName = isRole ? name.substring(5) : name;

      // BUGFIX: For roles, calculate per-creep average CPU
      // measurements.length = number of creeps that executed
      // totalCpu = sum of CPU used by all creeps
      // avgCpuPerCreep = average CPU per creep
      const cpuValue = isRole && measurements.length > 0 ? totalCpu / measurements.length : totalCpu;

      if (!targetMap[cleanName]) {
        targetMap[cleanName] = {
          avgCpu: cpuValue,
          peakCpu: cpuValue,
          samples: 1,
          callsThisTick: measurements.length
        };
      } else {
        const data = targetMap[cleanName];
        data.avgCpu = data.avgCpu * (1 - this.config.smoothingFactor) + cpuValue * this.config.smoothingFactor;
        data.peakCpu = Math.max(data.peakCpu, cpuValue);
        data.samples++;
        data.callsThisTick = measurements.length;
      }

      // Record to unified stats system
      if (isRole) {
        // Count creeps with this role
        const roleCount = Object.values(Game.creeps).filter(c => {
          const mem = c.memory as unknown as { role: string };
          return mem.role === cleanName;
        }).length;
        statsManager.recordRole(cleanName, roleCount, cpuValue, measurements.length);
      } else {
        statsManager.recordSubsystem(cleanName, totalCpu, measurements.length);
      }
    }

    // Clear tick measurements
    this.tickMeasurements.clear();
    this.subsystemMeasurements.clear();

    // Log summary if interval reached
    if (this.config.logInterval > 0 && Game.time % this.config.logInterval === 0) {
      this.logSummary();
    }
  }

  /**
   * Log a summary of profiler data
   */
  public logSummary(): void {
    const memory = this.getMemory();

    logger.info("=== Profiler Summary ===");
    logger.info(`Total ticks: ${memory.tickCount}`);

    // Room summaries
    const roomEntries = Object.entries(memory.rooms);
    if (roomEntries.length > 0) {
      logger.info("Room CPU (avg/peak):");
      for (const [room, data] of roomEntries) {
        logger.info(`  ${room}: ${data.avgCpu.toFixed(3)} / ${data.peakCpu.toFixed(3)}`);
      }
    }

    // Subsystem summaries
    const subsystemEntries = Object.entries(memory.subsystems);
    if (subsystemEntries.length > 0) {
      logger.info("Subsystem CPU (avg/peak):");
      for (const [name, data] of subsystemEntries) {
        logger.info(`  ${name}: ${data.avgCpu.toFixed(3)} / ${data.peakCpu.toFixed(3)}`);
      }
    }

    // Top 10 most expensive roles by average CPU
    const roleEntries = Object.entries(memory.roles || {});
    if (roleEntries.length > 0) {
      const topRoles = roleEntries
        .sort((a, b) => b[1].avgCpu - a[1].avgCpu)
        .slice(0, 10);
      
      logger.info("Top Roles by CPU (avg/peak):");
      for (const [role, data] of topRoles) {
        logger.info(`  ${role}: ${data.avgCpu.toFixed(3)} / ${data.peakCpu.toFixed(3)} (${data.callsThisTick} creeps)`);
      }
    }
  }

  /**
   * Get room profile data
   */
  public getRoomData(roomName: string): RoomProfileData | undefined {
    return this.getMemory().rooms[roomName];
  }

  /**
   * Get subsystem profile data
   */
  public getSubsystemData(name: string): SubsystemProfileData | undefined {
    return this.getMemory().subsystems[name];
  }

  /**
   * Get total CPU average across all rooms
   */
  public getTotalRoomCpu(): number {
    const memory = this.getMemory();
    return Object.values(memory.rooms).reduce((sum, data) => sum + data.avgCpu, 0);
  }

  /**
   * Reset profiler data
   */
  public reset(): void {
    const statsRoot = this.getStatsRoot();
    statsRoot[PROFILER_MEMORY_KEY] = {
      rooms: {},
      subsystems: {},
      roles: {},
      tickCount: 0,
      lastUpdate: 0
    } as ProfilerMemory;
  }

  /**
   * Enable/disable profiling
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if profiling is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }
}

/**
 * Global profiler instance
 */
export const profiler = new Profiler();
