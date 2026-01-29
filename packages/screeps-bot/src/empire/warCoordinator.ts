/**
 * War Coordinator
 * Handles war target management and tracking
 */

import { logger } from "@ralphschuler/screeps-core";
import type { EmpireMemory } from "@ralphschuler/screeps-memory";

/**
 * War Coordinator
 * Manages war targets and strategic warfare decisions
 */
export class WarCoordinator {
  /**
   * Update war targets based on threats and strategic goals
   */
  public updateWarTargets(empire: EmpireMemory): void {
    const myUsername = Object.values(Game.spawns)[0]?.owner.username ?? "";
    
    // Remove war targets that are no longer valid
    empire.warTargets = empire.warTargets.filter(target => {
      // Check if target still exists
      const intel = empire.knownRooms[target];
      if (!intel) {
        return false; // Remove unknown targets
      }
      
      // Remove if room is now owned by us
      if (intel.owner === myUsername) {
        return false;
      }
      
      // Keep if owned by someone else
      return !!intel.owner;
    });
    
    // Auto-add war targets based on threat (if in war mode)
    if (empire.objectives.warMode) {
      for (const roomName in empire.knownRooms) {
        const intel = empire.knownRooms[roomName];
        
        // Add high-threat rooms as war targets
        if (intel.threatLevel >= 2 && !empire.warTargets.includes(roomName)) {
          empire.warTargets.push(roomName);
          logger.warn(`Added war target: ${roomName} (threat level ${intel.threatLevel})`, { subsystem: "War" });
        }
      }
    }
  }
}

/**
 * Global war coordinator instance
 */
export const warCoordinator = new WarCoordinator();
