/**
 * Empire-level memory schemas
 * Tracks empire-wide state, expansion, and owned rooms
 */

import type { NukeInFlight, IncomingNukeAlert, NukeEconomics } from "./military";
import type { MarketMemory } from "./economy";
import type { SquadDefinition } from "./military";

/** Room intel entry for known rooms */
export interface RoomIntel {
  /** Room name */
  name: string;
  /** Last seen game time */
  lastSeen: number;
  /** Number of sources */
  sources: number;
  /** Controller level (0 if none) */
  controllerLevel: number;
  /** Controller owner username (undefined if unowned) */
  owner?: string;
  /** Controller reserver username */
  reserver?: string;
  /** Mineral type if present */
  mineralType?: MineralConstant;
  /** Threat indicators */
  threatLevel: 0 | 1 | 2 | 3;
  /** Whether room has been fully scouted */
  scouted: boolean;
  /** Terrain type classification */
  terrain: "plains" | "swamp" | "mixed";
  /** Highway room flag */
  isHighway: boolean;
  /** Source keeper room flag */
  isSK: boolean;
  /** Number of towers (for nuke targeting) */
  towerCount?: number;
  /** Number of spawns (for nuke targeting) */
  spawnCount?: number;
  /** Whether room contains portal structures */
  hasPortal?: boolean;
}

/**
 * Expansion candidate with scoring
 */
export interface ExpansionCandidate {
  /** Room name */
  roomName: string;
  /** Expansion score (higher = better) */
  score: number;
  /** Distance from nearest owned room */
  distance: number;
  /** Whether room has been claimed/reserved */
  claimed: boolean;
  /** Last evaluated tick */
  lastEvaluated: number;
}

/**
 * Power bank location tracking
 */
export interface PowerBankEntry {
  /** Room name */
  roomName: string;
  /** Position */
  pos: { x: number; y: number };
  /** Remaining power amount */
  power: number;
  /** Decay tick */
  decayTick: number;
  /** Whether we're actively harvesting */
  active: boolean;
}

/**
 * Owned room entry with role
 */
export interface OwnedRoomEntry {
  /** Room name */
  name: string;
  /** Room role */
  role: "capital" | "core" | "remoteHub" | "forwardBase" | "mineral" | "buffer";
  /** Cluster ID this room belongs to */
  clusterId: string;
  /** RCL */
  rcl: number;
}

/**
 * Empire memory - Global meta-layer state (ROADMAP Section 4)
 * Tracks all colonies, clusters, and empire-wide strategic decisions
 */
export interface EmpireMemory {
  /** Known rooms with intel data */
  knownRooms: Record<string, RoomIntel>;
  /** List of active cluster IDs */
  clusters: string[];
  /** Active war targets (player usernames or room names) */
  warTargets: string[];
  /** Owned rooms with roles and cluster assignments */
  ownedRooms: Record<string, OwnedRoomEntry>;
  /** Claim queue sorted by expansion score */
  claimQueue: ExpansionCandidate[];
  /** Nuke candidates with scores */
  nukeCandidates: { roomName: string; score: number; launched: boolean; launchTick: number }[];
  /** Power bank locations */
  powerBanks: PowerBankEntry[];
  /** Nukes in flight for salvo coordination */
  nukesInFlight?: NukeInFlight[];
  /** Incoming nuke alerts for defense */
  incomingNukes?: IncomingNukeAlert[];
  /** Nuke economics tracking */
  nukeEconomics?: NukeEconomics;
  /** Market intelligence data */
  market?: MarketMemory;
  /** Global strategic objectives */
  objectives: {
    targetPowerLevel: number;
    targetRoomCount: number;
    warMode: boolean;
    expansionPaused: boolean;
  };
  /** Last update tick */
  lastUpdate: number;
}

/**
 * Defense assistance request for cluster coordination
 */
export interface DefenseAssistanceRequest {
  /** Room requesting assistance */
  roomName: string;
  /** Number of guards needed */
  guardsNeeded: number;
  /** Number of rangers needed */
  rangersNeeded: number;
  /** Number of healers needed */
  healersNeeded: number;
  /** Urgency level (1-3) */
  urgency: number;
  /** Game tick when request was created */
  createdAt: number;
  /** Brief description of the threat */
  threat: string;
  /** Creeps assigned to assist (creep names) */
  assignedCreeps: string[];
}

/**
 * Resource transfer request for inter-room resource sharing
 */
export interface ResourceTransferRequest {
  /** Room requesting resources */
  toRoom: string;
  /** Room providing resources */
  fromRoom: string;
  /** Resource type to transfer */
  resourceType: ResourceConstant;
  /** Amount needed */
  amount: number;
  /** Priority (1-5, higher = more urgent) */
  priority: number;
  /** Game tick when request was created */
  createdAt: number;
  /** Creeps assigned to fulfill this request */
  assignedCreeps: string[];
  /** Amount already delivered */
  delivered: number;
}

/**
 * Cluster memory
 */
export interface ClusterMemory {
  /** Cluster ID */
  id: string;
  /** Core room (capital) */
  coreRoom: string;
  /** All member rooms */
  memberRooms: string[];
  /** Remote mining rooms */
  remoteRooms: string[];
  /** Forward base rooms */
  forwardBases: string[];
  /** Cluster role */
  role: "economic" | "war" | "mixed" | "frontier";
  /** Aggregated metrics */
  metrics: {
    /** Total energy income per tick (rolling average) */
    energyIncome: number;
    /** Total energy consumption per tick */
    energyConsumption: number;
    /** Energy surplus/deficit */
    energyBalance: number;
    /** War index (0-100) */
    warIndex: number;
    /** Economy health index (0-100) */
    economyIndex: number;
    /** Military readiness (0-100): availability of military creeps */
    militaryReadiness?: number;
  };
  /** Active squads */
  squads: SquadDefinition[];
  /** Rally points for defense/offense */
  rallyPoints: {
    roomName: string;
    x: number;
    y: number;
    purpose: "defense" | "offense" | "staging" | "retreat";
    createdAt?: number;
    lastUsed?: number;
  }[];
  /** Defense assistance requests from member rooms */
  defenseRequests: DefenseAssistanceRequest[];
  /** Resource transfer requests for inter-room resource sharing */
  resourceRequests: ResourceTransferRequest[];
  /** Room currently being prioritized for upgrading to RCL 8 */
  focusRoom?: string;
  /** Last update tick */
  lastUpdate: number;
}

/**
 * Create default empire memory
 */
export function createDefaultEmpireMemory(): EmpireMemory {
  return {
    knownRooms: {},
    clusters: [],
    warTargets: [],
    ownedRooms: {},
    claimQueue: [],
    nukeCandidates: [],
    powerBanks: [],
    market: undefined, // Initialized lazily
    objectives: {
      targetPowerLevel: 0,
      targetRoomCount: 1,
      warMode: false,
      expansionPaused: false
    },
    lastUpdate: 0
  };
}

/**
 * Create default cluster memory
 */
export function createDefaultClusterMemory(id: string, coreRoom: string): ClusterMemory {
  return {
    id,
    coreRoom,
    memberRooms: [coreRoom],
    remoteRooms: [],
    forwardBases: [],
    role: "economic",
    metrics: {
      energyIncome: 0,
      energyConsumption: 0,
      energyBalance: 0,
      warIndex: 0,
      economyIndex: 50
    },
    squads: [],
    rallyPoints: [],
    defenseRequests: [],
    resourceRequests: [],
    lastUpdate: 0
  };
}
