import type { HarnessOptions } from "./private-server-harness.js";

export interface RunPrivateServerCliOptions {
  argv?: string[];
  env?: Record<string, string | undefined>;
  getProcessExitCode?: () => number | string | undefined | null;
  logError?: (message: string) => void;
  runTest?: (options: HarnessOptions) => Promise<any>;
}

export function runPrivateServerCli(options?: RunPrivateServerCliOptions): Promise<number>;
