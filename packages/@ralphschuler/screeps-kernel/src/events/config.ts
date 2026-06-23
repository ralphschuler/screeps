/**
 * Event bus configuration defaults.
 *
 * These values are deliberately small and bucket-aware so event processing stays
 * aligned with the ROADMAP CPU budget rules.
 */

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
  /** Coalesce identical queued events by payload signature */
  enableEventCoalescing: boolean;
}

export const DEFAULT_CONFIG: EventBusConfig = {
  maxEventsPerTick: 50,
  maxQueueSize: 200,
  lowBucketThreshold: 2000,
  criticalBucketThreshold: 1000,
  maxEventAge: 100,
  enableLogging: false,
  statsLogInterval: 100,
  enableEventCoalescing: true
};

