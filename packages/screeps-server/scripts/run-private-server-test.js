#!/usr/bin/env node

import { parseHarnessArgs, runPrivateServerTest } from './private-server-harness.js';

try {
  await runPrivateServerTest(parseHarnessArgs());
} catch {
  process.exitCode = 1;
}
