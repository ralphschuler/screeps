/**
 * Shared types for the blueprint system
 */

/**
 * Evolution stage of a room (from RCL progression)
 */
export type EvolutionStage =
  | "seedNest" // RCL 1-3
  | "foragingExpansion" // RCL 3-4
  | "matureColony" // RCL 4-6
  | "fortifiedHive" // RCL 7-8
  | "empireDominance"; // Multi-room/shard endgame

/**
 * Structure placement entry
 */
export interface StructurePlacement {
  x: number;
  y: number;
  structureType: BuildableStructureConstant;
}

/**
 * Blueprint for a room layout
 */
export interface Blueprint {
  /** Name of the blueprint */
  name: string;
  /** Required RCL */
  rcl: number;
  /** Anchor position (spawn location) */
  anchor: { x: number; y: number };
  /** Structure placements relative to anchor */
  structures: StructurePlacement[];
  /** Road placements relative to anchor */
  roads: { x: number; y: number }[];
  /** Rampart positions relative to anchor */
  ramparts: { x: number; y: number }[];
  /** Blueprint type for terrain validation */
  type?: "bunker" | "spread" | "dynamic";
  /** Minimum required space radius (for terrain validation) */
  minSpaceRadius?: number;
}

/**
 * Result of misplaced structure check
 */
export interface MisplacedStructure {
  structure: Structure;
  reason: string;
}

/**
 * Blueprint efficiency metrics
 */
export interface BlueprintEfficiencyMetrics {
  avgPathLength: number;
  towerCoverage: number;
  defenseScore: number;
  energyEfficiency: number;
  overallScore: number;
  details: {
    pathLengthToController: number;
    pathLengthToSources: number[];
    towerCount: number;
    rampartCount: number;
    linkCount: number;
  };
}

/** Absolute or relative room coordinate. */
export interface BlueprintPoint {
  x: number;
  y: number;
}

export type StampFallbackPolicy =
  | "none"
  | "nearHub"
  | "nearRoad"
  | "nearStorage"
  | "nearController"
  | "nearSource"
  | "nearMineral"
  | "labCluster"
  | "defenseCoverage"
  | "protectedFlexible";

export type StampMemberGroup =
  | "bootstrap"
  | "hub"
  | "extensionPod"
  | "labCluster"
  | "source"
  | "controller"
  | "mineral"
  | "defense"
  | "lateGame";

/** A preferred stamp member. Ramparts are an overlay in `BlueprintPlan.ramparts`. */
export interface StampMember {
  id: string;
  structureType: BuildableStructureConstant;
  dx: number;
  dy: number;
  minRcl: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  priority: number;
  required: boolean;
  group?: StampMemberGroup;
  fallback: StampFallbackPolicy;
  rampart?: boolean;
}

export interface StampRoad {
  id: string;
  dx: number;
  dy: number;
  minRcl: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  priority: number;
}

export interface StampDefinition {
  id: string;
  name: string;
  members: StampMember[];
  roads: StampRoad[];
  ramparts?: BlueprintPoint[];
}

export interface UnplacedDemand {
  structureType: BuildableStructureConstant;
  priority: number;
  sourceStamp?: string;
  fallback: StampFallbackPolicy;
  reason: string;
  localAnchor?: BlueprintPoint;
  minRcl?: number;
}

export type PlannedBy = "fixed" | "stamp" | "fallback";

export interface PlannedStructure extends StructurePlacement {
  minRcl: number;
  priority: number;
  source: string;
  placedBy: PlannedBy;
}

export interface PlannedRoad extends BlueprintPoint {
  minRcl: number;
  priority: number;
  source: string;
}

export interface PlannedRampart extends BlueprintPoint {
  minRcl: number;
  priority: number;
  source: string;
}

export interface BlueprintExistingPlacement extends StructurePlacement {
  id?: string;
}

export interface BlueprintTerrainLike {
  get(x: number, y: number): number;
}

export interface BlueprintRoomFacts {
  roomName: string;
  rcl: number;
  terrain: BlueprintTerrainLike | Map<string, number>;
  controller?: BlueprintPoint;
  sources?: BlueprintPoint[];
  mineral?: BlueprintPoint;
  anchor?: BlueprintPoint;
  existingStructures?: BlueprintExistingPlacement[];
  existingConstructionSites?: BlueprintExistingPlacement[];
}

export interface BlueprintPlanError {
  type: "RCL_LIMIT_EXCEEDED" | "UNPLACEABLE_STRUCTURE" | "TERRAIN_WALL" | "DUPLICATE_STRUCTURE";
  structureType?: BuildableStructureConstant;
  x?: number;
  y?: number;
  reason: string;
  rcl: number;
}

export interface BlueprintPlan {
  roomName: string;
  rcl: number;
  anchor: BlueprintPoint;
  structures: PlannedStructure[];
  roads: PlannedRoad[];
  ramparts: PlannedRampart[];
  unplaced: UnplacedDemand[];
  errors: BlueprintPlanError[];
  stamps: string[];
  version: string;
}

export interface BlueprintPlanValidation {
  ok: boolean;
  errors: BlueprintPlanError[];
  counts: Partial<Record<BuildableStructureConstant, number>>;
}
