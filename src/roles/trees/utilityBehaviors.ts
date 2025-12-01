/**
 * Utility Role Behaviors
 *
 * Behavior functions for utility and support creep roles.
 * Includes scouting, claiming, engineering, and remote operations.
 */

import type { SwarmAction, SwarmCreepContext } from "./context";
import type { RoomIntel } from "../../memory/schemas";

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get overmind memory
 */
function getOvermind(): Record<string, unknown> {
  const mem = Memory as unknown as Record<string, unknown>;
  if (!mem.overmind) {
    mem.overmind = {
      roomsSeen: {},
      roomIntel: {},
      claimQueue: [],
      warTargets: [],
      nukeCandidates: [],
      powerBanks: [],
      objectives: {
        targetPowerLevel: 0,
        targetRoomCount: 1,
        warMode: false,
        expansionPaused: false
      },
      lastRun: 0
    };
  }
  return mem.overmind as Record<string, unknown>;
}

/**
 * Record room intel
 */
function recordRoomIntel(room: Room, overmind: Record<string, unknown>): void {
  const roomsSeen = overmind.roomsSeen as Record<string, number>;
  const roomIntel = overmind.roomIntel as Record<string, RoomIntel>;

  roomsSeen[room.name] = Game.time;

  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  const controller = room.controller;
  const hostiles = room.find(FIND_HOSTILE_CREEPS);

  // Determine terrain type
  const terrain = room.getTerrain();
  let swampCount = 0;
  let plainCount = 0;
  for (let x = 0; x < 50; x += 5) {
    for (let y = 0; y < 50; y += 5) {
      const t = terrain.get(x, y);
      if (t === TERRAIN_MASK_SWAMP) swampCount++;
      else if (t === 0) plainCount++;
    }
  }
  const terrainType = swampCount > plainCount * 2 ? "swamp" : plainCount > swampCount * 2 ? "plains" : "mixed";

  // Check for highway/SK
  const coordMatch = room.name.match(/^[WE](\d+)[NS](\d+)$/);
  const isHighway = coordMatch
    ? parseInt(coordMatch[1]!, 10) % 10 === 0 || parseInt(coordMatch[2]!, 10) % 10 === 0
    : false;
  const isSK = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_KEEPER_LAIR }).length > 0;

  const intel: RoomIntel = {
    name: room.name,
    lastSeen: Game.time,
    sources: sources.length,
    controllerLevel: controller?.level ?? 0,
    threatLevel: hostiles.length > 5 ? 3 : hostiles.length > 2 ? 2 : hostiles.length > 0 ? 1 : 0,
    scouted: true,
    terrain: terrainType,
    isHighway,
    isSK
  };

  if (controller?.owner?.username) {
    intel.owner = controller.owner.username;
  }
  if (controller?.reservation?.username) {
    intel.reserver = controller.reservation.username;
  }
  if (mineral?.mineralType) {
    intel.mineralType = mineral.mineralType;
  }

  roomIntel[room.name] = intel;
}

/**
 * Find next room to explore
 */
function findNextExploreTarget(currentRoom: string, overmind: Record<string, unknown>): string | undefined {
  const roomsSeen = overmind.roomsSeen as Record<string, number>;
  const exits = Game.map.describeExits(currentRoom);
  if (!exits) return undefined;

  const candidates: { room: string; lastSeen: number }[] = [];

  for (const [, roomName] of Object.entries(exits)) {
    const lastSeen = roomsSeen[roomName] ?? 0;
    if (Game.time - lastSeen > 1000) {
      candidates.push({ room: roomName, lastSeen });
    }
  }

  candidates.sort((a, b) => a.lastSeen - b.lastSeen);
  return candidates[0]?.room;
}

/**
 * Find unexplored position in room
 */
function findUnexploredPosition(room: Room): RoomPosition | null {
  const positions = [
    new RoomPosition(5, 5, room.name),
    new RoomPosition(44, 5, room.name),
    new RoomPosition(5, 44, room.name),
    new RoomPosition(44, 44, room.name),
    new RoomPosition(25, 25, room.name)
  ];

  const terrain = room.getTerrain();
  for (const pos of positions) {
    if (terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL) {
      return pos;
    }
  }

  return null;
}

// =============================================================================
// ScoutAnt - Room exploration
// =============================================================================

export function evaluateScout(ctx: SwarmCreepContext): SwarmAction {
  const overmind = getOvermind();

  // Record current room intel
  recordRoomIntel(ctx.room, overmind);

  // Get target room or find next unexplored
  let targetRoom: string | undefined = ctx.memory.targetRoom;

  if (!targetRoom || ctx.room.name === targetRoom) {
    targetRoom = findNextExploreTarget(ctx.room.name, overmind);
    if (targetRoom) {
      ctx.memory.targetRoom = targetRoom;
    } else {
      delete ctx.memory.targetRoom;
    }
  }

  if (targetRoom && ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  if (targetRoom && ctx.room.name === targetRoom) {
    // Explore the room
    const unexplored = findUnexploredPosition(ctx.room);
    if (unexplored) {
      return { type: "moveTo", target: unexplored };
    }
    // Room fully explored
    delete ctx.memory.targetRoom;
  }

  return { type: "idle" };
}

// =============================================================================
// ClaimAnt - Claiming/reserving rooms
// =============================================================================

export function evaluateClaimer(ctx: SwarmCreepContext): SwarmAction {
  const targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn) {
      return { type: "moveTo", target: spawn };
    }
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // In target room - claim or reserve controller
  const controller = ctx.room.controller;
  if (!controller) return { type: "idle" };

  const task = ctx.memory.task;

  if (task === "claim") {
    return { type: "claim", target: controller };
  } else if (task === "reserve") {
    return { type: "reserve", target: controller };
  } else if (task === "attack") {
    return { type: "attackController", target: controller };
  } else {
    // Default to reserve
    return { type: "reserve", target: controller };
  }
}

