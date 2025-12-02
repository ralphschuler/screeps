/**
 * Utility Behaviors
 *
 * Behavior functions for utility and support roles.
 * Includes scouting, claiming, engineering, and logistics.
 */

import type { CreepAction, CreepContext } from "./types";
import type { RoomIntel } from "../../memory/schemas";
import { safeFind } from "../../utils/safeFind";

// =============================================================================
// Overmind / Intel Helpers
// =============================================================================

/**
 * Get or initialize overmind memory.
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
 * Record intelligence about a room.
 */
function recordRoomIntel(room: Room, overmind: Record<string, unknown>): void {
  const roomsSeen = overmind.roomsSeen as Record<string, number>;
  const roomIntel = overmind.roomIntel as Record<string, RoomIntel>;

  roomsSeen[room.name] = Game.time;

  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  const controller = room.controller;
  // Use safeFind to handle engine errors with corrupted owner data
  const hostiles = safeFind(room, FIND_HOSTILE_CREEPS);

  // Classify terrain
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

  // Check for highway/source keeper rooms
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

  if (controller?.owner?.username) intel.owner = controller.owner.username;
  if (controller?.reservation?.username) intel.reserver = controller.reservation.username;
  if (mineral?.mineralType) intel.mineralType = mineral.mineralType;

  roomIntel[room.name] = intel;
}

/**
 * Find the next unexplored adjacent room.
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
 * Find a position to explore in a room.
 */
function findExplorePosition(room: Room): RoomPosition | null {
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
// Role Behaviors
// =============================================================================

/**
 * Scout - Explore and map rooms.
 */
export function scout(ctx: CreepContext): CreepAction {
  const overmind = getOvermind();

  // Record current room
  recordRoomIntel(ctx.room, overmind);

  // Find or assign target room
  let targetRoom = ctx.memory.targetRoom;

  if (!targetRoom || ctx.room.name === targetRoom) {
    targetRoom = findNextExploreTarget(ctx.room.name, overmind);
    if (targetRoom) {
      ctx.memory.targetRoom = targetRoom;
    } else {
      delete ctx.memory.targetRoom;
    }
  }

  // Move to target room
  if (targetRoom && ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Explore current room
  if (targetRoom && ctx.room.name === targetRoom) {
    const explorePos = findExplorePosition(ctx.room);
    if (explorePos) return { type: "moveTo", target: explorePos };
    delete ctx.memory.targetRoom;
  }

  return { type: "idle" };
}

/**
 * Claimer - Claim or reserve room controllers.
 * Task can be: "claim", "reserve", or "attack"
 */
export function claimer(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn) return { type: "moveTo", target: spawn };
    return { type: "idle" };
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Act on controller
  const controller = ctx.room.controller;
  if (!controller) return { type: "idle" };

  const task = ctx.memory.task;
  if (task === "claim") return { type: "claim", target: controller };
  if (task === "attack") return { type: "attackController", target: controller };
  return { type: "reserve", target: controller }; // default
}

/**
 * Engineer - Repairs and fortification specialist.
 * Priority: critical structures → infrastructure → ramparts → walls → construction
 * Uses danger level to determine repair targets (Issue #29)
 */
export function engineer(ctx: CreepContext): CreepAction {
  // Update working state
  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;

  if (ctx.memory.working) {
    // Get danger level from swarm state
    const dangerLevel = getDangerLevel(ctx.room);
    const rampartTarget = getRepairTargetByDanger(dangerLevel);

    // Critical structures (low HP spawns, towers, storage)
    const critical = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_TOWER ||
          s.structureType === STRUCTURE_STORAGE) &&
        s.hits < s.hitsMax * 0.5
    });
    if (critical) return { type: "repair", target: critical };

    // Roads and containers
    const infrastructure = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) &&
        s.hits < s.hitsMax * 0.75
    });
    if (infrastructure) return { type: "repair", target: infrastructure };

    // Ramparts (maintain based on danger level)
    const rampart = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_RAMPART && s.hits < rampartTarget
    }) as StructureRampart | null;
    if (rampart) return { type: "repair", target: rampart };

    // Walls (same target as ramparts)
    const wall = ctx.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_WALL && s.hits < rampartTarget
    });
    if (wall) return { type: "repair", target: wall };

    // Construction sites
    if (ctx.prioritizedSites.length > 0) {
      return { type: "build", target: ctx.prioritizedSites[0]! };
    }

    return { type: "idle" };
  }

  // Get energy
  if (ctx.storage && ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  if (ctx.containers.length > 0) {
    const closest = ctx.creep.pos.findClosestByRange(ctx.containers);
    if (closest) return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
  }

  return { type: "idle" };
}

