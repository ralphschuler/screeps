/**
 * Type definitions for @ralphschuler/screeps-visuals
 */

/**
 * Bitfield enum for visualization layers
 */
export enum VisualizationLayer {
  None = 0,
  Pheromones = 1 << 0,
  Paths = 1 << 1,
  Traffic = 1 << 2,
  Defense = 1 << 3,
  Economy = 1 << 4,
  Construction = 1 << 5,
  Performance = 1 << 6
}

/**
 * Visualization preset modes
 */
export type VisualizationMode = "debug" | "presentation" | "minimal" | "performance";

/**
 * Visualization configuration stored in Memory
 */
export interface VisualizationConfig {
  /** Enabled layers (bitfield) */
  enabledLayers: number;
  /** Current visualization mode */
  mode: VisualizationMode;
  /** Per-layer CPU costs (rolling average) */
  layerCosts: {
    pheromones: number;
    paths: number;
    traffic: number;
    defense: number;
    economy: number;
    construction: number;
  };
  /** Total visualization CPU cost */
  totalCost: number;
  /** Static element cache */
  cache: {
    /** Cached terrain data per room */
    terrain: Record<string, { data: string; ttl: number }>;
    /** Cached structure positions per room */
    structures: Record<string, { data: Array<{ x: number; y: number; type: StructureConstant }>; ttl: number }>;
  };
  /** Last cache clear tick */
  lastCacheClear: number;
}

/**
 * Pheromone state interface (simplified for visualization)
 */
export interface PheromoneState {
  [key: string]: number;
}

/**
 * Swarm state interface (simplified for visualization)
 */
export interface SwarmState {
  pheromones?: PheromoneState;
  danger?: number;
  posture?: string;
  remoteAssignments?: string[];
  collectionPoint?: { x: number; y: number };
  colonyLevel?: string;
  [key: string]: unknown;
}

/**
 * Simple logger interface for optional logging
 */
export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

/**
 * Memory manager interface for optional integration
 */
export interface MemoryManager {
  getOrInitSwarmState(roomName: string): SwarmState;
}

/**
 * Kernel interface for optional integration (budget dashboard)
 */
export interface Kernel {
  getConfig(): {
    enableAdaptiveBudgets?: boolean;
    adaptiveBudgetConfig?: AdaptiveBudgetConfig;
  };
  getProcesses(): Array<{
    name: string;
    cpuBudget: number;
    state: string;
    stats: {
      healthScore: number;
    };
  }>;
  getTickCpuUsed(): number;
  getRemainingCpu(): number;
}

/**
 * Adaptive budget config interface
 */
export interface AdaptiveBudgetConfig {
  [key: string]: unknown;
}

/**
 * Adaptive budget info interface
 */
export interface AdaptiveBudgetInfo {
  roomCount: number;
  bucket: number;
  roomMultiplier: number;
  bucketMultiplier: number;
  budgets: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Stats integration interface for optional budget dashboard
 */
export interface StatsIntegration {
  getAdaptiveBudgetInfo?(config: AdaptiveBudgetConfig): AdaptiveBudgetInfo;
}
