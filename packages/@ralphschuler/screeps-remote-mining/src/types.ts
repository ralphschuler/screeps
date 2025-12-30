/**
 * Type definitions for Remote Mining system
 *
 * This file defines types and dependency injection interfaces used throughout
 * the remote mining package.
 */

/**
 * Remote route type for semantic identification
 */
export type RemoteRouteType = "harvester" | "hauler";

/**
 * Remote route identifier
 */
export interface RemoteRoute {
  /** Home room name */
  homeRoom: string;
  /** Remote room name */
  remoteRoom: string;
  /** Source ID in remote room (optional - may use room entrance instead) */
  sourceId?: Id<Source>;
  /** Route type */
  type: RemoteRouteType;
}

// =============================================================================
// Dependency Injection Interfaces
// =============================================================================

/**
 * Logger interface for dependency injection.
 * Allows the package to use any logging implementation.
 */
export interface ILogger {
  debug(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  info(message: string, context?: { subsystem?: string; room?: string; meta?: Record<string, unknown> }): void;
  warn(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
  error(message: string, context?: { subsystem?: string; meta?: Record<string, unknown> }): void;
}

/**
 * Cache interface for dependency injection.
 * Provides path caching capabilities.
 */
export interface IPathCache {
  /**
   * Get a cached path between two positions
   */
  getCachedPath(from: RoomPosition, to: RoomPosition): PathStep[] | null;

  /**
   * Cache a path between two positions
   */
  cachePath(from: RoomPosition, to: RoomPosition, path: PathStep[], options?: { ttl?: number }): void;

  /**
   * Convert RoomPosition array to PathStep array
   */
  convertRoomPositionsToPathSteps(positions: RoomPosition[]): PathStep[];
}

/**
 * Scheduler interface for dependency injection.
 * Allows scheduling of periodic tasks.
 */
export interface IScheduler {
  /**
   * Schedule a task to run periodically
   * @param name - Unique task identifier
   * @param interval - Ticks between executions
   * @param handler - Function to execute
   * @param priority - Task priority (affects bucket threshold)
   * @param cpuBudget - Maximum CPU to spend per execution
   */
  scheduleTask(
    name: string,
    interval: number,
    handler: () => void,
    priority: TaskPriority,
    cpuBudget: number
  ): void;
}

/**
 * Task priority levels for scheduling
 */
export enum TaskPriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}
