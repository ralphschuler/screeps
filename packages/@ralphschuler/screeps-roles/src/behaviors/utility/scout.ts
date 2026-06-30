import type { EmpireMemory, RoomIntel } from "../../memory/schemas";
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
import { isExit } from "screeps-cartographer";
import { memoryManager } from "../../memory/manager";
import type { CreepAction, CreepContext } from "../types";
import { moveToRoomCenter, ROOM_CENTER_X, ROOM_CENTER_Y } from "./navigation";

// =============================================================================
// Scout / Intel Helpers
// =============================================================================

/**
 * Record intelligence about a room.
 * OPTIMIZATION: Only do full scan if room hasn't been scouted recently (500 ticks).
 * This reduces expensive terrain scanning and room.find() calls.
 */
function recordRoomIntel(room: Room, empire: EmpireMemory): void {
  const knownRooms = empire.knownRooms;

  const existingIntel = knownRooms[room.name];
  const lastSeen = existingIntel?.lastSeen ?? 0;
  const ticksSinceLastScan = Game.time - lastSeen;

  // If room was recently scanned (within 2000 ticks), only update dynamic data
  // OPTIMIZATION: Increased from 1000 to 2000 ticks to reduce CPU on frequent rescans
  // Scouts were causing high CPU usage due to too-frequent terrain analysis
  if (existingIntel?.scouted && ticksSinceLastScan < 2000) {
    existingIntel.lastSeen = Game.time;

    // Only update threat level (dynamic data)
    const hostiles = getActualHostileCreeps(room);
    existingIntel.threatLevel = hostiles.length > 5 ? 3 : hostiles.length > 2 ? 2 : hostiles.length > 0 ? 1 : 0;

    // Update controller level if it changed
    if (room.controller) {
      existingIntel.controllerLevel = room.controller.level ?? 0;
      if (room.controller.owner?.username) existingIntel.owner = room.controller.owner.username;
      if (room.controller.reservation?.username) existingIntel.reserver = room.controller.reservation.username;
    }

    return;
  }

  // Full scan for new rooms or rooms not scanned in 2000+ ticks
  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  const controller = room.controller;
  const hostiles = getActualHostileCreeps(room);

  // Classify terrain (expensive operation, only do once per 2000 ticks)
  // OPTIMIZATION: Sample fewer tiles (every 10 instead of every 5) to reduce CPU cost
  const terrain = room.getTerrain();
  let swampCount = 0;
  let plainCount = 0;
  for (let x = 5; x < 50; x += 10) {
    for (let y = 5; y < 50; y += 10) {
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

  knownRooms[room.name] = intel;
}

/**
 * Convert a Screeps room name into signed coordinates.
 * E0/S0 are 0; W0/N0 are -1.
 */
function roomNameToCoords(roomName: string): { x: number; y: number } | null {
  const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return null;

  const horizontal = match[1];
  const xNumber = parseInt(match[2]!, 10);
  const vertical = match[3];
  const yNumber = parseInt(match[4]!, 10);

  return {
    x: horizontal === "E" ? xNumber : -xNumber - 1,
    y: vertical === "S" ? yNumber : -yNumber - 1
  };
}

function coordsToRoomName(x: number, y: number): string {
  const horizontal = x >= 0 ? `E${x}` : `W${-x - 1}`;
  const vertical = y >= 0 ? `S${y}` : `N${-y - 1}`;
  return `${horizontal}${vertical}`;
}

function getFallbackAdjacentRooms(roomName: string): string[] {
  const coords = roomNameToCoords(roomName);
  if (!coords) return [];

  return [
    coordsToRoomName(coords.x, coords.y - 1),
    coordsToRoomName(coords.x + 1, coords.y),
    coordsToRoomName(coords.x, coords.y + 1),
    coordsToRoomName(coords.x - 1, coords.y)
  ];
}

function getAdjacentRooms(roomName: string): string[] {
  const exits = Game.map.describeExits(roomName);
  const describedRooms = exits ? Object.values(exits) : [];
  const fallbackRooms = getFallbackAdjacentRooms(roomName);
  return Array.from(new Set([...describedRooms, ...fallbackRooms]));
}

/**
 * Find the next unexplored adjacent room.
 * Avoids the previous room to prevent cycling between two rooms.
 */
function findNextExploreTarget(
  currentRoom: string,
  empire: EmpireMemory,
  previousRoom?: string
): string | undefined {
  const knownRooms = empire.knownRooms;
  const adjacentRooms = getAdjacentRooms(currentRoom);
  if (adjacentRooms.length === 0) return undefined;

  const candidates: { room: string; lastSeen: number }[] = [];

  for (const roomName of adjacentRooms) {
    // Skip the previous room to prevent cycling
    if (previousRoom && roomName === previousRoom) continue;

    const intel = knownRooms[roomName];
    const lastSeen = intel?.lastSeen ?? 0;
    if (!intel?.scouted || Game.time - lastSeen > 1000) {
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
    new RoomPosition(ROOM_CENTER_X, ROOM_CENTER_Y, room.name)
  ];

  const terrain = room.getTerrain();
  for (const pos of positions) {
    if (terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL) {
      return pos;
    }
  }

  return null;
}

/**
 * Scout - Explore and map rooms.
 *
 * Movement is intentionally simple to avoid exit cycling:
 * 1. Always move off exits before doing any other work.
 * 2. Travel to the assigned target room.
 * 3. Record intel near a stable explore position.
 * 4. Pick the stalest adjacent room that is not the last explored room.
 */
export function scout(ctx: CreepContext): CreepAction {
  const empire = memoryManager.getEmpire();
  const onExit = isExit(ctx.creep.pos);

  // PRIORITY 1: Always move off exits immediately
  // This prevents all cycling issues by ensuring we're never stuck on exit tiles
  if (onExit) {
    return moveToRoomCenter(ctx.room.name);
  }

  // Track the last room we fully explored (not just passed through)
  const lastExploredRoom = ctx.memory.lastExploredRoom;

  // Find or assign target room
  let targetRoom = ctx.memory.targetRoom;

  // If no target, find next room to explore
  if (!targetRoom) {
    targetRoom = findNextExploreTarget(ctx.room.name, empire, lastExploredRoom);
    if (targetRoom) {
      ctx.memory.targetRoom = targetRoom;
    } else {
      // No valid target found - clear both to expand search
      delete ctx.memory.targetRoom;
      delete ctx.memory.lastExploredRoom;
      // Stay idle in current room
      return { type: "idle" };
    }
  }

  // If traveling to a different room, move there
  if (targetRoom && ctx.room.name !== targetRoom) {
    return { type: "moveToRoom", roomName: targetRoom };
  }

  // We're at target room - explore it
  if (targetRoom && ctx.room.name === targetRoom) {
    const explorePos = findExplorePosition(ctx.room);
    if (explorePos) {
      const INTEL_GATHER_RANGE = 3;
      if (ctx.creep.pos.getRangeTo(explorePos) <= INTEL_GATHER_RANGE) {
        // At explore position - record intel
        recordRoomIntel(ctx.room, empire);
        ctx.memory.lastExploredRoom = ctx.room.name;
        delete ctx.memory.targetRoom; // Done exploring
        return { type: "idle" };
      } else {
        // Move to explore position
        return { type: "moveTo", target: explorePos };
      }
    } else {
      // No valid explore position - record intel and move on
      recordRoomIntel(ctx.room, empire);
      ctx.memory.lastExploredRoom = ctx.room.name;
      delete ctx.memory.targetRoom;
      return { type: "idle" };
    }
  }

  return { type: "idle" };
}
