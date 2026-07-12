export interface AssertionCounts {
  status: "passed" | "failed" | "incomplete" | "unknown" | "inconsistent";
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export function redactString(value: unknown): string;
export function redactSensitive(value: unknown): unknown;
export function limitOutput(value: unknown, maxBytes?: number): { value: string; truncated: boolean };
export function normalizeAssertionCounts(testSummary?: any): AssertionCounts;
export function deriveValidation(summary?: any, testSummary?: any, transportError?: unknown): {
  assertions: AssertionCounts;
  transport: { status: "passed" | "failed"; error: string | null };
};
