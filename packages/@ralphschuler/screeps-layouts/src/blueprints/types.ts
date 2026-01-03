/**
 * Shared types for the blueprint system
 */

import type { EvolutionStage } from "../../memory/schemas";

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

export type { EvolutionStage };
