"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = exports.EventPriority = void 0;
const logger_1 = require("./logger");
// ============================================================================
// Event Priority Levels
// ============================================================================
/**
 * Event priority levels
 */
var EventPriority;
(function (EventPriority) {
    /** Critical events (combat, nukes) - always process immediately */
    EventPriority[EventPriority["CRITICAL"] = 100] = "CRITICAL";
    /** High priority (spawns, deaths) */
    EventPriority[EventPriority["HIGH"] = 75] = "HIGH";
    /** Normal priority (economy, construction) */
    EventPriority[EventPriority["NORMAL"] = 50] = "NORMAL";
    /** Low priority (stats, metrics) */
    EventPriority[EventPriority["LOW"] = 25] = "LOW";
    /** Background events (can be deferred) */
    EventPriority[EventPriority["BACKGROUND"] = 10] = "BACKGROUND";
})(EventPriority = exports.EventPriority || (exports.EventPriority = {}));
/**
 * Default priorities for event types
 */
const DEFAULT_EVENT_PRIORITIES = {
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
const DEFAULT_CONFIG = {
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
class EventBus {
    constructor(config = {}) {
        this.handlers = new Map();
        this.eventQueue = [];
        this.handlerIdCounter = 0;
        this.stats = {
            eventsEmitted: 0,
            eventsProcessed: 0,
            eventsDeferred: 0,
            eventsDropped: 0,
            handlersInvoked: 0
        };
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
    on(eventName, handler, options = {}) {
        var _a, _b, _c, _d;
        const registration = {
            handler,
            priority: (_a = options.priority) !== null && _a !== void 0 ? _a : EventPriority.NORMAL,
            minBucket: (_b = options.minBucket) !== null && _b !== void 0 ? _b : 0,
            once: (_c = options.once) !== null && _c !== void 0 ? _c : false,
            id: `handler_${++this.handlerIdCounter}`
        };
        const handlers = (_d = this.handlers.get(eventName)) !== null && _d !== void 0 ? _d : [];
        handlers.push(registration);
        // Sort by priority (highest first)
        handlers.sort((a, b) => b.priority - a.priority);
        this.handlers.set(eventName, handlers);
        if (this.config.enableLogging) {
            logger_1.logger.debug(`EventBus: Registered handler for "${eventName}" (id: ${registration.id})`, {
                subsystem: "EventBus"
            });
        }
        // Return unsubscribe function
        return () => this.off(eventName, registration.id);
    }
    /**
     * Subscribe to an event (one-time)
     */
    once(eventName, handler, options = {}) {
        return this.on(eventName, handler, { ...options, once: true });
    }
    /**
     * Unsubscribe from an event by handler ID
     */
    off(eventName, handlerId) {
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            const index = handlers.findIndex(h => h.id === handlerId);
            if (index !== -1) {
                handlers.splice(index, 1);
                if (this.config.enableLogging) {
                    logger_1.logger.debug(`EventBus: Unregistered handler "${handlerId}" from "${eventName}"`, {
                        subsystem: "EventBus"
                    });
                }
            }
        }
    }
    /**
     * Unsubscribe all handlers for an event
     */
    offAll(eventName) {
        this.handlers.delete(eventName);
        if (this.config.enableLogging) {
            logger_1.logger.debug(`EventBus: Removed all handlers for "${eventName}"`, {
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
    emit(eventName, payload, options = {}) {
        var _a, _b, _c;
        const fullPayload = {
            ...payload,
            tick: Game.time
        };
        const priority = (_b = (_a = options.priority) !== null && _a !== void 0 ? _a : DEFAULT_EVENT_PRIORITIES[eventName]) !== null && _b !== void 0 ? _b : EventPriority.NORMAL;
        const immediate = (_c = options.immediate) !== null && _c !== void 0 ? _c : priority >= EventPriority.CRITICAL;
        this.stats.eventsEmitted++;
        if (this.config.enableLogging) {
            logger_1.logger.debug(`EventBus: Emitting "${eventName}" (priority: ${priority}, immediate: ${String(immediate)})`, {
                subsystem: "EventBus"
            });
        }
        // Check bucket status for non-immediate events
        const bucket = Game.cpu.bucket;
        if (immediate || bucket >= this.config.lowBucketThreshold) {
            // Process immediately
            this.processEvent(eventName, fullPayload);
        }
        else if (bucket >= this.config.criticalBucketThreshold) {
            // Queue for later processing
            this.queueEvent(eventName, fullPayload, priority);
        }
        else {
            // Critical bucket - only process critical events
            if (priority >= EventPriority.CRITICAL) {
                this.processEvent(eventName, fullPayload);
            }
            else {
                this.stats.eventsDropped++;
                if (this.config.enableLogging) {
                    logger_1.logger.warn(`EventBus: Dropped event "${eventName}" due to critical bucket`, {
                        subsystem: "EventBus"
                    });
                }
            }
        }
    }
    /**
     * Process an event immediately
     */
    processEvent(eventName, payload) {
        const handlers = this.handlers.get(eventName);
        if (!handlers || handlers.length === 0) {
            return;
        }
        const bucket = Game.cpu.bucket;
        const handlersToRemove = [];
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
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                logger_1.logger.error(`EventBus: Handler error for "${eventName}": ${errorMessage}`, {
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
    queueEvent(eventName, payload, priority) {
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
            }
            else {
                // Can't make room, drop this event
                this.stats.eventsDropped++;
                return;
            }
        }
        const queuedEvent = {
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
    processQueue() {
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
    getStats() {
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
    resetStats() {
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
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Clear all handlers and queued events
     */
    clear() {
        this.handlers.clear();
        this.eventQueue = [];
        this.resetStats();
    }
    /**
     * Get registered handler count for an event
     */
    getHandlerCount(eventName) {
        var _a, _b;
        return (_b = (_a = this.handlers.get(eventName)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * Check if there are any handlers for an event
     */
    hasHandlers(eventName) {
        return this.getHandlerCount(eventName) > 0;
    }
    /**
     * Log statistics (call periodically)
     */
    logStats() {
        if (Game.time % this.config.statsLogInterval === 0) {
            const stats = this.getStats();
            logger_1.logger.debug(`EventBus stats: ${stats.eventsEmitted} emitted, ${stats.eventsProcessed} processed, ` +
                `${stats.eventsDeferred} deferred, ${stats.eventsDropped} dropped, ` +
                `${stats.queueSize} queued, ${stats.handlerCount} handlers`, { subsystem: "EventBus" });
        }
    }
}
exports.EventBus = EventBus;
/**
 * Global event bus instance
 */
exports.eventBus = new EventBus();
