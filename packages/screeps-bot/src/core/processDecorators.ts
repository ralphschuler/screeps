/**
 * Process Decorators
 *
 * Compatibility adapter for bot-local decorator imports.
 *
 * Decorator metadata is owned by @ralphschuler/screeps-kernel so bot-local and
 * framework-package managers share one registry. Registration targets the bot's
 * configured kernel instance, which is the runtime scheduler that actually runs
 * processes in screeps-bot.
 */

import {
  type ProcessMetadata,
  type ProcessOptions,
  ProcessDecorator as Process,
  HighFrequencyProcess,
  MediumFrequencyProcess,
  LowFrequencyProcess,
  CriticalProcess,
  IdleProcess,
  ProcessClass,
  getProcessMetadata,
  clearProcessMetadata,
  getRegisteredClasses,
  registerAllDecoratedProcessesWithKernel,
  registerDecoratedProcessesWithKernel
} from "@ralphschuler/screeps-kernel";
import { kernel } from "./kernel";

export type { ProcessMetadata, ProcessOptions };
export {
  Process,
  HighFrequencyProcess,
  MediumFrequencyProcess,
  LowFrequencyProcess,
  CriticalProcess,
  IdleProcess,
  ProcessClass,
  getProcessMetadata,
  clearProcessMetadata,
  getRegisteredClasses
};

/**
 * Register all decorated processes from an instance onto the bot runtime kernel.
 */
export function registerDecoratedProcesses(instance: object): void {
  registerDecoratedProcessesWithKernel(kernel, instance);
}

/**
 * Register processes from multiple instances onto the bot runtime kernel.
 */
export function registerAllDecoratedProcesses(...instances: object[]): void {
  registerAllDecoratedProcessesWithKernel(kernel, ...instances);
}
