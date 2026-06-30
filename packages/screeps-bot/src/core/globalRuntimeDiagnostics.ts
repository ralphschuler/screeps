/**
 * Detect Screeps global resets and stale heap switches.
 *
 * Screeps can occasionally alternate between more than one VM heap for the same
 * shard. Heap/global state then appears to jump backwards relative to Game.time.
 * This diagnostic keeps a tiny per-heap tick marker and compact Memory counters
 * so the bot can observe the condition without clearing heap state or skipping
 * ticks.
 */

const GLOBAL_STATE_KEY = "__screepsGlobalRuntimeDiagnostics";
const DEFAULT_SWITCH_LOG_THROTTLE_TICKS = 100;

export interface GlobalRuntimeDiagnosticsMemory {
  heapId: string;
  resetCount: number;
  switchCount: number;
  lastTick: number;
  lastResetTick: number;
  lastSwitchTick?: number;
  lastSwitchPreviousTick?: number;
  lastWarningTick?: number;
}

interface GlobalRuntimeState {
  heapId: string;
  lastTick: number;
}

interface GlobalRuntimeStateOwner {
  [GLOBAL_STATE_KEY]?: GlobalRuntimeState;
}

export interface GlobalRuntimeDiagnosticsLogger {
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
}

export type GlobalRuntimeDiagnosticsEventType = "reset" | "switch" | "steady";

export interface GlobalRuntimeDiagnosticsEvent {
  type: GlobalRuntimeDiagnosticsEventType;
  heapId: string;
  currentTick: number;
  previousTick?: number;
  resetCount: number;
  switchCount: number;
}

export interface GlobalRuntimeDiagnosticsOptions {
  logger?: GlobalRuntimeDiagnosticsLogger;
  createHeapId?: () => string;
  switchLogThrottleTicks?: number;
}

declare global {
  interface Memory {
    /** Backward-compatible counter consumed by private-server runtime assertions. */
    __globalResetCount?: number;
    /** Compact diagnostics for global resets and stale heap switches. */
    runtimeDiagnostics?: {
      global?: GlobalRuntimeDiagnosticsMemory;
    };
  }
}

function getGlobalStateOwner(): GlobalRuntimeStateOwner {
  return globalThis as GlobalRuntimeStateOwner;
}

function createDefaultHeapId(): string {
  const shardName = typeof Game.shard?.name === "string" ? Game.shard.name : "shard";
  const randomPart = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `${shardName}:${Game.time}:${randomPart}`;
}

function asNonNegativeFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function asFiniteTick(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asOptionalFiniteTick(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function ensureDiagnosticsMemory(heapId: string): GlobalRuntimeDiagnosticsMemory {
  Memory.runtimeDiagnostics ??= {};

  const existing = Memory.runtimeDiagnostics.global as Partial<GlobalRuntimeDiagnosticsMemory> | undefined;
  if (existing && typeof existing === "object") {
    const normalized: GlobalRuntimeDiagnosticsMemory = {
      heapId: typeof existing.heapId === "string" && existing.heapId.length > 0 ? existing.heapId : heapId,
      resetCount: asNonNegativeFiniteNumber(existing.resetCount, Math.max(0, Memory.__globalResetCount ?? 0)),
      switchCount: asNonNegativeFiniteNumber(existing.switchCount, 0),
      lastTick: asFiniteTick(existing.lastTick, Game.time),
      lastResetTick: asFiniteTick(existing.lastResetTick, Game.time),
      lastSwitchTick: asOptionalFiniteTick(existing.lastSwitchTick),
      lastSwitchPreviousTick: asOptionalFiniteTick(existing.lastSwitchPreviousTick),
      lastWarningTick: asOptionalFiniteTick(existing.lastWarningTick)
    };

    Memory.runtimeDiagnostics.global = normalized;
    return normalized;
  }

  const resetCount = Math.max(0, Memory.__globalResetCount ?? 0);
  const diagnostics: GlobalRuntimeDiagnosticsMemory = {
    heapId,
    resetCount,
    switchCount: 0,
    lastTick: Game.time,
    lastResetTick: Game.time
  };

  Memory.runtimeDiagnostics.global = diagnostics;
  return diagnostics;
}

function recordReset(heapId: string, logger?: GlobalRuntimeDiagnosticsLogger): GlobalRuntimeDiagnosticsEvent {
  const diagnostics = ensureDiagnosticsMemory(heapId);
  const nextResetCount = Math.max(diagnostics.resetCount, Memory.__globalResetCount ?? 0) + 1;

  diagnostics.heapId = heapId;
  diagnostics.resetCount = nextResetCount;
  diagnostics.lastResetTick = Game.time;
  diagnostics.lastTick = Game.time;
  Memory.__globalResetCount = nextResetCount;

  logger?.info("Global reset detected", {
    meta: {
      heapId,
      resetCount: nextResetCount,
      tick: Game.time
    }
  });

  return {
    type: "reset",
    heapId,
    currentTick: Game.time,
    resetCount: nextResetCount,
    switchCount: diagnostics.switchCount
  };
}

function recordSwitch(
  state: GlobalRuntimeState,
  previousTick: number,
  logger: GlobalRuntimeDiagnosticsLogger | undefined,
  throttleTicks: number
): GlobalRuntimeDiagnosticsEvent {
  const diagnostics = ensureDiagnosticsMemory(state.heapId);
  diagnostics.switchCount += 1;
  diagnostics.heapId = state.heapId;
  diagnostics.lastSwitchTick = Game.time;
  diagnostics.lastSwitchPreviousTick = previousTick;
  diagnostics.lastTick = Game.time;

  const lastWarningTick = diagnostics.lastWarningTick ?? -Infinity;
  if (Game.time - lastWarningTick >= throttleTicks) {
    diagnostics.lastWarningTick = Game.time;
    logger?.warn("Global heap switch detected", {
      meta: {
        heapId: state.heapId,
        previousTick,
        currentTick: Game.time,
        skippedTicks: Math.max(0, Game.time - previousTick - 1),
        switchCount: diagnostics.switchCount
      }
    });
  }

  return {
    type: "switch",
    heapId: state.heapId,
    currentTick: Game.time,
    previousTick,
    resetCount: diagnostics.resetCount,
    switchCount: diagnostics.switchCount
  };
}

export function resetGlobalRuntimeDiagnosticsForTests(): void {
  delete getGlobalStateOwner()[GLOBAL_STATE_KEY];
}

export function runGlobalRuntimeDiagnostics(options: GlobalRuntimeDiagnosticsOptions = {}): GlobalRuntimeDiagnosticsEvent {
  const owner = getGlobalStateOwner();
  const createHeapId = options.createHeapId ?? createDefaultHeapId;
  const throttleTicks = options.switchLogThrottleTicks ?? DEFAULT_SWITCH_LOG_THROTTLE_TICKS;
  let state = owner[GLOBAL_STATE_KEY];

  if (!state) {
    state = {
      heapId: createHeapId(),
      lastTick: Game.time
    };
    owner[GLOBAL_STATE_KEY] = state;
    return recordReset(state.heapId, options.logger);
  }

  const previousTick = state.lastTick;
  state.lastTick = Game.time;

  if (previousTick + 1 !== Game.time) {
    return recordSwitch(state, previousTick, options.logger, throttleTicks);
  }

  const diagnostics = ensureDiagnosticsMemory(state.heapId);
  diagnostics.heapId = state.heapId;
  diagnostics.lastTick = Game.time;
  Memory.__globalResetCount = Math.max(Memory.__globalResetCount ?? 0, diagnostics.resetCount);

  return {
    type: "steady",
    heapId: state.heapId,
    currentTick: Game.time,
    previousTick,
    resetCount: diagnostics.resetCount,
    switchCount: diagnostics.switchCount
  };
}
