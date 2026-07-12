export interface HarnessOptions {
  mode?: string;
  durationMinutes?: number;
  maxTicks?: number;
  tickPollMs?: number;
  diagnosticTimeoutMs?: number;
  diagnosticMaxOutputBytes?: number;
  tickRate?: number;
  runtimeWarmupTicks?: number;
  serverPort?: number;
  cliPort?: number;
  launcherHost?: string;
  serverPassword?: string;
  shardName?: string;
  username?: string;
  password?: string;
  roomName?: string;
  projectName?: string;
  scenarios?: string[];
  artifactsDir?: string;
  botBundle?: string;
  liveCloneSnapshot?: string;
  serverRoot?: string;
  repoRoot?: string;
}

export function resolveScreepsApiConstructor(moduleNamespace: any): any;
export function createLegacyScreepsApiAdapter(ScreepsHttpClient: any): any;
export function parseScenarioList(rawValue?: unknown, defaults?: string[]): string[];
export function parseTickRate(rawValue: unknown): number;
export function parseRuntimeWarmupTicks(rawValue?: unknown, configPath?: string | URL, env?: Record<string, string | undefined>): number;
export function parseHarnessArgs(argv?: string[], env?: Record<string, string | undefined>, roots?: Record<string, string>): HarnessOptions;
export function createInitialSummary(options: HarnessOptions, now?: Date): any;
export function decodeMemoryData(data: unknown): any;
export function parseScenarioSeedConfirmationOutput(output: unknown): any | null;
export function recordScenarioSeedConfirmation(options: HarnessOptions, summary: any, output: unknown): any | null;
export function inspectMemorySnapshot(memory: any, summary: any, now?: Date, options?: HarnessOptions): void;
export function prepareArtifactsDir(options: { artifactsDir: string }): void;
export function formatHarnessError(error: unknown): string;
export function recordHarnessError(summary: any, error: unknown): string;
export function runShell(command: string, args: string[], options: HarnessOptions, log: (message: string) => unknown, runOptions?: Record<string, unknown>): Promise<any>;
export function summarizeContainerState(output: string): any[];
export function isTransportFailure(error: unknown): boolean;
export function updateValidationStatus(summary: any, transportError?: unknown): any;
export function collectLogs(options: HarnessOptions, summary: any, log: (message: string) => unknown, runShellFn?: (...args: any[]) => Promise<any>): Promise<void>;
export function writeFailedSummaryForError(options: HarnessOptions, summary: any, error: unknown): Promise<any>;
export function resolveAvailablePorts(options: {
  serverPort: number;
  cliPort: number;
  launcherHost: string;
  isPortAvailableFn?: (port: number) => boolean | Promise<boolean>;
}): Promise<any>;
export function restartScreepsRuntime(
  options: HarnessOptions,
  controlPlane: { waitForHttpReady: () => Promise<void> },
  log: (message: string) => unknown,
  composeFn?: (options: HarnessOptions, log: any, ...args: string[]) => Promise<void>,
): Promise<void>;
export function buildEnsureBotUserCommand(options: HarnessOptions): string;
export function buildSeedRuntimeScenariosCommand(options: HarnessOptions): string;
export function shouldContinuePolling(input: {
  nowMs: number;
  endAtMs: number;
  polls: number;
  maxTicks: number;
  ticksAdvanced: number;
}): boolean;
export function hasSmokeValidationEvidence(summary: any, options?: HarnessOptions): boolean;
export function updatePollingProgress(summary: any, currentGameTime: number, polls: number): number;
export function summarizeServerLogDiagnostics(logText: string, sampleLimit?: number): any;
export function validateSmokeSummary(summary: any, options?: HarnessOptions): void;
export function runPrivateServerTest(options?: HarnessOptions): Promise<any>;
