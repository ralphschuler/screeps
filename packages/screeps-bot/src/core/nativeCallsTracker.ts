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
 */
export function wrapPathFinderSearch(): void {
  if (!PathFinder.search) return;

  const originalSearch = PathFinder.search;
  (PathFinder as any).search = function (...args: any[]): PathFinderPath {
    if (trackingEnabled) {
      statsManager.recordNativeCall("pathfinderSearch");
    }
    return (originalSearch as any).apply(PathFinder, args);
  };
}

/**
 * Wrap Creep.prototype methods to track calls
 */
export function wrapCreepMethods(): void {
  const creepProto = Creep.prototype as any;

  // Wrap moveTo
  const originalMoveTo = creepProto.moveTo;
  creepProto.moveTo = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("moveTo");
    }
    return originalMoveTo.apply(this, args);
  };

  // Wrap move
  const originalMove = creepProto.move;
  creepProto.move = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("move");
    }
    return originalMove.apply(this, args);
  };

  // Wrap harvest
  const originalHarvest = creepProto.harvest;
  creepProto.harvest = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("harvest");
    }
    return originalHarvest.apply(this, args);
  };

  // Wrap transfer
  const originalTransfer = creepProto.transfer;
  creepProto.transfer = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("transfer");
    }
    return originalTransfer.apply(this, args);
  };

  // Wrap withdraw
  const originalWithdraw = creepProto.withdraw;
  creepProto.withdraw = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("withdraw");
    }
    return originalWithdraw.apply(this, args);
  };

  // Wrap build
  const originalBuild = creepProto.build;
  creepProto.build = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("build");
    }
    return originalBuild.apply(this, args);
  };

  // Wrap repair
  const originalRepair = creepProto.repair;
  creepProto.repair = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("repair");
    }
    return originalRepair.apply(this, args);
  };

  // Wrap upgradeController
  const originalUpgradeController = creepProto.upgradeController;
  creepProto.upgradeController = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("upgradeController");
    }
    return originalUpgradeController.apply(this, args);
  };

  // Wrap attack
  const originalAttack = creepProto.attack;
  creepProto.attack = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("attack");
    }
    return originalAttack.apply(this, args);
  };

  // Wrap rangedAttack
  const originalRangedAttack = creepProto.rangedAttack;
  creepProto.rangedAttack = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("rangedAttack");
    }
    return originalRangedAttack.apply(this, args);
  };

  // Wrap heal
  const originalHeal = creepProto.heal;
  creepProto.heal = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("heal");
    }
    return originalHeal.apply(this, args);
  };

  // Wrap dismantle
  const originalDismantle = creepProto.dismantle;
  creepProto.dismantle = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("dismantle");
    }
    return originalDismantle.apply(this, args);
  };

  // Wrap say
  const originalSay = creepProto.say;
  creepProto.say = function (this: Creep, ...args: any[]): any {
    if (trackingEnabled) {
      statsManager.recordNativeCall("say");
    }
    return originalSay.apply(this, args);
  };
}

/**
 * Initialize native calls tracking
 * Should be called once at bot startup
 */
export function initializeNativeCallsTracking(): void {
  wrapPathFinderSearch();
  wrapCreepMethods();
}
