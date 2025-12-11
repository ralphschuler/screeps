// Initialize RoomVisual extensions from screepers/RoomVisual
import "./visuals/roomVisualExtensions";
import { ErrorMapper } from "utils/ErrorMapper";
import { registerAllConsoleCommands } from "./core/consoleCommands";
import { loop as swarmLoop } from "./SwarmBot";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    /** Heap cache persistence storage */
    _heapCache?: {
      version: number;
      lastSync: number;
      data: Record<string, { value: any; lastModified: number; ttl?: number }>;
    };
    /** Resource transfer queue for Screepers Standards SS2 protocol */
    resourceTransfers?: Array<{
      from: string;
      to: string;
      resource: ResourceConstant;
      amount: number;
      scheduledTick: number;
    }>;
    // TODO: Add memory migration version tracking field to support future schema changes
    // memoryVersion?: number;
    // TODO: Consider adding shard coordination memory for multi-shard operations (ROADMAP Section 11)
    // interShardCoordination?: { shardRoles: Record<string, ShardRole>; lastUpdate: number; };
    // TODO: Add global empire state for tracking all colonies and clusters (ROADMAP Section 4)
    // empire?: { knownRooms: Record<string, RoomIntel>; clusters: string[]; warTargets: string[]; };
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    homeRoom?: string;
    targetRoom?: string;
    targetId?: string;
    sourceId?: string;
    squadId?: string;
    state?: string;
    task?: string;
    lastExploredRoom?: string;
    // TODO: Add path caching for frequently used routes (ROADMAP Section 20)
    // _path?: string; // Serialized path string for reuse
    // _pathTick?: number; // Tick when path was calculated
    // TODO: Add stuck detection tracking to improve movement recovery
    // _stuckCount?: number; // Consecutive ticks the creep hasn't moved
    // _lastPos?: string; // Serialized position from last tick
    // TODO: Consider adding role-specific efficiency metrics for performance analysis
    // _metrics?: { tasksCompleted: number; energyTransferred: number; };
  }

  interface RoomMemory {
    /** Flag indicating room is hostile (has enemy towers or attackers) */
    hostile?: boolean;
  }

}

// =============================================================================
// Console Commands Registration
// =============================================================================
// All console commands are now registered using the @Command decorator in
// src/core/consoleCommands.ts. This provides:
// - Automatic help() command with all registered commands
// - Consistent command metadata (description, usage, examples)
// - Centralized command management via CommandRegistry
//
// To add new commands, create a class with @Command decorated methods
// and register it in registerAllConsoleCommands()
// =============================================================================

// TODO: Consider lazy loading console commands to reduce initial load time
// Only register commands when first accessed or on-demand via a flag
// This could save CPU on initialization for bots that rarely use console

// Register all console commands (must be done before game loop starts)
registerAllConsoleCommands();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Run the SwarmBot main loop
  swarmLoop();
});
