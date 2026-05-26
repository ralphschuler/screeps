import type { ProcessTopologyNode, ProcessTopologySnapshot } from "./kernel";

/**
 * Observable process architecture Module.
 *
 * Interface: consumes the kernel topology snapshot and emits a read-only report.
 * Implementation: pure formatting; no process mutation.
 * Depth: hides topology/scheduling/stat layout behind one query/report seam.
 * Seam: Kernel.getProcessTopology() plus console/visual adapters.
 * Adapters: KernelCommands and future room/empire visualization commands.
 * Leverage: tests, console, and CI diagnostics share the same snapshot contract.
 * Locality: process architecture observability stays outside managers.
 */
export function formatProcessTopologySnapshot(snapshot: ProcessTopologySnapshot): string {
  const lines: string[] = [
    "=== Process Architecture Topology ===",
    `Processes: ${snapshot.summary.total} total, ${snapshot.summary.roots} roots, ${snapshot.summary.edges} edges`,
    `Layers: ${formatCounts(snapshot.summary.byLayer)}`,
    `Groups: ${formatCounts(snapshot.summary.byGroup)}`,
    `States: ${formatCounts(snapshot.summary.byState)}`,
    "",
    "ID | Parent | Layer | Group | Priority | Frequency | Schedule | State | Health",
    "-".repeat(120)
  ];

  for (const node of [...snapshot.nodes].sort(compareTopologyNodes)) {
    lines.push(formatProcessTopologyNode(node));
  }

  const edges = Object.entries(snapshot.childrenByParent).sort(([a], [b]) => a.localeCompare(b));
  if (edges.length > 0) {
    lines.push("", "Edges:");
    for (const [parentId, childIds] of edges) {
      lines.push(`${parentId} -> ${[...childIds].sort().join(", ")}`);
    }
  }

  return lines.join("\n");
}

function formatProcessTopologyNode(node: ProcessTopologyNode): string {
  return [
    node.id,
    node.parentId ?? "root",
    node.layer ?? "-",
    node.group ?? "-",
    node.priority,
    node.frequency,
    formatSchedule(node),
    node.state,
    `runs=${node.runCount} avg=${node.avgCpu.toFixed(4)} max=${node.maxCpu.toFixed(4)} last=${node.lastRunTick} skipped=${node.skippedCount} cpuSkips=${node.consecutiveCpuSkips} errors=${node.errorCount} consecutiveErrors=${node.consecutiveErrors} health=${node.healthScore.toFixed(0)}`
  ].join(" | ");
}

function formatSchedule(node: ProcessTopologyNode): string {
  const parts = [`interval=${node.interval}`];
  if (node.tickModulo !== undefined) {
    parts.push(`modulo=${node.tickModulo}`);
  }
  if (node.tickOffset !== undefined) {
    parts.push(`offset=${node.tickOffset}`);
  }
  if (node.minBucket > 0) {
    parts.push(`minBucket=${node.minBucket}`);
  }
  return parts.join(" ");
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return "none";
  }

  return entries.map(([key, count]) => `${key}=${count}`).join(", ");
}

function compareTopologyNodes(a: ProcessTopologyNode, b: ProcessTopologyNode): number {
  const layerCompare = (a.layer ?? "").localeCompare(b.layer ?? "");
  if (layerCompare !== 0) return layerCompare;

  const priorityCompare = b.priority - a.priority;
  if (priorityCompare !== 0) return priorityCompare;

  return a.id.localeCompare(b.id);
}
