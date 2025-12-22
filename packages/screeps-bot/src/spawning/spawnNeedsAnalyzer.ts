/**
 * Spawn Needs Analyzer Module
 * 
 * Determines whether a room needs to spawn a specific role based on:
 * - Current creep counts
 * - Room conditions and available structures
 * - Remote room assignments and needs
 * - Special role requirements
 */

import type { SwarmState, SwarmCreepMemory } from "../memory/schemas";
import { ROLE_DEFINITIONS } from "./roleDefinitions";
import { memoryManager } from "../memory/manager";
import { calculateRemoteHaulerRequirement } from "../empire/remoteHaulerDimensioning";
import { resourceTransferCoordinator, type CrossShardTransferRequest } from "../intershard/resourceTransferCoordinator";
import { cachedFindSources, cachedRoomFind } from "../utils/caching";

/** Number of dangerous hostiles per remote guard needed */
const THREATS_PER_GUARD = 2;

/** Reservation threshold in ticks - trigger renewal below this */
const RESERVATION_THRESHOLD_TICKS = 3000;

/** Maximum number of carriers that can be assigned to a single cross-shard transfer request */
export const MAX_CARRIERS_PER_CROSS_SHARD_REQUEST = 3;

/** Focus room upgrader limits by RCL */
const FOCUS_ROOM_UPGRADER_LIMITS = {
  EARLY: 2,
  MID: 4,
  LATE: 6
} as const;

/**
 * Creep count cache (cleared each tick) to avoid repeated iteration.
 * OPTIMIZATION: With multiple spawns per room, this prevents redundant creep iteration.
 * 
 * Cache structure:
 * - Key format for normal count: `roomName` or `roomName_active`
 * - Key format for role count: `roomName:role` (counts specific role from a home room)
 */
const creepCountCache = new Map<string, Map<string, number> | number>();
let creepCountCacheTick = -1;
let creepCountCacheRef: Record<string, Creep> | null = null;

/**
 * Count creeps by role in a room with per-tick caching.
 * @param roomName - Name of the room to count creeps for
 * @param activeOnly - If true, only count non-spawning creeps
 */
export function countCreepsByRole(roomName: string, activeOnly = false): Map<string, number> {
  // Clear cache if new tick or Game.creeps reference changed
  if (creepCountCacheTick !== Game.time || creepCountCacheRef !== Game.creeps) {
    creepCountCache.clear();
    creepCountCacheTick = Game.time;
    creepCountCacheRef = Game.creeps;
  }

  const cacheKey = activeOnly ? `${roomName}_active` : roomName;
  
  const cached = creepCountCache.get(cacheKey);
  if (cached && cached instanceof Map) {
    return cached;
  }

  const counts = new Map<string, number>();

  // OPTIMIZATION: Use for-in loop to avoid creating temporary array
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName) {
      if (activeOnly && creep.spawning) {
        continue;
      }
      
      const role = memory.role ?? "unknown";
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  creepCountCache.set(cacheKey, counts);
  return counts;
}

/**
 * Count creeps of a specific role from a home room (cached).
 * More efficient than countCreepsByRole().get(role) when you only need one role.
 * @param roomName - Home room name
 * @param role - Role to count
 */
export function countCreepsOfRole(roomName: string, role: string): number {
  // Clear cache if new tick
  if (creepCountCacheTick !== Game.time || creepCountCacheRef !== Game.creeps) {
    creepCountCache.clear();
    creepCountCacheTick = Game.time;
    creepCountCacheRef = Game.creeps;
  }

  const cacheKey = `${roomName}:${role}`;
  const cached = creepCountCache.get(cacheKey);
  if (typeof cached === "number") {
    return cached;
  }

  // Count creeps with this role from this home room
  let count = 0;
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === roomName && memory.role === role) {
      count++;
    }
  }

  creepCountCache.set(cacheKey, count);
  return count;
}

/**
 * Count remote creeps assigned to a specific target room
 */
export function countRemoteCreepsByTargetRoom(homeRoom: string, role: string, targetRoom: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    const memory = creep.memory as unknown as SwarmCreepMemory;
    if (memory.homeRoom === homeRoom && memory.role === role && memory.targetRoom === targetRoom) {
      count++;
    }
  }
  return count;
}

/**
 * Get the remote room that needs workers of a given role.
 */
