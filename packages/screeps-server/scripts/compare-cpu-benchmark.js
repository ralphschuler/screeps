#!/usr/bin/env node

import path from "node:path";
import {
  analysisFromSummary,
  compareCpuAnalyses,
  parseArgMap,
  readJson,
  writeJson,
} from "./cpu-benchmark-model.js";

function printHelp() {
  console.log(`Usage: node packages/screeps-server/scripts/compare-cpu-benchmark.js [options]\n\nOptions:\n  --baseline <summary.json>  Baseline private-server summary\n  --current <summary.json>   Current/candidate private-server summary\n  --runsDir <dir>            Directory with variants/pre-opt/summary.json and variants/candidate/summary.json\n  --out <path>               Output report JSON path\n  --cpuThreshold <n>         Allowed CPU regression ratio (default 0.10)\n  --bucketThreshold <n>      Allowed avg bucket drop ratio (default 0.05)\n  --markdown <path>          Optional markdown report path\n`);
}

function parseOptions(argv = process.argv.slice(2)) {
  const args = parseArgMap(argv);
  if (args.has("help") || args.has("h")) return { help: true };
  const runsDir = args.get("runsDir");
  return {
    baseline: args.get("baseline") ?? (runsDir ? path.join(runsDir, "variants", "pre-opt", "summary.json") : undefined),
    current: args.get("current") ?? (runsDir ? path.join(runsDir, "variants", "candidate", "summary.json") : undefined),
    out: args.get("out") ?? (runsDir ? path.join(runsDir, "cpu-comparison.json") : undefined),
    markdown: args.get("markdown") ?? (runsDir ? path.join(runsDir, "cpu-comparison.md") : undefined),
    cpuThreshold: Number(args.get("cpuThreshold") ?? 0.10),
    bucketThreshold: Number(args.get("bucketThreshold") ?? 0.05),
  };
}

function loadAnalysis(summaryPath) {
  if (!summaryPath) throw new Error("summary path missing");
  const summary = readJson(summaryPath);
  const analysis = analysisFromSummary(summary);
  if (!analysis) throw new Error(`summary has no metrics.cpuBenchmark.analysis: ${summaryPath}`);
  return { summaryPath, summary, analysis };
}

function renderMarkdown(report) {
  const rows = report.comparison.comparisons.map((row) => `| ${row.metric} | ${row.baseline.toFixed(3)} | ${row.current.toFixed(3)} | ${(row.delta * 100).toFixed(1)}% | ${row.passed ? "pass" : "FAIL"} |`).join("\n");
  const topRows = (report.current.analysis.topProcesses ?? []).slice(0, 10).map((row) => `| ${row.key} | ${row.avg.toFixed(3)} | ${row.max.toFixed(3)} | ${row.samples} |`).join("\n") || "| none | | | |";
  return `# CPU benchmark comparison\n\nStatus: ${report.comparison.status}\nVerdict: ${report.comparison.verdict}\n\nBaseline: \`${report.baseline.summaryPath}\`\nCurrent: \`${report.current.summaryPath}\`\n\n## Metrics\n\n| metric | baseline | current | delta | result |\n| --- | ---: | ---: | ---: | --- |\n${rows}\n\n## Current top processes\n\n| process | avg CPU | max CPU | samples |\n| --- | ---: | ---: | ---: |\n${topRows}\n`;
}

export function buildComparisonReport(options) {
  const baseline = loadAnalysis(options.baseline);
  const current = loadAnalysis(options.current);
  const comparison = compareCpuAnalyses(baseline.analysis, current.analysis, {
    cpu: options.cpuThreshold,
    bucket: options.bucketThreshold,
  });
  return {
    generatedAt: new Date().toISOString(),
    baseline: { summaryPath: baseline.summaryPath, analysis: baseline.analysis, status: baseline.summary.status },
    current: { summaryPath: current.summaryPath, analysis: current.analysis, status: current.summary.status },
    comparison,
  };
}

async function main() {
  const options = parseOptions();
  if (options.help) {
    printHelp();
    return;
  }
  if (!options.baseline || !options.current) throw new Error("Pass --baseline/--current or --runsDir");
  const report = buildComparisonReport(options);
  if (options.out) writeJson(options.out, report);
  if (options.markdown) {
    const fs = await import("node:fs");
    fs.mkdirSync(path.dirname(options.markdown), { recursive: true });
    fs.writeFileSync(options.markdown, renderMarkdown(report));
  }
  console.log(`status=${report.comparison.status} verdict=${report.comparison.verdict}`);
  if (options.out) console.log(`wrote ${options.out}`);
  if (report.comparison.status !== "passed") process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
