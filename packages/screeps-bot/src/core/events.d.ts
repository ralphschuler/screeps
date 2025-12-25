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
 *   console.log(`Hostile in ${event.roomName}!`);
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
 * TODO(P3): TEST - Add unit tests for event bus priority ordering and bucket filtering
 * Ensure events are processed in correct order and bucket thresholds are respected
 */
/// <reference types="screeps" />
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
/**
 * Map of all event types and their payloads
 * This provides type safety for event subscriptions and emissions
 */
export interface EventMap {
    "hostile.detected": HostileDetectedEvent;
    "hostile.cleared": HostileClearedEvent;
    "structure.destroyed": StructureDestroyedEvent;
    "nuke.detected": NukeDetectedEvent;
    "safemode.activated": SafeModeActivatedEvent;
    "spawn.completed": SpawnCompletedEvent;
    "spawn.emergency": SpawnEmergencyEvent;
    "creep.died": CreepDiedEvent;
    "rcl.upgrade": RclUpgradeEvent;
    "energy.critical": EnergyCriticalEvent;
    "construction.complete": ConstructionCompleteEvent;
    "market.transaction": MarketTransactionEvent;
    "remote.lost": RemoteLostEvent;
    "expansion.candidate": ExpansionCandidateEvent;
    "powerbank.discovered": PowerBankDiscoveredEvent;
    "pheromone.update": PheromoneUpdateEvent;
    "posture.change": PostureChangeEvent;
    "squad.formed": SquadFormedEvent;
    "squad.dissolved": SquadDissolvedEvent;
    "cluster.update": ClusterUpdateEvent;
    "cpu.spike": CpuSpikeEvent;
    "bucket.modeChange": BucketModeChangeEvent;
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
/**
 * Event handler function type
 */
export type EventHandler<T extends EventName> = (event: EventPayload<T>) => void;
/**
 * Event priority levels
 */
export declare enum EventPriority {
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
/**
 * Event Bus - Central event management system
 *
 * Features:
 * - Type-safe event emission and subscription
 * - Priority-based event processing
 * - Bucket-aware event deferral
 * - Event queuing for deferred processing
 */
export declare class EventBus {
    private config;
    private handlers;
    private eventQueue;
    private handlerIdCounter;
    private stats;
    constructor(config?: Partial<EventBusConfig>);
    /**
     * Subscribe to an event
     *
     * @param eventName - Name of the event to subscribe to
     * @param handler - Handler function to call when event is emitted
     * @param options - Subscription options
     * @returns Unsubscribe function
     */
    on<T extends EventName>(eventName: T, handler: EventHandler<T>, options?: {
        priority?: number;
        minBucket?: number;
        once?: boolean;
    }): () => void;
    /**
     * Subscribe to an event (one-time)
     */
    once<T extends EventName>(eventName: T, handler: EventHandler<T>, options?: {
        priority?: number;
        minBucket?: number;
    }): () => void;
    /**
     * Unsubscribe from an event by handler ID
     */
    private off;
    /**
     * Unsubscribe all handlers for an event
     */
    offAll(eventName: EventName): void;
    /**
     * Emit an event
     *
     * @param eventName - Name of the event to emit
     * @param payload - Event payload (without tick, which is added automatically)
     * @param options - Emission options
     */
    emit<T extends EventName>(eventName: T, payload: Omit<EventPayload<T>, "tick">, options?: {
        immediate?: boolean;
        priority?: number;
    }): void;
    /**
     * Process an event immediately
     */
    private processEvent;
    /**
     * Queue an event for deferred processing
     */
    private queueEvent;
    /**
     * Process queued events
     * Call this each tick to process deferred events
     */
    processQueue(): void;
    /**
     * Get event bus statistics
     */
    getStats(): {
        eventsEmitted: number;
        eventsProcessed: number;
        eventsDeferred: number;
        eventsDropped: number;
        handlersInvoked: number;
        queueSize: number;
        handlerCount: number;
    };
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Get current configuration
     */
    getConfig(): EventBusConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<EventBusConfig>): void;
    /**
     * Clear all handlers and queued events
     */
    clear(): void;
    /**
     * Get registered handler count for an event
     */
    getHandlerCount(eventName: EventName): number;
    /**
     * Check if there are any handlers for an event
     */
    hasHandlers(eventName: EventName): boolean;
    /**
     * Log statistics (call periodically)
     */
    logStats(): void;
}
/**
 * Global event bus instance
 */
export declare const eventBus: EventBus;
//# sourceMappingURL=events.d.ts.map