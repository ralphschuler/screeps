import fs from 'fs';
import path from 'path';

const BASELINE_DIR = path.join(process.cwd(), 'performance-baselines');
const HISTORY_DIR = path.join(BASELINE_DIR, 'history');

function baselinePath(branch) {
  return path.join(BASELINE_DIR, `${branch}.json`);
}

function normalizeBaseline(raw) {
  if (!raw) return null;
  if (raw.cpu) return raw;
  const scenario = raw.scenarios?.default;
  if (!scenario) return raw;
  return {
    ...raw,
    cpu: {
      avg: scenario.avgCpu,
      p95: scenario.p95Cpu,
      max: scenario.maxCpu,
      min: scenario.minCpu ?? 0,
      p99: scenario.p99Cpu ?? scenario.p95Cpu,
    },
    timestamp: raw.timestamp ?? Date.now(),
  };
}

export function getBaseline(branch = 'main') {
  const file = baselinePath(branch);
  if (!fs.existsSync(file)) return null;
  return normalizeBaseline(JSON.parse(fs.readFileSync(file, 'utf8')));
}

export function saveBaseline(cpu, branch = 'main', additionalData = {}) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  const baseline = {
    branch,
    timestamp: Date.now(),
    cpu,
    ...additionalData,
  };
  fs.writeFileSync(baselinePath(branch), JSON.stringify(baseline, null, 2));
  const date = new Date().toISOString().split('T')[0];
  fs.writeFileSync(path.join(HISTORY_DIR, `${branch}-${date}.json`), JSON.stringify(baseline, null, 2));
  return baseline;
}

export function detectRegression(currentCpu, branch = 'main') {
  const baseline = getBaseline(branch);
  if (!baseline?.cpu) {
    return { severity: 'none', message: `No baseline found for ${branch}` };
  }
  const avgIncrease = ((currentCpu.avg - baseline.cpu.avg) / baseline.cpu.avg) * 100;
  const p95Increase = ((currentCpu.p95 - baseline.cpu.p95) / baseline.cpu.p95) * 100;
  const worst = Math.max(avgIncrease, p95Increase);
  let severity = 'none';
  if (worst >= 50) severity = 'critical';
  else if (worst >= 25) severity = 'high';
  else if (worst >= 15) severity = 'medium';
  else if (worst >= 5) severity = 'low';
  return {
    severity,
    message: severity === 'none' ? 'No significant CPU regression detected' : `CPU regression detected: ${worst.toFixed(1)}% increase`,
    recommendation: severity === 'none' ? undefined : 'Inspect recent hot paths and private-server performance artifacts.',
    details: {
      avgIncrease: `${avgIncrease.toFixed(1)}%`,
      p95Increase: `${p95Increase.toFixed(1)}%`,
      baselineAvg: baseline.cpu.avg,
      currentAvg: currentCpu.avg,
      baselineP95: baseline.cpu.p95,
      currentP95: currentCpu.p95,
    },
  };
}

export function getRegressionHistory(branch = 'main', days = 30) {
  if (!fs.existsSync(HISTORY_DIR)) return [];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return fs.readdirSync(HISTORY_DIR)
    .filter((name) => name.startsWith(`${branch}-`) && name.endsWith('.json'))
    .map((name) => normalizeBaseline(JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, name), 'utf8'))))
    .filter((entry) => (entry.timestamp ?? 0) >= cutoff)
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
}
