/**
 * Target Assignment Manager
 *
 * Centralized target assignment system for economy behaviors to achieve:
 * - O(n+m) complexity instead of O(n*m) for target selection
 * - Pre-calculated target assignments shared across all creeps in a room
 * - Reduced pathfinding calls through batch assignment
 * - Better load balancing across targets
 *
 * ROADMAP Alignment:
 * - Section 2: "Eco-Raum ≤ 0.1 CPU" target
 * - Section 8: "Medium Frequency (alle 5–20 Ticks)" - Target reassignment frequency
 * - Section 18: "Aggressives Caching + TTL" - Cached assignments with TTL
 *
 * Performance Impact:
 * - Estimated CPU savings: 0.02-0.04 per eco room
 * - Reduces individual creep target searches from O(n) to O(1) lookup
 */

import { createLogger } from "../core/logger";
import { cachedFindSources } from "../utils/caching";
import { memoryManager } from "../memory/manager";

const logger = createLogger("TargetAssignmentManager");

/**
 * How often to recalculate target assignments (in ticks)
 * Per ROADMAP Section 8: Medium frequency 5-20 ticks
 */
const ASSIGNMENT_REFRESH_INTERVAL = 10;

/**
 * Default maximum harvesters per source
 * Each source typically has ~2 mining spots around it
 * TODO: Calculate exact spots from terrain analysis
 Issue URL: https://github.com/ralphschuler/screeps/issues/824
 */
const DEFAULT_MAX_HARVESTERS_PER_SOURCE = 2;

/**
 * Source assignment for harvesters
 */
interface SourceAssignment {
  sourceId: Id<Source>;
  assignedHarvesters: Id<Creep>[];
  maxHarvesters: number;
}

/**
 * Construction site assignment for builders
 */
interface BuildTargetAssignment {
  targetId: Id<ConstructionSite>;
  assignedBuilders: Id<Creep>[];
  priority: number; // Higher = more important
}

/**
 * Room-level target assignments
 */
interface RoomAssignments {
  /** Tick when assignments were last calculated */
  tick: number;
  
  /** Source assignments for harvesters */
  sources: Map<Id<Source>, SourceAssignment>;
  
  /** Harvester → Source mapping for O(1) lookup */
  harvesterToSource: Map<Id<Creep>, Id<Source>>;
  
  /** Build target assignments */
  buildTargets: BuildTargetAssignment[];
  
  /** Builder → ConstructionSite mapping for O(1) lookup */
  builderToTarget: Map<Id<Creep>, Id<ConstructionSite>>;
  
  /** Upgrader assignments (all upgraders target controller) */
  upgraders: Set<Id<Creep>>;
}

/**
 * Global cache of room assignments
 * Cleared automatically each tick and rebuilt on-demand
 */
const roomAssignmentsCache = new Map<string, RoomAssignments>();

/**
 * Clear all cached assignments at tick start
 * Called from main loop
 */
export function clearTargetAssignments(): void {
  roomAssignmentsCache.clear();
}

/**
 * Get or calculate target assignments for a room
 */
function getOrCreateAssignments(room: Room): RoomAssignments {
  const cached = roomAssignmentsCache.get(room.name);
  
  // Return cached if still valid (within refresh interval)
  if (cached && Game.time - cached.tick < ASSIGNMENT_REFRESH_INTERVAL) {
    return cached;
  }
  
  // Calculate new assignments
  const assignments = calculateRoomAssignments(room);
  roomAssignmentsCache.set(room.name, assignments);
  
  logger.debug(`Calculated fresh assignments for ${room.name}`, {
    meta: {
      sources: assignments.sources.size,
      buildTargets: assignments.buildTargets.length,
      upgraders: assignments.upgraders.size
    }
  });
  
  return assignments;
}

/**
 * Calculate optimal target assignments for all creeps in a room
 * 
 * This is the core optimization: instead of each creep independently searching
 * for targets (O(n*m)), we calculate assignments once for the whole room (O(n+m)).
 */
