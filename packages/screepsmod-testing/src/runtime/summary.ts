export type RuntimeSummarySource = 'screepsmod-testing-player-sandbox' | 'screepsmod-testing-backend-cronjob' | 'screepsmod-testing-legacy-runner' | 'screepsmod-testing-merged' | string;

export interface RuntimeFailure {
  name: string;
  message: string;
  source?: string;
  tags?: string[];
}

export interface RuntimeSummary {
  source: RuntimeSummarySource;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  failures: RuntimeFailure[];
  tick: number;
  duration: number;
  runtimeWarmed?: boolean;
  runtimeWarmupTicks?: number;
  scenarios?: string[];
  sources?: Record<string, RuntimeSummary | undefined>;
  diagnostics?: Record<string, unknown>;
}

export interface RuntimeSummarySources {
  player?: RuntimeSummary;
  backend?: RuntimeSummary;
  legacy?: RuntimeSummary;
}

export function mergeRuntimeSummaries(
  sources: RuntimeSummarySources,
  tick: number,
  startedAt: number,
  runtimeWarmupTicks: number,
  scenarios: string[] = []
): RuntimeSummary {
  function cloneSource(summary: RuntimeSummary | undefined): RuntimeSummary | undefined {
    if (!summary) return undefined;
    const copy: RuntimeSummary = {
      ...summary,
      failures: Array.isArray(summary.failures) ? summary.failures.slice() : []
    };
    delete copy.sources;
    return copy;
  }

  const active: RuntimeSummary[] = [];
  if (sources.player) active.push(sources.player);
  if (sources.backend) active.push(sources.backend);
  if (sources.legacy) active.push(sources.legacy);

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const failures: RuntimeFailure[] = [];
  let runtimeWarmed = active.length > 0;

  for (const summary of active) {
    total += Number(summary.total ?? 0);
    passed += Number(summary.passed ?? 0);
    failed += Number(summary.failed ?? 0);
    skipped += Number(summary.skipped ?? 0);
    if (summary.runtimeWarmed === false) runtimeWarmed = false;

    const sourceFailures = Array.isArray(summary.failures) ? summary.failures : [];
    for (const failure of sourceFailures) {
      failures.push({
        ...failure,
        source: failure.source ?? summary.source
      });
    }
  }

  return {
    source: 'screepsmod-testing-merged',
    total,
    passed,
    failed,
    skipped,
    failures,
    runtimeWarmed,
    runtimeWarmupTicks,
    scenarios,
    sources: {
      player: cloneSource(sources.player),
      backend: cloneSource(sources.backend),
      legacy: cloneSource(sources.legacy)
    },
    tick,
    duration: Date.now() - startedAt
  };
}
