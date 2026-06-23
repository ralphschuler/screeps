/**
 * Event priority policy for the kernel event bus.
 *
 * Centralizing defaults keeps CPU-bucket scheduling policy easy to audit without
 * mixing it into the queue mechanics.
 */

import type { EventName } from "./types";

// ============================================================================
// Event Priority Levels
// ============================================================================

/**
 * Event priority levels
 */
export enum EventPriority {
  /** Critical events (combat, nukes) - always process immediately */
  CRITICAL = 100,
  /** High priority (spawns, deaths) */
  HIGH = 75,
  /** Normal priority (economy, construction) */
  NORMAL = 50,
  /** Low priority (stats, metrics) */
  LOW = 25,
  /** Background events (can be deferred) */
  BACKGROUND = 10
}

/**
 * Default priorities for event types
 */
export const DEFAULT_EVENT_PRIORITIES: Partial<Record<EventName, EventPriority>> = {
  // Critical
  "hostile.detected": EventPriority.CRITICAL,
  "nuke.detected": EventPriority.CRITICAL,
  "safemode.activated": EventPriority.CRITICAL,
  
  // High
  "structure.destroyed": EventPriority.HIGH,
  "hostile.cleared": EventPriority.HIGH,
  "creep.died": EventPriority.HIGH,
  "energy.critical": EventPriority.HIGH,
  "spawn.emergency": EventPriority.HIGH,
  "posture.change": EventPriority.HIGH,
  
  // Normal
  "spawn.completed": EventPriority.NORMAL,
  "rcl.upgrade": EventPriority.NORMAL,
  "construction.complete": EventPriority.NORMAL,
  "remote.lost": EventPriority.NORMAL,
  "squad.formed": EventPriority.NORMAL,
  "squad.dissolved": EventPriority.NORMAL,
  
  // Low
  "market.transaction": EventPriority.LOW,
  "pheromone.update": EventPriority.LOW,
  "cluster.update": EventPriority.LOW,
  "expansion.candidate": EventPriority.LOW,
  "powerbank.discovered": EventPriority.LOW,
  
  // Background
  "cpu.spike": EventPriority.BACKGROUND,
  "bucket.modeChange": EventPriority.BACKGROUND
};

