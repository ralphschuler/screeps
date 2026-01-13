/**
 * Type definitions for @ralphschuler/screeps-empire
 * 
 * These types mirror the memory schemas used in the bot
 * They are duplicated here to avoid circular dependencies
 */

/**
 * Empire-wide memory and objectives
 */
export interface EmpireMemory {
  objectives: {
    warMode: boolean;
    expansionMode: boolean;
    economyMode: boolean;
  };
  warTargets: string[];
  nukeCandidates: Array<{
    roomName: string;
    score: number;
    launched: boolean;
    launchTick: number;
  }>;
  nukesInFlight?: NukeInFlight[];
  incomingNukes?: IncomingNukeAlert[];
  nukeEconomics?: NukeEconomics;
  knownRooms: Record<string, RoomIntel>;
  powerBanks: PowerBankEntry[];
  expansionQueue: ExpansionCandidate[];
  [key: string]: any; // Allow additional properties
}

/**
 * Room intelligence data
 */
export interface RoomIntel {
  roomName: string;
  owner?: string;
  controllerLevel: number;
  lastSeen: number;
  towerCount?: number;
  spawnCount?: number;
  isHighway?: boolean;
  threatLevel: number;
  [key: string]: any;
}

/**
 * Swarm state for a room
 */
export interface SwarmState {
  roomName: string;
  posture: "eco" | "expand" | "defensive" | "war" | "siege" | "evacuate" | "nukePrep";
  pheromones: {
    defense: number;
    siege: number;
    war: number;
    [key: string]: number;
  };
  danger: 0 | 1 | 2 | 3;
  nukeDetected?: boolean;
  eventLog: Array<{
    type: string;
    time: number;
    details: string;
  }>;
  [key: string]: any;
}

/**
 * Cluster memory
 */
export interface ClusterMemory {
  id: string;
  coreRoom: string;
  squads?: SquadDefinition[];
  [key: string]: any;
}

/**
 * Nuke in flight tracking
 */
export interface NukeInFlight {
  id: string;
  sourceRoom: string;
  targetRoom: string;
  targetPos: { x: number; y: number };
  launchTick: number;
  impactTick: number;
  salvoId?: string;
  siegeSquadId?: string;
  estimatedDamage?: number;
  estimatedValue?: number;
}

/**
 * Incoming nuke alert
 */
export interface IncomingNukeAlert {
  roomName: string;
  landingPos: { x: number; y: number };
  impactTick: number;
  timeToLand: number;
  detectedAt: number;
  threatenedStructures?: string[];
  evacuationTriggered: boolean;
  sourceRoom?: string;
}

/**
 * Nuke economics tracking
 */
export interface NukeEconomics {
  nukesLaunched: number;
  totalEnergyCost: number;
  totalGhodiumCost: number;
  totalDamageDealt: number;
  totalValueDestroyed: number;
  lastROI?: number;
  lastLaunchTick?: number;
}

/**
 * Squad definition
 */
export interface SquadDefinition {
  id: string;
  type: "harass" | "raid" | "siege" | "defense";
  members: string[];
  rallyRoom: string;
  targetRooms: string[];
  state: "gathering" | "moving" | "attacking" | "retreating" | "dissolving";
  createdAt: number;
  retreatThreshold?: number;
}

/**
 * Power bank entry
 */
export interface PowerBankEntry {
  roomName: string;
  pos: { x: number; y: number };
  power: number;
  decayTick: number;
  active: boolean;
}

/**
 * Expansion candidate
 */
export interface ExpansionCandidate {
  roomName: string;
  score: number;
  claimed: boolean;
  claimedAt?: number;
}