export function getRemoteRoomNeedingWorkers(homeRoom: string, role: string, swarm: SwarmState): string | null {
  const remoteAssignments = swarm.remoteAssignments ?? [];
  if (remoteAssignments.length === 0) return null;

  for (const remoteRoom of remoteAssignments) {
    const currentCount = countRemoteCreepsByTargetRoom(homeRoom, role, remoteRoom);
    const room = Game.rooms[remoteRoom];
    
    let maxPerRemote: number;
    
    if (role === "remoteHarvester") {
      if (room) {
        const sources = cachedFindSources(room);
        maxPerRemote = sources.length;
      } else {
        maxPerRemote = 2;
      }
    } else if (role === "remoteHauler") {
      if (room) {
        const sources = cachedFindSources(room);
        const sourceCount = sources.length;
        
        const energyCapacity = Game.rooms[homeRoom]?.energyCapacityAvailable ?? 800;
        const requirement = calculateRemoteHaulerRequirement(homeRoom, remoteRoom, sourceCount, energyCapacity);
        maxPerRemote = requirement.recommendedHaulers;
      } else {
        maxPerRemote = 2;
      }
    } else {
      maxPerRemote = 2;
    }
    
    if (currentCount < maxPerRemote) {
      return remoteRoom;
    }
  }

  return null;
}

/**
 * Assign target room to remote role creep memory.
 * 
 * Handles target room assignment for remote roles (remoteHarvester, remoteHauler, remoteWorker).
 * For remoteHarvester and remoteHauler, finds a remote room that needs more workers of that role.
 * For remoteWorker, uses load balancing to assign to the remote room with fewest workers.
 * 
 * @param role - The role to assign a target room for
 * @param memory - The creep memory to update with targetRoom
 * @param swarm - The swarm state containing remote assignments
 * @param homeRoom - The home room name for the creep
 * @returns true if assignment successful or not needed, false if no target available
 */
export function assignRemoteTargetRoom(role: string, memory: SwarmCreepMemory, swarm: SwarmState, homeRoom: string): boolean {
  if (role === "remoteHarvester" || role === "remoteHauler") {
    const targetRoom = getRemoteRoomNeedingWorkers(homeRoom, role, swarm);
    if (targetRoom) {
      memory.targetRoom = targetRoom;
      return true;
    }
    return false;
  }
  
  if (role === "remoteWorker") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length > 0) {
      // Load balancing: assign to remote room with fewest remoteWorkers
      // Count by assignment (targetRoom), not by physical location
      let minCount = Infinity;
      let candidatesWithMinCount: string[] = [];
      
      for (const remoteName of remoteAssignments) {
        // Count workers assigned to this remote (from this home)
        const count = countRemoteCreepsByTargetRoom(homeRoom, role, remoteName);
        if (count < minCount) {
          minCount = count;
          candidatesWithMinCount = [remoteName];
        } else if (count === minCount) {
          candidatesWithMinCount.push(remoteName);
        }
      }
      
      // Select from candidates: use round-robin if multiple, otherwise take the only one
      const bestRemote = candidatesWithMinCount.length > 1
        ? candidatesWithMinCount[Game.time % candidatesWithMinCount.length]
        : candidatesWithMinCount[0];
      
      memory.targetRoom = bestRemote;
      return true;
    }
    return false;
  }
  
  // Not a remote role - no assignment needed, return true to allow spawning
  return true;
}

/**
 * Check if room needs a reserver for any of its remote rooms
 */
function needsReserver(_homeRoom: string, swarm: SwarmState): boolean {
  const remotes = swarm.remoteAssignments ?? [];
  if (remotes.length === 0) return false;
  
  const myUsername = getMyUsername();
  
  // Check each remote room
  for (const remoteName of remotes) {
    const remoteRoom = Game.rooms[remoteName];
    
    // If we have vision, check reservation status
    if (remoteRoom?.controller) {
      const controller = remoteRoom.controller;
      
      // Skip if owned by anyone (can't reserve owned rooms)
      if (controller.owner) continue;
      
      // Check if reserved by us
      const reservedByUs = controller.reservation?.username === myUsername;
      const reservationTicks = controller.reservation?.ticksToEnd ?? 0;
      
      // Need reserver if not reserved or reservation is running low
      if (!reservedByUs || reservationTicks < RESERVATION_THRESHOLD_TICKS) {
        // Check if we already have a reserver going there
        const hasReserver = Object.values(Game.creeps).some(creep => {
          const memory = creep.memory as unknown as SwarmCreepMemory;
          return memory.role === "claimer" && memory.targetRoom === remoteName && memory.task === "reserve";
        });
        
        if (!hasReserver) {
          return true; // Found a remote that needs a reserver
        }
      }
    } else {
      // No vision - check if we have a reserver assigned
      const hasReserver = Object.values(Game.creeps).some(creep => {
        const memory = creep.memory as unknown as SwarmCreepMemory;
        return memory.role === "claimer" && memory.targetRoom === remoteName && memory.task === "reserve";
      });
      
      if (!hasReserver) {
        return true; // No reserver for this remote
      }
    }
  }
  
  return false;
}

