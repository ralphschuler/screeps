import { RuntimeSummary } from './summary';
export interface BackendAssertionInput {
    config: any;
    storage: any;
    memory: any;
    tick: number;
    runtimeWarmupTicks: number;
    botRuntimeWarmed: boolean;
    user: any;
    userId: any;
    userIdFilter: Record<string, any>;
    ownedControllers: any[];
    spawns: any[];
    creeps: any[];
    errorSamples: string[];
    scenarios: string[];
    startedAt: number;
}
export declare function runBackendRuntimeAssertions(input: BackendAssertionInput): Promise<RuntimeSummary>;
//# sourceMappingURL=backendAssertions.d.ts.map