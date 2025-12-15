/**
 * Nuke Manager - Nuclear Warfare
 *
 * Manages nuke operations:
 * - Nuke candidate scoring
 * - Ghodium accumulation
 * - Nuker resource loading
 * - Nuke launch decisions
 * - Nuke salvo coordination for maximum impact
 * - Impact prediction and damage assessment
 * - Automatic siege squad deployment synchronized with nukes
 * - Incoming nuke detection and alert system
 * - Counter-nuke strategies
 * - Nuke economics analysis and ROI calculation
 * - Strategic target prioritization based on war goals
 *
 * Addresses Issue: #24
 */

import { memoryManager } from "../memory/manager";
import { logger } from "../core/logger";
import { LowFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import type { SquadDefinition, NukeInFlight, IncomingNukeAlert, NukeEconomics } from "../memory/schemas";
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
  /** Maximum time difference for salvo coordination (ticks) */
  salvoSyncWindow: number;
  /** ROI threshold multiplier (gain must be X times cost) */
  roiThreshold: number;
  /** Minimum war pheromone for counter-nuke */
  counterNukeWarThreshold: number;
}

const DEFAULT_CONFIG: NukeConfig = {
  updateInterval: 500,
  minGhodium: 5000,
  minEnergy: 300000,
  minScore: 35, // Updated from 50 to 35 per requirements
  siegeCoordinationWindow: 1000, // Start coordinating 1000 ticks before impact
  nukeFlightTime: 50000,
  terminalPriority: 5, // High priority for nuke resource transfers
  donorRoomBuffer: 1000, // Keep 1000 units buffer in donor rooms
  salvoSyncWindow: 10, // Nukes should hit within 10 ticks of each other
  roiThreshold: 2.0, // Expected gain must be at least 2x the cost
  counterNukeWarThreshold: 60 // War pheromone must be >= 60 for counter-nukes
};

/**
 * Nuke damage constants
 */
const NUKE_DAMAGE = {
  CENTER: 10000000, // 10M hits at center
  RADIUS: 5000000, // 5M hits in radius
  RANGE: 2 // Damage radius
};

/**
 * Nuke cost constants
 */
const NUKE_COST = {
  ENERGY: 300000,
  GHODIUM: 5000,
  SAFE_MODE_COOLDOWN: 200 // Safe mode cooldown after nuke impact
};

/**
 * Structure value estimates for damage assessment
 */
const STRUCTURE_VALUES: Record<string, number> = {
  [STRUCTURE_SPAWN]: 15000,
  [STRUCTURE_TOWER]: 5000,
  [STRUCTURE_STORAGE]: 30000,
  [STRUCTURE_TERMINAL]: 100000,
  [STRUCTURE_LAB]: 50000,
  [STRUCTURE_NUKER]: 100000,
  [STRUCTURE_POWER_SPAWN]: 100000,
  [STRUCTURE_OBSERVER]: 8000,
  [STRUCTURE_EXTENSION]: 3000,
  [STRUCTURE_LINK]: 5000
};

/**
 * Intel-based damage estimation weights
 */
