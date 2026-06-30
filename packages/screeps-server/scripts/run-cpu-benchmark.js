#!/usr/bin/env node

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildComparisonReport } from "./compare-cpu-benchmark.js";
import { parseArgMap, writeJson } from "./cpu-benchmark-model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "../..");

function printHelp() {
  console.log(`Usage: node packages/screeps-server/scripts/run-cpu-benchmark.js [options]\n\nOptions:\n  --snapshot <path>             Live structural snapshot JSON (required)\n  --ticks <n>                   Max ticks per variant (default 3000)\n  --tickRate <ms>               Private-server tick rate (default 20)\n  --tickPollMs <ms>             Harness poll interval (default 5000)\n  --durationMinutes <n>         Wall-clock cap per variant; overrides estimate\n  --tickWallMs <ms>             Estimated wall ms per tick for cap (default 1000)\n  --durationBufferMinutes <n>   Extra cap minutes after estimate (default 15)\n  --outDir <path>               Run artifact directory\n  --variants <list>             Comma list: candidate,pre-opt,head-1,head-2 (default all)\n  --cpuThreshold <n>            Allowed CPU regression ratio for report (default 0.10)\n`);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (child.stdout) child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    if (child.stderr) child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}\n${stderr}`));
    });
  });
}

function parsePositiveInteger(value, name, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function parseNonNegativeInteger(value, name, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${name} must be a non-negative integer`);
  return parsed;
}

export function resolveDurationMinutes(options) {
  if (options.durationMinutes !== undefined) return options.durationMinutes;
  const configuredTickEstimate = Math.ceil((options.ticks * options.tickRate) / 60000);
  const wallTickEstimate = Math.ceil((options.ticks * options.tickWallMs) / 60000);
  return Math.max(15, configuredTickEstimate, wallTickEstimate) + options.durationBufferMinutes;
}

