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
 */

import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import type { DefenseRequest } from "../spawning/defenderManager";
import { MediumFrequencyProcess, ProcessClass } from "../core/processDecorators";
import { ProcessPriority } from "../core/kernel";
import { assessThreat } from "./threatAssessment";

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
@ProcessClass()
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
   * Set defense requests in memory
   */
  private setDefenseRequestsInMemory(requests: DefenseRequest[]): void {
    const mem = Memory as unknown as Record<string, unknown>;
    mem.defenseRequests = requests;
  }

  /**
   * Main coordination loop - process defense requests and assign helpers
   * Registered as kernel process via decorator
   */
  @MediumFrequencyProcess("cluster:defense", "Defense Coordinator", {
    priority: ProcessPriority.HIGH,
    interval: 3,
    minBucket: 0, // Removed bucket requirement - aligns with kernel defaults
    cpuBudget: 0.05
  })
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
          const memory = c.memory as unknown as { role?: string; assistTarget?: string };
          
          // Must be the right role
          if (memory.role !== role) return false;
          
          // Must not already have an assignment
          if (memory.assistTarget) return false;
          
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

        // Set creep memory for role behavior
        const memory = defender.memory as unknown as { assistTarget?: string };
        memory.assistTarget = targetRoom;

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
            const memory = c.memory as unknown as { role?: string; assistTarget?: string };
            const role = memory.role;
            return (role === "guard" || role === "ranger") && !memory.assistTarget;
          }
        });
        score += defenders.length * 20;

        // Prefer safer rooms (they can spare defenders)
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
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

  /**
   * Get defenders already assigned to a room
   */
  private getAssignedDefenders(targetRoom: string, role?: string): DefenseAssignment[] {
    const assigned: DefenseAssignment[] = [];

    for (const [creepName, assignment] of this.assignments.entries()) {
      if (assignment.targetRoom !== targetRoom) continue;

      const creep = Game.creeps[creepName];
      if (!creep) continue;

      if (role) {
        const memory = creep.memory as unknown as { role?: string };
        if (memory.role !== role) continue;
      }

      assigned.push(assignment);
    }

    return assigned;
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
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length === 0) {
          // No more hostiles, release creep
          const memory = creep.memory as unknown as { assistTarget?: string };
          delete memory.assistTarget;
          toRemove.push(creepName);
          
          logger.debug(
            `Released ${creepName} from defense assistance (no hostiles in ${assignment.targetRoom})`,
            { subsystem: "Defense" }
          );
        }
      }

      // Remove stale assignments (older than 1000 ticks)
      if (Game.time - assignment.assignedAt > 1000) {
        const memory = creep.memory as unknown as { assistTarget?: string };
        delete memory.assistTarget;
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
    return Array.from(this.assignments.values());
  }

  /**
   * Cancel defense assignment for a creep
   */
  public cancelAssignment(creepName: string): void {
    const assignment = this.assignments.get(creepName);
    if (assignment) {
      const creep = Game.creeps[creepName];
      if (creep) {
        const memory = creep.memory as unknown as { assistTarget?: string };
        delete memory.assistTarget;
      }
      this.assignments.delete(creepName);
      
      logger.info(
        `Cancelled defense assignment for ${creepName}`,
        { subsystem: "Defense" }
      );
    }
  }
}

/**
 * Global defense coordinator instance
 */
export const defenseCoordinator = new DefenseCoordinator();