/**
 * Get danger level from room's swarm state
 */
function getDangerLevel(room: Room): 0 | 1 | 2 | 3 {
  const mem = room.memory as unknown as { swarm?: { danger?: 0 | 1 | 2 | 3 } };
  return mem.swarm?.danger ?? 0;
}

/**
 * Get repair target hits based on danger level (Issue #29)
 * danger 0: 100k
 * danger 1: 300k
 * danger 2: 5M
 * danger 3: 50M+
 */
function getRepairTargetByDanger(danger: 0 | 1 | 2 | 3): number {
  switch (danger) {
    case 0:
      return 100000;
    case 1:
      return 300000;
    case 2:
      return 5000000;
    case 3:
      return 50000000;
    default:
      return 100000;
  }
}

/**
 * RemoteWorker - Harvest in remote rooms.
 */
export function remoteWorker(ctx: CreepContext): CreepAction {
  const targetRoom = ctx.memory.targetRoom ?? ctx.homeRoom;

  // Update working state
  if (ctx.isEmpty) ctx.memory.working = false;
  if (ctx.isFull) ctx.memory.working = true;

  if (ctx.memory.working) {
    // Return home to deliver
    if (ctx.room.name !== ctx.homeRoom) {
      return { type: "moveToRoom", roomName: ctx.homeRoom };
    }

    // Deliver to storage (preferred) or spawn
    if (ctx.storage) {
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn) {
      return { type: "transfer", target: spawn, resourceType: RESOURCE_ENERGY };
    }

    return { type: "idle" };
  }

  // Go to remote room and harvest
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  const source = ctx.creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
  if (source) return { type: "harvest", target: source };

  return { type: "idle" };
}

/**
 * LinkManager - Transfer energy between links and storage.
 */
export function linkManager(ctx: CreepContext): CreepAction {
  const links = ctx.room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_LINK
  }) as StructureLink[];

  if (links.length < 2 || !ctx.storage) return { type: "idle" };

  const storageLink = links.find(l => l.pos.getRangeTo(ctx.storage!) <= 2);
  if (!storageLink) return { type: "idle" };

  // Empty storage link when it has energy
  if (storageLink.store.getUsedCapacity(RESOURCE_ENERGY) > 400) {
    if (ctx.creep.store.getFreeCapacity() > 0) {
      return { type: "withdraw", target: storageLink, resourceType: RESOURCE_ENERGY };
    }
    return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }

  // Wait near storage
  if (ctx.creep.pos.getRangeTo(ctx.storage) > 2) {
    return { type: "moveTo", target: ctx.storage };
  }

  return { type: "idle" };
}

/**
 * TerminalManager - Balance resources between storage and terminal.
 */
