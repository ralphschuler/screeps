/**
 * Room Intel Manager
 * Handles room discovery, intel refreshing, and tracking
 */

import { logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory, RoomIntel } from "@ralphschuler/screeps-memory";

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
      for (const direction in exits) {
        const exitRoomName = exits[direction as ExitKey];
        
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
    // Parse room coordinates to determine type
    const parsed = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);
    if (!parsed) {
      throw new Error(`Invalid room name: ${roomName}`);
    }

    const x = parseInt(parsed[2], 10);
    const y = parseInt(parsed[4], 10);
    const isHighway = x % 10 === 0 || y % 10 === 0;
    const isSK = !isHighway && (x % 10 === 5 || y % 10 === 5);

    return {
      name: roomName,
      lastSeen: 0,
      sources: 0,
      controllerLevel: 0,
      threatLevel: 0,
      scouted: false,
      terrain: "mixed",
      isHighway,
      isSK
    };
  }

  /**
   * Create full intel entry from visible room
   */
  private createRoomIntel(room: Room): RoomIntel {
    const sources = room.find(FIND_SOURCES);
    const mineral = room.find(FIND_MINERALS)[0];
    const controller = room.controller;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const towers = room.find(FIND_HOSTILE_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    });
    const spawns = room.find(FIND_HOSTILE_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN
    });
    const portals = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_PORTAL
    });

    // Parse room coordinates
    const parsed = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(room.name);
    const x = parsed ? parseInt(parsed[2], 10) : 0;
    const y = parsed ? parseInt(parsed[4], 10) : 0;
    const isHighway = x % 10 === 0 || y % 10 === 0;
    const isSK = !isHighway && (x % 10 === 5 || y % 10 === 5);

    // Determine terrain type
    const terrain = room.getTerrain();
    let plainCount = 0;
    let swampCount = 0;
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const tile = terrain.get(x, y);
        if (tile === TERRAIN_MASK_SWAMP) {
          swampCount++;
        } else if (tile === 0) {
          plainCount++;
        }
      }
    }
    const terrainType = swampCount > plainCount ? "swamp" : swampCount > 100 ? "mixed" : "plains";

    return {
      name: room.name,
      lastSeen: Game.time,
      sources: sources.length,
      controllerLevel: controller?.level ?? 0,
      owner: controller?.owner?.username,
      reserver: controller?.reservation?.username,
      mineralType: mineral?.mineralType,
      threatLevel: hostiles.length > 0 ? 1 : 0,
      scouted: true,
      terrain: terrainType,
      isHighway,
      isSK,
      towerCount: towers.length,
      spawnCount: spawns.length,
      hasPortal: portals.length > 0
    };
  }

  /**
   * Update existing intel entry with current room data
   */
  private updateRoomIntel(intel: RoomIntel, room: Room): void {
    const sources = room.find(FIND_SOURCES);
    const mineral = room.find(FIND_MINERALS)[0];
    const controller = room.controller;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const towers = room.find(FIND_HOSTILE_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    });
    const spawns = room.find(FIND_HOSTILE_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN
    });
    const portals = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_PORTAL
    });

    // Update intel
    intel.lastSeen = Game.time;
    intel.sources = sources.length;
    intel.controllerLevel = controller?.level ?? 0;
    intel.owner = controller?.owner?.username;
    intel.reserver = controller?.reservation?.username;
    intel.mineralType = mineral?.mineralType;
    intel.threatLevel = hostiles.length > 0 ? 1 : 0;
    intel.scouted = true;
    intel.towerCount = towers.length;
    intel.spawnCount = spawns.length;
    intel.hasPortal = portals.length > 0;
  }
}

/**
 * Global room intel manager instance
 */
export const roomIntelManager = new RoomIntelManager();
