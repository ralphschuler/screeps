/**
 * Creep Behavior Types
 *
 * Simple type definitions for creep actions and context.
 * This module provides a clean, human-readable interface for creep decision making.
 */

import type { SquadMemory, SwarmCreepMemory, SwarmState } from "../../memory/schemas";

/**
 * All possible actions a creep can perform.
 * Each action is a simple object describing what the creep should do.
 */
export type CreepAction =
  // Resource gathering actions
  | { type: "harvest"; target: Source }
  | { type: "harvestMineral"; target: Mineral }
  | { type: "harvestDeposit"; target: Deposit }
  | { type: "pickup"; target: Resource }
  | { type: "withdraw"; target: AnyStoreStructure | Tombstone | Ruin; resourceType: ResourceConstant }

  // Resource delivery actions
  | { type: "transfer"; target: AnyStoreStructure; resourceType: ResourceConstant }
  | { type: "drop"; resourceType: ResourceConstant }

  // Construction and maintenance actions
  | { type: "build"; target: ConstructionSite }
  | { type: "repair"; target: Structure }
  | { type: "upgrade"; target: StructureController }
  | { type: "dismantle"; target: Structure }

  // Combat actions
  | { type: "attack"; target: Creep | Structure }
  | { type: "rangedAttack"; target: Creep | Structure }
  | { type: "heal"; target: Creep }
  | { type: "rangedHeal"; target: Creep }

  // Controller actions
  | { type: "claim"; target: StructureController }
  | { type: "reserve"; target: StructureController }
  | { type: "attackController"; target: StructureController }

  // Movement actions
  | { type: "moveTo"; target: RoomPosition | RoomObject }
  | { type: "moveToRoom"; roomName: string }
  | { type: "flee"; from: RoomPosition[] }
  | { type: "wait"; position: RoomPosition }

  // No-op action
  | { type: "idle" };

/**
 * Context containing all information a creep needs to make decisions.
 * Pre-computed values avoid redundant room.find() calls.
 */
export interface CreepContext {
  // Core references
  creep: Creep;
  room: Room;
  memory: SwarmCreepMemory;

  // Room state
  swarmState: SwarmState | undefined;
  squadMemory: SquadMemory | undefined;

  // Location info
  homeRoom: string;
  targetRoom: string | undefined;
  isInHomeRoom: boolean;
  isInTargetRoom: boolean;

  // Creep state
  isFull: boolean;
  isEmpty: boolean;
  isWorking: boolean;

  // Assigned targets
  assignedSource: Source | null;
  assignedMineral: Mineral | null;

  // Room analysis (pre-computed for efficiency)
  energyAvailable: boolean;
  nearbyEnemies: boolean;
  constructionSiteCount: number;
  damagedStructureCount: number;

  // Cached room objects
  droppedResources: Resource[];
  containers: StructureContainer[];
  /** Containers with free capacity for depositing energy */
  depositContainers: StructureContainer[];
  spawnStructures: (StructureSpawn | StructureExtension)[];
  towers: StructureTower[];
  storage: StructureStorage | undefined;
  terminal: StructureTerminal | undefined;
  hostiles: Creep[];
  damagedAllies: Creep[];
  prioritizedSites: ConstructionSite[];
  repairTargets: Structure[];
  labs: StructureLab[];
  factory: StructureFactory | undefined;
}

/**
 * A behavior function takes a context and returns an action.
 * This is the core abstraction for all creep decision making.
 */
export type BehaviorFunction = (ctx: CreepContext) => CreepAction;
