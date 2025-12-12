/**
 * AllianceDiplomacy - High-level integration layer
 * 
 * Connects SimpleAlliesManager with the bot's empire management systems.
 * Handles:
 * - Request generation from our rooms
 * - Response to ally requests
 * - Player reputation tracking
 * - Coordination with existing terminal/defense systems
 * 
 * ARCHITECTURE:
 * This module acts as a bridge between:
 * - SimpleAlliesManager (segment communication)
 * - Empire systems (terminals, defense, spawning)
 * - Memory management (player tracking, threats)
 */

import { simpleAllies } from "../standards/SimpleAlliesManager";
import type {
  ResourceRequest,
  DefenseRequest,
  AttackRequest,
  PlayerRequest,
  EconRequest,
  RoomRequest
} from "../standards/types/allianceTypes";
import { logger } from "../core/logger";

/**
 * Player reputation tracker for diplomacy
 */
interface PlayerReputation {
  name: string;
  hate: number; // 0-1 where 1 is maximum hostility
  lastAttack?: number; // Game tick
  allyReportedAttacks: number; // Count of allies reporting attacks
}

/**
 * Memory storage for alliance data
 */
interface AllianceDiplomacyMemory {
  playerReputations: Record<string, PlayerReputation>;
  lastProcessedTick: number;
}

// Augment the global Memory interface
declare global {
  interface Memory {
    allianceDiplomacy?: AllianceDiplomacyMemory;
  }
}

/**
 * Get or initialize alliance memory
 */
function getAllianceMemory(): AllianceDiplomacyMemory {
  if (!Memory.allianceDiplomacy) {
    Memory.allianceDiplomacy = {
      playerReputations: {},
      lastProcessedTick: 0
    };
  }
  // Safe to assert non-null since we initialize it above if undefined
  return Memory.allianceDiplomacy as AllianceDiplomacyMemory;
}

/**
 * Generate our resource requests based on room needs
 */
function generateResourceRequests(): void {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    const storage = room.storage;
    const terminal = room.terminal;

    // Request energy if we're critically low and have a terminal
    if (terminal && storage) {
      const totalEnergy = storage.store[RESOURCE_ENERGY] + terminal.store[RESOURCE_ENERGY];
      
      // Critical energy shortage
      if (totalEnergy < 50000) {
        simpleAllies.requestResource({
          priority: 0.9,
          roomName: room.name,
          resourceType: RESOURCE_ENERGY,
          amount: 100000 - totalEnergy,
          terminal: true
        });
      }
      
      // Need specific minerals for labs
      if (room.controller.level >= 6) {
        const neededMinerals = getNeededMinerals(room);
        for (const [resource, amount] of Object.entries(neededMinerals)) {
          simpleAllies.requestResource({
            priority: 0.5,
            roomName: room.name,
            resourceType: resource as ResourceConstant,
            amount: amount,
            terminal: true
          });
        }
      }
    }
  }
}

/**
 * Determine which minerals a room needs for its lab operations
 */
function getNeededMinerals(room: Room): Record<string, number> {
  const needed: Record<string, number> = {};
  const terminal = room.terminal;
  
  if (!terminal) return needed;

  // Check for basic minerals needed for tier 1 compounds
  const basicMinerals: MineralConstant[] = [
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST
  ];

  for (const mineral of basicMinerals) {
    const current = terminal.store[mineral] || 0;
    if (current < 3000) {
      needed[mineral] = 5000 - current;
    }
  }

  return needed;
}

/**
 * Generate defense requests for rooms under attack
 */
function generateDefenseRequests(): void {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    // Check for hostiles
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      // Calculate priority based on threat level
      const totalHostileParts = hostiles.reduce((sum, creep) => sum + creep.body.length, 0);
      const priority = Math.min(1.0, totalHostileParts / 50);

      simpleAllies.requestDefense({
        roomName: room.name,
        priority: priority
      });
    }
  }
}

/**
 * Share economic status with allies
 */
function generateEconRequest(): void {
  let totalCredits = Game.market.credits || 0;
  let totalEnergy = 0;
  let energyIncome = 0;
  const mineralNodes: Record<string, number> = {};

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller?.my) continue;

    if (room.storage) {
      totalEnergy += room.storage.store[RESOURCE_ENERGY] || 0;
    }
    if (room.terminal) {
      totalEnergy += room.terminal.store[RESOURCE_ENERGY] || 0;
    }

    // Count mineral nodes
    const minerals = room.find(FIND_MINERALS);
    for (const mineral of minerals) {
      mineralNodes[mineral.mineralType] = (mineralNodes[mineral.mineralType] || 0) + 1;
    }
  }

  // Calculate sharable energy (50% of total, with reserve)
  const sharableEnergy = Math.max(0, Math.floor((totalEnergy - 100000) * 0.5));

  simpleAllies.requestEcon({
    credits: totalCredits,
    sharableEnergy: sharableEnergy,
    energyIncome: energyIncome, // TODO: Implement energy income tracking
                                // Issue URL: https://github.com/ralphschuler/screeps/issues/473
    mineralNodes: mineralNodes as any
  });
}

