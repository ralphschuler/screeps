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
