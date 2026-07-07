#!/usr/bin/env node

/**
 * Runs JSCPD and enforces the configured duplication budget after reports exist.
 * JSCPD's native exitCode setting is intentionally left at 0 because it exits on
 * any clones, not only threshold breaches, for this project baseline.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), '.jscpd.json');
const DEFAULT_REPORT_PATH = path.join(process.cwd(), 'reports', 'duplication', 'jscpd-report.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTotalDuplicationPercentage(report) {
  const percentage = Number(report?.statistics?.total?.percentage);
  if (!Number.isFinite(percentage)) {
    throw new Error('JSCPD report is missing statistics.total.percentage');
  }
  return percentage;
}

function enforceDuplicationBudget({ configPath = DEFAULT_CONFIG_PATH, reportPath = DEFAULT_REPORT_PATH } = {}) {
  const config = readJson(configPath);
  const threshold = Number(config.threshold);
  if (!Number.isFinite(threshold)) {
    throw new Error('JSCPD config is missing numeric threshold');
  }

  const report = readJson(reportPath);
  const percentage = readTotalDuplicationPercentage(report);
  const result = { percentage, threshold, breached: percentage > threshold };

  if (result.breached) {
    throw new Error(
      `Duplication budget exceeded: ${percentage.toFixed(2)}% total duplication exceeds the ${threshold}% transitional threshold.`
    );
  }

  console.log(
    `✅ Duplication budget met: ${percentage.toFixed(2)}% total duplication is within the ${threshold}% transitional threshold.`
  );
  return result;
}

function runJscpd() {
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--no-install', 'jscpd', '.', '--config', '.jscpd.json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`JSCPD failed before budget enforcement with exit code ${result.status}.`);
  }
}

function main() {
  try {
    runJscpd();
    enforceDuplicationBudget();
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  enforceDuplicationBudget,
  readTotalDuplicationPercentage
};