const INTEL_DAMAGE_WEIGHTS = {
  TOWER_WEIGHT: 5,
  SPAWN_WEIGHT: 10,
  BASE_STRUCTURE_COUNT: 5
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
  private nukerReadyLogged: Set<string> = new Set();
  private terminalManager?: typeof import("../economy/terminalManager").terminalManager;

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
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.01
  })
  public run(): void {
    this.lastRun = Game.time;

    // Initialize nuke tracking if needed
    this.initializeNukeTracking();

    // Detect incoming nukes and update alerts
    this.detectIncomingNukes();

    // Process counter-nuke strategies
    this.processCounterNukeStrategies();

    // Manage resource accumulation
    this.manageNukeResources();

    // Load nukers with resources
    this.loadNukers();

    // Evaluate nuke candidates with enhanced scoring
    this.evaluateNukeCandidates();

    // Update nuke economics tracking
    this.updateNukeEconomics();

    // Check for siege coordination opportunities
    this.coordinateWithSieges();

    // Coordinate nuke salvos for maximum impact
    this.coordinateNukeSalvos();

    // Launch nukes if appropriate
    this.launchNukes();

    // Clean up old tracking data
    this.cleanupNukeTracking();
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
   * Score a nuke candidate with strategic prioritization
   */
  private scoreNukeCandidate(roomName: string): NukeScore {
    let score = 0;
    const reasons: string[] = [];

    const intel = memoryManager.getOvermind().roomIntel[roomName];
    if (!intel) {
      return { roomName, score: 0, reasons: ["No intel"] };
    }

    // Strategic target prioritization factors

    // 1. Enemy RCL (higher = more valuable) - up to 24 points
    if (intel.controllerLevel) {
      score += intel.controllerLevel * 3;
      reasons.push(`RCL ${intel.controllerLevel}`);
    }

    // 2. Structure density (more destruction potential)
    // Tower count bonus (more towers = better target, also harder defense)
    if (intel.towerCount) {
      score += intel.towerCount * 5;
      reasons.push(`${intel.towerCount} towers`);
    }

    // Spawn count bonus (critical structures)
    if (intel.spawnCount) {
      score += intel.spawnCount * 10;
      reasons.push(`${intel.spawnCount} spawns`);
    }

    // 3. Owned room bonus (higher value than unclaimed)
    if (intel.owner && intel.owner !== "") {
      score += 30;
      reasons.push("Owned room");
    }

    // 4. War pheromone level (active conflict priority)
    const swarm = memoryManager.getSwarmState(roomName);
    if (swarm) {
      const warBonus = Math.floor(swarm.pheromones.war / 10);
      if (warBonus > 0) {
        score += warBonus;
        reasons.push(`War intensity: ${swarm.pheromones.war}`);
      }
    }

    // 5. Strategic position factors
    // Highway rooms are often chokepoints
    if (intel.isHighway) {
      score += 10;
      reasons.push("Highway (strategic)");
    }

    // High threat bonus (immediate danger to our empire)
    if (intel.threatLevel >= 2) {
      score += 20;
      reasons.push("High threat");
    }

    // 6. Distance penalty (prefer closer targets for easier siege coordination)
    const ownedRooms = Object.values(Game.rooms).filter(r => r.controller?.my);
    if (ownedRooms.length > 0) {
      const minDistance = Math.min(...ownedRooms.map(r => Game.map.getRoomLinearDistance(roomName, r.name)));
      score -= minDistance * 2;
      reasons.push(`${minDistance} rooms away`);
    }

    // 7. War target bonus (aligned with empire objectives)
    if (memoryManager.getOvermind().warTargets.includes(roomName)) {
      score += 15;
      reasons.push("War target");
    }

    // 8. ROI check - only suggest if economically viable
    const targetPos = new RoomPosition(25, 25, roomName);
    const roi = this.calculateNukeROI(roomName, targetPos);
    if (roi >= this.config.roiThreshold) {
      const roiBonus = Math.min(20, Math.floor(roi * 5));
      score += roiBonus;
      reasons.push(`ROI: ${roi.toFixed(1)}x`);
    } else {
      score -= 20; // Penalty for poor ROI
      reasons.push(`Low ROI: ${roi.toFixed(1)}x`);
    }

    return { roomName, score, reasons };
  }

  /**
   * Launch nukes at top candidates with tracking and economics
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

        // Get target position (center of room for maximum impact)
        const targetPos = new RoomPosition(25, 25, candidate.roomName);

        // Predict impact before launching
        const prediction = this.predictNukeImpact(candidate.roomName, targetPos);

        // Verify ROI one more time before launch
        const roi = this.calculateNukeROI(candidate.roomName, targetPos);
        if (roi < this.config.roiThreshold) {
          logger.warn(
            `Skipping nuke launch on ${candidate.roomName}: ROI ${roi.toFixed(2)}x below threshold ${this.config.roiThreshold}x`,
            { subsystem: "Nuke" }
          );
          continue;
        }

        const result = nuker.launchNuke(targetPos);
        if (result === OK) {
          candidate.launched = true;
          candidate.launchTick = Game.time;

          // Track nuke in flight
          const nukeId = `${nuker.room.name}-${candidate.roomName}-${Game.time}`;
          const nukeInFlight: NukeInFlight = {
            id: nukeId,
            sourceRoom: nuker.room.name,
            targetRoom: candidate.roomName,
            targetPos: { x: targetPos.x, y: targetPos.y },
            launchTick: Game.time,
            impactTick: Game.time + this.config.nukeFlightTime,
            estimatedDamage: prediction.estimatedDamage,
            estimatedValue: prediction.estimatedValue
          };

          if (!overmind.nukesInFlight) {
            overmind.nukesInFlight = [];
          }
          overmind.nukesInFlight.push(nukeInFlight);

          // Update economics tracking
          if (!overmind.nukeEconomics) {
            overmind.nukeEconomics = {
              nukesLaunched: 0,
              totalEnergyCost: 0,
              totalGhodiumCost: 0,
              totalDamageDealt: 0,
              totalValueDestroyed: 0
            };
          }
          overmind.nukeEconomics.nukesLaunched++;
          overmind.nukeEconomics.totalEnergyCost += NUKE_COST.ENERGY;
          overmind.nukeEconomics.totalGhodiumCost += NUKE_COST.GHODIUM;
          overmind.nukeEconomics.totalDamageDealt += prediction.estimatedDamage;
          overmind.nukeEconomics.totalValueDestroyed += prediction.estimatedValue;
          overmind.nukeEconomics.lastLaunchTick = Game.time;

          logger.warn(
            `NUKE LAUNCHED from ${nuker.room.name} to ${candidate.roomName}! ` +
            `Impact in ${this.config.nukeFlightTime} ticks. ` +
            `Predicted damage: ${(prediction.estimatedDamage / 1000000).toFixed(1)}M hits, ` +
            `value: ${(prediction.estimatedValue / 1000).toFixed(0)}k, ROI: ${roi.toFixed(2)}x`,
            { subsystem: "Nuke" }
          );

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
   * Detect incoming nukes in owned rooms with comprehensive alerts
   */
  private detectIncomingNukes(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.incomingNukes) {
      overmind.incomingNukes = [];
    }

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      const swarm = memoryManager.getSwarmState(roomName);
      if (!swarm) continue;

      const nukes = room.find(FIND_NUKES);

      if (nukes.length > 0) {
        // Process each nuke
        for (const nuke of nukes) {
          const nukeId = `${roomName}-${nuke.pos.x}-${nuke.pos.y}-${nuke.launchRoomName || "unknown"}`;
          
          // Check if already tracked
          const existingAlert = overmind.incomingNukes.find(
            a => a.roomName === roomName && 
                 a.landingPos.x === nuke.pos.x && 
                 a.landingPos.y === nuke.pos.y
          );

          if (!existingAlert) {
            // New nuke detected - create alert
            const alert: IncomingNukeAlert = {
              roomName,
              landingPos: { x: nuke.pos.x, y: nuke.pos.y },
              impactTick: Game.time + (nuke.timeToLand || 0),
              timeToLand: nuke.timeToLand || 0,
              detectedAt: Game.time,
              evacuationTriggered: false,
              sourceRoom: nuke.launchRoomName
            };

            // Identify threatened structures
            const threatenedStructures = this.identifyThreatenedStructures(room, nuke.pos);
            alert.threatenedStructures = threatenedStructures;

            overmind.incomingNukes.push(alert);

            // Update swarm state
            if (!swarm.nukeDetected) {
              swarm.nukeDetected = true;
              swarm.pheromones.defense = Math.min(100, swarm.pheromones.defense + 50);
              swarm.pheromones.siege = Math.min(100, swarm.pheromones.siege + 30);
              swarm.danger = 3 as 0 | 1 | 2 | 3;

              logger.warn(
                `INCOMING NUKE DETECTED in ${roomName}! ` +
                `Landing at (${nuke.pos.x}, ${nuke.pos.y}), impact in ${nuke.timeToLand} ticks. ` +
                `Source: ${nuke.launchRoomName || "unknown"}. ` +
                `Threatened structures: ${threatenedStructures.length}`,
                { subsystem: "Nuke" }
              );

              // Add to event log
              swarm.eventLog.push({
                type: "nuke_incoming",
                time: Game.time,
                details: `Impact in ${nuke.timeToLand} ticks at (${nuke.pos.x},${nuke.pos.y})`
              });

              // Trim event log
              if (swarm.eventLog.length > 20) {
                swarm.eventLog.shift();
              }
            }

            // Trigger evacuation if critical structures threatened
            const hasCriticalStructures = threatenedStructures.some(s => 
              s.includes(STRUCTURE_SPAWN) || 
              s.includes(STRUCTURE_STORAGE) || 
              s.includes(STRUCTURE_TERMINAL)
            );

            if (hasCriticalStructures && !alert.evacuationTriggered) {
              this.triggerEvacuation(room, alert);
              alert.evacuationTriggered = true;
            }
          } else {
            // Update existing alert
            existingAlert.timeToLand = nuke.timeToLand || 0;
          }
        }
      } else if (swarm.nukeDetected) {
        // Nukes cleared (either impacted or something else)
        swarm.nukeDetected = false;
        logger.info(`Nuke threat cleared in ${roomName}`, { subsystem: "Nuke" });
      }
    }
  }

  /**
   * Identify structures threatened by a nuke
   */
  private identifyThreatenedStructures(room: Room, landingPos: RoomPosition): string[] {
    const threatened: string[] = [];
    
    const structures = room.lookForAtArea(
      LOOK_STRUCTURES,
      Math.max(0, landingPos.y - NUKE_DAMAGE.RANGE),
      Math.max(0, landingPos.x - NUKE_DAMAGE.RANGE),
      Math.min(49, landingPos.y + NUKE_DAMAGE.RANGE),
      Math.min(49, landingPos.x + NUKE_DAMAGE.RANGE),
      true
    );

    for (const item of structures) {
      const structure = item.structure;
      const dx = Math.abs(structure.pos.x - landingPos.x);
      const dy = Math.abs(structure.pos.y - landingPos.y);
      const distance = Math.max(dx, dy);

      if (distance <= NUKE_DAMAGE.RANGE) {
        const damage = distance === 0 ? NUKE_DAMAGE.CENTER : NUKE_DAMAGE.RADIUS;
        if (structure.hits <= damage) {
          threatened.push(`${structure.structureType}-${structure.pos.x},${structure.pos.y}`);
        }
      }
    }

    return threatened;
  }

  /**
   * Trigger evacuation procedures for a room under nuke threat
   */
  private triggerEvacuation(room: Room, alert: IncomingNukeAlert): void {
    const swarm = memoryManager.getSwarmState(room.name);
    if (!swarm) return;

    // Update posture to evacuate if impact is imminent
    if (alert.timeToLand < 5000) {
      swarm.posture = "evacuate";
      logger.warn(
        `EVACUATION TRIGGERED for ${room.name}: Critical structures threatened by nuke!`,
        { subsystem: "Nuke" }
      );
    } else {
      // Set defensive posture and prepare
      if (swarm.posture !== "war" && swarm.posture !== "evacuate") {
        swarm.posture = "defensive";
      }
      logger.warn(
        `NUKE DEFENSE PREPARATION in ${room.name}: Critical structures in blast radius`,
        { subsystem: "Nuke" }
      );
    }

    // Increase defense pheromone
    swarm.pheromones.defense = 100;
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

      // Log nuker readiness status (track in Set to avoid spam)
      const nukerId = `${roomName}-nuker`;
      if (energyNeeded === 0 && ghodiumNeeded === 0) {
        if (!this.nukerReadyLogged.has(nukerId)) {
          logger.info(`Nuker in ${roomName} is fully loaded and ready to launch`, {
            subsystem: "Nuke"
          });
          this.nukerReadyLogged.add(nukerId);
        }
      } else {
        this.nukerReadyLogged.delete(nukerId);
      }
    }
  }

  /**
   * Request resource transfer via terminal
   * Uses cached import to avoid circular dependency and ensure synchronous execution
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

    // Lazy-load terminal manager on first use (synchronous require to avoid timing issues)
    if (!this.terminalManager) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.terminalManager = require("../economy/terminalManager").terminalManager as typeof import("../economy/terminalManager").terminalManager;
    }

    const success = this.terminalManager.requestTransfer(
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
   * Ensures nukes land when siege squads arrive, and deploys squads if needed
   */
  private coordinateWithSieges(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.objectives.warMode) return;
    if (!overmind.nukesInFlight || overmind.nukesInFlight.length === 0) return;

    // Check each nuke in flight for siege coordination opportunity
    for (const nuke of overmind.nukesInFlight) {
      const ticksUntilImpact = nuke.impactTick - Game.time;

      // Skip if nuke already has a siege squad assigned
      if (nuke.siegeSquadId) continue;

      // Check if we should deploy siege squad (within coordination window)
      if (ticksUntilImpact <= this.config.siegeCoordinationWindow && ticksUntilImpact > 0) {
        // Try to find or create siege squad for this nuke
        const deployed = this.deploySiegeSquadForNuke(nuke);
        if (deployed) {
          logger.info(
            `Siege squad deployment coordinated with nuke on ${nuke.targetRoom}, ` +
            `impact in ${ticksUntilImpact} ticks`,
            { subsystem: "Nuke" }
          );
        }
      }
    }

    // Also check existing siege squads and match with nukes
    const clusters = memoryManager.getClusters();
    for (const cluster of Object.values(clusters)) {
      if (!cluster.squads || cluster.squads.length === 0) continue;

      // Find siege squads
      const siegeSquads = cluster.squads.filter(s => s.type === "siege");

      for (const squad of siegeSquads) {
        if (squad.state !== "moving" && squad.state !== "attacking") continue;

        // Check if squad is targeting a room with a nuke in flight
        const targetRoom = squad.targetRooms[0];
        if (!targetRoom) continue;

        const targetedNuke = overmind.nukesInFlight?.find(n => n.targetRoom === targetRoom);
        if (targetedNuke && !targetedNuke.siegeSquadId) {
          targetedNuke.siegeSquadId = squad.id;
          logger.info(
            `Linked siege squad ${squad.id} with nuke on ${targetRoom}`,
            { subsystem: "Nuke" }
          );
        }
      }
    }
  }

  /**
   * Deploy a siege squad to coordinate with a nuke strike
   * Returns true if squad was deployed or already exists
   */
  private deploySiegeSquadForNuke(nuke: NukeInFlight): boolean {
    // Find nearest cluster to target
    const clusters = memoryManager.getClusters();
    let nearestCluster: { id: string; distance: number } | null = null;

    for (const cluster of Object.values(clusters)) {
      const distance = Game.map.getRoomLinearDistance(cluster.coreRoom, nuke.targetRoom);
      if (!nearestCluster || distance < nearestCluster.distance) {
        nearestCluster = { id: cluster.id, distance };
      }
    }

    if (!nearestCluster) {
      logger.warn(
        `Cannot deploy siege squad for nuke on ${nuke.targetRoom}: No clusters available`,
        { subsystem: "Nuke" }
      );
      return false;
    }

    const cluster = clusters[nearestCluster.id];
    if (!cluster) return false;

    // Check if cluster already has a siege squad targeting this room
    const existingSquad = cluster.squads?.find(
      s => s.type === "siege" && s.targetRooms.includes(nuke.targetRoom)
    );

    if (existingSquad) {
      nuke.siegeSquadId = existingSquad.id;
      return true;
    }

    // Create new siege squad request
    // Note: Actual squad creation is handled by squadCoordinator/squadFormationManager
    // We just set the pheromones and create the request structure
    const targetSwarm = memoryManager.getSwarmState(nuke.targetRoom);
    if (targetSwarm) {
      // Increase siege pheromone to trigger squad creation
      targetSwarm.pheromones.siege = Math.min(100, targetSwarm.pheromones.siege + 80);
      targetSwarm.pheromones.war = Math.min(100, targetSwarm.pheromones.war + 60);
      
      logger.info(
        `Siege pheromones increased for ${nuke.targetRoom} to coordinate with nuke strike`,
        { subsystem: "Nuke" }
      );
    }

    // Create squad definition for the cluster to pick up
    const squadId = `siege-nuke-${nuke.targetRoom}-${Game.time}`;
    const newSquad: SquadDefinition = {
      id: squadId,
      type: "siege",
      members: [], // Will be filled by squad formation manager
      rallyRoom: cluster.coreRoom,
      targetRooms: [nuke.targetRoom],
      state: "gathering",
      createdAt: Game.time,
      retreatThreshold: 0.3
    };

    if (!cluster.squads) {
      cluster.squads = [];
    }
    cluster.squads.push(newSquad);
    nuke.siegeSquadId = squadId;

    logger.warn(
      `SIEGE SQUAD DEPLOYED: Squad ${squadId} will coordinate with nuke on ${nuke.targetRoom}`,
      { subsystem: "Nuke" }
    );

    return true;
  }

  /**
   * Estimate ticks until squad reaches target
   */
  private estimateSquadEta(squad: SquadDefinition, targetRoom: string): number {
    // Find average position of squad members
    const members = squad.members
      .map(name => Game.creeps[name])
      .filter((c): c is Creep => c != null);

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

  /**
   * Initialize nuke tracking arrays if they don't exist
   */
  private initializeNukeTracking(): void {
    const overmind = memoryManager.getOvermind();
    
    if (!overmind.nukesInFlight) {
      overmind.nukesInFlight = [];
    }
    
    if (!overmind.incomingNukes) {
      overmind.incomingNukes = [];
    }
    
    if (!overmind.nukeEconomics) {
      overmind.nukeEconomics = {
        nukesLaunched: 0,
        totalEnergyCost: 0,
        totalGhodiumCost: 0,
        totalDamageDealt: 0,
        totalValueDestroyed: 0
      };
    }
  }

  /**
   * Coordinate nuke salvos for maximum impact
   * Groups nukes targeting the same room to hit within salvoSyncWindow
   */
  private coordinateNukeSalvos(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.nukesInFlight || overmind.nukesInFlight.length === 0) return;

    // Group nukes by target room
    const nukesByTarget = new Map<string, NukeInFlight[]>();
    for (const nuke of overmind.nukesInFlight) {
      const existing = nukesByTarget.get(nuke.targetRoom) || [];
      existing.push(nuke);
      nukesByTarget.set(nuke.targetRoom, existing);
    }

    // Coordinate salvos for rooms with multiple nukes
    for (const [targetRoom, nukes] of nukesByTarget.entries()) {
      if (nukes.length < 2) continue;

      // Check if nukes are within sync window
      const impactTicks = nukes.map(n => n.impactTick);
      const minImpact = Math.min(...impactTicks);
      const maxImpact = Math.max(...impactTicks);
      const spread = maxImpact - minImpact;

      if (spread <= this.config.salvoSyncWindow) {
        // Nukes are synchronized, assign salvo ID if not already assigned
        const salvoId = nukes[0].salvoId || `salvo-${targetRoom}-${minImpact}`;
        for (const nuke of nukes) {
          nuke.salvoId = salvoId;
        }
        
        logger.info(
          `Nuke salvo ${salvoId} coordinated: ${nukes.length} nukes on ${targetRoom}, impact spread: ${spread} ticks`,
          { subsystem: "Nuke" }
        );
      } else {
        logger.warn(
          `Nukes on ${targetRoom} not synchronized (spread: ${spread} ticks > ${this.config.salvoSyncWindow})`,
          { subsystem: "Nuke" }
        );
      }
    }
  }

  /**
   * Predict impact and assess damage for a nuke strike
   * Returns estimated damage and value destroyed
   */
  private predictNukeImpact(targetRoom: string, targetPos: RoomPosition): {
    estimatedDamage: number;
    estimatedValue: number;
    threatenedStructures: string[];
  } {
    const result = {
      estimatedDamage: 0,
      estimatedValue: 0,
      threatenedStructures: [] as string[]
    };

    // If we can see the room, calculate precise damage
    const room = Game.rooms[targetRoom];
    if (!room) {
      // Estimate based on intel
      const intel = memoryManager.getOvermind().roomIntel[targetRoom];
      if (intel) {
        // Rough estimate: towers, spawns, and storage using configurable weights
        const structureEstimate = 
          (intel.towerCount || 0) * INTEL_DAMAGE_WEIGHTS.TOWER_WEIGHT + 
          (intel.spawnCount || 0) * INTEL_DAMAGE_WEIGHTS.SPAWN_WEIGHT + 
          INTEL_DAMAGE_WEIGHTS.BASE_STRUCTURE_COUNT;
        result.estimatedDamage = NUKE_DAMAGE.CENTER + NUKE_DAMAGE.RADIUS * structureEstimate;
        result.estimatedValue = result.estimatedDamage * 0.01; // Rough energy equivalent
      }
      return result;
    }

    // Find all structures in blast radius
    const structures = room.lookForAtArea(
      LOOK_STRUCTURES,
      Math.max(0, targetPos.y - NUKE_DAMAGE.RANGE),
      Math.max(0, targetPos.x - NUKE_DAMAGE.RANGE),
      Math.min(49, targetPos.y + NUKE_DAMAGE.RANGE),
      Math.min(49, targetPos.x + NUKE_DAMAGE.RANGE),
      true
    );

    for (const item of structures) {
      const structure = item.structure;
      const dx = Math.abs(structure.pos.x - targetPos.x);
      const dy = Math.abs(structure.pos.y - targetPos.y);
      const distance = Math.max(dx, dy);

      // Calculate damage based on distance
      const damage = distance === 0 ? NUKE_DAMAGE.CENTER : NUKE_DAMAGE.RADIUS;
      
      // Estimate if structure will be destroyed
      if (structure.hits <= damage) {
        result.estimatedDamage += structure.hits;
        result.threatenedStructures.push(`${structure.structureType}-${structure.pos.x},${structure.pos.y}`);
        
        // Estimate value destroyed
        result.estimatedValue += this.estimateStructureValue(structure);
      } else {
        result.estimatedDamage += damage;
      }
    }

    return result;
  }

  /**
   * Estimate energy value of a structure
   */
  private estimateStructureValue(structure: Structure): number {
    return STRUCTURE_VALUES[structure.structureType] || 1000;
  }

  /**
   * Process counter-nuke strategies
   * Identify nuke sources and consider retaliatory strikes
   */
  private processCounterNukeStrategies(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.incomingNukes || overmind.incomingNukes.length === 0) return;

    for (const alert of overmind.incomingNukes) {
      // Only process if source room is identified
      if (!alert.sourceRoom) continue;

      // Check if already a war target
      if (overmind.warTargets.includes(alert.sourceRoom)) continue;

      // Verify conditions for counter-nuke
      const sourceRoomIntel = overmind.roomIntel[alert.sourceRoom];
      if (!sourceRoomIntel) continue;

      // Enemy must have RCL8 (nuker capability)
      if (sourceRoomIntel.controllerLevel < 8) continue;

      // Check war pheromone in our room
      const swarm = memoryManager.getSwarmState(alert.roomName);
      if (!swarm || swarm.pheromones.war < this.config.counterNukeWarThreshold) continue;

      // Check if we have resources for counter-strike
      const hasResources = this.canAffordNuke();
      if (!hasResources) {
        logger.warn(
          `Counter-nuke desired against ${alert.sourceRoom} but insufficient resources`,
          { subsystem: "Nuke" }
        );
        continue;
      }

      // Add to war targets for retaliation
      if (!overmind.warTargets.includes(alert.sourceRoom)) {
        overmind.warTargets.push(alert.sourceRoom);
        logger.warn(
          `COUNTER-NUKE AUTHORIZED: ${alert.sourceRoom} added to war targets for nuke retaliation`,
          { subsystem: "Nuke" }
        );

        // Increase war pheromone across empire
        for (const roomName in Game.rooms) {
          const room = Game.rooms[roomName];
          if (room.controller?.my) {
            const roomSwarm = memoryManager.getSwarmState(roomName);
            if (roomSwarm) {
              roomSwarm.pheromones.war = Math.min(100, roomSwarm.pheromones.war + 30);
            }
          }
        }
      }
    }
  }

  /**
   * Check if we have resources to afford a nuke launch
   */
  private canAffordNuke(): boolean {
    let totalEnergy = 0;
    let totalGhodium = 0;

    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller?.my) continue;

      if (room.storage) {
        totalEnergy += room.storage.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
      }
      if (room.terminal) {
        totalEnergy += room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) || 0;
        totalGhodium += room.terminal.store.getUsedCapacity(RESOURCE_GHODIUM) || 0;
      }
    }

    return totalEnergy >= NUKE_COST.ENERGY * 2 && totalGhodium >= NUKE_COST.GHODIUM * 2;
  }

  /**
   * Update nuke economics tracking
   */
  private updateNukeEconomics(): void {
    const overmind = memoryManager.getOvermind();
    if (!overmind.nukeEconomics) return;

    const economics = overmind.nukeEconomics;

    // Update ROI calculation if we have data
    const totalCost = economics.totalEnergyCost + economics.totalGhodiumCost;
    if (totalCost > 0) {
      const totalGain = economics.totalValueDestroyed;
      economics.lastROI = totalGain / totalCost;

      // Log significant ROI milestones
      if (economics.nukesLaunched > 0 && economics.nukesLaunched % 5 === 0) {
        logger.info(
          `Nuke economics: ${economics.nukesLaunched} nukes, ROI: ${economics.lastROI?.toFixed(2)}x, ` +
          `Value destroyed: ${(economics.totalValueDestroyed / 1000).toFixed(0)}k`,
          { subsystem: "Nuke" }
        );
      }
    }
  }

  /**
   * Clean up old nuke tracking data
   */
  private cleanupNukeTracking(): void {
    const overmind = memoryManager.getOvermind();
    
    // Remove nukes that have already impacted
    if (overmind.nukesInFlight) {
      overmind.nukesInFlight = overmind.nukesInFlight.filter(
        nuke => nuke.impactTick > Game.time
      );
    }

    // Remove old incoming nuke alerts (already impacted)
    if (overmind.incomingNukes) {
      const before = overmind.incomingNukes.length;
      overmind.incomingNukes = overmind.incomingNukes.filter(
        alert => alert.impactTick > Game.time
      );
      const removed = before - overmind.incomingNukes.length;
      
      if (removed > 0) {
        logger.info(`Cleaned up ${removed} impacted nuke alert(s)`, { subsystem: "Nuke" });
      }
    }
  }

  /**
   * Calculate ROI for a potential nuke strike
   */
  private calculateNukeROI(targetRoom: string, targetPos: RoomPosition): number {
    const prediction = this.predictNukeImpact(targetRoom, targetPos);
    const cost = NUKE_COST.ENERGY + NUKE_COST.GHODIUM;
    
    // Handle edge case where no value is predicted
    if (prediction.estimatedValue === 0) {
      return 0;
    }
    
    const gain = prediction.estimatedValue;
    return gain / cost;
  }
}

/**
 * Global nuke manager instance
 */
export const nukeManager = new NukeManager();