/**
 * Get my username (cached)
 */
function getMyUsername(): string {
  const spawns = Object.values(Game.spawns);
  if (spawns.length > 0) {
    return spawns[0].owner.username;
  }
  return "";
}

/**
 * Check if room needs to spawn a specific role.
 * Evaluates current creep counts, room conditions, and special requirements.
 * 
 * @param roomName - Name of the room
 * @param role - Role to check
 * @param swarm - Swarm state with posture, danger level, and assignments
 * @param isBootstrapMode - Whether room is in bootstrap/emergency mode
 * @returns true if the role should be spawned
 */
export function needsRole(roomName: string, role: string, swarm: SwarmState, isBootstrapMode = false): boolean {
  const def = ROLE_DEFINITIONS[role];
  if (!def) return false;

  // SPECIAL: larvaWorker should ONLY be spawned during bootstrap/emergency
  // Once the economy is stable, use specialized roles instead
  // HOWEVER: Allow it in bootstrap mode (when isBootstrapMode = true)
  if (role === "larvaWorker" && !isBootstrapMode) {
    // larvaWorker is handled exclusively by bootstrap mode
    // Return false here to prevent spawning in normal mode
    return false;
  }

  // Special handling for remote roles
  if (role === "remoteHarvester" || role === "remoteHauler") {
    // Check if there's a remote room that needs workers
    return getRemoteRoomNeedingWorkers(roomName, role, swarm) !== null;
  }
  
  // Remote worker: only spawn if we have remote rooms assigned
  // CRITICAL FIX: Must count workers by homeRoom ASSIGNMENT, not by physical location
  // because remote workers travel away from home and would be undercounted
  if (role === "remoteWorker") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length === 0) return false;
    
    // Use cached count of workers assigned from this home room (by memory.homeRoom)
    // This counts workers regardless of their current physical location
    const workersFromThisHome = countCreepsOfRole(roomName, "remoteWorker");
    
    // Check against maxPerRoom from role definition (already retrieved above)
    return workersFromThisHome < def.maxPerRoom;
  }
  
  // Remote guard: spawn if remote rooms have threats
  if (role === "remoteGuard") {
    const remoteAssignments = swarm.remoteAssignments ?? [];
    if (remoteAssignments.length === 0) return false;
    
    // Check if any remote room has threats and needs guards
    for (const remoteName of remoteAssignments) {
      const remoteRoom = Game.rooms[remoteName];
      if (!remoteRoom) continue; // Can't check rooms without vision
      
      // Check for hostile creeps with combat parts
      const hostiles = cachedRoomFind(remoteRoom, FIND_HOSTILE_CREEPS) as Creep[];
      const dangerousHostiles = hostiles.filter(h =>
        h.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK || p.type === WORK)
      );
      
      if (dangerousHostiles.length > 0) {
        // Check how many guards are already assigned to this remote
        const currentGuards = countRemoteCreepsByTargetRoom(roomName, role, remoteName);
        // Need guards scaled to threat level, up to max per room
        const neededGuards = Math.min(def.maxPerRoom, Math.ceil(dangerousHostiles.length / THREATS_PER_GUARD));
        if (currentGuards < neededGuards) {
          return true;
        }
      }
    }
    
    return false;
  }

  const counts = countCreepsByRole(roomName);
  const current = counts.get(role) ?? 0;

  // Check max per room (with special handling for upgraders in focus room)
  let maxForRoom = def.maxPerRoom;
  if (role === "upgrader" && swarm.clusterId) {
    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (cluster?.focusRoom === roomName) {
      // Allow more upgraders in focus room to accelerate upgrading
      const room = Game.rooms[roomName];
      if (room?.controller) {
        // Scale upgraders based on RCL
        if (room.controller.level <= 3) {
          maxForRoom = FOCUS_ROOM_UPGRADER_LIMITS.EARLY;
        } else if (room.controller.level <= 6) {
          maxForRoom = FOCUS_ROOM_UPGRADER_LIMITS.MID;
        } else {
          maxForRoom = FOCUS_ROOM_UPGRADER_LIMITS.LATE;
        }
      }
    }
  }

  if (current >= maxForRoom) return false;

  // Special conditions
  const room = Game.rooms[roomName];
  if (!room) return false;

  // Scout: Spawn if we have remote rooms without full intel
  // or if we're in expand posture and need more room data
  // CRITICAL: Do NOT spawn scouts during active defense - military units have priority
  if (role === "scout") {
    // Never spawn scouts during defensive operations (danger >= 1)
    // Military units must take absolute priority during invasions
    if (swarm.danger >= 1) return false;
    
    // Never spawn scouts in war/siege/defensive postures
    if (swarm.posture === "defensive" || swarm.posture === "war" || swarm.posture === "siege") return false;
    
    // Always allow scouts if we don't have one (up to max per room) and room is safe
    if (current === 0) return true;
    
    // In expand posture, allow more scouts
    if (swarm.posture === "expand" && current < def.maxPerRoom) return true;
    
    return false;
  }

  // Claimer: Only spawn if we have expansion targets or remote rooms that need reserving
  if (role === "claimer") {
    const empire = memoryManager.getEmpire();
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    
    // Check if we have unclaimed expansion targets and can expand
    const canExpand = ownedRooms.length < Game.gcl.level;
    const hasExpansionTarget = empire.claimQueue.some(c => !c.claimed);
    
    // Check if we have remote rooms that need reserving (no reserver assigned)
    const hasUnreservedRemote = needsReserver(roomName, swarm);
    
    // Only spawn claimer if there's work to do
    if (canExpand && hasExpansionTarget) return true;
    if (hasUnreservedRemote) return true;
    
    return false;
  }

  // Mineral harvester needs extractor
  if (role === "mineralHarvester") {
    const mineral = room.find(FIND_MINERALS)[0];
    if (!mineral) return false;
    const extractor = mineral.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_EXTRACTOR);
    if (!extractor) return false;
    if (mineral.mineralAmount === 0) return false;
  }

  // Lab tech needs labs
  if (role === "labTech") {
    const labs = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LAB });
    if (labs.length < 3) return false;
  }

  // Factory worker needs factory
  if (role === "factoryWorker") {
    const factory = room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_FACTORY });
    if (factory.length === 0) return false;
  }

  // Queen carrier needs storage
  if (role === "queenCarrier") {
    if (!room.storage) return false;
  }

  // Builder needs construction sites
  if (role === "builder") {
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (sites.length === 0 && current > 0) return false;
  }

  // Inter-room carrier needs active resource requests
  if (role === "interRoomCarrier") {
    // Check if room's cluster has any active resource transfer requests
    if (!swarm.clusterId) return false;
    
    const cluster = memoryManager.getCluster(swarm.clusterId);
    if (!cluster || !cluster.resourceRequests || cluster.resourceRequests.length === 0) {
      return false;
    }
    
    // Check if there are requests that need more carriers
    const needsCarriers = cluster.resourceRequests.some(req => {
      // Only spawn for requests from this room
      if (req.fromRoom !== room.name) return false;
      
      // Check if request needs more carriers
      const assignedCount = req.assignedCreeps.filter(name => Game.creeps[name]).length;
      const remaining = req.amount - req.delivered;
      
      // Need carriers if we have significant remaining amount and not enough assigned
      return remaining > 500 && assignedCount < 2;
    });
    
    if (!needsCarriers) return false;
  }

  // Cross-shard carrier needs active cross-shard transfer requests
  if (role === "crossShardCarrier") {
    // Check if there are any active cross-shard transfer requests
    const activeRequests = resourceTransferCoordinator.getActiveRequests();
    if (activeRequests.length === 0) {
      return false;
    }
    
    // Check if any request originates from this room and needs carriers
    const needsCarriers = activeRequests.some((req: CrossShardTransferRequest) => {
      // Only spawn for requests from this room
      if (req.sourceRoom !== room.name) return false;
      
      const assignedCreeps = req.assignedCreeps || [];
      const neededCarryCapacity = req.amount - req.transferred;
      
      // Get alive creeps and calculate their capacity
      let currentCapacity = 0;
      let aliveCreepCount = 0;
      for (const creepName of assignedCreeps) {
        const creep = Game.creeps[creepName];
        if (creep) {
          currentCapacity += creep.carryCapacity;
          aliveCreepCount++;
        }
      }
      
      // Need carriers if we need more capacity and haven't hit the max carriers per request
      return currentCapacity < neededCarryCapacity && aliveCreepCount < MAX_CARRIERS_PER_CROSS_SHARD_REQUEST;
    });
    
    if (!needsCarriers) return false;
  }

  return true;
}
