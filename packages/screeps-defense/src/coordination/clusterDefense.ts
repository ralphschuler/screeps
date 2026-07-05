/**
 * Cluster Defense Coordination System
 * 
 * Coordinates defense efforts across cluster rooms:
 * - Shares defenders between cluster members
 * - Prioritizes assistance based on threat severity
 * - Coordinates safe mode usage to prevent waste
 * - Implements preemptive defense spawning
 * 
 * ROADMAP Reference: Section 11 - Cluster-Ebene
 * - Koordinierte Militäraktionen
 * - Inter-Room-Logistik
 */

import { logger } from "@ralphschuler/screeps-core";
import { memoryManager } from "@ralphschuler/screeps-memory";
import { type ThreatAnalysis, assessThreat, logThreatAnalysis } from "../threat/threatAssessment";
import { getDefenseAssistTargetRoom, stageDefenseAssistCreep } from "./defenseAssistStaging";

/**
 * Find cluster for a room
 * 
 * @param roomName - Room to find cluster for
 * @returns Cluster ID or undefined
 */
function findClusterForRoom(roomName: string): string | undefined {
  const swarm = memoryManager.getOrInitSwarmState(roomName);
  return swarm.clusterId;
}

/**
 * Get all rooms in a cluster
 * 
 * @param clusterId - Cluster ID
 * @returns Array of room names in cluster
 */
function getClusterRooms(clusterId: string): string[] {
  const cluster = memoryManager.getCluster(clusterId);
  
  if (!cluster) {
    return [];
  }

  return cluster.memberRooms;
}

/**
 * Cluster Defense Coordinator
 * 
 * Provides cluster-wide defense coordination and mutual aid
 */
export class ClusterDefenseCoordinator {
  /**
   * Coordinate defense across cluster
   * 
   * @param clusterId - Cluster ID to coordinate
   */
  public coordinateDefense(clusterId: string): void {
    const clusterRooms = getClusterRooms(clusterId);
    
    if (clusterRooms.length === 0) {
      return;
    }

    // Assess threats across all cluster rooms
    const threats: ThreatAnalysis[] = [];
    for (const roomName of clusterRooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;
      
      const threat = assessThreat(room);
      threats.push(threat);
      
      // Log significant threats
      if (threat.dangerLevel >= 2) {
        logThreatAnalysis(threat);
      }
    }

    // Prioritize rooms needing assistance
    const assistanceRequests = threats
      .filter(t => t.assistanceRequired)
      .sort((a, b) => b.assistancePriority - a.assistancePriority);

    // Allocate defenders from safe rooms
    for (const request of assistanceRequests) {
      const defenders = this.findAvailableDefenders(clusterRooms, request.roomName);
      if (defenders.length > 0) {
        this.sendDefenders(defenders, request.roomName);
        logger.info(
          `Cluster Defense: Sending ${defenders.length} defenders to ${request.roomName}`,
          {
            subsystem: "Defense",
            room: request.roomName,
            meta: {
              cluster: clusterId,
              targetRoom: request.roomName,
              threatScore: request.threatScore,
              priority: request.assistancePriority
            }
          }
        );
      }
    }

    // Coordinate safe mode usage
    this.coordinateSafeMode(threats);
  }

  /**
   * Find available defenders in cluster rooms
   * 
   * @param clusterRooms - All rooms in cluster
   * @param excludeRoom - Room requesting help (don't take its defenders)
   * @returns Array of defender creeps available to help
   */
  private findAvailableDefenders(clusterRooms: string[], excludeRoom: string): Creep[] {
    const defenders: Creep[] = [];

    for (const roomName of clusterRooms) {
      if (roomName === excludeRoom) continue;

      const room = Game.rooms[roomName];
      if (!room) continue;

      // Check if room is safe enough to spare defenders
      const threat = assessThreat(room);
      if (threat.dangerLevel === 0) {
        // Room is safe, can spare defenders
        const roomDefenders = room.find(FIND_MY_CREEPS, {
          filter: c => {
            const memory = c.memory as unknown as {
              role?: string;
              assistTarget?: string;
              targetRoom?: string;
              task?: string;
            };
            return (
              (memory.role === "defender" ||
               memory.role === "rangedDefender" ||
               memory.role === "guard" ||
               memory.role === "ranger") &&
              !getDefenseAssistTargetRoom(memory)
            );
          }
        });
        defenders.push(...roomDefenders);
      }
    }

    return defenders;
  }

  /**
   * Send defenders to assist another room
   * 
   * @param defenders - Creeps to send
   * @param targetRoom - Room to defend
   */
  private sendDefenders(defenders: Creep[], targetRoom: string): void {
    const defendersByRoom = defenders.reduce((counts, defender) => {
      counts.set(defender.room.name, (counts.get(defender.room.name) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());

    for (const defender of defenders) {
      stageDefenseAssistCreep(defender, {
        homeRoom: defender.room.name,
        targetRoom,
        now: Game.time,
        squadSize: defendersByRoom.get(defender.room.name) ?? 1
      });
    }
  }

  /**
   * Coordinate safe mode activation
   * Only activate in highest priority room to prevent waste
   * 
   * @param threats - All threats in cluster
   */
  private coordinateSafeMode(threats: ThreatAnalysis[]): void {
    const safeModeNeeded = threats.filter(
      t => t.recommendedResponse === "safemode"
    );

    if (safeModeNeeded.length === 0) {
      return;
    }

    // Only activate safe mode in highest priority room
    const mostCritical = safeModeNeeded.reduce((max, t) =>
      t.threatScore > max.threatScore ? t : max
    );

    const room = Game.rooms[mostCritical.roomName];
    if (!room?.controller?.my) {
      return;
    }

    // Check if safe mode is available and not on cooldown
    if (
      room.controller.safeModeAvailable > 0 &&
      !room.controller.safeMode &&
      !room.controller.safeModeCooldown
    ) {
      const result = room.controller.activateSafeMode();
      
      if (result === OK) {
        logger.warn(
          `Activated safe mode in ${mostCritical.roomName}`,
          {
            subsystem: "Defense",
            room: mostCritical.roomName,
            meta: {
              threatScore: mostCritical.threatScore,
              hostiles: mostCritical.hostileCount,
              dangerLevel: mostCritical.dangerLevel
            }
          }
        );
      } else {
        logger.error(
          `Failed to activate safe mode in ${mostCritical.roomName}: ${result}`,
          {
            subsystem: "Defense",
            room: mostCritical.roomName,
            meta: {
              errorCode: result
            }
          }
        );
      }
    }
  }
}

/**
 * Global cluster defense coordinator instance
 */
export const clusterDefenseCoordinator = new ClusterDefenseCoordinator();

/**
 * Coordinate defense for a cluster, accepting either a cluster ID or a room name.
 *
 * ClusterManager already iterates concrete cluster records and passes `cluster.id`.
 * Room-level callers can still pass a room name and resolve through swarm memory.
 *
 * @param roomOrClusterId - Cluster ID or room name to coordinate defense for
 */
export function coordinateClusterDefense(roomOrClusterId: string): void {
  if (memoryManager.getCluster(roomOrClusterId)) {
    clusterDefenseCoordinator.coordinateDefense(roomOrClusterId);
    return;
  }

  const clusterId = findClusterForRoom(roomOrClusterId);
  if (!clusterId) {
    // Room not in a cluster, skip cluster coordination
    return;
  }

  clusterDefenseCoordinator.coordinateDefense(clusterId);
}