function calculateRoomAssignments(room: Room): RoomAssignments {
  const assignments: RoomAssignments = {
    tick: Game.time,
    sources: new Map(),
    harvesterToSource: new Map(),
    buildTargets: [],
    builderToTarget: new Map(),
    upgraders: new Set()
  };
  
  // Get all economy creeps in this room
  const creeps = room.find(FIND_MY_CREEPS);
  const harvesters: Creep[] = [];
  const builders: Creep[] = [];
  const upgraders: Creep[] = [];
  
  // Categorize creeps by role
  for (const creep of creeps) {
    const role = (creep.memory as any).role as string;
    if (role === 'harvester' || role === 'staticMiner') {
      harvesters.push(creep);
    } else if (role === 'builder') {
      builders.push(creep);
    } else if (role === 'upgrader') {
      upgraders.push(creep);
      assignments.upgraders.add(creep.id);
    }
  }
  
  // Assign harvesters to sources
  assignHarvestersToSources(room, harvesters, assignments);
  
  // Assign builders to construction sites
  assignBuildersToTargets(room, builders, assignments);
  
  return assignments;
}

/**
 * Assign harvesters to sources with load balancing
 * 
 * Strategy:
 * 1. Calculate max harvesters per source (based on mining spots)
 * 2. Distribute harvesters evenly across sources
 * 3. Prefer existing assignments to minimize movement
 */
function assignHarvestersToSources(
  room: Room,
  harvesters: Creep[],
  assignments: RoomAssignments
): void {
  const sources = cachedFindSources(room);
  if (sources.length === 0) return;
  
  // Initialize source assignments
  for (const source of sources) {
    // Each source can support ~2 harvesters (typical mining spots)
    const maxHarvesters = DEFAULT_MAX_HARVESTERS_PER_SOURCE;
    
    assignments.sources.set(source.id, {
      sourceId: source.id,
      assignedHarvesters: [],
      maxHarvesters
    });
  }
  
  // Sort harvesters by existing assignment to maintain continuity
  const harvestersWithAssignment: Array<{ creep: Creep; currentSource: Id<Source> | null }> = [];
  
  for (const harvester of harvesters) {
    // Check if harvester already has a target in memory
    const currentTarget = (harvester.memory as any).targetId as Id<Source> | undefined;
    harvestersWithAssignment.push({
      creep: harvester,
      currentSource: currentTarget ?? null
    });
  }
  
  // First pass: keep harvesters at their current sources if not overloaded
  for (const { creep, currentSource } of harvestersWithAssignment) {
    if (currentSource) {
      const sourceAssignment = assignments.sources.get(currentSource);
      if (sourceAssignment && sourceAssignment.assignedHarvesters.length < sourceAssignment.maxHarvesters) {
        // Keep at current source
        sourceAssignment.assignedHarvesters.push(creep.id);
        assignments.harvesterToSource.set(creep.id, currentSource);
        continue;
      }
    }
    
    // Need new assignment - find least loaded source
    let bestSource: SourceAssignment | null = null;
    let minLoad = Infinity;
    
    for (const sourceAssignment of assignments.sources.values()) {
      const load = sourceAssignment.assignedHarvesters.length;
      if (load < sourceAssignment.maxHarvesters && load < minLoad) {
        bestSource = sourceAssignment;
        minLoad = load;
      }
    }
    
    if (bestSource) {
      bestSource.assignedHarvesters.push(creep.id);
      assignments.harvesterToSource.set(creep.id, bestSource.sourceId);
    }
  }
}

/**
 * Assign builders to construction sites with priority
 * 
 * Strategy:
 * 1. Collect construction sites from local and remote rooms
 * 2. Prioritize critical structures (spawns, extensions, towers)
 * 3. Prioritize remote infrastructure (containers, roads) to enable economy
 * 4. Distribute builders across high-priority sites
 */
function assignBuildersToTargets(
  room: Room,
  builders: Creep[],
  assignments: RoomAssignments
): void {
  // Get local construction sites
  const localSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  
  // Get remote construction sites (from visible remote rooms)
  const remoteSites = getRemoteConstructionSites(room);
  
  // Combine all sites
  const allSites = [...localSites, ...remoteSites];
  if (allSites.length === 0) return;
  
  // Prioritize construction sites (remote infrastructure gets higher priority)
  const prioritizedSites = allSites.map(site => ({
    site,
    priority: getConstructionPriority(site, room.name)
  })).sort((a, b) => b.priority - a.priority);
  
  // Create build target assignments
  for (const { site, priority } of prioritizedSites) {
    assignments.buildTargets.push({
      targetId: site.id,
      assignedBuilders: [],
      priority
    });
  }
  
  // Assign builders to targets (round-robin for high priority, then by distance)
  let targetIndex = 0;
  for (const builder of builders) {
    if (assignments.buildTargets.length === 0) break;
    
    // Assign to next target (round-robin)
    const target = assignments.buildTargets[targetIndex];
    target.assignedBuilders.push(builder.id);
    assignments.builderToTarget.set(builder.id, target.targetId);
    
    targetIndex = (targetIndex + 1) % assignments.buildTargets.length;
  }
}