export function parseOptions(argv = process.argv.slice(2)) {
  const args = parseArgMap(argv);
  if (args.has("help") || args.has("h")) return { help: true };
  const ticks = parsePositiveInteger(args.get("ticks"), "--ticks", 3000);
  const tickRate = parsePositiveInteger(args.get("tickRate"), "--tickRate", 20);
  const tickPollMs = parsePositiveInteger(args.get("tickPollMs"), "--tickPollMs", 5000);
  const durationMinutes = args.has("durationMinutes")
    ? parsePositiveInteger(args.get("durationMinutes"), "--durationMinutes")
    : undefined;
  const tickWallMs = parsePositiveInteger(args.get("tickWallMs"), "--tickWallMs", 1000);
  const durationBufferMinutes = parseNonNegativeInteger(
    args.get("durationBufferMinutes"),
    "--durationBufferMinutes",
    15,
  );
  const cpuThreshold = Number(args.get("cpuThreshold") ?? 0.10);
  if (!Number.isFinite(cpuThreshold) || cpuThreshold < 0) throw new Error("--cpuThreshold must be a non-negative number");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return {
    snapshot: args.get("snapshot"),
    ticks,
    tickRate,
    tickPollMs,
    durationMinutes,
    tickWallMs,
    durationBufferMinutes,
    outDir: path.resolve(args.get("outDir") ?? path.join(serverRoot, "artifacts", "cpu-benchmark", "runs", stamp)),
    variants: String(args.get("variants") ?? "candidate,pre-opt,head-1,head-2").split(",").map((value) => value.trim()).filter(Boolean),
    cpuThreshold,
  };
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

async function writeGitBundle(ref, outPath) {
  const gitPath = `${ref}:packages/screeps-bot/dist/main.js`;
  const { stdout } = await run("git", ["show", gitPath], { capture: true });
  if (!stdout.trim()) throw new Error(`empty bundle at ${gitPath}`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, stdout);
}

async function prepareVariants(options) {
  const bundlesDir = path.join(options.outDir, "bundles");
  fs.mkdirSync(bundlesDir, { recursive: true });
  const currentBundle = path.join(repoRoot, "packages/screeps-bot/dist/main.js");
  const preOptBundle = path.join(serverRoot, "artifacts", "cpu-benchmark", "baselines", "latest", "pre-opt-main.js");
  const variants = [];

  for (const variant of options.variants) {
    if (variant === "candidate") {
      variants.push({ name: "candidate", source: "working-tree", bundle: currentBundle, required: true });
    } else if (variant === "pre-opt") {
      variants.push({ name: "pre-opt", source: "frozen-baseline", bundle: preOptBundle, required: true });
    } else if (variant === "head-1") {
      const bundle = path.join(bundlesDir, "head-1-main.js");
      await writeGitBundle("HEAD~1", bundle).catch((error) => { variants.push({ name: "head-1", source: "git:HEAD~1", skipped: true, reason: error.message }); });
      if (fs.existsSync(bundle)) variants.push({ name: "head-1", source: "git:HEAD~1", bundle, required: false });
    } else if (variant === "head-2") {
      const bundle = path.join(bundlesDir, "head-2-main.js");
      await writeGitBundle("HEAD~2", bundle).catch((error) => { variants.push({ name: "head-2", source: "git:HEAD~2", skipped: true, reason: error.message }); });
      if (fs.existsSync(bundle)) variants.push({ name: "head-2", source: "git:HEAD~2", bundle, required: false });
    } else {
      variants.push({ name: variant, skipped: true, reason: "unknown variant" });
    }
  }

  for (const variant of variants) {
    if (variant.bundle && !fs.existsSync(variant.bundle)) {
      if (variant.required) throw new Error(`required bundle missing for ${variant.name}: ${variant.bundle}`);
      variant.skipped = true;
      variant.reason = `bundle missing: ${variant.bundle}`;
    }
    if (variant.bundle && !variant.skipped) variant.sha256 = sha256(variant.bundle);
  }
  return variants;
}

async function runVariant(options, variant) {
  const artifactsDir = path.join(options.outDir, "variants", variant.name);
  const durationMinutes = resolveDurationMinutes(options);
  const project = `screeps-cpu-${variant.name.replace(/[^a-z0-9-]/gi, "-")}-${Date.now()}`.toLowerCase().slice(0, 63);
  const args = [
    path.join(serverRoot, "scripts", "run-private-server-test.js"),
    "--mode=cpu-benchmark",
    `--durationMinutes=${durationMinutes}`,
    `--maxTicks=${options.ticks}`,
    `--tickRate=${options.tickRate}`,
    `--tickPollMs=${options.tickPollMs}`,
    "--scenarios=none",
    `--liveCloneSnapshot=${path.resolve(options.snapshot)}`,
    `--botBundle=${path.resolve(variant.bundle)}`,
    `--artifactsDir=${artifactsDir}`,
    `--project=${project}`,
  ];
  await run("node", args, { cwd: repoRoot });
  return path.join(artifactsDir, "summary.json");
}

export async function runCpuBenchmark(options) {
  if (!options.snapshot) throw new Error("--snapshot is required");
  if (!fs.existsSync(options.snapshot)) throw new Error(`snapshot missing: ${options.snapshot}`);
  fs.mkdirSync(options.outDir, { recursive: true });
  const variants = await prepareVariants(options);
  const metadata = {
    generatedAt: new Date().toISOString(),
    snapshot: path.resolve(options.snapshot),
    ticks: options.ticks,
    tickRate: options.tickRate,
    tickPollMs: options.tickPollMs,
    durationMinutes: resolveDurationMinutes(options),
    durationEstimate: {
      tickWallMs: options.tickWallMs,
      bufferMinutes: options.durationBufferMinutes,
      overridden: options.durationMinutes !== undefined,
    },
    variants: [],
  };
  writeJson(path.join(options.outDir, "metadata.json"), metadata);

  for (const variant of variants) {
    if (variant.skipped) {
      metadata.variants.push(variant);
      writeJson(path.join(options.outDir, "metadata.json"), metadata);
      continue;
    }
    const summaryPath = await runVariant(options, variant);
    metadata.variants.push({ ...variant, summaryPath });
    writeJson(path.join(options.outDir, "metadata.json"), metadata);
  }

  const preOpt = metadata.variants.find((variant) => variant.name === "pre-opt" && variant.summaryPath);
  const candidate = metadata.variants.find((variant) => variant.name === "candidate" && variant.summaryPath);
  if (preOpt && candidate) {
    const report = buildComparisonReport({
      baseline: preOpt.summaryPath,
      current: candidate.summaryPath,
      cpuThreshold: options.cpuThreshold,
      bucketThreshold: 0.05,
    });
    writeJson(path.join(options.outDir, "cpu-comparison.json"), report);
    metadata.comparison = { status: report.comparison.status, verdict: report.comparison.verdict };
    writeJson(path.join(options.outDir, "metadata.json"), metadata);
  }

  return metadata;
}

async function main() {
  const options = parseOptions();
  if (options.help) {
    printHelp();
    return;
  }
  const metadata = await runCpuBenchmark(options);
  console.log(`wrote ${options.outDir}`);
  if (metadata.comparison) console.log(`comparison=${metadata.comparison.status}/${metadata.comparison.verdict}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
