/**
 * @internal
 * Formatting helpers for throttled CPU diagnostics emitted by UnifiedStatsManager.
 */
import type { CPUAnomaly, CPUBudgetAlert, ProcessStatsEntry } from "../statsTypes";

const CPU_ALERT_DETAIL_LIMIT = 5;

type BudgetAlertProcessIndex = Record<string, Pick<ProcessStatsEntry, "tickModulo"> | undefined>;

export interface BudgetAlertFormattingOptions {
  /** Hide absolute CPU numbers for warning-level summaries where percent is enough. */
  includeCpuUsage?: boolean;
  /** Optional process stats used to explain distributed room cadence in alert text. */
  processes?: BudgetAlertProcessIndex;
}

/**
 * Format the highest-value CPU budget diagnostics for a throttled console alert.
 *
 * Sorting by `percentUsed` keeps the worst rooms first, while the shared detail
 * cap protects live Screeps console output from becoming a CPU problem itself.
 */
export function formatBudgetAlertDetails(alerts: CPUBudgetAlert[], options: BudgetAlertFormattingOptions = {}): string {
  const includeCpuUsage = options.includeCpuUsage ?? true;
  const details = [...alerts]
    .sort((a, b) => b.percentUsed - a.percentUsed)
    .slice(0, CPU_ALERT_DETAIL_LIMIT)
    .map(a => {
      const processId = `room:${a.target}`;
      const process = options.processes?.[processId];
      const modulo = process?.tickModulo ?? 1;
      const moduloInfo = modulo > 1 ? ` [runs every ${modulo} ticks]` : "";
      const percent = `${(a.percentUsed * 100).toFixed(1)}%`;
      if (!includeCpuUsage) {
        return `${a.target}: ${percent}${moduloInfo}`;
      }
      return `${a.target}: ${percent} (${a.cpuUsed.toFixed(3)}/${a.budgetLimit.toFixed(3)} CPU)${moduloInfo}`;
    });

  return appendOmittedDetails(details, alerts.length);
}

/** Format CPU anomaly diagnostics with the largest multipliers first. */
export function formatAnomalyDetails(anomalies: CPUAnomaly[]): string {
  const details = [...anomalies]
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, CPU_ALERT_DETAIL_LIMIT)
    .map(a =>
      `${a.target} (${a.type}): ${a.current.toFixed(3)} CPU (${a.multiplier.toFixed(1)}x baseline)${a.context ? ` - ${a.context}` : ""}`
    );

  return appendOmittedDetails(details, anomalies.length);
}

function appendOmittedDetails(details: string[], total: number): string {
  const omitted = total - details.length;
  if (omitted > 0) {
    details.push(`... ${omitted} more omitted`);
  }
  return details.join(", ");
}
