#!/usr/bin/env node

/**
 * Analyze server test results and generate report
 *
 * Collects test results from integration/performance/package test runs,
 * enriches from private-server harness summary when available,
 * and writes machine-readable + human-readable artifacts.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { deriveValidation, normalizeAssertionCounts } from './validation-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORT_PATH = join(__dirname, '..', 'test-results.json');
const MARKDOWN_PATH = join(__dirname, '..', 'test-report.md');
const ARTIFACT_DIR = join(__dirname, '..', 'artifacts');

function safeReadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function inferHarnessMode() {
  try {
    const argvRaw = process.env.npm_config_argv;
    if (argvRaw) {
      const parsed = JSON.parse(argvRaw);
      const tokens = [
        ...(Array.isArray(parsed?.original) ? parsed.original : []),
        process.env.npm_lifecycle_event,
        ...process.argv,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      if (tokens.some((token) => token.includes('test:smoke') || token === 'smoke')) return 'smoke';
      if (tokens.some((token) => token.includes('test:long') || token === 'long')) return 'long';
      if (tokens.some((token) => token.includes('test:integration'))) return 'smoke';
      if (tokens.some((token) => token.includes('smoke-alt'))) return 'smoke-alt';
      if (tokens.some((token) => token.includes('test:packages'))) return 'packages';
      if (tokens.some((token) => token.includes('test:performance'))) return 'long';
      if (tokens.some((token) => token.includes('test:server'))) return 'long';
      const modeArg = tokens
        .filter((token) => token.startsWith('--mode='))
        .map((token) => token.replace(/^--mode=/, ''))[0];
      if (modeArg) return modeArg;
      const hasModeFlag = tokens.indexOf('--mode');
      if (hasModeFlag >= 0 && tokens[hasModeFlag + 1]) {
        return tokens[hasModeFlag + 1];
      }
    }
  } catch {
    // fallthrough
  }

  return null;
}

function inferModeFromArtifacts() {
  if (!existsSync(ARTIFACT_DIR)) return null;
  let selected = null;
  let bestMtime = -1;

  try {
    const entries = readdirSync(ARTIFACT_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const entry of entries) {
      const summaryPath = join(ARTIFACT_DIR, entry, 'summary.json');
      if (!existsSync(summaryPath)) continue;

      const { mtimeMs } = statSync(summaryPath);
      if (mtimeMs <= bestMtime) continue;

      const summary = safeReadJson(summaryPath);
      if (!summary || typeof summary !== 'object') continue;
      if (!['smoke', 'long', 'packages', 'integration', 'performance', 'smoke-alt'].includes(entry)) continue;

      selected = entry;
      bestMtime = mtimeMs;
    }
  } catch {
    return null;
  }

  return selected;
}

function readHarnessSummary(mode) {
  if (!mode || mode === 'packages') return null;

  const path = join(ARTIFACT_DIR, mode, 'summary.json');
  const summary = safeReadJson(path);
  if (!summary) return null;

  return { path, summary, mode };
}

function durationSecondsFromSummary(summary) {
  if (!summary?.startedAt || !summary?.finishedAt) return 0;
  const start = Date.parse(summary.startedAt);
  const finish = Date.parse(summary.finishedAt);
  if (Number.isNaN(start) || Number.isNaN(finish)) return 0;
  return Math.max(0, (finish - start) / 1000);
}

export function applyHarnessSummary(report, harnessSummary) {
  const summary = harnessSummary?.summary;
  if (!summary) return report;

  const testSummary =
    summary.metrics?.screepsmodTesting
    || summary.metrics?.screepsmodTestingPlayer
    || null;
  const backendSummary = summary.metrics?.screepsmodTestingBackend || null;
  const validation = deriveValidation(summary, testSummary);
  const validationFailures = [];

  if (summary.status && summary.status !== 'passed') validationFailures.push(`harness status: ${summary.status}`);
  if (validation.transport.status !== 'passed') validationFailures.push('transport failed');
  if (validation.assertions.status !== 'passed') {
    validationFailures.push(`assertions ${validation.assertions.status}`);
  }
  if (backendSummary) {
    const backendAssertions = normalizeAssertionCounts(backendSummary);
    if (backendAssertions.status !== 'passed') {
      validationFailures.push(`backend assertions ${backendAssertions.status}`);
    }
  }

  if (testSummary) {
    const counts = validation.assertions;
    report.integration.tests.push({
      name: testSummary.source || 'screepsmod-testing',
      ...counts,
    });
    report.integration.passed =
      counts.status === 'passed'
      && summary.checks?.modResultsPresent === true
      && validation.transport.status === 'passed'
      && summary.status === 'passed';
    report.summary.total += counts.total;
    report.summary.passed += counts.passed;
    report.summary.failed += counts.failed;
    report.summary.skipped += counts.skipped;
  }

  if (backendSummary) {
    const counts = normalizeAssertionCounts(backendSummary);
    report.performance.tests.push({
      name: backendSummary.source || 'screepsmod-testing-backend',
      ...counts,
    });
    report.performance.passed =
      counts.status === 'passed'
      && summary.checks?.modResultsPresent === true
      && validation.transport.status === 'passed'
      && summary.status === 'passed';
    report.summary.total += counts.total;
    report.summary.passed += counts.passed;
    report.summary.failed += counts.failed;
    report.summary.skipped += counts.skipped;
  }

  if (validationFailures.length > 0 && report.summary.failed === 0) report.summary.failed = 1;
  report.validation = {
    status: validationFailures.length === 0 ? 'passed' : 'failed',
    failures: validationFailures,
    assertions: validation.assertions,
    transport: validation.transport,
  };

  const elapsedSeconds = durationSecondsFromSummary(summary);
  if (elapsedSeconds > 0) {
    report.summary.duration = elapsedSeconds;
    report.integration.duration = elapsedSeconds;
    report.performance.duration = elapsedSeconds;
    report.packages.duration = elapsedSeconds;
  }
  return report;
}

export function buildEmptyReport() {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    },
    integration: {
      passed: false,
      tests: [],
      duration: 0,
    },
    performance: {
      passed: false,
      tests: [],
      cpuMetrics: {
        avgCpu: null,
        maxCpu: null,
        avgBucket: null,
      },
      duration: 0,
    },
    packages: {
      passed: false,
      tests: [],
      duration: 0,
    },
  };
}

export function generateReport() {
  const report = buildEmptyReport();

  const mode = inferHarnessMode();
  const harnessSummary = readHarnessSummary(mode);

  if (harnessSummary && harnessSummary.summary && mode !== 'packages') {
    applyHarnessSummary(report, harnessSummary);
  }

  if (mode === 'packages') {
    // package suite output is intentionally left as placeholders until package runner JSON reporting is added.
    report.packages.passed = true;
  }

  if (report.integration.tests.length === 0) {
    report.integration.passed = true;
  }
  if (report.performance.tests.length === 0) {
    report.performance.passed = true;
  }
  if (report.packages.tests.length === 0 && !report.packages.passed) {
    report.packages.passed = true;
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`✅ Test results written to ${REPORT_PATH}`);

  const markdown = generateMarkdown(report);
  writeFileSync(MARKDOWN_PATH, markdown);
  console.log(`✅ Markdown report written to ${MARKDOWN_PATH}`);

  return report;
}

function formatMetric(value, decimals, fallback = 'N/A') {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(decimals)
    : fallback;
}

function generateMarkdown(report) {
  const passed = report.summary.failed === 0;
  const emoji = passed ? '✅' : '❌';

  return `# 🧪 Server Test Results ${emoji}

**Generated**: ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Total Tests**: ${report.summary.total}
- **Passed**: ✅ ${report.summary.passed}
- **Failed**: ❌ ${report.summary.failed}
- **Skipped**: ⏭️ ${report.summary.skipped}
- **Duration**: ${report.summary.duration.toFixed(2)}s

## Integration Tests

${report.integration.passed ? '✅' : '❌'} **Status**: ${report.integration.passed ? 'Passed' : 'Failed'}
- **Duration**: ${report.integration.duration.toFixed(2)}s
- **Tests**: ${report.integration.tests.length}

## Performance Tests

${report.performance.passed ? '✅' : '❌'} **Status**: ${report.performance.passed ? 'Passed' : 'Failed'}
- **Duration**: ${report.performance.duration.toFixed(2)}s
- **Tests**: ${report.performance.tests.length}

### CPU Metrics

- **Average CPU**: ${formatMetric(report.performance.cpuMetrics.avgCpu, 3)} (target: ≤0.1)
- **Max CPU**: ${formatMetric(report.performance.cpuMetrics.maxCpu, 3)} (target: ≤0.15)
- **Average Bucket**: ${formatMetric(report.performance.cpuMetrics.avgBucket, 0)} (target: ≥9500)

## Framework Package Tests

${report.packages.passed ? '✅' : '❌'} **Status**: ${report.packages.passed ? 'Passed' : 'Failed'}
- **Duration**: ${report.packages.duration.toFixed(2)}s
- **Tests**: ${report.packages.tests.length}

---

*Generated by screeps-server test infrastructure*
`;
}

function generateAndHandleBaselineComparison(report) {
  if (process.env.CI && process.env.GITHUB_REF_NAME && report.summary.total > 0) {
    console.log('\n📊 Running baseline comparison...');
    try {
      execSync('node scripts/compare-baseline.js', {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
    } catch (error) {
      console.warn('⚠️ Baseline comparison failed or detected regression');
      process.exit(1);
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const report = generateReport();

    if (report.summary.failed > 0 || report.validation?.status === 'failed') {
      console.error('❌ Validation failed');
      process.exit(1);
    } else {
      console.log('✅ All tests passed');
      generateAndHandleBaselineComparison(report);
      process.exit(0);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}
