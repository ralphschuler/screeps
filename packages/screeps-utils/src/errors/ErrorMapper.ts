import { SourceMapConsumer } from "source-map";

const DEFAULT_SOURCE_MAP_MIN_BUCKET = 2000;
const DEFAULT_STACK_MAP_CACHE_SIZE = 200;

interface ErrorMapperSettingsMemory {
  errorMapper?: {
    /** Set false to roll back low-bucket source-map throttling. */
    sourceMapLowBucketGuard?: boolean;
    /** Minimum bucket required before parsing source maps for uncached traces. Set 0 to disable the guard. */
    sourceMapMinBucket?: number;
    /** Set false to disable source-mapped errors entirely. */
    sourceMappedErrors?: boolean;
  };
}

/**
 * Converts special HTML characters to their entity equivalents.
 * Replaces &, <, >, ", and ' with their HTML entity codes.
 */
function escapeHtml(str: string | undefined): string {
  if (str == null) {
    return "";
  }
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeStack(errorOrString: string): string {
  return errorOrString.trim();
}

function safeParseInt(value: string | undefined): number | null {
  if (value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export class ErrorMapper {
  private static _consumer?: SourceMapConsumer;
  private static sourceMapUnavailable = false;
  private static readonly MAX_STACK_MAP_CACHE_SIZE = DEFAULT_STACK_MAP_CACHE_SIZE;

  public static async getConsumer(): Promise<SourceMapConsumer | null> {
    if (this.sourceMapUnavailable) return null;

    if (this._consumer == null) {
      let rawSourceMap: unknown;
      try {
        rawSourceMap = require("main.js.map");
      } catch {
        this.sourceMapUnavailable = true;
        return null;
      }

      let sourceMapData: unknown;
      try {
        sourceMapData = typeof rawSourceMap === "string" ? JSON.parse(rawSourceMap) : rawSourceMap;
      } catch {
        this.sourceMapUnavailable = true;
        return null;
      }

      try {
        this._consumer = await new SourceMapConsumer(sourceMapData as any);
      } catch {
        this.sourceMapUnavailable = true;
        return null;
      }
    }

    return this._consumer ?? null;
  }

  // Cache previously mapped traces to improve performance.
  public static cache: Record<string, string> = {};

  public static clearCache(): void {
    this.cache = {};
    this.sourceMapUnavailable = false;
    this._consumer = undefined;
  }

  private static touchCacheKey(stack: string): void {
    const entry = this.cache[stack];
    if (entry === undefined) return;

    delete this.cache[stack];
    this.cache[stack] = entry;
  }

  private static pruneCache(): void {
    const keys = Object.keys(this.cache);
    while (keys.length > this.MAX_STACK_MAP_CACHE_SIZE) {
      const oldest = keys.shift();
      if (!oldest) break;
      delete this.cache[oldest];
    }
  }

  private static shouldAttemptSourceMapping(): boolean {
    const memory = (globalThis as { Memory?: ErrorMapperSettingsMemory }).Memory;
    const settings = memory?.errorMapper;

    if (settings?.sourceMappedErrors === false) return false;
    if (settings?.sourceMapLowBucketGuard === false) return true;

    const bucket = (globalThis as { Game?: { cpu?: { bucket?: number } } }).Game?.cpu?.bucket;
    if (typeof bucket !== "number") return true;

    const configuredMinBucket = settings?.sourceMapMinBucket;
    const minBucket =
      typeof configuredMinBucket === "number" && Number.isFinite(configuredMinBucket)
        ? Math.max(0, configuredMinBucket)
        : DEFAULT_SOURCE_MAP_MIN_BUCKET;

    return bucket >= minBucket;
  }

  /**
   * Generates a stack trace using a source map to recover original symbol names.
   */
  public static async sourceMappedStackTrace(error: Error | string): Promise<string> {
    const rawStack = error instanceof Error ? error.stack ?? error.toString() : error;
    const stack = normalizeStack(rawStack);
    if (Object.prototype.hasOwnProperty.call(this.cache, stack)) {
      this.touchCacheKey(stack);
      return this.cache[stack];
    }

    if (!this.shouldAttemptSourceMapping()) {
      return stack;
    }

    const consumer = await this.getConsumer();
    if (!consumer) {
      return stack;
    }

    const re = /^\s+at\s+(.+?\s+)?\(?([\w.\-\\/]+):(\d+):(\d+)\)?$/gm;
    let match: RegExpExecArray | null;
    let outStack = stack;

    while ((match = re.exec(stack))) {
      const fileName = match[2];
      if (fileName !== "main") break;

      const line = safeParseInt(match[3]);
      const column = safeParseInt(match[4]);
      if (line === null || column === null) break;

      const pos = consumer.originalPositionFor({ column, line });
      if (pos.line == null) break;

      if (pos.name) {
        outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
      } else if (match[1]) {
        outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
      } else {
        outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
      }
    }

    this.cache[stack] = outStack;
    this.pruneCache();
    return outStack;
  }

  public static wrapLoop(loop: () => void): () => void {
    return () => {
      try {
        loop();
      } catch (e) {
        if (e instanceof Error) {
          if ("sim" in Game.rooms) {
            const message = "Source maps don't work in the simulator - displaying original error";
            console.log(`<span style='color:red'>${message}<br>${escapeHtml(e.stack)}</span>`);
          } else {
            this.sourceMappedStackTrace(e)
              .then(trace => {
                console.log(`<span style='color:red'>${escapeHtml(trace)}</span>`);
              })
              .catch(mapError => {
                console.log(`<span style='color:red'>Error mapping stack trace: ${mapError}<br>${escapeHtml(e.stack)}</span>`);
              });
          }
        } else {
          throw e;
        }
      }
    };
  }
}
