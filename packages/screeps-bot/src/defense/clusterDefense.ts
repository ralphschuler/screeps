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

import { logger } from "../core/logger";
import { memoryManager } from "../memory/manager";
import { type ThreatAnalysis, assessThreat, logThreatAnalysis } from "./threatAssessment";

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
            };
            return (
              (memory.role === "defender" || 
               memory.role === "rangedDefender" || 
               memory.role === "guard" || 
               memory.role === "ranger") &&
              !memory.assistTarget
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
    for (const defender of defenders) {
      const memory = defender.memory as unknown as { assistTarget?: string };
      memory.assistTarget = targetRoom;
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

    // Check if safe mode is available
    if (room.controller.safeModeAvailable > 0 && !room.controller.safeMode) {
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
 * Coordinate defense for a specific room's cluster
 * 
 * @param roomName - Room to coordinate defense for
 */
export function coordinateClusterDefense(roomName: string): void {
  const clusterId = findClusterForRoom(roomName);
  if (!clusterId) {
    // Room not in a cluster, skip cluster coordination
    return;
  }

  clusterDefenseCoordinator.coordinateDefense(clusterId);
}
