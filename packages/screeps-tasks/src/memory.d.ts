/**
 * Extend Screeps Memory interfaces to support task persistence
 */

import { SerializedTask } from './types';

declare global {
  interface CreepMemory {
    task?: SerializedTask;
  }
}

export {};
