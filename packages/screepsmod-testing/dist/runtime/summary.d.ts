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
export declare function mergeRuntimeSummaries(sources: RuntimeSummarySources, tick: number, startedAt: number, runtimeWarmupTicks: number, scenarios?: string[]): RuntimeSummary;
//# sourceMappingURL=summary.d.ts.map