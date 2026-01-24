/**
 * Utility memory schemas for visualization and other miscellaneous structures
 * Includes visualization config and helper types
 */

/**
 * Visualization layer flags (bitfield)
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
    structures: Record<string, { data: { x: number; y: number; type: StructureConstant }[]; ttl: number }>;
  };
  /** Last cache clear tick */
  lastCacheClear: number;
}
