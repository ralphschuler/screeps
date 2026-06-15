/**
 * Room Intel Manager
 * Handles room discovery, intel refreshing, and tracking
 */

import { logger } from "@ralphschuler/screeps-core";
import { getActualHostileCreeps, getActualHostileStructures } from "@ralphschuler/screeps-defense";
import type { EmpireMemory, RoomIntel } from "@ralphschuler/screeps-memory";
import { buildStubRoomIntel, buildVisibleRoomIntel, mergeRoomIntel, type VisibleRoomIntelSnapshot } from "./roomIntelSnapshot";

/**
 * Room Intel Manager Configuration
 */
export interface RoomIntelConfig {
  /** Interval to refresh room intel (ticks) */
  intelRefreshInterval: number;
  /** Interval to discover nearby rooms (ticks) */
  roomDiscoveryInterval: number;
  /** Maximum distance for room discovery */
  maxRoomDiscoveryDistance: number;
  /** Maximum number of rooms to discover per tick */
  maxRoomsToDiscoverPerTick: number;
}

const DEFAULT_CONFIG: RoomIntelConfig = {
  intelRefreshInterval: 100,
  roomDiscoveryInterval: 100,
  maxRoomDiscoveryDistance: 5,
  maxRoomsToDiscoverPerTick: 50
};

/**
 * Room Intel Manager
 * Manages room intelligence gathering and tracking
 */
export class RoomIntelManager {
  private config: RoomIntelConfig;

  public constructor(config: Partial<RoomIntelConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Refresh intel for known rooms that are visible
   */
  public refreshRoomIntel(empire: EmpireMemory): void {
    // Only refresh every N ticks
    if (Game.time % this.config.intelRefreshInterval !== 0) {
      return;
    }

    const visibleRooms = Object.values(Game.rooms);
    let updatedCount = 0;

    for (const room of visibleRooms) {
      const existing = empire.knownRooms[room.name];

      if (existing) {
        // Update existing intel
        this.updateRoomIntel(existing, room);
        updatedCount++;
      } else {
        // Create new intel entry
        empire.knownRooms[room.name] = this.createRoomIntel(room);
        updatedCount++;
      }
    }

    if (updatedCount > 0 && Game.time % 500 === 0) {
      logger.info(`Refreshed intel for ${updatedCount} visible rooms`, { subsystem: "Intel" });
    }
  }

  /**
   * Discover nearby rooms for expansion
   */
  public discoverNearbyRooms(empire: EmpireMemory): void {
    // Only discover every N ticks
    if (Game.time % this.config.roomDiscoveryInterval !== 0) {
      return;
    }

    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    if (ownedRooms.length === 0) {
      return;
    }

    const roomsToDiscover: string[] = [];

    // Find nearby rooms around owned rooms
    for (const owned of ownedRooms) {
      const exits = Game.map.describeExits(owned.name);
      if (!exits) {
        continue;
      }

      for (const exitRoomName of Object.values(exits)) {
        if (!exitRoomName) continue;

        // Skip if already known
        if (empire.knownRooms[exitRoomName]) {
          continue;
        }

        // Check linear distance
        const dist = Game.map.getRoomLinearDistance(owned.name, exitRoomName);
        if (dist <= this.config.maxRoomDiscoveryDistance) {
          roomsToDiscover.push(exitRoomName);
        }
      }
    }

    // Limit discovery to avoid memory spikes
    const toDiscover = roomsToDiscover.slice(0, this.config.maxRoomsToDiscoverPerTick);

    for (const roomName of toDiscover) {
      // Create stub intel entry (will be updated when room becomes visible)
      empire.knownRooms[roomName] = this.createStubIntel(roomName);
    }

    if (toDiscover.length > 0 && Game.time % 500 === 0) {
      logger.info(`Discovered ${toDiscover.length} new rooms`, { subsystem: "Intel" });
    }
  }

  /**
   * Create stub intel entry for undiscovered room
   */
  private createStubIntel(roomName: string): RoomIntel {
    return buildStubRoomIntel(roomName);
  }

  /**
   * Create full intel entry from visible room
   */
  private createRoomIntel(room: Room): RoomIntel {
    return buildVisibleRoomIntel(createVisibleRoomSnapshot(room));
  }

  /**
   * Update existing intel entry with current room data
   */
  private updateRoomIntel(intel: RoomIntel, room: Room): void {
    Object.assign(intel, mergeRoomIntel(intel, buildVisibleRoomIntel(createVisibleRoomSnapshot(room))));
  }
}

function createVisibleRoomSnapshot(room: Room): VisibleRoomIntelSnapshot {
  const sources = room.find(FIND_SOURCES);
  const mineral = room.find(FIND_MINERALS)[0];
  const controller = room.controller;
  const hostiles = getActualHostileCreeps(room);
  const hostileStructures = getActualHostileStructures(room);
  const portals = room.find(FIND_STRUCTURES, { filter: structure => structure.structureType === STRUCTURE_PORTAL });
  const terrain = room.getTerrain();
  let plains = 0;
  let swamps = 0;

  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      const tile = terrain.get(x, y);
      if (tile === TERRAIN_MASK_SWAMP) swamps++;
      else if (tile === 0) plains++;
    }
  }

  return {
    roomName: room.name,
    tick: Game.time,
    sources: sources.length,
    controllerLevel: controller?.level ?? 0,
    owner: controller?.owner?.username,
    reserver: controller?.reservation?.username,
    mineralType: mineral?.mineralType,
    hostileCreeps: hostiles.length,
    hostileTowers: hostileStructures.filter(structure => structure.structureType === STRUCTURE_TOWER).length,
    hostileSpawns: hostileStructures.filter(structure => structure.structureType === STRUCTURE_SPAWN).length,
    portals: portals.length,
    terrain: { plains, swamps }
  };
}

/**
 * Global room intel manager instance
 */
export const roomIntelManager = new RoomIntelManager();
