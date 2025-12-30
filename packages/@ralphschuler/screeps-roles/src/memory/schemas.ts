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
  // Harvester-specific cache
  nearbyContainerId?: Id<StructureContainer>;
  nearbyContainerTick?: number;
  nearbyLinkId?: Id<StructureLink>;
  nearbyLinkTick?: number;
}

export interface CreepState {
  action: string;
  targetId?: Id<_HasId>;
  data?: unknown;
}

export interface RoomIntel {
  owner?: string;
  level?: number;
  hostiles?: number;
  lastScouted?: number;
}

export interface EmpireMemory {
  rooms?: Record<string, RoomIntel>;
  expansion?: {
    targetRoom?: string;
    priority?: number;
  };
}
