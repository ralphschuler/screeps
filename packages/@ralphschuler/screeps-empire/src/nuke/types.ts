/**
 * Nuke System Types and Constants
 * 
 * Shared types, interfaces, and constants for the nuke warfare system
 */

/**
 * Nuke Manager Configuration
 */
export interface NukeConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum ghodium to launch nuke */
  minGhodium: number;
  /** Minimum energy to launch nuke */
  minEnergy: number;
  /** Minimum score to launch nuke */
  minScore: number;
  /** Ticks before nuke impact to coordinate siege attack */
  siegeCoordinationWindow: number;
  /** Nuke flight time in ticks */
  nukeFlightTime: number;
  /** Priority for terminal transfer of nuke resources */
  terminalPriority: number;
  /** Buffer amount of resources to keep in donor room */
  donorRoomBuffer: number;
  /** Maximum time difference for salvo coordination (ticks) */
  salvoSyncWindow: number;
  /** ROI threshold multiplier (gain must be X times cost) */
  roiThreshold: number;
  /** Minimum war pheromone for counter-nuke */
  counterNukeWarThreshold: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_NUKE_CONFIG: NukeConfig = {
  updateInterval: 500,
  minGhodium: 5000,
  minEnergy: 300000,
  minScore: 35,
  siegeCoordinationWindow: 1000,
  nukeFlightTime: 50000,
  terminalPriority: 5,
  donorRoomBuffer: 1000,
  salvoSyncWindow: 10,
  roiThreshold: 2.0,
  counterNukeWarThreshold: 60
};

/**
 * Nuke damage constants
 */
export const NUKE_DAMAGE = {
  CENTER: 10000000, // 10M hits at center
  RADIUS: 5000000, // 5M hits in radius
  RANGE: 2 // Damage radius
};

/**
 * Nuke cost constants
 */
export const NUKE_COST = {
  ENERGY: 300000,
  GHODIUM: 5000,
  SAFE_MODE_COOLDOWN: 200
};

/**
 * Structure value estimates for damage assessment
 */
export const STRUCTURE_VALUES: Record<string, number> = {
  [STRUCTURE_SPAWN]: 15000,
  [STRUCTURE_TOWER]: 5000,
  [STRUCTURE_STORAGE]: 30000,
  [STRUCTURE_TERMINAL]: 100000,
  [STRUCTURE_LAB]: 50000,
  [STRUCTURE_NUKER]: 100000,
  [STRUCTURE_POWER_SPAWN]: 100000,
  [STRUCTURE_OBSERVER]: 8000,
  [STRUCTURE_EXTENSION]: 3000,
  [STRUCTURE_LINK]: 5000
};

/**
 * Intel-based damage estimation weights
 */
export const INTEL_DAMAGE_WEIGHTS = {
  TOWER_WEIGHT: 5,
  SPAWN_WEIGHT: 10,
  BASE_STRUCTURE_COUNT: 5
};

/**
 * Nuke candidate scoring result
 */
export interface NukeScore {
  roomName: string;
  score: number;
  reasons: string[];
}

/**
 * Nuke impact prediction result
 */
export interface NukeImpactPrediction {
  estimatedDamage: number;
  estimatedValue: number;
  threatenedStructures: string[];
}
