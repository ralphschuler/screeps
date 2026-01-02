/**
 * Memory schemas for roles package
 * These are the bot-specific memory types
 */

export interface SquadMemory {
  leader?: string;
  members?: string[];
  targetRoom?: string;
  rallyPoint?: string;
}

export interface SwarmState {
  pheromones?: PheromoneState;
  constructionSites?: number;
  repairTargets?: number;
  danger?: number;
}

export interface PheromoneState {
  needsBuilding?: boolean;
  needsUpgrading?: boolean;
  needsRepairing?: boolean;
  lastUpdated?: number;
}

export interface SwarmCreepMemory extends CreepMemory {
  role: string;
  family?: "economy" | "military" | "utility" | "power";
  homeRoom?: string;
  working?: boolean;
  sourceId?: Id<Source>;
  targetId?: Id<_HasId>;
  state?: CreepState;
  targetRoom?: string;
  squadId?: string;
  task?: string;
  transferRequest?: string;
  lastExploredRoom?: string;
  // Harvester-specific cache
  nearbyContainerId?: Id<StructureContainer>;
  nearbyContainerTick?: number;
  nearbyLinkId?: Id<StructureLink>;
  nearbyLinkTick?: number;
}

export interface CreepState {
  action: string;
  targetId?: Id<_HasId>;
  data?: {
    resourceType?: ResourceConstant;
    [key: string]: unknown;
  };
  targetPos?: { x: number; y: number; roomName: string };
  targetRoom?: string;
  startTick?: number;
  timeout?: number;
}

export interface RoomIntel {
  name?: string;
  owner?: string;
  level?: number;
  hostiles?: number;
  lastScouted?: number;
  lastSeen?: number;
  reserver?: string;
  mineralType?: MineralConstant;
  threatLevel?: number;
  controllerLevel?: number;
}

export interface EmpireMemory {
  rooms?: Record<string, RoomIntel>;
  knownRooms?: Record<string, RoomIntel>;
  expansion?: {
    targetRoom?: string;
    priority?: number;
  };
}
