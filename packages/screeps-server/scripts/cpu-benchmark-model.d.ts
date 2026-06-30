export function translateRoomNames(roomNames: string[]): Record<string, string>;
export function deriveCandidateRooms(memory: any, explicitRooms?: string[], limit?: number): string[];
export function summarizeRoomObjects(input: any): any;
export function buildStructuralSnapshot(input: any): any;
export function summarizeCpuBenchmarkSamples(samples: any[]): any;
export function compareCpuAnalyses(baseline: any, current: any, thresholds?: any): any;
export function appendCpuBenchmarkSample(memory: any, summary: any): void;
