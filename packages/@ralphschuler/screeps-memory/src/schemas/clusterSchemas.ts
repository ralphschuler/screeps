/**
 * Cluster/Colony-level memory schemas for inter-room coordination
 * Manages coordination between capital and support rooms within a cluster
 */

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
