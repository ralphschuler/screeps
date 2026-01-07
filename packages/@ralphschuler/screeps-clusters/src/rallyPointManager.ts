/**
 * Rally Point Manager
 *
 * Manages rally points for military operations:
 * - Dynamic rally point selection based on terrain and threats
 * - Rally point validation and cleanup
 * - Visualization of rally points
 * - Defense rally point management
 *
 * ROADMAP Reference: Section 12 - Kampf & Verteidigung
 * - Rally point management
 * - Multi-room coordination
 */

import type { ClusterMemory } from "../memory/schemas";
import { logger } from "@ralphschuler/screeps-core";

/**
 * Rally point definition
 */
export interface RallyPoint {
  /** Room name */
  roomName: string;
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Purpose of rally point */
  purpose: "defense" | "offense" | "staging" | "retreat";
  /** Creation tick */
  createdAt?: number;
  /** Last used tick */
  lastUsed?: number;
}

/**
 * Rally point evaluation criteria
 */
interface RallyPointScore {
  position: RoomPosition;
  score: number;
  terrain: number; // Terrain quality (plain > swamp > wall)
  safety: number; // Distance from hostiles
  centrality: number; // Distance from room center
  exitAccess: number; // Access to exits for mobility
}

/**
 * Find optimal rally point in a room for a given purpose
 */
export function findOptimalRallyPoint(
  room: Room,
  purpose: "defense" | "offense" | "staging" | "retreat"
): RallyPoint | null {
  if (!room) return null;

  // Different purposes have different requirements
  switch (purpose) {
    case "defense":
      return findDefenseRallyPoint(room);
    case "offense":
      return findOffenseRallyPoint(room);
    case "staging":
      return findStagingRallyPoint(room);
    case "retreat":
      return findRetreatRallyPoint(room);
    default:
      return null;
  }
}

/**
 * Find optimal defense rally point
 * Should be centrally located near spawn/storage for quick response
 */
function findDefenseRallyPoint(room: Room): RallyPoint | null {
  // Prefer positions near spawn/storage
  const spawns = room.find(FIND_MY_SPAWNS);
  const storage = room.storage;

  if (spawns.length === 0) return null;

  // Use spawn position as anchor
  const anchor = storage ? storage.pos : spawns[0].pos;

  // Find best position within 5 range of anchor
  const candidates: RallyPointScore[] = [];

  for (let dx = -5; dx <= 5; dx++) {
    for (let dy = -5; dy <= 5; dy++) {
      const x = anchor.x + dx;
      const y = anchor.y + dy;

      // Keep within room bounds
      if (x < 2 || x > 47 || y < 2 || y > 47) continue;

      const pos = new RoomPosition(x, y, room.name);
      const score = evaluateRallyPosition(room, pos, "defense");
      if (score.score > 0) {
        candidates.push(score);
      }
    }
  }

  // Sort by score and pick best
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    // Fallback to room center
    return {
      roomName: room.name,
      x: 25,
      y: 25,
      purpose: "defense",
      createdAt: Game.time
    };
  }

  const best = candidates[0];
  return {
    roomName: room.name,
    x: best.position.x,
    y: best.position.y,
    purpose: "defense",
    createdAt: Game.time
  };
}

/**
 * Find optimal offense rally point
 * Should be near exits for quick deployment
 */
function findOffenseRallyPoint(room: Room): RallyPoint | null {
  // Find position near exits but not too close to hostiles
  const exits = room.find(FIND_EXIT);
  if (exits.length === 0) return null;

  // Group exits by direction
  const exitGroups = {
    top: exits.filter(e => e.y < 5),
    bottom: exits.filter(e => e.y > 44),
    left: exits.filter(e => e.x < 5),
    right: exits.filter(e => e.x > 44)
  };

  // Find the exit group closest to room center
  let bestGroup: RoomPosition[] = [];
  let minDist = Infinity;

  for (const [dir, group] of Object.entries(exitGroups)) {
    if (group.length === 0) continue;
    const dist = group[0].getRangeTo(25, 25);
    if (dist < minDist) {
      minDist = dist;
      bestGroup = group;
    }
  }

  if (bestGroup.length === 0) {
    // Fallback
    return {
      roomName: room.name,
      x: 25,
      y: 25,
      purpose: "offense",
      createdAt: Game.time
    };
  }

  // Find best position near this exit group
  const anchor = bestGroup[Math.floor(bestGroup.length / 2)];
  const candidates: RallyPointScore[] = [];

  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const x = anchor.x + dx;
      const y = anchor.y + dy;

      if (x < 2 || x > 47 || y < 2 || y > 47) continue;

      const pos = new RoomPosition(x, y, room.name);
      const score = evaluateRallyPosition(room, pos, "offense");
      if (score.score > 0) {
        candidates.push(score);
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    // Fallback with bounds checking
    const safeX = Math.max(2, Math.min(47, anchor.x));
    const safeY = Math.max(2, Math.min(47, anchor.y));
    return {
      roomName: room.name,
      x: safeX,
      y: safeY,
      purpose: "offense",
      createdAt: Game.time
    };
  }

  const best = candidates[0];
  return {
    roomName: room.name,
    x: best.position.x,
    y: best.position.y,
    purpose: "offense",
    createdAt: Game.time
  };
}

