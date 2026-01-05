/**
 * Optimization Utilities
 *
 * Bot-specific optimization utilities that are tightly coupled to
 * the bot's memory schemas and cannot be easily extracted.
 */

// Idle Detection - bot-specific idle detection with SwarmCreepMemory
export {
  canSkipBehaviorEvaluation,
  executeIdleAction
} from "./idleDetection";