/**
 * Get construction sites from visible remote rooms
 * 
 * Returns construction sites from remote rooms that:
 * - Are assigned to this room's colony
 * - Are currently visible (Game.rooms[remoteName] exists)
 * - Are not owned by enemies
 */
function getRemoteConstructionSites(room: Room): ConstructionSite[] {
  // Get swarm state to find remote room assignments
  const swarm = memoryManager.getSwarmState(room.name);
  if (!swarm || !swarm.remoteAssignments || swarm.remoteAssignments.length === 0) {
    return [];
  }
  
  const remoteSites: ConstructionSite[] = [];
  
  for (const remoteName of swarm.remoteAssignments) {
    const remoteRoom = Game.rooms[remoteName];
    
    // Skip if room is not visible
    if (!remoteRoom) continue;
    
    // Skip if room is owned by someone else
    if (remoteRoom.controller?.owner && !remoteRoom.controller.my) {
      continue;
    }
    
    // Find construction sites in remote room
    const sites = remoteRoom.find(FIND_CONSTRUCTION_SITES);
    remoteSites.push(...sites);
  }
  
  return remoteSites;
}

/**
 * Get construction priority for a structure type
 * 
 * Remote infrastructure (containers, roads) gets higher priority than
 * most local structures to enable remote mining economy faster.
 * 
 * @param site - The construction site
 * @param homeRoomName - The home room name to determine if site is remote
 */
function getConstructionPriority(site: ConstructionSite, homeRoomName: string): number {
  const isRemote = site.room?.name !== homeRoomName;
  
  // Remote infrastructure priorities (enable remote mining economy)
  if (isRemote) {
    switch (site.structureType) {
      case STRUCTURE_CONTAINER:
        return 100; // Critical for remote mining
      case STRUCTURE_ROAD:
        return 80; // Important for hauler efficiency
      case STRUCTURE_RAMPART:
        return 40; // Defense for remote infrastructure
      case STRUCTURE_WALL:
        return 30; // Defense for remote infrastructure
      default:
        return 60;
    }
  }
  
  // Local infrastructure priorities
  switch (site.structureType) {
    case STRUCTURE_SPAWN:
      return 95; // Slightly lower than remote containers
    case STRUCTURE_EXTENSION:
      return 90;
    case STRUCTURE_TOWER:
      return 85;
    case STRUCTURE_STORAGE:
      return 75;
    case STRUCTURE_LINK:
      return 70;
    case STRUCTURE_CONTAINER:
      return 65; // Local containers lower priority than remote
    case STRUCTURE_ROAD:
      return 50; // Local roads lower priority than remote
    case STRUCTURE_RAMPART:
      return 40;
    case STRUCTURE_WALL:
      return 30;
    default:
      return 60;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get assigned source for a harvester creep
 * 
 * @returns Source object or null if no assignment
 */
export function getAssignedSource(creep: Creep): Source | null {
  const assignments = getOrCreateAssignments(creep.room);
  const sourceId = assignments.harvesterToSource.get(creep.id);
  
  if (!sourceId) return null;
  
  const source = Game.getObjectById(sourceId);
  return source;
}

/**
 * Get assigned construction site for a builder creep
 * 
 * @returns ConstructionSite object or null if no assignment
 */
export function getAssignedBuildTarget(creep: Creep): ConstructionSite | null {
  const assignments = getOrCreateAssignments(creep.room);
  const targetId = assignments.builderToTarget.get(creep.id);
  
  if (!targetId) return null;
  
  const target = Game.getObjectById(targetId);
  return target;
}

/**
 * Check if a creep is assigned as an upgrader
 */
export function isAssignedUpgrader(creep: Creep): boolean {
  const assignments = getOrCreateAssignments(creep.room);
  return assignments.upgraders.has(creep.id);
}

/**
 * Get assignment statistics for a room (for debugging/monitoring)
 */
export function getAssignmentStats(roomName: string): {
  harvesters: number;
  builders: number;
  upgraders: number;
  sources: number;
  buildTargets: number;
  lastUpdate: number;
} | null {
  const room = Game.rooms[roomName];
  if (!room) return null;
  
  const assignments = getOrCreateAssignments(room);
  
  return {
    harvesters: assignments.harvesterToSource.size,
    builders: assignments.builderToTarget.size,
    upgraders: assignments.upgraders.size,
    sources: assignments.sources.size,
    buildTargets: assignments.buildTargets.length,
    lastUpdate: assignments.tick
  };
}
