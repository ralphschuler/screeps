/**
 * Emergency Response System
 *
 * Coordinates emergency defense actions when rooms come under attack:
 * - Escalates threat assessment
 * - Triggers emergency defender spawning
 * - Coordinates multi-room defense assistance
 * - Manages boost allocation for defenders
 *
 * ROADMAP Reference: Section 12 - Kampf & Verteidigung
 * - Adaptive behavior based on danger level
 * - Emergency escalation for critical threats
 * - Multi-room coordination
 *
 * Addresses Issue: #21 - Defense Systems
 * - Emergency response triggers (currently basic)
 * - Multi-room defense coordination (currently missing)
 * 
 * **IMPORTANT**: Automatically filters allied entities (non-aggression pact, ROADMAP Section 25)
 */

import { logger } from "@bot/core/logger";
import type { SwarmState } from "@ralphschuler/screeps-memory";
import { memoryManager } from "@ralphschuler/screeps-memory";
import {
  type DefenseRequest,
  analyzeDefenderNeeds,
  createDefenseRequest,
  getCurrentDefenders,
  needsDefenseAssistance
} from "@bot/spawning/defenderManager";
import { filterAllyCreeps } from "../alliance/nonAggressionPact";

/**
 * Emergency response levels
 */
export enum EmergencyLevel {
  NONE = 0,
  LOW = 1,      // Minor threat, normal response
  MEDIUM = 2,   // Significant threat, expedited defender spawning
  HIGH = 3,     // Critical threat, emergency spawning + assistance
  CRITICAL = 4  // Imminent destruction, safe mode consideration
}

/**
 * Emergency response state
 */
export interface EmergencyState {
  /** Current emergency level */
  level: EmergencyLevel;
  /** Game tick when emergency started */
  startedAt: number;
  /** Assistance requests sent */
  assistanceRequested: boolean;
  /** Boosts allocated for defenders */
  boostsAllocated: boolean;
  /** Last escalation tick */
  lastEscalation: number;
}

/**
 * Emergency Response Manager
 */
export class EmergencyResponseManager {
  private emergencyStates: Map<string, EmergencyState> = new Map();

  /**
   * Assess and respond to threats in a room
   */
  public assess(room: Room, swarm: SwarmState): EmergencyState {
    const existingState = this.emergencyStates.get(room.name);
    const emergencyLevel = this.calculateEmergencyLevel(room, swarm);

    // If no threat and no existing emergency, return default state without creating entry
    // BUGFIX: Don't create emergency state entries for rooms with no threats
    // This prevents spam from repeatedly creating and deleting NONE-level states
    if (emergencyLevel === EmergencyLevel.NONE && !existingState) {
      return {
        level: EmergencyLevel.NONE,
        startedAt: Game.time,
        assistanceRequested: false,
        boostsAllocated: false,
        lastEscalation: 0
      };
    }

    // Create or update emergency state
    let state: EmergencyState;
    if (existingState) {
      state = existingState;
      state.level = emergencyLevel;
    } else {
      state = {
        level: emergencyLevel,
        startedAt: Game.time,
        assistanceRequested: false,
        boostsAllocated: false,
        lastEscalation: 0
      };
      this.emergencyStates.set(room.name, state);
    }

    // Clear emergency state if threat is gone
    if (emergencyLevel === EmergencyLevel.NONE) {
      if (existingState) {
        logger.info(`Emergency resolved in ${room.name}`, { subsystem: "Defense" });
        this.emergencyStates.delete(room.name);
      }
      return state;
    }

    // Log emergency escalation
    if (existingState && emergencyLevel > existingState.level) {
      logger.warn(
        `Emergency escalated in ${room.name}: Level ${existingState.level} → ${emergencyLevel}`,
        { subsystem: "Defense" }
      );
      state.lastEscalation = Game.time;
    }

    // Execute emergency responses based on level
    this.executeEmergencyResponse(room, swarm, state);

    return state;
  }

