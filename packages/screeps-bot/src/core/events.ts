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
 * eventBus.emit('hostile.detected', { roomName: 'W1N1', creepId: '...' });
 * ```
 * 
 * TODO(P2): ARCH - Consider implementing event replay/persistence for debugging
 * Store recent events in a ring buffer for post-mortem analysis of issues
 * TODO(P2): PERF - Add event coalescing for high-frequency events
 * Multiple identical events in the same tick could be merged to reduce handler calls
 * 
 * Test Coverage: 93% (events.ts) - Comprehensive tests exist in events.test.ts for:
 * - Event registration and handler management
 * - Priority ordering and execution
 * - Bucket filtering and throttling
 * - Event queue management and age limits
 */

import { logger } from "./logger";

// ============================================================================
// Event Type Definitions
// ============================================================================

/**
 * Base event interface - all events extend this
 */
export interface BaseEvent {
  /** Timestamp when event was created */
  tick: number;
  /** Event source (room, creep, system) */
  source?: string;
}

/**
 * Hostile detection event
 */
export interface HostileDetectedEvent extends BaseEvent {
  roomName: string;
  hostileId: Id<Creep>;
  hostileOwner: string;
  bodyParts: number;
  threatLevel: number;
}

/**
 * Hostile cleared event
 */
export interface HostileClearedEvent extends BaseEvent {
  roomName: string;
}

/**
 * Structure destroyed event
 */
export interface StructureDestroyedEvent extends BaseEvent {
  roomName: string;
  structureType: StructureConstant;
  structureId: string;
}

/**
 * Nuke detected event
 */
export interface NukeDetectedEvent extends BaseEvent {
  roomName: string;
  nukeId: Id<Nuke>;
  landingTick: number;
  launchRoomName: string;
}

/**
 * Remote room lost event
 */
export interface RemoteLostEvent extends BaseEvent {
  homeRoom: string;
  remoteRoom: string;
  reason: "hostile" | "claimed" | "unreachable";
}

/**
 * Spawn completed event
 */
export interface SpawnCompletedEvent extends BaseEvent {
  roomName: string;
  creepName: string;
  role: string;
  cost: number;
}

/**
 * Spawn emergency event - triggered during workforce collapse with critically low energy
 */
export interface SpawnEmergencyEvent extends BaseEvent {
  roomName: string;
  energyAvailable: number;
  message: string;
}

/**
 * Creep died event
 */
export interface CreepDiedEvent extends BaseEvent {
  creepName: string;
  role: string;
  homeRoom: string;
  cause: "ttl" | "combat" | "unknown";
}

/**
 * RCL upgrade event
 */
export interface RclUpgradeEvent extends BaseEvent {
  roomName: string;
  newLevel: number;
}

/**
 * Energy critical event
 */
export interface EnergyCriticalEvent extends BaseEvent {
  roomName: string;
  energyAvailable: number;
  energyCapacity: number;
}

/**
 * Construction complete event
 */
export interface ConstructionCompleteEvent extends BaseEvent {
  roomName: string;
  structureType: StructureConstant;
  structureId: Id<Structure>;
}

/**
 * Market transaction event
 */
export interface MarketTransactionEvent extends BaseEvent {
  resourceType: ResourceConstant;
  amount: number;
  price: number;
  incoming: boolean;
  roomName: string;
}

/**
 * Pheromone update event
 */
export interface PheromoneUpdateEvent extends BaseEvent {
  roomName: string;
  pheromoneType: string;
  oldValue: number;
  newValue: number;
}

/**
 * Posture change event
 */
export interface PostureChangeEvent extends BaseEvent {
  roomName: string;
  oldPosture: string;
  newPosture: string;
}

/**
 * Squad formed event
 */
export interface SquadFormedEvent extends BaseEvent {
  squadId: string;
  squadType: string;
  memberCount: number;
  targetRoom: string;
}

/**
 * Squad dissolved event
 */
export interface SquadDissolvedEvent extends BaseEvent {
  squadId: string;
  reason: "complete" | "failed" | "timeout";
}

/**
 * Cluster event
 */
export interface ClusterUpdateEvent extends BaseEvent {
  clusterId: string;
  updateType: "metrics" | "role" | "membership";
}

/**
 * CPU spike event
 */
export interface CpuSpikeEvent extends BaseEvent {
  cpuUsed: number;
  cpuLimit: number;
  subsystem: string;
}

/**
 * Bucket mode change event
 */
export interface BucketModeChangeEvent extends BaseEvent {
  oldMode: string;
  newMode: string;
  bucket: number;
}

/**
 * Safe mode activated event
 */
export interface SafeModeActivatedEvent extends BaseEvent {
  roomName: string;
  ticksRemaining: number;
}

/**
 * Power bank discovered event
 */
export interface PowerBankDiscoveredEvent extends BaseEvent {
  roomName: string;
  power: number;
  decayTick: number;
}

/**
 * Expansion candidate found event
 */
export interface ExpansionCandidateEvent extends BaseEvent {
  roomName: string;
  score: number;
  distance: number;
}

/**
 * Process suspended event
 */
export interface ProcessSuspendedEvent extends BaseEvent {
  processId: string;
  processName: string;
  reason: string;
  consecutive: number;
  permanent: boolean;
  resumeAt?: number;
}

/**
 * Process recovered event
 */
export interface ProcessRecoveredEvent extends BaseEvent {
  processId: string;
  processName: string;
  previousReason: string;
  consecutiveErrors: number;
  manual?: boolean;
}

// ============================================================================
// Event Map - Maps event names to their payload types
// ============================================================================

/**
 * Map of all event types and their payloads
 * This provides type safety for event subscriptions and emissions
 */
export interface EventMap {
  // Combat events
  "hostile.detected": HostileDetectedEvent;
  "hostile.cleared": HostileClearedEvent;
  "structure.destroyed": StructureDestroyedEvent;
  "nuke.detected": NukeDetectedEvent;
  "safemode.activated": SafeModeActivatedEvent;

  // Economy events
  "spawn.completed": SpawnCompletedEvent;
  "spawn.emergency": SpawnEmergencyEvent;
  "creep.died": CreepDiedEvent;
  "rcl.upgrade": RclUpgradeEvent;
  "energy.critical": EnergyCriticalEvent;
  "construction.complete": ConstructionCompleteEvent;
  "market.transaction": MarketTransactionEvent;

  // Strategic events
  "remote.lost": RemoteLostEvent;
  "expansion.candidate": ExpansionCandidateEvent;
  "powerbank.discovered": PowerBankDiscoveredEvent;

  // Swarm events
  "pheromone.update": PheromoneUpdateEvent;
  "posture.change": PostureChangeEvent;
  "squad.formed": SquadFormedEvent;
  "squad.dissolved": SquadDissolvedEvent;
  "cluster.update": ClusterUpdateEvent;

  // System events
  "cpu.spike": CpuSpikeEvent;
  "bucket.modeChange": BucketModeChangeEvent;
  
  // Process events
  "process.suspended": ProcessSuspendedEvent;
  "process.recovered": ProcessRecoveredEvent;
}

/**
 * All possible event names
 */
export type EventName = keyof EventMap;

/**
 * Get the payload type for a given event name
 */
export type EventPayload<T extends EventName> = EventMap[T];

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Event handler function type
 */
export type EventHandler<T extends EventName> = (event: EventPayload<T>) => void;

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
}

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
const DEFAULT_EVENT_PRIORITIES: Partial<Record<EventName, EventPriority>> = {
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

// ============================================================================
// Event Bus Configuration
// ============================================================================

/**
 * Event bus configuration
 */
export interface EventBusConfig {
  /** Maximum events to process per tick */
  maxEventsPerTick: number;
  /** Maximum queue size */
  maxQueueSize: number;
  /** Low bucket threshold for deferring events */
  lowBucketThreshold: number;
  /** Critical bucket threshold (only process critical events) */
  criticalBucketThreshold: number;
  /** Maximum age for queued events (ticks) */
  maxEventAge: number;
  /** Enable event logging */
  enableLogging: boolean;
  /** Log interval for stats (ticks) */
  statsLogInterval: number;
}

const DEFAULT_CONFIG: EventBusConfig = {
  maxEventsPerTick: 50,
  maxQueueSize: 200,
  lowBucketThreshold: 2000,
  criticalBucketThreshold: 1000,
  maxEventAge: 100,
  enableLogging: false,
  statsLogInterval: 100
};

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
  private handlerIdCounter = 0;
  private stats = {
    eventsEmitted: 0,
    eventsProcessed: 0,
    eventsDeferred: 0,
    eventsDropped: 0,
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
    // Check queue size
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      // Remove oldest low-priority event
      const oldestLowPriority = this.eventQueue
        .map((e, i) => ({ event: e, index: i }))
        .filter(({ event }) => event.priority < EventPriority.HIGH)
        .sort((a, b) => a.event.queuedAt - b.event.queuedAt)[0];

      if (oldestLowPriority && oldestLowPriority.event.priority < priority) {
        this.eventQueue.splice(oldestLowPriority.index, 1);
        this.stats.eventsDropped++;
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
      queuedAt: Game.time
    };

    this.eventQueue.push(queuedEvent);
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
   * Process queued events
   * Call this each tick to process deferred events
   */
  public processQueue(): void {
    const bucket = Game.cpu.bucket;
    
    // Skip if bucket is too low
    if (bucket < this.config.criticalBucketThreshold) {
      return;
    }

    // Determine how many events to process
    let maxEvents = this.config.maxEventsPerTick;
    if (bucket < this.config.lowBucketThreshold) {
      // Reduce processing in low bucket
      maxEvents = Math.floor(maxEvents / 2);
    }

    // Clean up old events
    const now = Game.time;
    this.eventQueue = this.eventQueue.filter(event => {
      if (now - event.queuedAt > this.config.maxEventAge) {
        this.stats.eventsDropped++;
        return false;
      }
      return true;
    });

    // Process events
    let processed = 0;
    while (this.eventQueue.length > 0 && processed < maxEvents) {
      const event = this.eventQueue.shift();
      if (event) {
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
        `${stats.queueSize} queued, ${stats.handlerCount} handlers`,
        { subsystem: "EventBus" }
      );
    }
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();
