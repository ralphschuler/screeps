import "./visuals/roomVisualExtensions";
import { ErrorMapper } from "utils/ErrorMapper";
import { registerAllConsoleCommands } from "./core/consoleCommands";
import { loop as swarmLoop } from "./SwarmBot";
import { createLogger } from "./core/logger";
import { getConfig } from "./config";

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
    resourceTransfers?: Array<{
      from: string;
      to: string;
      resource: ResourceConstant;
      amount: number;
      scheduledTick: number;
    }>;
    /** Alliance diplomacy tracking */
    allianceDiplomacy?: {
      playerReputations: Record<string, any>;
      lastProcessedTick: number;
    };
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
    /** Overmind memory - deprecated, use empire instead */
    overmind?: any;
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
      npcRooms: Record<string, any>;
      activeQuests: Record<string, any>;
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

// Load integration tests if available
try {
  const { loadIntegrationTests } = require("./tests/loader");
  loadIntegrationTests();
  logger.info("Integration tests loaded successfully");
} catch (error) {
  logger.debug(`Integration tests not loaded: ${String(error)}`);
}

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