  /**
   * Calculate emergency level based on room state
   */
  private calculateEmergencyLevel(room: Room, swarm: SwarmState): EmergencyLevel {
    // No emergency if no danger
    if (swarm.danger === 0) {
      return EmergencyLevel.NONE;
    }

    // Filter allied entities - non-aggression pact (ROADMAP Section 25)
    const allHostiles = room.find(FIND_HOSTILE_CREEPS);
    const hostiles = filterAllyCreeps(allHostiles);
    const needs = analyzeDefenderNeeds(room);
    const current = getCurrentDefenders(room);

    // Critical: Critical structures heavily damaged or about to be destroyed
    const criticalStructures = room.find(FIND_MY_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_STORAGE ||
          s.structureType === STRUCTURE_TERMINAL) &&
        s.hits < s.hitsMax * 0.3
    });

    if (criticalStructures.length > 0) {
      return EmergencyLevel.CRITICAL;
    }

    // High: Severely outnumbered or boosted enemies with insufficient defense
    const boostedHostiles = hostiles.filter(h => h.body.some(p => p.boost));
    const defenderDeficit = (needs.guards - current.guards) + (needs.rangers - current.rangers);

    if (boostedHostiles.length > 0 && defenderDeficit >= 2) {
      return EmergencyLevel.HIGH;
    }

    // High: Large attack force (5+ hostiles) with no defenders
    if (hostiles.length >= 5 && current.guards === 0 && current.rangers === 0) {
      return EmergencyLevel.HIGH;
    }

    // Medium: Significant threat with defender deficit
    if (swarm.danger >= 2 && defenderDeficit >= 1) {
      return EmergencyLevel.MEDIUM;
    }

    // Low: Minor threat detected
    if (swarm.danger >= 1) {
      return EmergencyLevel.LOW;
    }

    return EmergencyLevel.NONE;
  }

  /**
   * Execute emergency response actions
   */
  private executeEmergencyResponse(room: Room, swarm: SwarmState, state: EmergencyState): void {
    // Response: Request multi-room assistance for HIGH/CRITICAL emergencies
    if (
      (state.level === EmergencyLevel.HIGH || state.level === EmergencyLevel.CRITICAL) &&
      !state.assistanceRequested
    ) {
      const requested = this.requestDefenseAssistance(room, swarm);
      if (requested) {
        state.assistanceRequested = true;
      }
    }

    // Response: Allocate boosts for MEDIUM/HIGH/CRITICAL emergencies
    if (
      (state.level >= EmergencyLevel.MEDIUM) &&
      !state.boostsAllocated &&
      room.controller &&
      room.controller.level >= 6
    ) {
      this.allocateBoostsForDefense(room, swarm);
      state.boostsAllocated = true;
    }

    // Response: Update posture based on emergency level
    this.updateDefensePosture(room, swarm, state);
  }

  /**
   * Request defense assistance from neighboring rooms
   */
  private requestDefenseAssistance(room: Room, swarm: SwarmState): boolean {
    if (!needsDefenseAssistance(room, swarm)) {
      return false;
    }

    const request = createDefenseRequest(room, swarm);
    if (!request) {
      return false;
    }

    // Store request in memory for cluster coordination
    const mem = Memory as unknown as Record<string, unknown>;
    const requests = (mem.defenseRequests as DefenseRequest[]) ?? [];
    
    // Remove old requests for this room
    const filtered = requests.filter(
      (r: DefenseRequest) => r.roomName !== room.name || Game.time - r.createdAt < 500
    );
    
    // Add new request
    filtered.push(request);
    mem.defenseRequests = filtered;

    logger.warn(
      `Defense assistance requested for ${room.name}: ` +
        `${request.guardsNeeded} guards, ${request.rangersNeeded} rangers - ${request.threat}`,
      { subsystem: "Defense" }
    );

    return true;
  }

  /**
   * Allocate boosts for defensive creeps
   */
  private allocateBoostsForDefense(room: Room, swarm: SwarmState): void {
    // Mark swarm state to prioritize boosting defenders
    // The boost manager will read this flag and prioritize defense boosts
    const mem = Memory as unknown as Record<string, unknown>;
    const boostPriority = (mem.boostDefensePriority as Record<string, boolean>) ?? {};
    boostPriority[room.name] = true;
    mem.boostDefensePriority = boostPriority;

    logger.info(`Allocated boost priority for defenders in ${room.name}`, { subsystem: "Defense" });
  }

  /**
   * Update defense posture based on emergency level
   */
  private updateDefensePosture(room: Room, swarm: SwarmState, state: EmergencyState): void {
    // Update posture based on emergency level
    switch (state.level) {
      case EmergencyLevel.CRITICAL:
        if (swarm.posture !== "evacuate") {
          swarm.posture = "war";
          swarm.pheromones.war = 100;
          swarm.pheromones.defense = 100;
          logger.warn(`${room.name} posture: CRITICAL DEFENSE`, { subsystem: "Defense" });
        }
        break;

      case EmergencyLevel.HIGH:
        if (swarm.posture !== "war" && swarm.posture !== "evacuate") {
          swarm.posture = "defensive";
          swarm.pheromones.defense = 80;
          swarm.pheromones.war = 40;
          logger.info(`${room.name} posture: HIGH DEFENSE`, { subsystem: "Defense" });
        }
        break;

      case EmergencyLevel.MEDIUM:
        if (swarm.posture === "eco" || swarm.posture === "expand") {
          swarm.posture = "defensive";
          swarm.pheromones.defense = 60;
          logger.info(`${room.name} posture: MEDIUM DEFENSE`, { subsystem: "Defense" });
        }
        break;

      case EmergencyLevel.LOW:
        if (swarm.posture === "eco" || swarm.posture === "expand") {
          swarm.pheromones.defense = 30;
          logger.debug(`${room.name}: LOW DEFENSE alert`, { subsystem: "Defense" });
        }
        break;
    }
  }

  /**
   * Get pending defense requests
   */
  public getDefenseRequests(): DefenseRequest[] {
    const mem = Memory as unknown as Record<string, unknown>;
    const requests = (mem.defenseRequests as DefenseRequest[]) ?? [];
    
    // Filter out stale requests (older than 500 ticks)
    const active = requests.filter((r: DefenseRequest) => Game.time - r.createdAt < 500);
    
    // Update memory if we filtered any
    if (active.length !== requests.length) {
      mem.defenseRequests = active;
    }
    
    return active;
  }

  /**
   * Clear defense request for a room
   */
  public clearDefenseRequest(roomName: string): void {
    const mem = Memory as unknown as Record<string, unknown>;
    const requests = (mem.defenseRequests as DefenseRequest[]) ?? [];
    const filtered = requests.filter((r: DefenseRequest) => r.roomName !== roomName);
    mem.defenseRequests = filtered;
  }

  /**
   * Get emergency state for a room
   */
  public getEmergencyState(roomName: string): EmergencyState | undefined {
    return this.emergencyStates.get(roomName);
  }

  /**
   * Check if a room has an active emergency
   */
  public hasEmergency(roomName: string): boolean {
    const state = this.emergencyStates.get(roomName);
    return state !== undefined && state.level > EmergencyLevel.NONE;
  }

  /**
   * Get all active emergencies sorted by severity
   */
  public getActiveEmergencies(): { roomName: string; state: EmergencyState }[] {
    const emergencies: { roomName: string; state: EmergencyState }[] = [];
    
    for (const [roomName, state] of this.emergencyStates.entries()) {
      if (state.level > EmergencyLevel.NONE) {
        emergencies.push({ roomName, state });
      }
    }
    
    // Sort by emergency level (highest first)
    return emergencies.sort((a, b) => b.state.level - a.state.level);
  }
}

/**
 * Global emergency response manager instance
 */
export const emergencyResponseManager = new EmergencyResponseManager();