export function terminalManager(ctx: CreepContext): CreepAction {
  if (!ctx.terminal || !ctx.storage) return { type: "idle" };

  const terminalEnergy = ctx.terminal.store.getUsedCapacity(RESOURCE_ENERGY);
  const storageEnergy = ctx.storage.store.getUsedCapacity(RESOURCE_ENERGY);
  const targetTerminalEnergy = 50000;

  // Deliver carried resources
  if (ctx.creep.store.getUsedCapacity() > 0) {
    const resourceType = Object.keys(ctx.creep.store)[0] as ResourceConstant;

    if (resourceType === RESOURCE_ENERGY) {
      if (terminalEnergy < targetTerminalEnergy) {
        return { type: "transfer", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
      }
      return { type: "transfer", target: ctx.storage, resourceType: RESOURCE_ENERGY };
    }

    // Non-energy goes to terminal for trading
    return { type: "transfer", target: ctx.terminal, resourceType };
  }

  // Balance energy between storage and terminal
  if (terminalEnergy < targetTerminalEnergy - 10000 && storageEnergy > 20000) {
    return { type: "withdraw", target: ctx.storage, resourceType: RESOURCE_ENERGY };
  }
  if (terminalEnergy > targetTerminalEnergy + 10000) {
    return { type: "withdraw", target: ctx.terminal, resourceType: RESOURCE_ENERGY };
  }

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

  return { type: "idle" };
}

/**
 * Reserver - Reserve controllers in remote rooms.
 * Keeps reservation ticks high to maintain 3000 energy capacity on sources.
 */
export function reserver(ctx: CreepContext): CreepAction {
  let targetRoom = ctx.memory.targetRoom;

  if (!targetRoom) {
    // Try to find an assigned remote room from home room's swarm state
    const homeRoom = Game.rooms[ctx.homeRoom];
    if (homeRoom?.memory) {
      const swarm = (homeRoom.memory as unknown as { swarm?: { remoteAssignments?: string[] } }).swarm;
      if (swarm?.remoteAssignments && swarm.remoteAssignments.length > 0) {
        ctx.memory.targetRoom = swarm.remoteAssignments[0];
        targetRoom = ctx.memory.targetRoom;
      }
    }
    if (!targetRoom) {
      return { type: "idle" };
    }
  }

  // Move to target room
  if (ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // Reserve the controller
  const controller = ctx.room.controller;
  if (!controller) return { type: "idle" };

  // Already owned - shouldn't be here
  if (controller.my) {
    delete ctx.memory.targetRoom;
    return { type: "idle" };
  }

  // Reserve it
  return { type: "reserve", target: controller };
}

/**
 * Defender - Emergency defensive creep.
 * Attacks hostiles in room, prioritizing healers.
 */
export function defender(ctx: CreepContext): CreepAction {
  // Find hostiles - use safeFind to handle engine errors
  const hostiles = safeFind(ctx.room, FIND_HOSTILE_CREEPS);

  if (hostiles.length === 0) {
    // No hostiles - patrol near spawn
    const spawn = ctx.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
    if (spawn && ctx.creep.pos.getRangeTo(spawn) > 5) {
      return { type: "moveTo", target: spawn };
    }
    return { type: "idle" };
  }

  // Prioritize targets: healers > ranged > melee
  const target = selectDefenderTarget(hostiles);
  if (target) {
    return { type: "attack", target };
  }

  return { type: "idle" };
}

/**
 * Select target for defender (prioritize by threat)
 */
function selectDefenderTarget(hostiles: Creep[]): Creep | null {
  const sorted = hostiles.sort((a, b) => {
    const scoreA = getHostileThreatScore(a);
    const scoreB = getHostileThreatScore(b);
    return scoreB - scoreA;
  });
  return sorted[0] ?? null;
}

/**
 * Get threat score for hostile targeting
 */
function getHostileThreatScore(hostile: Creep): number {
  let score = 0;
  for (const part of hostile.body) {
    if (!part.hits) continue;
    switch (part.type) {
      case HEAL:
        score += 100;
        break;
      case RANGED_ATTACK:
        score += 50;
        break;
      case ATTACK:
        score += 40;
        break;
      case CLAIM:
        score += 60;
        break;
      case WORK:
        score += 30;
        break;
    }
    if (part.boost) score += 20;
  }
  return score;
}

// =============================================================================
// Role Dispatcher
// =============================================================================

const utilityBehaviors: Record<string, (ctx: CreepContext) => CreepAction> = {
  scout,
  claimer,
  engineer,
  remoteWorker,
  linkManager,
  terminalManager,
  reserver,
  defender
};

/**
 * Evaluate and return an action for a utility role creep.
 */
export function evaluateUtilityBehavior(ctx: CreepContext): CreepAction {
  const behavior = utilityBehaviors[ctx.memory.role] ?? scout;
  return behavior(ctx);
}
