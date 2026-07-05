/**
 * Defense Coordination System
 *
 * Coordinates defense efforts across multiple rooms:
 * - Manages defense assistance requests
 * - Assigns rangers/guards from helper rooms
 * - Tracks active defense operations
 * - Prioritizes assistance based on threat severity
 *
 * ROADMAP Reference: Section 11 - Cluster- & Empire-Logik
 * - Multi-room military coordination
 * - Squad formation from multiple rooms
 * - Support for attacked rooms with reinforcements
 *
 * Addresses Issue: #21 - Defense Systems
 * - Multi-room defense coordination
 * - Threat assessment integration
 * - Cluster-wide defense resource pooling
 * 
 * **IMPORTANT**: Uses threat assessment which automatically filters allied entities (non-aggression pact, ROADMAP Section 25)
 */

import { logger } from "@ralphschuler/screeps-core";
import type { DefenseRequest } from "../analysis/defenderNeeds";
import { assessThreat } from "../threat/threatAssessment";
import { getActualHostileCreeps } from "../alliance/nonAggressionPact";
import {
  clearDefenseAssistMemory,
  getDefenseAssistTargetRoom,
  stageDefenseAssistCreep,
  type DefenseAssistStagingMemory
} from "./defenseAssistStaging";

/**
 * Defense assistance assignment
 */
export interface DefenseAssignment {
  /** Creep assigned to assist */
  creepName: string;
  /** Room requesting assistance */
  targetRoom: string;
  /** Assignment created tick */
  assignedAt: number;
  /** Expected arrival tick */
  eta: number;
}

/**
 * Defense Coordinator
 */
export class DefenseCoordinator {
  private assignments: Map<string, DefenseAssignment> = new Map();

  /**
   * Get defense requests from memory
   */
  private getDefenseRequestsFromMemory(): DefenseRequest[] {
    const mem = Memory as unknown as Record<string, unknown>;
    return (mem.defenseRequests as DefenseRequest[]) ?? [];
  }

  /**
   * Legacy compatibility loop for direct defense requests.
   * Runtime dispatch is owned by the cluster manager; this method is intentionally not decorator-registered.
   */
  public run(): void {
    // Get active defense requests
    const requests = this.getDefenseRequestsFromMemory();
    
    // Clean up completed assignments
    this.cleanupAssignments();

    // Process each defense request
    for (const request of requests) {
      this.processDefenseRequest(request);
    }
  }

  /**
   * Process a defense request and assign helpers if needed
   */
  private processDefenseRequest(request: DefenseRequest): void {
    const targetRoom = Game.rooms[request.roomName];
    if (!targetRoom) {
      // Can't see room, can't help
      return;
    }

    // Use threat assessment for better prioritization
    const threat = assessThreat(targetRoom);
    
    // Update request urgency based on threat analysis
    const effectiveUrgency = Math.max(
      request.urgency,
      threat.dangerLevel,
      threat.assistanceRequired ? 3 : 0
    );

    // Check how many defenders are already assigned
    const assignedGuards = this.getAssignedDefenders(request.roomName, "guard");
    const assignedRangers = this.getAssignedDefenders(request.roomName, "ranger");

    // Calculate remaining need based on threat assessment
    const threatGuardNeed = threat.assistanceRequired
      ? Math.max(0, Math.ceil(threat.totalHostileDPS / 300) - assignedGuards.length)
      : 0;
    const threatRangerNeed = threat.assistanceRequired
      ? Math.max(0, Math.ceil(threat.totalHostileDPS / 300) - assignedRangers.length)
      : 0;

    const guardsNeeded = Math.max(
      0,
      request.guardsNeeded - assignedGuards.length,
      threatGuardNeed
    );
    const rangersNeeded = Math.max(
      0,
      request.rangersNeeded - assignedRangers.length,
      threatRangerNeed
    );

    if (guardsNeeded === 0 && rangersNeeded === 0) {
      // Request is satisfied
      return;
    }

    // Find available defenders in nearby rooms
    if (guardsNeeded > 0) {
      this.assignDefenders(request.roomName, "guard", guardsNeeded, effectiveUrgency);
    }

    if (rangersNeeded > 0) {
      this.assignDefenders(request.roomName, "ranger", rangersNeeded, effectiveUrgency);
    }
  }

