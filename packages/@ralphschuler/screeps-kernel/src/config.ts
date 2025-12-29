/**
 * Configuration types for kernel package
 */

export interface CPUConfig {
  /** Bucket thresholds */
  bucketThresholds: {
    /** Below this, enter low-bucket mode */
    lowMode: number;
    /** Above this, enter high-bucket mode */
    highMode: number;
  };
  /** CPU budgets per subsystem (percentage of limit) */
  budgets: {
    rooms: number;
    creeps: number;
    strategic: number;
    market: number;
    visualization: number;
  };
  /** Task frequencies */
  taskFrequencies: {
    pheromoneUpdate: number;
    clusterLogic: number;
    strategicDecisions: number;
    marketScan: number;
    nukeEvaluation: number;
    memoryCleanup: number;
  };
  /** Simple per-room budgets for backward compatibility */
  ecoRoom?: number;
  warRoom?: number;
  overmind?: number;
}

export interface KernelConfig {
  enableAdaptiveBudgets: boolean;
  cpu: CPUConfig;
}

const defaultConfig: KernelConfig = {
  enableAdaptiveBudgets: true,
  cpu: {
    bucketThresholds: {
      lowMode: 2000,
      highMode: 8000
    },
    budgets: {
      rooms: 0.60,
      creeps: 0.25,
      strategic: 0.10,
      market: 0.03,
      visualization: 0.02
    },
    taskFrequencies: {
      pheromoneUpdate: 5,
      clusterLogic: 10,
      strategicDecisions: 20,
      marketScan: 100,
      nukeEvaluation: 100,
      memoryCleanup: 500
    },
    ecoRoom: 0.1,
    warRoom: 0.25,
    overmind: 1.0
  }
};

let currentConfig: KernelConfig = { ...defaultConfig };

export function getConfig(): KernelConfig {
  return { ...currentConfig };
}

export function updateConfig(updates: Partial<KernelConfig>): void {
  currentConfig = { ...currentConfig, ...updates };
}

export function resetConfig(): void {
  currentConfig = { ...defaultConfig };
}
