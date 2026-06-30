/**
 * Military patrol waypoint planning.
 *
 * The military behavior module only needs two operations: produce a stable room
 * patrol route and advance a creep through that route. Keeping cache metadata,
 * waypoint serialization, and terrain filtering here makes the role logic easier
 * to scan while preserving the same patrol contract for all military roles.
 */

import type { SwarmCreepMemory } from "../../memory/schemas";
import { globalCache } from "../../cache";

/** Cache namespace for patrol waypoints. */
const PATROL_CACHE_NAMESPACE = "patrol";

/** TTL for patrol waypoints. They only change when spawn count changes. */
const PATROL_WAYPOINT_TTL = 1000;

interface PatrolWaypointMetadata {
  spawnCount: number;
}

interface SerializedPatrolWaypoint {
  x: number;
  y: number;
  roomName: string;
}

interface CachedPatrolWaypoints {
  waypoints: SerializedPatrolWaypoint[];
  metadata: PatrolWaypointMetadata;
}

interface WaypointCoordinate {
  x: number;
  y: number;
}

const EXIT_PATROL_COORDINATES: readonly WaypointCoordinate[] = [
  { x: 10, y: 5 },
  { x: 25, y: 5 },
  { x: 39, y: 5 },
  { x: 10, y: 44 },
  { x: 25, y: 44 },
  { x: 39, y: 44 },
  { x: 5, y: 10 },
  { x: 5, y: 25 },
  { x: 5, y: 39 },
  { x: 44, y: 10 },
  { x: 44, y: 25 },
  { x: 44, y: 39 }
];

const ROOM_COVERAGE_COORDINATES: readonly WaypointCoordinate[] = [
  { x: 10, y: 10 },
  { x: 39, y: 10 },
  { x: 10, y: 39 },
  { x: 39, y: 39 },
  { x: 25, y: 25 }
];

function getSpawnPatrolCoordinates(spawns: StructureSpawn[]): WaypointCoordinate[] {
  return spawns.flatMap(spawn => [
    { x: spawn.pos.x + 3, y: spawn.pos.y + 3 },
    { x: spawn.pos.x - 3, y: spawn.pos.y - 3 }
  ]);
}

function getRawPatrolCoordinates(spawns: StructureSpawn[]): WaypointCoordinate[] {
  return [
    ...getSpawnPatrolCoordinates(spawns),
    ...EXIT_PATROL_COORDINATES,
    ...ROOM_COVERAGE_COORDINATES
  ];
}

function clampToPatrolBounds({ x, y }: WaypointCoordinate): WaypointCoordinate {
  return {
    x: Math.max(2, Math.min(47, x)),
    y: Math.max(2, Math.min(47, y))
  };
}

function deserializeWaypoints(waypoints: SerializedPatrolWaypoint[]): RoomPosition[] {
  return waypoints.map(waypoint => new RoomPosition(waypoint.x, waypoint.y, waypoint.roomName));
}

function serializeWaypoints(waypoints: RoomPosition[]): SerializedPatrolWaypoint[] {
  return waypoints.map(waypoint => ({
    x: waypoint.x,
    y: waypoint.y,
    roomName: waypoint.roomName
  }));
}

function buildPatrolWaypoints(room: Room, spawns: StructureSpawn[]): RoomPosition[] {
  const terrain = room.getTerrain();

  return getRawPatrolCoordinates(spawns)
    .map(clampToPatrolBounds)
    .filter(coordinate => terrain.get(coordinate.x, coordinate.y) !== TERRAIN_MASK_WALL)
    .map(coordinate => new RoomPosition(coordinate.x, coordinate.y, room.name));
}

/**
 * Return patrol waypoints for a room covering spawn approaches, exits, corners,
 * and center control. The route is cached by room and regenerated only when the
 * number of owned spawns changes.
 */
export function getPatrolWaypoints(room: Room): RoomPosition[] {
  const spawns = room.find(FIND_MY_SPAWNS);
  const spawnCount = spawns.length;
  const cached = globalCache.get<CachedPatrolWaypoints>(room.name, {
    namespace: PATROL_CACHE_NAMESPACE
  });

  if (cached && cached.metadata.spawnCount === spawnCount) {
    return deserializeWaypoints(cached.waypoints);
  }

  const waypoints = buildPatrolWaypoints(room, spawns);
  globalCache.set(room.name, {
    waypoints: serializeWaypoints(waypoints),
    metadata: { spawnCount }
  }, {
    namespace: PATROL_CACHE_NAMESPACE,
    ttl: PATROL_WAYPOINT_TTL
  });

  return waypoints;
}

/**
 * Return the current patrol waypoint and advance to the next waypoint once the
 * creep is within range two. The index wraps so long-lived guards keep moving.
 */
export function getNextPatrolWaypoint(creep: Creep, waypoints: RoomPosition[]): RoomPosition | null {
  if (waypoints.length === 0) return null;

  const mem = creep.memory as unknown as SwarmCreepMemory;

  if (mem.patrolIndex === undefined) {
    mem.patrolIndex = 0;
  }

  const currentWaypoint = waypoints[mem.patrolIndex % waypoints.length];
  if (currentWaypoint && creep.pos.getRangeTo(currentWaypoint) <= 2) {
    mem.patrolIndex = (mem.patrolIndex + 1) % waypoints.length;
  }

  return waypoints[mem.patrolIndex % waypoints.length] ?? null;
}
