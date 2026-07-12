/**
 * Event System - Bucket-Aware, Type-Safe Event Bus
 *
 * This module provides a centralized event system for the bot:
 * - Type-safe event definitions with typed payloads
 * - Bucket-aware event processing (deferred execution in low bucket)
 * - Priority-based event handling
 * - Event queuing for deferred processing
 *
 * Design Principles (from ROADMAP.md):
 * - Ereignisgetriebene Logik: Critical events update flags immediately
 * - CPU-Bucket-gesteuertes Verhalten: High bucket enables expensive operations
 * - Stigmergische Kommunikation: Simple, efficient communication
 *
 * Usage:
 * ```typescript
 * // Subscribe to events
 * eventBus.on('hostile.detected', (event) => {
 *   logger.warn('Hostile detected', { room: event.roomName, subsystem: 'defense' });
 * });
 *
 * // Emit events
 * eventBus.emit('hostile.detected', {
 *   roomName: 'W1N1',
 *   hostileId: creep.id,
 *   hostileOwner: creep.owner.username,
 *   bodyParts: creep.body.length,
 *   threatLevel: 2
 * });
 * ```
 *
 * TODO(P2): ARCH - Consider implementing event replay/persistence for debugging
 * Store recent events in a ring buffer for post-mortem analysis of issues
 */

import { logger } from "./logger";

import { DEFAULT_CONFIG, type EventBusConfig } from "./events/config";
import { DEFAULT_EVENT_PRIORITIES, EventPriority } from "./events/priorities";
import type { EventHandler, EventName, EventPayload } from "./events/types";

export type { EventBusConfig } from "./events/config";
export { EventPriority } from "./events/priorities";
export type {
  BaseEvent,
  HostileDetectedEvent,
  HostileClearedEvent,
  StructureDestroyedEvent,
  NukeDetectedEvent,
  RemoteLostEvent,
  SpawnCompletedEvent,
  SpawnEmergencyEvent,
  CreepDiedEvent,
  RclUpgradeEvent,
  EnergyCriticalEvent,
  ConstructionCompleteEvent,
  MarketTransactionEvent,
  PheromoneUpdateEvent,
  PostureChangeEvent,
  SquadFormedEvent,
  SquadDissolvedEvent,
  ClusterUpdateEvent,
  CpuSpikeEvent,
  BucketModeChangeEvent,
  SafeModeActivatedEvent,
  PowerBankDiscoveredEvent,
  ExpansionCandidateEvent,
  ProcessSuspendedEvent,
  ProcessRecoveredEvent,
  EventMap,
  EventName,
  EventPayload,
  EventHandler
} from "./events/types";

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Handler registration with metadata
 */
interface HandlerRegistration<T extends EventName> {
  /** Handler function */
  handler: EventHandler<T>;
  /** Priority (higher runs first) */
  priority: number;
  /** Minimum bucket to execute handler */
  minBucket: number;
  /** One-time handler (unsubscribe after first call) */
  once: boolean;
  /** Handler ID for unsubscription */
  id: string;
}

/**
 * Queued event for deferred processing
 */
interface QueuedEvent<T extends EventName = EventName> {
  /** Event name */
  name: T;
  /** Event payload */
  payload: EventPayload<T>;
  /** Priority for processing order */
  priority: number;
  /** Tick when event was queued */
  queuedAt: number;
  /** Number of identical events coalesced into this queue entry */
  coalescedCount: number;
}

// ============================================================================
// Event Bus Implementation
// ============================================================================

/**
 * Event Bus - Central event management system
 *
 * Features:
 * - Type-safe event emission and subscription
 * - Priority-based event processing
 * - Bucket-aware event deferral
 * - Event queuing for deferred processing
 */