// =============================================================================
// Engineer - Repairs and ramparts
// =============================================================================

export function evaluateEngineer(ctx: SwarmCreepContext): SwarmAction {
  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Priority 1: Critical structures (low HP)
    const critical = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_TOWER ||
          s.structureType === STRUCTURE_STORAGE) &&
        s.hits < s.hitsMax * 0.5
    });

    if (critical) {
      return { type: "repair", target: critical };
    }

    // Priority 2: Roads and containers
    const infrastructure = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) && s.hits < s.hitsMax * 0.75
    });

    if (infrastructure) {
      return { type: "repair", target: infrastructure };
    }

    // Priority 3: Ramparts (maintain up to 100k hits)
    const rampart = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_RAMPART && (s ).hits < 100000
    }) ;

    if (rampart) {
      return { type: "repair", target: rampart };
    }

    // Priority 4: Walls
    const wall = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_WALL && s.hits < 100000
    });

    if (wall) {
      return { type: "repair", target: wall };
    }

    // Priority 5: Build construction sites
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    return { type: "idle" };
  } else {
    // Get energy
    if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    if (ctx.containers.length > 0) {
      const closest = ctx.creep.pos.findClosestByRange(ctx.containers);
      if (closest) {
        return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
      }
    }

    return { type: "idle" };
  }
}

// =============================================================================
// RemoteWorker - Remote mining
// =============================================================================

export function evaluateRemoteWorker(ctx: SwarmCreepContext): SwarmAction {
  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Update working state
  if (ctx.isEmpty) {
    ctx.memory.working = false;
  }
  if (ctx.isFull) {
    ctx.memory.working = true;
  }

  if (ctx.memory.working) {
    // Return home to deliver
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }

    // Deliver to storage or spawn
    const target = ctx.storage ?? ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (target) {
      return { type: "transfer", target: target as AnyStoreStructure, resourceType: RESOURCE_ENERGY };
    }

    return { type: "idle" };
  } else {
    // Go to remote room and harvest
    if (ctx.room.name !== targetRoom) {
      return { type: "moveToRoom", roomName: targetRoom };
    }

    // In remote room - harvest
    const source = ctx.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (source) {
      return { type: "harvest", target: source };
    }

    return { type: "idle" };
  }
}

// =============================================================================
// LinkManager
// =============================================================================

export function evaluateLinkManager(ctx: SwarmCreepContext): SwarmAction {
  const links = ctx.room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LINK
  }) as StructureLink[];

  if (links.length < 2 || !ctx.storage) return { type: "idle" };

  const storageLink = links.find(l => l.pos.getRangeTo(ctx.storage!) <= 2);
  if (!storageLink) return { type: "idle" };

  // Check if storageLink needs emptying
  if (storageLink.store.getUsedCapacity(RESOURCE_ENERGY) > 400) {
    if (ctx.creep.store.getFreeCapacity() > 0) {
      return { type: "withdraw", target: storageLink, resourceType: RESOURCE_ENERGY };
    } else {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }
  }

  // Wait near storage
  if (ctx.creep.pos.getRangeTo(ctx.storage) > 2) {
    return { type: "moveTo", target: ctx.storage };
  }

  return { type: "idle" };
}

// =============================================================================
// TerminalManager
// =============================================================================

export function evaluateTerminalManager(ctx: SwarmCreepContext): SwarmAction {
  if (!ctx.terminal || !ctx.storage) return { type: "idle" };

  const terminalEnergy = ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
  const storageEnergy = ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY);
  const targetTerminalEnergy = 50000;

  if (ctx.creep.store.getUsedCapacity() > 0) {
    // Deliver what we're carrying
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;

    if (resourceType === RESOURCE_ENERGY) {
      if (terminalEnergy < targetTerminalEnergy) {
        return { type: "transfer", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
      } else {
        return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
      }
    } else {
      // Non-energy resources go to terminal for trading
      return { type: "transfer", target: ctx.terminal, resourceType };
    }
  } else {
    // Balance resources
    if (terminalEnergy < targetTerminalEnergy - 10000 && storageEnergy > 20000) {
      return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    } else if (terminalEnergy > targetTerminalEnergy + 10000) {
      return { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
    } else {
      // Move excess minerals from storage to terminal
      for (const resourceType of Object.keys(ctx.storage.store) as ResourceConstant[]) {
        if (resourceType !== RESOURCE_ENERGY && ctx.storage.store.getUsedCapacity(resourceType) > 5000) {
          return { type: "withdraw", target: ctx.storage, resourceType };
        }
      }

      // Wait near storage
      if (ctx.creep.pos.getRangeTo(ctx.storage) > 2) {
        return { type: "moveTo", target: ctx.storage };
      }
    }
  }

  return { type: "idle" };
}

// =============================================================================
// Dispatcher
// =============================================================================

const utilityEvaluators: Record<string, (ctx: SwarmCreepContext) => SwarmAction> = {
  scout: evaluateScout,
  claimer: evaluateClaimer,
  engineer: evaluateEngineer,
  remoteWorker: evaluateRemoteWorker,
  linkManager: evaluateLinkManager,
  terminalManager: evaluateTerminalManager
};

export function evaluateUtilityRole(ctx: SwarmCreepContext): SwarmAction {
  const evaluator = utilityEvaluators[ctx.memory.role] ?? evaluateScout;
  return evaluator(ctx);
}