/**
 * Find optimal staging rally point
 * Should be safe, accessible, and have good exit access
 */
function findStagingRallyPoint(room: Room): RallyPoint | null {
  // Staging points should be between center and exits
  const candidates: RallyPointScore[] = [];

  // Sample positions in a grid
  for (let x = 10; x <= 40; x += 5) {
    for (let y = 10; y <= 40; y += 5) {
      const pos = new RoomPosition(x, y, room.name);
      const score = evaluateRallyPosition(room, pos, "staging");
      if (score.score > 0) {
        candidates.push(score);
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    return {
      roomName: room.name,
      x: 25,
      y: 25,
      purpose: "staging",
      createdAt: Game.time
    };
  }

  const best = candidates[0];
  return {
    roomName: room.name,
    x: best.position.x,
    y: best.position.y,
    purpose: "staging",
    createdAt: Game.time
  };
}

/**
 * Find optimal retreat rally point
 * Should be maximally safe (far from exits and hostiles)
 */
function findRetreatRallyPoint(room: Room): RallyPoint | null {
  const spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length === 0) {
    return {
      roomName: room.name,
      x: 25,
      y: 25,
      purpose: "retreat",
      createdAt: Game.time
    };
  }

  // Retreat point should be near spawn for safety
  const spawn = spawns[0];
  return {
    roomName: room.name,
    x: spawn.pos.x,
    y: spawn.pos.y,
    purpose: "retreat",
    createdAt: Game.time
  };
}

/**
 * Evaluate a potential rally point position
 */
function evaluateRallyPosition(room: Room, pos: RoomPosition, purpose: string): RallyPointScore {
  let score = 0;
  let terrain = 0;
  let safety = 0;
  let centrality = 0;
  let exitAccess = 0;

  // Check terrain
  const terrainType = room.getTerrain().get(pos.x, pos.y);
  if (terrainType === TERRAIN_MASK_WALL) {
    return { position: pos, score: 0, terrain: 0, safety: 0, centrality: 0, exitAccess: 0 };
  }

  // Plain terrain is better than swamp
  terrain = terrainType === 0 ? 10 : 5;
  score += terrain;

  // Check for structures blocking position
  const structures = room.lookForAt(LOOK_STRUCTURES, pos);
  if (structures.some(s => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_RAMPART)) {
    return { position: pos, score: 0, terrain: 0, safety: 0, centrality: 0, exitAccess: 0 };
  }

  // Evaluate safety (distance from hostiles)
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  if (hostiles.length > 0) {
    const minHostileRange = Math.min(...hostiles.map(h => pos.getRangeTo(h)));
    safety = Math.min(10, minHostileRange);
  } else {
    safety = 10;
  }
  score += safety * 2; // Safety is important

  // Evaluate centrality (different weight by purpose)
  const distToCenter = Math.sqrt(Math.pow(pos.x - 25, 2) + Math.pow(pos.y - 25, 2));
  if (purpose === "defense" || purpose === "retreat") {
    // Defense and retreat prefer central positions
    centrality = Math.max(0, 10 - distToCenter / 2);
  } else {
    // Offense and staging prefer positions between center and exits
    centrality = Math.max(0, 5 - Math.abs(distToCenter - 15) / 2);
  }
  score += centrality;

  // Evaluate exit access (for mobility)
  const distToNearestExit = Math.min(pos.x, pos.y, 49 - pos.x, 49 - pos.y);
  if (purpose === "offense" || purpose === "staging") {
    // Offense wants easier exit access
    exitAccess = Math.max(0, 10 - distToNearestExit / 2);
  } else {
    // Defense and retreat want to be away from exits
    // Use scaling factor that allows positions near center to reach max score
    exitAccess = Math.min(10, distToNearestExit / 2.5);
  }
  score += exitAccess;

  return { position: pos, score, terrain, safety, centrality, exitAccess };
}

/**
 * Update rally points for a cluster
 */
export function updateClusterRallyPoints(cluster: ClusterMemory): void {
  // Clean up old rally points
  cluster.rallyPoints = cluster.rallyPoints.filter(rp => {
    // Keep if recently used (within 1000 ticks)
    if (rp.lastUsed && Game.time - rp.lastUsed < 1000) return true;

    // Keep if actively used by a squad
    const hasActiveSquad = cluster.squads.some(
      squad => squad.rallyRoom === rp.roomName && squad.state !== "dissolving"
    );
    if (hasActiveSquad) return true;

    // Keep defense rally points
    if (rp.purpose === "defense") return true;

    return false;
  });

  // Ensure each member room has a defense rally point
  for (const roomName of cluster.memberRooms) {
    const room = Game.rooms[roomName];
    if (!room) continue;

    const existingDefense = cluster.rallyPoints.find(
      rp => rp.roomName === roomName && rp.purpose === "defense"
    );

    if (!existingDefense) {
      const rallyPoint = findOptimalRallyPoint(room, "defense");
      if (rallyPoint) {
        cluster.rallyPoints.push(rallyPoint);
        logger.debug(`Created defense rally point for ${roomName} at ${rallyPoint.x},${rallyPoint.y}`, {
          subsystem: "RallyPoint"
        });
      }
    }
  }
}

/**
 * Get or create rally point for a squad
 */
export function getSquadRallyPoint(
  cluster: ClusterMemory,
  squadType: "harass" | "raid" | "siege" | "defense",
  targetRoom?: string
): RallyPoint | null {
  // For defense squads, use defense rally point in target room
  if (squadType === "defense" && targetRoom) {
    let rallyPoint = cluster.rallyPoints.find(
      rp => rp.roomName === targetRoom && rp.purpose === "defense"
    );

    if (!rallyPoint) {
      const room = Game.rooms[targetRoom];
      if (room) {
        const newRally = findOptimalRallyPoint(room, "defense");
        if (newRally) {
          cluster.rallyPoints.push(newRally);
          rallyPoint = newRally;
        }
      }
    }

    if (rallyPoint) {
      rallyPoint.lastUsed = Game.time;
      return rallyPoint;
    }
  }

  // For offensive squads, use staging rally point in cluster core room
  const coreRoom = Game.rooms[cluster.coreRoom];
  if (!coreRoom) return null;

  let rallyPoint = cluster.rallyPoints.find(
    rp => rp.roomName === cluster.coreRoom && rp.purpose === "staging"
  );

  if (!rallyPoint) {
    const newRally = findOptimalRallyPoint(coreRoom, "staging");
    if (newRally) {
      cluster.rallyPoints.push(newRally);
      rallyPoint = newRally;
    }
  }

  if (rallyPoint) {
    rallyPoint.lastUsed = Game.time;
    return rallyPoint;
  }

  return null;
}

/**
 * Visualize rally points in a room
 */
export function visualizeRallyPoints(room: Room, cluster: ClusterMemory): void {
  const rallyPoints = cluster.rallyPoints.filter(rp => rp.roomName === room.name);

  for (const rp of rallyPoints) {
    const color = {
      defense: "#00ff00",
      offense: "#ff0000",
      staging: "#ffff00",
      retreat: "#0000ff"
    }[rp.purpose] || "#ffffff";

    room.visual.circle(rp.x, rp.y, {
      radius: 0.5,
      fill: color,
      opacity: 0.5,
      stroke: color,
      strokeWidth: 0.1
    });

    room.visual.text(rp.purpose[0].toUpperCase(), rp.x, rp.y - 1, {
      color,
      font: 0.5
    });

    // Show if recently used
    if (rp.lastUsed && Game.time - rp.lastUsed < 100) {
      room.visual.circle(rp.x, rp.y, {
        radius: 1.0,
        fill: "transparent",
        stroke: color,
        strokeWidth: 0.2,
        opacity: 0.8
      });
    }
  }
}
