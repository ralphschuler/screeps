/**
 * Event Bus - Centralized Event System
 *
 * This module re-exports the event bus from @ralphschuler/screeps-kernel framework package.
 *
 * The event bus provides:
 * - Type-safe event publishing and subscription
 * - Priority-based event handlers
 * - Automatic error handling and isolation
 * - Performance monitoring
 */

// Re-export everything from the framework package
export {
  type BaseEvent,
  type EventName,
  type EventPayload,
  type EventHandler,
  EventPriority,
  EventBus,
  eventBus
} from "@ralphschuler/screeps-kernel";
