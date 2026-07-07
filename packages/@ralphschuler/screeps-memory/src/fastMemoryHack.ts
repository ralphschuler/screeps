/**
 * Fast Memory hack for Screeps globals.
 *
 * Screeps lazily parses `Memory` from `RawMemory` the first time the global is
 * read each tick. Keeping the parsed object in heap and restoring it into the
 * engine's private `RawMemory._parsed` slot avoids repeated JSON.parse work while
 * the same global survives.
 */

export type RawMemoryWithParsed = RawMemory & { _parsed?: Memory };

export interface FastMemoryGlobalScope {
  Game?: { time?: number };
  Memory?: Memory;
  RawMemory?: RawMemoryWithParsed;
}

/**
 * Restores the parsed Memory object from heap across ticks.
 */
export class FastMemoryHack {
  private cachedMemory: Memory | undefined;
  private lastRunTick: number | undefined;

  public constructor(private readonly scope: FastMemoryGlobalScope = globalThis as FastMemoryGlobalScope) {}

  /**
   * Capture the current parsed Memory object after a global reset.
   */
  public register(): boolean {
    const rawMemory = this.scope.RawMemory;
    if (!rawMemory) return false;

    const memory = this.scope.Memory ?? rawMemory._parsed;
    if (!memory) return false;

    this.cachedMemory = memory;
    rawMemory._parsed = memory;
    return true;
  }

  /**
   * Restore cached Memory into the current tick without reading the Memory getter.
   */
  public run(): boolean {
    if (!this.cachedMemory || this.shouldReRegisterForCurrentTick()) return this.register();

    const rawMemory = this.scope.RawMemory;
    if (!rawMemory) return false;

    try {
      delete this.scope.Memory;
    } catch {
      // Some test harnesses may provide a non-configurable Memory property.
      // Assignment below is still the useful recovery path when possible.
    }

    this.scope.Memory = this.cachedMemory;
    rawMemory._parsed = this.cachedMemory;
    this.lastRunTick = this.getCurrentTick();
    return true;
  }

  /**
   * Clear cached state, mainly for tests or controlled runtime reset handling.
   */
  public reset(): void {
    this.cachedMemory = undefined;
    this.lastRunTick = undefined;
  }

  public getCachedMemory(): Memory | undefined {
    return this.cachedMemory;
  }

  private shouldReRegisterForCurrentTick(): boolean {
    const currentTick = this.getCurrentTick();
    return currentTick !== undefined && this.lastRunTick !== undefined && currentTick <= this.lastRunTick;
  }

  private getCurrentTick(): number | undefined {
    const tick = this.scope.Game?.time;
    return typeof tick === "number" && Number.isFinite(tick) ? tick : undefined;
  }
}

/** Shared singleton used by the bot runtime. */
export const fastMemoryHack = new FastMemoryHack();
