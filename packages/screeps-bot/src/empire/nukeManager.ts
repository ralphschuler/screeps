/**
 * Nuke Manager - Nuclear Warfare
 *
 * Manages nuke operations:
 * - Nuke candidate scoring
 * - Ghodium accumulation
 * - Nuker resource loading
 * - Nuke launch decisions
 * - Coordination with siege timing
 * - Incoming nuke detection
 * - Resource management coordination
 *
 * Addresses Issue: #24
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import type { SquadDefinition } from "../memory/schemas";
import type { TerminalManager } from "../economy/terminalManager";

/**
 * Nuke Manager Configuration
 */
export interface NukeConfig {
  /** Update interval in ticks */
  updateInterval: number;
  /** Minimum ghodium to launch nuke */
  minGhodium: number;
  /** Minimum energy to launch nuke */
  minEnergy: number;
  /** Minimum score to launch nuke */
  minScore: number;
  /** Ticks before nuke impact to coordinate siege attack */
  siegeCoordinationWindow: number;
  /** Nuke flight time in ticks */
  nukeFlightTime: number;
  /** Priority for terminal transfer of nuke resources */
  terminalPriority: number;
  /** Buffer amount of resources to keep in donor room */
  donorRoomBuffer: number;
}

const DEFAULT_CONFIG: NukeConfig = {
  updateInterval: 500,
  minGhodium: 5000,
  minEnergy: 300000,
  minScore: 50,
  siegeCoordinationWindow: 1000, // Start coordinating 1000 ticks before impact
  nukeFlightTime: 50000,
  terminalPriority: 5, // High priority for nuke resource transfers
  donorRoomBuffer: 1000 // Keep 1000 units buffer in donor rooms
};

/**
 * Nuke candidate scoring factors
 */
interface NukeScore {
  roomName: string;
  score: number;
  reasons: string[];
}

/**
 * Nuke Manager Class
 */
@ProcessClass()
export class NukeManager {
  private config: NukeConfig;
  private lastRun = 0;

  public constructor(config: Partial<NukeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main nuke tick
   * Registered as kernel process via decorator
   */
  @LowFrequencyProcess("empire:nuke", "Nuke Manager", {
    priority: ProcessPriority.LOW,
    interval: 500,
    minBucket: 8000,
    cpuBudget: 0.01
  })
  public run(): void {
    this.lastRun = Game.time;

    // Detect incoming nukes
    this.detectIncomingNukes();

    // Manage resource accumulation
    this.manageNukeResources();

    // Load nukers with resources
    this.loadNukers();

    // Evaluate nuke candidates
    this.evaluateNukeCandidates();

    // Check for siege coordination opportunities
    this.coordinateWithSieges();

    // Launch nukes if appropriate
    this.launchNukes();
  }

  /**
   * Load nukers with energy and ghodium
   */
  private loadNukers(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const nuker = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_NUKER
      })[0] as StructureNuker | undefined;

      if (!nuker) continue;

      // Check if nuker needs resources
      const energyNeeded = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
      const ghodiumNeeded = nuker.store.getFreeCapacity(RESOURCE_GHODIUM);

