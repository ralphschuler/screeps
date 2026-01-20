/**
 * Spawn Queue Adapter
 * 
 * Stub implementation for spawn queue functions.
 * The actual spawn queue should be injected by the consuming bot code.
 */

import { SpawnPriority, type SpawnRequest } from "../types";

/**
 * Spawn Queue Manager
 * Stub implementation - provides minimal interface
 */
export class SpawnQueueAdapter {
  /**
   * Add a spawn request to the queue
   * Stub implementation - does nothing
   */
  public addRequest(request: SpawnRequest): void {
    // Stub implementation
    // Real implementation should add to Memory-based queue
    console.log(`[SpawnQueue] Stub: Would add spawn request for ${request.role} in ${request.roomName}`);
  }

  /**
   * Get pending requests for a room
   * Stub implementation - returns empty array
   */
  public getPendingRequests(roomName: string): SpawnRequest[] {
    // Stub implementation
    return [];
  }

  /**
   * Check if there are high priority requests
   * Stub implementation - returns false
   */
  public hasEmergency(roomName: string): boolean {
    // Stub implementation
    return false;
  }
}

/**
 * Singleton instance
 */
export const spawnQueue = new SpawnQueueAdapter();
