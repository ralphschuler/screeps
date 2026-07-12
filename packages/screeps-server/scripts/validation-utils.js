const SENSITIVE_KEY = /(?:token|password|secret|api[_-]?key|access[_-]?token|authorization|key)/i;
const SENSITIVE_ASSIGNMENT = /((?:token|password|secret|api[_-]?key|access[_-]?token|authorization|key)\s*[=:]\s*)(["']?)([^\s,}\]]+)\2/gi;
const SENSITIVE_JSON = /("?(?:token|password|secret|api[_-]?key|access[_-]?token|authorization|key)"?\s*:\s*)("(?:\\.|[^"\\])*"|[^,}\s]+)/gi;
const REDACTED = "[REDACTED]";

export function redactString(value) {
  return String(value ?? "")
    .replace(SENSITIVE_ASSIGNMENT, `$1${REDACTED}`)
    .replace(SENSITIVE_JSON, `$1"${REDACTED}"`);
}

export function redactSensitive(value, seen = new WeakSet()) {
  if (typeof value === "string") return redactString(value);
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);

  if (Array.isArray(value)) return value.map((item) => redactSensitive(item, seen));

  const redacted = {};
  for (const [key, item] of Object.entries(value)) {
    redacted[key] = SENSITIVE_KEY.test(key) ? REDACTED : redactSensitive(item, seen);
  }
  return redacted;
}

export function limitOutput(value, maxBytes = 256_000) {
  const text = String(value ?? "");
  if (maxBytes === Number.POSITIVE_INFINITY) return { value: text, truncated: false };
  if (!Number.isFinite(maxBytes) || maxBytes < 1) return { value: "", truncated: text.length > 0 };
  if (Buffer.byteLength(text, "utf8") <= maxBytes) return { value: text, truncated: false };
  return {
    value: Buffer.from(text, "utf8").subarray(0, maxBytes).toString("utf8"),
    truncated: true,
  };
}

function count(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeAssertionCounts(testSummary = {}) {
  const total = count(testSummary.total, 0);
  const failed = count(testSummary.failed, 0);
  const skipped = count(testSummary.skipped, 0);
  const inferredPassed = total !== null && failed !== null && skipped !== null
    ? Math.max(0, total - failed - skipped)
    : null;
  const passed = count(testSummary.passed, inferredPassed ?? 0);
  const valid = [total, passed, failed, skipped].every((value) => value !== null)
    && passed + failed + skipped === total;

  let status = "inconsistent";
  if (valid) {
    status = total <= 0
      ? "unknown"
      : failed > 0
        ? "failed"
        : skipped > 0
          ? "incomplete"
          : "passed";
  }

  return { status, total: total ?? 0, passed: passed ?? 0, failed: failed ?? 0, skipped: skipped ?? 0 };
}

export function deriveValidation(summary = {}, testSummary = summary.metrics?.screepsmodTesting, transportError = null) {
  const assertions = normalizeAssertionCounts(testSummary ?? {});
  const existingTransport = summary.metrics?.validation?.transport ?? {};
  const transportFailed = Boolean(transportError) || existingTransport.status === "failed";
  return {
    assertions,
    transport: {
      status: transportFailed ? "failed" : "passed",
      error: transportError
        ? limitOutput(redactString(transportError?.message ?? String(transportError)), 4000).value
        : existingTransport.error ?? null,
    },
  };
}
