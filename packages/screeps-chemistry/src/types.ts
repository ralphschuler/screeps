/**
 * Chemistry Constants and Types
 * 
 * Core constants and interfaces for the chemistry system
 */

/**
 * Logger interface for chemistry system
 * Implement this interface to provide logging functionality
 */
export interface ChemistryLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

/**
 * No-op logger for when logging is not needed
 */
export const noopLogger: ChemistryLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};

/**
 * Reaction chain step
 */
export interface ReactionStep {
  /** Product */
  product: MineralCompoundConstant;
  /** Input 1 */
  input1: MineralConstant | MineralCompoundConstant;
  /** Input 2 */
  input2: MineralConstant | MineralCompoundConstant;
  /** Amount needed to produce */
  amountNeeded: number;
  /** Priority (higher = more important) */
  priority: number;
}

/**
 * Reaction definition
 */
export interface Reaction {
  /** Product */
  product: ResourceConstant;
  /** Input 1 */
  input1: ResourceConstant;
  /** Input 2 */
  input2: ResourceConstant;
  /** Priority (higher = more important) */
  priority: number;
}

/**
 * Boost configuration for a role
 */
export interface BoostConfig {
  /** Role name */
  role: string;
  /** Required boosts */
  boosts: ResourceConstant[];
  /** Minimum danger level to boost */
  minDanger: number;
}

/**
 * Lab role types
 */
export type LabRole = "input1" | "input2" | "output" | "boost" | "unassigned";

/**
 * Lab configuration entry
 */
export interface LabConfigEntry {
  /** Lab ID */
  labId: Id<StructureLab>;
  /** Lab role */
  role: LabRole;
  /** Assigned resource type */
  resourceType?: MineralConstant | MineralCompoundConstant;
  /** Lab position */
  pos: { x: number; y: number };
  /** Last configured tick */
  lastConfigured: number;
}

/**
 * Room lab configuration
 */
export interface RoomLabConfig {
  /** Room name */
  roomName: string;
  /** Lab configurations */
  labs: LabConfigEntry[];
  /** Active reaction if any */
  activeReaction?: {
    input1: MineralConstant | MineralCompoundConstant;
    input2: MineralConstant | MineralCompoundConstant;
    output: MineralCompoundConstant;
  };
  /** Last update tick */
  lastUpdate: number;
  /** Whether config is valid */
  isValid: boolean;
}

/**
 * Lab resource need
 */
export interface LabResourceNeed {
  /** Lab ID */
  labId: Id<StructureLab>;
  /** Needed resource */
  resourceType: MineralConstant | MineralCompoundConstant;
  /** Amount needed */
  amount: number;
  /** Priority (higher = more urgent) */
  priority: number;
}

/**
 * Lab overflow (needs emptying)
 */
export interface LabOverflow {
  /** Lab ID */
  labId: Id<StructureLab>;
  /** Resource to remove */
  resourceType: MineralConstant | MineralCompoundConstant;
  /** Amount to remove */
  amount: number;
  /** Priority (higher = more urgent) */
  priority: number;
}

/**
 * Lab task types
 */
export type LabTaskType = "idle" | "reacting" | "boosting" | "loading" | "unloading";

/**
 * Chemistry system state interface
 * Implement this to provide necessary state information to the chemistry system
 */
export interface ChemistryState {
  /** Current game tick */
  currentTick: number;
  /** Danger level (0-3) */
  danger: number;
  /** Current posture */
  posture: "eco" | "expand" | "defense" | "war" | "siege" | "evacuate";
  /** Pheromone levels */
  pheromones: {
    war?: number;
    siege?: number;
  };
}
