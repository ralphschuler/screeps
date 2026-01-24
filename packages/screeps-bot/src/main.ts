import "./visuals/roomVisualExtensions";
import { ErrorMapper } from "utils/legacy";
import { getConfig } from "./config";
import { registerAllConsoleCommands } from "./core/consoleCommands";
import { createLogger } from "./core/logger";
import { loop as swarmLoop } from "./SwarmBot";

const logger = createLogger("Main");

declare global {
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
    resourceTransfers?: {
      from: string;
      to: string;
      resource: ResourceConstant;
      amount: number;
      scheduledTick: number;
    }[];
    /** SS2 Terminal Communications multi-packet queue */
    ss2PacketQueue?: Record<string, {
      terminalId: Id<StructureTerminal>;
      targetRoom: string;
      resourceType: ResourceConstant;
      amount: number;
      packets: string[];
      nextPacketIndex: number;
      queuedAt: number;
    }>;
    memoryVersion?: number;
    // Multi-shard coordination memory (ROADMAP Section 11 - IMPLEMENTED)
    // Note: InterShardMemory is used for cross-shard coordination, not Memory
    // See src/intershard/shardManager.ts for implementation
    /** Global empire state for tracking all colonies and clusters (ROADMAP Section 4) */
    empire?: {
      knownRooms: Record<string, any>;
      clusters: string[];
      warTargets: string[];
      ownedRooms: Record<string, any>;
      claimQueue: any[];
      nukeCandidates: any[];
      powerBanks: any[];
      market?: any;
      objectives: {
        targetPowerLevel: number;
        targetRoomCount: number;
        warMode: boolean;
        expansionPaused: boolean;
      };
      lastUpdate: number;
    };
    /** Clusters memory */
    clusters?: Record<string, any>;
    /** TooAngel diplomacy and quest system */
    tooangel?: {
      enabled: boolean;
      reputation: {
        value: number;
        lastUpdated: number;
        lastRequestedAt?: number;
      };
      npcRooms: Record<string, {
        roomName: string;
        lastSeen: number;
        hasTerminal: boolean;
        availableQuests: string[];
      }>;
      activeQuests: Record<string, {
        id: string;
        type: string;
        status: string;
        targetRoom: string;
        originRoom: string;
        deadline: number;
        appliedAt?: number;
        receivedAt?: number;
        completedAt?: number;
        assignedCreeps?: string[];
      }>;
      completedQuests: string[];
      lastProcessedTick: number;
    };
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
    /** Role-specific efficiency metrics */
    _metrics?: {
      tasksCompleted: number;
      energyTransferred: number;
      energyHarvested: number;
      buildProgress: number;
      repairProgress: number;
      damageDealt: number;
      healingDone: number;
    };
  }

  interface RoomMemory {
    hostile?: boolean;
  }

}

// Console commands registered via @Command decorator (see consoleCommands.ts)
const config = getConfig();
registerAllConsoleCommands(config.lazyLoadConsoleCommands);

// Note: Integration tests are excluded from production builds
// Tests are located in src/tests/ and can be loaded separately in test environments
// See packages/screeps-bot/test/ for unit tests and integration testing setup

export const loop = ErrorMapper.wrapLoop(() => {
  try {
    swarmLoop();
  } catch (error) {
    logger.error(`Critical error in main loop: ${String(error)}`, {
      meta: {
        stack: error instanceof Error ? error.stack : undefined,
        tick: Game.time
      }
    });
    throw error;
  }
});
