import type { CPUConfig } from "../config";
import { getConfig } from "../config";
import { eventBus } from "./events";
import { kernel, type BucketMode } from "./kernel";
import { registerAllProcesses } from "./processRegistry";

interface KernelRuntimePort {
  updateFromCpuConfig(config: CPUConfig): void;
  getBucketMode(): BucketMode;
  initialize(): void;
  run(): void;
}

interface EventBusRuntimePort {
  startTick(): void;
  processQueue(): void;
}

export interface BotKernelRuntimeDeps {
  kernel: KernelRuntimePort;
  eventBus: EventBusRuntimePort;
  getCpuConfig: () => CPUConfig;
  registerProcesses: () => void;
}

/**
 * Bot-specific kernel runtime Module.
 *
 * Keeps the bot's POSIS lifecycle policy in one place instead of making the
 * main loop know framework config syncing, one-time process registration, and
 * event queue ordering details.
 */
export class BotKernelRuntime {
  private processesRegistered = false;

  public constructor(private readonly deps: BotKernelRuntimeDeps) {}

  public configureForCurrentTick(): BucketMode {
    this.deps.kernel.updateFromCpuConfig(this.deps.getCpuConfig());
    return this.deps.kernel.getBucketMode();
  }

  public ensureProcessesRegistered(): void {
    if (this.processesRegistered) return;

    this.deps.registerProcesses();
    this.deps.kernel.initialize();
    this.processesRegistered = true;
  }

  public startEventTick(): void {
    this.deps.eventBus.startTick();
  }

  public runProcesses(): void {
    this.deps.kernel.run();
  }

  public processQueuedEvents(): void {
    this.deps.eventBus.processQueue();
  }

  public runProcessesAndEvents(): void {
    this.runProcesses();
    this.processQueuedEvents();
  }

  public resetForTests(): void {
    this.processesRegistered = false;
  }
}

export const botKernelRuntime = new BotKernelRuntime({
  kernel,
  eventBus,
  getCpuConfig: () => getConfig().cpu,
  registerProcesses: registerAllProcesses
});
