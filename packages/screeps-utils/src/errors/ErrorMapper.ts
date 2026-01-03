/* eslint-disable */
import { SourceMapConsumer } from "source-map";

// TODO(P2): STYLE - Re-enable eslint for this file and fix style issues
// The eslint-disable was added to ignore initial issues but should be addressed
// TODO(P2): PERF - Cache source map parsing to avoid expensive re-parsing on global resets
// First call after reset uses >30 CPU which can impact startup performance
// TODO(P1): BUG - Add error handling for missing source map file
// Issue URL: https://github.com/ralphschuler/screeps/issues/615
// If main.js.map is not bundled, the require will throw

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

export class ErrorMapper {
  // Cache consumer
  private static _consumer?: SourceMapConsumer;

  public static async getConsumer(): Promise<SourceMapConsumer> {
    if (this._consumer == null) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const rawSourceMap = require("main.js.map");
      // Parse the source map if it's a string, otherwise use it directly
      let sourceMapData;
      if (typeof rawSourceMap === "string") {
        try {
          sourceMapData = JSON.parse(rawSourceMap);
        } catch (e) {
          throw new Error(`Failed to parse source map JSON: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else {
        sourceMapData = rawSourceMap;
      }
      this._consumer = await new SourceMapConsumer(sourceMapData);
    }

    return this._consumer;
  }

  // Cache previously mapped traces to improve performance
  public static cache: { [key: string]: string } = {};

  /**
   * Generates a stack trace using a source map generate original symbol names.
   *
   * WARNING - EXTREMELY high CPU cost for first call after reset - >30 CPU! Use sparingly!
   * (Consecutive calls after a reset are more reasonable, ~0.1 CPU/ea)
   *
   * @param {Error | string} error The error or original stack trace
   * @returns {Promise<string>} The source-mapped stack trace
   */
  public static async sourceMappedStackTrace(error: Error | string): Promise<string> {
    const stack: string = error instanceof Error ? (error.stack as string) : error;
    if (Object.prototype.hasOwnProperty.call(this.cache, stack)) {
      return this.cache[stack];
    }

    // eslint-disable-next-line no-useless-escape
    const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
    let match: RegExpExecArray | null;
    let outStack = error.toString();

    const consumer = await this.getConsumer();
    while ((match = re.exec(stack))) {
      if (match[2] === "main") {
        const pos = consumer.originalPositionFor({
          column: parseInt(match[4], 10),
          line: parseInt(match[3], 10)
        });

        if (pos.line != null) {
          if (pos.name) {
            outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
          } else {
            if (match[1]) {
              // no original source file name known - use file name from given trace
              outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
            } else {
              // no original source file name known or in given trace - omit name
              outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
            }
          }
        } else {
          // no known position
          break;
        }
      } else {
        // no more parseable lines
        break;
      }
    }

    this.cache[stack] = outStack;
    return outStack;
  }

  public static wrapLoop(loop: () => void): () => void {
    return () => {
      try {
        loop();
      } catch (e) {
        if (e instanceof Error) {
          if ("sim" in Game.rooms) {
            const message = `Source maps don't work in the simulator - displaying original error`;
            console.log(`<span style='color:red'>${message}<br>${escapeHtml(e.stack)}</span>`);
          } else {
            // Note: This will log a Promise, but we can't await in a sync wrapper
            // Consider using async loop wrapper or handle Promise appropriately
            this.sourceMappedStackTrace(e).then((trace) => {
              console.log(`<span style='color:red'>${escapeHtml(trace)}</span>`);
            }).catch((mapError) => {
              console.log(`<span style='color:red'>Error mapping stack trace: ${mapError}<br>${escapeHtml(e.stack)}</span>`);
            });
          }
        } else {
          // can't handle it
          throw e;
        }
      }
    };
  }
}
