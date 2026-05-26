export interface MemoryFormatterPort {
  formatBytes(bytes: number): string;
}

export interface MemoryStatusReportInput {
  status: string;
  used: number;
  limit: number;
  percentage: number;
  breakdown: {
    total: number;
    empire: number;
    rooms: number;
    creeps: number;
    clusters: number;
    ss2PacketQueue: number;
    other: number;
  };
}

export interface MemoryConsumerReportInput {
  topN: number;
  consumers: { type: string; name: string; size: number }[];
  recommendations: string[];
}

export interface MemoryPruneReportInput {
  deadCreeps: number;
  eventLogs: number;
  staleIntel: number;
  marketHistory: number;
  bytesSaved: number;
}

export interface MemorySegmentsReportInput {
  activeSegments: number[];
  allocation: Record<string, { start: number; end: number }>;
  segmentSize: (segment: number) => number;
}

export interface MemoryMigrationReportInput {
  currentVersion: number;
  latestVersion: number;
  pending: { version: number; description: string }[];
}

export function formatMemoryStatusReport(input: MemoryStatusReportInput, formatter: MemoryFormatterPort): string {
  const labels: [keyof MemoryStatusReportInput["breakdown"], string][] = [
    ["empire", "Empire"],
    ["rooms", "Rooms"],
    ["creeps", "Creeps"],
    ["clusters", "Clusters"],
    ["ss2PacketQueue", "SS2 Queue"],
    ["other", "Other"]
  ];
  const lines = [
    `Memory Status: ${input.status.toUpperCase()}`,
    `Usage: ${formatter.formatBytes(input.used)} / ${formatter.formatBytes(input.limit)} (${(input.percentage * 100).toFixed(1)}%)`,
    "",
    "Breakdown:"
  ];

  for (const [key, label] of labels) {
    const value = input.breakdown[key] ?? 0;
    const pct = input.breakdown.total > 0 ? (value / input.breakdown.total) * 100 : 0;
    lines.push(`  ${`${label}:`.padEnd(14)} ${formatter.formatBytes(value)} (${pct.toFixed(1)}%)`);
  }

  return `${lines.join("\n")}\n`;
}

export function formatMemoryConsumerReport(input: MemoryConsumerReportInput, formatter: MemoryFormatterPort): string {
  const lines = [`Top ${input.topN} Memory Consumers:`];
  input.consumers.forEach((consumer, index) => {
    lines.push(`${index + 1}. ${consumer.type}:${consumer.name} - ${formatter.formatBytes(consumer.size)}`);
  });

  if (input.recommendations.length > 0) {
    lines.push("", "Recommendations:", ...input.recommendations.map(rec => `- ${rec}`));
  } else {
    lines.push("", "No recommendations at this time.");
  }

  return `${lines.join("\n")}\n`;
}

export function formatMemoryPruneReport(input: MemoryPruneReportInput, formatter: MemoryFormatterPort): string {
  return [
    "Memory Pruning Complete:",
    `  Dead creeps removed:        ${input.deadCreeps}`,
    `  Event log entries removed:  ${input.eventLogs}`,
    `  Stale intel removed:        ${input.staleIntel}`,
    `  Market history removed:     ${input.marketHistory}`,
    `  Total bytes saved:          ${formatter.formatBytes(input.bytesSaved)}`,
    ""
  ].join("\n");
}

export function formatMemorySegmentsReport(input: MemorySegmentsReportInput, formatter: MemoryFormatterPort): string {
  const lines = ["Memory Segments:", "", `Active segments: ${input.activeSegments.length}/10`];
  if (input.activeSegments.length > 0) lines.push(`  Loaded: [${input.activeSegments.join(", ")}]`, "");
  lines.push("Allocation Strategy:");

  for (const [type, range] of Object.entries(input.allocation)) {
    let line = `  ${type.padEnd(20)} ${range.start.toString().padStart(2)}-${range.end.toString().padEnd(2)}`;
    const activeInRange = input.activeSegments.filter(segment => segment >= range.start && segment <= range.end);
    if (activeInRange.length > 0) {
      line += ` [${activeInRange.map(segment => `${segment}:${formatter.formatBytes(input.segmentSize(segment))}`).join(", ")}]`;
    }
    lines.push(line);
  }

  return `${lines.join("\n")}\n`;
}

export function formatMemoryMigrationReport(input: MemoryMigrationReportInput): string {
  const lines = [
    "Memory Migration Status:",
    `  Current version: ${input.currentVersion}`,
    `  Latest version:  ${input.latestVersion}`,
    `  Status: ${input.pending.length > 0 ? "PENDING" : "UP TO DATE"}`,
    ""
  ];

  if (input.pending.length > 0) {
    lines.push("Pending Migrations:", ...input.pending.map(migration => `  v${migration.version}: ${migration.description}`), "", "Migrations will run automatically on next tick.");
  }

  return `${lines.join("\n")}\n`;
}
