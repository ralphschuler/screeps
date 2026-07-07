#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import {
  formatHarnessError,
  parseHarnessArgs,
  runPrivateServerTest,
  writeFailedSummaryForError,
} from "./private-server-harness.js";

export async function runPrivateServerCli({
  argv = process.argv.slice(2),
  env = process.env,
  getProcessExitCode = () => process.exitCode ?? 0,
  logError = (message) => console.error(message),
  runTest = runPrivateServerTest,
} = {}) {
  const options = parseHarnessArgs(argv, env);

  try {
    const summary = await runTest(options);
    const exitCode = Number(getProcessExitCode() ?? 0);

    if (summary?.status === "passed" && exitCode !== 0) {
      const error = new Error(
        `private-server harness produced a passed summary but process.exitCode=${exitCode}`,
      );
      await writeFailedSummaryForError(options, summary, error);
      logError(formatHarnessError(error));
      return 1;
    }

    if (summary?.status && summary.status !== "passed") return 1;
    return exitCode === 0 ? 0 : exitCode;
  } catch (error) {
    logError(formatHarnessError(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const exitCode = await runPrivateServerCli();
  if (exitCode !== 0) process.exitCode = exitCode;
}