export class EventBus {
  private config: EventBusConfig;
  private handlers: Map<EventName, HandlerRegistration<any>[]> = new Map();
  private eventQueue: QueuedEvent[] = [];
  /**
   * Map of coalescing keys to queued events.
   * Allows deduping identical queued events in O(1) time.
   */
  private coalescedQueueMap = new Map<string, QueuedEvent>();
  private handlerIdCounter = 0;
  /**
   * Shared deferred-processing allowance for the current game tick.
   *
   * Kernel and bot lifecycle code both call processQueue() around scheduled
   * work. Keying the allowance by Game.time keeps those calls from doubling
   * the configured event budget while still allowing same-tick emissions to
   * consume the remaining allowance.
   */
  private queueBudgetTick: number | null = null;
  private queueBudgetRemaining = 0;
  private stats = {
    eventsEmitted: 0,
    eventsProcessed: 0,
    eventsDeferred: 0,
    eventsDropped: 0,
    eventsCoalesced: 0,
    handlersInvoked: 0
  };

  public constructor(config: Partial<EventBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Subscribe to an event
   *
   * @param eventName - Name of the event to subscribe to
   * @param handler - Handler function to call when event is emitted
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  public on<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options: {
      priority?: number;
      minBucket?: number;
      once?: boolean;
    } = {}
  ): () => void {
    const registration: HandlerRegistration<T> = {
      handler,
      priority: options.priority ?? EventPriority.NORMAL,
      minBucket: options.minBucket ?? 0,
      once: options.once ?? false,
      id: `handler_${++this.handlerIdCounter}`
    };

    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(registration);
    // Sort by priority (highest first)
    handlers.sort((a, b) => b.priority - a.priority);
    this.handlers.set(eventName, handlers);

    if (this.config.enableLogging) {
      logger.debug(`EventBus: Registered handler for "${eventName}" (id: ${registration.id})`, {
        subsystem: "EventBus"
      });
    }

    // Return unsubscribe function
    return () => this.off(eventName, registration.id);
  }