      if (energyNeeded > 0 || ghodiumNeeded > 0) {
        logger.debug(`Nuker in ${roomName} needs ${energyNeeded} energy, ${ghodiumNeeded} ghodium`, {
          subsystem: "Nuke"
        });
        // Terminal manager should handle transfers
      }
    }
  }

  /**
   * Evaluate nuke candidates
   */
  private evaluateNukeCandidates(): void {
    const overmind = memoryManager.getOvermind();

    // Clear old candidates
    overmind.nukeCandidates = [];

    // Only evaluate if in war mode
    if (!overmind.objectives.warMode) {
      return;
    }

    // Score all war targets
    for (const roomName of overmind.warTargets) {
      const score = this.scoreNukeCandidate(roomName);
      if (score.score >= this.config.minScore) {
        overmind.nukeCandidates.push({
          roomName,
          score: score.score,
          launched: false,
          launchTick: 0
        });

        logger.info(`Nuke candidate: ${roomName} (score: ${score.score}) - ${score.reasons.join(", ")}`, {
          subsystem: "Nuke"
        });
      }
    }

    // Sort by score
    overmind.nukeCandidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a nuke candidate
   */
  private scoreNukeCandidate(roomName: string): NukeScore {
    let score = 0;
    const reasons: string[] = [];

    const intel = memoryManager.getOvermind().roomIntel[roomName];
    if (!intel) {
      return { roomName, score: 0, reasons: ["No intel"] };
    }

    // Owned room bonus
    if (intel.owner && intel.owner !== "") {
      score += 30;
      reasons.push("Owned room");
    }

    // High threat bonus
    if (intel.threatLevel >= 2) {
      score += 20;
      reasons.push("High threat");
    }

    // Tower count bonus (more towers = better target)
    if (intel.towerCount) {
      score += intel.towerCount * 5;
      reasons.push(`${intel.towerCount} towers`);
    }

    // Spawn count bonus
    if (intel.spawnCount) {
      score += intel.spawnCount * 10;
      reasons.push(`${intel.spawnCount} spawns`);
    }

    // Controller level bonus
    if (intel.controllerLevel) {
      score += intel.controllerLevel * 3;
      reasons.push(`RCL ${intel.controllerLevel}`);
    }

    // Distance penalty (prefer closer targets)
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    if (ownedRooms.length > 0) {
      const minDistance = Math.min(...ownedRooms.map(r => Game.map.getRoomLinearDistance(roomName, r.name)));
      score -= minDistance * 2;
      reasons.push(`${minDistance} rooms away`);
    }

    // War target bonus
    if (memoryManager.getOvermind().warTargets.includes(roomName)) {
      score += 15;
      reasons.push("War target");
    }

    return { roomName, score, reasons };
  }

  /**
   * Launch nukes at top candidates
   */
  private launchNukes(): void {
    const overmind = memoryManager.getOvermind();

    // Only launch if in war mode
    if (!overmind.objectives.warMode) {
      return;
    }

    // Get all nukers
    const nukers: StructureNuker[] = [];
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const nuker = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_NUKER
      })[0] as StructureNuker | undefined;

      if (
        nuker &&
        nuker.store.getUsedCapacity(RESOURCE_ENERGY) >= this.config.minEnergy &&
        nuker.store.getUsedCapacity(RESOURCE_GHODIUM) >= this.config.minGhodium
      ) {
        nukers.push(nuker);
      }
    }

    if (nukers.length === 0) {
      return; // No ready nukers
    }

    // Launch at top candidates
    for (const candidate of overmind.nukeCandidates) {
      if (candidate.launched) continue;

      // Find a nuker in range
      for (const nuker of nukers) {
        const distance = Game.map.getRoomLinearDistance(nuker.room.name, candidate.roomName);
        if (distance > 10) continue; // Out of range

        // Get target position (center of room)
        const targetPos = new RoomPosition(25, 25, candidate.roomName);

        const result = nuker.launchNuke(targetPos);
        if (result === OK) {
          candidate.launched = true;
          candidate.launchTick = Game.time;

          logger.warn(`NUKE LAUNCHED from ${nuker.room.name} to ${candidate.roomName}!`, { subsystem: "Nuke" });

          // Remove this nuker from available list
          const index = nukers.indexOf(nuker);
          if (index > -1) {
            nukers.splice(index, 1);
          }

          break;
        } else {
          logger.error(`Failed to launch nuke: ${result}`, { subsystem: "Nuke" });
        }
      }

      if (nukers.length === 0) {
        break; // No more nukers available
      }
    }
  }

  /**
   * Detect incoming nukes in owned rooms
   */
  private detectIncomingNukes(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const swarm = memoryManager.getSwarmState(roomName);
      if (!swarm) continue;

      const nukes = room.find(FIND_NUKES);

      if (nukes.length > 0 && !swarm.nukeDetected) {
        // First detection - update pheromones and log
        swarm.nukeDetected = true;
        swarm.pheromones.defense = Math.min(100, swarm.pheromones.defense + 50);
        swarm.danger = 3 as 0 | 1 | 2 | 3;

        const impactTicks = Math.min(...nukes.map(n => n.timeToLand ?? Infinity));
        logger.warn(
          `INCOMING NUKE DETECTED in ${roomName}! Impact in ${impactTicks} ticks (${nukes.length} nuke${nukes.length > 1 ? "s" : ""})`,
          { subsystem: "Nuke" }
        );

        // Add to event log
        swarm.eventLog.push({
          type: "nuke_incoming",
          time: Game.time,
          details: `${nukes.length} nuke(s), impact in ${impactTicks} ticks`
        });

        // Trim event log
        if (swarm.eventLog.length > 20) {
          swarm.eventLog.shift();
        }
      } else if (nukes.length === 0 && swarm.nukeDetected) {
        // Nukes cleared (either impacted or something else)
        swarm.nukeDetected = false;
        logger.info(`Nuke threat cleared in ${roomName}`, { subsystem: "Nuke" });
      }
    }
  }

  /**
   * Manage resource accumulation for nukers
   * Coordinates with terminal manager to prepare nuke resources
   */
  private manageNukeResources(): void {
    // Only manage resources if in war mode
    const overmind = memoryManager.getOvermind();
    if (!overmind.objectives.warMode) return;

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const nuker = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_NUKER
      })[0] as StructureNuker | undefined;

      if (!nuker) continue;

      const terminal = room.terminal;
      if (!terminal || !terminal.my) continue;

      // Check what resources nuker needs
      const energyNeeded = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
      const ghodiumNeeded = nuker.store.getFreeCapacity(RESOURCE_GHODIUM);

      // Request ghodium if needed and terminal doesn't have enough
      if (ghodiumNeeded > 0) {
        const terminalGhodium = terminal.store.getUsedCapacity(RESOURCE_GHODIUM) ?? 0;
        if (terminalGhodium < ghodiumNeeded) {
          // Create terminal transfer request (implementation depends on terminal manager)
          this.requestResourceTransfer(roomName, RESOURCE_GHODIUM, ghodiumNeeded - terminalGhodium);
        }
      }

      // Log nuker readiness status
      if (energyNeeded === 0 && ghodiumNeeded === 0) {
        if ((nuker as { _readyLogged?: boolean })._readyLogged !== true) {
          logger.info(`Nuker in ${roomName} is fully loaded and ready to launch`, {
            subsystem: "Nuke"
          });
          (nuker as { _readyLogged?: boolean })._readyLogged = true;
        }
      } else {
        (nuker as { _readyLogged?: boolean })._readyLogged = false;
      }
    }
  }

  /**
   * Request resource transfer via terminal
   * Uses lazy import to avoid circular dependency
   */
  private requestResourceTransfer(roomName: string, resourceType: ResourceConstant, amount: number): void {
    // Find a donor room with this resource
    const donorRoom = this.findDonorRoom(roomName, resourceType, amount);
    if (!donorRoom) {
      logger.debug(
        `No donor room found for ${amount} ${resourceType} to ${roomName}`,
        { subsystem: "Nuke" }
      );
      return;
    }

    // Import terminal manager at runtime to avoid circular dependencies
    // This is necessary because terminalManager may import other modules that import nukeManager
    void import("../economy/terminalManager").then(module => {
      const success = module.terminalManager.requestTransfer(
        donorRoom,
        roomName,
        resourceType,
        amount,
        this.config.terminalPriority
      );

      if (success) {
        logger.info(
          `Requested ${amount} ${resourceType} transfer from ${donorRoom} to ${roomName} for nuker`,
          { subsystem: "Nuke" }
        );
      }
    }).catch(error => {
      logger.error(`Failed to request terminal transfer: ${error}`, { subsystem: "Nuke" });
    });
  }

  /**
   * Find a room that can donate the requested resource
   */
  private findDonorRoom(targetRoom: string, resourceType: ResourceConstant, amount: number): string | null {
    const candidates: { room: string; amount: number; distance: number }[] = [];

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my || roomName === targetRoom) continue;

      const terminal = room.terminal;
      if (!terminal || !terminal.my) continue;

      const available = terminal.store.getUsedCapacity(resourceType) ?? 0;
      
      // Must have at least the requested amount + buffer
      if (available < amount + this.config.donorRoomBuffer) continue;

      const distance = Game.map.getRoomLinearDistance(roomName, targetRoom);
      candidates.push({ room: roomName, amount: available, distance });
    }

    if (candidates.length === 0) return null;

    // Sort by distance (prefer closer rooms)
    candidates.sort((a, b) => a.distance - b.distance);

    return candidates[0]?.room ?? null;
  }

  /**
   * Coordinate nuke launches with siege squads
   * Ensures nukes land when siege squads arrive
   */
  private coordinateWithSieges(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.objectives.warMode) return;

    // Get all clusters with active squads
    const clusters = memoryManager.getClusters();

    for (const cluster of Object.values(clusters)) {
      if (!cluster.squads || cluster.squads.length === 0) continue;

      // Find siege squads
      const siegeSquads = cluster.squads.filter(s => s.type === "siege");

      for (const squad of siegeSquads) {
        if (squad.state !== "moving" && squad.state !== "attacking") continue;

        // Check if squad is targeting a nuke candidate
        const targetRoom = squad.targetRooms[0];
        if (!targetRoom) continue;

        const nukeCandidate = overmind.nukeCandidates.find(c => c.roomName === targetRoom);
        if (!nukeCandidate) continue;

        // Don't launch if already launched
        if (nukeCandidate.launched) continue;

        // Estimate squad ETA to target
        const squadEta = this.estimateSquadEta(squad, targetRoom);

        // Calculate when to launch nuke so it arrives shortly before squad
        const optimalLaunchTick = squadEta - this.config.nukeFlightTime + this.config.siegeCoordinationWindow;

        if (Game.time >= optimalLaunchTick) {
          logger.info(
            `Nuke launch window opened for ${targetRoom} - siege squad ${squad.id} ETA: ${squadEta} ticks`,
            { subsystem: "Nuke" }
          );

          // Increase nukeTarget pheromone to signal readiness
          // This will be picked up by the launch logic
          const targetSwarm = memoryManager.getSwarmState(targetRoom);
          if (targetSwarm) {
            targetSwarm.pheromones.nukeTarget = Math.min(100, targetSwarm.pheromones.nukeTarget + 50);
          }
        }
      }
    }
  }

  /**
   * Estimate ticks until squad reaches target
   */
  private estimateSquadEta(squad: SquadDefinition, targetRoom: string): number {
    // Find average position of squad members
    const members = squad.members
      .map(name => Game.creeps[name])
      .filter(c => c !== undefined);

    if (members.length === 0) {
      // Squad not spawned yet, estimate from rally room
      const distance = Game.map.getRoomLinearDistance(squad.rallyRoom, targetRoom);
      return distance * 50; // Rough estimate: 50 ticks per room
    }

    // Use closest member to target as estimate
    const distances = members.map(creep => {
      const distance = Game.map.getRoomLinearDistance(creep.room.name, targetRoom);
      return distance * 50; // Rough estimate
    });

    return Math.min(...distances);
  }
}

/**
 * Global nuke manager instance
 */
export const nukeManager = new NukeManager();