  /**
   * Assign defenders from helper rooms to target room
   */
  private assignDefenders(
    targetRoom: string,
    role: "guard" | "ranger",
    count: number,
    urgency: number
  ): void {
    // Find nearby owned rooms that can spare defenders
    const helperRooms = this.findHelperRooms(targetRoom, urgency);

    let assigned = 0;
    for (const helperRoom of helperRooms) {
      if (assigned >= count) break;

      // Find available defenders in this room
      const defenders = helperRoom.find(FIND_MY_CREEPS, {
        filter: c => {
          const memory = c.memory as unknown as { role?: string; assistTarget?: string; targetRoom?: string; task?: string };
          
          // Must be the right role
          if (memory.role !== role) return false;
          
          // Must not already have an assignment
          if (getDefenseAssistTargetRoom(memory)) return false;
          
          // Must not already be assigned by coordinator
          if (this.assignments.has(c.name)) return false;
          
          return true;
        }
      });

      // Assign up to 2 defenders per helper room to avoid depleting any single room
      const toAssign = Math.min(defenders.length, 2, count - assigned);
      
      for (let i = 0; i < toAssign; i++) {
        const defender = defenders[i];
        if (!defender) continue;

        // Calculate ETA (rough estimate: 50 ticks per room)
        const distance = Game.map.getRoomLinearDistance(helperRoom.name, targetRoom);
        const eta = Game.time + (distance * 50);

        // Create assignment
        const assignment: DefenseAssignment = {
          creepName: defender.name,
          targetRoom,
          assignedAt: Game.time,
          eta
        };

        this.assignments.set(defender.name, assignment);

        // Set staged creep memory for role behavior.
        stageDefenseAssistCreep(defender, {
          homeRoom: helperRoom.name,
          targetRoom,
          now: Game.time,
          squadSize: toAssign
        });

        assigned++;

        logger.info(
          `Assigned ${role} ${defender.name} from ${helperRoom.name} to assist ${targetRoom} (ETA: ${eta - Game.time} ticks)`,
          { subsystem: "Defense" }
        );
      }
    }

    if (assigned > 0) {
      logger.info(
        `Defense coordination: Assigned ${assigned}/${count} ${role}s to ${targetRoom}`,
        { subsystem: "Defense" }
      );
    }
  }

  /**
   * Find rooms that can provide defense assistance
   */
  private findHelperRooms(targetRoom: string, urgency: number): Room[] {
    const ownedRooms = Object.values(Game.rooms).filter(
      r => r.controller?.my && r.name !== targetRoom
    );

    // Score each room based on ability to help
    const candidates = ownedRooms
      .map(room => {
        let score = 0;

        // Prefer closer rooms
        const distance = Game.map.getRoomLinearDistance(targetRoom, room.name);
        score -= distance * 10;

        // Prefer rooms with idle defenders
        const defenders = room.find(FIND_MY_CREEPS, {
          filter: c => {
            const memory = c.memory as unknown as { role?: string; assistTarget?: string; targetRoom?: string; task?: string };
            const role = memory.role;
            return (role === "guard" || role === "ranger") && !getDefenseAssistTargetRoom(memory);
          }
        });
        score += defenders.length * 20;

        // Prefer safer rooms (they can spare defenders)
        const hostiles = getActualHostileCreeps(room);
        score -= hostiles.length * 30;

        // Don't use rooms under active attack unless urgency is critical
        if (hostiles.length > 0 && urgency < 3) {
          score -= 1000;
        }

        return { room, score };
      })
      .filter(c => c.score > -500)
      .sort((a, b) => b.score - a.score);

    return candidates.map(c => c.room);
  }

