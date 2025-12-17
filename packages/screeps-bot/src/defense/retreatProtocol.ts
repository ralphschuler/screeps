/**
 * Retreat Protocol System
 * 
 * Implements intelligent retreat logic for military creeps to prevent
 * unnecessary losses in unwinnable fights.
 * 
 * ROADMAP Reference: Section 12 - Threat-Level & Posture
 * - Retreat when overwhelmed to preserve resources
 */

import { logger } from "../core/logger";
import { type ThreatAnalysis, assessThreat } from "./threatAssessment";

/**
 * Determine if a creep should retreat based on threat assessment
 * 
 * @param creep - Creep to evaluate
 * @param threat - Current threat analysis for the room
 * @returns True if creep should retreat
 */
export function shouldRetreat(creep: Creep, threat: ThreatAnalysis): boolean {
  // Always retreat if safe mode recommended
  if (threat.recommendedResponse === "retreat" || threat.recommendedResponse === "safemode") {
    return true;
  }

  // Count friendly defenders in room
  const friendlyDefenders = creep.room.find(FIND_MY_CREEPS, {
    filter: c => {
      const memory = c.memory as unknown as { role?: string };
      return (
        memory.role === "defender" ||
        memory.role === "rangedDefender" ||
        memory.role === "guard" ||
        memory.role === "ranger"
      );
    }
  });

  // Retreat if heavily outnumbered (3:1 ratio)
  if (threat.hostileCount > friendlyDefenders.length * 3) {
    logger.info(
      `Creep ${creep.name} retreating: heavily outnumbered (${threat.hostileCount} hostiles vs ${friendlyDefenders.length} defenders)`,
      {
        subsystem: "Defense",
        room: creep.room.name,
        creep: creep.name
      }
    );
    return true;
  }

  // Retreat if creep is damaged and enemy has healers
  // Check for friendly healer support first
  const friendlyHealers = creep.room.find(FIND_MY_CREEPS, {
    filter: c => {
      const memory = c.memory as unknown as { role?: string };
      return memory.role === "healer";
    }
  });
  
  if (creep.hits < creep.hitsMax * 0.3 && threat.healerCount > 0 && friendlyHealers.length === 0) {
    logger.info(
      `Creep ${creep.name} retreating: damaged (${creep.hits}/${creep.hitsMax}) facing ${threat.healerCount} enemy healers without friendly healer support`,
      {
        subsystem: "Defense",
        room: creep.room.name,
        creep: creep.name
      }
    );
    return true;
  }

  // Retreat if facing boosted creeps without proper support
  if (threat.boostedCount > 0 && friendlyDefenders.length < threat.boostedCount * 2) {
    logger.info(
      `Creep ${creep.name} retreating: facing ${threat.boostedCount} boosted hostiles without sufficient support`,
      {
        subsystem: "Defense",
        room: creep.room.name,
        creep: creep.name
      }
    );
    return true;
  }

  return false;
}

/**
 * Execute retreat behavior for a creep
 * Moves to spawn or nearest safe room
 * 
 * @param creep - Creep to retreat
 */
export function executeRetreat(creep: Creep): void {
  // First priority: move to spawn if available
  const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
  if (spawn) {
    const result = creep.moveTo(spawn, {
      range: 3,
      visualizePathStyle: { stroke: "#ffaa00" }
    });
    
    if (result === OK || result === ERR_TIRED) {
      // Successfully moving to spawn
      return;
    }
  }

  // Second priority: flee to nearest exit leading to owned room
  const describedExits = Game.map.describeExits(creep.room.name);
  if (describedExits) {
    const directionToFindExit: Partial<Record<DirectionConstant, FindConstant>> = {
      [TOP]: FIND_EXIT_TOP,
      [BOTTOM]: FIND_EXIT_BOTTOM,
      [LEFT]: FIND_EXIT_LEFT,
      [RIGHT]: FIND_EXIT_RIGHT
    };

    const friendlyExitPositions: RoomPosition[] = [];

    for (const [directionString, roomName] of Object.entries(describedExits)) {
      const direction = Number(directionString) as DirectionConstant;
      const targetRoom = Game.rooms[roomName];
      if (!targetRoom?.controller?.my) {
        continue;
      }

      const findConstant = directionToFindExit[direction];
      if (!findConstant) {
        continue;
      }

      const positions = creep.room.find(findConstant);
      if (positions.length > 0) {
        friendlyExitPositions.push(...positions);
      }
    }

    if (friendlyExitPositions.length > 0) {
      const exit = creep.pos.findClosestByPath(friendlyExitPositions);
      if (exit) {
        creep.moveTo(exit, {
          visualizePathStyle: { stroke: "#ffaa00" }
        });
        return;
      }
    }
  }

  // Last resort: move to nearest exit (any direction)
  const anyExit = creep.pos.findClosestByPath(FIND_EXIT);
  if (anyExit) {
    creep.moveTo(anyExit, {
      visualizePathStyle: { stroke: "#ff0000" }
    });
  }
}

/**
 * Check if a military creep should retreat and execute if needed
 * 
 * @param creep - Military creep to evaluate
 * @returns True if creep is retreating, false otherwise
 */
export function checkAndExecuteRetreat(creep: Creep): boolean {
  const threat = assessThreat(creep.room);
  
  if (shouldRetreat(creep, threat)) {
    executeRetreat(creep);
    return true;
  }
  
  return false;
}
