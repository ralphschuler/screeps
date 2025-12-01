/**
 * Performance Profiler Module
 *
 * Measures per-room loop cost, global/strategic loop cost,
 * and stores rolling averages in Memory for tuning.
 */

import { logger } from "./logger";

/**
 * Profiler memory schema
 */
export interface ProfilerMemory {
  /** Per-room CPU averages */
  rooms: Record<string, RoomProfileData>;
  /** Global subsystem CPU averages */
  subsystems: Record<string, SubsystemProfileData>;
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

const MEMORY_KEY = "swarmProfiler";

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
   * Get or initialize profiler memory
   */
  private getMemory(): ProfilerMemory {
    const mem = Memory as unknown as Record<string, unknown>;
    if (!mem[MEMORY_KEY]) {
      mem[MEMORY_KEY] = {
        rooms: {},
        subsystems: {},
        tickCount: 0,
        lastUpdate: 0
      } as ProfilerMemory;
    }
    return mem[MEMORY_KEY] as ProfilerMemory;
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

    // Update subsystem averages
    for (const [name, measurements] of this.subsystemMeasurements) {
      const totalCpu = measurements.reduce((sum, m) => sum + m, 0);

      if (!memory.subsystems[name]) {
        memory.subsystems[name] = {
          avgCpu: totalCpu,
          peakCpu: totalCpu,
          samples: 1,
          callsThisTick: measurements.length
        };
      } else {
        const data = memory.subsystems[name];
        data.avgCpu = data.avgCpu * (1 - this.config.smoothingFactor) + totalCpu * this.config.smoothingFactor;
        data.peakCpu = Math.max(data.peakCpu, totalCpu);
        data.samples++;
        data.callsThisTick = measurements.length;
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
    const mem = Memory as unknown as Record<string, unknown>;
    mem[MEMORY_KEY] = {
      rooms: {},
      subsystems: {},
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
