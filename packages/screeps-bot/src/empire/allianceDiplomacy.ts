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
  RoomRequest,
  WorkRequest
} from "../standards/types/allianceTypes";
import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { terminalManager } from "../economy/terminalManager";

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

/**
 * Get or initialize alliance memory
 */
function getAllianceMemory(): AllianceDiplomacyMemory {
  const mem = Memory as { allianceDiplomacy?: AllianceDiplomacyMemory };
  if (!mem.allianceDiplomacy) {
    mem.allianceDiplomacy = {
      playerReputations: {},
      lastProcessedTick: 0
    };
  }
  return mem.allianceDiplomacy;
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

    // Calculate energy income from swarm metrics (rolling average of energy harvested per tick)
    const swarm = memoryManager.getSwarmState(roomName);
    if (swarm && typeof swarm.metrics.energyHarvested === 'number') {
      energyIncome += swarm.metrics.energyHarvested;
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
    energyIncome: energyIncome,
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
 * Process resource requests from allies and fulfill via terminal
 */
function processResourceRequests(): void {
  const resourceRequests = simpleAllies.getResourceRequests();
  const currentAlly = simpleAllies.getCurrentAlly();
  
  if (!currentAlly || resourceRequests.length === 0) {
    return;
  }

  // Get our rooms with terminals
  const roomsWithTerminals = Object.values(Game.rooms).filter(
    r => r.controller?.my && r.terminal && r.terminal.my && r.terminal.isActive()
  );

  if (roomsWithTerminals.length === 0) {
    return;
  }

  // Sort requests by priority (highest first)
  const sortedRequests = [...resourceRequests].sort((a, b) => b.priority - a.priority);

  // Process each request
  for (const request of sortedRequests) {
    // Only process terminal requests (we don't haul resources to ally rooms)
    if (!request.terminal) {
      continue;
    }

    // Find target room terminal
    const targetRoom = Game.rooms[request.roomName];
    if (!targetRoom || !targetRoom.terminal) {
      logger.debug(
        `Cannot fulfill resource request: ally room ${request.roomName} not visible or has no terminal`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Check if target room belongs to our ally
    const targetOwner = targetRoom.controller?.owner?.username;
    if (targetOwner !== currentAlly) {
      logger.debug(
        `Skipping resource request: room ${request.roomName} not owned by current ally ${currentAlly}`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Find a room that can fulfill this request
    let fulfilled = false;
    for (const sourceRoom of roomsWithTerminals) {
      const sourceTerminal = sourceRoom.terminal!;
      
      // Check if we have enough of the resource
      const available = sourceTerminal.store.getUsedCapacity(request.resourceType);
      if (available < request.amount * 0.5) {
        // Don't even try if we have less than 50% of requested amount
        continue;
      }

      // Calculate how much we can send
      const sendAmount = Math.min(available, request.amount);
      
      // Check if we can spare this resource
      const storage = sourceRoom.storage;
      const totalInRoom = available + (storage?.store.getUsedCapacity(request.resourceType) || 0);
      
      // Keep some reserve for our own use (25% or minimum 5k for energy)
      const minReserve = request.resourceType === RESOURCE_ENERGY ? 
        Math.max(50000, totalInRoom * 0.25) : 
        Math.max(1000, totalInRoom * 0.25);
      
      if (totalInRoom - sendAmount < minReserve) {
        logger.debug(
          `Cannot fulfill request: insufficient ${request.resourceType} in ${sourceRoom.name} after reserve`,
          { subsystem: "Alliance" }
        );
        continue;
      }

      // Check transfer cost
      const cost = Game.market.calcTransactionCost(sendAmount, sourceRoom.name, request.roomName);
      const costRatio = cost / sendAmount;
      
      // Be more generous with allies (higher cost ratio allowed than internal transfers)
      if (costRatio > 0.2) {
        logger.debug(
          `Skipping resource transfer to ally: cost ratio ${costRatio.toFixed(2)} too high`,
          { subsystem: "Alliance" }
        );
        continue;
      }

      // Queue the transfer with high priority
      const success = terminalManager.requestTransfer(
        sourceRoom.name,
        request.roomName,
        request.resourceType,
        sendAmount,
        5 // High priority for ally requests
      );

      if (success) {
        logger.info(
          `Queued resource transfer for ally ${currentAlly}: ${sendAmount} ${request.resourceType} from ${sourceRoom.name} to ${request.roomName}`,
          { subsystem: "Alliance" }
        );
        fulfilled = true;
        break;
      }
    }

    if (!fulfilled) {
      logger.debug(
        `Could not fulfill resource request from ally ${currentAlly}: ${request.amount} ${request.resourceType} for ${request.roomName}`,
        { subsystem: "Alliance" }
      );
    }
  }
}

/**
 * Process defense requests from allies and send military support
 */
function processDefenseRequests(): void {
  const defenseRequests = simpleAllies.getDefenseRequests();
  const currentAlly = simpleAllies.getCurrentAlly();
  
  if (!currentAlly || defenseRequests.length === 0) {
    return;
  }

  // Sort by priority (highest first)
  const sortedRequests = [...defenseRequests].sort((a, b) => b.priority - a.priority);

  for (const request of sortedRequests) {
    const targetRoom = Game.rooms[request.roomName];
    
    // We can only help if we can see the room
    if (!targetRoom) {
      logger.debug(
        `Cannot assist with defense: ally room ${request.roomName} not visible`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Verify room belongs to our ally
    const targetOwner = targetRoom.controller?.owner?.username;
    if (targetOwner !== currentAlly) {
      logger.debug(
        `Skipping defense request: room ${request.roomName} not owned by current ally ${currentAlly}`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Check if there are actual hostiles
    const hostiles = targetRoom.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length === 0) {
      logger.debug(
        `Skipping defense request: no hostiles in ${request.roomName}`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Find our nearby rooms that can help
    const ownedRooms = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.name !== request.roomName
    );

    // Find available military units
    let assignedCount = 0;
    for (const sourceRoom of ownedRooms) {
      const distance = Game.map.getRoomLinearDistance(sourceRoom.name, request.roomName);
      
      // Only help if room is reasonably close (max 5 rooms away)
      if (distance > 5) {
        continue;
      }

      // Find available defenders (not already assigned)
      const availableDefenders = sourceRoom.find(FIND_MY_CREEPS, {
        filter: c => {
          const memory = c.memory as unknown as { role?: string; assistTarget?: string };
          const role = memory.role;
          return (role === "guard" || role === "ranger") && !memory.assistTarget;
        }
      });

      // Assign up to 2 defenders from this room
      const toAssign = Math.min(availableDefenders.length, 2);
      
      for (let i = 0; i < toAssign; i++) {
        const defender = availableDefenders[i];
        const memory = defender.memory as unknown as { assistTarget?: string; allyAssist?: string };
        memory.assistTarget = request.roomName;
        memory.allyAssist = currentAlly;
        
        assignedCount++;
        logger.info(
          `Assigned ${defender.name} from ${sourceRoom.name} to assist ally ${currentAlly} in ${request.roomName}`,
          { subsystem: "Alliance" }
        );
      }

      // Stop after assigning 4 total defenders
      if (assignedCount >= 4) {
        break;
      }
    }

    if (assignedCount > 0) {
      logger.info(
        `Sent ${assignedCount} defenders to assist ally ${currentAlly} in ${request.roomName}`,
        { subsystem: "Alliance" }
      );
    } else {
      logger.debug(
        `No available defenders to assist ally ${currentAlly} in ${request.roomName}`,
        { subsystem: "Alliance" }
      );
    }
  }
}

/**
 * Process attack requests from allies and coordinate attacks
 */
function processAttackRequests(): void {
  const attackRequests = simpleAllies.getAttackRequests();
  const currentAlly = simpleAllies.getCurrentAlly();
  
  if (!currentAlly || attackRequests.length === 0) {
    return;
  }

  // Sort by priority (highest first)
  const sortedRequests = [...attackRequests].sort((a, b) => b.priority - a.priority);

  for (const request of sortedRequests) {
    // TODO: Implement attack coordination logic
    // This requires integration with military planning systems
    // For now, log the request for future implementation
    
    logger.info(
      `Attack request from ally ${currentAlly} for room ${request.roomName} (priority: ${request.priority.toFixed(2)})`,
      { subsystem: "Alliance" }
    );

    // TODO: Evaluate if we should participate in this attack
    // - Check distance to target
    // - Assess our military capacity
    // - Check for conflicts with our own war plans
    // - Coordinate rally points and timing
    // - Assign military squads to the operation
    
    logger.debug(
      `Attack coordination not yet implemented - request logged`,
      { subsystem: "Alliance" }
    );
  }
}

/**
 * Process work requests from allies and send construction/repair support
 */
function processWorkRequests(): void {
  const workRequests = simpleAllies.getWorkRequests();
  const currentAlly = simpleAllies.getCurrentAlly();
  
  if (!currentAlly || workRequests.length === 0) {
    return;
  }

  // Sort by priority (highest first)
  const sortedRequests = [...workRequests].sort((a, b) => b.priority - a.priority);

  for (const request of sortedRequests) {
    const targetRoom = Game.rooms[request.roomName];
    
    // We can only help if we can see the room
    if (!targetRoom) {
      logger.debug(
        `Cannot assist with work: ally room ${request.roomName} not visible`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Verify room belongs to our ally
    const targetOwner = targetRoom.controller?.owner?.username;
    if (targetOwner !== currentAlly) {
      logger.debug(
        `Skipping work request: room ${request.roomName} not owned by current ally ${currentAlly}`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Check if there is work to do
    const hasConstructionSites = request.workType === "build" && 
      targetRoom.find(FIND_CONSTRUCTION_SITES).length > 0;
    const hasRepairTargets = request.workType === "repair" && 
      targetRoom.find(FIND_STRUCTURES, { 
        filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL 
      }).length > 0;

    if (!hasConstructionSites && !hasRepairTargets) {
      logger.debug(
        `Skipping work request: no ${request.workType} work in ${request.roomName}`,
        { subsystem: "Alliance" }
      );
      continue;
    }

    // Find our nearby rooms that can help
    const ownedRooms = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.name !== request.roomName
    );

    // Find available workers
    let assignedCount = 0;
    for (const sourceRoom of ownedRooms) {
      const distance = Game.map.getRoomLinearDistance(sourceRoom.name, request.roomName);
      
      // Only help if room is reasonably close (max 4 rooms away for workers)
      if (distance > 4) {
        continue;
      }

      // Find available workers (larvaWorker or similar work roles, not already assigned)
      const availableWorkers = sourceRoom.find(FIND_MY_CREEPS, {
        filter: c => {
          const memory = c.memory as unknown as { role?: string; assistTarget?: string };
          const role = memory.role;
          return (role === "larvaWorker" || role === "builder" || role === "repairer") && 
                 !memory.assistTarget;
        }
      });

      // Assign up to 2 workers from this room
      const toAssign = Math.min(availableWorkers.length, 2);
      
      for (let i = 0; i < toAssign; i++) {
        const worker = availableWorkers[i];
        const memory = worker.memory as unknown as { 
          assistTarget?: string; 
          allyAssist?: string;
          workType?: string;
        };
        memory.assistTarget = request.roomName;
        memory.allyAssist = currentAlly;
        memory.workType = request.workType;
        
        assignedCount++;
        logger.info(
          `Assigned ${worker.name} from ${sourceRoom.name} to assist ally ${currentAlly} with ${request.workType} in ${request.roomName}`,
          { subsystem: "Alliance" }
        );
      }

      // Stop after assigning 3 total workers
      if (assignedCount >= 3) {
        break;
      }
    }

    if (assignedCount > 0) {
      logger.info(
        `Sent ${assignedCount} workers to assist ally ${currentAlly} with ${request.workType} in ${request.roomName}`,
        { subsystem: "Alliance" }
      );
    } else {
      logger.debug(
        `No available workers to assist ally ${currentAlly} in ${request.roomName}`,
        { subsystem: "Alliance" }
      );
    }
  }
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
  processResourceRequests();
  processDefenseRequests();
  processAttackRequests();
  processWorkRequests();

  allianceMemory.lastProcessedTick = Game.time;
}
