/**
 * Military and combat-related memory schemas
 * Tracks squads, nukes, and warfare state
 */

/**
 * Nuke in flight tracking for salvo coordination
 */
export interface NukeInFlight {
  /** Unique ID for this nuke */
  id: string;
  /** Source room that launched the nuke */
  sourceRoom: string;
  /** Target room */
  targetRoom: string;
  /** Target position */
  targetPos: { x: number; y: number };
  /** Launch tick */
  launchTick: number;
  /** Expected impact tick (launchTick + 50000) */
  impactTick: number;
  /** Coordinated salvo ID (multiple nukes with same ID hit simultaneously) */
  salvoId?: string;
  /** Associated siege squad ID for coordination */
  siegeSquadId?: string;
  /** Estimated damage to be dealt (hits) */
  estimatedDamage?: number;
  /** Estimated resource value destroyed */
  estimatedValue?: number;
}

/**
 * Incoming nuke alert for defense
 */
export interface IncomingNukeAlert {
  /** Room under threat */
  roomName: string;
  /** Nuke landing position */
  landingPos: { x: number; y: number };
  /** Impact tick */
  impactTick: number;
  /** Time to land (ticks remaining) */
  timeToLand: number;
  /** First detection tick */
  detectedAt: number;
  /** Structures in blast radius */
  threatenedStructures?: string[];
  /** Whether evacuation has been triggered */
  evacuationTriggered: boolean;
  /** Identified source room (if known) */
  sourceRoom?: string;
}

/**
 * Nuke economics tracking
 */
export interface NukeEconomics {
  /** Total nukes launched */
  nukesLaunched: number;
  /** Total energy cost (300k per nuke) */
  totalEnergyCost: number;
  /** Total ghodium cost (5k per nuke) */
  totalGhodiumCost: number;
  /** Estimated total damage dealt (hits) */
  totalDamageDealt: number;
  /** Estimated total value destroyed (energy equivalent) */
  totalValueDestroyed: number;
  /** Last calculated ROI (return on investment) */
  lastROI?: number;
  /** Last nuke launch tick */
  lastLaunchTick?: number;
}

/**
 * Squad definition
 */
export interface SquadDefinition {
  /** Squad ID */
  id: string;
  /** Squad type */
  type: "harass" | "raid" | "siege" | "defense";
  /** Member creep names */
  members: string[];
  /** Rally room/flag */
  rallyRoom: string;
  /** Target rooms */
  targetRooms: string[];
  /** Current state */
  state: "gathering" | "moving" | "attacking" | "retreating" | "dissolving";
  /** Creation tick */
  createdAt: number;
  /** Retreat threshold (HP percentage, 0-1) */
  retreatThreshold?: number;
}

/**
 * Squad memory
 */
export interface SquadMemory {
  /** Squad ID */
  id: string;
  /** Squad type */
  type: "harass" | "raid" | "siege" | "defense";
  /** Member creep names */
  members: string[];
  /** Rally room */
  rallyRoom: string;
  /** Rally flag name (optional) */
  rallyFlag?: string;
  /** Target rooms */
  targetRooms: string[];
  /** Current state */
  state: "gathering" | "moving" | "attacking" | "retreating" | "dissolving";
  /** Time budget (ticks until timeout) */
  timeBudget: number;
  /** Created tick */
  createdAt: number;
  /** Retreat condition: min HP percentage */
  retreatThreshold: number;
}