/**
 * Share room intelligence with allies
 */
function generateRoomRequests(): void {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    
    // Only share info about rooms we can see
    if (!room.controller) continue;

    // Share owned rooms
    if (room.controller.owner) {
      const storage = room.storage;
      const terminal = room.terminal;
      const towers = room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER
      });

      const ramparts = room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_RAMPART
      }) as StructureRampart[];

      const avgRampartHits = ramparts.length > 0
        ? ramparts.reduce((sum, r) => sum + r.hits, 0) / ramparts.length
        : 0;

      const totalEnergy = (storage?.store[RESOURCE_ENERGY] || 0) + 
                         (terminal?.store[RESOURCE_ENERGY] || 0);

      simpleAllies.requestRoom({
        roomName: room.name,
        playerName: room.controller.owner.username,
        lastScout: Game.time,
        rcl: room.controller.level,
        energy: totalEnergy,
        towers: towers.length,
        avgRampartHits: avgRampartHits,
        terminal: terminal !== undefined
      });
    }
  }
}

/**
 * Process player reputation data from allies
 */
function processPlayerReputations(): void {
  const allianceMemory = getAllianceMemory();
  const playerRequests = simpleAllies.getPlayerRequests();

  for (const request of playerRequests) {
    const existing = allianceMemory.playerReputations[request.playerName];
    
    if (!existing) {
      // New player reputation
      allianceMemory.playerReputations[request.playerName] = {
        name: request.playerName,
        hate: request.hate || 0,
        lastAttack: request.lastAttackedBy,
        allyReportedAttacks: request.lastAttackedBy ? 1 : 0
      };
    } else {
      // Update existing reputation
      // Average hate values from multiple allies
      existing.hate = Math.max(existing.hate || 0, request.hate || 0);
      
      if (request.lastAttackedBy) {
        existing.lastAttack = Math.max(existing.lastAttack || 0, request.lastAttackedBy);
        existing.allyReportedAttacks++;
      }
    }
  }

  // Decay old reputations over time (every 10000 ticks, reduce by 10%)
  if (Game.time % 10000 === 0) {
    for (const name in allianceMemory.playerReputations) {
      const rep = allianceMemory.playerReputations[name];
      rep.hate = Math.max(0, rep.hate * 0.9);
      
      // Remove if hate is very low and no recent attacks
      if (rep.hate < 0.1 && (!rep.lastAttack || Game.time - rep.lastAttack > 50000)) {
        delete allianceMemory.playerReputations[name];
      }
    }
  }
}

/**
 * Get player hate level (0-1)
 * Used by defense and military systems
 */
export function getPlayerHate(playerName: string): number {
  const allianceMemory = getAllianceMemory();
  return allianceMemory.playerReputations[playerName]?.hate || 0;
}

/**
 * Report a player attack to allies
 */
export function reportPlayerAttack(playerName: string, roomName: string): void {
  const allianceMemory = getAllianceMemory();
  
  if (!allianceMemory.playerReputations[playerName]) {
    allianceMemory.playerReputations[playerName] = {
      name: playerName,
      hate: 0.5, // Start with moderate hate
      lastAttack: Game.time,
      allyReportedAttacks: 0
    };
  }

  const rep = allianceMemory.playerReputations[playerName];
  rep.lastAttack = Game.time;
  rep.hate = Math.min(1.0, rep.hate + 0.2); // Increase hate

  // Report to allies
  simpleAllies.requestPlayer({
    playerName: playerName,
    hate: rep.hate,
    lastAttackedBy: Game.time
  });

  logger.warn(`Player ${playerName} attacked ${roomName}, hate level: ${rep.hate.toFixed(2)}`);
}

/**
 * Main alliance diplomacy tick
 * Call from your main loop
 */
export function runAllianceDiplomacy(): void {
  // Skip if not enabled
  if (!simpleAllies.isEnabled()) {
    return;
  }

  const allianceMemory = getAllianceMemory();

  // Avoid processing multiple times per tick
  if (allianceMemory.lastProcessedTick === Game.time) {
    return;
  }

  // Generate our requests (what we need from allies)
  generateResourceRequests();
  generateDefenseRequests();
  generateEconRequest();
  generateRoomRequests();

  // Process ally requests (what allies need from us)
  processPlayerReputations();

  // TODO: Implement response handlers for ally requests
  // Issue URL: https://github.com/ralphschuler/screeps/issues/472
  // - processResourceRequests() - fulfill resource requests via terminal
  // - processDefenseRequests() - send military support
  // - processAttackRequests() - coordinate attacks
  // - processWorkRequests() - send construction/repair support

  allianceMemory.lastProcessedTick = Game.time;
}