  private getMemoryBackedAssignments(targetRoom?: string, role?: string, seen = new Set<string>()): DefenseAssignment[] {
    const assignments: DefenseAssignment[] = [];

    for (const creep of Object.values(Game.creeps)) {
      if (seen.has(creep.name)) continue;
      const memory = creep.memory as unknown as {
        role?: string;
        assistTarget?: string;
        targetRoom?: string;
        task?: string;
        defenseSquadCreatedAt?: number;
      };
      const assignedTargetRoom = getDefenseAssistTargetRoom(memory);
      if (!assignedTargetRoom) continue;
      if (targetRoom && assignedTargetRoom !== targetRoom) continue;
      if (role && memory.role !== role) continue;
      assignments.push({
        creepName: creep.name,
        targetRoom: assignedTargetRoom,
        assignedAt: memory.defenseSquadCreatedAt ?? Game.time,
        eta: Game.time
      });
    }

    return assignments;
  }

  /**
   * Get defenders already assigned to a room
   */
  private getAssignedDefenders(targetRoom: string, role?: string): DefenseAssignment[] {
    const assigned: DefenseAssignment[] = [];
    const seen = new Set<string>();

    for (const [creepName, assignment] of this.assignments.entries()) {
      if (assignment.targetRoom !== targetRoom) continue;

      const creep = Game.creeps[creepName];
      if (!creep) continue;

      if (role) {
        const memory = creep.memory as unknown as { role?: string };
        if (memory.role !== role) continue;
      }

      assigned.push(assignment);
      seen.add(creepName);
    }

    return [...assigned, ...this.getMemoryBackedAssignments(targetRoom, role, seen)];
  }

  /**
   * Clean up completed or invalid assignments
   */
  private cleanupAssignments(): void {
    const toRemove: string[] = [];

    for (const [creepName, assignment] of this.assignments.entries()) {
      const creep = Game.creeps[creepName];

      // Remove if creep is dead
      if (!creep) {
        toRemove.push(creepName);
        continue;
      }

      // Remove if creep reached target room and no longer needs to assist
      if (creep.room.name === assignment.targetRoom) {
        const hostiles = getActualHostileCreeps(creep.room);
        if (hostiles.length === 0) {
          // No more hostiles, release creep
          clearDefenseAssistMemory(creep.memory as Partial<DefenseAssistStagingMemory>);
          toRemove.push(creepName);
          
          logger.debug(
            `Released ${creepName} from defense assistance (no hostiles in ${assignment.targetRoom})`,
            { subsystem: "Defense" }
          );
        }
      }

      // Remove stale assignments (older than 1000 ticks)
      if (Game.time - assignment.assignedAt > 1000) {
        clearDefenseAssistMemory(creep.memory as Partial<DefenseAssistStagingMemory>);
        toRemove.push(creepName);
        
        logger.debug(
          `Removed stale defense assignment for ${creepName}`,
          { subsystem: "Defense" }
        );
      }
    }

    // Remove invalid assignments
    for (const creepName of toRemove) {
      this.assignments.delete(creepName);
    }
  }

  /**
   * Get active defense assignments for a room
   */
  public getAssignmentsForRoom(roomName: string): DefenseAssignment[] {
    return this.getAssignedDefenders(roomName);
  }

  /**
   * Get all active defense assignments
   */
  public getAllAssignments(): DefenseAssignment[] {
    const assignments = Array.from(this.assignments.values()).filter(assignment => Game.creeps[assignment.creepName]);
    const seen = new Set(assignments.map(assignment => assignment.creepName));
    return [...assignments, ...this.getMemoryBackedAssignments(undefined, undefined, seen)];
  }

  /**
   * Cancel defense assignment for a creep
   */
  public cancelAssignment(creepName: string): void {
    const assignment = this.assignments.get(creepName);
    const creep = Game.creeps[creepName];
    const memory = creep?.memory as Partial<DefenseAssistStagingMemory> | undefined;
    const hasStagedAssignment = memory ? Boolean(getDefenseAssistTargetRoom(memory)) : false;
    if (!assignment && !hasStagedAssignment) return;

    if (memory) {
      clearDefenseAssistMemory(memory);
    }
    this.assignments.delete(creepName);

    logger.info(
      `Cancelled defense assignment for ${creepName}`,
      { subsystem: "Defense" }
    );
  }
}

/**
 * Global defense coordinator instance
 */
export const defenseCoordinator = new DefenseCoordinator();