  /**
   * Subscribe to an event (one-time)
   */
  public once<T extends EventName>(
    eventName: T,
    handler: EventHandler<T>,
    options: { priority?: number; minBucket?: number } = {}
  ): () => void {
    return this.on(eventName, handler, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event by handler ID
   */
  private off(eventName: EventName, handlerId: string): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.findIndex(h => h.id === handlerId);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (this.config.enableLogging) {
          logger.debug(`EventBus: Unregistered handler "${handlerId}" from "${eventName}"`, {
            subsystem: "EventBus"
          });
        }
      }
    }
  }

  /**
   * Unsubscribe all handlers for an event
   */
  public offAll(eventName: EventName): void {
    this.handlers.delete(eventName);
    if (this.config.enableLogging) {
      logger.debug(`EventBus: Removed all handlers for "${eventName}"`, {
        subsystem: "EventBus"
      });
    }
  }

  /**
   * Emit an event
   *
   * @param eventName - Name of the event to emit
   * @param payload - Event payload (without tick, which is added automatically)
   * @param options - Emission options
   */
  public emit<T extends EventName>(
    eventName: T,
    payload: Omit<EventPayload<T>, "tick">,
    options: {
      immediate?: boolean;
      priority?: number;
    } = {}
  ): void {
    const fullPayload = {
      ...payload,
      tick: Game.time
    } as EventPayload<T>;

    const priority = options.priority ?? DEFAULT_EVENT_PRIORITIES[eventName] ?? EventPriority.NORMAL;
    const immediate = options.immediate ?? priority >= EventPriority.CRITICAL;

    this.stats.eventsEmitted++;

    if (this.config.enableLogging) {
      logger.debug(`EventBus: Emitting "${eventName}" (priority: ${priority}, immediate: ${String(immediate)})`, {
        subsystem: "EventBus"
      });
    }

    // Check bucket status for non-immediate events
    const bucket = Game.cpu.bucket;
    
    if (immediate || bucket >= this.config.lowBucketThreshold) {
      // Process immediately
      this.processEvent(eventName, fullPayload);
    } else if (bucket >= this.config.criticalBucketThreshold) {
      // Queue for later processing
      this.queueEvent(eventName, fullPayload, priority);
    } else {
      // Critical bucket - only process critical events
      if (priority >= EventPriority.CRITICAL) {
        this.processEvent(eventName, fullPayload);
      } else {
        this.stats.eventsDropped++;
        if (this.config.enableLogging) {
          logger.warn(`EventBus: Dropped event "${eventName}" due to critical bucket`, {
            subsystem: "EventBus"
          });
        }
      }
    }
  }

  /**
   * Build a stable key for coalescing queued events.
   */
  private getCoalescingKey<T extends EventName>(eventName: T, payload: EventPayload<T>, priority: number): string {
    return [
      eventName,
      priority,
      this.serializePayload(payload)
    ].join("|");
  }

  /**
   * Serialize payload to a stable string representation for signature comparisons.
   */
  private serializePayload(value: unknown): string {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map(entry => this.serializePayload(entry)).join(",")}]`;
    }

    const keys = Object.keys(value as Record<string, any>).sort();
    const normalized: Record<string, unknown> = {};

    for (const key of keys) {
      normalized[key] = (value as Record<string, any>)[key];
    }

    return JSON.stringify(normalized);
  }

  /**
   * Create and register queue map key for an existing queued event.
   */
  private getQueuedEventKey(event: QueuedEvent): string {
    return this.getCoalescingKey(event.name, event.payload, event.priority);
  }

  /**
   * Remove a queued event from the coalescing index map.
   */
  private removeQueuedEventFromMap(event: QueuedEvent): void {
    const key = this.getQueuedEventKey(event);
    const mapped = this.coalescedQueueMap.get(key);
    if (mapped === event) {
      this.coalescedQueueMap.delete(key);
    }
  }

  /**
   * Handle cleanup bookkeeping when a queued event is dropped due to queue overflow or age.
   */
  private dropQueuedEvent(event: QueuedEvent): void {
    this.removeQueuedEventFromMap(event);
    this.stats.eventsDropped++;
  }

  /**
   * Process an event immediately
   */
  private processEvent<T extends EventName>(eventName: T, payload: EventPayload<T>): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers || handlers.length === 0) {
      return;
    }

    const bucket = Game.cpu.bucket;
    const handlersToRemove: string[] = [];

    for (const registration of handlers) {
      // Check bucket requirement
      if (bucket < registration.minBucket) {
        continue;
      }

      try {
        registration.handler(payload);
        this.stats.handlersInvoked++;

        // Mark one-time handlers for removal
        if (registration.once) {
          handlersToRemove.push(registration.id);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`EventBus: Handler error for "${eventName}": ${errorMessage}`, {
          subsystem: "EventBus"
        });
      }
    }

    // Remove one-time handlers
    for (const handlerId of handlersToRemove) {
      this.off(eventName, handlerId);
    }

    this.stats.eventsProcessed++;
  }

  /**
   * Queue an event for deferred processing
   */
  private queueEvent<T extends EventName>(
    eventName: T,
    payload: EventPayload<T>,
    priority: number
  ): void {
    const coalescingKey = this.getCoalescingKey(eventName, payload, priority);

    if (this.config.enableEventCoalescing) {
      const existing = this.coalescedQueueMap.get(coalescingKey);
      if (existing) {
        existing.coalescedCount += 1;
        this.stats.eventsCoalesced++;
        return;
      }
    }

    // Check queue size
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      // Remove oldest low-priority event
      const oldestLowPriority = this.eventQueue
        .map((e, i) => ({ event: e, index: i }))
        .filter(({ event }) => event.priority < EventPriority.HIGH)
        .sort((a, b) => a.event.queuedAt - b.event.queuedAt)[0];

      if (oldestLowPriority && oldestLowPriority.event.priority < priority) {
        const removed = this.eventQueue.splice(oldestLowPriority.index, 1)[0];
        if (removed) {
          this.removeQueuedEventFromMap(removed);
          this.stats.eventsDropped++;
        }
      } else {
        // Can't make room, drop this event
        this.stats.eventsDropped++;
        return;
      }
    }

    const queuedEvent: QueuedEvent<T> = {
      name: eventName,
      payload,
      priority,
      queuedAt: Game.time,
      coalescedCount: 1
    };

    this.eventQueue.push(queuedEvent);
    this.coalescedQueueMap.set(coalescingKey, queuedEvent);

    // Sort by priority (highest first), then by age (oldest first)
    this.eventQueue.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.queuedAt - b.queuedAt;
    });

    this.stats.eventsDeferred++;
  }

  /**
   * Start a new tick - clears tick-specific caches
   * Call this at the beginning of each tick before processing
   */
  public startTick(): void {
    // The deferred-processing allowance is keyed by Game.time instead of
    // being reset here, so a second lifecycle caller cannot reset the budget.
  }

  private getQueueAllowanceForBucket(bucket: number): number {
    return bucket < this.config.lowBucketThreshold
      ? Math.floor(this.config.maxEventsPerTick / 2)
      : this.config.maxEventsPerTick;
  }

  /**
   * Process queued events.
   *
   * This method is safe to call more than once in a tick. All callers share
   * one bucket-aware allowance, so kernel and bot lifecycle handoffs cannot
   * process twice the configured maxEventsPerTick. Events emitted by a
   * handler or scheduled process can still use the remaining same-tick
   * allowance.
   */
  public processQueue(): void {
    const bucket = Game.cpu.bucket;

    // Skip if bucket is too low
    if (bucket < this.config.criticalBucketThreshold) {
      return;
    }

    const currentTick = Game.time;
    if (this.queueBudgetTick !== currentTick) {
      this.queueBudgetTick = currentTick;
      this.queueBudgetRemaining = this.getQueueAllowanceForBucket(bucket);
    }

    if (this.queueBudgetRemaining <= 0) {
      return;
    }

    // Clean up old events
    const now = Game.time;
    const retainedEvents: QueuedEvent[] = [];
    for (const event of this.eventQueue) {
      if (now - event.queuedAt > this.config.maxEventAge) {
        this.dropQueuedEvent(event);
      } else {
        retainedEvents.push(event);
      }
    }
    this.eventQueue = retainedEvents;

    // A later call in the same tick may observe a different bucket in tests
    // or a host runtime; never let that call exceed the shared allowance.
    const allowance = Math.min(
      this.queueBudgetRemaining,
      this.getQueueAllowanceForBucket(bucket)
    );

    // Process events
    let processed = 0;
    while (this.eventQueue.length > 0 && processed < allowance) {
      const event = this.eventQueue.shift();
      if (event) {
        this.removeQueuedEventFromMap(event);
        // Reserve the allowance before invoking handlers so a re-entrant
        // processQueue() call cannot process the same tick twice.
        this.queueBudgetRemaining--;
        this.processEvent(event.name, event.payload);
        processed++;
      }
    }
  }

  /**
   * Get event bus statistics
   */
  public getStats(): {
    eventsEmitted: number;
    eventsProcessed: number;
    eventsDeferred: number;
    eventsDropped: number;
    eventsCoalesced: number;
    handlersInvoked: number;
    queueSize: number;
    handlerCount: number;
  } {
    let handlerCount = 0;
    for (const handlers of this.handlers.values()) {
      handlerCount += handlers.length;
    }

    return {
      ...this.stats,
      queueSize: this.eventQueue.length,
      handlerCount
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      eventsEmitted: 0,
      eventsProcessed: 0,
      eventsDeferred: 0,
      eventsDropped: 0,
      eventsCoalesced: 0,
      handlersInvoked: 0
    };
  }

  /**
   * Get current configuration
   */
  public getConfig(): EventBusConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<EventBusConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear all handlers and queued events
   */
  public clear(): void {
    this.handlers.clear();
    this.eventQueue = [];
    this.coalescedQueueMap.clear();
    this.queueBudgetTick = null;
    this.queueBudgetRemaining = 0;
    this.resetStats();
  }

  /**
   * Get registered handler count for an event
   */
  public getHandlerCount(eventName: EventName): number {
    return this.handlers.get(eventName)?.length ?? 0;
  }

  /**
   * Check if there are any handlers for an event
   */
  public hasHandlers(eventName: EventName): boolean {
    return this.getHandlerCount(eventName) > 0;
  }

  /**
   * Log statistics (call periodically)
   */
  public logStats(): void {
    if (Game.time % this.config.statsLogInterval === 0) {
      const stats = this.getStats();
      logger.debug(
        `EventBus stats: ${stats.eventsEmitted} emitted, ${stats.eventsProcessed} processed, ` +
        `${stats.eventsDeferred} deferred, ${stats.eventsDropped} dropped, ` +
        `${stats.eventsCoalesced} coalesced, ${stats.queueSize} queued, ` +
        `${stats.handlerCount} handlers`,
        { subsystem: "EventBus" }
      );
    }
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();
