/**
 * @ralphschuler/screeps-kernel
 * 
 * Process scheduler with CPU budget management and wrap-around queue
 * 
 * Features:
 * - Process registration and lifecycle management
 * - CPU budget allocation and enforcement per process
 * - Priority-based process scheduling with wrap-around queue
 * - Process statistics tracking
 * - Centralized event system for inter-process communication
 * - Adaptive CPU budgets based on room count and bucket level
 * - Process decorators for declarative registration
 */

// Export kernel core
export {
  ProcessPriority,
  type ProcessFrequency,
  type ProcessState,
  type ProcessStats,
  type Process as KernelProcess,
  type BucketMode,
  Kernel,
  kernel
} from './kernel';

// Export process decorators
export {
  type ProcessOptions,
  Process as ProcessDecorator,
  registerDecoratedProcesses
} from './processDecorators';

// Export adaptive budgets
export {
  type AdaptiveBudgetConfig,
  DEFAULT_ADAPTIVE_CONFIG,
  calculateRoomScalingMultiplier,
  calculateBucketMultiplier,
  getAdaptiveBudgets
} from './adaptiveBudgets';

// Export event system
export {
  type BaseEvent,
  type EventName,
  type EventPayload,
  type EventHandler,
  EventPriority,
  EventBus,
  eventBus
} from './events';

// Export logger interface (consumers can provide their own)
export {
  LogLevel,
  type LogContext,
  type Logger,
  logger,
  configureLogger
} from './logger';

// Export config
export {
  type CPUConfig,
  type KernelConfig,
  getConfig,
  updateConfig,
  resetConfig
} from './config';
