/**
 * Native Calls Tracker
 *
 * Wraps Screeps native methods to track usage statistics:
 * - PathFinder.search calls
 * - Creep movement calls (moveTo, move)
 * - Creep action calls (harvest, transfer, build, etc.)
 *
 * This helps identify performance bottlenecks and optimize native call usage.
 */

import { statsManager } from "./stats";

/**
 * Whether native calls tracking is enabled
 */
let trackingEnabled = true;

/**
 * Enable or disable native calls tracking
 */
export function setNativeCallsTracking(enabled: boolean): void {
  trackingEnabled = enabled;
}

/**
 * Check if native calls tracking is enabled
 */
export function isNativeCallsTrackingEnabled(): boolean {
  return trackingEnabled;
}

/**
 * Wrap PathFinder.search to track calls
 * 
 * Note: Uses 'any' types to handle the complex overloaded signature of PathFinder.search.
 * The TypeScript definitions for PathFinder.search have multiple overloads that are
 * difficult to preserve when wrapping. Using 'any' here allows the wrapper to work
 * correctly while maintaining runtime type safety through the original method.
 * 
 * Uses Object.defineProperty to override read-only properties that may exist in some
 * Screeps environments (e.g., private servers with strict property descriptors).
 */
export function wrapPathFinderSearch(): void {
  if (!PathFinder.search) return;

  const originalSearch = PathFinder.search;
  
  try {
    Object.defineProperty(PathFinder, "search", {
      value: function (...args: any[]): PathFinderPath {
        if (trackingEnabled) {
          statsManager.recordNativeCall("pathfinderSearch");
        }
        return (originalSearch as any).apply(PathFinder, args);
      },
      writable: true,
      enumerable: true,
      configurable: true
    });
  } catch (error) {
    console.log(`[NativeCallsTracker] Warning: Failed to wrap PathFinder.search: ${error}`);
  }
}

/**
 * Helper function to safely wrap a method on a prototype
 * Uses Object.defineProperty to handle read-only properties
 */
function wrapMethod(
  prototype: any,
  methodName: string,
  statName: keyof Omit<import("./stats").NativeCallsStats, "total">
): void {
  const original = prototype[methodName];
  if (!original) return;

  try {
    Object.defineProperty(prototype, methodName, {
      value: function (this: any, ...args: any[]): any {
        if (trackingEnabled) {
          statsManager.recordNativeCall(statName);
        }
        return original.apply(this, args);
      },
      writable: true,
      enumerable: true,
      configurable: true
    });
  } catch (error) {
    console.log(`[NativeCallsTracker] Warning: Failed to wrap ${methodName}: ${error}`);
  }
}

/**
 * Wrap Creep.prototype methods to track calls
 * 
 * Note: Uses 'any' types to handle the various overloaded method signatures on Creep.prototype.
 * Many Creep methods have multiple overloads (e.g., moveTo has 2-3 different signatures).
 * Using 'any' allows the wrappers to work correctly with all overloads while maintaining
 * runtime type safety through the original methods. This is a common pattern for method
 * wrapping in JavaScript/TypeScript.
 * 
 * Uses Object.defineProperty to override read-only properties that may exist in some
 * Screeps environments (e.g., private servers with strict property descriptors).
 */
export function wrapCreepMethods(): void {
  const creepProto = Creep.prototype as any;

  // Wrap movement methods
  wrapMethod(creepProto, "moveTo", "moveTo");
  wrapMethod(creepProto, "move", "move");

  // Wrap economy methods
  wrapMethod(creepProto, "harvest", "harvest");
  wrapMethod(creepProto, "transfer", "transfer");
  wrapMethod(creepProto, "withdraw", "withdraw");
  wrapMethod(creepProto, "build", "build");
  wrapMethod(creepProto, "repair", "repair");
  wrapMethod(creepProto, "upgradeController", "upgradeController");

  // Wrap combat methods
  wrapMethod(creepProto, "attack", "attack");
  wrapMethod(creepProto, "rangedAttack", "rangedAttack");
  wrapMethod(creepProto, "heal", "heal");
  wrapMethod(creepProto, "dismantle", "dismantle");

  // Wrap utility methods
  wrapMethod(creepProto, "say", "say");
}

/**
 * Initialize native calls tracking
 * Should be called once at bot startup
 */
export function initializeNativeCallsTracking(): void {
  wrapPathFinderSearch();
  wrapCreepMethods();
}
